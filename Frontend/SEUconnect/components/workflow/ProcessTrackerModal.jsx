import React from 'react';
import './workflow.css';

export default function ProcessTrackerModal({ process, onClose, onActionClick, currentUserRole }) {
  if (!process) return null;

  const isDeclined = process.status === 'Declined';
  const isApproved = process.status === 'Approved';

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Pending Action';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'badge-approved';
      case 'Declined': return 'badge-declined';
      case 'Pending HOD': return 'badge-hod';
      case 'Pending Dean': return 'badge-dean';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div className="wf-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="wf-modal-header">
          <div className="wf-modal-header-left">
            <span className="wf-tracking-badge">{process.trackingNumber}</span>
            <div>
              <h2 className="wf-modal-title">{process.title}</h2>
              <p className="wf-modal-subtitle">
                Category: {process.category} • Priority: {process.priority}
              </p>
            </div>
          </div>
          <button className="wf-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="wf-modal-body">

          {/* ================================================================
              PROMINENT DECLINE JUSTIFICATION BANNER (When Rejected)
              Explicitly addresses: "who declined for what"
              ================================================================ */}
          {isDeclined && process.declineDetails && (
            <div className="wf-decline-banner">
              <div className="wf-decline-top-row">
                <span className="wf-decline-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  PROCESS NOT APPROVED / DECLINED
                </span>
                <span className="wf-decline-time">
                  {formatDateTime(process.declineDetails.declinedAt)}
                </span>
              </div>

              <div className="wf-decline-author">
                Declined by: {process.declineDetails.declinedBy}{' '}
                <span>({process.declineDetails.declinedByRole})</span>
              </div>

              <div className="wf-decline-reason-box">
                <div className="wf-decline-reason-title">
                  OFFICIAL DECLINE JUSTIFICATION & BY-LAW REFERENCE:
                </div>
                <div>{process.declineDetails.reason}</div>
              </div>
            </div>
          )}

          {/* ================================================================
              APPROVAL CERTIFICATE BANNER (When Fully Completed)
              ================================================================ */}
          {isApproved && (
            <div className="wf-approval-banner">
              <div className="wf-approval-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                OFFICIALLY SANCTIONED & FINALIZED
              </div>
              <div style={{ fontSize: '0.85rem', color: '#047857' }}>
                All academic & administrative verification checkpoints completed. Records officially excused.
              </div>
              {process.approvalDetails?.finalApprovalCode && (
                <div className="wf-approval-seal">
                  Approval Code: {process.approvalDetails.finalApprovalCode}
                </div>
              )}
            </div>
          )}

          {/* Student & Course Details */}
          <div>
            <div className="wf-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Student & Application Parameters
            </div>
            <div className="wf-details-grid">
              <div className="wf-detail-item">
                <span className="wf-detail-label">Student Name / Reg No</span>
                <span className="wf-detail-value">{process.student.name} ({process.student.regNo})</span>
              </div>
              <div className="wf-detail-item">
                <span className="wf-detail-label">Department / Faculty</span>
                <span className="wf-detail-value">{process.student.department} • {process.student.faculty}</span>
              </div>
              <div className="wf-detail-item">
                <span className="wf-detail-label">Missed Lecture Date / Range</span>
                <span className="wf-detail-value">
                  {process.details.absenceDate} {process.details.endDate && process.details.endDate !== process.details.absenceDate ? `to ${process.details.endDate}` : ''}
                </span>
              </div>
              <div className="wf-detail-item">
                <span className="wf-detail-label">Medical Reference / Doctor</span>
                <span className="wf-detail-value">
                  {process.details.doctorName} • {process.details.hospitalClinic}
                </span>
              </div>
              <div className="wf-detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="wf-detail-label">Affected Course Modules</span>
                <div style={{ marginTop: '0.25rem' }}>
                  {process.details.courseCodes?.map((code, idx) => (
                    <span key={idx} className="wf-course-pill">{code}</span>
                  ))}
                </div>
              </div>
              <div className="wf-detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="wf-detail-label">Reason / Clinical Diagnosis</span>
                <span className="wf-detail-value" style={{ fontWeight: 'normal', color: '#334155' }}>
                  {process.details.reason}
                </span>
              </div>
              {process.details.attachedDocumentName && (
                <div className="wf-detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="wf-detail-label">Attached Certification Document</span>
                  <span className="wf-detail-value" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {process.details.attachedDocumentName} (Certified PDF Slip)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              MULTI-STAGE SEQUENTIAL PIPELINE TRACKER
              ================================================================ */}
          <div>
            <div className="wf-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Multi-Stage Departmental & Faculty Verification Pipeline
            </div>

            <div className="wf-stepper-container">
              {process.stages?.map((stage, idx) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isCurrent = stage.status === 'CURRENT';
                const isStageDeclined = stage.status === 'DECLINED';
                const isPending = stage.status === 'PENDING';

                const itemClass = isCompleted
                  ? 'is-completed'
                  : isStageDeclined
                  ? 'is-declined'
                  : isCurrent
                  ? 'is-current'
                  : 'is-pending';

                return (
                  <div key={idx} className={`wf-step-item ${itemClass}`}>
                    <div className="wf-step-icon">
                      {isCompleted && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {isStageDeclined && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                      {isCurrent && <span>{idx + 1}</span>}
                      {isPending && <span>{idx + 1}</span>}
                    </div>

                    <div className="wf-step-content">
                      <div className="wf-step-top-line">
                        <span className="wf-step-title">{stage.label}</span>
                        <span className={`wf-step-status-pill status-${stage.status.toLowerCase()}`}>
                          {stage.status}
                        </span>
                      </div>

                      {stage.actionTakenBy ? (
                        <div className="wf-step-meta">
                          Action by: <strong>{stage.actionTakenBy}</strong> ({stage.actionTakenRole}) • {formatDateTime(stage.actionDate)}
                        </div>
                      ) : (
                        <div className="wf-step-meta">
                          Assigned authority: <strong>{stage.role.toUpperCase()}</strong> • {isCurrent ? 'Awaiting verification' : 'Pending prior steps'}
                        </div>
                      )}

                      {stage.remarks && (
                        <div className="wf-step-remarks">
                          "{stage.remarks}"
                        </div>
                      )}

                      {stage.digitalStamp && (
                        <div className="wf-step-stamp">
                          🔒 Stamp: {stage.digitalStamp}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================================
              IMMUTABLE AUDIT TRAIL LOG
              ================================================================ */}
          <div>
            <div className="wf-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Complete Audit Trail & Event Timeline
            </div>

            <div className="wf-audit-list">
              {process.auditLog?.map((log, idx) => (
                <div key={idx} className="wf-audit-item">
                  <span className={`wf-audit-badge audit-${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                  <div className="wf-audit-content">
                    <div className="wf-audit-actor">
                      {log.actorName} <span style={{ color: '#64748b', fontWeight: 'normal' }}>({log.actorRole})</span>
                    </div>
                    <div className="wf-audit-text">{log.comment}</div>
                    <div className="wf-audit-time">{formatDateTime(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="wf-modal-footer">
          <button className="wf-btn-secondary" onClick={onClose}>
            Close Tracker
          </button>
          {onActionClick && typeof onActionClick === 'function' && !isApproved && !isDeclined && (
            <button className="wf-btn-primary" onClick={() => onActionClick(process)}>
              Review & Take Action
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
