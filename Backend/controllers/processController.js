const store = require('../store');
const engine = require('../workflows/engine');
const { getWorkflow, LEGACY_TYPES, WORKFLOW_TYPES } = require('../workflows/definitions');
const { dispatch } = require('./notificationController');
const { normalizeRole, deptCode, sameDepartment } = require('../utils/roles');

const DEFAULT_AVAILABILITY = {
  eca: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-20T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
  esa: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-25T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
  examForm: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-30T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
};

const getAvailability = async () => ({ ...DEFAULT_AVAILABILITY, ...(await store.settings.get('formAvailability', {})) });
exports.getAvailability = getAvailability;

// Translate engine errors into HTTP responses; anything else is a 500.
const fail = (res, error, fallback) => {
  if (error instanceof engine.WorkflowError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  if (error && error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
};
exports.fail = fail;

// Load a process the current user is allowed to see, or answer 404.
const loadVisible = async (req, res, opts) => {
  const process = await store.processes.find(req.params.id, opts);
  if (!process || !engine.canView(req.user, process)) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return null;
  }
  return process;
};
exports.loadVisible = loadVisible;

const respond = (res, process, user, message, status = 200) =>
  res.status(status).json({ success: true, message, data: engine.toClient(process, user) });
exports.respond = respond;

const resolveLecturer = async (email, department) => {
  if (!email) return null;
  const lecturer = await store.users.findByEmail(email);
  if (!lecturer || normalizeRole(lecturer.role) !== 'lecturer') {
    throw new engine.WorkflowError(400, 'The selected lecturer was not found.');
  }
  if (department && !sameDepartment(lecturer.department, department)) {
    throw new engine.WorkflowError(400, 'The selected lecturer belongs to a different department.');
  }
  return lecturer;
};

/* ---------------------------------- reads ---------------------------------- */
/**
 * GET /api/processes?type=&status=&scope=action|all&q=
 * Returns only the applications the signed-in user may see.
 */
exports.getAllProcesses = async (req, res) => {
  try {
    const { type, status, scope, q } = req.query;
    const all = await store.processes.all();
    let list = all.filter((p) => engine.canView(req.user, p));
    if (type && type !== 'all') list = list.filter((p) => p.type === type);
    if (status && status !== 'all') list = list.filter((p) => String(p.status).toLowerCase() === String(status).toLowerCase());
    if (scope === 'action') list = list.filter((p) => !engine.actBlocker(req.user, p));
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter((p) =>
        [p.trackingNumber, p.title, p.student?.name, p.student?.regNo].some((v) => String(v || '').toLowerCase().includes(needle))
      );
    }
    const data = list.map((p) => engine.toClient(p, req.user));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    fail(res, error, 'Server error while fetching applications');
  }
};

exports.getProcessById = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (process) respond(res, process, req.user);
  } catch (error) {
    fail(res, error, 'Error retrieving application');
  }
};

// GET /api/processes/:id/receipt - streams the uploaded voucher / receipt.
exports.getReceipt = async (req, res) => {
  try {
    const process = await loadVisible(req, res, { withReceipt: true });
    if (!process) return;
    const file = process.receiptFile || {};
    const match = /^data:([^;]+);base64,(.*)$/s.exec(file.dataUrl || '');
    if (!match) return res.status(404).json({ success: false, message: 'No receipt was uploaded for this application.' });
    const safeName = String(file.name || 'receipt').replace(/[^\w.\-]+/g, '_');
    res.setHeader('Content-Type', match[1]);
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.send(Buffer.from(match[2], 'base64'));
  } catch (error) {
    fail(res, error, 'Error retrieving receipt');
  }
};

