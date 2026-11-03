import { useState } from 'react';

export default function UserRoleManagement({
  users,
  onAssignRole,
  onAppointUser,
  onToggleUserStatus
}) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'leadership' | 'matrix'
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Role Assignment Modal State (for existing user)
  const [editingUser, setEditingUser] = useState(null);
  const [assignedRole, setAssignedRole] = useState('Lecturer');
  const [assignedDept, setAssignedDept] = useState('Department of ICT');
  const [assignedDesignation, setAssignedDesignation] = useState('');

  // Appoint New Staff Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Lecturer');
  const [newStaffDept, setNewStaffDept] = useState('Department of ICT');
  const [newStaffDesignation, setNewStaffDesignation] = useState('');
  const [formError, setFormError] = useState('');

  // Find leadership holders
  const currentDean = users.find((u) => u.role === 'Faculty Dean');
  const hodIct = users.find((u) => u.role === 'Head of Department (HOD)' && u.department.includes('ICT'));
  const hodBst = users.find((u) => u.role === 'Head of Department (HOD)' && (u.department.includes('Biosystems') || u.department.includes('BST')));

  const examOfficer = users.find((u) => u.role === 'Examination Officer');

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'LECTURER') return u.role === 'Lecturer';
    if (roleFilter === 'HOD') return u.role === 'Head of Department (HOD)';
    if (roleFilter === 'DEAN') return u.role === 'Faculty Dean';
    if (roleFilter === 'EXAM') return u.role === 'Examination Officer';
    if (roleFilter === 'ADMIN') return u.role === 'System Administrator' || u.role === 'Super Admin';
    if (roleFilter === 'STUDENT') return u.role === 'Student';
    return true;
  });

  const openAssignModal = (user) => {
    setEditingUser(user);
    setAssignedRole(user.role);
    setAssignedDept(user.department);
    setAssignedDesignation(user.designation || user.role);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    onAssignRole(editingUser.id, {
      role: assignedRole,
      department: assignedDept,
      designation: assignedDesignation.trim() || assignedRole
    });

    setEditingUser(null);
  };

  const handleAppointSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      setFormError('Please enter Staff Full Name and University Email.');
      return;
    }

    onAppointUser({
      id: `USR-${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim().toLowerCase(),
      role: newStaffRole,
      roleKey: newStaffRole === 'Head of Department (HOD)' ? 'hod' : newStaffRole === 'Faculty Dean' ? 'dean' : newStaffRole === 'Examination Officer' ? 'examination' : newStaffRole === 'Lecturer' ? 'lecturer' : 'admin',
      department: newStaffDept,
      designation: newStaffDesignation.trim() || newStaffRole,
      status: 'Active',
      isLeadership: ['Faculty Dean', 'Head of Department (HOD)', 'Examination Officer'].includes(newStaffRole),
      appointedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: `Granted permissions for ${newStaffRole}`
    });

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffDesignation('');
    setFormError('');
    setIsAppointModalOpen(false);
  };

  const roleMatrix = [
    { role: 'Student', portal: '#student', permissions: ['View batch profile & grades', 'Register semester modules', 'Submit medical excuses', 'Download faculty forms', 'Calculate GPA'] },
    { role: 'Lecturer', portal: '#lecturer', permissions: ['Record batch attendance', 'Upload LMS course materials', 'Enter Continuous Assessment (CA) scores', 'Endorse student medical excuses'] },
    { role: 'Head of Department (HOD)', portal: '#hod', permissions: ['Approve Add/Drop requests >22 credits', 'Endorse departmental CA ledgers', 'Manage departmental module allocations', 'Authorize leave'] },
    { role: 'Faculty Dean', portal: '#dean', permissions: ['Faculty-wide executive governance', 'Approve academic calendar amendments', 'Endorse results for Senate approval', 'Approve society event permits'] },
    { role: 'Examination Officer', portal: '#examination', permissions: ['Verify ESA exam eligibility across all batches', 'Process repeat & fresh-repeat applications', 'Publish final marks ledgers', 'Generate exam admission tickets'] },
    { role: 'System Administrator', portal: '#admin', permissions: ['Full batch & student profile management', 'Verify medical certificates & attendance', 'Broadcast announcements', 'Assign Lecturers, HODs, Deans & Staff Roles'] },
    { role: 'Super Admin', portal: '#superadmin', permissions: ['Global system infrastructure', 'Master website user role management', 'Database connection monitoring', 'Security audit logs'] }
  ];

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">User Roles, Appointments & Access Delegation</h2>
          <p className="adm-section-subtitle">
            Faculty of Technology Leadership: One Faculty Dean and Two Heads of Department (BICT: Department of Information & Communication Technology and BST: Department of Bio Systems Technology), alongside Examination Officers and Academic Staff.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsAppointModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Appoint Staff / Assign Role
          </button>
        </div>
      </div>

      {/* Leadership Appointments Executive Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
        {/* Dean Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #0f2b5c' }}>
          <div style={{ fontSize: '0.68rem', color: '#0f2b5c', fontWeight: 700, textTransform: 'uppercase' }}>FACULTY DEAN</div>
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
          <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>HOD (ICT)</div>
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
            Reassign HOD
          </button>
        </div>

        {/* HOD BST Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #16a34a' }}>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>HOD (BIOSYSTEMS)</div>
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
            Reassign HOD
          </button>
        </div>

        {/* Exam Officer Card */}
        <div className="adm-card" style={{ padding: '0.9rem', borderTop: '3px solid #7c3aed' }}>
          <div style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>EXAM OFFICER</div>
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
                <option value="LECTURER">Lecturers & Staff</option>
                <option value="HOD">Heads of Department (HOD)</option>
                <option value="DEAN">Faculty Dean</option>
                <option value="EXAM">Examination Officers</option>
                <option value="ADMIN">System & Super Administrators</option>
                <option value="STUDENT">Students</option>
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
                    <th>Institutional Email</th>
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
                        <span style={{ fontWeight: 500, color: '#0f2b5c' }}>{u.email}</span>
                      </td>
                      <td>
                        <span
                          className={`adm-badge ${
                            u.role === 'Faculty Dean'
                              ? 'adm-badge-warning'
                              : u.role === 'Head of Department (HOD)'
                              ? 'adm-badge-info'
                              : u.role === 'Examination Officer'
                              ? 'adm-badge-neutral'
                              : u.role === 'Lecturer'
                              ? 'adm-badge-success'
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
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
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
                      onChange={(e) => setAssignedRole(e.target.value)}
                    >
                      <option value="Lecturer">Lecturer (Academic Staff)</option>
                      <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                      <option value="Faculty Dean">Faculty Dean (Executive)</option>
                      <option value="Examination Officer">Examination Officer</option>
                      <option value="System Administrator">System Administrator (Admin)</option>
                      <option value="Super Admin">Super Admin (Global Authority)</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Assigned Department / Branch *</label>
                    <select
                      className="adm-input"
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                    >
                      <option value="Department of ICT">Department of ICT</option>
                      <option value="Department of Biosystems Technology">Department of Biosystems Technology</option>
                      <option value="Dean's Secretariat">Dean&apos;s Secretariat</option>
                      <option value="Examination Branch">Examination Branch</option>
                      <option value="Faculty Administration Office">Faculty Administration Office</option>
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
                >
                  Confirm & Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: APPOINT NEW STAFF ACCOUNT
          ========================================================= */}
      {isAppointModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAppointModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Appoint Staff Member & Provision Account</h3>
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
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    {formError}
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group full-width">
                    <label className="adm-label">Full Name with Title *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Prof. / Dr. / Mr. Name"
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
                      placeholder="official@seu.ac.lk"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Appointed Role *</label>
                    <select
                      className="adm-input"
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                    >
                      <option value="Lecturer">Lecturer (Academic Staff)</option>
                      <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                      <option value="Faculty Dean">Faculty Dean</option>
                      <option value="Examination Officer">Examination Officer</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Department / Division</label>
                    <select
                      className="adm-input"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                    >
                      <option value="Department of ICT">Department of ICT</option>
                      <option value="Department of Biosystems Technology">Department of Biosystems Technology</option>
                      <option value="Dean's Secretariat">Dean&apos;s Secretariat</option>
                      <option value="Examination Branch">Examination Branch</option>
                      <option value="Faculty Administration Office">Faculty Administration Office</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Official Designation</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Senior Lecturer Gr. II"
                      value={newStaffDesignation}
                      onChange={(e) => setNewStaffDesignation(e.target.value)}
                    />
                  </div>
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
                >
                  Provision & Appoint Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
