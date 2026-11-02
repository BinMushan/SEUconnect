import React, { useState } from 'react';
import { FACULTY_ESCALATIONS_HISTORY } from '../hodData.js';

export default function FacultyDeanEscalations({ onNavigate }) {
  const [history, setHistory] = useState(FACULTY_ESCALATIONS_HISTORY);
  const [category, setCategory] = useState('Curriculum & Special Concessions');
  const [priority, setPriority] = useState('Urgent');
  const [subject, setSubject] = useState('');
  const [refStudent, setRefStudent] = useState('');
  const [body, setBody] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleTransmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      alert('Please provide a subject line and memorandum body.');
      return;
    }

    const newMemo = {
      memoId: `MEMO-HOD-2026-${String(history.length + 9).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      category,
      subject: refStudent ? `${subject} (${refStudent})` : subject,
      priority,
      status: "Forwarded to Dean's Office",
      deanNote: 'Awaiting formal review by Prof. U.L. Abdul Majeed (Dean, Faculty of Technology).',
    };

    setHistory([newMemo, ...history]);
    setSubject('');
    setRefStudent('');
    setBody('');
    setFeedback(`Executive Memorandum ${newMemo.memoId} transmitted successfully to the Dean's Office.`);
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">FACULTY EXECUTIVE ESCALATION</span>
          <h1 className="hod-view-title">Escalate to Faculty Dean</h1>
          <p className="hod-view-subtitle">
            Direct Inter-Office Memorandum Link between Head of Department and Dean, Faculty of Technology (Prof. U.L. Abdul Majeed)
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('pending_hod_approvals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Approvals Desk
          </button>
        </div>
      </div>

      {feedback && (
        <div className="hod-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Two-Column Form & History */}
      <div className="hod-two-col-grid" style={{ alignItems: 'start' }}>
        {/* Left: Compose Form */}
        <div className="hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
              Compose Dean Escalation Memorandum
            </h3>
            <span className="hod-board-pill">HOD Official Seal</span>
          </div>

          <form onSubmit={handleTransmit} className="hod-form-stack">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="hod-form-label">Matter Category</label>
                <select
                  className="hod-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Curriculum & Special Concessions">Curriculum & Special Concessions</option>
                  <option value="Academic Cadre & Visiting Staff">Academic Cadre & Visiting Staff</option>
                  <option value="Examination Schedule & Timetable">Examination Schedule & Timetable</option>
                  <option value="Student Disciplinary / Grievance">Student Disciplinary / Grievance</option>
                  <option value="Laboratory Requisition & Budget">Laboratory Requisition & Budget</option>
                </select>
              </div>

              <div>
                <label className="hod-form-label">Urgency & Priority</label>
                <select
                  className="hod-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Urgent">🔴 Urgent (Immediate Dean Review)</option>
                  <option value="Normal">🟡 Normal (Next Faculty Board)</option>
                  <option value="Routine">🟢 Routine Information</option>
                </select>
              </div>
            </div>

            <div>
              <label className="hod-form-label">Memorandum Subject</label>
              <input
                type="text"
                className="hod-input"
                placeholder="e.g. Special Concession Request for End Semester Examination"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="hod-form-label">Student Reg No / Staff ID (Optional Reference)</label>
              <input
                type="text"
                className="hod-input"
                placeholder="e.g. 2021/ICT/085 or STAFF-ICT-104"
                value={refStudent}
                onChange={(e) => setRefStudent(e.target.value)}
              />
            </div>

            <div>
              <label className="hod-form-label">HOD Official Justification & Minutes</label>
              <textarea
                className="hod-textarea"
                rows="6"
                placeholder="Detail the departmental justification, background by-laws, and proposed resolution for the Dean's formal clearance..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="hod-btn-endorse" style={{ padding: '0.6rem 1.25rem' }}>
                Transmit Memorandum to Dean's Office
              </button>
            </div>
          </form>
        </div>

        {/* Right: History & Transmitted Memos */}
        <div className="hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              Transmitted Escalation Archive & Dean Verdicts
            </h3>
            <span className="hod-counter-badge">{history.length} Memorandums</span>
          </div>

          <div className="hod-memos-list">
            {history.map((memo) => (
              <div key={memo.memoId} className="hod-memo-card">
                <div className="hod-memo-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="hod-tracking-badge">{memo.memoId}</span>
                    <span className={`hod-badge-${memo.priority === 'Urgent' ? 'red' : 'amber'}`}>
                      {memo.priority}
                    </span>
                  </div>
                  <span className="hod-date-text">{memo.date}</span>
                </div>

                <h4 className="hod-memo-subject">{memo.subject}</h4>
                <div className="hod-memo-cat">Category: {memo.category}</div>

                <div className="hod-memo-status-box">
                  <div className="hod-memo-status-row">
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dean's Office Status:</span>
                    <span className={`hod-status-pill status-${memo.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                      {memo.status}
                    </span>
                  </div>
                  <p className="hod-dean-minute">
                    <strong>Dean's Minute:</strong> "{memo.deanNote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
