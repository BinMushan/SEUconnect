import React, { useState } from 'react';
import { DEPARTMENT_STUDENTS_LIST, HOD_BATCH_CONFIG, getCalculatedHodTotal } from '../hodData.js';

export default function DepartmentStudents({ onNavigate }) {
  const [batchFilter, setBatchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const totalEnrolled = getCalculatedHodTotal();

  const filteredStudents = DEPARTMENT_STUDENTS_LIST.filter((student) => {
    const matchesBatch =
      batchFilter === 'All' ||
      student.batchKey === batchFilter ||
      student.batch?.includes(batchFilter) ||
      student.year === batchFilter;

    const matchesSearch =
      !searchQuery ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.indexNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">STUDENT ADVISING & CADRE</span>
          <h1 className="hod-view-title">Department Undergraduates Directory</h1>
          <p className="hod-view-subtitle">
            Bachelor of Information and Communication Technology Honours – BICT (Hons) Students Across All 5 Batches
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('attendance_audit')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            80% Attendance Audit
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('pending_hod_approvals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Student Petitions
          </button>
        </div>
      </div>

      {/* 2. Batch Metric Strip (Calculated from 5 batches) */}
      <div className="hod-stats-strip">
        <div
          className={`hod-strip-card ${batchFilter === 'All' ? 'active-border' : ''}`}
          onClick={() => setBatchFilter('All')}
          style={{ cursor: 'pointer' }}
        >
          <span className="hod-strip-val">{totalEnrolled}</span>
          <span className="hod-strip-lbl">Total Enrolled (Across All 5 Batches)</span>
        </div>
        {HOD_BATCH_CONFIG.map((b) => (
          <div
            key={b.batchKey}
            className={`hod-strip-card ${batchFilter === b.batchKey ? 'active-border' : ''}`}
            onClick={() => setBatchFilter(b.batchKey)}
            style={{ cursor: 'pointer' }}
          >
            <span className="hod-strip-val" style={{ color: b.color }}>{b.count}</span>
            <span className="hod-strip-lbl">{b.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="hod-toolbar-card">
        <div className="hod-filter-tabs">
          <button
            type="button"
            className={`hod-tab-btn ${batchFilter === 'All' ? 'active' : ''}`}
            onClick={() => setBatchFilter('All')}
            style={{ cursor: 'pointer' }}
          >
            All Batches ({totalEnrolled})
          </button>
          {HOD_BATCH_CONFIG.map((b) => (
            <button
              key={b.batchKey}
              type="button"
              className={`hod-tab-btn ${batchFilter === b.batchKey ? 'active' : ''}`}
              onClick={() => setBatchFilter(b.batchKey)}
              style={{ cursor: 'pointer' }}
            >
              {b.label} ({b.count})
            </button>
          ))}
        </div>

        <div className="hod-table-search-box" style={{ maxWidth: '320px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by Reg No, Name, Specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Student Roster Table */}
      <div className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <h3 className="hod-card-title">Department Undergraduate Roster</h3>
            <p className="hod-card-subtitle">
              Monitored for Academic Standing, Cumulative GPA, Mandatory 80% Attendance, and Escalated Petitions.
            </p>
          </div>
          <span className="hod-counter-badge">{filteredStudents.length} Students Listed</span>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Student Name</th>
                <th>Academic Batch</th>
                <th>Specialization Track</th>
                <th>CGPA</th>
                <th>Attendance</th>
                <th>Academic Standing</th>
                <th>Active Petitions</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stu) => {
                const isCritical = stu.attendanceRate < 70;
                const isBorderline = stu.attendanceRate >= 70 && stu.attendanceRate < 80;

                return (
                  <tr key={stu.regNo}>
                    <td>
                      <span className="hod-tracking-badge">{stu.regNo}</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{stu.indexNo}</div>
                    </td>
                    <td>
                      <div className="hod-student-name">{stu.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stu.email}</div>
                    </td>
                    <td>
                      <span className="hod-batch-pill">{stu.batch}</span>
                    </td>
                    <td>
                      <span className="hod-subject-tag">{stu.specialization}</span>
                    </td>
                    <td>
                      <span className="hod-gpa-badge">{stu.cgpa.toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="hod-att-cell">
                        <span className={`hod-att-rate ${isCritical ? 'danger' : isBorderline ? 'warning' : 'good'}`}>
                          {stu.attendanceRate}%
                        </span>
                        <span className={`hod-att-tag ${isCritical ? 'danger' : isBorderline ? 'warning' : 'good'}`}>
                          {stu.attendanceStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`hod-standing-pill ${stu.academicStatus === "Dean's List" ? 'deans' : stu.academicStatus === 'Academic Warning' ? 'warning' : 'good'}`}>
                        {stu.academicStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`hod-pet-badge ${stu.pendingRequests !== 'None' ? 'has-pet' : 'no-pet'}`}>
                        {stu.pendingRequests}
                      </span>
                    </td>
                    <td>
                      <div className="hod-actions-cell">
                        <button
                          type="button"
                          className="hod-btn-audit"
                          onClick={() => setSelectedStudent(stu)}
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="hod-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="hod-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">Undergraduate Academic Dossier</h3>
                <p className="hod-modal-sub">{selectedStudent.name} • {selectedStudent.regNo}</p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setSelectedStudent(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              <div className="hod-staff-dossier-grid">
                <div className="hod-dossier-item">
                  <label>Full Name</label>
                  <div>{selectedStudent.name}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Registration Number</label>
                  <div>{selectedStudent.regNo} (Index: {selectedStudent.indexNo})</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Academic Batch</label>
                  <div>{selectedStudent.batch}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Specialization Track</label>
                  <div>{selectedStudent.specialization}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Cumulative GPA</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b5c' }}>
                    {selectedStudent.cgpa.toFixed(2)}
                  </div>
                </div>
                <div className="hod-dossier-item">
                  <label>Current Attendance Standing</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedStudent.attendanceRate >= 80 ? '#059669' : '#dc2626' }}>
                    {selectedStudent.attendanceRate}% ({selectedStudent.attendanceStatus})
                  </div>
                </div>
                <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
                  <label>Active Petitions / Medical Submissions</label>
                  <div>{selectedStudent.pendingRequests}</div>
                </div>
              </div>
            </div>
            <div className="hod-modal-footer">
              <button type="button" className="hod-btn-outline" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
              <button
                type="button"
                className="hod-btn-endorse"
                onClick={() => {
                  setSelectedStudent(null);
                  onNavigate('attendance_audit');
                }}
              >
                Inspect Attendance Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

