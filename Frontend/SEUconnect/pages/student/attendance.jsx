import React, { useState, useRef, useEffect, useMemo } from 'react';
import './attendance.css';
import api from '../../src/services/api.js';
import { getCurriculumBySemester, normalizeSemester } from '../../src/services/curriculumData.js';
import { resultsPipelineService } from '../../src/services/resultsPipelineService.js';

// 1. Official Course Directory matching the uploaded Department Timetable (Yr 2 - Sem II)
const TIMETABLE_COURSES = [
  { id: 1, code: 'SWT 22012', title: 'Internet Application Development', lecturer: 'Mr. J Ahamed Adhil', type: 'Theory', credits: 2 },
  { id: 2, code: 'CIS 22012', title: 'Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', type: 'Theory', credits: 2 },
  { id: 3, code: 'CIS 22022', title: 'Information Assurance and Forensics', lecturer: 'Mr. MJ Ahamed Sabani', type: 'Theory', credits: 2 },
  { id: 4, code: 'CIS 22032', title: 'E-commerce Strategis and Architecture', lecturer: 'Ms. AF Masroofa', type: 'Theory', credits: 2 },
  { id: 5, code: 'UCT 22011', title: 'Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', type: 'Theory', credits: 1 },
  { id: 6, code: 'CMS 22012', title: 'Leadership & Communication Skills', lecturer: 'Ms. ARF Shafana', type: 'Theory', credits: 2 },
  { id: 7, code: 'SWT 22022', title: 'Practical for Internet Application Development', lecturer: 'Mr. J Ahamed Adhil', type: 'Practical', credits: 2 },
  { id: 8, code: 'CIS 22042', title: 'Practical for Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', type: 'Practical', credits: 2 },
  { id: 9, code: 'UCT 22022', title: 'Practical for Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', type: 'Practical', credits: 2 }
];

// 2. Matrix Columns matching the exact order in user's diagram
const MATRIX_COLUMNS = [
  { code: 'UCT 22022', title: 'Microcontroller (P)' },
  { code: 'CIS 22042', title: 'Cloud Computing (P)' },
  { code: 'SWT 22012', title: 'Internet App Dev' },
  { code: 'CIS 22012', title: 'Distributed Systems' },
  { code: 'CIS 22022', title: 'Info Assurance' },
  { code: 'CIS 22032', title: 'E-commerce' },
  { code: 'UCT 22011', title: 'Microcontroller (T)' },
  { code: 'CMS 22012', title: 'Comm. Skills' },
  { code: 'SWT 22022', title: 'Internet App (P)' }
];

// 3. Matrix Rows organized strictly from Monday to Friday
const MATRIX_DAILY_ROWS = [
  // Current Academic Week (Monday to Friday)
  {
    date: '2026/11/02',
    day: 'Monday',
    weekLabel: 'Current Week',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Missed'
    }
  },
  {
    date: '2026/11/03',
    day: 'Tuesday',
    weekLabel: 'Current Week',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Attend'
    }
  },
  {
    date: '2026/11/04',
    day: 'Wednesday',
    weekLabel: 'Current Week',
    records: {
      'CIS 22022': 'Attend',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/11/05',
    day: 'Thursday',
    weekLabel: 'Current Week',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/11/06',
    day: 'Friday',
    weekLabel: 'Current Week',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Attend',
      'SWT 22022': 'Attend'
    }
  },

  // Previous Academic Week (Monday to Friday)
  {
    date: '2026/10/26',
    day: 'Monday',
    weekLabel: 'Week 11',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/10/27',
    day: 'Tuesday',
    weekLabel: 'Week 11',
    records: {
      'UCT 22022': 'Missed',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Missed'
    }
  },
  {
    date: '2026/10/28',
    day: 'Wednesday',
    weekLabel: 'Week 11',
    records: {
      'CIS 22022': 'Missed',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/10/29',
    day: 'Thursday',
    weekLabel: 'Week 11',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/10/30',
    day: 'Friday',
    weekLabel: 'Week 11',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Attend',
      'SWT 22022': 'Attend'
    }
  },

  // Prior Academic Week (Monday to Friday)
  {
    date: '2026/10/19',
    day: 'Monday',
    weekLabel: 'Week 10',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/10/20',
    day: 'Tuesday',
    weekLabel: 'Week 10',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Missed'
    }
  },
  {
    date: '2026/10/21',
    day: 'Wednesday',
    weekLabel: 'Week 10',
    records: {
      'CIS 22022': 'Attend',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/10/22',
    day: 'Thursday',
    weekLabel: 'Week 10',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/10/23',
    day: 'Friday',
    weekLabel: 'Week 10',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Missed',
      'SWT 22022': 'Attend'
    }
  },

  // Kickoff Week (Monday to Friday - matching reference diagram)
  {
    date: '2026/04/06',
    day: 'Monday',
    weekLabel: 'Kickoff Week',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/04/07',
    day: 'Tuesday',
    weekLabel: 'Kickoff Week',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Attend'
    }
  },
  {
    date: '2026/04/08',
    day: 'Wednesday',
    weekLabel: 'Kickoff Week',
    records: {
      'CIS 22012': 'Attend',
      'CIS 22022': 'Attend',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/04/09',
    day: 'Thursday',
    weekLabel: 'Kickoff Week',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/04/10',
    day: 'Friday',
    weekLabel: 'Kickoff Week',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Attend',
      'SWT 22022': 'Attend'
    }
  }
];

