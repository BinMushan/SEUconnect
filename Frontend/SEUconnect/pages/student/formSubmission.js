// Maps the printable faculty forms to the five examination workflows and builds the API payload.

const FORM_WORKFLOW = {
  'SEU-EX-CA-REP': 'eca_application',
  'SEU-EX-ESA-REP': 'esa_application',
  'SEU-EX-FORM': 'exam_form',
  'SEU-ICT-MED-LEC': 'subject_medical',
  'SEU-MED-ABSENT': 'medical', // decided by the absence category chosen on the form
};

export const WORKFLOW_INFO = {
  eca_application: { label: 'ECA Application', route: 'SAR → Examination Branch → Lecturer → HOD', submitTo: 'SAR', availabilityKey: 'eca', needsPayment: true },
  esa_application: { label: 'ESA Application', route: 'SAR → Examination Branch → Lecturer → HOD', submitTo: 'SAR', availabilityKey: 'esa', needsPayment: true },
  exam_form: { label: 'Examination Form', route: 'Lecturer → HOD → SAR → Examination Branch', submitTo: 'your assigned Lecturer', availabilityKey: 'examForm', needsLecturer: true },
  subject_medical: { label: 'Subject Medical', route: 'Department MA (final approval)', submitTo: 'the Department MA', isMedical: true },
  exam_medical: { label: 'Examination Medical', route: 'Faculty MA → SAR → Examination Branch → SAR (Senate copy)', submitTo: 'the Faculty MA', isMedical: true },
};

export function resolveWorkflowType(formId, formData) {
  const mapped = FORM_WORKFLOW[formId];
  if (mapped === 'medical') return formData.medicalSubjectType === 'Attendance for the Lecture' ? 'subject_medical' : 'exam_medical';
  return mapped || null;
}

export const defaultExtras = () => ({
  payment: { voucherNo: '', amount: '', date: new Date().toISOString().split('T')[0], bankBranch: "People's Bank, Addalaichenai" },
  receipt: null,
  lecturerEmail: '',
  medical: { doctorName: '', hospital: 'University Medical Centre, Oluvil', certificateNo: '', issueDate: '', documentName: '' },
});

const cleanSubjects = (list = []) =>
  list
    .map((s) => ({ code: String(s.code || '').trim(), title: String(s.title || '').trim() }))
    .filter((s) => s.code || s.title);

export const subjectsFor = (type, formData) => cleanSubjects(WORKFLOW_INFO[type]?.isMedical ? formData.medicalSubjectsList : formData.examSubjects);

// Client-side checks that mirror the server rules, so students get instant feedback.
export function validateSubmission(type, formData, extras) {
  const info = WORKFLOW_INFO[type];
  if (!info) return 'This form cannot be submitted online.';
  if (!subjectsFor(type, formData).length) return 'Add at least one subject (code or title) to the form.';
  if (info.needsPayment) {
    if (!extras.payment.voucherNo.trim()) return "Enter the People's Bank voucher / receipt number.";
    if (!(Number(extras.payment.amount) > 0)) return 'Enter the amount paid.';
    if (!extras.payment.date) return 'Enter the payment date.';
    if (!extras.receipt) return 'Upload the payment voucher / receipt (PNG, JPG or PDF) before submitting.';
  }
  if (info.needsLecturer && !extras.lecturerEmail) return 'Select the lecturer this form should be submitted to.';
  if (info.isMedical) {
    if (String(formData.medicalReason || '').trim().length < 10) return 'Describe the medical reason (at least 10 characters).';
    if (!formData.leaveFrom || !formData.leaveTo) return 'Enter the medical leave dates.';
    if (formData.leaveTo < formData.leaveFrom) return 'The leave end date cannot be before the start date.';
  }
  return '';
}

export function buildPayload(type, formData, extras, formName) {
  const info = WORKFLOW_INFO[type];
  const payload = {
    type,
    title: `${formName} - ${formData.registrationNumber}`,
    semester: formData.currentSemester,
    academicYear: '2025/2026',
    subjects: subjectsFor(type, formData),
    // Snapshot of everything printed on the form, kept for the reviewers.
    formData: { ...formData, examSubjects: undefined, medicalSubjectsList: undefined },
  };
  if (info.needsPayment) {
    payload.payment = { ...extras.payment, amount: Number(extras.payment.amount) };
    payload.receipt = extras.receipt;
  }
  if (info.needsLecturer) payload.assignedLecturerEmail = extras.lecturerEmail;
  if (info.isMedical) {
    payload.medical = {
      reason: formData.medicalReason.trim(),
      fromDate: formData.leaveFrom,
      toDate: formData.leaveTo,
      ...extras.medical,
    };
  }
  return payload;
}

// Reads a File into the { name, mime, size, dataUrl } shape the API expects.
export function readReceipt(file) {
  return new Promise((resolve, reject) => {
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
      reject(new Error('Receipt must be a PNG, JPG or PDF file.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Receipt file is too large (maximum 5 MB).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, mime: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

const padRows = (list, size = 12) => {
  const rows = [...list];
  while (rows.length < size) rows.push({ sno: String(rows.length + 1).padStart(2, '0'), code: '', title: '' });
  return rows;
};

// Pre-fills the form from a returned application so the student only changes what was flagged.
export function prefillFromProcess(process, formData) {
  const saved = process.formData || {};
  const subjects = (saved.subjects || []).map((s, i) => ({ sno: String(i + 1).padStart(2, '0'), code: s.code || '', title: s.title || '' }));
  const medical = saved.medical;
  const next = {
    ...formData,
    ...saved,
    examSubjects: padRows(subjects, 12),
    medicalSubjectsList: padRows(subjects, 8),
    pivVoucherImage: process.paymentReceipt?.dataUrl || saved.pivVoucherImage || formData.pivVoucherImage || null,
    candidateSignatureImage: saved.candidateSignatureImage || formData.candidateSignatureImage || null,
  };
  if (medical) {
    next.medicalReason = medical.reason;
    next.leaveFrom = medical.fromDate;
    next.leaveTo = medical.toDate;
  }
  return next;
}
