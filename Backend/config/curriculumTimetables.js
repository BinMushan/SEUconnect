/**
 * SEUSL Faculty of Technology - Academic Curriculum, Timetable & Semester Registry
 * Extracted directly from Handbook 2022/2023 (Pages 79, 80, 81, 82, 85, 86, 87, 88).
 * Maps each Semester (Year 1 Sem 1, Year 1 Sem 2, Year 2 Sem 1, Year 2 Sem 2, Year 3 Sem 1)
 * to its curriculum subjects, weekly lecture/lab timetables, matrix records, and exam schedules.
 */

function resolveStudentSemester(sem, regNo, batch) {
  const reg = String(regNo || '').trim();
  const batchStr = String(batch || '').trim().toLowerCase();

  // 1. Batch 2024 / 2025 (24-batch / Freshers / Batch 05)
  if (/(?:^|[\/_])24[\/_]?(?:ICT|BST|\d)/i.test(reg) || batchStr.includes('batch-05') || batchStr.includes('batch 05') || batchStr.includes('2024/2025') || batchStr.includes('2024')) {
    const s = String(sem || '').toLowerCase().trim();
    if (s.includes('sem 2') || s.includes('semester 2') || s === '2') {
      return 'Year 1 Semester 2';
    }
    return 'Year 1 Semester 1';
  }

  // 2. Batch 2023 / 2024 (23-batch / 2nd Year / Batch 04)
  if (/(?:^|[\/_])23[\/_]?(?:ICT|BST|\d)/i.test(reg) || batchStr.includes('batch-04') || batchStr.includes('batch 04') || batchStr.includes('2023/2024')) {
    const s = String(sem || '').toLowerCase().trim();
    if (s.includes('sem 2') || s.includes('semester 4') || s.includes('sem 4') || s === '4') {
      return 'Year 2 Semester 2';
    }
    return 'Year 2 Semester 1';
  }

  // 3. Batch 2022 / 2023 (22-batch / 3rd Year / Batch 03)
  if (/(?:^|[\/_])22[\/_]?(?:ICT|BST|\d)/i.test(reg) || batchStr.includes('batch-03') || batchStr.includes('batch 03') || batchStr.includes('2022/2023')) {
    const s = String(sem || '').toLowerCase().trim();
    if (s.includes('sem 2') || s.includes('semester 6') || s.includes('sem 6') || s === '6') {
      return 'Year 3 Semester 2';
    }
    return 'Year 3 Semester 1';
  }

  // 4. Batch 2021 / 2022 (21-batch / 4th Year / Batch 02)
  if (/(?:^|[\/_])21[\/_]?(?:ICT|BST|\d)/i.test(reg) || batchStr.includes('batch-02') || batchStr.includes('batch 02') || batchStr.includes('2021/2022')) {
    const s = String(sem || '').toLowerCase().trim();
    if (s.includes('sem 2') || s.includes('semester 8') || s.includes('sem 8') || s === '8') {
      return 'Year 4 Semester 2';
    }
    return 'Year 4 Semester 1';
  }

  // 5. Batch 2020 / 2021 (20-batch / Final Year / Batch 01)
  if (/(?:^|[\/_])20[\/_]?(?:ICT|BST|\d)/i.test(reg) || batchStr.includes('batch-01') || batchStr.includes('batch 01') || batchStr.includes('2020/2021')) {
    return 'Year 4 Semester 2';
  }

  return normalizeSemester(sem);
}

function resolveStudentSpecialization(spec, sem, regNo, dept) {
  const effectiveSem = resolveStudentSemester(sem, regNo);
  const is1stOr2ndYear = effectiveSem.includes('Year 1') || effectiveSem.includes('Year 2');
  
  if (is1stOr2ndYear) {
    return 'Core Curriculum';
  }

  if (spec && spec.trim() && !spec.toLowerCase().includes('pending') && !spec.toLowerCase().includes('general') && spec !== 'Core Curriculum') {
    return spec.trim();
  }

  const deptStr = String(dept || '').toLowerCase();
  if (deptStr.includes('bio')) {
    return 'Bio-Processing Technology';
  }
  return 'Software Systems';
}

function normalizeSemester(sem) {
  if (!sem) return 'Year 1 Semester 1';
  const s = String(sem).toLowerCase().trim();
  if (s.includes('1') && !s.includes('sem 2') && !s.includes('semester 2') && !s.includes('year 2') && !s.includes('year 3') && !s.includes('year 4')) {
    if (s.includes('freshers') || s.includes('year 1') || s.includes('sem 1') || s.includes('semester 1') || s === '1') {
      return 'Year 1 Semester 1';
    }
  }
  if (s.includes('year 1 sem 2') || s.includes('year 1 semester 2') || s === 'semester 2' || s === 'sem 2' || s === '2') {
    return 'Year 1 Semester 2';
  }
  if (s.includes('year 2 sem 1') || s.includes('year 2 semester 1') || s === 'semester 3' || s === 'sem 3' || s === '3') {
    return 'Year 2 Semester 1';
  }
  if (s.includes('year 2 sem 2') || s.includes('year 2 semester 2') || s === 'semester 4' || s === 'sem 4' || s === '4') {
    return 'Year 2 Semester 2';
  }
  if (s.includes('year 3 sem 1') || s.includes('year 3 semester 1') || s === 'semester 5' || s === 'sem 5' || s === '5') {
    return 'Year 3 Semester 1';
  }
  if (s.includes('year 3 sem 2') || s.includes('year 3 semester 2') || s === 'semester 6' || s === 'sem 6' || s === '6') {
    return 'Year 3 Semester 2';
  }
  if (s.includes('year 4 sem 1') || s.includes('year 4 semester 1') || s === 'semester 7' || s === 'sem 7' || s === '7') {
    return 'Year 4 Semester 1';
  }
  if (s.includes('year 4 sem 2') || s.includes('year 4 semester 2') || s === 'semester 8' || s === 'sem 8' || s === '8') {
    return 'Year 4 Semester 2';
  }
  return 'Year 1 Semester 1';
}

