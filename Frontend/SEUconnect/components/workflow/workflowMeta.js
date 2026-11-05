// Shared labels / helpers for the five examination-form workflows.

export const WORKFLOW_TYPES = ['eca_application', 'esa_application', 'exam_form', 'subject_medical', 'exam_medical'];

export const TYPE_LABELS = {
  eca_application: 'ECA Application',
  esa_application: 'ESA Application',
  exam_form: 'Examination Form',
  subject_medical: 'Subject Medical',
  exam_medical: 'Examination Medical',
  medical_excuse: 'Medical Excuse',
  repeat_exam: 'Repeat Exam',
  add_drop: 'Add / Drop',
  leave_absence: 'Leave of Absence',
  special_concession: 'Special Concession',
};

export const ROLE_LABELS = {
  student: 'Student',
  lecturer: 'Lecturer',
  hod: 'Head of Department',
  sar: 'SAR',
  examination: 'Examination Branch',
  dept_ma: 'Department MA',
  fma: 'Faculty MA',
  dean: 'Dean',
  admin: 'Administrator',
  superadmin: 'Super Administrator',
  completed: 'Completed',
};

// Describes the route each workflow follows, in the order shown in the workflow PDF.
export const WORKFLOW_ROUTES = {
  eca_application: ['Student', 'SAR', 'Examination Branch', 'Lecturer', 'HOD'],
  esa_application: ['Student', 'SAR', 'Examination Branch', 'Lecturer', 'HOD'],
  exam_form: ['Student', 'Lecturer', 'HOD', 'SAR', 'Examination Branch', 'SAR outputs'],
  subject_medical: ['Student', 'Department MA'],
  exam_medical: ['Student', 'Faculty MA', 'SAR', 'Examination Branch', 'SAR (Senate copy)'],
};

export const typeLabel = (type) => TYPE_LABELS[type] || type;

export function statusTone(status = '') {
  if (status === 'Approved') return 'good';
  if (status === 'Declined') return 'bad';
  if (status === 'Returned for Correction') return 'warn';
  if (status.startsWith('Admission')) return 'info';
  return 'pending';
}

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return withTime
    ? d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
  if (!value) return '';
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(value);
}

export const deptShort = (department = '') => {
  const d = department.toLowerCase();
  if (d.includes('bio') || d.includes('bst')) return 'BST';
  if (d.includes('information') || d.includes('ict')) return 'ICT';
  return 'Faculty';
};

export const isClosed = (p) => ['Approved', 'Declined'].includes(p.status);