/* --------------------------------- creation --------------------------------- */
const legacyStages = (student, now) => [
  {
    stageKey: 'submission',
    label: 'Student Application Submission',
    role: 'student',
    status: 'COMPLETED',
    actionTakenBy: `${student.name} (${student.regNo || 'Student'})`,
    actionTakenRole: 'Student',
    actionDate: now,
    remarks: 'Application submitted with supporting documents.',
    digitalStamp: `SEU-STU-SUBMIT#${Math.floor(1000 + Math.random() * 9000)}`,
  },
  { stageKey: 'lecturer_verification', label: 'Course Lecturer Verification & Recommendation', role: 'lecturer', status: 'CURRENT' },
  { stageKey: 'medical_verification', label: 'Medical Officer / Records Endorsement', role: 'examination', status: 'PENDING' },
  { stageKey: 'hod_approval', label: 'Head of Department (HOD) Approval', role: 'hod', status: 'PENDING' },
  { stageKey: 'dean_endorsement', label: 'Faculty Dean Executive Endorsement', role: 'dean', status: 'PENDING' },
];

const createLegacy = async (req, res, student) => {
  const { type, title, details = {}, priority = 'Standard' } = req.body;
  const now = new Date();
  const prefix = type === 'medical_excuse' ? 'MED' : type === 'repeat_exam' ? 'REP' : 'REQ';
  const process = await store.processes.create({
    trackingPrefix: prefix,
    type,
    title: title || `Request (${details.absenceDate || now.toISOString().split('T')[0]})`,
    status: 'Pending Lecturer',
    priority,
    student,
    details: {
      ...details,
      courseCodes: Array.isArray(details.courseCodes) ? details.courseCodes : [],
    },
    currentStageIndex: 1,
    currentAssignedRole: 'lecturer',
    stages: legacyStages(student, now),
    auditLog: [
      {
        action: 'SUBMITTED',
        actorName: student.name,
        actorRole: `Student (${student.regNo || 'STU'})`,
        actorEmail: student.email,
        timestamp: now,
        stage: 'Student Application Submission',
        comment: 'Application submitted.',
      },
    ],
  });
  await dispatch([engine.stageEntryNotice(process, process.stages[1], { name: student.name, roleLabel: 'Student' })]);
  return respond(res, process, req.user, `Request ${process.trackingNumber} submitted and routed to the Lecturer.`, 201);
};

/**
 * POST /api/processes - student submits an application.
 * The student identity always comes from the signed-in account, never from the request body.
 */
exports.createProcess = async (req, res) => {
  try {
    const student = await store.users.findByEmail(req.user.email);
    if (!student) return res.status(404).json({ success: false, message: 'Student account not found.' });
    const studentInfo = {
      name: student.name,
      regNo: student.regNo || '',
      email: student.email,
      department: student.department,
      faculty: student.faculty,
      programme: student.programme,
      semester: student.semester,
    };

    const type = req.body?.type;
    if (LEGACY_TYPES.includes(type)) return createLegacy(req, res, studentInfo);

    const wf = getWorkflow(type);
    if (!wf) {
      return res.status(400).json({ success: false, message: `Unknown application type. Expected one of: ${WORKFLOW_TYPES.join(', ')}.` });
    }

    if (wf.availabilityKey) {
      const portal = (await getAvailability())[wf.availabilityKey];
      if (portal && !portal.isOpen) {
        return res.status(409).json({ success: false, message: `The ${wf.label} portal is currently closed by the SAR.` });
      }
      if (portal?.deadline && Date.now() > Date.parse(portal.deadline)) {
        return res.status(409).json({ success: false, message: `The ${wf.label} deadline (${new Date(portal.deadline).toDateString()}) has passed.` });
      }
    }

    // One active application per type per student and semester.
    const semester = req.body.semester || student.semester || '';
    const duplicate = (await store.processes.all()).find(
      (p) =>
        p.type === type &&
        String(p.student?.email).toLowerCase() === student.email &&
        (p.formSemester || '') === semester &&
        !['Approved', 'Declined'].includes(p.status)
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `You already have an active ${wf.label} (${duplicate.trackingNumber}) for ${semester || 'this semester'}. Track or correct that application instead.`,
      });
    }

    const lecturer = await resolveLecturer(req.body.assignedLecturerEmail, student.department);
    const { data, events } = engine.buildApplication({ wf, student: studentInfo, payload: req.body, lecturer });
    const process = await store.processes.create(data);
    await dispatch(engine.bindTracking(events, process));
    return respond(res, process, req.user, `${wf.label} ${process.trackingNumber} submitted and routed to ${wf.submitTo}.`, 201);
  } catch (error) {
    fail(res, error, 'Failed to submit the application');
  }
};

