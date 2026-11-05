/**
 * Agent tools. A tool is the ONLY way the assistant touches data, and every tool:
 *   1. is offered to a role only when that role holds the tool's permission (see agents.js),
 *   2. runs the normal module service with a request re-scoped to that permission, so the same data-scope rules
 *      (own / assigned / department / faculty) that protect the REST API apply to the assistant too,
 *   3. returns plain, size-capped JSON (never raw documents, passwords or tokens).
 * Nothing here trusts the model: the registry is checked again at call time (service.js), so a model that asks for
 * a tool outside its role gets an error, not data.
 */
const store = require('../../store');
const engine = require('../../workflows/engine');
const { WORKFLOWS } = require('../../workflows/definitions');
const students = require('../students/service');
const attendance = require('../attendance/service');
const registration = require('../registration/service');
const courses = require('../courses/service');
const esa = require('../esa/service');
const results = require('../results/service');

const MAX_ROWS = 15;
const NO_PARAMS = { type: 'object', properties: {} };

/** Same request, but with req.access.scope / permission taken from `permission` (what the called service reads). */
const scoped = (req, permission) => ({ ...req, access: { ...req.access, scope: req.access.permissions.get(permission), permission } });

const needStudent = (req) => {
  if (!req.access.studentId) {
    const err = new Error('This tool is only available to a student account.');
    err.code = 'NOT_A_STUDENT';
    throw err;
  }
  return req.access.studentId;
};

const iso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
const label = (p) => (WORKFLOWS[p.type] ? WORKFLOWS[p.type].longLabel : p.type);
const processRow = (p) => ({ tracking: p.trackingNumber, form: label(p), status: p.status, waitingFor: p.currentAssignedRole || null, updated: iso(p.updatedAt) });
const visibleProcesses = async (user) => (await store.processes.all()).filter((p) => engine.canView(user, p));

/**
 * name, description, parameters  -> shown to the LLM
 * permission                      -> role gate (key in core/rbac); minScope narrows who gets it
 * keywords                        -> intent hints for the rule-based fallback when no LLM is reachable
 * run(req, args)                  -> data;  format(data) -> markdown for the fallback
 */
