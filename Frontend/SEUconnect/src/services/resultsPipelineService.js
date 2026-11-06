/**
 * resultsPipelineService.js
 * SEUConnect - Academic Results & Attendance Enterprise Pipeline Service
 * 
 * Orchestrates the full university academic workflow:
 * 1. Freshers / Year 1 Sem 1 GPA rules (no GPA until semester 1 results published)
 * 2. HOD Course Assignment -> Lecturer Teaching
 * 3. Lecturer Attendance Marking -> Real-time Student Attendance Display
 * 4. Multi-Role Results Pipeline:
 *    Lecturer -> DMA Compilation -> HOD Moderation -> Examination Officer -> Dean Approval -> HOD Publication -> Student Dashboard
 */

// Grading Scale according to SEUSL By-laws
export const GRADE_SCALE = [
  { min: 85, max: 100, grade: 'A+', gradePoint: 4.0 },
  { min: 80, max: 84.99, grade: 'A', gradePoint: 4.0 },
  { min: 75, max: 79.99, grade: 'A-', gradePoint: 3.7 },
  { min: 70, max: 74.99, grade: 'B+', gradePoint: 3.3 },
  { min: 65, max: 69.99, grade: 'B', gradePoint: 3.0 },
  { min: 60, max: 64.99, grade: 'B-', gradePoint: 2.7 },
  { min: 55, max: 59.99, grade: 'C+', gradePoint: 2.3 },
  { min: 50, max: 54.99, grade: 'C', gradePoint: 2.0 },
  { min: 45, max: 49.99, grade: 'C-', gradePoint: 1.7 },
  { min: 40, max: 44.99, grade: 'D+', gradePoint: 1.3 },
  { min: 35, max: 39.99, grade: 'D', gradePoint: 1.0 },
  { min: 0, max: 34.99, grade: 'E', gradePoint: 0.0 }
];

export function calculateGradeFromMarks(totalMarks) {
  const m = Number(totalMarks) || 0;
  for (const band of GRADE_SCALE) {
    if (m >= band.min) {
      return { grade: band.grade, gradePoint: band.gradePoint, passed: m >= 50 };
    }
  }
  return { grade: 'E', gradePoint: 0.0, passed: false };
}

export function calculateAcademicStanding(gpa) {
  const val = Number(gpa);
  if (isNaN(val) || val === null || val <= 0) return 'Enrolled (In Progress)';
  if (val >= 3.70) return 'First Class Standing';
  if (val >= 3.30) return 'Second Class (Upper Division)';
  if (val >= 3.00) return 'Second Class (Lower Division)';
  if (val >= 2.00) return 'General Pass Standing';
  return 'Academic Warning / Probation';
}

const STORAGE_KEYS = {
  PIPELINE_STATUS: 'seu_results_pipeline_status_v1',
  SUBJECT_MARKS: 'seu_subject_marks_store_v1',
  ATTENDANCE_SESSIONS: 'seu_attendance_sessions_store_v1'
};

// Default cohort of enrolled students in the batch
export const DEFAULT_COHORT = [
  { regNo: '22ICT091', name: 'Mushan M.M.B. (Afnan)', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT088', name: 'Weerasinghe W.M.S.R.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT089', name: 'Lihinikaduwa L.A.H.A.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT090', name: 'Nafeesh A.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT092', name: 'Dulanjani K.H.S.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT093', name: 'Thasneem A.F.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT094', name: 'Hirunika R.P.J.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' },
  { regNo: '22ICT095', name: 'Rukshana A.L.F.', department: 'BICT (Hons)', batch: '2022/2023', semester: 'Year 2 Semester 2' }
];

export const PIPELINE_STAGES = {
  LECTURER_DRAFT: 'LECTURER_DRAFT',
  SUBMITTED_TO_DMA: 'SUBMITTED_TO_DMA',
  SUBMITTED_TO_HOD: 'SUBMITTED_TO_HOD',
  SUBMITTED_TO_EXAM_OFFICER: 'SUBMITTED_TO_EXAM_OFFICER',
  FORWARDED_TO_DEAN: 'FORWARDED_TO_DEAN',
  DEAN_APPROVED: 'DEAN_APPROVED',
  PUBLISHED: 'PUBLISHED'
};

export const PIPELINE_LABELS = {
  LECTURER_DRAFT: 'Lecturer Marks Entry in Progress',
  SUBMITTED_TO_DMA: 'Submitted to DMA (Batch Compilation Pending)',
  SUBMITTED_TO_HOD: 'Submitted to HOD (Department Moderation Pending)',
  SUBMITTED_TO_EXAM_OFFICER: 'Submitted to Examination Officer (Verification Pending)',
  FORWARDED_TO_DEAN: 'Forwarded to Dean (Executive Seal Pending)',
  DEAN_APPROVED: 'Dean Approved & Sealed (Ready for HOD Publication)',
  PUBLISHED: 'Published to Student Portal'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('seu_pipeline_update', { detail: { key, val } }));
  } catch (_) {}
}