/** PUT /api/processes/:id/resubmit - student corrects a returned application. */
exports.resubmitProcess = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const student = await store.users.findByEmail(req.user.email);
    const lecturer = await resolveLecturer(req.body.assignedLecturerEmail, student?.department);
    const { events } = engine.resubmit({ process, student: req.user, payload: req.body, lecturer });
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, `Application ${process.trackingNumber} resubmitted.`);
  } catch (error) {
    fail(res, error, 'Failed to resubmit the application');
  }
};

/* ------------------------------ stage actions ------------------------------ */
exports.approveStage = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const extras = {};
    if (req.body.assignedLecturerEmail) {
      extras.assignedLecturer = await resolveLecturer(req.body.assignedLecturerEmail, process.student?.department);
    }
    const { events } = engine.approve(process, req.user, { remarks: req.body.remarks, extras });
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, `Approved. Application is now: ${process.status}.`);
  } catch (error) {
    fail(res, error, 'Server error while approving');
  }
};

exports.declineProcess = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const { events } = engine.decline(process, req.user, req.body.reason);
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, `Application ${process.trackingNumber} declined.`);
  } catch (error) {
    fail(res, error, 'Server error while declining');
  }
};

exports.returnProcess = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const { events } = engine.returnForCorrection(process, req.user, req.body.reason);
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, `Application ${process.trackingNumber} returned to the student for correction.`);
  } catch (error) {
    fail(res, error, 'Server error while returning');
  }
};

exports.addComment = async (req, res) => {
  try {
    const comment = String(req.body.comment || '').trim();
    if (!comment) return res.status(400).json({ success: false, message: 'Comment content is required.' });
    const process = await loadVisible(req, res);
    if (!process) return;
    const actor = engine.actorOf(req.user);
    process.auditLog.push({
      action: 'COMMENTED',
      actorName: actor.name,
      actorRole: actor.roleLabel,
      actorEmail: actor.email,
      timestamp: new Date(),
      stage: 'General Discussion',
      comment,
    });
    await store.processes.save(process);
    respond(res, process, req.user, 'Comment added to the audit trail.');
  } catch (error) {
    fail(res, error, 'Error adding comment');
  }
};

/* ------------------------ Examination Branch: department lists ------------------------ */
/**
 * POST /api/processes/department-lists/dispatch  { department, formType, ids?, remarks? }
 * Examination Branch approves the ECA or ESA applications waiting at its stage for one
 * department and sends them to that department / HOD as a single department-wise list.
 */
