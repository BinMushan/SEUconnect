import React from 'react';

/**
 * ClassCard component
 * Renders today's lecture / lab timetable with real-time status calculation.
 * Real-time status tags: Upcoming, Ongoing, or Completed based on system clock.
 */
export default function ClassCard({ session, onViewClass }) {
  const getSessionStatus = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startMinutes = (session.startHour || 0) * 60 + (session.startMinute || 0);
    const endMinutes = (session.endHour || 0) * 60 + (session.endMinute || 0);

    if (currentMinutes < startMinutes) {
      return { label: 'Upcoming', cls: 'status-upcoming' };
    } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { label: 'Ongoing Now', cls: 'status-ongoing' };
    } else {
      return { label: 'Completed', cls: 'status-completed' };
    }
  };

  const status = getSessionStatus();

  return (
    <div className={`lec-class-card ${status.cls}`}>
      <div className="lec-class-top">
        <span className="lec-class-code-badge">{session.subjectCode}</span>
        <span className={`lec-class-status-tag ${status.cls}`}>
          <span className="status-dot"></span>
          {status.label}
        </span>
      </div>

      <h4 className="lec-class-title">{session.subjectName}</h4>

      <div className="lec-class-meta-grid">
        <div className="lec-class-meta-item">
          <span className="meta-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <span>{session.timeslot}</span>
        </div>

        <div className="lec-class-meta-item">
          <span className="meta-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span>{session.location}</span>
        </div>

        <div className="lec-class-meta-item">
          <span className="meta-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span>{session.enrolledCount} Enrolled Students</span>
        </div>

        <div className="lec-class-meta-item">
          <span className="meta-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </span>
          <span>{session.sessionType || 'Lecture Class'}</span>
        </div>

        {session.batch && (
          <div className="lec-class-meta-item">
            <span className="meta-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span>Batch {session.batch}</span>
          </div>
        )}
      </div>

      <div className="lec-class-footer">
        <button
          type="button"
          className="lec-btn-view-class"
          onClick={() => onViewClass && onViewClass(session.subjectCode)}
        >
          <span>View Class Attendance</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