// 4. Subject-wise Attendance Records
const SUBJECT_ATTENDANCE = [
  {
    code: 'SWT 22012',
    title: 'Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    type: 'Theory',
    theoryAttended: 12,
    theoryTotal: 13,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 12,
    totalSessions: 13,
    percentage: 92,
    isEligible: true,
    missedCount: 1
  },
  {
    code: 'SWT 22022',
    title: 'Practical for Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    type: 'Practical',
    theoryAttended: 0,
    theoryTotal: 0,
    practicalAttended: 11,
    practicalTotal: 12,
    attendedSessions: 11,
    totalSessions: 12,
    percentage: 92,
    isEligible: true,
    missedCount: 1
  },
  {
    code: 'CIS 22012',
    title: 'Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    type: 'Theory',
    theoryAttended: 12,
    theoryTotal: 12,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 12,
    totalSessions: 12,
    percentage: 100,
    isEligible: true,
    missedCount: 0
  },
  {
    code: 'CIS 22042',
    title: 'Practical for Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    type: 'Practical',
    theoryAttended: 0,
    theoryTotal: 0,
    practicalAttended: 10,
    practicalTotal: 11,
    attendedSessions: 10,
    totalSessions: 11,
    percentage: 91,
    isEligible: true,
    missedCount: 1
  },
  {
    code: 'CIS 22022',
    title: 'Information Assurance and Forensics',
    lecturer: 'Mr. MJ Ahamed Sabani',
    type: 'Theory',
    theoryAttended: 10,
    theoryTotal: 11,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 10,
    totalSessions: 11,
    percentage: 91,
    isEligible: true,
    missedCount: 1
  },
  {
    code: 'CIS 22032',
    title: 'E-commerce Strategis and Architecture',
    lecturer: 'Ms. AF Masroofa',
    type: 'Theory',
    theoryAttended: 12,
    theoryTotal: 12,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 12,
    totalSessions: 12,
    percentage: 100,
    isEligible: true,
    missedCount: 0
  },
  {
    code: 'UCT 22011',
    title: 'Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    type: 'Theory',
    theoryAttended: 11,
    theoryTotal: 11,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 11,
    totalSessions: 11,
    percentage: 100,
    isEligible: true,
    missedCount: 0
  },
  {
    code: 'UCT 22022',
    title: 'Practical for Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    type: 'Practical',
    theoryAttended: 0,
    theoryTotal: 0,
    practicalAttended: 11,
    practicalTotal: 12,
    attendedSessions: 11,
    totalSessions: 12,
    percentage: 92,
    isEligible: true,
    missedCount: 1
  },
  {
    code: 'CMS 22012',
    title: 'Leadership & Communication Skills',
    lecturer: 'Ms. ARF Shafana',
    type: 'Theory',
    theoryAttended: 9,
    theoryTotal: 11,
    practicalAttended: 0,
    practicalTotal: 0,
    attendedSessions: 9,
    totalSessions: 11,
    percentage: 82,
    isEligible: true,
    missedCount: 2
  }
];

