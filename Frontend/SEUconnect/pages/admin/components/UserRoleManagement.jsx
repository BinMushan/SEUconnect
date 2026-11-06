import { useState } from 'react';

const getDefaultsForRole = (role) => {
  switch (role) {
    case 'Student':
      return {
        dept: 'Department of Information & Communication Technology',
        designation: 'Undergraduate Student',
        tempPass: 'Seu@Student2024'
      };
    case 'Lecturer':
      return {
        dept: 'Department of Information & Communication Technology',
        designation: 'Lecturer (Probationary)',
        tempPass: 'Seu@Lecturer2024'
      };
    case 'Head of Department (HOD)':
      return {
        dept: 'Department of Information & Communication Technology',
        designation: 'Head / Senior Lecturer Gr. I',
        tempPass: 'Seu@HOD2024'
      };
    case 'Faculty Dean':
      return {
        dept: "Dean's Secretariat",
        designation: 'Dean, Faculty of Technology',
        tempPass: 'Seu@Dean2024'
      };
    case 'Senior Assistant Registrar (SAR)':
      return {
        dept: 'Faculty Administration Office',
        designation: 'Senior Assistant Registrar',
        tempPass: 'Seu@SAR2024'
      };
    case 'Examination Officer':
      return {
        dept: 'Examination Branch',
        designation: 'Senior Assistant Registrar (Examinations & Records)',
        tempPass: 'Seu@Exam2024'
      };
    case 'Department Management Assistant (Dept MA)':
      return {
        dept: 'Department of Information & Communication Technology',
        designation: 'Management Assistant Gr. I',
        tempPass: 'Seu@DeptMA2024'
      };
    case 'Faculty Management Assistant (FMA)':
      return {
        dept: "Dean's Secretariat",
        designation: 'Management Assistant (Dean’s Office)',
        tempPass: 'Seu@FMA2024'
      };
    case 'System Administrator':
      return {
        dept: 'Faculty Administration Office',
        designation: 'System Administrator',
        tempPass: 'Seu@Admin2024'
      };
    case 'Super Admin':
      return {
        dept: 'Center for Information & Communication Technology (CICT)',
        designation: 'Lead Systems Architect & Super Admin',
        tempPass: 'Seu@SuperAdmin2024'
      };
    default:
      return {
        dept: 'Department of Information & Communication Technology',
        designation: role,
        tempPass: `Seu@${role.replace(/[^a-zA-Z0-9]/g, '')}2024`
      };
  }
};

/**
 * Institutional Department / Branch mapping based on user role
 * - Dean: Faculty Wide (Dean's Secretariat)
 * - HOD: DBST or DICT only
 * - Lecturer: DBST or DICT only
 * - Dept MA (DMA): DBST or DICT only (each department)
 * - SAR: Faculty Administration Office
 * - Exam Officer: Examination Branch
 * - FMA: Dean's Secretariat / Faculty Admin
 * - Admin: Faculty Administration Office / CICT
 */
