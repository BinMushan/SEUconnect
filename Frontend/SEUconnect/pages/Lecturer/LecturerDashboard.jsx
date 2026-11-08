import React, { useMemo } from 'react';
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
  subjects = INITIAL_SUBJECTS,
  onNavigateModule,
  onShowToast,
  assignedEcaCount = INITIAL_STATS.assignedECA ?? 3,
  ecaApplications = [],
}) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];
  const isFreshLecturer = availableSubjects.length === 0;

  const totalStudentsCount = isFreshLecturer
    ? 0
    : availableSubjects === INITIAL_SUBJECTS
    ? INITIAL_STATS.totalStudents
    : availableSubjects.reduce((acc, s) => acc + (s.studentsCount || 45), 0);

  const assignedSubjectsCount = availableSubjects.length;

  const todayClassesList = useMemo(() => {
    if (isFreshLecturer) return [];
    if (availableSubjects === INITIAL_SUBJECTS) return INITIAL_TODAY_CLASSES;

    return availableSubjects.slice(0, 3).map((sub, idx) => ({
      id: `cls-dyn-${sub.code}-${idx}`,
      subjectCode: sub.code,
      subjectName: sub.name,
      timeslot: idx === 0 ? '08:30 AM - 10:30 AM' : idx === 1 ? '10:30 AM - 12:30 PM' : '02:00 PM - 04:00 PM',
      startHour: idx === 0 ? 8 : idx === 1 ? 10 : 14,
      startMinute: idx === 0 ? 30 : idx === 1 ? 30 : 0,
      endHour: idx === 0 ? 10 : idx === 1 ? 12 : 16,
      endMinute: idx === 0 ? 30 : idx === 1 ? 30 : 0,
      location: sub.classroom || (idx % 2 === 0 ? 'LT-01 (Lecture Theatre 1)' : 'ICT Lab 02'),
      enrolledCount: sub.studentsCount || 45,
      sessionType: sub.type === 'Practical' ? 'Hands-on Lab Session' : 'Lecture & Discussion',
      batch: sub.batch || '2022/2023',
    }));
  }, [availableSubjects, isFreshLecturer]);

  const ecaPendingCount = typeof assignedEcaCount === 'number' ? assignedEcaCount : (INITIAL_STATS.assignedECA ?? 3);

  return (
    <div className="lec-dashboard-content">
      {/* 1. 6 Key Academic Stat Cards */}
      <div className="lec-stats-section">
        <div className="lec-section-title-row">
          <h3 className="lec-section-heading">Key Academic Indicators</h3>
          <span className="lec-semester-badge">Semester 2025/2026 • Term II</span>
        </div>

        <div className="lec-stats-grid-6">
          {/* 1. Total Students */}
          <StatCard
            title="Total Students"
            value={totalStudentsCount}
            subtext={isFreshLecturer ? 'No cohorts enrolled' : INITIAL_STATS.totalStudentsGrowth}
            badgeText={isFreshLecturer ? '0 Enrolled' : 'Enrolled'}
            badgeType={isFreshLecturer ? 'info' : 'success'}
            colorScheme="blue"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            onClick={() => onNavigateModule('enrollment')}
          />

          {/* 2. Assigned Subjects */}
          <StatCard
            title="Assigned Subjects"
            value={assignedSubjectsCount}
            subtext={isFreshLecturer ? 'Awaiting HOD allocation' : INITIAL_STATS.assignedSubjectsSub}
            badgeText={isFreshLecturer ? 'Pending' : 'Active'}
            badgeType={isFreshLecturer ? 'warning' : 'primary'}
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
            value={todayClassesList.length}
            subtext={isFreshLecturer ? 'No sessions scheduled' : INITIAL_STATS.todayClassesSub}
            badgeText={todayClassesList.length > 0 ? 'Scheduled' : 'None Today'}
            badgeType={todayClassesList.length > 0 ? 'info' : 'warning'}
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

      {/* 2. Assigned ECA Applications (Examination Branch Forwarded) */}
      <div className="lec-assigned-eca-section">
        <div className="lec-assigned-eca-card">
          <div className="lec-assigned-eca-left">
            <div className="lec-assigned-eca-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>
            <div className="lec-assigned-eca-info">
              <div className="lec-assigned-eca-title-row">
                <h4 className="lec-assigned-eca-title">Assigned ECA Applications</h4>
                <span className={`lec-eca-badge ${ecaPendingCount > 0 ? 'badge-pending' : 'badge-completed'}`}>
                  {ecaPendingCount} {ecaPendingCount === 1 ? 'Application' : 'Applications'} Pending Review
                </span>
              </div>
              <p className="lec-assigned-eca-desc">
                Continuous Assessment (ECA) repeat applications forwarded by the Examination Branch for course lecturer verification and recommendation before Head of Department (HOD) final approval.
              </p>
              <div className="lec-assigned-eca-meta-tags">
                <span className="lec-eca-meta-tag">
                  Assigned Modules: {availableSubjects.length > 0 ? availableSubjects.map((s) => s.code).join(', ') : 'None'}
                </span>
                <span className="lec-eca-meta-tag">Workflow Step 4 of 5</span>
              </div>
            </div>
          </div>
          <div className="lec-assigned-eca-right">
            <button
              type="button"
              className="lec-btn-eca-check"
              onClick={() => {
                if (onShowToast) onShowToast('Navigating to Assigned ECA Applications Review', 'info');
                onNavigateModule('eca-review');
              }}
            >
              Check
            </button>
          </div>
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
          {todayClassesList.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px', gridColumn: '1 / -1' }}>
              No classes scheduled for today.
            </div>
          ) : (
            todayClassesList.map((session) => (
              <ClassCard
                key={session.id}
                session={session}
                onViewClass={(subjectCode) => {
                  if (onShowToast) onShowToast(`Navigating to attendance for ${subjectCode}`, 'info');
                  onNavigateModule('attendance', { subjectCode });
                }}
              />
            ))
          )}
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
            {availableSubjects.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ margin: 0, fontWeight: 500 }}>No course modules allocated yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Modules allocated by your Head of Department (HOD) will appear here.</p>
              </div>
            ) : (
              availableSubjects.map((sub) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

