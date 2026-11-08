import React, { useState } from 'react';
import { DEPARTMENT_BOARD_MINUTES, ACADEMIC_STAFF_LIST } from '../hodData.js';

export default function DepartmentBoardMinutes({ onNavigate }) {
  const [minutes, setMinutes] = useState(() => {
    try {
      const saved = localStorage.getItem('seu_hod_board_minutes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEPARTMENT_BOARD_MINUTES;
  });
  const [isRecordingNew, setIsRecordingNew] = useState(false);
  const [meetingNumber, setMeetingNumber] = useState('59th Department Board Meeting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM - 12:00 PM');
  const [agendaInput, setAgendaInput] = useState('');
  const [resolutionsInput, setResolutionsInput] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSaveMinutes = (e) => {
    e.preventDefault();
    if (!agendaInput.trim() || !resolutionsInput.trim()) {
      alert('Please fill in both agenda items and adopted resolutions.');
      return;
    }

    const newMeeting = {
      meetingNumber,
      date,
      time,
      venue: 'Department Conference Room, Tech Complex Level 2',
      chair: 'M.J Ahamed Sabani (HOD)',
      attendees: ACADEMIC_STAFF_LIST.slice(0, 6).map((s) => s.name),
      agendaItems: agendaInput.split('\n').filter((x) => x.trim()),
      resolutions: resolutionsInput.split('\n').filter((x) => x.trim()),
      status: 'Signed & Archived',
    };

    const updated = [newMeeting, ...minutes];
    setMinutes(updated);
    try {
      localStorage.setItem('seu_hod_board_minutes', JSON.stringify(updated));
    } catch (_) {}
    setIsRecordingNew(false);
    setAgendaInput('');
    setResolutionsInput('');
    setFeedback(`✓ Minutes for ${newMeeting.meetingNumber} have been formally archived under HOD authority.`);
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">GOVERNANCE & STATUTORY RECORDS</span>
          <h1 className="hod-view-title">Department Board Minutes & QA Reports</h1>
          <p className="hod-view-subtitle">
            Official Archives of Departmental Board Meetings, Academic Resolutions, Curriculum Approvals & Minutes
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn primary" onClick={() => setIsRecordingNew(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Record New Meeting Minutes
          </button>
        </div>
      </div>

      {feedback && (
        <div className="hod-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Minutes Archive List */}
      <div className="hod-minutes-stack">
        {minutes.map((m, idx) => (
          <div key={idx} className="hod-card hod-minute-card">
            <div className="hod-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 className="hod-card-heading" style={{ fontSize: '1.15rem' }}>
                    {m.meetingNumber}
                  </h3>
                  <span className="hod-board-pill">HOD Certified</span>
                </div>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                  📅 {m.date} • ⏰ {m.time} • 📍 {m.venue}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="hod-btn-outline"
                  onClick={() => alert(`Official signed minutes document for ${m.meetingNumber} downloaded.`)}
                >
                  Download Minutes (PDF)
                </button>
              </div>
            </div>

            <div className="hod-minute-body-grid">
              <div>
                <h4 className="hod-minute-subheading">Chair & Attendees</h4>
                <div style={{ fontSize: '0.82rem', color: '#0f2b5c', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Chair: {m.chair}
                </div>
                <div className="hod-attendees-tags">
                  {m.attendees.map((att, aIdx) => (
                    <span key={aIdx} className="hod-att-tag good">
                      ✓ {att}
                    </span>
                  ))}
                </div>

                <h4 className="hod-minute-subheading" style={{ marginTop: '1rem' }}>
                  Meeting Agenda Items
                </h4>
                <ol className="hod-agenda-list">
                  {m.agendaItems.map((ag, agIdx) => (
                    <li key={agIdx}>{ag}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="hod-minute-subheading">Formal Resolutions Adopted</h4>
                <div className="hod-resolutions-box">
                  {m.resolutions.map((res, rIdx) => (
                    <div key={rIdx} className="hod-res-item">
                      <span className="hod-res-bullet">⚖️</span>
                      <p className="hod-res-text">{res}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Minutes Modal */}
      {isRecordingNew && (
        <div className="hod-modal-overlay" onClick={() => setIsRecordingNew(false)}>
          <div className="hod-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">Record Department Board Minutes</h3>
                <p className="hod-modal-sub">Official Institutional Minutes Entry under HOD Authority</p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setIsRecordingNew(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveMinutes}>
              <div className="hod-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="hod-form-label">Meeting Title</label>
                    <input
                      type="text"
                      className="hod-input"
                      value={meetingNumber}
                      onChange={(e) => setMeetingNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="hod-form-label">Meeting Date</label>
                    <input
                      type="date"
                      className="hod-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="hod-form-label">Agenda Items (One per line)</label>
                  <textarea
                    className="hod-textarea"
                    rows="4"
                    placeholder="Enter discussion agenda items, separated by newlines..."
                    value={agendaInput}
                    onChange={(e) => setAgendaInput(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label className="hod-form-label">Formal Resolutions Adopted (One per line)</label>
                  <textarea
                    className="hod-textarea"
                    rows="4"
                    placeholder="Enter resolutions approved by the Department Board, separated by newlines..."
                    value={resolutionsInput}
                    onChange={(e) => setResolutionsInput(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="hod-modal-footer">
                <button type="button" className="hod-btn-outline" onClick={() => setIsRecordingNew(false)}>
                  Cancel
                </button>
                <button type="submit" className="hod-btn-endorse">
                  Certify & Archive Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

