import { useState } from 'react';

export default function SettingsManagement({ onSaveSettings }) {
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [activeSemester, setActiveSemester] = useState('Semester 5 (Odd Semester)');
  const [addDropDeadline, setAddDropDeadline] = useState('2026-10-15');
  const [examDeadline, setExamDeadline] = useState('2026-10-30');
  const [minAttendance, setMinAttendance] = useState('80');
  const [maxCreditCap, setMaxCreditCap] = useState('22');
  const [portalMaintenance, setPortalMaintenance] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    if (onSaveSettings) {
      onSaveSettings({
        academicYear,
        activeSemester,
        addDropDeadline,
        examDeadline,
        minAttendance,
        maxCreditCap,
        portalMaintenance
      });
    }
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Institutional Timeline & Portal System Settings</h2>
          <p className="adm-section-subtitle">
            Configure academic deadlines, semester credit limits, attendance eligibility percentages, and platform operations for the Faculty of Technology.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
          ✓ Faculty institutional parameters and registration deadlines updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="adm-card" style={{ maxWidth: '820px' }}>
        <h3 className="adm-card-heading" style={{ marginBottom: '1.25rem' }}>
          Academic Calendar & Regulatory Cutoffs
        </h3>

        <div className="adm-form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="adm-form-group">
            <label className="adm-label">Academic Year</label>
            <input
              type="text"
              className="adm-input"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Active Academic Term</label>
            <input
              type="text"
              className="adm-input"
              value={activeSemester}
              onChange={(e) => setActiveSemester(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Semester Add/Drop Registration Deadline</label>
            <input
              type="date"
              className="adm-input"
              value={addDropDeadline}
              onChange={(e) => setAddDropDeadline(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">ESA Examination Entry Submission Cutoff</label>
            <input
              type="date"
              className="adm-input"
              value={examDeadline}
              onChange={(e) => setExamDeadline(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Minimum Attendance for Exam Sitting (%)</label>
            <input
              type="number"
              className="adm-input"
              value={minAttendance}
              onChange={(e) => setMinAttendance(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Maximum Standard Semester Credit Cap</label>
            <input
              type="number"
              className="adm-input"
              value={maxCreditCap}
              onChange={(e) => setMaxCreditCap(e.target.value)}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0f172a' }}>Platform Operations & Maintenance</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#334155' }}>
            <input
              type="checkbox"
              checked={portalMaintenance}
              onChange={(e) => setPortalMaintenance(e.target.checked)}
            />
            <span>Enable Scheduled Maintenance Mode (Read-Only Portal Access for Students)</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="submit"
            className="adm-find-process-btn"
          >
            Save Institutional Settings
          </button>
        </div>
      </form>
    </div>
  );
}
