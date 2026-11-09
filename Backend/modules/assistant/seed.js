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
    seedKey: 'reg-officers', title: 'Key officers and administrative leadership of the Faculty of Technology', category: 'regulations', status: 'active', source: 'Faculty Handbook 2023/2024 - Faculty of Technology, SEUSL', audience: [],
    content: 'Leadership and administrative officers of the Faculty of Technology, South Eastern University of Sri Lanka (SEUSL):\n\n- Dean of the Faculty: Dr. U.L. Abdul Majeed (BSc Food Sc and Tech. (Hons) (SUSL), MSc (USJP), PhD (USJP), Senior Lecturer, ulmajeed@seu.ac.lk)\n- Head of the Department of Information and Communication Technology (ICT): Dr. S. Sabraz Nawaz (Senior Lecturer Mr. R.K.A. Rifai Kariapper, BSc (Hons) Special in Computer Science (SEUSL), MSc (PGIS-UoP), MPhil (SJP), Senior Lecturer, rk@seu.ac.lk)\n- Head of the Department of Bio Systems Technology (BST): Dr. U.L. Abdul Majeed\n- Senior Assistant Registrar (SAR): Mr. K.L.M. Riyas\n- Faculty Location: Faculty of Technology Complex, South Eastern University of Sri Lanka, Oluvil.',
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
    seedKey: 'curriculum-y1s1', title: 'Faculty Handbook Table 3.9.3: First Year Semester 1 Curriculum and Subjects', category: 'curriculum', status: 'active', source: 'Faculty Handbook 2022/2023 - Faculty of Technology, SEUSL (Page 79)', audience: [],
    content: `First Year - Semester 1 (Year 1 Semester 1) Curriculum & Subjects for BICT (Hons), Faculty of Technology, South Eastern University of Sri Lanka:
Total Academic Credits: 17 Credits (15 GPA + 2 NGPA)

Subjects list:
1. CIS11011 - Essentials of ICT and PC Applications | 1 Credit | Theory (Compulsory) | Lecture: 1 hr/wk | CA 40% / ESA 60% | Lecturer: Dr. M. Kirushanth
2. SWT11012 - Fundamentals of Programming | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Mr. S. Rifky
3. CIS11022 - Database Design | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Mr. R.K. Rifas
4. CIS11032 - Logic Designing and Computer Organization | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Eng. S. Thasneem
5. CMS11012 - Mathematics for ICT | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Dr. S. Ketheesan
6. CIS11042 - Practical Essentials of ICT and PC Applications | 2 Credits | Practical (Compulsory) | Practical: 4 hrs/wk | CA 50% / ESA 50% | Lecturer: Dr. M. Kirushanth
7. SWT11022 - Practical Fundamentals of Programming | 2 Credits | Practical (Compulsory) | Practical: 4 hrs/wk | CA 50% / ESA 50% | Lecturer: Mr. S. Rifky
8. CIS11051 - Practical Database Design | 1 Credit | Practical (Compulsory) | Practical: 2 hrs/wk | CA 50% / ESA 50% | Lecturer: Mr. R.K. Rifas
9. CMS11022 - English I | 2 Credits | Theory (Auxiliary) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Faculty English Staff
10. CMS11031 - Tamil / Sinhala Language | 1 Credit | Practical (Auxiliary) | Practical: 2 hrs/wk | CA 100% | Lecturer: Faculty Staff`,
  },
  {
    seedKey: 'curriculum-y1s2', title: 'Faculty Handbook Table 3.9.3: First Year Semester 2 Curriculum and Subjects', category: 'curriculum', status: 'active', source: 'Faculty Handbook 2022/2023 - Faculty of Technology, SEUSL (Page 80)', audience: [],
    content: `First Year - Semester 2 (Year 1 Semester 2 / 1st Year 2nd Semester) Curriculum & Subjects for BICT (Hons), Faculty of Technology, South Eastern University of Sri Lanka:
Total Academic Credits: 18 Credits (16 GPA + 2 NGPA)

Subjects list:
1. SWT12012 - Object Oriented Programming | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Mr. S. Rifky
2. SWT12022 - Web systems and Technologies | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Dr. M. Kirushanth
3. NST12012 - Computer Networks | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Eng. K. Thanushan
4. MGT12012 - Multimedia and Graphic Design | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Ms. R. Farhana
5. CIS12012 - Social Computing | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Dr. A. N. Ahmed
6. CMS12012 - Statistics | 2 Credits | Theory (Compulsory) | Lecture: 2 hrs/wk | CA 40% / ESA 60% | Lecturer: Dr. K. Mohamed
7. SWT12032 - Practical Object Oriented Programming | 2 Credits | Practical (Compulsory) | Practical: 4 hrs/wk | CA 50% / ESA 50% | Lecturer: Mr. S. Rifky
8. SWT12042 - Practical Web systems and Technologies | 2 Credits | Practical (Compulsory) | Practical: 4 hrs/wk | CA 50% / ESA 50% | Lecturer: Dr. M. Kirushanth
9. NST12022 - Practical Computer Networks | 2 Credits | Practical (Compulsory) | Practical: 4 hrs/wk | CA 50% / ESA 50% | Lecturer: Eng. K. Thanushan
10. CMS12021 - English II | 1 Credit | Theory (Auxiliary) | Lecture: 1 hr/wk | CA 40% / ESA 60% | Lecturer: Faculty English Staff
11. CMS12031 - Social Harmony | 1 Credit | Practical (Auxiliary) | Practical: 2 hrs/wk | CA 100% | Lecturer: Faculty Staff`,
  },
  {
    seedKey: 'curriculum-y2s1', title: 'Faculty Handbook Table 3.9.4: Second Year Semester 1 Curriculum and Subjects', category: 'curriculum', status: 'active', source: 'Faculty Handbook 2022/2023 - Faculty of Technology, SEUSL (Page 81)', audience: [],
    content: `Second Year - Semester 1 (Year 2 Semester 1 / 2nd Year 1st Semester) Curriculum & Subjects for BICT (Hons), Faculty of Technology, South Eastern University of Sri Lanka:
Total Academic Credits: 19 Credits

Subjects list:
1. SWT21012 - Data Structures and Algorithms | 2 Credits | Theory (Compulsory) | Lecturer: Mr. S. Rifky
2. SWT21022 - Operating Systems | 2 Credits | Theory (Compulsory) | Lecturer: Dr. M. Kirushanth
3. SWT21032 - Advanced Database Management Systems | 2 Credits | Theory (Compulsory) | Lecturer: Mr. R.K. Rifas
4. CIS21012 - Human Computer Interaction | 2 Credits | Theory (Compulsory) | Lecturer: Dr. A. N. Ahmed
5. NST21012 - Information Assurance and Security | 2 Credits | Theory (Compulsory) | Lecturer: Eng. K. Thanushan
6. CMS21012 - Probability and Queueing Theory | 2 Credits | Theory (Compulsory) | Lecturer: Dr. S. Ketheesan
7. SWT21042 - Practical Data Structures and Algorithms | 2 Credits | Practical (Compulsory) | Lecturer: Mr. S. Rifky
8. SWT21052 - Practical Advanced Database Management Systems | 2 Credits | Practical (Compulsory) | Lecturer: Mr. R.K. Rifas
9. NST21022 - Practical Information Assurance and Security | 2 Credits | Practical (Compulsory) | Lecturer: Eng. K. Thanushan
10. CMS21022 - English III | 2 Credits | Theory (Auxiliary) | Lecturer: Faculty English Staff
11. CMS21031 - Soft Skills | 1 Credit | Practical (Auxiliary) | Lecturer: Faculty Staff`,
  },
  {
    seedKey: 'curriculum-y2s2', title: 'Faculty Handbook Table 3.9.4: Second Year Semester 2 Curriculum and Subjects', category: 'curriculum', status: 'active', source: 'Faculty Handbook 2022/2023 - Faculty of Technology, SEUSL (Page 82)', audience: [],
    content: `Second Year - Semester 2 (Year 2 Semester 2 / 2nd Year 2nd Semester) Curriculum & Subjects for BICT (Hons), Faculty of Technology, South Eastern University of Sri Lanka:
Total Academic Credits: 18 Credits

Subjects list:
1. SWT22012 - Software Engineering | 2 Credits | Theory (Compulsory) | Lecturer: Mr. S. Rifky
2. SWT22022 - Mobile Application Development | 2 Credits | Theory (Compulsory) | Lecturer: Dr. M. Kirushanth
3. CIS22012 - System Analysis and Design | 2 Credits | Theory (Compulsory) | Lecturer: Mr. R.K. Rifas
4. NST22012 - Advanced Computer Networks | 2 Credits | Theory (Compulsory) | Lecturer: Eng. K. Thanushan
5. MGT22012 - Principles of Management | 2 Credits | Theory (Compulsory) | Lecturer: Ms. R. Farhana
6. CMS22012 - Operational Research | 2 Credits | Theory (Compulsory) | Lecturer: Dr. K. Mohamed
7. SWT22032 - Practical Mobile Application Development | 2 Credits | Practical (Compulsory) | Lecturer: Dr. M. Kirushanth
8. SWT22042 - Practical Software Engineering | 2 Credits | Practical (Compulsory) | Lecturer: Mr. S. Rifky
9. NST22022 - Practical Advanced Computer Networks | 2 Credits | Practical (Compulsory) | Lecturer: Eng. K. Thanushan
10. CMS22021 - English IV | 1 Credit | Theory (Auxiliary) | Lecturer: Faculty English Staff
11. CMS22031 - Career Guidance | 1 Credit | Practical (Auxiliary) | Lecturer: Faculty Staff`,
  },
  {
    seedKey: 'curriculum-y3y4', title: 'Faculty Handbook Tables 3.9.5 & 9.7.6: Third and Fourth Year Curriculum and Specializations', category: 'curriculum', status: 'active', source: 'Faculty Handbook 2022/2023 - Faculty of Technology, SEUSL (Pages 85-88)', audience: [],
    content: `Third and Fourth Year Curriculum & Specializations for BICT (Hons), Faculty of Technology, South Eastern University of Sri Lanka:

Specialization Tracks (commencing Year 3):
1. Software Technology (SWT) Specialization:
- SWT31012 Advanced Software Architecture, SWT31022 Cloud Computing, SWT31032 Machine Learning, SWT32012 Enterprise Application Development, SWT32022 DevOps and CI/CD, SWT32032 Big Data Analytics.

2. Network Technology (NST) Specialization:
- NST31012 Network Security, NST31022 Wireless and Sensor Networks, NST31032 Distributed Systems, NST32012 Network Administration, NST32022 Internet of Things (IoT), NST32032 Cloud Infrastructure.

Fourth Year:
- Research Project (6 Credits across Semesters 1 & 2)
- Industrial Training / Internship (6 Credits)
- Advanced Elective Courses (Artificial Intelligence, Cybersecurity, Blockchain, High Performance Computing).`,
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
