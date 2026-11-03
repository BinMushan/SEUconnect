import React, { useState } from 'react';
import './attendance.css';

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

// 3. Matrix Rows (Every day with lecture attendance status across the 9 modules)
const MATRIX_DAILY_ROWS = [
  {
    date: '2026/11/03',
    day: 'Tuesday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Attend'
    }
  },
  {
    date: '2026/11/02',
    day: 'Monday',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Missed'
    }
  },
  {
    date: '2026/10/30',
    day: 'Friday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/10/29',
    day: 'Thursday',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/10/28',
    day: 'Wednesday',
    records: {
      'CIS 22022': 'Missed',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/10/27',
    day: 'Tuesday',
    records: {
      'UCT 22022': 'Missed',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Missed'
    }
  },
  {
    date: '2026/10/26',
    day: 'Monday',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/10/23',
    day: 'Friday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22042': 'Missed',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/10/22',
    day: 'Thursday',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/10/21',
    day: 'Wednesday',
    records: {
      'CIS 22022': 'Attend',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/10/20',
    day: 'Tuesday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Missed'
    }
  },
  {
    date: '2026/10/19',
    day: 'Monday',
    records: {
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  // Dates from user reference diagram
  {
    date: '2026/04/06',
    day: 'Monday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22032': 'Attend',
      'SWT 22022': 'Attend'
    }
  },
  {
    date: '2026/04/07',
    day: 'Tuesday',
    records: {
      'UCT 22022': 'Attend',
      'CIS 22012': 'Attend',
      'CMS 22012': 'Attend'
    }
  },
  {
    date: '2026/04/08',
    day: 'Wednesday',
    records: {
      'CIS 22012': 'Attend',
      'CIS 22022': 'Attend',
      'CIS 22042': 'Attend'
    }
  },
  {
    date: '2026/04/09',
    day: 'Thursday',
    records: {
      'UCT 22011': 'Attend',
      'SWT 22012': 'Attend'
    }
  },
  {
    date: '2026/04/10',
    day: 'Friday',
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

export default function Attendance({ onNavigateMedical }) {
  // Default tab set to the Daily Attendance Grid (Date x Subject Matrix) requested by the user
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'subject' | 'datewise' | 'timetable'
  const [matrixPeriod, setMatrixPeriod] = useState('all'); // 'all' | '1week' | '2weeks' | '3weeks' | '1month' | 'kickoff'
  const [onlyMissedDates, setOnlyMissedDates] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'missed' | 'attended'
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const overallPercentage = 87;
  const minThreshold = 80;
  const isOverallEligible = overallPercentage >= minThreshold;
  const totalAttended = 88;
  const totalSessions = 101;
  const totalMissedCount = DATE_WISE_SESSIONS.filter((s) => s.status === 'missed').length;

  // Filtered rows for the Daily Attendance Matrix (1 Week, 2 Weeks, 3 Weeks, 1 Month, All)
  const filteredMatrixRows = MATRIX_DAILY_ROWS.filter((row, index) => {
    // 1. Period Filter
    if (matrixPeriod === '1week') {
      if (index >= 5) return false; // Latest 5 lecture days (1 academic week)
    } else if (matrixPeriod === '2weeks') {
      if (index >= 10) return false; // Latest 10 lecture days (2 academic weeks)
    } else if (matrixPeriod === '3weeks') {
      if (index >= 12) return false; // Latest 12 lecture days (3 academic weeks)
    } else if (matrixPeriod === '1month') {
      if (!row.date.startsWith('2026/10') && !row.date.startsWith('2026/11')) return false;
    } else if (matrixPeriod === 'kickoff') {
      if (!row.date.startsWith('2026/04')) return false;
    }

    // 2. Missed Only Filter
    if (onlyMissedDates) {
      const hasMissed = Object.values(row.records).includes('Missed');
      if (!hasMissed) return false;
    }

    return true;
  });

  const getPeriodLabel = () => {
    switch (matrixPeriod) {
      case '1week':
        return '1 Week (Last 7 Days)';
      case '2weeks':
        return '2 Weeks (Last 14 Days)';
      case '3weeks':
        return '3 Weeks (Last 21 Days)';
      case '1month':
        return '1 Month (Last 30 Days)';
      case 'kickoff':
        return 'Kickoff Week (April)';
      default:
        return 'All Recorded Dates';
    }
  };

  // Filtered sessions for the date-wise list
  const filteredSessions = DATE_WISE_SESSIONS.filter((session) => {
    if (statusFilter === 'missed' && session.status !== 'missed') return false;
    if (statusFilter === 'attended' && session.status !== 'attended') return false;
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
    setStatusFilter('all');
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
          <div className="stat-icon-wrapper stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">OVERALL ATTENDANCE</span>
              <span className="stat-badge">{isOverallEligible ? 'Eligible for ESA' : 'Ineligible'}</span>
            </div>
            <div className="stat-value">{overallPercentage}%</div>
            <div className="stat-subtext">{totalAttended} of {totalSessions} sessions attended</div>
          </div>
        </div>

        {/* Card 2: Mandatory ESA Threshold */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">MANDATORY ESA<br />THRESHOLD</span>
              <span className="stat-badge stat-badge-multiline">Minimum<br />Req</span>
            </div>
            <div className="stat-value">{minThreshold}%</div>
            <div className="stat-subtext">Faculty Handbook Regulation 8.3</div>
          </div>
        </div>

        {/* Card 3: Missed Lectures & Exam Standing */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">MISSED LECTURES LOG</span>
              <span className="stat-badge">{totalMissedCount} Recorded</span>
            </div>
            <div className="stat-value">{isOverallEligible ? 'Satisfied (87%)' : 'Action Required'}</div>
            <div className="stat-subtext">
              <button
                type="button"
                onClick={handleOpenMissedOnly}
                style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.80rem' }}
              >
                Highlight {totalMissedCount} missed sessions on grid →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Missed Lecture Alert Banner */}
      <section className="missed-lecture-callout">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.9rem' }}>
            !
          </div>
          <div className="missed-lecture-callout-text">
            <strong>Daily Attendance Tracking:</strong> View which lectures you attended or missed on every single date in the matrix table below. Submit a medical excuse for any missed session to maintain ESA exam eligibility.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleOpenMissedOnly}
            className="btn btn-sm"
            style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontWeight: 600 }}
          >
            🔍 Highlight Missed Dates
          </button>
          <button
            type="button"
            onClick={onNavigateMedical || (() => alert('Redirecting to Medical Requests section...'))}
            className="btn btn-primary btn-sm"
          >
            Submit Medical Certificate
          </button>
        </div>
      </section>

      {/* 4. Tab Navigation Bar */}
      <div className="attendance-tab-nav">
        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          Daily Attendance Sheet (Date × Subject Grid)
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'subject' ? 'active' : ''}`}
          onClick={() => setActiveTab('subject')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Subject-wise Eligibility ({SUBJECT_ATTENDANCE.length} Subjects)
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'datewise' ? 'active' : ''}`}
          onClick={() => setActiveTab('datewise')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Date-wise Attendance & Missed List
          <span className="attendance-tab-count-badge">{totalMissedCount} Missed</span>
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Official Weekly Timetable (Yr 2 - Sem II)
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f2b54" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Daily Lecture Attendance Matrix (Date × Subject)
              </h3>
              <p className="attendance-matrix-subtitle">
                Cross-reference every day with all 9 modules to immediately see which lecture was attended or missed.
              </p>
            </div>

            {/* Filter controls: Hover/Click Dropdown + Quick Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 1. Dropdown Filter with Hover & Click */}
              <div
                className={`attendance-dropdown ${dropdownOpen ? 'open' : ''}`}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="attendance-dropdown-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  title="Hover or click to filter by period: 1 Week, 2 Weeks, 3 Weeks, 1 Month"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>📅 Period: <strong>{getPeriodLabel()}</strong></span>
                  <span className="attendance-dropdown-arrow">▼</span>
                </button>

                {/* Dropdown Menu Options */}
                <div className="attendance-dropdown-menu">
                  <div style={{ padding: '6px 14px 4px 14px', fontSize: '0.70rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Time Frame
                  </div>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1week' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('1week'); setDropdownOpen(false); }}
                  >
                    <span>⚡ 1 Week (Last 7 Days)</span>
                    <span className="attendance-dropdown-badge">5 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '2weeks' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('2weeks'); setDropdownOpen(false); }}
                  >
                    <span>⚡ 2 Weeks (Last 14 Days)</span>
                    <span className="attendance-dropdown-badge">10 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '3weeks' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('3weeks'); setDropdownOpen(false); }}
                  >
                    <span>⚡ 3 Weeks (Last 21 Days)</span>
                    <span className="attendance-dropdown-badge">12 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1month' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('1month'); setDropdownOpen(false); }}
                  >
                    <span>🗓️ 1 Month (Oct - Nov)</span>
                    <span className="attendance-dropdown-badge">12 Days</span>
                  </button>

                  <div className="attendance-dropdown-divider" />

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === 'kickoff' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('kickoff'); setDropdownOpen(false); }}
                  >
                    <span>🌱 Kickoff Week (April 2026)</span>
                    <span className="attendance-dropdown-badge">5 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === 'all' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('all'); setDropdownOpen(false); }}
                  >
                    <span>📋 All Recorded Dates</span>
                    <span className="attendance-dropdown-badge">17 Days</span>
                  </button>
                </div>
              </div>

              {/* 2. Toggle Pill for Missed Lectures */}
              <div className="attendance-filter-pills">
                <button
                  type="button"
                  className={`attendance-pill-btn ${onlyMissedDates ? 'active' : ''}`}
                  onClick={() => setOnlyMissedDates((prev) => !prev)}
                  style={onlyMissedDates ? { backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' } : {}}
                  title="Toggle to view only dates with missed lectures"
                >
                  ⚠️ Dates With Missed Lectures {onlyMissedDates ? '✓' : ''}
                </button>

                {/* Quick Shortcuts for 1 Week / 2 Weeks / 1 Month */}
                <button
                  type="button"
                  className={`attendance-pill-btn ${matrixPeriod === '1week' ? 'active' : ''}`}
                  onClick={() => setMatrixPeriod('1week')}
                >
                  1 Week
                </button>
                <button
                  type="button"
                  className={`attendance-pill-btn ${matrixPeriod === '2weeks' ? 'active' : ''}`}
                  onClick={() => setMatrixPeriod('2weeks')}
                >
                  2 Weeks
                </button>
                <button
                  type="button"
                  className={`attendance-pill-btn ${matrixPeriod === '1month' ? 'active' : ''}`}
                  onClick={() => setMatrixPeriod('1month')}
                >
                  1 Month
                </button>

                {(matrixPeriod !== 'all' || onlyMissedDates) && (
                  <button
                    type="button"
                    className="attendance-pill-btn"
                    onClick={() => { setMatrixPeriod('all'); setOnlyMissedDates(false); }}
                    style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
                    title="Reset to all dates"
                  >
                    ✕ Reset
                  </button>
                )}
              </div>

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
            <span style={{ fontWeight: 700, color: '#0f172a' }}>LEGEND:</span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-attend">✓ Attend</span> Lecture attended
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-missed">✕ Missed</span> Lecture missed (Click to submit excuse)
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-cell-empty">—</span> No lecture scheduled
            </span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#0f2b54', fontSize: '0.74rem' }}>
              Showing <strong>{filteredMatrixRows.length}</strong> of {MATRIX_DAILY_ROWS.length} dates
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
                  {MATRIX_COLUMNS.map((col) => (
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
                      {MATRIX_COLUMNS.map((col) => {
                        const status = row.records[col.code];
                        if (status === 'Attend') {
                          return (
                            <td key={col.code}>
                              <span className="matrix-badge-attend">
                                ✓ Attend
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
                                ✕ Missed
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f2b54" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Semester II Subjects — Attendance & ESA Eligibility
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="btn btn-sm"
                style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                📊 View Date Matrix
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
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>👤 {item.lecturer}</div>
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
                        📅 View Dates {item.missedCount > 0 ? `(${item.missedCount} Missed)` : ''}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f2b54" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Date-wise Lecture Attendance & Missed Session Records
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Each lecture and practical session recorded date-by-date with venue, lecturer, and attendance confirmation.
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

          {/* Filter Row: Quick status pills & subject dropdown & search */}
          <div className="attendance-filter-row">
            <div className="attendance-filter-pills">
              <button
                type="button"
                className={`attendance-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All Sessions ({DATE_WISE_SESSIONS.length})
              </button>
              <button
                type="button"
                className={`attendance-pill-btn ${statusFilter === 'missed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('missed')}
                style={statusFilter === 'missed' ? { backgroundColor: '#dc2626', borderColor: '#dc2626' } : {}}
              >
                ⚠️ Missed Lectures Only ({totalMissedCount})
              </button>
              <button
                type="button"
                className={`attendance-pill-btn ${statusFilter === 'attended' ? 'active' : ''}`}
                onClick={() => setStatusFilter('attended')}
              >
                ✓ Attended Sessions ({DATE_WISE_SESSIONS.length - totalMissedCount})
              </button>
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

              {(selectedSubjectFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}
                  onClick={() => {
                    setSelectedSubjectFilter('all');
                    setStatusFilter('all');
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
                      style={session.status === 'missed' ? { backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{session.date}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{session.day}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                        🕒 {session.time}
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
                          🏛️ {session.venue}
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
                          <span className="badge badge-success" style={{ fontWeight: 700 }}>
                            ✓ Attended
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                            ✕ Missed / Absent
                          </span>
                        )}
                      </td>
                      <td>
                        {session.status === 'missed' ? (
                          <button
                            type="button"
                            onClick={onNavigateMedical || (() => alert('Opening Medical Excuse Form for ' + session.code + ' on ' + session.date))}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px' }}
                            title="Submit medical certificate for this missed date"
                          >
                            + Submit Medical
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Verified ✓</span>
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
              Academic Batch 2022 / 2023 (Yr 2 - Sem II)
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
                  {TIMETABLE_COURSES.map((item) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.id}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.code}</td>
                      <td>{item.title}</td>
                      <td style={{ fontWeight: 600 }}>{item.lecturer}</td>
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
