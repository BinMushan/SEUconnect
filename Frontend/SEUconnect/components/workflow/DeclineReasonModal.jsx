import React, { useState } from 'react';
import './workflow.css';

export default function DeclineReasonModal({ process, user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!process) return null;

  const curIndex = process.currentStageIndex;
  const currentStage = process.stages ? process.stages[curIndex] : null;

  const sampleReasons = [
    'Medical slip submitted beyond 7 calendar days after absence (Faculty By-law 7.4).',
    'Private clinic certificate not endorsed or countersigned by SEUSL Medical Center.',
    'Missed mandatory continuous assessment (CA) exam requiring formal Medical Board waiver.',
    'Student attendance below 60%; cannot be excused through departmental level approval.',
  ];

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please enter a specific and clear decline reason for the student and audit records.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onConfirm({
        actorName: user?.name || 'Reviewing Officer',
        actorRole: user?.designation || user?.role?.toUpperCase() || 'Department Authority',
        actorEmail: user?.email || '',
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to decline process');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div className="wf-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="wf-modal-header" style={{ background: '#7f1d1d', borderBottom: '2px solid #ef4444' }}>
          <div className="wf-modal-header-left">
            <span className="wf-tracking-badge" style={{ background: '#ef4444', color: '#ffffff' }}>
              DECLINE PROCESS
            </span>
            <div>
              <h2 className="wf-modal-title">Decline / Reject Application</h2>
              <p className="wf-modal-subtitle" style={{ color: '#fca5a5' }}>
                Ref: {process.trackingNumber} • Stage: {currentStage?.label || 'Department Review'}
              </p>
            </div>
          </div>
          <button className="wf-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleConfirm} className="wf-modal-body">
          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Officer credentials badge */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.84rem', color: '#991b1b' }}>
            <div>
              <strong>Declining Authority:</strong> {user?.name || 'Authority'}
            </div>
            <div>
              <strong>Designation / Role:</strong> {user?.designation || user?.role?.toUpperCase()}
            </div>
            <div>
              <strong>Student:</strong> {process.student?.name} ({process.student?.regNo})
            </div>
          </div>

          <div className="wf-form-group">
            <label className="wf-form-label">
              Mandatory Justification / Specific Decline Reason <span className="required">*</span>
            </label>
            <textarea
              className="wf-form-textarea"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the institutional reason, applicable university by-law, or deficiency in the application..."
              required
            />
          </div>

          {/* Quick By-law presets */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Quick Common Presets:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
              {sampleReasons.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.4rem 0.65rem',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#f8fafc')}
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#dc2626' }}>
            ⚠️ <strong>Notice:</strong> This action will mark the request as Declined. Your full name, institutional role, timestamp, and justification will be permanently visible to the student and all higher administrative authorities in the process audit trail.
          </div>

          <div className="wf-modal-footer" style={{ padding: '0.5rem 0 0', background: 'transparent' }}>
            <button type="button" className="wf-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="wf-btn-danger" disabled={isSubmitting}>
              {isSubmitting ? 'Logging Decline...' : 'Confirm Decline with Justification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
