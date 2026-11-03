import React, { useState } from 'react';

/**
 * AttendanceTable component
 * Renders interactive roster of students with toggleable attendance status.
 */
export default function AttendanceTable({
  students = [],
  onToggleStatus,
  onMarkAllPresent,
  onMarkAllAbsent,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;
  const attendancePercent = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="lec-attendance-table-card">
      <div className="lec-table-header-controls">
        <div className="lec-table-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name or Reg No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="lec-bulk-actions">
          <button
            type="button"
            className="lec-btn-bulk-present"
            onClick={onMarkAllPresent}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark All Present
          </button>
          <button
            type="button"
            className="lec-btn-bulk-absent"
            onClick={onMarkAllAbsent}
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Live Tally Bar */}
      <div className="lec-live-tally-bar">
        <div className="tally-item tally-total">
          <span className="tally-label">Enrolled:</span>
          <span className="tally-val">{students.length}</span>
        </div>
        <div className="tally-item tally-present">
          <span className="tally-dot dot-green"></span>
          <span className="tally-label">Present:</span>
          <span className="tally-val">{presentCount}</span>
        </div>
        <div className="tally-item tally-absent">
          <span className="tally-dot dot-red"></span>
          <span className="tally-label">Absent:</span>
          <span className="tally-val">{absentCount}</span>
        </div>
        <div className="tally-item tally-rate">
          <span className="tally-label">Session Rate:</span>
          <span className="tally-val font-semibold">{attendancePercent}%</span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="lec-table-scroll-container">
        <table className="lec-custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Student Reg No</th>
              <th>Full Name</th>
              <th>Overall Standing</th>
              <th style={{ width: '180px', textAlign: 'center' }}>Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty-cell">
                  No students matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st, idx) => (
                <tr key={st.regNo} className={st.present ? 'row-present' : 'row-absent'}>
                  <td className="text-muted">{idx + 1}</td>
                  <td>
                    <span className="lec-regno-pill">{st.regNo}</span>
                  </td>
                  <td>
                    <span className="lec-student-name">{st.name}</span>
                  </td>
                  <td>
                    <div className="lec-mini-standing-wrap">
                      <div className="lec-mini-standing-bar">
                        <div
                          className="lec-mini-standing-fill"
                          style={{
                            width: `${st.attendanceRate || 80}%`,
                            backgroundColor:
                              (st.attendanceRate || 80) >= 80 ? '#10b981' : (st.attendanceRate || 80) >= 70 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="lec-mini-standing-text">{st.attendanceRate || 80}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className={`lec-status-toggle-btn ${st.present ? 'is-present' : 'is-absent'}`}
                      onClick={() => onToggleStatus && onToggleStatus(st.regNo)}
                      title={`Click to mark as ${st.present ? 'Absent' : 'Present'}`}
                    >
                      {st.present ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Present
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Absent
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