export const getDepartmentOptionsForRole = (role) => {
  switch (role) {
    case 'Faculty Dean':
      return [
        { value: "Dean's Secretariat", label: "Dean's Secretariat (Faculty of Technology)" }
      ];

    case 'Head of Department (HOD)':
      return [
        { value: 'Department of Information & Communication Technology', label: 'Department of ICT (DICT)' },
        { value: 'Department of Bio Systems Technology', label: 'Department of Biosystems Technology (DBST)' }
      ];

    case 'Lecturer':
      return [
        { value: 'Department of Information & Communication Technology', label: 'Department of ICT (DICT)' },
        { value: 'Department of Bio Systems Technology', label: 'Department of Biosystems Technology (DBST)' }
      ];

    case 'Department Management Assistant (Dept MA)':
      return [
        { value: 'Department of Information & Communication Technology', label: 'Department of ICT (DICT)' },
        { value: 'Department of Bio Systems Technology', label: 'Department of Biosystems Technology (DBST)' }
      ];

    case 'Senior Assistant Registrar (SAR)':
      return [
        { value: 'Faculty Administration Office', label: 'Faculty Administration Office (Faculty of Technology)' }
      ];

    case 'Examination Officer':
      return [
        { value: 'Examination Branch', label: 'Examination Branch (Examinations & Records)' }
      ];

    case 'Faculty Management Assistant (FMA)':
      return [
        { value: "Dean's Secretariat", label: "Dean's Secretariat (Faculty Executive)" },
        { value: 'Faculty Administration Office', label: 'Faculty Administration Office' }
      ];

    case 'System Administrator':
      return [
        { value: 'Faculty Administration Office', label: 'Faculty Administration Office' },
        { value: 'Center for Information & Communication Technology (CICT)', label: 'Center for Information & Communication Technology (CICT)' }
      ];

    case 'Super Admin':
      return [
        { value: 'Center for Information & Communication Technology (CICT)', label: 'Center for Information & Communication Technology (CICT)' },
        { value: 'Faculty Administration Office', label: 'Faculty Administration Office' }
      ];

    default:
      return [
        { value: 'Department of Information & Communication Technology', label: 'Department of ICT (DICT)' },
        { value: 'Department of Bio Systems Technology', label: 'Department of Biosystems Technology (DBST)' }
      ];
  }
};

