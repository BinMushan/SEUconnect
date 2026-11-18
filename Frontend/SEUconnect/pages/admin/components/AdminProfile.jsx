import './admin_profile.css';

export default function AdminProfile({ user, onNavigate }) {
  const adminName = user?.name || 'Eng. K. Thanushan';
  const adminEmail = user?.email || 'admin@gmail.com';
  const adminRole = user?.role || 'System Administrator';
  const adminDesignation = user?.designation || 'Senior Assistant Registrar (Academic & Administration)';
  const adminDepartment = user?.department || 'Academic & Student Affairs Division';
  const adminInitials = user?.avatarInitial || (adminName ? adminName.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'AD');

  return (
    <div className="adm-dashboard-container adm-profile-container">
      {/* 1. Header Banner */}
      <div className="adm-profile-banner">
        <div className="adm-profile-banner-left">
          <div className="adm-profile-avatar-large">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={adminName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              adminInitials
            )}
          </div>
          <div className="adm-profile-banner-meta">
            <span className="adm-profile-tag">INSTITUTIONAL ADMINISTRATION &amp; GOVERNANCE</span>
            <h1 className="adm-profile-title">{adminName}</h1>
            <p className="adm-profile-subtitle">
              {adminDesignation} &bull; Faculty of Technology &bull; South Eastern University of Sri Lanka
            </p>
          </div>
        </div>

        <div className="adm-profile-banner-actions">
          <button
            type="button"
            className="adm-profile-btn primary"
            onClick={() => onNavigate('dashboard')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Command Dashboard
          </button>

          <button
            type="button"
            className="adm-profile-btn"
            onClick={() => onNavigate('users_roles')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            User &amp; Role Management
          </button>

          <button
            type="button"
            className="adm-profile-btn"
            onClick={() => onNavigate('settings')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            System Settings
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Dossier Grid */}
      <div className="adm-profile-two-col">
        {/* Left Card: Official Administrative Identity */}
        <div className="adm-profile-card">
          <div className="adm-profile-card-header">
            <h3 className="adm-profile-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Administrative Dossier &amp; Credentials
            </h3>
            <span className="adm-profile-badge emerald">Tier-1 Root Authority</span>
          </div>

          <div className="adm-profile-card-body">
            <div className="adm-profile-dossier-grid">
              <div className="adm-profile-item">
                <label>Official Full Name</label>
                <div className="val">{adminName}</div>
              </div>

              <div className="adm-profile-item">
                <label>Staff Identification No</label>
                <div className="val highlight">{user?.staffId || 'STAFF-ADM-001'}</div>
              </div>

              <div className="adm-profile-item">
                <label>Institutional Role</label>
                <div className="val">{adminRole}</div>
              </div>

              <div className="adm-profile-item">
                <label>Substantive Post</label>
                <div className="val">{adminDesignation}</div>
              </div>

              <div className="adm-profile-item" style={{ gridColumn: 'span 2' }}>
                <label>Division &amp; Department</label>
                <div className="val">{adminDepartment}, Faculty Administration Office</div>
              </div>

              <div className="adm-profile-item" style={{ gridColumn: 'span 2' }}>
                <label>Faculty &amp; Campus</label>
                <div className="val">Faculty of Technology, South Eastern University of Sri Lanka, Oluvil Main Campus</div>
              </div>

              <div className="adm-profile-item">
                <label>Official Contact Email</label>
                <div className="val highlight">{adminEmail}</div>
              </div>

              <div className="adm-profile-item">
                <label>Office Extension / Phone</label>
                <div className="val">+94 67 2255000 / Ext. 101</div>
              </div>

              <div className="adm-profile-item" style={{ gridColumn: 'span 2' }}>
                <label>Physical Office Suite</label>
                <div className="val">Administration Wing, Technology Complex Level 1, Room 102</div>
              </div>

              <div className="adm-profile-item">
                <label>Account Status</label>
                <div className="val" style={{ color: '#15803d', fontWeight: 700 }}>
                  Active &bull; Fully Verified
                </div>
              </div>

              <div className="adm-profile-item">
                <label>Clearance Level</label>
                <div className="val">Level 5 — Complete Read &amp; Write Access</div>
              </div>
            </div>

            {/* Live System Diagnostics Box */}
            <div className="adm-profile-system-box">
              <div className="adm-profile-system-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Live System Health &amp; Active Session Verified</span>
              </div>
              <div className="adm-profile-system-checks">
                <div className="adm-profile-system-check-item">
                  <span>✓</span> Database: MongoDB Atlas Connected
                </div>
                <div className="adm-profile-system-check-item">
                  <span>✓</span> API Gateway: Operational
                </div>
                <div className="adm-profile-system-check-item">
                  <span>✓</span> Cross-Portal Reactive Sync: Online
                </div>
                <div className="adm-profile-system-check-item">
                  <span>✓</span> JWT Auth: Valid Session Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Statutory Administrative Authorities */}
        <div className="adm-profile-card">
          <div className="adm-profile-card-header">
            <h3 className="adm-profile-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Statutory Delegations &amp; System Powers
            </h3>
            <span className="adm-profile-badge">Senate &amp; Faculty Board</span>
          </div>

          <div className="adm-profile-card-body">
            <div className="adm-profile-auth-list">
              <div className="adm-profile-auth-item">
                <span className="adm-profile-auth-icon">🎓</span>
                <div className="adm-profile-auth-text">
                  <strong>Undergraduate Registry &amp; Cohort Management</strong>
                  <p>Sole administrative authority to onboard new intake cohorts, batch-assign students, and regulate semester auto-shift progressions.</p>
                </div>
              </div>

              <div className="adm-profile-auth-item">
                <span className="adm-profile-auth-icon">📚</span>
                <div className="adm-profile-auth-text">
                  <strong>Curriculum Architecture &amp; Course Provisioning</strong>
                  <p>Provision official handbook courses per semester for BICT and BST degree programmes without appointing instructors (statutorily reserved for HODs).</p>
                </div>
              </div>

              <div className="adm-profile-auth-item">
                <span className="adm-profile-auth-icon">⚖️</span>
                <div className="adm-profile-auth-text">
                  <strong>Institutional Penalties &amp; Clearance Verification</strong>
                  <p>Log laboratory equipment fines, examination irregularities, and disciplinary sanctions; execute official clearance verifications with PIV voucher audit.</p>
                </div>
              </div>

              <div className="adm-profile-auth-item">
                <span className="adm-profile-auth-icon">🛡️</span>
                <div className="adm-profile-auth-text">
                  <strong>User Role-Based Access Control (RBAC)</strong>
                  <p>Provision and suspend credentials for Deans, Department Heads, Lecturers, Medical Officers, and Assistant Registrars with audit trailing.</p>
                </div>
              </div>

              <div className="adm-profile-auth-item">
                <span className="adm-profile-auth-icon">🤖</span>
                <div className="adm-profile-auth-text">
                  <strong>Knowledge Base &amp; AI RAG Vector Ingestion</strong>
                  <p>Manage uploaded official institutional handbooks, syllabus guidelines, and by-laws powering the SEUConnect AI Assistant.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
