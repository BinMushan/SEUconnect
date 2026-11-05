import { useEffect, useState } from 'react';
import api from '../../src/services/api.js';
import { ROLE_LABELS, WORKFLOW_ROUTES, formatDate, statusTone, typeLabel } from './workflowMeta.js';
import './workflowDesk.css';

const Field = ({ label, children }) => (
  <>
    <dt>{label}</dt>
    <dd>{children || '—'}</dd>
  </>
);

/**
 * Full view of one application: submitted form, payment evidence, route timeline, audit trail,
 * and - when the signed-in role owns the current stage - the approve / return / decline actions.
 */
export default function ApplicationDetail({ processId, onClose, onChanged, initial = null }) {
  const [process, setProcess] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(null); // 'approve' | 'return' | 'decline'
  const [text, setText] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [lecturerEmail, setLecturerEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getProcessById(processId)
      .then((res) => {
        if (!cancelled) setProcess(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [processId]);

  const perms = process?.permissions;
  const needsLecturerPick = Boolean(perms?.sendsDepartmentList);

  useEffect(() => {
    if (!needsLecturerPick || !process) return undefined;
    let cancelled = false;
    api
      .getDirectory({ role: 'lecturer', department: process.student?.department })
      .then((res) => {
        if (cancelled) return;
        setLecturers(res.data || []);
        setLecturerEmail(process.assignedLecturer?.email || '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [needsLecturerPick, process]);

  const run = async (fn, successMessage) => {
    setBusy(true);
    setError('');
    try {
      const res = await fn();
      setProcess(res.data);
      setMode(null);
      setText('');
      onChanged?.(res.data, res.message || successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitAction = () => {
    const id = process.trackingNumber;
    if (mode === 'approve') {
      return run(() => api.approveStage(id, { remarks: text, assignedLecturerEmail: lecturerEmail || undefined }));
    }
    if (!text.trim()) {
      setError(mode === 'return' ? 'Explain what the student must correct.' : 'A decline reason is mandatory.');
      return undefined;
    }
    return run(() => (mode === 'return' ? api.returnProcess(id, { reason: text }) : api.declineProcess(id, { reason: text })));
  };

  const openReceipt = async () => {
    try {
      const blob = await api.fetchReceiptBlob(process.trackingNumber);
      window.open(URL.createObjectURL(blob), '_blank', 'noopener');
    } catch (err) {
      setError(err.message);
    }
  };

  const form = process?.formData || {};
  const subjects = form.subjects?.length ? form.subjects : (process?.details?.courseCodes || []).map((c) => ({ code: c, title: '' }));
  const medical = form.medical;
  const pay = process?.paymentReceipt;

  return (
    <div className="wfd-overlay" onClick={onClose} role="presentation">
      <aside className="wfd-drawer" onClick={(e) => e.stopPropagation()} aria-label="Application details">
        <div className="wfd-drawer-head">
          <div>
            <h3>{process?.trackingNumber || 'Loading…'}</h3>
            {process && (
              <div className="wfd-sub">
                {typeLabel(process.type)} · {process.student?.name} ({process.student?.regNo})
              </div>
            )}
          </div>
          <button type="button" className="wfd-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="wfd-error">{error}</div>}
        {!process && !error && <div className="wfd-empty">Loading application…</div>}

        {process && (
          <>
            <span className={`wfd-badge ${statusTone(process.status)}`}>{process.status}</span>{' '}
            <span className="wfd-sub">Currently with: {ROLE_LABELS[process.currentAssignedRole] || process.currentAssignedRole}</span>

            {WORKFLOW_ROUTES[process.type] && (
              <div className="wfd-section">
                <h4>Workflow route</h4>
                <div className="wfd-route">
                  {WORKFLOW_ROUTES[process.type].map((step, i) => (
                    <span key={step}>
                      {i > 0 && <span className="arrow"> → </span>}
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {process.status === 'Returned for Correction' && process.returnDetails?.reason && (
              <div className="wfd-note warn" style={{ marginTop: '1rem' }}>
                <b>Returned by {process.returnDetails.returnedByRole}:</b> {process.returnDetails.reason}
              </div>
            )}
            {process.status === 'Declined' && process.declineDetails?.reason && (
              <div className="wfd-note warn" style={{ marginTop: '1rem' }}>
                <b>Declined by {process.declineDetails.declinedByRole}:</b> {process.declineDetails.reason}
              </div>
            )}

            <div className="wfd-section">
              <h4>Applicant</h4>
              <dl className="wfd-kv">
                <Field label="Name">{process.student?.name}</Field>
                <Field label="Registration No">{process.student?.regNo}</Field>
                <Field label="Department">{process.student?.department}</Field>
                <Field label="Programme / Semester">{`${process.student?.programme || ''} · ${process.formSemester || process.student?.semester || ''}`}</Field>
                <Field label="Submitted">{formatDate(process.createdAt, true)}</Field>
                {process.assignedLecturer?.email && <Field label="Assigned lecturer">{process.assignedLecturer.name}</Field>}
              </dl>
            </div>

            <div className="wfd-section">
              <h4>Subjects</h4>
              {subjects.length ? (
                <table className="wfd-subjects">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => (
                      <tr key={`${s.code}-${i}`}>
                        <td>{s.code}</td>
                        <td>{s.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="wfd-sub">No subjects listed.</div>
              )}
            </div>

            {medical && (
              <div className="wfd-section">
                <h4>Medical details</h4>
                <dl className="wfd-kv">
                  <Field label="Leave period">{`${formatDate(medical.fromDate)} – ${formatDate(medical.toDate)}`}</Field>
                  <Field label="Reason">{medical.reason}</Field>
                  <Field label="Medical officer">{medical.doctorName}</Field>
                  <Field label="Hospital / clinic">{medical.hospital}</Field>
                  <Field label="Certificate no.">{medical.certificateNo}</Field>
                  <Field label="Certificate file">{medical.documentName}</Field>
                </dl>
              </div>
            )}

            {pay && (pay.voucherNo || pay.hasFile) && (
              <div className="wfd-section">
                <h4>Payment evidence</h4>
                <dl className="wfd-kv">
                  <Field label="Voucher / receipt no.">{pay.voucherNo}</Field>
                  <Field label="Amount">{pay.amount ? `Rs. ${pay.amount}` : ''}</Field>
                  <Field label="Bank / branch">{pay.bankBranch}</Field>
                  <Field label="Payment date">{formatDate(pay.date)}</Field>
                  <Field label="Verified by SAR">{pay.verifiedBySAR ? 'Yes' : 'Not yet'}</Field>
                </dl>
                {pay.hasFile && (
                  <button type="button" className="wfd-btn sm" style={{ marginTop: '.5rem' }} onClick={openReceipt}>
                    View uploaded receipt ({process.receiptFile?.name || 'file'})
                  </button>
                )}
              </div>
            )}

            {process.departmentList?.forwardedAt && (
              <div className="wfd-section">
                <h4>Department-wise list</h4>
                <dl className="wfd-kv">
                  <Field label="List reference">{process.departmentList.listRef}</Field>
                  <Field label="Sent by">{process.departmentList.sentBy}</Field>
                  <Field label="Sent on">{formatDate(process.departmentList.forwardedAt, true)}</Field>
                </dl>
              </div>
            )}

            {(process.admissionDetails?.admissionNo || process.senateCopy?.trackingNo) && (
              <div className="wfd-section">
                <h4>SAR outputs (tracked separately)</h4>
                <dl className="wfd-kv">
                  {process.admissionDetails?.admissionNo && <Field label="Dean Office Admission">{`${process.admissionDetails.admissionNo} · ${formatDate(process.admissionDetails.issuedAt)}`}</Field>}
                  {process.senateCopy?.trackingNo && (
                    <Field label="Copy to Senate">{`${process.senateCopy.trackingNo} · ${process.senateCopy.submittedAt ? `submitted ${formatDate(process.senateCopy.submittedAt)}` : 'prepared'}`}</Field>
                  )}
                </dl>
              </div>
            )}

            <div className="wfd-section">
              <h4>Approval route</h4>
              <ul className="wfd-timeline">
                {process.stages.map((s) => (
                  <li key={s.stageKey} className={s.status}>
                    <i />
                    <b>{s.label}</b>
                    <span className="wfd-sub">
                      {ROLE_LABELS[s.role] || s.role} · {s.status}
                      {s.actionDate ? ` · ${formatDate(s.actionDate, true)}` : ''}
                    </span>
                    {s.actionTakenBy && <div className="wfd-sub">By {s.actionTakenBy}</div>}
                    {s.remarks && <div className="wfd-sub">“{s.remarks}”</div>}
                  </li>
                ))}
              </ul>
            </div>

            {perms?.canAct && !perms.isOutputsStage && (
              <div className="wfd-actions">
                {!mode && (
                  <>
                    <div className="wfd-note">This application is waiting for your action.</div>
                    <div className="wfd-btn-row">
                      <button type="button" className="wfd-btn primary" onClick={() => setMode('approve')}>
                        {perms.approveLabel}
                      </button>
                      <button type="button" className="wfd-btn" onClick={() => setMode('return')}>
                        Return for correction
                      </button>
                      <button type="button" className="wfd-btn danger" onClick={() => setMode('decline')}>
                        Decline
                      </button>
                    </div>
                  </>
                )}
                {mode && (
                  <>
                    {mode === 'approve' && needsLecturerPick && (
                      <div>
                        <label htmlFor="wfd-lecturer">Assign lecturer for checking</label>
                        <select id="wfd-lecturer" value={lecturerEmail} onChange={(e) => setLecturerEmail(e.target.value)}>
                          <option value="">Any lecturer of the department</option>
                          {lecturers.map((l) => (
                            <option key={l.email} value={l.email}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <label htmlFor="wfd-text">{mode === 'approve' ? 'Remarks (optional)' : mode === 'return' ? 'What must the student correct? (required)' : 'Decline reason (required)'}</label>
                    <textarea id="wfd-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
                    <div className="wfd-btn-row">
                      <button type="button" className={`wfd-btn ${mode === 'decline' ? 'danger' : 'primary'}`} disabled={busy} onClick={submitAction}>
                        {busy ? 'Saving…' : mode === 'approve' ? `Confirm: ${perms.approveLabel}` : mode === 'return' ? 'Return to student' : 'Confirm decline'}
                      </button>
                      <button type="button" className="wfd-btn" disabled={busy} onClick={() => { setMode(null); setError(''); }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            {perms?.canAct && perms.isOutputsStage && (
              <div className="wfd-note">This step (Dean Office Admission / Senate copy) is completed from the SAR dashboard.</div>
            )}
            {perms && !perms.canAct && perms.blockedReason && process.status !== 'Approved' && <div className="wfd-note">{perms.blockedReason}</div>}

            <div className="wfd-section">
              <h4>Audit trail</h4>
              <ul className="wfd-timeline">
                {[...process.auditLog].reverse().map((a, i) => (
                  <li key={i} className="COMPLETED">
                    <i />
                    <b>{a.action.replace(/_/g, ' ')}</b>
                    <span className="wfd-sub">
                      {a.actorName} ({a.actorRole}) · {formatDate(a.timestamp, true)}
                    </span>
                    {a.comment && <div className="wfd-sub">{a.comment}</div>}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
