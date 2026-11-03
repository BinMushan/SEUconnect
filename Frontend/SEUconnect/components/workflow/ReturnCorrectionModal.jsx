import React, { useState } from 'react';
import './workflow.css';

export default function ReturnCorrectionModal({ process, user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!process) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide specific correction instructions or reason for returning.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm({
        actorName: user?.name || 'Reviewing Authority',
        actorRole: user?.designation || user?.role?.toUpperCase() || 'Authority',
        actorEmail: user?.email || '',
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to return request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div className="wf-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="wf-modal-header" style={{ background: '#b45309' }}>
          <div className="wf-modal-header-left">
            <span className="wf-tracking-badge">{process.trackingNumber}</span>
            <div>
              <h2 className="wf-modal-title">Return for Correction</h2>
              <p className="wf-modal-subtitle">
                Request Amendments or Resubmission from Student / Lecturer
              </p>
            </div>
          </div>
          <button className="wf-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleConfirm} className="wf-modal-body">
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e' }}>
            <strong>Applicant:</strong> {process.student?.name || process.studentName} ({process.student?.regNo || process.registrationNumber})<br />
            <strong>Department:</strong> {process.student?.department || 'Faculty of Technology'}<br />
            <strong>Request:</strong> {process.title || process.processTitle}
          </div>

          <div className="wf-form-group">
            <label className="wf-form-label">
              Correction Instructions & Missing Documentation <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              className="wf-form-textarea"
              rows="4"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="State clearly what needs to be corrected, additional documents required, or clarification needed..."
              required
            />
            {error && (
              <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {error}
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '0.65rem', borderRadius: '6px' }}>
            ℹ️ When returned, this request status will change to <strong>Returned for Correction</strong>. The applicant and relevant department officers will receive immediate notification with your feedback.
          </div>

          <div className="wf-modal-footer" style={{ padding: '0.5rem 0 0', background: 'transparent' }}>
            <button type="button" className="wf-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="wf-btn-emerald"
              style={{ background: '#d97706', borderColor: '#b45309' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Returning...' : 'Confirm Return for Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

