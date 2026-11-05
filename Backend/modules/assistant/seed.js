/**
 * Built-in knowledge-base documents. Add-only and idempotent (keyed by seedKey); administrators add or replace documents through
 * /api/v1/knowledge, and can retire any of these.
 *
 * Two kinds:
 *  - workflow guidance: taken from the SEUConnect workflow reference (the five form workflows) -> status "active"
 *  - regulations: carried over from the previous assistant prompt. They have NOT been checked against the Faculty
 *    Handbook (which has not been supplied), so they are stored as "needs_confirmation" and every answer built on
 *    them says so. Confirm each one, then re-save it with status "active".
 */
const rag = require('./rag');
const { KnowledgeDocument } = require('./model');
const logger = require('../../core/logger');

const STAFF = ['lecturer', 'demonstrator', 'hod', 'dean', 'faculty_admin', 'sar', 'examination', 'dept_ma', 'fma'];
const UNVERIFIED = 'Previous SEUConnect assistant text - to be verified against the Faculty Handbook';

const DOCS = [
  {
    seedKey: 'reg-attendance', title: 'Attendance requirement for ESA eligibility', category: 'regulations', status: 'needs_confirmation', source: UNVERIFIED, audience: [],
    content: 'A minimum of 80% attendance in lectures and 80% in practical sessions, counted separately, is required to be eligible for the End Semester Assessment (ESA). A student below 80% without an approved medical concession is not eligible for the ESA.',
  },
  {
    seedKey: 'reg-medical', title: 'Medical concession', category: 'regulations', status: 'needs_confirmation', source: UNVERIFIED, audience: [],
    content: 'Medical certificates must be submitted within 7 calendar days of the absence. A private medical certificate must be validated and endorsed by the Chief Medical Officer (CMO) at the University Health Centre, Oluvil. An approved medical restores ESA eligibility for the affected sessions.',
  },
  {
    seedKey: 'reg-repeat', title: 'Repeat examinations and fees', category: 'regulations', status: 'needs_confirmation', source: UNVERIFIED, audience: [],
    content: 'Repeat attempts for CA and ESA carry a fee of LKR 400 per course unit. The fee is paid at People\'s Bank, Addalaichenai Branch, account 228 1001 9000 1704, and the bank-stamped Pay-In-Voucher (PIV) must be attached to the application.\n\nThe maximum grade that can be obtained in a repeat attempt is C (grade point 2.00).',
  },
  {
    seedKey: 'reg-grading', title: 'Grade point average and degree classes', category: 'regulations', status: 'needs_confirmation', source: UNVERIFIED, audience: [],
    content: 'Classes by cumulative GPA: First Class Honours - CGPA 3.70 or above with no repeats. Second Class (Upper Division) - 3.30 to 3.69. Second Class (Lower Division) - 3.00 to 3.29. General pass - 2.00 to 2.99.',
  },
  {
    seedKey: 'reg-officers', title: 'Key officers of the Faculty of Technology', category: 'regulations', status: 'needs_confirmation', source: UNVERIFIED, audience: [],
    content: 'Dean: Prof. Rifai Kariapper. Head of the Department of ICT: Mr. M.J. Ahamed Sabani. Senior Assistant Registrar: Mr. K.L.M. Riyas.',
  },
  {
    seedKey: 'wf-overview', title: 'Examination form workflows - overview', category: 'workflow', status: 'active', source: 'SEUConnect workflow reference', audience: [],
    content: 'SEUConnect has five form workflows, each with a fixed route:\n\n1. ECA (repeat CA): Student -> SAR -> Examination Branch (sends the department-wise list to the HOD) -> Lecturer -> HOD.\n2. ESA (repeat ESA): the same route as ECA, but stored and reported separately from ECA.\n3. Examination Form: Student -> Lecturer -> HOD -> SAR -> Examination Branch. The SAR then handles two separately tracked outputs: Dean Office admission and the copy to Senate.\n4. Subject Medical: Student -> Department Management Assistant only.\n5. Examination Medical: Student -> Faculty Management Assistant -> SAR -> Examination Branch -> SAR (Senate copy tracking).',
  },
  {
    seedKey: 'wf-student', title: 'How a student submits and tracks a form', category: 'workflow', status: 'active', source: 'SEUConnect workflow reference', audience: ['student'],
    content: 'Only the student can submit a form. Open Faculty Forms or Medical Requests, complete the printable form and press Submit. You receive a tracking number and a notification at every step. The request shows who it is currently waiting for. If an officer returns it for correction, fix it and resubmit; if it is declined, the reason is shown. Submissions are accepted only while the examination portal for that form is open.',
  },
  {
    seedKey: 'wf-staff', title: 'How staff handle requests in SEUConnect', category: 'workflow', status: 'active', source: 'SEUConnect workflow reference', audience: STAFF,
    content: 'Requests reach you only at your step of the route. You can approve and forward, return for correction, or decline with a reason; every action is recorded with your name, role and time, and the student is notified. Staff cannot submit forms on behalf of students. Your pending items are listed on your dashboard and in the notification bell.',
  },
  {
    seedKey: 'wf-sar', title: 'SAR desk: verification, Dean Office and Senate copy', category: 'workflow', status: 'active', source: 'SEUConnect workflow reference', audience: ['sar', 'dean', 'faculty_admin', 'admin', 'superadmin'],
    content: 'The SAR verifies incoming ECA, ESA and examination-form requests and forwards them. For examination forms, after the Examination Branch step the SAR records two outputs separately: admission processing at the Dean Office (with the admission number) and the copy sent to Senate (with a tracking number). For examination medicals, the SAR also tracks the Senate copy after the Examination Branch.',
  },
  {
    seedKey: 'wf-examination', title: 'Examination Branch: department-wise lists', category: 'workflow', status: 'active', source: 'SEUConnect workflow reference', audience: ['examination', 'hod', 'lecturer', 'dean', 'admin', 'superadmin'],
    content: 'For ECA and ESA requests the Examination Branch groups the approved requests by department and sends the department-wise list to the Head of Department. The HOD then assigns the lecturer, who reviews and passes the request to the HOD for the final decision.',
  },
  {
    seedKey: 'assistant-scope', title: 'What the SEUConnect assistant can and cannot do', category: 'assistant', status: 'active', source: 'SEUConnect', audience: [],
    content: 'The assistant answers using your own account data and the knowledge documents meant for your role. It cannot show other people\'s records or information that belongs to a different role, and it does not submit, approve or change anything - use the forms and approval screens for that.',
  },
];

const seedKnowledge = async () => {
  let created = 0;
  for (const d of DOCS) {
    try {
      // add-only: never overwrite a document an administrator has edited, confirmed or retired
      if (await KnowledgeDocument.exists({ seedKey: d.seedKey })) continue;
      await rag.ingest(d);
      created += 1;
    } catch (err) {
      logger.error('Could not seed knowledge document', { seedKey: d.seedKey, error: err.message });
    }
  }
  return created;
};

module.exports = { seedKnowledge, DOCS };
