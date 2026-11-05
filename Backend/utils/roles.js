// Canonical role keys used across the backend. The frontend sometimes sends
// aliases (department_ma, faculty_ma), so every role string goes through here.
const ROLE_ALIASES = {
  department_ma: 'dept_ma',
  faculty_ma: 'fma',
};

const ALL_ROLES = ['student', 'lecturer', 'hod', 'dean', 'sar', 'examination', 'dept_ma', 'fma', 'admin', 'superadmin', 'faculty_admin', 'demonstrator'];

const ROLE_LABELS = {
  student: 'Student',
  lecturer: 'Lecturer',
  hod: 'Head of Department',
  dean: 'Dean',
  sar: 'Senior Assistant Registrar (SAR)',
  examination: 'Examination Branch',
  dept_ma: 'Department Management Assistant',
  fma: 'Faculty Management Assistant',
  admin: 'System Administrator',
  superadmin: 'Super Administrator',
  faculty_admin: 'Faculty Administrator',
  demonstrator: 'Demonstrator',
};

const normalizeRole = (role) => {
  const key = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[key] || key;
};

// "Department of Information and Communication Technology" -> "ICT"
const deptCode = (department) => {
  const d = String(department || '').toLowerCase();
  if (d.includes('bio') || d.includes('bst')) return 'BST';
  if (d.includes('information') || d.includes('ict')) return 'ICT';
  return 'FACULTY';
};

const sameDepartment = (a, b) => deptCode(a) === deptCode(b);

module.exports = { ALL_ROLES, ROLE_LABELS, normalizeRole, deptCode, sameDepartment };
