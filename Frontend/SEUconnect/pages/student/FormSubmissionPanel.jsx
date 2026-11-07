import { useEffect, useState } from 'react';
import api from '../../src/services/api.js';
import { WORKFLOW_INFO, readReceipt } from './formSubmission.js';

/**
 * Submission editor shown under the form preview: subjects, payment + receipt upload (ECA / ESA),
 * lecturer (Examination Form) and medical particulars. The Submit button itself lives in the
 * form toolbar and in this panel; both call the same handler.
 */
export default function FormSubmissionPanel({ type, user, formData, setFormData, extras, setExtras, availability, submitting, error, result, isResubmit, onSubmit, onTrack }) {
  const info = WORKFLOW_INFO[type];
  const [lecturers, setLecturers] = useState([]);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!info?.needsLecturer) return undefined;
    let cancelled = false;
    api
      .getDirectory({ role: 'lecturer', department: user?.department })
      .then((res) => {
        if (!cancelled) setLecturers(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [info?.needsLecturer, user?.department]);

  if (!info) return null;

  const isRescrutiny = type === 'rescrutiny_application';
  const isEmail = type === 'email_request';

  useEffect(() => {
    if (isRescrutiny) {
      setExtras((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          amount: prev.payment.amount && prev.payment.amount !== '0' ? prev.payment.amount : (formData.rescrutinyAmount || '500'),
          voucherNo: prev.payment.voucherNo || formData.rescrutinyReceiptNo || formData.receiptNo || '',
        }
      }));
    }
  }, [isRescrutiny, formData.rescrutinyAmount, formData.rescrutinyReceiptNo, formData.receiptNo]);

  const portal = info.availabilityKey ? availability?.[info.availabilityKey] : null;
  const closed = portal && (!portal.isOpen || (portal.deadline && Date.now() > Date.parse(portal.deadline)));
  const listKey = info.isMedical ? 'medicalSubjectsList' : 'examSubjects';
  const subjects = isRescrutiny
    ? [{ code: formData.rescrutinyCode || 'ICT22011', title: formData.rescrutinyTitle || 'Web Application Development' }]
    : isEmail
    ? [{ code: 'GSUITE-EMAIL', title: `${formData.preferredEmailPrefix || formData.registrationNumber || 'student'}@seu.ac.lk` }]
    : formData[listKey] || [];

  const setSubject = (index, field, value) => {
    if (isRescrutiny) {
      if (field === 'code') setFormData({ ...formData, rescrutinyCode: value });
      else setFormData({ ...formData, rescrutinyTitle: value });
      return;
    }
    const next = subjects.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setFormData({ ...formData, [listKey]: next });
  };
  const addSubject = () => {
    if (isRescrutiny || isEmail) return;
    setFormData({ ...formData, [listKey]: [...subjects, { sno: String(subjects.length + 1).padStart(2, '0'), code: '', title: '' }] });
  };
  const removeSubject = (index) => {
    if (isRescrutiny || isEmail) return;
    setFormData({ ...formData, [listKey]: subjects.filter((_, i) => i !== index) });
  };

  const setPayment = (field, value) => setExtras({ ...extras, payment: { ...extras.payment, [field]: value } });
  const setMedical = (field, value) => setExtras({ ...extras, medical: { ...extras.medical, [field]: value } });

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    setFileError('');
    if (!file) return;
    try {
      const receiptData = await readReceipt(file);
      setExtras({ ...extras, receipt: receiptData });
      setFormData((prev) => ({
        ...prev,
        pivVoucherImage: receiptData.dataUrl,
        pivVoucherFileName: receiptData.name
      }));
    } catch (err) {
      setExtras({ ...extras, receipt: null });
      setFileError(err.message);
      event.target.value = '';
    }
  };

  if (result) {
    return (
      <div className="seu-editor-panel no-print seu-submit-success">
        <h3 className="seu-editor-panel-title">
          <span>✓ {info.label} submitted</span>
        </h3>
        <p style={{ margin: '0 0 .6rem' }}>
          Your application <strong>{result.trackingNumber}</strong> was routed to {info.submitTo}. Current status: <strong>{result.status}</strong>. You will receive a notification at every step.
        </p>
        <button type="button" className="seu-btn-primary-sm" onClick={onTrack}>
          Track this application
        </button>
      </div>
    );
  }

  return (
    <div className="seu-editor-panel no-print">
      <h3 className="seu-editor-panel-title">
        <span>{isResubmit ? 'Correct & Resubmit' : 'Submit Online'} — {info.label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>Route: {info.route}</span>
      </h3>

      {closed && (
        <div className="seu-submit-alert">
          The {info.label} portal is closed{portal?.deadline ? ` (deadline ${new Date(portal.deadline).toDateString()})` : ''}. The SAR must reopen it before you can submit.
        </div>
      )}

      <div className="seu-submit-block">
        <div className="seu-submit-block-title">Subjects</div>
        <table className="seu-submit-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th style={{ width: 150 }}>Subject code</th>
              <th>Subject title</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input type="text" value={s.code} placeholder="ICT31012" onChange={(e) => setSubject(i, 'code', e.target.value)} aria-label={`Subject ${i + 1} code`} />
                </td>
                <td>
                  <input type="text" value={s.title} placeholder="Subject title" onChange={(e) => setSubject(i, 'title', e.target.value)} aria-label={`Subject ${i + 1} title`} />
                </td>
                <td>
                  <button type="button" className="seu-link-btn" onClick={() => removeSubject(i)} aria-label={`Remove subject ${i + 1}`}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isRescrutiny && !isEmail && (
          <button type="button" className="seu-btn-secondary-sm" onClick={addSubject}>
            + Add subject
          </button>
        )}
      </div>

      {info.needsPayment && (
        <div className="seu-submit-block">
          <div className="seu-submit-block-title">Payment & receipt (People&apos;s Bank PIV)</div>
          <div className="seu-editor-grid">
            <div className="seu-form-group">
              <label>Voucher / receipt number</label>
              <input type="text" value={extras.payment.voucherNo} onChange={(e) => setPayment('voucherNo', e.target.value)} placeholder="PIV-2026-00000" />
            </div>
            <div className="seu-form-group">
              <label>Amount paid (Rs.)</label>
              <input type="number" min="0" value={extras.payment.amount} onChange={(e) => setPayment('amount', e.target.value)} />
            </div>
            <div className="seu-form-group">
              <label>Payment date</label>
              <input type="date" value={extras.payment.date} onChange={(e) => setPayment('date', e.target.value)} />
            </div>
            <div className="seu-form-group">
              <label>Bank / branch</label>
              <input type="text" value={extras.payment.bankBranch} onChange={(e) => setPayment('bankBranch', e.target.value)} />
            </div>
            <div className="seu-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Upload voucher / receipt (PNG, JPG or PDF, max 5 MB)</label>
              <input type="file" accept="image/png,image/jpeg,application/pdf" onChange={onFile} />
              {(extras.receipt || formData.pivVoucherImage) && (
                <div className="seu-submit-hint" style={{ color: '#15803d', fontWeight: 600 }}>
                  ✓ Attached: {extras.receipt?.name || formData.pivVoucherFileName || 'PIV Payment Voucher Slip'}{extras.receipt?.size ? ` (${Math.round(extras.receipt.size / 1024)} KB)` : ''}
                </div>
              )}
              {fileError && <div className="seu-submit-error">{fileError}</div>}
            </div>
          </div>
        </div>
      )}

      {info.needsLecturer && (
        <div className="seu-submit-block">
          <div className="seu-submit-block-title">Submit to lecturer</div>
          <div className="seu-form-group">
            <label>Assigned lecturer</label>
            <select value={extras.lecturerEmail} onChange={(e) => setExtras({ ...extras, lecturerEmail: e.target.value })}>
              <option value="">Select lecturer…</option>
              {lecturers.map((l) => (
                <option key={l.email} value={l.email}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {info.isMedical && (
        <div className="seu-submit-block">
          <div className="seu-submit-block-title">Medical particulars</div>
          <div className="seu-editor-grid">
            <div className="seu-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Reason for absence</label>
              <textarea rows={3} value={formData.medicalReason} onChange={(e) => setFormData({ ...formData, medicalReason: e.target.value })} />
            </div>
            <div className="seu-form-group">
              <label>Medical officer / doctor</label>
              <input type="text" value={extras.medical.doctorName} onChange={(e) => setMedical('doctorName', e.target.value)} />
            </div>
            <div className="seu-form-group">
              <label>Hospital / clinic</label>
              <input type="text" value={extras.medical.hospital} onChange={(e) => setMedical('hospital', e.target.value)} />
            </div>
            <div className="seu-form-group">
              <label>Medical certificate no.</label>
              <input type="text" value={extras.medical.certificateNo} onChange={(e) => setMedical('certificateNo', e.target.value)} />
            </div>
            <div className="seu-form-group">
              <label>Certificate issue date</label>
              <input type="date" value={extras.medical.issueDate} onChange={(e) => setMedical('issueDate', e.target.value)} />
            </div>
          </div>
          <div className="seu-submit-hint">
            {type === 'subject_medical' ? 'Subject Medical goes only to your Department MA, who gives the final approval.' : 'Examination Medical goes to the Faculty MA, then the SAR and Examination Branch.'}
          </div>
        </div>
      )}

      {error && <div className="seu-submit-error">{error}</div>}

      <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="seu-btn-primary-sm" disabled={submitting || closed} onClick={onSubmit}>
          {submitting ? 'Submitting…' : isResubmit ? 'Resubmit corrected application' : `Submit ${info.label}`}
        </button>
        <span className="seu-submit-hint">Only students can submit. Print a copy for your records before or after submitting.</span>
      </div>
    </div>
  );
}