export const resultsPipelineService = {
  /**
   * Get the moderation workflow pipeline status for a semester.
   */
  getPipelineStatus(semester = 'Year 2 Semester 2') {
    const all = readJSON(STORAGE_KEYS.PIPELINE_STATUS, {});
    return all[semester] || {
      stage: PIPELINE_STAGES.SUBMITTED_TO_DMA,
      history: [
        { stage: PIPELINE_STAGES.SUBMITTED_TO_DMA, date: new Date().toISOString(), updatedBy: 'Dr. M. Kirushanth (Lecturer)', remarks: 'CA and ESA marks finalized for assigned course modules.' }
      ]
    };
  },

  /**
   * Set pipeline status for a semester.
   */
  setPipelineStatus(semester, stage, updatedBy, remarks = '') {
    const all = readJSON(STORAGE_KEYS.PIPELINE_STATUS, {});
    const cur = all[semester] || { stage: PIPELINE_STAGES.LECTURER_DRAFT, history: [] };
    cur.stage = stage;
    cur.history = [
      ...(cur.history || []),
      { stage, date: new Date().toISOString(), updatedBy, remarks }
    ];
    all[semester] = cur;
    writeJSON(STORAGE_KEYS.PIPELINE_STATUS, all);
    return cur;
  },

  /**
   * Step 1: Lecturer submits marks for their assigned subject to DMA.
   */
  lecturerSubmitMarks(subjectCode, marksByRegNo, semester = 'Year 2 Semester 2', lecturerName = 'Dr. M. Kirushanth') {
    const allMarks = readJSON(STORAGE_KEYS.SUBJECT_MARKS, {});
    allMarks[subjectCode] = {
      subjectCode,
      semester,
      lecturerName,
      submittedAt: new Date().toISOString(),
      marks: marksByRegNo
    };
    writeJSON(STORAGE_KEYS.SUBJECT_MARKS, allMarks);

    this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.SUBMITTED_TO_DMA,
      lecturerName,
      `Submitted finalized CA/ESA marks for course ${subjectCode} to Department Management Assistant.`
    );
    return { success: true, subjectCode };
  },

  /**
   * Step 2: DMA collects all subjects and forwards compiled batch results to HOD.
   */
  dmaForwardToHOD(semester = 'Year 2 Semester 2', maName = 'Fathima (Dept MA)') {
    return this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.SUBMITTED_TO_HOD,
      maName,
      `All module CA/ESA marks for ${semester} compiled and forwarded to Head of Department (HOD) for academic moderation.`
    );
  },

  /**
   * Step 3: HOD moderates batch marks and submits to Examination Officer.
   */
  hodSubmitToExamOfficer(semester = 'Year 2 Semester 2', hodName = 'Dr. Rifky (HOD)') {
    return this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER,
      hodName,
      `Department board results moderated, validated against 80% attendance criteria, and submitted to Examination Officer.`
    );
  },

  /**
   * Step 4: Examination Officer verifies results and forwards to Dean.
   */
  examOfficerForwardToDean(semester = 'Year 2 Semester 2', officerName = 'Exam Officer') {
    return this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.FORWARDED_TO_DEAN,
      officerName,
      `Examination Division verified marks sheets, eligibility standings, and forwarded for Dean's executive approval.`
    );
  },

  /**
   * Step 5: Dean approves with official digital seal and sends clearance to HOD.
   */
  deanApproveClearance(semester = 'Year 2 Semester 2', deanName = 'Prof. Rifai Kariapper (Dean)') {
    return this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.DEAN_APPROVED,
      deanName,
      `Senate examination board clearance sanctioned. Formal Dean seal affixed. Ready for HOD publication.`
    );
  },

  /**
   * Step 6: HOD receives clearance and publishes results to the student portal.
   */
  hodPublishResults(semester = 'Year 2 Semester 2', hodName = 'Dr. Rifky (HOD)') {
    return this.setPipelineStatus(
      semester,
      PIPELINE_STAGES.PUBLISHED,
      hodName,
      `Official examination results published to SEUConnect student portal.`
    );
  },

  /**
   * Check if results are officially published for a student.
   */
  isResultsPublished(semester = 'Year 2 Semester 2') {
    const status = this.getPipelineStatus(semester);
    return status.stage === PIPELINE_STAGES.PUBLISHED;
  },

  /**
   * Retrieve dynamic student results for a semester.
   */
  getStudentSemesterResults(studentRegNo, semester = 'Year 2 Semester 2') {
    const isPublished = this.isResultsPublished(semester);
    const allMarks = readJSON(STORAGE_KEYS.SUBJECT_MARKS, {});
    const reg = (studentRegNo || '22ICT091').toUpperCase();

    // Default semester courses if none submitted yet
    const defaultModules = [
      { code: 'SWT 22012', title: 'Internet Application Development', credits: 2, caMark: 35, esaMark: 47 },
      { code: 'CIS 22012', title: 'Distributed and Cloud Computing', credits: 2, caMark: 32, esaMark: 45 },
      { code: 'CIS 22022', title: 'Information Assurance and Forensics', credits: 2, caMark: 34, esaMark: 44 },
      { code: 'CIS 22032', title: 'E-commerce Strategies and Architecture', credits: 2, caMark: 31, esaMark: 42 },
      { code: 'UCT 22011', title: 'Microcontroller System Programming', credits: 1, caMark: 36, esaMark: 48 },
      { code: 'CMS 22012', title: 'Leadership & Communication Skills', credits: 2, caMark: 33, esaMark: 46 },
      { code: 'SWT 22022', title: 'Practical for Internet Application Development', credits: 2, caMark: 36, esaMark: 48 },
      { code: 'CIS 22042', title: 'Practical for Distributed and Cloud Computing', credits: 2, caMark: 34, esaMark: 46 },
      { code: 'UCT 22022', title: 'Practical for Microcontroller System Programming', credits: 2, caMark: 35, esaMark: 45 }
    ];

    let totalQualityPoints = 0;
    let totalCredits = 0;

    const courses = defaultModules.map((m) => {
      // Check if lecturer has updated marks in store
      const subStore = allMarks[m.code] || allMarks[m.code.replace(/\s+/g, '')];
      const studentSubMark = subStore?.marks?.[reg] || {};
      const ca = studentSubMark.ca !== undefined ? Number(studentSubMark.ca) : m.caMark;
      const esa = studentSubMark.esa !== undefined ? Number(studentSubMark.esa) : m.esaMark;
      const finalMark = Math.min(100, Math.round(ca + esa));
      const gradeInfo = calculateGradeFromMarks(finalMark);

      totalCredits += m.credits;
      totalQualityPoints += gradeInfo.gradePoint * m.credits;

      return {
        ...m,
        caMark: ca,
        esaMark: esa,
        finalMark,
        grade: gradeInfo.grade,
        gradePoint: gradeInfo.gradePoint,
        qualityPoints: Number((gradeInfo.gradePoint * m.credits).toFixed(2)),
        passed: gradeInfo.passed
      };
    });

    const calculatedSgpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;

    return {
      isPublished,
      pipelineStatus: this.getPipelineStatus(semester),
      semester,
      studentRegNo: reg,
      totalCredits,
      courses,
      sgpa: calculatedSgpa,
      standing: calculateAcademicStanding(calculatedSgpa)
    };
  },

  /* --------------------------------------------------------------------------
     LIVE ATTENDANCE SYNC (Lecturer -> Student)
     -------------------------------------------------------------------------- */
  /**
   * Lecturer records attendance for an assigned session.
   */
  recordAttendance(subjectCode, date, studentStatusMap, lecturerName = 'Dr. M. Kirushanth') {
    const code = subjectCode.replace(/\s+/g, '').toUpperCase();
    const sessions = readJSON(STORAGE_KEYS.ATTENDANCE_SESSIONS, {});
    if (!sessions[code]) sessions[code] = {};
    sessions[code][date] = {
      date,
      subjectCode,
      lecturerName,
      recordedAt: new Date().toISOString(),
      students: studentStatusMap // { '22ICT091': true (present) / false (absent) }
    };
    writeJSON(STORAGE_KEYS.ATTENDANCE_SESSIONS, sessions);
    return { success: true, count: Object.keys(studentStatusMap).length };
  },

  /**
   * Get attendance records for a student across all subjects.
   */
  getStudentAttendance(studentRegNo) {
    const reg = (studentRegNo || '22ICT091').toUpperCase();
    const sessions = readJSON(STORAGE_KEYS.ATTENDANCE_SESSIONS, {});
    const recordedAttendance = {};

    Object.entries(sessions).forEach(([subCode, datesMap]) => {
      Object.entries(datesMap).forEach(([date, session]) => {
        const isPresent = session.students?.[reg];
        if (isPresent !== undefined) {
          if (!recordedAttendance[date]) recordedAttendance[date] = {};
          recordedAttendance[date][subCode] = isPresent ? 'Attend' : 'Missed';
        }
      });
    });

    return recordedAttendance;
  }
};
