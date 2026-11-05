/**
 * Demo applications for the five examination workflows. They are produced by running the real
 * engine (submit -> approve -> ...) so every seeded record has exactly the shape a live one has.
 * Tracking numbers are fixed so seeding is idempotent.
 */
const engine = require('./engine');
const { getWorkflow } = require('./definitions');

const ICT = 'Department of Information and Communication Technology';
const BST = 'Department of Biosystems Technology';

const staff = {
  lecturer: { name: 'Dr. S. Kirushanth', email: 'lecturer@gmail.com', role: 'lecturer', department: ICT, staffId: 'STAFF-ICT-104' },
  lecturerBst: { name: 'Dr. A. Nusky', email: 'lecturer.bst@gmail.com', role: 'lecturer', department: BST, staffId: 'STAFF-BST-021' },
  hod: { name: 'M.J Ahamed Sabani', email: 'hod@gmail.com', role: 'hod', department: ICT },
  hodBst: { name: 'Dr. M.G. Mohamed Thariq', email: 'hod.bst@gmail.com', role: 'hod', department: BST },
  sar: { name: 'Mr. K.L.M. Riyas', email: 'sar@gmail.com', role: 'sar', department: 'Faculty Administrative Division / Office of the SAR' },
  exam: { name: 'Dr. (Mrs.) R. Fathima', email: 'examination@gmail.com', role: 'examination', department: 'Faculty Examination Branch' },
  fma: { name: 'Mr. MMM. Kamil', email: 'fma@gmail.com', role: 'fma', department: 'Office of the Dean' },
};

const student = (name, regNo, email, department = ICT, semester = 'Semester 05') => ({
  name,
  regNo,
  email,
  department,
  faculty: 'Faculty of Technology',
  programme: department === ICT ? 'BICT (Hons)' : 'BBST (Hons)',
  semester,
});

const afnan = student('M.N.M. Afnan', '22ICT085', 'student@gmail.com');
const dilshan = student('K.M. Dilshan', '22BST012', 'student.bst@gmail.com', BST);

// 1x1 transparent PNG - stands in for an uploaded voucher scan.
const SAMPLE_RECEIPT = {
  name: 'peoples_bank_voucher.png',
  mime: 'image/png',
  dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
};

const payment = (voucherNo, amount) => ({ voucherNo, amount, date: '2026-10-28', bankBranch: "People's Bank, Addalaichenai" });

const subjects = (...pairs) => pairs.map(([code, title]) => ({ code, title }));

const medical = (reason, fromDate, toDate) => ({
  reason,
  fromDate,
  toDate,
  doctorName: 'Dr. M.H. Rizwan (UMO)',
  hospital: 'University Medical Centre, Oluvil',
  certificateNo: 'UMC-2026-0412',
  issueDate: toDate,
  documentName: 'medical_certificate.pdf',
});

/**
 * Builds one seeded application.
 * steps: list of actors (or { actor, extras }) that approve in order; `then` can post-process.
 */
const build = ({ tracking, type, who, payload, lecturer, steps = [], then, daysAgo = 3 }) => {
  const wf = getWorkflow(type);
  const { data } = engine.buildApplication({ wf, student: who, payload: { semester: who.semester, ...payload }, lecturer });
  delete data.trackingPrefix;
  const proc = { ...data, trackingNumber: tracking };
  const created = new Date(Date.now() - daysAgo * 86400000);
  proc.auditLog.forEach((a) => (a.timestamp = created));
  proc.stages[0].actionDate = created;

  steps.forEach((step, i) => {
    const actor = step.actor || step;
    engine.approve(proc, actor, { remarks: step.remarks, extras: step.extras || {} });
    const at = new Date(created.getTime() + (i + 1) * 6 * 3600000);
    proc.stages[i + 1].actionDate = at;
    proc.auditLog[proc.auditLog.length - 1].timestamp = at;
  });
  if (then) then(proc);
  proc.createdAt = created;
  proc.updatedAt = new Date(created.getTime() + steps.length * 6 * 3600000 + 1000);
  return proc;
};