// 5. Date-wise Detailed Sessions Log
const DATE_WISE_SESSIONS = [
  {
    id: 'SES-024',
    date: '2026-11-03',
    day: 'Tuesday',
    time: '08:30 - 10:30',
    code: 'UCT 22022',
    title: 'Practical for Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-023',
    date: '2026-11-03',
    day: 'Tuesday',
    time: '10:30 - 12:30',
    code: 'CMS 22012',
    title: 'Leadership & Communication Skills',
    lecturer: 'Ms. ARF Shafana',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-022',
    date: '2026-11-03',
    day: 'Tuesday',
    time: '14:30 - 16:30',
    code: 'CIS 22012',
    title: 'Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    venue: 'LH10 (Lecture Hall 10)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-021',
    date: '2026-11-02',
    day: 'Monday',
    time: '10:30 - 12:30',
    code: 'CIS 22032',
    title: 'E-commerce Strategis and Architecture',
    lecturer: 'Ms. AF Masroofa',
    venue: 'SWT (Software Technologies Lab)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-020',
    date: '2026-11-02',
    day: 'Monday',
    time: '13:30 - 16:30',
    code: 'SWT 22022',
    title: 'Practical for Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'missed',
    reason: 'Reported fever; Medical submission recommended'
  },
  {
    id: 'SES-019',
    date: '2026-10-30',
    day: 'Friday',
    time: '08:30 - 10:30',
    code: 'UCT 22022',
    title: 'Practical for Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-018',
    date: '2026-10-30',
    day: 'Friday',
    time: '10:30 - 12:30',
    code: 'CIS 22042',
    title: 'Practical for Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-017',
    date: '2026-10-30',
    day: 'Friday',
    time: '14:30 - 17:30',
    code: 'SWT 22022',
    title: 'Practical for Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-016',
    date: '2026-10-29',
    day: 'Thursday',
    time: '08:30 - 09:30',
    code: 'UCT 22011',
    title: 'Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-015',
    date: '2026-10-29',
    day: 'Thursday',
    time: '09:30 - 11:30',
    code: 'SWT 22012',
    title: 'Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-014',
    date: '2026-10-28',
    day: 'Wednesday',
    time: '08:30 - 10:30',
    code: 'CIS 22022',
    title: 'Information Assurance and Forensics',
    lecturer: 'Mr. MJ Ahamed Sabani',
    venue: 'LH10 (Lecture Hall 10)',
    type: 'Theory',
    status: 'missed',
    reason: 'Absent without prior notice'
  },
  {
    id: 'SES-013',
    date: '2026-10-28',
    day: 'Wednesday',
    time: '13:30 - 15:30',
    code: 'CIS 22042',
    title: 'Practical for Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    venue: 'MAC (Mobile App Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-012',
    date: '2026-10-27',
    day: 'Tuesday',
    time: '08:30 - 10:30',
    code: 'UCT 22022',
    title: 'Practical for Microcontroller System Programming',
    lecturer: 'Mr. SL Abdul Haleem',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'missed',
    reason: 'Transport delay; Medical excuse pending'
  },
  {
    id: 'SES-011',
    date: '2026-10-27',
    day: 'Tuesday',
    time: '10:30 - 12:30',
    code: 'CMS 22012',
    title: 'Leadership & Communication Skills',
    lecturer: 'Ms. ARF Shafana',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'missed',
    reason: 'Medical excuse submitted (Pending Dean Office)'
  },
  {
    id: 'SES-010',
    date: '2026-10-27',
    day: 'Tuesday',
    time: '14:30 - 16:30',
    code: 'CIS 22012',
    title: 'Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    venue: 'LH10 (Lecture Hall 10)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-009',
    date: '2026-10-26',
    day: 'Monday',
    time: '10:30 - 12:30',
    code: 'CIS 22032',
    title: 'E-commerce Strategis and Architecture',
    lecturer: 'Ms. AF Masroofa',
    venue: 'SWT (Software Technologies Lab)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-008',
    date: '2026-10-26',
    day: 'Monday',
    time: '13:30 - 16:30',
    code: 'SWT 22022',
    title: 'Practical for Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'attended'
  },
  {
    id: 'SES-007',
    date: '2026-10-24',
    day: 'Thursday',
    time: '09:30 - 11:30',
    code: 'SWT 22012',
    title: 'Internet Application Development',
    lecturer: 'Mr. J Ahamed Adhil',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'missed',
    reason: 'Absent'
  },
  {
    id: 'SES-006',
    date: '2026-10-23',
    day: 'Friday',
    time: '10:30 - 12:30',
    code: 'CIS 22042',
    title: 'Practical for Distributed and Cloud Computing',
    lecturer: 'Mr. Janotheepan (VL)',
    venue: 'CIS (Computing Information System Lab)',
    type: 'Practical',
    status: 'missed',
    reason: 'Absent'
  },
  {
    id: 'SES-005',
    date: '2026-10-21',
    day: 'Wednesday',
    time: '08:30 - 10:30',
    code: 'CIS 22022',
    title: 'Information Assurance and Forensics',
    lecturer: 'Mr. MJ Ahamed Sabani',
    venue: 'LH10 (Lecture Hall 10)',
    type: 'Theory',
    status: 'attended'
  },
  {
    id: 'SES-004',
    date: '2026-10-20',
    day: 'Tuesday',
    time: '10:30 - 12:30',
    code: 'CMS 22012',
    title: 'Leadership & Communication Skills',
    lecturer: 'Ms. ARF Shafana',
    venue: 'LH5 (Lecture Hall 5)',
    type: 'Theory',
    status: 'missed',
    reason: 'Endorsed Medical on Record'
  }
];

export default function Attendance({ onNavigateMedical, user }) {
  const cur = getCurriculumBySemester(user?.semester);
  const activeTimetableCourses = (cur.subjects && cur.subjects.length > 0) ? cur.subjects : TIMETABLE_COURSES;
  const activeMatrixColumns = (cur.matrixColumns && cur.matrixColumns.length > 0) ? cur.matrixColumns : MATRIX_COLUMNS;
  const rawMatrixDailyRows = (cur.matrixDailyRows && cur.matrixDailyRows.length > 0) ? cur.matrixDailyRows : MATRIX_DAILY_ROWS;

  // Real-time synchronization with Lecturer attendance submissions
  const [liveAttendanceMap, setLiveAttendanceMap] = useState(() => {
    return resultsPipelineService.getStudentAttendance(user?.regNo || '22ICT091');
  });

  // Real-time weekly timetable synchronized with HOD department timetable
  const [liveTimetableSlots, setLiveTimetableSlots] = useState(() => {
    try {
      const cacheKey = `seu_tt_${normalizeSemester(user?.semester)}_${user?.batch || '2022/2023'}_${user?.department?.includes('Bio') ? 'BST' : 'BICT'}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    } catch (_) {}
    return cur.timetableSlots || [];
  });

  useEffect(() => {
    let cancelled = false;
    api.getTimetable({
      semester: user?.semester,
      batch: user?.batch,
      department: user?.department,
    }).then((res) => {
      if (!cancelled && res && res.data && res.data.slots && res.data.slots.length > 0) {
        setLiveTimetableSlots(res.data.slots);
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const handleSync = () => {
      setLiveAttendanceMap(resultsPipelineService.getStudentAttendance(user?.regNo || '22ICT091'));
    };
    window.addEventListener('seu_pipeline_update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seu_pipeline_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  // Combined matrix rows with live lecturer records
  const activeMatrixDailyRows = useMemo(() => {
    return rawMatrixDailyRows.map((row) => {
      const dateSlash = row.date;
      const dateDash = row.date.replace(/\//g, '-');
      const liveSession = liveAttendanceMap[dateSlash] || liveAttendanceMap[dateDash] || {};
      return {
        ...row,
        records: {
          ...row.records,
          ...liveSession,
        },
      };
    });
  }, [rawMatrixDailyRows, liveAttendanceMap]);

  // Default tab set to the Daily Attendance Grid (Date x Subject Matrix) requested by the user
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'subject' | 'datewise' | 'timetable'
  const [matrixPeriod, setMatrixPeriod] = useState('1week'); // Default to Current Week (Monday to Friday)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [onlyMissedDates, setOnlyMissedDates] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const periodTimerRef = useRef(null);

  const handlePeriodMouseEnter = () => {
    if (periodTimerRef.current) clearTimeout(periodTimerRef.current);
    setDropdownOpen(true);
  };

  const handlePeriodMouseLeave = () => {
    periodTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 250);
  };

  const overallPercentage = user?.attendance !== undefined && user?.attendance !== null ? Number(user.attendance) : 92.5;
  const minThreshold = 80;
  const isOverallEligible = overallPercentage >= minThreshold;
  const totalAttended = 88;
  const totalSessions = 101;
  const totalMissedCount = DATE_WISE_SESSIONS.filter((s) => s.status === 'missed').length;

  // Filtered rows for the Daily Attendance Matrix strictly from Monday to Friday
  const filteredMatrixRows = activeMatrixDailyRows.filter((row, index) => {
    if (matrixPeriod === '1week') {
      return index < 5; // Current Week: Mon to Fri (5 days)
    } else if (matrixPeriod === '2weeks') {
      return index < 10; // Last 2 Weeks: Mon to Fri (10 days)
    } else if (matrixPeriod === '3weeks') {
      return index < 15; // Last 3 Weeks: Mon to Fri (15 days)
    } else if (matrixPeriod === '1month') {
      return row.date.startsWith('2026/10') || row.date.startsWith('2026/11');
    } else if (matrixPeriod === 'kickoff') {
      return row.date.startsWith('2026/04'); // Kickoff Week: Mon to Fri
    }
    return true;
  });

  const getPeriodLabel = () => {
    switch (matrixPeriod) {
      case '1week':
        return '1 Week (Mon - Fri)';
      case '2weeks':
        return '2 Weeks';
      case '3weeks':
        return '3 Weeks';
      case '1month':
        return '1 Month';
      case 'kickoff':
        return 'Kickoff Week (Mon - Fri)';
      default:
        return 'All Recorded Dates';
    }
  };

  // Filtered sessions strictly for Missed Lectures only
  const filteredSessions = DATE_WISE_SESSIONS.filter((session) => {
    if (session.status !== 'missed') return false;
    if (selectedSubjectFilter !== 'all' && session.code !== selectedSubjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${session.code} ${session.title} ${session.lecturer} ${session.venue} ${session.date} ${session.day}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleSelectSubjectDates = (code) => {
    setSelectedSubjectFilter(code);
    setActiveTab('datewise');
  };

  const handleOpenMissedOnly = () => {
    setOnlyMissedDates(true);
    setMatrixPeriod('all');
    setActiveTab('matrix');
  };

  return (
    <div className="attendance-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Attendance & Examination Eligibility</h1>
        <p>Department of Information and Communication Technology • Academic Batch 2022/2023 (Yr 2 - Sem II)</p>
      </div>

      {/* 2. Top 3 Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Overall Attendance */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">Overall Attendance</span>
              <span className="stat-badge">{isOverallEligible ? 'Eligible for ESA' : 'Ineligible'}</span>
            </div>
            <div className="stat-value">{overallPercentage}%</div>
            <div className="stat-subtext">{totalAttended} of {totalSessions} sessions attended</div>
          </div>
        </div>

        {/* Card 2: Mandatory ESA Threshold */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Mandatory ESA Threshold</span>
              <span className="stat-badge">Minimum Req</span>
            </div>
            <div className="stat-value">{minThreshold}%</div>
            <div className="stat-subtext">Faculty Handbook Regulation 8.3</div>
          </div>
        </div>

        {/* Card 3: Missed Lectures & Exam Standing */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">Missed Lectures Log</span>
              <span className="stat-badge">{totalMissedCount} Recorded</span>
            </div>
            <div className="stat-value">{isOverallEligible ? 'Satisfied (87%)' : 'Action Required'}</div>
            <div className="stat-subtext">
              <button
                type="button"
                onClick={handleOpenMissedOnly}
                style={{ background: 'none', border: 'none', padding: 0, color: '#0f2b54', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem' }}
              >
                Highlight {totalMissedCount} missed sessions on grid →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation Bar */}
      <div className="attendance-tab-nav">
        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          Daily Attendance Sheet
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'subject' ? 'active' : ''}`}
          onClick={() => setActiveTab('subject')}
        >
          Subject-wise Eligibility ({SUBJECT_ATTENDANCE.length} Subjects)
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'datewise' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('datewise');
            setSelectedSubjectFilter('all');
            setSearchQuery('');
          }}
        >
          Date-wise Missed List
          <span className="attendance-tab-count-badge">{totalMissedCount}</span>
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          Official Weekly Timetable
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DAILY ATTENDANCE MATRIX (Date x Subject Grid View)
          Matches the exact layout user sketched in the uploaded image!
          ========================================================================= */}
      {activeTab === 'matrix' && (
        <section className="attendance-matrix-card">
          <div className="attendance-matrix-header">
            <div>
              <h3 className="attendance-matrix-title">
                Daily Lecture Attendance Matrix (Date × Subject)
              </h3>
              <p className="attendance-matrix-subtitle">
                Cross-reference every day with all 9 modules to immediately see which lecture was attended or missed.
              </p>
            </div>

            {/* Filter controls: Hover/Click Dropdowns (Text only, no icons) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 1. Period Filter Dropdown */}
              <div
                className={`attendance-dropdown ${dropdownOpen ? 'open' : ''}`}
                onMouseEnter={handlePeriodMouseEnter}
                onMouseLeave={handlePeriodMouseLeave}
              >
                <button
                  type="button"
                  className="attendance-dropdown-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <span>Period: <strong>{getPeriodLabel()}</strong></span>
                  <span className="attendance-dropdown-arrow">▼</span>
                </button>

                {/* Dropdown Menu Options */}
                <div
                  className="attendance-dropdown-menu"
                  onMouseEnter={handlePeriodMouseEnter}
                  onMouseLeave={handlePeriodMouseLeave}
                >
                  <div style={{ padding: '6px 16px 4px 16px', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Time Period
                  </div>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1week' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('1week'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('1week'); setDropdownOpen(false); }}
                  >
                    <span>1 Week (Current Week: Mon - Fri)</span>
                    <span className="attendance-dropdown-badge">5 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '2weeks' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('2weeks'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('2weeks'); setDropdownOpen(false); }}
                  >
                    <span>2 Weeks (Last 2 Weeks)</span>
                    <span className="attendance-dropdown-badge">10 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '3weeks' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('3weeks'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('3weeks'); setDropdownOpen(false); }}
                  >
                    <span>3 Weeks (Last 3 Weeks)</span>
                    <span className="attendance-dropdown-badge">15 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1month' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('1month'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('1month'); setDropdownOpen(false); }}
                  >
                    <span>1 Month (Oct - Nov Weeks)</span>
                    <span className="attendance-dropdown-badge">15 Days</span>
                  </button>

                  <div className="attendance-dropdown-divider" />

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === 'kickoff' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('kickoff'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('kickoff'); setDropdownOpen(false); }}
                  >
                    <span>Kickoff Week (April 2026: Mon - Fri)</span>
                    <span className="attendance-dropdown-badge">5 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === 'all' ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); setMatrixPeriod('all'); setDropdownOpen(false); }}
                    onClick={() => { setMatrixPeriod('all'); setDropdownOpen(false); }}
                  >
                    <span>All Recorded Weeks</span>
                    <span className="attendance-dropdown-badge">20 Days</span>
                  </button>
                </div>
              </div>

              {matrixPeriod !== '1week' && (
                <button
                  type="button"
                  className="attendance-pill-btn"
                  onClick={() => setMatrixPeriod('1week')}
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
                >
                  Reset to Current Week
                </button>
              )}

              <button
                type="button"
                onClick={onNavigateMedical || (() => alert('Redirecting to Medical Requests section...'))}
                className="btn btn-primary btn-sm"
              >
                Submit Medical
              </button>
            </div>
          </div>

          {/* Legend Row */}
          <div className="matrix-legend-row">
            <span style={{ fontWeight: 600, color: '#475569' }}>Legend:</span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-attend">Attend</span> Attended
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-missed">Missed</span> Missed Lecture
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-cell-empty">—</span> No lecture scheduled
            </span>
            <span style={{ marginLeft: 'auto', fontWeight: 500, color: '#64748b', fontSize: '0.74rem' }}>
              Showing {filteredMatrixRows.length} of {MATRIX_DAILY_ROWS.length} dates
            </span>
          </div>

          {/* Responsive Matrix Table Container */}
          <div className="attendance-matrix-table-wrap">
            <table className="attendance-matrix-table">
              <thead>
                <tr>
                  <th className="matrix-corner-th">
                    <span className="matrix-th-title">DATE</span>
                    <span className="matrix-th-sub">Day of Week</span>
                  </th>
                  {activeMatrixColumns.map((col) => (
                    <th key={col.code}>
                      <span className="matrix-th-title">{col.code}</span>
                      <span className="matrix-th-sub">{col.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMatrixRows.length > 0 ? (
                  filteredMatrixRows.map((row) => (
                    <tr key={row.date}>
                      <td className="matrix-date-cell">
                        {row.date}
                        <span className="matrix-date-day">{row.day}</span>
                      </td>
                      {activeMatrixColumns.map((col) => {
                        const status = row.records[col.code];
                        if (status === 'Attend') {
                          return (
                            <td key={col.code}>
                              <span className="matrix-badge-attend">
                                Attend
                              </span>
                            </td>
                          );
                        }
                        if (status === 'Missed') {
                          return (
                            <td key={col.code}>
                              <button
                                type="button"
                                className="matrix-badge-missed"
                                onClick={onNavigateMedical || (() => alert(`Submitting medical excuse for ${col.code} on ${row.date}`))}
                                title={`Missed ${col.code} on ${row.date}. Click to submit medical excuse`}
                              >
                                Missed
                              </button>
                            </td>
                          );
                        }
                        return (
                          <td key={col.code}>
                            <span className="matrix-cell-empty">—</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No lecture dates found matching the selected filter ({getPeriodLabel()}{onlyMissedDates ? ' + Missed Only' : ''}).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: Subject-wise Attendance & Eligibility Table
          ========================================================================= */}
      {activeTab === 'subject' && (
        <section className="seu-card">
          <div className="seu-card-header">
            <h3 className="seu-card-title">
              Semester II Subjects — Attendance & ESA Eligibility
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="btn btn-sm"
                style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                View Date Matrix
              </button>
              <button
                type="button"
                onClick={onNavigateMedical || (() => alert('Redirecting to Medical Requests section...'))}
                className="btn btn-primary btn-sm"
              >
                Submit Medical Excuse
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="seu-table">
              <thead>
                <tr>
                  <th>SUBJECT CODE</th>
                  <th>COURSE TITLE & LECTURER IN-CHARGE</th>
                  <th>TYPE</th>
                  <th>THEORY ATTENDANCE</th>
                  <th>PRACTICAL ATTENDANCE</th>
                  <th>TOTAL ATTENDED</th>
                  <th>ATTENDANCE %</th>
                  <th>ESA STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECT_ATTENDANCE.map((item) => (
                  <tr key={item.code}>
                    <td className="course-code-cell">{item.code}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.lecturer}</div>
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'Theory' ? 'badge-primary' : 'badge-accent'}`} style={{ backgroundColor: item.type === 'Theory' ? '#eff6ff' : '#f5f3ff', color: item.type === 'Theory' ? '#1d4ed8' : '#6d28d9' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      {item.theoryTotal > 0 ? (
                        <span>{item.theoryAttended} / {item.theoryTotal} ({Math.round((item.theoryAttended / item.theoryTotal) * 100)}%)</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      {item.practicalTotal > 0 ? (
                        <span>{item.practicalAttended} / {item.practicalTotal} ({Math.round((item.practicalAttended / item.practicalTotal) * 100)}%)</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td><strong>{item.attendedSessions}</strong> / {item.totalSessions}</td>
                    <td>
                      <div className="attendance-progress-wrapper">
                        <div className="attendance-progress-bar-bg">
                          <div
                            className={item.isEligible ? 'attendance-progress-fill-success' : 'attendance-progress-fill-danger'}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="attendance-progress-text">{item.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.isEligible ? 'badge-success' : 'badge-danger'}`}>
                        {item.isEligible ? 'Eligible (≥ 80%)' : 'Ineligible (< 80%)'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSelectSubjectDates(item.code)}
                        className="btn btn-sm"
                        style={{ fontSize: '0.74rem', padding: '3px 8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f2b54', fontWeight: 600 }}
                        title="View dates and missed lectures for this subject"
                      >
                        View Dates {item.missedCount > 0 ? `(${item.missedCount} Missed)` : ''}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 3: Date-wise Attendance & Missed Lecture Log
          ========================================================================= */}
      {activeTab === 'datewise' && (
        <section className="seu-card">
          <div className="seu-card-header">
            <div>
              <h3 className="seu-card-title">
                Date-wise Missed Lectures Log
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Review all missed lecture and practical sessions requiring medical excuse submission.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateMedical || (() => alert('Redirecting to Medical Requests section...'))}
              className="btn btn-primary btn-sm"
            >
              Submit Medical Excuse
            </button>
          </div>

          {/* Filter Row: Subject dropdown & search */}
          <div className="attendance-filter-row">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              Showing {filteredSessions.length} Missed Lecture{filteredSessions.length === 1 ? '' : 's'}
            </div>

            <div className="attendance-filter-controls">
              {/* Subject selector */}
              <select
                className="attendance-select"
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects (9 Modules)</option>
                {TIMETABLE_COURSES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>

              {/* Search text box */}
              <input
                type="text"
                className="attendance-search-input"
                placeholder="Search by date, subject, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {(selectedSubjectFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}
                  onClick={() => {
                    setSelectedSubjectFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Date-wise Sessions Table */}
          <div className="table-responsive">
            <table className="seu-table">
              <thead>
                <tr>
                  <th>DATE & DAY</th>
                  <th>TIME SLOT</th>
                  <th>SUBJECT CODE</th>
                  <th>COURSE TITLE</th>
                  <th>VENUE / LAB</th>
                  <th>LECTURER</th>
                  <th>SESSION TYPE</th>
                  <th>ATTENDANCE STATUS</th>
                  <th>ACTION / EXCUSE</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      style={session.status === 'missed' ? { backgroundColor: '#fef2f2' } : {}}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{session.date}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{session.day}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                        {session.time}
                      </td>
                      <td className="course-code-cell">{session.code}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{session.title}</div>
                        {session.reason && (
                          <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '2px' }}>
                            Note: {session.reason}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                          {session.venue}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#475569' }}>
                        {session.lecturer}
                      </td>
                      <td>
                        <span className={`badge ${session.type === 'Theory' ? 'badge-primary' : 'badge-accent'}`} style={{ backgroundColor: session.type === 'Theory' ? '#eff6ff' : '#f5f3ff', color: session.type === 'Theory' ? '#1d4ed8' : '#6d28d9' }}>
                          {session.type}
                        </span>
                      </td>
                      <td>
                        {session.status === 'attended' ? (
                          <span className="badge badge-success" style={{ fontWeight: 600 }}>
                            Attended
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontWeight: 600 }}>
                            Missed
                          </span>
                        )}
                      </td>
                      <td>
                        {session.status === 'missed' ? (
                          <button
                            type="button"
                            onClick={onNavigateMedical || (() => alert('Opening Medical Excuse Form for ' + session.code + ' on ' + session.date))}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#0f2b54', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px' }}
                            title="Submit medical certificate for this missed date"
                          >
                            Submit Medical
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No attendance sessions found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 4: Official Weekly Timetable (Yr 2 - Sem II) matching provided screenshot
          ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="timetable-card">
          {/* Header Banner matching Department Document */}
          <div className="timetable-header-banner">
            <h2 className="timetable-header-title">Timetable</h2>
            <p className="timetable-header-sub">
              Department of Information and Communication Technology
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.80rem', fontWeight: 700, color: '#475569' }}>
              Academic Batch {user?.batch || '2025/2026'} ({cur.semester})
            </p>
          </div>

          {/* Timetable Weekly Grid */}
          <div className="table-responsive">
            <table className="timetable-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>Time</th>
                  <th style={{ width: '17%' }}>Monday</th>
                  <th style={{ width: '17%' }}>Tuesday</th>
                  <th style={{ width: '18%' }}>Wednesday</th>
                  <th style={{ width: '17%' }}>Thursday</th>
                  <th style={{ width: '17%' }}>Friday</th>
                </tr>
              </thead>
              {cur.semester !== 'Year 2 Semester 2' ? (
                <tbody>
                  {[
                    '8.30 - 9.30',
                    '9.30 - 10.30',
                    '10.30 - 11.30',
                    '11.30 - 12.30',
                    'LUNCH',
                    '1.30 - 2.30',
                    '2.30 - 3.30',
                    '3.30 - 4.30',
                    '4.30 - 5.30'
                  ].map((tSlot) => {
                    if (tSlot === 'LUNCH') {
                      return (
                        <tr key="lunch" className="timetable-lunch-row">
                          <td className="timetable-time-cell">12.30 - 1.30</td>
                          <td colSpan="5">LUNCH BREAK</td>
                        </tr>
                      );
                    }
                    const startH = tSlot.split(' - ')[0];
                    return (
                      <tr key={tSlot}>
                        <td className="timetable-time-cell">{tSlot}</td>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                          const slotList = (liveTimetableSlots && liveTimetableSlots.length > 0) ? liveTimetableSlots : (cur.timetableSlots || []);
                          const slot = slotList.find((s) => {
                            if (s.day !== day) return false;
                            const slotTimeStr = s.timeSlot || s.time || '';
                            if (slotTimeStr.includes(startH)) return true;
                            if (startH === '9.30' && slotTimeStr.startsWith('8.30')) return true;
                            if (startH === '10.30' && (slotTimeStr.startsWith('8.30') || slotTimeStr.startsWith('9.30'))) return true;
                            if (startH === '2.30' && slotTimeStr.startsWith('1.30')) return true;
                            if (startH === '3.30' && slotTimeStr.startsWith('1.30')) return true;
                            return false;
                          });
                          return (
                            <td key={day} className="timetable-slot-cell">
                              {slot ? (
                                <>
                                  <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>{slot.code}</span>
                                  <span className="timetable-venue-badge">({slot.venue || slot.title})</span>
                                </>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                {/* 8.30 - 9.30 */}
                <tr>
                  <td className="timetable-time-cell">8.30 - 9.30</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">UCT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22022</span>
                    <span className="timetable-venue-badge">(LH10)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>UCT 22011</span>
                    <span className="timetable-venue-badge">(LH5)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">UCT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* 9.30 - 10.30 */}
                <tr>
                  <td className="timetable-time-cell">9.30 - 10.30</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">UCT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22022</span>
                    <span className="timetable-venue-badge">(LH10)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>SWT 22012</span>
                    <span className="timetable-venue-badge">(LH5)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">UCT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* 10.30 - 11.30 */}
                <tr>
                  <td className="timetable-time-cell">10.30 - 11.30</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22032</span>
                    <span className="timetable-venue-badge">(SWT)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CMS 22012</span>
                    <span className="timetable-venue-badge">(LH5)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>SWT 22012</span>
                    <span className="timetable-venue-badge">(LH5)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">CIS 22042</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* 11.30 - 12.30 */}
                <tr>
                  <td className="timetable-time-cell">11.30 - 12.30</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22032</span>
                    <span className="timetable-venue-badge">(SWT)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CMS 22012</span>
                    <span className="timetable-venue-badge">(LH5)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">CIS 22042</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* LUNCH BREAK */}
                <tr className="timetable-lunch-row">
                  <td className="timetable-time-cell">12.30 - 1.30</td>
                  <td colSpan="5">LUNCH BREAK</td>
                </tr>

                {/* 1.30 - 2.30 */}
                <tr>
                  <td className="timetable-time-cell">1.30 - 2.30</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">CIS 22042</span>
                    <span className="timetable-venue-badge">(MAC)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                </tr>

                {/* 2.30 - 3.30 */}
                <tr>
                  <td className="timetable-time-cell">2.30 - 3.30</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22012</span>
                    <span className="timetable-venue-badge">(LH10)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">CIS 22042</span>
                    <span className="timetable-venue-badge">(MAC)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* 3.30 - 4.30 */}
                <tr>
                  <td className="timetable-time-cell">3.30 - 4.30</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>CIS 22012</span>
                    <span className="timetable-venue-badge">(LH10)</span>
                  </td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>

                {/* 4.30 - 5.30 */}
                <tr>
                  <td className="timetable-time-cell">4.30 - 5.30</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">—</td>
                  <td className="timetable-slot-cell">
                    <span className="timetable-course-badge">SWT 22022</span>
                    <span className="timetable-venue-badge">(CIS)</span>
                  </td>
                </tr>
              </tbody>
              )}
            </table>
          </div>

          {/* NOTE: Venue Legend */}
          <div className="timetable-legend-box">
            <span className="timetable-legend-title">NOTE:</span>
            <strong>LH10</strong> - Lecture Hall 10; <strong>LH5</strong> - Lecture Hall 5; <strong>LH4</strong> - Lecture Hall 4; <strong>SWT</strong> - Software Technologies Laboratory; <strong>NST</strong> - Cisco Academy Laboratory; <strong>MAL</strong> - Mobile Application Laboratory; <strong>CIS</strong> - Computing Information System Laboratory; <strong>CS</strong> - Cezeri Studio; <strong>WNT</strong> - Wireless Network Technologies Laboratory
          </div>

          {/* Course & Lecturer In-Charge Directory Table */}
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Subject Code, Course Title & Lecturer In-Charge
            </h4>
            <div className="table-responsive">
              <table className="timetable-directory-table">
                <thead>
                  <tr>
                    <th style={{ width: '8%', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%' }}>SUBJECT CODE</th>
                    <th style={{ width: '47%' }}>SUBJECT TITLE</th>
                    <th style={{ width: '25%' }}>LECTURER IN-CHARGE</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTimetableCourses.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.code}</td>
                      <td>{item.title}</td>
                      <td style={{ fontWeight: 600 }}>{item.lecturer || 'Faculty Lecturer'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Faculty Regulation Card */}
      <section className="attendance-regulation-card">
        <div className="attendance-regulation-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <p className="attendance-regulation-text">
          <strong>Faculty of Technology Examination Regulation:</strong> Under Section 8.3 of the Technology Faculty Handbook, an undergraduate candidate must secure not less than <strong>80% attendance</strong> in both theory lectures and laboratory practical sessions. Students with attendance between 60% and 79% may apply for special consideration by submitting an endorsed medical certificate within 7 working days of the missed lecture.
        </p>
      </section>
    </div>
  );
}