exports.dispatchDepartmentList = async (req, res) => {
  try {
    const { department, formType, ids, remarks } = req.body || {};
    if (!['eca_application', 'esa_application'].includes(formType)) {
      return res.status(400).json({ success: false, message: 'formType must be eca_application or esa_application.' });
    }
    const code = deptCode(department);
    if (code === 'FACULTY') return res.status(400).json({ success: false, message: 'Select a department (ICT or BST).' });

    const wanted = Array.isArray(ids) && ids.length ? new Set(ids.map(String)) : null;
    const candidates = (await store.processes.all()).filter(
      (p) =>
        p.type === formType &&
        deptCode(p.student?.department) === code &&
        p.stages[p.currentStageIndex]?.stageKey === 'exam_branch_verification' &&
        !engine.actBlocker(req.user, p) &&
        (!wanted || wanted.has(String(p._id)) || wanted.has(p.trackingNumber))
    );
    if (!candidates.length) {
      return res.status(404).json({ success: false, message: 'No verified applications are waiting for this department list.' });
    }

    const wf = getWorkflow(formType);
    const listRef = `DL-${wf.code}-${code}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const events = [];
    for (const p of candidates) {
      const result = engine.approve(p, req.user, { remarks: remarks || `Included in department-wise list ${listRef}.`, extras: { listRef, suppressListNotice: true } });
      await store.processes.save(p);
      events.push(...result.events);
    }
    const sample = candidates[0];
    events.push(
      engine.notice(sample, 'hod', {
        type: 'EXAMINATION_LIST',
        priority: 'high',
        title: `Department ${wf.code} list received: ${listRef}`,
        message: `The Examination Branch sent the ${code} department-wise ${wf.code} list ${listRef} with ${candidates.length} application(s): ${candidates.map((p) => p.trackingNumber).join(', ')}.`,
        trackingNumber: '',
        relatedRequestId: listRef,
      })
    );
    await dispatch(events);
    res.json({
      success: true,
      message: `Department-wise ${wf.code} list ${listRef} sent to the ${code} HOD with ${candidates.length} application(s).`,
      listRef,
      count: candidates.length,
      data: candidates.map((p) => engine.toClient(p, req.user)),
    });
  } catch (error) {
    fail(res, error, 'Server error sending the department list');
  }
};

/** GET /api/processes/department-lists - lists already sent, grouped by reference. */
exports.getDepartmentLists = async (req, res) => {
  try {
    const visible = (await store.processes.all()).filter((p) => engine.canView(req.user, p) && p.departmentList?.forwardedAt);
    const groups = {};
    for (const p of visible) {
      const ref = p.departmentList.listRef || `${p.type}-${deptCode(p.student?.department)}`;
      if (!groups[ref]) {
        groups[ref] = {
          listRef: ref,
          type: p.type,
          department: p.departmentList.department || p.student?.department,
          departmentCode: deptCode(p.student?.department),
          sentBy: p.departmentList.sentBy,
          forwardedAt: p.departmentList.forwardedAt,
          academicYear: p.departmentList.academicYear,
          applications: [],
        };
      }
      groups[ref].applications.push({
        trackingNumber: p.trackingNumber,
        student: p.student,
        subjects: p.details?.courseCodes || [],
        status: p.status,
        assignedLecturer: p.assignedLecturer,
      });
    }
    const data = Object.values(groups).sort((a, b) => new Date(b.forwardedAt) - new Date(a.forwardedAt));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    fail(res, error, 'Error retrieving department lists');
  }
};

/* ----------------------------- form availability ----------------------------- */
exports.getFormAvailability = async (req, res) => {
  res.json({ success: true, data: await getAvailability() });
};

exports.toggleFormAvailability = async (req, res) => {
  try {
    const { formType, isOpen, deadline, semester, academicYear } = req.body || {};
    const current = await getAvailability();
    if (!current[formType]) return res.status(400).json({ success: false, message: `Invalid form type: ${formType}` });
    if (deadline && Number.isNaN(Date.parse(deadline))) return res.status(400).json({ success: false, message: 'Invalid deadline date.' });

    const entry = { ...current[formType] };
    entry.isOpen = isOpen !== undefined ? Boolean(isOpen) : !entry.isOpen;
    if (deadline) entry.deadline = deadline;
    if (semester) entry.semester = semester;
    if (academicYear) entry.academicYear = academicYear;
    entry.updatedAt = new Date();
    entry.updatedBy = `${req.user.name} (SAR)`;
    await store.settings.set('formAvailability', { ...current, [formType]: entry });

    const label = { eca: 'ECA', esa: 'ESA', examForm: 'Examination Form' }[formType];
    await dispatch([
      {
        recipientRole: 'student',
        recipientDepartment: 'ALL',
        type: 'PORTAL_UPDATE',
        title: `${label} portal ${entry.isOpen ? 'opened' : 'closed'}`,
        message: `The SAR ${entry.isOpen ? 'opened' : 'closed'} the ${label} application portal${entry.deadline ? ` (deadline ${new Date(entry.deadline).toDateString()})` : ''}.`,
        targetTab: 'forms_exam',
      },
    ]);
    res.json({ success: true, message: `${label} portal is now ${entry.isOpen ? 'OPEN' : 'CLOSED'}.`, data: entry });
  } catch (error) {
    fail(res, error, 'Error updating form availability');
  }
};