const buildWorkflowSeeds = () => {
  const lec = staff.lecturer;
  const seeds = [
    build({
      tracking: 'ECA-2026-1045',
      type: 'eca_application',
      who: student('S. Ahamed', '22ICT045', 'ahamed.22ict045@seu.ac.lk'),
      payload: { subjects: subjects(['ICT2113', 'Web Application Development']), payment: payment('PIV-2026-08819', 250), receipt: SAMPLE_RECEIPT },
      daysAgo: 1,
    }),
    build({
      tracking: 'ESA-2026-2081',
      type: 'esa_application',
      who: student('R. Thanabal', '21ICT018', 'thanabal.21ict018@seu.ac.lk'),
      payload: { subjects: subjects(['ICT3123', 'Software Engineering'], ['ICT3133', 'Computer Networks']), payment: payment('PIV-2026-09104', 200), receipt: SAMPLE_RECEIPT },
      daysAgo: 2,
    }),
    build({
      tracking: 'ECA-2026-1052',
      type: 'eca_application',
      who: student('A.R. Fathima', '22ICT041', 'fathima.22ict041@seu.ac.lk'),
      payload: { subjects: subjects(['ICT2223', 'Database Systems']), payment: payment('PIV-2026-09221', 100), receipt: SAMPLE_RECEIPT },
      steps: [staff.sar],
      daysAgo: 2,
    }),
    build({
      tracking: 'ECA-2026-1050',
      type: 'eca_application',
      who: dilshan,
      payload: { subjects: subjects(['BST3113', 'Field Practicals in Biosystems']), payment: payment('PIV-2026-09230', 100), receipt: SAMPLE_RECEIPT },
      steps: [staff.sar],
      daysAgo: 3,
    }),
    build({
      tracking: 'ECA-2026-1060',
      type: 'eca_application',
      who: student('M. Rishad', '22ICT063', 'rishad.22ict063@seu.ac.lk'),
      payload: { subjects: subjects(['ICT2113', 'Web Application Development']), payment: payment('PIV-2026-08950', 100), receipt: SAMPLE_RECEIPT },
      steps: [staff.sar, { actor: staff.exam, extras: { assignedLecturer: lec } }, lec],
      daysAgo: 5,
    }),
    build({
      tracking: 'ESA-2026-2090',
      type: 'esa_application',
      who: { ...afnan, semester: 'Semester 04' },
      payload: { subjects: subjects(['ICT2143', 'Object Oriented Programming']), payment: payment('PIV-2026-08711', 100), receipt: SAMPLE_RECEIPT },
      steps: [staff.sar, { actor: staff.exam, extras: { assignedLecturer: lec } }],
      daysAgo: 6,
    }),
    build({
      tracking: 'ECA-2026-0988',
      type: 'eca_application',
      who: { ...afnan, semester: 'Semester 04' },
      payload: { subjects: subjects(['ICT2133', 'Data Structures']), payment: payment('PIV-2026-07702', 100), receipt: SAMPLE_RECEIPT },
      then: (p) =>
        engine.returnForCorrection(p, staff.sar, 'The voucher amount does not match the repeat fee (Rs. 100 per subject). Upload the correct voucher.', {
          prefix: '[Deficiencies: Payment amount] ',
        }),
      daysAgo: 7,
    }),
    build({
      tracking: 'EXAM-2026-3060',
      type: 'exam_form',
      who: student('F. Nusra', '22ICT052', 'nusra.22ict052@seu.ac.lk'),
      lecturer: lec,
      payload: { subjects: subjects(['ICT3113', 'Advanced Software Engineering'], ['ICT3143', 'Mobile Application Development']) },
      daysAgo: 1,
    }),
    build({
      tracking: 'EXAM-2026-3051',
      type: 'exam_form',
      who: student('M.H.M. Haris', '22ICT030', 'haris.22ict030@seu.ac.lk'),
      lecturer: lec,
      payload: { subjects: subjects(['ICT3113', 'Advanced Software Engineering']) },
      steps: [lec, staff.hod],
      daysAgo: 3,
    }),
    build({
      tracking: 'EXAM-2026-3020',
      type: 'exam_form',
      who: student('S. Kajan', '22ICT019', 'kajan.22ict019@seu.ac.lk'),
      lecturer: lec,
      payload: { subjects: subjects(['ICT3123', 'Software Engineering']) },
      steps: [lec, staff.hod, staff.sar],
      daysAgo: 4,
    }),
    build({
      tracking: 'EXAM-2026-3010',
      type: 'exam_form',
      who: student('N. Rifas', '22ICT077', 'rifas.22ict077@seu.ac.lk'),
      lecturer: lec,
      payload: { subjects: subjects(['ICT3133', 'Computer Networks']) },
      steps: [lec, staff.hod, staff.sar, staff.exam],
      then: (p) => engine.issueAdmission(p, staff.sar, { admissionNo: 'ADM-FOT-2026-3010' }),
      daysAgo: 6,
    }),
    build({
      tracking: 'EXAM-2026-3001',
      type: 'exam_form',
      who: { ...afnan, semester: 'Semester 04' },
      lecturer: lec,
      payload: { subjects: subjects(['ICT2113', 'Web Application Development'], ['ICT2223', 'Database Systems']) },
      steps: [lec, staff.hod, staff.sar, staff.exam],
      then: (p) => {
        engine.issueAdmission(p, staff.sar, { admissionNo: 'ADM-FOT-2026-3001' });
        engine.trackSenateCopy(p, staff.sar, { trackingNo: 'SENATE-FOT-2026-101' });
      },
      daysAgo: 12,
    }),
    build({
      tracking: 'MED-SUB-2026-0001',
      type: 'subject_medical',
      who: { ...afnan, semester: 'Semester 04' },
      payload: { subjects: subjects(['ICT2143', 'Object Oriented Programming']), medical: medical('Acute viral fever with clinical bed rest certified by the UMO.', '2026-10-20', '2026-10-23') },
      daysAgo: 2,
    }),
    build({
      tracking: 'MED-SUB-2026-0002',
      type: 'subject_medical',
      who: dilshan,
      payload: { subjects: subjects(['BST3122', 'Plant Biotechnology Lab']), medical: medical('Sprained ankle during field practicals; advised rest for 3 days.', '2026-10-24', '2026-10-26') },
      daysAgo: 1,
    }),
    build({
      tracking: 'MED-EX-2026-4095',
      type: 'exam_medical',
      who: student('T. Sharmila', '22ICT060', 'sharmila.22ict060@seu.ac.lk'),
      payload: { subjects: subjects(['ICT3123', 'Software Engineering']), medical: medical('Hospitalised with dengue fever during the end semester examination.', '2026-10-15', '2026-10-21') },
      daysAgo: 1,
    }),
    build({
      tracking: 'MED-EX-2026-4091',
      type: 'exam_medical',
      who: student('A. Nimsath', '22ICT033', 'nimsath.22ict033@seu.ac.lk'),
      payload: { subjects: subjects(['ICT3113', 'Advanced Software Engineering']), medical: medical('Admitted to Ampara General Hospital with acute gastritis on the exam day.', '2026-10-12', '2026-10-14') },
      steps: [staff.fma],
      daysAgo: 4,
    }),
  ];
  return seeds;
};

module.exports = { buildWorkflowSeeds, SAMPLE_RECEIPT };
