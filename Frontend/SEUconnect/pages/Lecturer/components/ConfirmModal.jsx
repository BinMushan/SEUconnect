import React from 'react';

/**
 * ConfirmModal component
 * General-purpose confirmation modal for critical actions like final grade submission or deleting announcements.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmType = 'primary', // 'primary', 'danger', 'success'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="lec-modal-backdrop" onClick={onCancel}>
      <div className="lec-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="lec-modal-header">
          <div className="lec-modal-header-icon-wrap">
            {confirmType === 'danger' ? (
              <div className="modal-icon icon-danger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            ) : confirmType === 'success' ? (
              <div className="modal-icon icon-success">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            ) : (
              <div className="modal-icon icon-info">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="lec-modal-title">{title}</h3>
            <p className="lec-modal-desc">{message}</p>
          </div>
        </div>

        <div className="lec-modal-actions">
          <button type="button" className="lec-modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`lec-modal-btn-confirm btn-${confirmType}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

