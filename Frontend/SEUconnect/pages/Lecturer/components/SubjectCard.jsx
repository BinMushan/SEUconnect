import React from 'react';

/**
 * SubjectCard component
 * Card representation of an assigned academic module with direct attendance,
 * assessment marks, and student details shortcuts.
 */
export default function SubjectCard({
  subject,
  onMarkAttendance,
  onViewAssessments,
  onViewStudentDetails,
}) {
  const batchValue = subject.batch || '2021/2022';
  const batchPillLabel = String(batchValue).startsWith('Batch')
    ? batchValue
    : `Batch ${batchValue}`;

  return (
    <div className="lec-subject-card">
      <div className="lec-subject-top">
        <div className="lec-subject-badge-group">
          <span className="lec-subject-code">{subject.code}</span>
          <span className="lec-subject-sem-pill">{subject.semester}</span>
          <span className="lec-subject-batch-pill">{batchPillLabel}</span>
        </div>
        <span className="lec-subject-credits-badge">{subject.credits || 3} Credits</span>
      </div>

      <h3 className="lec-subject-name">{subject.name}</h3>

      <div className="lec-subject-details">
        <div className="lec-detail-row">
          <span className="detail-label">Batch:</span>
          <span className="detail-value highlight">{batchValue}</span>
        </div>
        <div className="lec-detail-row">
          <span className="detail-label">Schedule:</span>
          <span className="detail-value">{subject.schedule}</span>
        </div>
        <div className="lec-detail-row">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{subject.classroom}</span>
        </div>
        <div className="lec-detail-row">
          <span className="detail-label">Enrolled:</span>
          <span className="detail-value highlight">{subject.studentsCount} Students</span>
        </div>
        <div className="lec-detail-row">
          <span className="detail-label">Avg Attendance:</span>
          <span className="detail-value text-emerald">{subject.attendanceRate}%</span>
        </div>
      </div>

      <div className="lec-subject-progress-wrap">
        <div className="lec-progress-label">
          <span>Overall Attendance Standing</span>
          <span>{subject.attendanceRate}%</span>
        </div>
        <div className="lec-progress-track">
          <div
            className="lec-progress-fill"
            style={{
              width: `${subject.attendanceRate}%`,
              backgroundColor:
                subject.attendanceRate >= 80
                  ? '#10b981'
                  : subject.attendanceRate >= 70
                  ? '#f59e0b'
                  : '#ef4444',
            }}
          />
        </div>
      </div>

      <div className="lec-subject-actions">
        <button
          type="button"
          className="lec-btn-subject-attendance"
          onClick={() => onMarkAttendance && onMarkAttendance(subject.code)}
          title={`Mark attendance for ${subject.code}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="m9 14 2 2 4-4" />
          </svg>
          Mark Attendance
        </button>

        {onViewAssessments && (
          <button
            type="button"
            className="lec-btn-subject-assessments"
            onClick={() => onViewAssessments(subject.code)}
            title={`View CA / ESA assessments for ${subject.code}`}
          >
            Assessments (CA/ESA)
          </button>
        )}

        {onViewStudentDetails && (
          <button
            type="button"
            className="lec-btn-subject-students"
            onClick={() => onViewStudentDetails(subject.code)}
            title={`View registered student details for ${subject.code}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Student Details
          </button>
        )}
      </div>
    </div>
  );
}