const CURRICULUM_DATA = {
  "Year 1 Semester 1": {
    "semester": "Year 1 Semester 1",
    "semesterLabel": "Sem 1",
    "yearNumber": 1,
    "semesterNumber": 1,
    "totalCredits": 17,
    "defaultSgpa": null,
    "defaultCgpa": null,
    "isFreshers": true,
    "batch": "2025/2026",
    "progressionData": [
      {
        "semester": "Sem 1",
        "fullLabel": "Semester 1 (Enrolled / In Progress)",
        "sgpa": null,
        "delta": "Pending",
        "credits": 0,
        "totalEnrolledCredits": 17,
        "standing": "Enrolled (In Progress)",
        "x": 290,
        "y": 140.0,
        "isCurrent": true,
        "isFirstClass": false
      }
    ],
    "subjects": [
      {
        "id": "sub-y1s1-1",
        "code": "CIS 11011",
        "rawCode": "CIS11011",
        "title": "Essentials of ICT and PC Applications",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s1-2",
        "code": "SWT 11012",
        "rawCode": "SWT11012",
        "title": "Fundamentals of Programming",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s1-3",
        "code": "CIS 11022",
        "rawCode": "CIS11022",
        "title": "Database Design",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s1-4",
        "code": "CIS 11032",
        "rawCode": "CIS11032",
        "title": "Logic designing and Computer Organization",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s1-5",
        "code": "CMS 11012",
        "rawCode": "CMS11012",
        "title": "Mathematics for ICT",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. K. Mohamed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s1-6",
        "code": "CMS 11022",
        "rawCode": "CMS11022",
        "title": "English I",
        "credits": 2,
        "theoryHours": 15,
        "practicalHours": 30,
        "type": "Auxiliary",
        "lecturer": "Ms. F. Shafna",
        "venue": "Language Lab LL-1",
        "status": "REGISTERED",
        "isGPA": false,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s1-7",
        "code": "CMS 11031",
        "rawCode": "CMS11031",
        "title": "Tamil Language (Sinhala Speaking) / Sinhala Language",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Elective",
        "lecturer": "Visiting Staff",
        "venue": "Language Lab LL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s1-8",
        "code": "CIS 11042",
        "rawCode": "CIS11042",
        "title": "Practical for Essentials of ICT and PC Applications",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Computer Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s1-9",
        "code": "SWT 11022",
        "rawCode": "SWT11022",
        "title": "Practical for Fundamental of Programming",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 45,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Software Lab 02",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s1-10",
        "code": "CIS 11051",
        "rawCode": "CIS11051",
        "title": "Practical for Database Design",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Database Lab 03",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      {
        "day": "Monday",
        "startTime": "08:30",
        "endTime": "09:30",
        "code": "CIS 11011",
        "title": "Essentials of ICT",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Monday",
        "startTime": "09:30",
        "endTime": "11:30",
        "code": "SWT 11012",
        "title": "Fundamentals of Programming",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Monday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "CIS 11042",
        "title": "Practical Essentials of ICT",
        "hall": "LAB-01",
        "type": "Practical"
      },
      {
        "day": "Tuesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 11022",
        "title": "Database Design",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 11032",
        "title": "Logic designing & Comp Org",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "SWT 11022",
        "title": "Practical Programming",
        "hall": "LAB-02",
        "type": "Practical"
      },
      {
        "day": "Thursday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CMS 11012",
        "title": "Mathematics for ICT",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "CIS 11051",
        "title": "Practical Database Design",
        "hall": "LAB-03",
        "type": "Practical"
      },
      {
        "day": "Friday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CMS 11022",
        "title": "English I",
        "hall": "LL-1",
        "type": "Lecture"
      },
      {
        "day": "Friday",
        "startTime": "10:30",
        "endTime": "12:30",
        "code": "CMS 11031",
        "title": "Tamil / Sinhala Language",
        "hall": "LL-1",
        "type": "Practical"
      }
    ],
    "examModules": [
      {
        "code": "CIS 11011",
        "title": "Essentials of ICT and PC Applications",
        "examDate": "2026-11-20",
        "examTime": "09:00 - 11:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-12"
      },
      {
        "code": "SWT 11012",
        "title": "Fundamentals of Programming",
        "examDate": "2026-11-22",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-12"
      },
      {
        "code": "CIS 11022",
        "title": "Database Design",
        "examDate": "2026-11-24",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-12"
      },
      {
        "code": "CIS 11032",
        "title": "Logic designing and Computer Organization",
        "examDate": "2026-11-26",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-08"
      },
      {
        "code": "CMS 11012",
        "title": "Mathematics for ICT",
        "examDate": "2026-11-28",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-12"
      },
      {
        "code": "CMS 11022",
        "title": "English I",
        "examDate": "2026-11-30",
        "examTime": "09:00 - 11:30",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-08"
      }
    ]
  },
  "Year 1 Semester 2": {
    "semester": "Year 1 Semester 2",
    "semesterLabel": "Sem 2",
    "yearNumber": 1,
    "semesterNumber": 2,
    "totalCredits": 18,
    "defaultSgpa": 3.72,
    "defaultCgpa": 3.74,
    "batch": "2024/2025",
    "progressionData": [
      {
        "semester": "Sem 1",
        "fullLabel": "Semester 1",
        "sgpa": 3.75,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 100,
        "y": 55.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 2",
        "fullLabel": "Semester 2 (Current)",
        "sgpa": 3.72,
        "delta": "-0.03",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 290,
        "y": 62.0,
        "isCurrent": true,
        "isFirstClass": true
      }
    ],
    "subjects": [
      {
        "id": "sub-y1s2-1",
        "code": "SWT 12012",
        "rawCode": "SWT12012",
        "title": "Object Oriented Programming",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-2",
        "code": "SWT 12022",
        "rawCode": "SWT12022",
        "title": "Web systems and Technologies",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-3",
        "code": "NST 12012",
        "rawCode": "NST12012",
        "title": "Computer Networks",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Networking Lab NL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-4",
        "code": "MGT 12012",
        "rawCode": "MGT12012",
        "title": "Multimedia and Graphic Design",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Ms. R. Farhana",
        "venue": "Multimedia Lab ML-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-5",
        "code": "CIS 12012",
        "rawCode": "CIS12012",
        "title": "Social Computing",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-6",
        "code": "CMS 12012",
        "rawCode": "CMS12012",
        "title": "Statistics",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. K. Mohamed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y1s2-7",
        "code": "CMS 12022",
        "rawCode": "CMS12022",
        "title": "English II",
        "credits": 2,
        "theoryHours": 15,
        "practicalHours": 30,
        "type": "Auxiliary",
        "lecturer": "Ms. F. Shafna",
        "venue": "Language Lab LL-1",
        "status": "REGISTERED",
        "isGPA": false,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s2-8",
        "code": "SWT 12031",
        "rawCode": "SWT12031",
        "title": "Practical for Object Oriented Programming",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Software Lab 02",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s2-9",
        "code": "SWT 12041",
        "rawCode": "SWT12041",
        "title": "Practical for Web systems and Technologies",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Web Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s2-10",
        "code": "MGT 12021",
        "rawCode": "MGT12021",
        "title": "Practical for Multimedia and Graphic Design",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Ms. R. Farhana",
        "venue": "Design Studio 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y1s2-11",
        "code": "CMS 12031",
        "rawCode": "CMS12031",
        "title": "Practical for Statistics",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Dr. K. Mohamed",
        "venue": "Data Lab 02",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      {
        "day": "Monday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 12012",
        "title": "Object Oriented Programming",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Monday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "SWT 12031",
        "title": "Practical OOP",
        "hall": "LAB-02",
        "type": "Practical"
      },
      {
        "day": "Tuesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 12022",
        "title": "Web systems & Tech",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Tuesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "SWT 12041",
        "title": "Practical Web Systems",
        "hall": "LAB-01",
        "type": "Practical"
      },
      {
        "day": "Wednesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "NST 12012",
        "title": "Computer Networks",
        "hall": "NL-1",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "MGT 12021",
        "title": "Practical Multimedia",
        "hall": "DS-01",
        "type": "Practical"
      },
      {
        "day": "Thursday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "MGT 12012",
        "title": "Multimedia & Graphic Design",
        "hall": "ML-1",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "10:30",
        "endTime": "12:30",
        "code": "CIS 12012",
        "title": "Social Computing",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "CMS 12031",
        "title": "Practical Statistics",
        "hall": "LAB-02",
        "type": "Practical"
      },
      {
        "day": "Friday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CMS 12012",
        "title": "Statistics",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Friday",
        "startTime": "10:30",
        "endTime": "12:30",
        "code": "CMS 12022",
        "title": "English II",
        "hall": "LL-1",
        "type": "Lecture"
      }
    ],
    "examModules": [
      {
        "code": "SWT 12012",
        "title": "Object Oriented Programming",
        "examDate": "2026-11-20",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-15"
      },
      {
        "code": "SWT 12022",
        "title": "Web systems and Technologies",
        "examDate": "2026-11-22",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-15"
      },
      {
        "code": "NST 12012",
        "title": "Computer Networks",
        "examDate": "2026-11-24",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-15"
      },
      {
        "code": "MGT 12012",
        "title": "Multimedia and Graphic Design",
        "examDate": "2026-11-26",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-10"
      },
      {
        "code": "CIS 12012",
        "title": "Social Computing",
        "examDate": "2026-11-28",
        "examTime": "09:00 - 11:30",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-10"
      },
      {
        "code": "CMS 12012",
        "title": "Statistics",
        "examDate": "2026-11-30",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-15"
      }
    ]
  },
  "Year 2 Semester 1": {
    "semester": "Year 2 Semester 1",
    "semesterLabel": "Sem 3",
    "yearNumber": 2,
    "semesterNumber": 1,
    "totalCredits": 18,
    "defaultSgpa": 3.65,
    "defaultCgpa": 3.71,
    "batch": "2023/2024",
    "progressionData": [
      {
        "semester": "Sem 1",
        "fullLabel": "Semester 1",
        "sgpa": 3.75,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 60,
        "y": 55.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 2",
        "fullLabel": "Semester 2",
        "sgpa": 3.72,
        "delta": "-0.03",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 160,
        "y": 62.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 3",
        "fullLabel": "Semester 3 (Current)",
        "sgpa": 3.65,
        "delta": "-0.07",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 290,
        "y": 75.0,
        "isCurrent": true,
        "isFirstClass": true
      }
    ],
    "subjects": [
      {
        "id": "sub-y2s1-1",
        "code": "SWT 21012",
        "rawCode": "SWT21012",
        "title": "Data Structures and Algorithms",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-2",
        "code": "CIS 21012",
        "rawCode": "CIS21012",
        "title": "Platform Technologies",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-3",
        "code": "NST 21012",
        "rawCode": "NST21012",
        "title": "Network Switching and Routing",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Networking Lab NL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-4",
        "code": "UCT 21011",
        "rawCode": "UCT21011",
        "title": "Digital Electronic Systems",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Electronics Lab EL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-5",
        "code": "SWT 21022",
        "rawCode": "SWT21022",
        "title": "Object Oriented Analysis and Design",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-6",
        "code": "CIS 21022",
        "rawCode": "CIS21022",
        "title": "Social and Professional Issues in ICT",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s1-7",
        "code": "SWT 21032",
        "rawCode": "SWT21032",
        "title": "Practical for Data Structures and Algorithms",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Computer Lab 02",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y2s1-8",
        "code": "CIS 21031",
        "rawCode": "CIS21031",
        "title": "Practical for Platform Technologies",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Platform Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y2s1-9",
        "code": "NST 21022",
        "rawCode": "NST21022",
        "title": "Practical for Network Switching and Routing",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Cisco Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y2s1-10",
        "code": "UCT 21022",
        "rawCode": "UCT21022",
        "title": "Practical for Digital Electronic Systems",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Hardware Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      {
        "day": "Monday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 21012",
        "title": "Data Structures & Algorithms",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Monday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "SWT 21032",
        "title": "Practical DSA",
        "hall": "LAB-02",
        "type": "Practical"
      },
      {
        "day": "Tuesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 21012",
        "title": "Platform Technologies",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Tuesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "CIS 21031",
        "title": "Practical Platform Tech",
        "hall": "LAB-01",
        "type": "Practical"
      },
      {
        "day": "Wednesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "NST 21012",
        "title": "Network Switching & Routing",
        "hall": "NL-1",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "13:30",
        "endTime": "17:30",
        "code": "NST 21022",
        "title": "Practical Cisco Switching",
        "hall": "CISCO-01",
        "type": "Practical"
      },
      {
        "day": "Thursday",
        "startTime": "08:30",
        "endTime": "09:30",
        "code": "UCT 21011",
        "title": "Digital Electronic Systems",
        "hall": "EL-1",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "10:30",
        "endTime": "12:30",
        "code": "SWT 21022",
        "title": "OOAD",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "UCT 21022",
        "title": "Practical Digital Electronics",
        "hall": "HW-01",
        "type": "Practical"
      },
      {
        "day": "Friday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 21022",
        "title": "Social & Professional Issues",
        "hall": "TL-2",
        "type": "Lecture"
      }
    ],
    "examModules": [
      {
        "code": "SWT 21012",
        "title": "Data Structures and Algorithms",
        "examDate": "2026-11-21",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-20"
      },
      {
        "code": "CIS 21012",
        "title": "Platform Technologies",
        "examDate": "2026-11-23",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-20"
      },
      {
        "code": "NST 21012",
        "title": "Network Switching and Routing",
        "examDate": "2026-11-25",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-12"
      },
      {
        "code": "UCT 21011",
        "title": "Digital Electronic Systems",
        "examDate": "2026-11-27",
        "examTime": "09:00 - 11:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-12"
      },
      {
        "code": "SWT 21022",
        "title": "Object Oriented Analysis and Design",
        "examDate": "2026-11-29",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-20"
      },
      {
        "code": "CIS 21022",
        "title": "Social and Professional Issues in ICT",
        "examDate": "2026-12-01",
        "examTime": "09:00 - 11:30",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-12"
      }
    ]
  },
  "Year 2 Semester 2": {
    "semester": "Year 2 Semester 2",
    "semesterLabel": "Sem 4",
    "yearNumber": 2,
    "semesterNumber": 2,
    "totalCredits": 17,
    "defaultSgpa": 3.65,
    "defaultCgpa": 3.71,
    "batch": "2022/2023",
    "progressionData": [
      {
        "semester": "Sem 1",
        "fullLabel": "Semester 1",
        "sgpa": 3.75,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 60,
        "y": 55.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 2",
        "fullLabel": "Semester 2",
        "sgpa": 3.72,
        "delta": "-0.03",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 130,
        "y": 62.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 3",
        "fullLabel": "Semester 3",
        "sgpa": 3.65,
        "delta": "-0.07",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 210,
        "y": 75.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 4",
        "fullLabel": "Semester 4 (Current)",
        "sgpa": 3.65,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 290,
        "y": 75.0,
        "isCurrent": true,
        "isFirstClass": true
      }
    ],
    "subjects": [
      {
        "id": "sub-y2s2-1",
        "code": "SWT 22012",
        "rawCode": "SWT22012",
        "title": "Internet Application Development",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "LH 10",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-2",
        "code": "CIS 22012",
        "rawCode": "CIS22012",
        "title": "Distributed and Cloud Computing",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "LH 10",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-3",
        "code": "CIS 22022",
        "rawCode": "CIS22022",
        "title": "Information Assurance and Forensics",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "LH 10",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-4",
        "code": "CIS 22032",
        "rawCode": "CIS22032",
        "title": "E-commerce - Strategies and Architecture",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "LH 10",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-5",
        "code": "UCT 22011",
        "rawCode": "UCT22011",
        "title": "Microcontroller System Programming",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "LH 5",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-6",
        "code": "CMS 22012",
        "rawCode": "CMS22012",
        "title": "Leadership & Communication Skills",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Auxiliary",
        "lecturer": "Ms. F. Shafna",
        "venue": "Auditorium Hall A",
        "status": "REGISTERED",
        "isGPA": false,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y2s2-7",
        "code": "SWT 22022",
        "rawCode": "SWT22022",
        "title": "Practical for Internet Application Development",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "CIS Lab",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y2s2-8",
        "code": "CIS 22042",
        "rawCode": "CIS22042",
        "title": "Practical for Distributed and Cloud Computing",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "MAC Lab",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y2s2-9",
        "code": "UCT 22022",
        "rawCode": "UCT22022",
        "title": "Practical for Microcontroller System Programming",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "CIS Lab",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      {
        "day": "Monday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 22012",
        "title": "Internet App Dev",
        "hall": "LH 10",
        "type": "Lecture"
      },
      {
        "day": "Monday",
        "startTime": "13:30",
        "endTime": "17:30",
        "code": "SWT 22022",
        "title": "Practical IAD",
        "hall": "CIS Lab",
        "type": "Practical"
      },
      {
        "day": "Tuesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 22012",
        "title": "Cloud Computing",
        "hall": "LH 10",
        "type": "Lecture"
      },
      {
        "day": "Tuesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "CIS 22042",
        "title": "Practical Cloud",
        "hall": "MAC Lab",
        "type": "Practical"
      },
      {
        "day": "Wednesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 22022",
        "title": "Info Assurance",
        "hall": "LH 10",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "UCT 22022",
        "title": "Practical Microcontroller",
        "hall": "CIS Lab",
        "type": "Practical"
      },
      {
        "day": "Thursday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 22032",
        "title": "E-commerce",
        "hall": "LH 10",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "10:30",
        "endTime": "11:30",
        "code": "UCT 22011",
        "title": "Microcontrollers",
        "hall": "LH 5",
        "type": "Lecture"
      },
      {
        "day": "Friday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CMS 22012",
        "title": "Leadership Skills",
        "hall": "Auditorium",
        "type": "Lecture"
      }
    ],
    "examModules": [
      {
        "code": "SWT 22012",
        "title": "Internet Application Development",
        "examDate": "2026-11-21",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-24"
      },
      {
        "code": "CIS 22012",
        "title": "Distributed and Cloud Computing",
        "examDate": "2026-11-23",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-24"
      },
      {
        "code": "CIS 22022",
        "title": "Information Assurance and Forensics",
        "examDate": "2026-11-25",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-15"
      },
      {
        "code": "CIS 22032",
        "title": "E-commerce Strategies and Architecture",
        "examDate": "2026-11-27",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-24"
      },
      {
        "code": "UCT 22011",
        "title": "Microcontroller System Programming",
        "examDate": "2026-11-29",
        "examTime": "09:00 - 11:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-15"
      },
      {
        "code": "CMS 22012",
        "title": "Leadership & Communication Skills",
        "examDate": "2026-12-01",
        "examTime": "09:00 - 11:30",
        "hall": "Auditorium Hall A",
        "seatNo": "Aud-10"
      }
    ]
  },
  "Year 3 Semester 1": {
    "semester": "Year 3 Semester 1",
    "semesterLabel": "Sem 5",
    "yearNumber": 3,
    "semesterNumber": 1,
    "totalCredits": 14,
    "defaultSgpa": 3.68,
    "defaultCgpa": 3.7,
    "batch": "2021/2022",
    "progressionData": [
      {
        "semester": "Sem 1",
        "fullLabel": "Semester 1",
        "sgpa": 3.75,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 40,
        "y": 55.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 2",
        "fullLabel": "Semester 2",
        "sgpa": 3.72,
        "delta": "-0.03",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 100,
        "y": 62.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 3",
        "fullLabel": "Semester 3",
        "sgpa": 3.65,
        "delta": "-0.07",
        "credits": 18,
        "standing": "First Class Standing",
        "x": 160,
        "y": 75.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 4",
        "fullLabel": "Semester 4",
        "sgpa": 3.65,
        "delta": "+0.00",
        "credits": 17,
        "standing": "First Class Standing",
        "x": 220,
        "y": 75.0,
        "isCurrent": false,
        "isFirstClass": true
      },
      {
        "semester": "Sem 5",
        "fullLabel": "Semester 5 (Current)",
        "sgpa": 3.68,
        "delta": "+0.03",
        "credits": 14,
        "standing": "First Class Standing",
        "x": 290,
        "y": 70.0,
        "isCurrent": true,
        "isFirstClass": true
      }
    ],
    "subjects": [
      {
        "id": "sub-y3s1-1",
        "code": "SWT 31012",
        "rawCode": "SWT31012",
        "title": "Software Engineering",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s1-2",
        "code": "CIS 31012",
        "rawCode": "CIS31012",
        "title": "ICT Project Management",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s1-3",
        "code": "UCT 31012",
        "rawCode": "UCT31012",
        "title": "Artificial Intelligence",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s1-4",
        "code": "SWT 31022",
        "rawCode": "SWT31022",
        "title": "Software Verification and Quality Assurance",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s1-5",
        "code": "CMS 31022",
        "rawCode": "CMS31022",
        "title": "Research Methodologies for ICT",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Prof. A. Majeed",
        "venue": "Faculty Boardroom",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 60,
        "esaPercent": 40
      },
      {
        "id": "sub-y3s1-6",
        "code": "UCT 31021",
        "rawCode": "UCT31021",
        "title": "Practical for Artificial Intelligence",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "AI Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      },
      {
        "id": "sub-y3s1-7",
        "code": "NST 31022",
        "rawCode": "NST31022",
        "title": "Cryptography",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Elective",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Networking Lab NL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s1-8",
        "code": "NST 31051",
        "rawCode": "NST31051",
        "title": "Practical for Cryptography",
        "credits": 1,
        "theoryHours": 0,
        "practicalHours": 30,
        "type": "Elective",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Security Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      {
        "day": "Monday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 31012",
        "title": "Software Engineering",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Tuesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CIS 31012",
        "title": "ICT Project Management",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "UCT 31012",
        "title": "Artificial Intelligence",
        "hall": "TL-1",
        "type": "Lecture"
      },
      {
        "day": "Wednesday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "UCT 31021",
        "title": "Practical AI",
        "hall": "AI-01",
        "type": "Practical"
      },
      {
        "day": "Thursday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "SWT 31022",
        "title": "Software QA & Testing",
        "hall": "TL-2",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "10:30",
        "endTime": "12:30",
        "code": "NST 31022",
        "title": "Cryptography",
        "hall": "NL-1",
        "type": "Lecture"
      },
      {
        "day": "Thursday",
        "startTime": "13:30",
        "endTime": "16:30",
        "code": "NST 31051",
        "title": "Practical Cryptography",
        "hall": "SEC-01",
        "type": "Practical"
      },
      {
        "day": "Friday",
        "startTime": "08:30",
        "endTime": "10:30",
        "code": "CMS 31022",
        "title": "Research Methodologies",
        "hall": "Boardroom",
        "type": "Lecture"
      }
    ],
    "examModules": [
      {
        "code": "SWT 31012",
        "title": "Software Engineering",
        "examDate": "2026-11-20",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-30"
      },
      {
        "code": "CIS 31012",
        "title": "ICT Project Management",
        "examDate": "2026-11-22",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-30"
      },
      {
        "code": "UCT 31012",
        "title": "Artificial Intelligence",
        "examDate": "2026-11-24",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-18"
      },
      {
        "code": "SWT 31022",
        "title": "Software Verification and QA",
        "examDate": "2026-11-26",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 1",
        "seatNo": "A-30"
      },
      {
        "code": "CMS 31022",
        "title": "Research Methodologies for ICT",
        "examDate": "2026-11-28",
        "examTime": "09:00 - 12:00",
        "hall": "Tech Exam Hall 2",
        "seatNo": "B-18"
      }
    ]
  },
  "Year 3 Semester 2": {
    "semester": "Year 3 Semester 2",
    "semesterLabel": "Sem 6",
    "yearNumber": 3,
    "semesterNumber": 2,
    "totalCredits": 16,
    "defaultSgpa": 3.42,
    "defaultCgpa": 3.40,
    "isFreshers": false,
    "batch": "2023/2024",
    "progressionData": [],
    "subjects": [
      {
        "id": "sub-y3s2-1",
        "code": "CIS 32012",
        "rawCode": "CIS32012",
        "title": "Enterprise Architecture and Leadership",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s2-2",
        "code": "SWT 32011",
        "rawCode": "SWT32011",
        "title": "Mobile Application Development",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s2-3",
        "code": "UCT 32011",
        "rawCode": "UCT32011",
        "title": "Embedded System",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Embedded Lab EL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s2-4",
        "code": "NST 32012",
        "rawCode": "NST32012",
        "title": "Wireless Network",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Eng. K. Thanushan",
        "venue": "Networking Lab NL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s2-5",
        "code": "SWT 32022",
        "rawCode": "SWT32022",
        "title": "Service Oriented Web Application",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y3s2-6",
        "code": "SWT 32042",
        "rawCode": "SWT32042",
        "title": "Practical for Mobile Application Development",
        "credits": 2,
        "theoryHours": 0,
        "practicalHours": 60,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Mobile Lab 01",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 50,
        "esaPercent": 50
      }
    ],
    "timetableSlots": [
      { "day": "Monday", "startTime": "08:30", "endTime": "10:30", "code": "CIS 32012", "title": "Enterprise Architecture", "hall": "TL-1", "type": "Lecture" },
      { "day": "Tuesday", "startTime": "08:30", "endTime": "09:30", "code": "SWT 32011", "title": "Mobile App Dev", "hall": "TL-2", "type": "Lecture" },
      { "day": "Tuesday", "startTime": "13:30", "endTime": "16:30", "code": "SWT 32042", "title": "Mobile App Lab", "hall": "Mobile Lab 01", "type": "Practical" },
      { "day": "Wednesday", "startTime": "08:30", "endTime": "09:30", "code": "UCT 32011", "title": "Embedded Systems", "hall": "EL-1", "type": "Lecture" },
      { "day": "Thursday", "startTime": "08:30", "endTime": "10:30", "code": "NST 32012", "title": "Wireless Networks", "hall": "NL-1", "type": "Lecture" },
      { "day": "Friday", "startTime": "08:30", "endTime": "10:30", "code": "SWT 32022", "title": "Service Oriented Web", "hall": "TL-1", "type": "Lecture" }
    ],
    "examModules": [
      { "code": "CIS 32012", "title": "Enterprise Architecture and Leadership", "examDate": "2026-11-20", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 1", "seatNo": "A-15" },
      { "code": "SWT 32011", "title": "Mobile Application Development", "examDate": "2026-11-22", "examTime": "09:00 - 11:00", "hall": "Tech Exam Hall 1", "seatNo": "A-15" },
      { "code": "UCT 32011", "title": "Embedded System", "examDate": "2026-11-24", "examTime": "09:00 - 11:00", "hall": "Tech Exam Hall 2", "seatNo": "B-12" },
      { "code": "NST 32012", "title": "Wireless Network", "examDate": "2026-11-26", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 1", "seatNo": "A-15" },
      { "code": "SWT 32022", "title": "Service Oriented Web Application", "examDate": "2026-11-28", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 2", "seatNo": "B-12" }
    ]
  },
  "Year 4 Semester 1": {
    "semester": "Year 4 Semester 1",
    "semesterLabel": "Sem 7",
    "yearNumber": 4,
    "semesterNumber": 1,
    "totalCredits": 15,
    "defaultSgpa": 3.50,
    "defaultCgpa": 3.48,
    "isFreshers": false,
    "batch": "2022/2023",
    "progressionData": [],
    "subjects": [
      {
        "id": "sub-y4s1-1",
        "code": "SWT 41021",
        "rawCode": "SWT41021",
        "title": "Cloud Application Development",
        "credits": 1,
        "theoryHours": 15,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. M. Kirushanth",
        "venue": "Tech Lecture Hall TL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y4s1-2",
        "code": "SWT 41032",
        "rawCode": "SWT41032",
        "title": "Advance Software Engineering",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Mr. S. Rifky",
        "venue": "Tech Lecture Hall TL-2",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y4s1-3",
        "code": "CIS 41022",
        "rawCode": "CIS41022",
        "title": "Advance Database Management System",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Dr. A. N. Ahmed",
        "venue": "Database Lab DL-1",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y4s1-4",
        "code": "CMS 41012",
        "rawCode": "CMS41012",
        "title": "Professional Practice",
        "credits": 2,
        "theoryHours": 30,
        "practicalHours": 0,
        "type": "Core",
        "lecturer": "Prof. A. Majeed",
        "venue": "Auditorium Hall A",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 40,
        "esaPercent": 60
      },
      {
        "id": "sub-y4s1-5",
        "code": "SWT 40016",
        "rawCode": "SWT40016",
        "title": "Final Research and Development Project",
        "credits": 6,
        "theoryHours": 0,
        "practicalHours": 180,
        "type": "Core",
        "lecturer": "Academic Supervisors Committee",
        "venue": "R&D Innovation Lab",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 100,
        "esaPercent": 0
      }
    ],
    "timetableSlots": [
      { "day": "Monday", "startTime": "08:30", "endTime": "09:30", "code": "SWT 41021", "title": "Cloud App Development", "hall": "TL-1", "type": "Lecture" },
      { "day": "Tuesday", "startTime": "08:30", "endTime": "10:30", "code": "SWT 41032", "title": "Advance Software Eng", "hall": "TL-2", "type": "Lecture" },
      { "day": "Wednesday", "startTime": "08:30", "endTime": "10:30", "code": "CIS 41022", "title": "Advance DBMS", "hall": "DL-1", "type": "Lecture" },
      { "day": "Thursday", "startTime": "08:30", "endTime": "10:30", "code": "CMS 41012", "title": "Professional Practice", "hall": "Hall A", "type": "Lecture" },
      { "day": "Friday", "startTime": "09:00", "endTime": "16:00", "code": "SWT 40016", "title": "Research & Dev Project", "hall": "R&D Lab", "type": "Tutorial" }
    ],
    "examModules": [
      { "code": "SWT 41021", "title": "Cloud Application Development", "examDate": "2026-11-20", "examTime": "09:00 - 11:00", "hall": "Tech Exam Hall 1", "seatNo": "A-05" },
      { "code": "SWT 41032", "title": "Advance Software Engineering", "examDate": "2026-11-22", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 1", "seatNo": "A-05" },
      { "code": "CIS 41022", "title": "Advance Database Management System", "examDate": "2026-11-24", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 2", "seatNo": "B-08" },
      { "code": "CMS 41012", "title": "Professional Practice", "examDate": "2026-11-26", "examTime": "09:00 - 12:00", "hall": "Tech Exam Hall 1", "seatNo": "A-05" }
    ]
  },
  "Year 4 Semester 2": {
    "semester": "Year 4 Semester 2",
    "semesterLabel": "Sem 8",
    "yearNumber": 4,
    "semesterNumber": 2,
    "totalCredits": 6,
    "defaultSgpa": 3.75,
    "defaultCgpa": 3.60,
    "isFreshers": false,
    "batch": "2022/2023",
    "progressionData": [],
    "subjects": [
      {
        "id": "sub-y4s2-1",
        "code": "SWT 42016",
        "rawCode": "SWT42016",
        "title": "Industrial Placement",
        "credits": 6,
        "theoryHours": 0,
        "practicalHours": 480,
        "type": "Core",
        "lecturer": "Faculty Industrial Liaison Division",
        "venue": "Partner Technology Organization",
        "status": "REGISTERED",
        "isGPA": true,
        "caPercent": 100,
        "esaPercent": 0
      }
    ],
    "timetableSlots": [
      { "day": "Monday", "startTime": "08:30", "endTime": "17:00", "code": "SWT 42016", "title": "Industrial Training Placement", "hall": "Industry Partner Org", "type": "Practical" },
      { "day": "Tuesday", "startTime": "08:30", "endTime": "17:00", "code": "SWT 42016", "title": "Industrial Training Placement", "hall": "Industry Partner Org", "type": "Practical" },
      { "day": "Wednesday", "startTime": "08:30", "endTime": "17:00", "code": "SWT 42016", "title": "Industrial Training Placement", "hall": "Industry Partner Org", "type": "Practical" },
      { "day": "Thursday", "startTime": "08:30", "endTime": "17:00", "code": "SWT 42016", "title": "Industrial Training Placement", "hall": "Industry Partner Org", "type": "Practical" },
      { "day": "Friday", "startTime": "08:30", "endTime": "17:00", "code": "SWT 42016", "title": "Industrial Training Placement", "hall": "Industry Partner Org", "type": "Practical" }
    ],
    "examModules": [
      { "code": "SWT 42016", "title": "Industrial Placement Evaluation & Viva", "examDate": "2026-12-20", "examTime": "09:00 - 16:00", "hall": "Senate Conference Room", "seatNo": "VIVA-01" }
    ]
  }
};

const ALL_SEMESTERS = [
  'Year 1 Semester 1',
  'Year 1 Semester 2',
  'Year 2 Semester 1',
  'Year 2 Semester 2',
  'Year 3 Semester 1',
  'Year 3 Semester 2',
  'Year 4 Semester 1',
  'Year 4 Semester 2'
];

function mapExamYearSemToSemesterName(examYear = '', examSemester = '') {
  let yr = 1;
  const y = String(examYear || '').toLowerCase();
  if (y.includes('second') || y.includes('2')) yr = 2;
  else if (y.includes('third') || y.includes('3')) yr = 3;
  else if (y.includes('fourth') || y.includes('4')) yr = 4;
  else yr = 1;

  let sm = 1;
  const s = String(examSemester || '').toLowerCase();
  if (s.includes('2') || s.includes('ii') || s.includes('second')) sm = 2;
  else sm = 1;

  return `Year ${yr} Semester ${sm}`;
}

function mapSemesterNameToExamYearSem(semName = '') {
  const norm = normalizeSemester(semName);
  let examYear = 'First Year';
  let examSemester = '1st';
  let caSemester = 'I';
  let caYearOfExam = 'First Year';

  if (norm.includes('Year 1')) { examYear = 'First Year'; caYearOfExam = 'First Year'; }
  else if (norm.includes('Year 2')) { examYear = 'Second Year'; caYearOfExam = 'Second Year'; }
  else if (norm.includes('Year 3')) { examYear = 'Third Year'; caYearOfExam = 'Third Year'; }
  else if (norm.includes('Year 4')) { examYear = 'Fourth Year'; caYearOfExam = 'Fourth Year'; }

  if (norm.includes('Semester 2')) { examSemester = '2nd'; caSemester = 'II'; }
  else { examSemester = '1st'; caSemester = 'I'; }

  return { examYear, examSemester, caSemester, caYearOfExam, semesterName: norm };
}

function getSubjectsForYearSemester(yearOrSemesterName, optionalSemester) {
  let semName = yearOrSemesterName;
  if (optionalSemester !== undefined) {
    semName = mapExamYearSemToSemesterName(yearOrSemesterName, optionalSemester);
  }
  const cur = getCurriculumBySemester(semName);
  return cur?.subjects || [];
}

function getAllCurriculumSubjects() {
  return ALL_SEMESTERS.map((sem) => ({
    semester: sem,
    subjects: getSubjectsForYearSemester(sem)
  }));
}

function getCurriculumBySemester(semesterName, optionalRegNo, optionalBatch) {
  const normalized = (optionalRegNo || optionalBatch)
    ? resolveStudentSemester(semesterName, optionalRegNo, optionalBatch)
    : normalizeSemester(semesterName);
  return CURRICULUM_DATA[normalized] || CURRICULUM_DATA['Year 1 Semester 1'];
}

module.exports = {
  CURRICULUM_DATA,
  normalizeSemester,
  resolveStudentSemester,
  resolveStudentSpecialization,
  getCurriculumBySemester,
  ALL_SEMESTERS,
  mapExamYearSemToSemesterName,
  mapSemesterNameToExamYearSem,
  getSubjectsForYearSemester,
  getAllCurriculumSubjects
};
