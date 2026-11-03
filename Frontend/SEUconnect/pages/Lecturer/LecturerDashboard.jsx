import React from 'react';
import StatCard from './components/StatCard.jsx';
import ClassCard from './components/ClassCard.jsx';
import { INITIAL_STATS, INITIAL_TODAY_CLASSES, INITIAL_SUBJECTS } from './lecturerMockData.js';

/**
 * LecturerDashboard component
 * Academic Overview Dashboard with time-sensitive greeting, full date,
 * 6 Key Academic Stat Cards, Today's Timetable with real-time tags, and quick actions.
 */
export default function LecturerDashboard({
  user,
  onNavigateModule,
  onShowToast,
}) {
  // Time-sensitive greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lecturerName = user?.name || 'Dr. K. Perera';

  return (
    <div className="lec-dashboard-content">
      {/* 1. Time-Sensitive Greeting Banner */}
      <div className="lec-welcome-banner">
        <div className="lec-welcome-left">
          <div className="lec-date-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="lec-welcome-title">
            {getGreeting()}, {lecturerName}
          </h1>
          <p className="lec-welcome-desc">
            Welcome to the SEUconnect Academic Instruction Portal. Here is your operational overview for today.
          </p>
        </div>

        <div className="lec-welcome-quick-actions">
          <button
            type="button"
            className="lec-banner-btn-primary"
            onClick={() => onNavigateModule('attendance')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            Mark Today's Attendance
          </button>
          <button
            type="button"
            className="lec-banner-btn-secondary"
            onClick={() => onNavigateModule('announcements')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Announcement
          </button>
        </div>
      </div>

      {/* 2. 6 Key Academic Stat Cards */}
      <div className="lec-stats-section">
        <div className="lec-section-title-row">
          <h3 className="lec-section-heading">Key Academic Indicators</h3>
          <span className="lec-semester-badge">Semester 2025/2026 • Term II</span>
        </div>

        <div className="lec-stats-grid-6">
          {/* 1. Total Students */}
          <StatCard
            title="Total Students"
            value={INITIAL_STATS.totalStudents}
            subtext={INITIAL_STATS.totalStudentsGrowth}
            badgeText="Enrolled"
            badgeType="success"
            colorScheme="blue"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            onClick={() => onNavigateModule('subjects')}
          />

          {/* 2. Assigned Subjects */}
          <StatCard
            title="Assigned Subjects"
            value={INITIAL_STATS.assignedSubjects}
            subtext={INITIAL_STATS.assignedSubjectsSub}
            badgeText="Active"
            badgeType="primary"
            colorScheme="indigo"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            onClick={() => onNavigateModule('subjects')}
          />

          {/* 3. Today's Classes */}
          <StatCard
            title="Today's Classes"
            value={INITIAL_STATS.todayClasses}
            subtext={INITIAL_STATS.todayClassesSub}
            badgeText="Scheduled"
            badgeType="info"
            colorScheme="cyan"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            onClick={() => onNavigateModule('attendance')}
          />

          {/* 4. Pending Attendance */}
          <StatCard
            title="Pending Attendance"
            value={INITIAL_STATS.pendingAttendance}
            subtext={INITIAL_STATS.pendingAttendanceSub}
            badgeText="Needs Action"
            badgeType="warning"
            colorScheme="amber"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <line x1="9" y1="11" x2="15" y2="11" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
            onClick={() => onNavigateModule('attendance')}
          />

          {/* 5. Medical Requests */}
          <StatCard
            title="Medical Requests"
            value={INITIAL_STATS.medicalRequests}
            subtext={INITIAL_STATS.medicalRequestsSub}
            badgeText="Review"
            badgeType="danger"
            colorScheme="rose"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
            onClick={() => onNavigateModule('medical-verification')}
          />

          {/* 6. Pending CA / ESA */}
          <StatCard
            title="Pending CA / ESA"
            value={INITIAL_STATS.pendingCAESA}
            subtext={INITIAL_STATS.pendingCAESASub}
            badgeText="Deadline"
            badgeType="purple"
            colorScheme="purple"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            }
            onClick={() => onNavigateModule('ca-esa')}
          />
        </div>
      </div>

      {/* 3. Today's Timetable / Classes Cards */}
      <div className="lec-classes-section">
        <div className="lec-section-title-row">
          <div>
            <h3 className="lec-section-heading">Today's Class Schedule</h3>
            <p className="lec-section-sub">
              Sessions scheduled for today across assigned Faculty of Technology lecture halls. Status auto-updates based on current time.
            </p>
          </div>
          <button
            type="button"
            className="lec-link-btn"
            onClick={() => onNavigateModule('attendance')}
          >
            Go to Full Attendance Roster →
          </button>
        </div>

        <div className="lec-classes-grid">
          {INITIAL_TODAY_CLASSES.map((session) => (
            <ClassCard
              key={session.id}
              session={session}
              onViewClass={(subjectCode) => {
                if (onShowToast) onShowToast(`Navigating to attendance for ${subjectCode}`, 'info');
                onNavigateModule('attendance', { subjectCode });
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Subject Quick Summary Row */}
      <div className="lec-quick-summary-section">
        <div className="lec-summary-card">
          <div className="lec-summary-card-header">
            <h4 className="lec-summary-title">Assigned Course Modules at a Glance</h4>
            <button
              type="button"
              className="lec-link-btn"
              onClick={() => onNavigateModule('subjects')}
            >
              View All Modules →
            </button>
          </div>
          <div className="lec-summary-modules-list">
            {INITIAL_SUBJECTS.map((sub) => (
              <div key={sub.code} className="lec-summary-item">
                <div className="lec-summary-item-left">
                  <span className="lec-summary-code">{sub.code}</span>
                  <div>
                    <div className="lec-summary-name">{sub.name}</div>
                    <div className="lec-summary-meta">
                      {sub.batch ? `Batch ${sub.batch} • ` : ''}{sub.semester} • {sub.classroom} • {sub.studentsCount} Students
                    </div>
                  </div>
                </div>
                <div className="lec-summary-item-right">
                  <div className="lec-summary-rate-pill">
                    Avg Attendance: <strong>{sub.attendanceRate}%</strong>
                  </div>
                  <button
                    type="button"
                    className="lec-summary-action-btn"
                    onClick={() => onNavigateModule('attendance', { subjectCode: sub.code })}
                  >
                    Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

