/**
 * One agent per role. An agent = persona + focus + starter questions; its TOOLS and KNOWLEDGE are not listed here -
 * they are derived from what the role is permitted to do (permissions in the database) and which documents list the
 * role in their audience, so changing a role in the admin screens changes the agent with it.
 *
 * Several roles can be held at once (e.g. HOD + lecturer); the agent of the highest-priority role speaks, and the
 * tools / knowledge of all the user's roles are available.
 */
const { ROLE_LABELS, normalizeRole } = require('../../utils/roles');

const PRIORITY = ['superadmin', 'admin', 'dean', 'faculty_admin', 'hod', 'examination', 'sar', 'fma', 'dept_ma', 'lecturer', 'demonstrator', 'student'];

const AGENTS = {
  student: {
    name: 'SEUConnect Student Assistant',
    focus: "the student's own academics: profile, registrations, attendance and ESA eligibility, results and GPA, forms (ECA, ESA, examination form, medical) and how to submit them, deadlines and faculty regulations",
    starters: ['What is my attendance and am I eligible for ESA?', 'What is my GPA?', 'How do I submit a medical form?', 'What is the status of my requests?'],
  },
  lecturer: {
    name: 'SEUConnect Lecturer Assistant',
    focus: 'the lecturer\'s assigned courses, student requests waiting for the lecturer (ECA/ESA/examination forms), exam schedules and the faculty regulations relevant to teaching and assessment',
    starters: ['Which courses am I teaching?', 'What is waiting for my approval?', 'When are my exams scheduled?', 'What is the attendance rule for ESA?'],
  },
  demonstrator: {
    name: 'SEUConnect Demonstrator Assistant',
    focus: 'the practical components the demonstrator is assigned to, attendance marking rules and relevant regulations',
    starters: ['Which practicals am I assigned to?', 'How is practical attendance counted?', 'Do I have notifications?'],
  },
  hod: {
    name: 'SEUConnect Head of Department Assistant',
    focus: 'the department: students, course offerings, requests waiting for the HOD, department lists from the Examination Branch, and academic regulations',
    starters: ['What is waiting for my approval?', 'How many students are in my department?', 'Summarise requests in my department', 'What are the repeat examination rules?'],
  },
  dean: {
    name: 'SEUConnect Dean Assistant',
    focus: 'faculty-wide oversight: students, requests and escalations, statistics, and regulations',
    starters: ['Give me a summary of faculty requests', 'What is waiting for me?', 'How many students are in the faculty?'],
  },
  faculty_admin: {
    name: 'SEUConnect Faculty Administration Assistant',
    focus: 'faculty administration: students, courses and offerings, requests, and regulations',
    starters: ['How many students are in the faculty?', 'Which course offerings are open?', 'Summarise pending requests'],
  },
  sar: {
    name: 'SEUConnect Senior Assistant Registrar Assistant',
    focus: 'the SAR desk: examination-form and ECA/ESA intake, verification and forwarding, Dean Office admission and Senate copy tracking',
    starters: ['What is waiting for me?', 'Summarise requests by status', 'How does the Senate copy tracking work?'],
  },
  examination: {
    name: 'SEUConnect Examination Branch Assistant',
    focus: 'the Examination Branch: ECA/ESA requests, department-wise lists sent to HODs, exam schedules, result processing and regulations',
    starters: ['What is waiting for me?', 'Show exam schedules', 'How do department lists reach the HOD?'],
  },
  dept_ma: {
    name: 'SEUConnect Department Management Assistant',
    focus: 'the department office: subject medical submissions, department students and offerings',
    starters: ['What medicals are waiting for me?', 'How many students are in my department?', 'How do subject medicals work?'],
  },
  fma: {
    name: 'SEUConnect Faculty Management Assistant',
    focus: 'the faculty office: examination medical submissions and forwarding to the SAR',
    starters: ['What medicals are waiting for me?', 'How do examination medicals flow?', 'Summarise requests'],
  },
  admin: {
    name: 'SEUConnect Administrator Assistant',
    focus: 'system administration: users, roles, requests overview and the knowledge base',
    starters: ['Summarise requests', 'How many students are registered?', 'What can each role do?'],
  },
  superadmin: {
    name: 'SEUConnect Administrator Assistant',
    focus: 'system administration: users, roles, requests overview and the knowledge base',
    starters: ['Summarise requests', 'How many students are registered?'],
  },
};

const rolesOf = (access) => [...access.roles].map(normalizeRole).filter(Boolean);

/** The agent that speaks for this user (highest-priority role); `roles` are all their roles, used for knowledge filtering. */
const resolveAgent = (access) => {
  const roles = rolesOf(access);
  const key = PRIORITY.find((r) => roles.includes(r)) || roles[0] || 'student';
  const def = AGENTS[key] || AGENTS.student;
  return { key, roles, roleLabel: ROLE_LABELS[key] || key, ...def };
};

module.exports = { AGENTS, PRIORITY, resolveAgent };
