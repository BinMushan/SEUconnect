import React, { useState, useEffect, useMemo } from 'react';
import { ACADEMIC_STAFF_LIST } from '../hodData.js';
import api, { provisionedUserStorage } from '../../../src/services/api.js';

export default function AcademicStaffManagement({ onNavigate }) {
  const [cadreFilter, setCadreFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [dbStaff, setDbStaff] = useState([]);

  // Fetch registered staff directory from MongoDB Atlas backend
  useEffect(() => {
    let cancelled = false;
    const fetchStaff = async () => {
      try {
        const res = await api.getDirectory({ role: 'lecturer' });
        if (!cancelled && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setDbStaff(res.data);
        }
      } catch (err) {
        console.warn('Academic staff directory fetch notice:', err.message);
      }
    };
    fetchStaff();
    return () => { cancelled = true; };
  }, []);

  // Merge database staff with provisioned users and baseline roster
  const allStaff = useMemo(() => {
    try {
      const provisioned = (provisionedUserStorage.getAll() || [])
        .filter((u) => u.role?.toLowerCase().includes('lecturer'))
        .map((u, idx) => ({
          id: u.staffId || `STAFF-PRV-${idx + 1}`,
          name: u.name,
          designation: u.designation || 'Lecturer',
          cadre: u.designation?.includes('Senior') ? 'Senior Lecturer' : 'Lecturer',
          email: u.email,
          phone: u.phone || '+94 67 2255444',
          qualification: u.qualification || 'M.Sc., B.Sc. Hons in IT',
          researchAreas: u.specialization || 'Software Engineering, Information Systems',
          assignedModules: ['Allocated by HOD'],
          officeRoom: 'Technology Complex',
          status: 'Active Duty',
          teachingHoursPerWeek: 12,
        }));

      const dbLecturers = (dbStaff || []).map((u, idx) => ({
        id: u.staffId || `STAFF-DB-${idx + 1}`,
        name: u.name,
        designation: u.designation || 'Lecturer',
        cadre: u.designation?.includes('Senior') ? 'Senior Lecturer' : 'Lecturer',
        email: u.email,
        phone: u.phone || '+94 67 2255444',
        qualification: u.qualification || 'Ph.D. / M.Sc. in Computing',
        researchAreas: u.specialization || 'Computer Science & Technology',
        assignedModules: ['Allocated by HOD'],
        officeRoom: 'Tech Complex Room 210',
        status: 'Active Duty',
        teachingHoursPerWeek: 12,
      }));

      const existingNames = new Set(ACADEMIC_STAFF_LIST.map((s) => s.name.toLowerCase()));
      const newFromStorage = [...provisioned, ...dbLecturers].filter(
        (s) => !existingNames.has(s.name.toLowerCase())
      );
      return [...ACADEMIC_STAFF_LIST, ...newFromStorage];
    } catch (_) {
      return ACADEMIC_STAFF_LIST;
    }
  }, [dbStaff]);

  const filteredStaff = allStaff.filter((staff) => {
    const matchesCadre = cadreFilter === 'All' || staff.cadre === cadreFilter;
    const matchesSearch =
      !searchQuery ||
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.researchAreas && staff.researchAreas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCadre && matchesSearch;
  });

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">DEPARTMENT CADRE</span>
          <h1 className="hod-view-title">Department Academic Staff Roster</h1>
          <p className="hod-view-subtitle">
            Faculty of Technology • Department of ICT Academic Cadre, Assigned Modules & Teaching Workload
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('course_coordination')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Review Course Allocations
          </button>
        </div>
      </div>

      {/* 2. Cadre Distribution Metric Cards */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card" onClick={() => setCadreFilter('All')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">{allStaff.length}</span>
          <span className="hod-strip-lbl">Total Academic Cadre</span>
        </div>
        <div className="hod-strip-card" onClick={() => setCadreFilter('Senior Lecturer')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">
            {allStaff.filter((s) => s.cadre === 'Senior Lecturer').length}
          </span>
          <span className="hod-strip-lbl">Senior Lecturers (Gr. I & II)</span>
        </div>
        <div className="hod-strip-card" onClick={() => setCadreFilter('Lecturer')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">
            {allStaff.filter((s) => s.cadre === 'Lecturer').length}
          </span>
          <span className="hod-strip-lbl">Lecturers (Probationary)</span>
        </div>
        <div className="hod-strip-card" onClick={() => setCadreFilter('Demonstrator')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">
            {allStaff.filter((s) => s.cadre === 'Demonstrator').length}
          </span>
          <span className="hod-strip-lbl">Demonstrators / TAs</span>
        </div>
        <div className="hod-strip-card" onClick={() => setCadreFilter('Visiting Academic')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">
            {allStaff.filter((s) => s.cadre === 'Visiting Academic').length}
          </span>
          <span className="hod-strip-lbl">Visiting Industry Academics</span>
        </div>
      </div>

      {/* 3. Search and Cadre Filter Controls */}
      <div className="hod-toolbar-card">
        <div className="hod-filter-tabs">
          {['All', 'Senior Lecturer', 'Lecturer', 'Demonstrator', 'Visiting Academic'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`hod-tab-btn ${cadreFilter === tab ? 'active' : ''}`}
              onClick={() => setCadreFilter(tab)}
            >
              {tab === 'All' ? `All Cadre (${allStaff.length})` : tab}
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
            placeholder="Search staff by name, qualification, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Staff Cards Grid */}
      <div className="hod-staff-grid">
        {filteredStaff.map((staff) => {
          const isHOD = staff.id === 'STAFF-ICT-001';
          return (
            <div key={staff.id} className={`hod-staff-card ${isHOD ? 'hod-highlight-card' : ''}`}>
              <div className="hod-staff-header">
                <div className="hod-staff-avatar-wrap">
                  <div className="hod-staff-avatar">
                    {staff.name.replace('Dr. ', '').replace('Eng. ', '').replace('Mrs. ', '').replace('Mr. ', '').replace('Ms. ', '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="hod-staff-name">
                      {staff.name}
                      {isHOD && <span className="hod-current-hod-badge">Current HOD</span>}
                    </h3>
                    <div className="hod-staff-id">{staff.id} • {staff.designation}</div>
                  </div>
                </div>
                <span className="hod-status-active-pill">● {staff.status}</span>
              </div>

              <div className="hod-staff-body">
                <div className="hod-staff-info-row">
                  <span className="hod-info-label">Qualifications:</span>
                  <span className="hod-info-value">{staff.qualification}</span>
                </div>
                <div className="hod-staff-info-row">
                  <span className="hod-info-label">Research:</span>
                  <span className="hod-info-value">{staff.researchAreas}</span>
                </div>
                <div className="hod-staff-info-row">
                  <span className="hod-info-label">Office & Ext:</span>
                  <span className="hod-info-value">{staff.officeRoom} ({staff.phone})</span>
                </div>
                <div className="hod-staff-info-row">
                  <span className="hod-info-label">Assigned Modules:</span>
                  <div className="hod-modules-tags">
                    {staff.assignedModules.map((m, mIdx) => (
                      <span key={mIdx} className="hod-mod-pill">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hod-staff-footer">
                <div className="hod-workload-indicator">
                  <span className="hod-hours-num">{staff.teachingHoursPerWeek} hrs</span>
                  <span className="hod-hours-lbl">Weekly Load</span>
                </div>
                <button
                  type="button"
                  className="hod-btn-audit"
                  onClick={() => setSelectedStaff(staff)}
                >
                  View Dossier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Dossier Modal */}
      {selectedStaff && (
        <div className="hod-modal-overlay" onClick={() => setSelectedStaff(null)}>
          <div className="hod-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">Academic Staff Dossier</h3>
                <p className="hod-modal-sub">{selectedStaff.name} ({selectedStaff.id})</p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setSelectedStaff(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              <div className="hod-staff-dossier-grid">
                <div className="hod-dossier-item">
                  <label>Designation</label>
                  <div>{selectedStaff.designation}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Cadre Category</label>
                  <div>{selectedStaff.cadre}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Official Email</label>
                  <div>{selectedStaff.email}</div>
                </div>
                <div className="hod-dossier-item">
                  <label>Campus Extension</label>
                  <div>{selectedStaff.phone}</div>
                </div>
                <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
                  <label>Degrees & Educational Credentials</label>
                  <div>{selectedStaff.qualification}</div>
                </div>
                <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
                  <label>Research Areas & Specializations</label>
                  <div>{selectedStaff.researchAreas}</div>
                </div>
                <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
                  <label>Current Semester Teaching Allocation</label>
                  <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                    {selectedStaff.assignedModules.map((mod, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{mod}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="hod-modal-footer">
              <button type="button" className="hod-btn-outline" onClick={() => setSelectedStaff(null)}>
                Close
              </button>
              <button
                type="button"
                className="hod-btn-endorse"
                onClick={() => {
                  setSelectedStaff(null);
                  onNavigate('course_coordination');
                }}
              >
                Modify Teaching Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

