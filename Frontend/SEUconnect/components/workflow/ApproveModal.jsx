import React, { useState } from 'react';
import './workflow.css';

export default function ApproveModal({ process, user, onClose, onConfirm }) {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!process) return null;

  const curIndex = process.currentStageIndex;
  const currentStage = process.stages ? process.stages[curIndex] : null;
  const isFinalStage = curIndex === (process.stages ? process.stages.length - 1 : 0);

  // Set default recommendation text based on user's role
  const getDefaultRemarks = () => {
    if (user?.role === 'lecturer') {
      return 'Attendance record verified against lecture registry. Lab session impact noted. Recommended for departmental approval.';
    } else if (user?.role === 'hod') {
      return 'Departmental review completed. Endorsed and forwarded to Faculty Dean Office for final sanction.';
    } else if (user?.role === 'dean') {
      return 'Faculty Board sanction granted. Excused attendance officially recorded in Faculty Information System.';
    } else if (user?.role === 'examination') {
      return 'Medical certificate verified against university health center register and endorsed.';
    }
    return 'Verified and endorsed.';
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        actorName: user?.name || 'Department Reviewer',
        actorRole: user?.designation || user?.role?.toUpperCase() || 'Reviewer',
        actorEmail: user?.email || '',
        remarks: remarks || getDefaultRemarks(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div className="wf-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="wf-modal-header" style={{ background: '#0f2b5c' }}>
          <div className="wf-modal-header-left">
            <span className="wf-tracking-badge">{process.trackingNumber}</span>
            <div>
              <h2 className="wf-modal-title">
                {isFinalStage ? 'Grant Final Faculty Approval' : 'Endorse & Forward to Next Level'}
              </h2>
              <p className="wf-modal-subtitle">
                Current Stage: {currentStage?.label || 'Verification'}
              </p>
            </div>
          </div>
          <button className="wf-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleConfirm} className="wf-modal-body">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#166534' }}>
            <strong>Student:</strong> {process.student?.name} ({process.student?.regNo})<br />
            <strong>Request:</strong> {process.title}<br />
            <strong>Reviewing as:</strong> {user?.name || user?.role} ({user?.designation || user?.role})
          </div>

          <div className="wf-form-group">
            <label className="wf-form-label">
              Official Endorsement Remarks / Recommendation Note
            </label>
            <textarea
              className="wf-form-textarea"
              rows="3"
              defaultValue={getDefaultRemarks()}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add verification notes or recommendations for the next authority..."
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            ℹ️ Upon confirmation, a tamper-proof digital signature and verification stamp will be generated, and this request will immediately advance to the next institutional authority.
          </div>

          <div className="wf-modal-footer" style={{ padding: '0.5rem 0 0', background: 'transparent' }}>
            <button type="button" className="wf-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="wf-btn-emerald" disabled={isSubmitting}>
              {isSubmitting
                ? 'Processing...'
                : isFinalStage
                ? 'Grant Official Approval'
                : 'Confirm & Forward to Next Level'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
