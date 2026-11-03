import React, { useState } from 'react';
import { FACULTY_BOARD_MEETINGS } from '../deanData.js';

export default function FacultyBoardSenate({ onNavigate }) {
  const [meetings, setMeetings] = useState(FACULTY_BOARD_MEETINGS);
  const [isDrafting, setIsDrafting] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [department, setDepartment] = useState('Faculty-wide');
  const [justification, setJustification] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAddAgenda = (e) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;

    setMeetings((prev) => {
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        agenda: [...copy[0].agenda, `${paperTitle} (${department})`],
      };
      return copy;
    });

    setFeedback(`Agenda paper "${paperTitle}" formally placed on the docket for the 112th Faculty Board Meeting.`);
    setIsDrafting(false);
    setPaperTitle('');
    setJustification('');
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">SUPREME FACULTY GOVERNANCE</span>
          <h1 className="dean-view-title">Faculty Board of Technology & Senate Docket</h1>
          <p className="dean-view-subtitle">
            Chaired by Prof. Rifai Kariapper • Official Statutory Board for Academic By-Laws, Results Sanctions & Faculty Resolutions
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn primary" onClick={() => setIsDrafting(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Submit Board Agenda Paper
          </button>
        </div>
      </div>

      {feedback && (
        <div className="dean-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Board Meetings Archive & Current Sitting */}
      <div className="dean-minutes-stack">
        {meetings.map((m, idx) => (
          <div key={idx} className="dean-card">
            <div className="dean-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 className="dean-card-heading" style={{ fontSize: '1.2rem' }}>
                    {m.meetingNumber}
                  </h3>
                  <span className={`dean-badge-${m.status.includes('Scheduled') ? 'amber' : 'green'}`}>
                    {m.status}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                  📅 {m.date} • ⏰ {m.time} • 📍 {m.venue} (Chair: {m.chair})
                </p>
              </div>

              <button
                type="button"
                className="dean-btn-outline"
                onClick={() => alert(`Official signed Board Paper Docket for ${m.meetingNumber} exported.`)}
              >
                Export Docket (PDF)
              </button>
            </div>

            <div className="dean-minute-body-grid">
              {/* Agenda Papers */}
              <div>
                <h4 className="dean-minute-subheading">Formal Agenda Papers & Submissions</h4>
                <ol className="dean-agenda-list">
                  {m.agenda.map((item, iIdx) => (
                    <li key={iIdx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                  ))}
                </ol>
              </div>

              {/* Adopted Resolutions */}
              <div>
                <h4 className="dean-minute-subheading">Key Resolutions & Senate Directives</h4>
                <div className="dean-resolutions-box">
                  {m.keyResolutions.map((res, rIdx) => (
                    <div key={rIdx} className="dean-res-item">
                      <span className="dean-res-bullet">⚖️</span>
                      <p className="dean-res-text">{res}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Draft Agenda Modal */}
      {isDrafting && (
        <div className="dean-modal-overlay" onClick={() => setIsDrafting(false)}>
          <div className="dean-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dean-modal-header">
              <div>
                <h3 className="dean-modal-title">Submit Faculty Board Agenda Paper</h3>
                <p className="dean-modal-sub">112th Meeting of the Faculty Board of Technology</p>
              </div>
              <button type="button" className="dean-modal-close-btn" onClick={() => setIsDrafting(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAgenda}>
              <div className="dean-modal-body">
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="dean-form-label">Agenda Item Subject</label>
                  <input
                    type="text"
                    className="dean-input"
                    placeholder="e.g. Consideration of New Bio-Informatics Curriculum for Faculty of Technology"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="dean-form-label">Sponsoring Academic Department / Committee</label>
                  <select
                    className="dean-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Department of ICT">Department of ICT</option>
                    <option value="Department of BST">Department of BST</option>
                    <option value="Faculty-wide (Dean's Office)">Faculty-wide (Dean's Office)</option>
                    <option value="Faculty Quality Assurance Cell (IQAC)">Faculty Quality Assurance Cell (IQAC)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label className="dean-form-label">Memorandum & Statutory Justification</label>
                  <textarea
                    className="dean-textarea"
                    rows="5"
                    placeholder="Provide full statutory references, by-law considerations, and recommended resolution for the Board's vote..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="dean-modal-footer">
                <button type="button" className="dean-btn-outline" onClick={() => setIsDrafting(false)}>Cancel</button>
                <button type="submit" className="dean-btn-approve">Place on Board Docket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