export default function UserRoleManagement({
  users,
  onAssignRole,
  onAppointUser,
  onToggleUserStatus
}) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'matrix'
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Role Assignment Modal State (for existing user)
  const [editingUser, setEditingUser] = useState(null);
  const [assignedRole, setAssignedRole] = useState('Lecturer');
  const [assignedDept, setAssignedDept] = useState('Department of Information & Communication Technology');
  const [assignedDesignation, setAssignedDesignation] = useState('');

  // Appoint / Add User Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('Seu@Lecturer2024');
  const [newStaffRole, setNewStaffRole] = useState('Lecturer');
  const [newStaffDept, setNewStaffDept] = useState('Department of Information & Communication Technology');
  const [newStaffDesignation, setNewStaffDesignation] = useState('Lecturer (Probationary)');
  const [formError, setFormError] = useState('');
  const [assignError, setAssignError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Find leadership holders & system quota accounts
  const currentDean = users.find((u) => u.role === 'Faculty Dean');
  const hodIct = users.find((u) => u.role === 'Head of Department (HOD)' && (u.department.includes('ICT') || u.department.includes('Information')));
  const hodBst = users.find((u) => u.role === 'Head of Department (HOD)' && (u.department.includes('Biosystems') || u.department.includes('Bio') || u.department.includes('BST')));
  const examOfficer = users.find((u) => u.role === 'Examination Officer');
  const currentSar = users.find((u) => u.role === 'Senior Assistant Registrar (SAR)');
  const currentDeptMa = users.find((u) => u.role === 'Department Management Assistant (Dept MA)');
  const currentFma = users.find((u) => u.role === 'Faculty Management Assistant (FMA)');
  const currentAdmins = users.filter((u) => u.role === 'System Administrator');
  const lecturersCount = users.filter((u) => u.role === 'Lecturer').length;

  const getRoleRuleNotice = (role, dept, targetUserId = null) => {
    if (role === 'Faculty Dean') {
      const prev = users.find((u) => u.id !== targetUserId && u.role === 'Faculty Dean');
      return {
        type: 'warning',
        text: `Institutional Rule (1 Dean): Appointing a new Dean will automatically step down current Dean (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'Head of Department (HOD)') {
      const isBst = dept.includes('Bio') || dept.includes('BST');
      const deptLabel = isBst ? 'BST' : 'DICT';
      const prev = users.find((u) => {
        if (u.id === targetUserId || u.role !== 'Head of Department (HOD)') return false;
        const uIsBst = u.department?.includes('Bio') || u.department?.includes('BST');
        return uIsBst === isBst;
      });
      return {
        type: 'warning',
        text: `Institutional Rule (1 HOD per Dept): Appointing HOD for ${deptLabel} will automatically step down current HOD (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'Senior Assistant Registrar (SAR)') {
      const prev = users.find((u) => u.id !== targetUserId && u.role === 'Senior Assistant Registrar (SAR)');
      return {
        type: 'warning',
        text: `Institutional Rule (1 SAR): Appointing SAR will automatically step down current SAR (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'Examination Officer') {
      const prev = users.find((u) => u.id !== targetUserId && u.role === 'Examination Officer');
      return {
        type: 'warning',
        text: `Institutional Rule (1 Exam Officer): Appointing Examination Officer will automatically step down current officer (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'Department Management Assistant (Dept MA)') {
      const prev = users.find((u) => u.id !== targetUserId && u.role === 'Department Management Assistant (Dept MA)');
      return {
        type: 'warning',
        text: `Institutional Rule (1 Dept MA): Appointing Dept MA will automatically step down current assistant (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'Faculty Management Assistant (FMA)') {
      const prev = users.find((u) => u.id !== targetUserId && u.role === 'Faculty Management Assistant (FMA)');
      return {
        type: 'warning',
        text: `Institutional Rule (1 FMA): Appointing FMA will automatically step down current assistant (${prev ? prev.name : 'Unassigned'}) to Lecturer.`
      };
    }
    if (role === 'System Administrator') {
      const otherAdmins = users.filter((u) => u.id !== targetUserId && u.role === 'System Administrator');
      if (otherAdmins.length >= 2) {
        return {
          type: 'error',
          text: `Quota Limit Reached: The system strictly permits a maximum of 2 System Administrators (currently held by: ${otherAdmins.map((a) => a.name).join(' & ')}). You must reassign an existing administrator first.`
        };
      }
      return {
        type: 'info',
        text: `System Quota: Exactly 2 System Administrators permitted (${otherAdmins.length}/2 active). 1 slot available.`
      };
    }
    if (role === 'Lecturer') {
      return {
        type: 'info',
        text: 'Academic Staff Rule: Unlimited Lecturers allowed. No quota limit.'
      };
    }
    return null;
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'STUDENT') return u.role === 'Student';
    if (roleFilter === 'LECTURER') return u.role === 'Lecturer';
    if (roleFilter === 'HOD') return u.role === 'Head of Department (HOD)';
    if (roleFilter === 'DEAN') return u.role === 'Faculty Dean';
    if (roleFilter === 'SAR') return u.role === 'Senior Assistant Registrar (SAR)';
    if (roleFilter === 'EXAM') return u.role === 'Examination Officer';
    if (roleFilter === 'DEPT_MA') return u.role === 'Department Management Assistant (Dept MA)';
    if (roleFilter === 'FMA') return u.role === 'Faculty Management Assistant (FMA)';
    if (roleFilter === 'ADMIN') return u.role === 'System Administrator' || u.role === 'Super Admin';
    return true;
  });

  const handleCopyPassword = (id, pass) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(pass);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openAssignModal = (user) => {
    setEditingUser(user);
    setAssignedRole(user.role);
    const validDepts = getDepartmentOptionsForRole(user.role);
    const isCurrentValid = validDepts.some((d) => d.value === user.department);
    setAssignedDept(isCurrentValid ? user.department : validDepts[0].value);
    setAssignedDesignation(user.designation || user.role);
    setAssignError('');
  };

  const handleAssignedRoleChange = (role) => {
    setAssignedRole(role);
    const validDepts = getDepartmentOptionsForRole(role);
    const isCurrentValid = validDepts.some((d) => d.value === assignedDept);
    setAssignedDept(isCurrentValid ? assignedDept : validDepts[0].value);
    const def = getDefaultsForRole(role);
    setAssignedDesignation(def.designation);
    setAssignError('');
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (assignedRole === 'System Administrator') {
      const otherAdmins = users.filter((u) => u.id !== editingUser.id && u.role === 'System Administrator');
      if (otherAdmins.length >= 2) {
        setAssignError(`System Rule Limit: Maximum 2 System Administrators permitted. Currently held by ${otherAdmins.map((a) => a.name).join(' & ')}. Please reassign an existing administrator first.`);
        return;
      }
    }

    onAssignRole(editingUser.id, {
      role: assignedRole,
      department: assignedDept,
      designation: assignedDesignation.trim() || assignedRole
    });

    setEditingUser(null);
    setAssignError('');
  };

  const handleRoleSelectChange = (role) => {
    setNewStaffRole(role);
    const def = getDefaultsForRole(role);
    const validDepts = getDepartmentOptionsForRole(role);
    const isCurrentValid = validDepts.some((d) => d.value === newStaffDept);
    setNewStaffDept(isCurrentValid ? newStaffDept : validDepts[0].value);
    setNewStaffDesignation(def.designation);
    setNewStaffPassword(def.tempPass);
    setFormError('');
  };

  const handleGeneratePassword = () => {
    const randNum = Math.floor(100 + Math.random() * 900);
    const roleSlug = newStaffRole.replace(/[^a-zA-Z]/g, '').slice(0, 7);
    setNewStaffPassword(`Seu@${roleSlug || 'User'}${randNum}`);
  };

  const handleAppointSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      setFormError('Please enter Full Name and Institutional Email Address.');
      return;
    }

    if (newStaffRole === 'System Administrator') {
      const activeAdmins = users.filter((u) => u.role === 'System Administrator');
      if (activeAdmins.length >= 2) {
        setFormError(`System Rule Limit: Maximum 2 System Administrators permitted. Currently held by ${activeAdmins.map((a) => a.name).join(' & ')}. Please reassign an existing administrator before adding another.`);
        return;
      }
    }

    const finalPass = newStaffPassword.trim() || getDefaultsForRole(newStaffRole).tempPass;

    const roleKey =
      newStaffRole === 'Head of Department (HOD)' ? 'hod' :
      newStaffRole === 'Faculty Dean' ? 'dean' :
      newStaffRole === 'Senior Assistant Registrar (SAR)' ? 'sar' :
      newStaffRole === 'Examination Officer' ? 'examination' :
      newStaffRole === 'Lecturer' ? 'lecturer' :
      newStaffRole === 'Department Management Assistant (Dept MA)' ? 'dept_ma' :
      newStaffRole === 'Faculty Management Assistant (FMA)' ? 'fma' :
      newStaffRole === 'Student' ? 'student' :
      newStaffRole === 'Super Admin' ? 'superadmin' : 'admin';

    onAppointUser({
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim().toLowerCase(),
      tempPassword: finalPass,
      password: finalPass,
      role: newStaffRole,
      roleKey,
      department: newStaffDept,
      designation: newStaffDesignation.trim() || newStaffRole,
      status: 'Active',
      isLeadership: ['Faculty Dean', 'Head of Department (HOD)', 'Senior Assistant Registrar (SAR)', 'Examination Officer'].includes(newStaffRole),
      appointedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: `Granted permissions for ${newStaffRole}`,
      avatarInitial: newStaffName.trim().split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'
    });

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffRole('Lecturer');
    setNewStaffDept('Department of Information & Communication Technology');
    setNewStaffDesignation('Lecturer (Probationary)');
    setNewStaffPassword('Seu@Lecturer2024');
    setFormError('');
    setIsAppointModalOpen(false);
  };

  const roleMatrix = [
    { role: 'Student', portal: '#student', permissions: ['View batch profile & grades', 'Register semester modules', 'Submit medical excuses', 'Download faculty forms', 'Calculate GPA'] },
    { role: 'Lecturer', portal: '#lecturer', permissions: ['Record batch attendance', 'Upload LMS course materials', 'Enter Continuous Assessment (CA) scores', 'Endorse student medical excuses'] },
    { role: 'Head of Department (HOD)', portal: '#hod', permissions: ['Approve Add/Drop requests >22 credits', 'Endorse departmental CA ledgers', 'Manage departmental module allocations', 'Authorize academic leave'] },
    { role: 'Faculty Dean', portal: '#dean', permissions: ['Faculty-wide executive governance', 'Approve academic calendar amendments', 'Endorse results for Senate approval', 'Approve society event permits'] },
    { role: 'Senior Assistant Registrar (SAR)', portal: '#sar', permissions: ['Student registration approval & batch oversight', 'Endorse degree candidates for Faculty Board', 'Manage academic calendars & exam timetables', 'Official administrative notifications'] },
    { role: 'Examination Officer', portal: '#examination', permissions: ['Verify ESA exam eligibility across all batches', 'Process repeat & fresh-repeat applications', 'Publish final marks ledgers', 'Generate exam admission tickets'] },
    { role: 'Department Management Assistant (Dept MA)', portal: '#dept_ma', permissions: ['Departmental student logbooks & attendance rosters', 'LMS course enrollment support', 'Module registration collation for HOD', 'Student medical & excuse letter intake'] },
    { role: 'Faculty Management Assistant (FMA)', portal: '#fma', permissions: ['Faculty Board documentation & minutes', 'Dean office communications & appointments', 'Student grievance docket tracking', 'Official correspondence filing'] },
    { role: 'System Administrator', portal: '#admin', permissions: ['Full batch & student profile management', 'Verify medical certificates & attendance', 'Broadcast announcements', 'Assign Lecturers, HODs, Deans & Staff Roles', 'Provision user accounts with temporary passwords'] },
    { role: 'Super Admin', portal: '#superadmin', permissions: ['Global system infrastructure', 'Master website user role management', 'Database connection monitoring', 'Security audit logs'] }
  ];

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">User Roles, Appointments & Access Delegation</h2>
          <p className="adm-section-subtitle">
            Faculty of Technology Leadership: Dean, Heads of Department (BICT & BST), SAR, Examination Officers, Academic Lecturers & Support Staff with credential provisioning.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              setFormError('');
              setIsAppointModalOpen(true);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Add New User / Provision Account
          </button>
        </div>
      </div>

      {/* Institutional Quota & Governance Capacity Indicator Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem 0.95rem', borderRadius: '8px', fontSize: '0.78rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: '#0f2b5c' }}>⚖️ System Role Rules & Quotas:</span>
          <span>Dean (1) • HOD ICT (1) • HOD BST (1) • SAR (1) • Exam Officer (1) • Dept MA (1) • FMA (1) • System Admin (Max 2).</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
            Academic Lecturers ({lecturersCount}): No Limit
          </span>
          <span style={{ fontWeight: 600, color: currentAdmins.length >= 2 ? '#b91c1c' : '#2563eb', background: currentAdmins.length >= 2 ? '#fee2e2' : '#eff6ff', border: `1px solid ${currentAdmins.length >= 2 ? '#fca5a5' : '#bfdbfe'}`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
            System Admins: {currentAdmins.length}/2
          </span>
        </div>
      </div>

      {/* Leadership Appointments Executive Strip (8 Governance Roles) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
        {/* Dean Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #0f2b5c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#0f2b5c', fontWeight: 700, textTransform: 'uppercase' }}>FACULTY DEAN</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0f2b5c', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentDean ? currentDean.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dean&apos;s Secretariat</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => currentDean && openAssignModal(currentDean)}
          >
            Reassign Dean
          </button>
        </div>

        {/* HOD ICT Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>HOD (DICT)</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hodIct ? hodIct.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dept. of ICT</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => hodIct && openAssignModal(hodIct)}
          >
            Reassign HOD (DICT)
          </button>
        </div>

        {/* HOD BST Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>HOD (BST)</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hodBst ? hodBst.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dept. of Biosystems</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => hodBst && openAssignModal(hodBst)}
          >
            Reassign HOD (BST)
          </button>
        </div>

        {/* SAR Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #ea580c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 700, textTransform: 'uppercase' }}>SENIOR ASST. REGISTRAR</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentSar ? currentSar.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Faculty Administration Office</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => currentSar && openAssignModal(currentSar)}
          >
            Reassign SAR
          </button>
        </div>

        {/* Exam Officer Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>EXAM OFFICER</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7c3aed', background: '#faf5ff', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {examOfficer ? examOfficer.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Examination Branch</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => examOfficer && openAssignModal(examOfficer)}
          >
            Reassign Exam Officer
          </button>
        </div>

        {/* Dept MA Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>DEPT MA</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentDeptMa ? currentDeptMa.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dept. of ICT</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => currentDeptMa && openAssignModal(currentDeptMa)}
          >
            Reassign Dept MA
          </button>
        </div>

        {/* FMA Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 700, textTransform: 'uppercase' }}>FACULTY MA (FMA)</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '1px 5px', borderRadius: '4px' }}>1/1 SEAT</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentFma ? currentFma.name : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dean&apos;s Secretariat</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => currentFma && openAssignModal(currentFma)}
          >
            Reassign FMA
          </button>
        </div>

        {/* System Administrator Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>SYSTEM ADMINISTRATOR</div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: currentAdmins.length >= 2 ? '#b91c1c' : '#2563eb', background: currentAdmins.length >= 2 ? '#fee2e2' : '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>
              {currentAdmins.length}/2 SEATS
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentAdmins.length > 0 ? currentAdmins.map((a) => a.name).join(' & ') : 'Unassigned'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Faculty Administration Office</div>
          <button
            type="button"
            className="adm-btn-xs-secondary"
            style={{ marginTop: '6px', width: '100%', fontSize: '0.7rem' }}
            onClick={() => currentAdmins[0] && openAssignModal(currentAdmins[0])}
          >
            Manage Admins
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginTop: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'users' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'users' ? '#0f2b5c' : '#64748b'
          }}
        >
          Institutional Staff & Accounts Directory ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'matrix' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'matrix' ? '#0f2b5c' : '#64748b'
          }}
        >
          Role-Based Access Control (RBAC) Matrix
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Role Filter Toolbar */}
          <div className="adm-filter-toolbar">
            <div className="adm-filter-group">
              <select
                className="adm-filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All System Roles ({users.length})</option>
                <option value="STUDENT">Students</option>
                <option value="LECTURER">Lecturers & Academic Staff</option>
                <option value="HOD">Heads of Department (HOD)</option>
                <option value="DEAN">Faculty Dean</option>
                <option value="SAR">Senior Assistant Registrar (SAR)</option>
                <option value="EXAM">Examination Officers</option>
                <option value="DEPT_MA">Department Management Assistants (Dept MA)</option>
                <option value="FMA">Faculty Management Assistants (FMA)</option>
                <option value="ADMIN">System & Super Administrators</option>
              </select>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Showing {filteredUsers.length} user accounts
            </div>
          </div>

          {/* User Accounts Table */}
          <div className="adm-table-card">
            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Official Name / Account</th>
                    <th>Institutional Email & Temp Password</th>
                    <th>Current Assigned Role</th>
                    <th>Department / Division</th>
                    <th>Official Designation</th>
                    <th>Account Status</th>
                    <th>Actions & Role Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {u.id}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f2b5c', fontSize: '0.84rem' }}>{u.email}</div>
                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Pass:</span>
                          <code
                            style={{
                              fontSize: '0.72rem',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: '#0f172a',
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              fontFamily: 'monospace'
                            }}
                            title="Temporary Login Password"
                          >
                            {u.tempPassword || 'Seu@2024Temp'}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(u.id, u.tempPassword || 'Seu@2024Temp')}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '1px 4px',
                              cursor: 'pointer',
                              color: copiedId === u.id ? '#16a34a' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                            title="Copy Temporary Password"
                          >
                            {copiedId === u.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`adm-badge ${
                            u.role === 'Faculty Dean'
                              ? 'adm-badge-warning'
                              : u.role === 'Head of Department (HOD)'
                              ? 'adm-badge-info'
                              : u.role === 'Senior Assistant Registrar (SAR)'
                              ? 'adm-badge-neutral'
                              : u.role === 'Examination Officer'
                              ? 'adm-badge-neutral'
                              : u.role === 'Lecturer'
                              ? 'adm-badge-success'
                              : u.role === 'Department Management Assistant (Dept MA)' || u.role === 'Faculty Management Assistant (FMA)'
                              ? 'adm-badge-info'
                              : u.role === 'Student'
                              ? 'adm-badge-neutral'
                              : u.role === 'Super Admin' || u.role === 'System Administrator'
                              ? 'adm-badge-danger'
                              : 'adm-badge-neutral'
                          }`}
                          style={{ fontWeight: 700 }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>{u.department}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{u.designation || u.role}</div>
                      </td>
                      <td>
                        <span className={`adm-badge ${u.status === 'Active' ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="adm-btn-xs-primary"
                            onClick={() => openAssignModal(u)}
                            title="Assign or change role for this user"
                          >
                            Assign Role
                          </button>
                          <button
                            type="button"
                            className="adm-btn-xs-secondary"
                            onClick={() => onToggleUserStatus(u.id)}
                            style={{ color: u.status === 'Active' ? '#dc2626' : '#15803d' }}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* RBAC Matrix Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {roleMatrix.map((rm, idx) => (
            <div key={idx} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{rm.role}</h4>
                <span className="adm-badge adm-badge-neutral">{rm.portal}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {rm.permissions.map((p, pIdx) => (
                  <li key={pIdx}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          MODAL 1: ASSIGN / REASSIGN ROLE FOR USER
          ========================================================= */}
      {editingUser && (
        <div className="adm-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '740px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Assign & Delegate Institutional Role</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setEditingUser(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="adm-modal-body">
                {assignError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                    {assignError}
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Target User Account:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{editingUser.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#0f2b5c' }}>{editingUser.email}</div>
                </div>

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Select Appointed Role *</label>
                    <select
                      className="adm-input"
                      value={assignedRole}
                      onChange={(e) => handleAssignedRoleChange(e.target.value)}
                    >
                      <option value="Lecturer">Lecturer (Academic Staff)</option>
                      <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                      <option value="Faculty Dean">Faculty Dean (Executive)</option>
                      <option value="Senior Assistant Registrar (SAR)">Senior Assistant Registrar (SAR)</option>
                      <option value="Examination Officer">Examination Officer</option>
                      <option value="Department Management Assistant (Dept MA)">Department Management Assistant (Dept MA)</option>
                      <option value="Faculty Management Assistant (FMA)">Faculty Management Assistant (FMA)</option>
                      <option value="System Administrator">System Administrator (Admin)</option>
                      <option value="Super Admin">Super Admin (Global Authority)</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Assigned Department / Branch *</label>
                    <select
                      className="adm-input"
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                    >
                      {getDepartmentOptionsForRole(assignedRole).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Official Designation Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Senior Lecturer Gr. I & Head of Department"
                      value={assignedDesignation}
                      onChange={(e) => setAssignedDesignation(e.target.value)}
                    />
                  </div>
                </div>

                {(() => {
                  const notice = getRoleRuleNotice(assignedRole, assignedDept, editingUser.id);
                  if (!notice) return null;
                  const isErr = notice.type === 'error';
                  return (
                    <div
                      style={{
                        background: isErr ? '#fef2f2' : notice.type === 'warning' ? '#fffbeb' : '#eff6ff',
                        border: `1px solid ${isErr ? '#fecaca' : notice.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: isErr ? '#991b1b' : notice.type === 'warning' ? '#92400e' : '#1e40af',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <strong>{isErr ? '⛔ Limit Reached:' : '⚖️ System Rule:'}</strong> {notice.text}
                    </div>
                  );
                })()}

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#b45309' }}>
                  <strong>Security Note:</strong> Changing this role updates permissions across all batch approvals, examination signing rights, and portal login privileges immediately.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                  disabled={(() => {
                    const notice = getRoleRuleNotice(assignedRole, assignedDept, editingUser.id);
                    return notice?.type === 'error';
                  })()}
                >
                  Confirm & Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: APPOINT / PROVISION NEW USER ACCOUNT
          ========================================================= */}
      {isAppointModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAppointModalOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '740px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Provision New User Account & Set Credentials</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAppointModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAppointSubmit}>
              <div className="adm-modal-body">
                {formError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                    {formError}
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group full-width">
                    <label className="adm-label">Full Name with Title / Initials *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Prof. / Dr. / Mr. / Ms. Full Name"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">University Email Address *</label>
                    <input
                      type="email"
                      className="adm-input"
                      placeholder="username@seu.ac.lk"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="adm-label" style={{ margin: 0 }}>Temporary Login Password *</label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '0 2px',
                          textDecoration: 'underline'
                        }}
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Seu@Student2024"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">User System Role *</label>
                    <select
                      className="adm-input"
                      value={newStaffRole}
                      onChange={(e) => handleRoleSelectChange(e.target.value)}
                    >
                      <option value="Lecturer">Lecturer (Academic Staff)</option>
                      <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                      <option value="Faculty Dean">Faculty Dean (Executive)</option>
                      <option value="Senior Assistant Registrar (SAR)">Senior Assistant Registrar (SAR)</option>
                      <option value="Examination Officer">Examination Officer</option>
                      <option value="Department Management Assistant (Dept MA)">Department Management Assistant (Dept MA)</option>
                      <option value="Faculty Management Assistant (FMA)">Faculty Management Assistant (FMA)</option>
                      <option value="System Administrator">System Administrator</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Department / Branch *</label>
                    <select
                      className="adm-input"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                    >
                      {getDepartmentOptionsForRole(newStaffRole).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Official Designation / Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Senior Lecturer Gr. II / Undergraduate"
                      value={newStaffDesignation}
                      onChange={(e) => setNewStaffDesignation(e.target.value)}
                    />
                  </div>
                </div>

                {(() => {
                  const notice = getRoleRuleNotice(newStaffRole, newStaffDept, null);
                  if (!notice) return null;
                  const isErr = notice.type === 'error';
                  return (
                    <div
                      style={{
                        background: isErr ? '#fef2f2' : notice.type === 'warning' ? '#fffbeb' : '#eff6ff',
                        border: `1px solid ${isErr ? '#fecaca' : notice.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: isErr ? '#991b1b' : notice.type === 'warning' ? '#92400e' : '#1e40af',
                        marginTop: '0.5rem'
                      }}
                    >
                      <strong>{isErr ? '⛔ Limit Reached:' : '⚖️ System Rule:'}</strong> {notice.text}
                    </div>
                  );
                })()}

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#166534', marginTop: '0.5rem' }}>
                  <strong>Onboarding Credentials:</strong> This account will be provisioned with email <code>{newStaffEmail || '...'}</code> and temporary password <code>{newStaffPassword || '...'}</code>. The user will be required to change their temporary password upon initial sign-in.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAppointModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                  disabled={(() => {
                    const notice = getRoleRuleNotice(newStaffRole, newStaffDept, null);
                    return notice?.type === 'error';
                  })()}
                >
                  + Provision & Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