const TOOLS = [
  {
    name: 'my_profile',
    description: "The signed-in student's own record: name, IDs, programme, department, batch, year, status.",
    parameters: NO_PARAMS,
    permission: 'students.read',
    studentOnly: true,
    keywords: ['my profile', 'my details', 'my record', 'who am i', 'my batch', 'my programme', 'my registration number', 'my index'],
    run: async (req) => {
      const s = await students.get(scoped(req, 'students.read'), needStudent(req));
      return { studentId: s.studentId, registrationNo: s.registrationNo, name: s.fullName, status: s.status, year: s.currentYear, semester: s.currentSemester, programme: s.programmeRef && (s.programmeRef.name || s.programmeRef.code), department: s.departmentRef && (s.departmentRef.name || s.departmentRef.code), batch: s.batchRef && (s.batchRef.label || s.batchRef.intakeYear) };
    },
    format: (d) => `**${d.name}**\n- Student ID: ${d.studentId}${d.registrationNo ? `\n- Registration No: ${d.registrationNo}` : ''}\n- Programme: ${d.programme || '—'}\n- Department: ${d.department || '—'}\n- Year ${d.year ?? '—'}, Semester ${d.semester ?? '—'}\n- Status: ${d.status}`,
  },
  {
    name: 'my_gpa',
    description: "The signed-in student's published GPA records (semester GPAs and cumulative GPA).",
    parameters: NO_PARAMS,
    permission: 'results.read',
    studentOnly: true,
    keywords: ['my gpa', 'my cgpa', 'my sgpa', 'cumulative gpa', 'my class', 'my honours', 'what is my gpa', 'my grade point'],
    run: async (req) => {
      const rows = await results.gpaOf(scoped(req, 'results.read'), needStudent(req));
      return rows.map((g) => ({ scope: g.scope, semester: g.semester && (g.semester.name || g.semester.number), gpa: g.gpa, credits: g.credits }));
    },
    format: (rows) => {
      if (!rows.length) return 'No published GPA is available for you yet. GPA appears once the examination branch publishes your results.';
      const cum = rows.find((r) => r.scope === 'cumulative');
      const sem = rows.filter((r) => r.scope === 'semester');
      return `${cum ? `**Cumulative GPA: ${Number(cum.gpa).toFixed(2)}** (${cum.credits} credits)\n` : ''}${sem.map((r) => `- ${r.semester}: SGPA ${Number(r.gpa).toFixed(2)}`).join('\n')}`.trim();
    },
  },
  {
    name: 'my_results',
    description: "The signed-in student's published course results grouped by semester (final mark, grade, grade point, pass/fail).",
    parameters: NO_PARAMS,
    permission: 'results.read',
    studentOnly: true,
    keywords: ['my result', 'my marks', 'my grades', 'my transcript', 'results', 'my grade'],
    run: async (req) => {
      const t = await results.transcript(scoped(req, 'results.read'), needStudent(req));
      return {
        cumulativeGpa: t.cumulative ? t.cumulative.gpa : null,
        semesters: t.semesters.map((s) => ({ semester: s.semester && (s.semester.name || s.semester.number), sgpa: s.sgpa, courses: s.courses.slice(0, MAX_ROWS).map((c) => ({ code: c.code, title: c.title, credits: c.credits, finalMark: c.finalMark, grade: c.grade, passed: c.passed })) })),
      };
    },
    format: (d) => (d.semesters.length ? d.semesters.map((s) => `**${s.semester}**${s.sgpa != null ? ` (SGPA ${Number(s.sgpa).toFixed(2)})` : ''}\n${s.courses.map((c) => `- ${c.code} ${c.title}: ${c.grade || '—'} (${c.finalMark ?? '—'}${c.passed ? '' : ', not passed'})`).join('\n')}`).join('\n\n') : 'No results have been published for you yet.'),
  },
  {
    name: 'my_attendance',
    description: "The signed-in student's attendance percentage per course component and whether they are eligible for the end-semester assessment.",
    parameters: NO_PARAMS,
    permission: 'attendance.read',
    studentOnly: true,
    keywords: ['my attendance', 'attendance', 'eligible for esa', 'debarred', 'my eligibility'],
    run: async (req) => attendance.summary(scoped(req, 'attendance.read'), { student: needStudent(req) }),
    format: (d) => {
      if (!d.offerings || !d.offerings.length) return 'No attendance has been recorded for you yet.';
      const pct = (b) => (b && b.total ? `${Number(b.percentage).toFixed(1)}%` : 'n/a');
      const verdict = { eligible: 'eligible for ESA', ineligible: 'NOT eligible for ESA', no_sessions: 'no sessions yet' };
      return d.offerings.map((o) => `- **${o.course.code} ${o.course.title}**: lectures ${pct(o.summary.theory)}, practicals ${pct(o.summary.practical)} - ${verdict[o.summary.eligibility] || o.summary.eligibility}`).join('\n');
    },
  },
  {
    name: 'my_registrations',
    description: "The signed-in student's course (subject) registrations with their status.",
    parameters: NO_PARAMS,
    permission: 'registrations.read',
    studentOnly: true,
    keywords: ['my registration', 'my subjects', 'my courses', 'registered', 'enrolled', 'my modules'],
    run: async (req) => {
      needStudent(req);
      const r = await registration.list(scoped(req, 'registrations.read'), { page: 1, limit: MAX_ROWS });
      return r.items.map((x) => ({ course: x.offering && x.offering.course && `${x.offering.course.code} ${x.offering.course.title}`, status: x.status, requested: iso(x.requestedAt) }));
    },
    format: (rows) => (rows.length ? rows.map((r) => `- ${r.course || 'Course'} — **${r.status}**`).join('\n') : 'You have no course registrations yet.'),
  },
  {
    name: 'my_requests',
    description: 'Examination-form and medical requests the signed-in user submitted or can see, with their current status and who they are waiting for.',
    parameters: NO_PARAMS,
    permission: 'notifications.read', // every role holds it; visibility itself is decided by the workflow engine
    keywords: ['my request', 'my form', 'my application', 'status of', 'track', 'tracking', 'submitted', 'my medical', 'my eca', 'my esa'],
    run: async (req) => (await visibleProcesses(req.user)).slice(0, MAX_ROWS).map(processRow),
    format: (rows) => (rows.length ? rows.map((r) => `- **${r.tracking}** · ${r.form} — ${r.status}${r.waitingFor ? ` (with ${r.waitingFor})` : ''}`).join('\n') : 'There are no requests to show.'),
  },
  {
    name: 'pending_actions',
    description: 'Requests that are waiting for the signed-in staff member to act on (approve, forward, return, decline).',
    parameters: NO_PARAMS,
    permission: 'notifications.read',
    staffOnly: true,
    keywords: ['pending', 'waiting for me', 'waiting for my', 'my approval', 'to approve', 'need my', 'my queue', 'inbox', 'action required', 'to do', 'what should i do', 'awaiting'],
    run: async (req) => (await visibleProcesses(req.user)).filter((p) => !engine.actBlocker(req.user, p)).slice(0, MAX_ROWS).map(processRow),
    format: (rows) => (rows.length ? `You have **${rows.length}** item(s) waiting:\n${rows.map((r) => `- **${r.tracking}** · ${r.form} — ${r.status}`).join('\n')}` : 'Nothing is waiting for your action right now.'),
  },
  {
    name: 'workflow_summary',
    description: 'Counts of the requests the signed-in staff member can see, by form type and status.',
    parameters: NO_PARAMS,
    permission: 'notifications.read',
    staffOnly: true,
    keywords: ['how many request', 'summary', 'statistics', 'overview', 'approved', 'declined', 'total request'],
    run: async (req) => {
      const rows = await visibleProcesses(req.user);
      const byType = {};
      for (const p of rows) {
        const t = (byType[label(p)] = byType[label(p)] || { total: 0 });
        t.total += 1;
        t[p.status] = (t[p.status] || 0) + 1;
      }
      return { total: rows.length, byType };
    },
    format: (d) => `**${d.total}** request(s) visible to you.\n${Object.entries(d.byType).map(([k, v]) => `- ${k}: ${v.total}`).join('\n')}`,
  },
  {
    name: 'my_notifications',
    description: "The signed-in user's most recent unread notifications.",
    parameters: NO_PARAMS,
    permission: 'notifications.read',
    keywords: ['notification', 'alerts', 'unread', "what's new", 'new messages'],
    run: async (req) =>
      (await store.notifications.forUser(req.user))
        .filter((n) => !store.notifications.isReadBy(n, req.user))
        .slice(0, 8)
        .map((n) => ({ title: n.title, message: n.message, when: iso(n.createdAt) })),
    format: (rows) => (rows.length ? rows.map((n) => `- **${n.title}** — ${n.message}`).join('\n') : 'You have no unread notifications.'),
  },
  {
    name: 'my_course_offerings',
    description: 'Course offerings the signed-in staff member may work with (assigned courses for lecturers/demonstrators; department or faculty offerings for managers).',
    parameters: NO_PARAMS,
    permission: 'offerings.read',
    staffOnly: true,
    keywords: ['my course', 'my module', 'teach', 'teaching', 'assigned', 'offerings', 'my subjects'],
    run: async (req) => {
      const r = await courses.listOfferings(scoped(req, 'offerings.read'), { page: 1, limit: MAX_ROWS });
      return r.items.map((o) => ({ course: o.course && `${o.course.code} ${o.course.title}`, status: o.status, semester: o.semester && (o.semester.name || o.semester.number) }));
    },
    format: (rows) => (rows.length ? rows.map((o) => `- ${o.course || 'Course'} — ${o.status}`).join('\n') : 'No course offerings are assigned to you.'),
  },
  {
    name: 'student_overview',
    description: 'How many students the signed-in staff member can see (their department / faculty / assigned courses) with a short sample.',
    parameters: NO_PARAMS,
    permission: 'students.read',
    staffOnly: true,
    keywords: ['how many students', 'number of students', 'student count', 'students in', 'all students', 'student list', 'list students'],
    run: async (req) => {
      const r = await students.list(scoped(req, 'students.read'), { page: 1, limit: 5 });
      return { total: r.meta.total, scope: req.access.permissions.get('students.read'), sample: r.items.map((s) => ({ studentId: s.studentId, name: s.fullName, year: s.currentYear, status: s.status })) };
    },
    format: (d) => `You can see **${d.total}** student(s) (${d.scope} scope).\n${d.sample.map((s) => `- ${s.studentId} · ${s.name} (Year ${s.year ?? '—'}, ${s.status})`).join('\n')}`,
  },
  {
    name: 'exam_schedules',
    description: 'End-semester assessment (ESA) schedules the signed-in staff member can see.',
    parameters: NO_PARAMS,
    permission: 'esa.read',
    staffOnly: true,
    keywords: ['esa schedule', 'exam schedule', 'timetable', 'exam date', 'when is the exam', 'invigilat'],
    run: async (req) => {
      const r = await esa.list(scoped(req, 'esa.read'), { page: 1, limit: 10 });
      return r.items.map((e) => ({ title: e.title, date: iso(e.date), time: `${e.startTime || ''}-${e.endTime || ''}`, venue: e.venue, status: e.status }));
    },
    format: (rows) => (rows.length ? rows.map((e) => `- ${e.title} — ${e.date} ${e.time} @ ${e.venue || 'TBA'} (${e.status})`).join('\n') : 'No exam schedules are available to you.'),
  },
];

const byName = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

/** Tools this caller may use. Student-only tools need a linked student record; staff-only tools are withheld from `own`-scope users. */
const allowedFor = (access) => {
  const isStudent = Boolean(access.studentId);
  return TOOLS.filter((t) => {
    if (!access.permissions.get(t.permission)) return false;
    if (t.studentOnly && !isStudent) return false;
    if (t.staffOnly && isStudent && !access.staffId) return false;
    // data tools must not run on a scope narrower than "own" would imply for staff (e.g. a lecturer with no assignment still gets an empty list from the service)
    return true;
  });
};

const execute = async (tool, req, args) => {
  const data = await tool.run(req, args || {});
  const text = JSON.stringify(data);
  return text.length > 7000 ? JSON.parse(JSON.stringify(data, (k, v) => (Array.isArray(v) ? v.slice(0, 8) : v))) : data;
};

module.exports = { TOOLS, byName, allowedFor, execute, scoped };
