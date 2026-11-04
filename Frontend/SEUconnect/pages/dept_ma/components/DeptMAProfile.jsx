import React from 'react';

export default function DeptMAProfile({ deptInfo, user }) {
  const ma = deptInfo.assignedMA;

  const permissionsMatrix = [
    {
      domain: 'Subject Medical Applications',
      action: 'Verify & Grant Final Approval for Regular Medical Excuses (<= 7 days)',
      status: 'AUTHORIZED',
      authority: 'Department MA Delegated Authority',
    },
    {
      domain: 'Subject Medical Applications',
      action: 'Review Hospital Certificates and 14-Day Regulatory Compliance',
      status: 'AUTHORIZED',
      authority: 'Faculty of Technology By-Laws',
    },
    {
      domain: 'Subject Medical Applications',
      action: 'Escalate Extended Medicals (> 14 days) or Surgical Excuses to HOD / Dean',
      status: 'AUTHORIZED',
      authority: 'Faculty Medical Board Procedure',
    },
    {
      domain: 'Student Management',
      action: 'View Department Student Profiles & Academic Standing',
      status: 'AUTHORIZED',
      authority: 'Department Scope Only (ICT)',
    },
    {
      domain: 'Student Management',
      action: 'Update Permitted Student Contact, Emergency & Administrative Notes',
      status: 'AUTHORIZED',
      authority: 'Department Records Custodian',
    },
    {
      domain: 'Academic Grades & GPA',
      action: 'Modify Lecturer Continuous Assessment (CA) or ESA Examination Grades',
      status: 'RESTRICTED',
      authority: 'Course Lecturer & Examination Branch Strictly',
    },
    {
      domain: 'Subject Registrations',
      action: 'Verify Prerequisite Compliance and Validate Registration Slips',
      status: 'AUTHORIZED',
      authority: 'Department Academic Administration',
    },
    {
      domain: 'Attendance Tracking',
      action: 'Monitor 80% Attendance Threshold & Flag Non-Compliant Sessions',
      status: 'AUTHORIZED',
      authority: 'Department Board Audit Task',
    },
    {
      domain: 'Attendance Tracking',
      action: 'Overwrite or Delete Lecturer-Submitted Session Attendance Records',
      status: 'RESTRICTED',
      authority: 'Course Lecturer Sole Authority',
    },
    {
      domain: 'Department Documents',
      action: 'Archive, Categorize, and Manage Departmental Circulars & Documents',
      status: 'AUTHORIZED',
      authority: 'Department Secretariat',
    },
    {
      domain: 'Inter-Department Records',
      action: 'Access Non-ICT Department Records (Biosystems, Multidisciplinary, etc.)',
      status: 'RESTRICTED',
      authority: 'Enforced by System RBAC Boundaries',
    },
  ];

  return (
    <div className="dept-ma-profile-section">
      <div className="dept-ma-profile-grid">
        {/* Left Card: Officer Identity Card */}
        <div className="dept-ma-profile-card">
          <div className="dept-ma-avatar-large">{ma.avatarInitial}</div>
          <h3 className="dept-ma-profile-name">{ma.name}</h3>
          <div className="dept-ma-profile-title">{ma.designation}</div>

          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: '700',
              background: '#eff6ff',
              color: '#1d4ed8',
              marginBottom: '1.5rem',
            }}
          >
            STAFF ID: {ma.staffId}
          </div>

          <div
            style={{
              textAlign: 'left',
              fontSize: '0.84rem',
              color: '#334155',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
                ASSIGNED DEPARTMENT
              </span>
              <strong>{deptInfo.departmentName}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
                FACULTY & CAMPUS
              </span>
              {deptInfo.facultyName}, Oluvil Campus
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
                ADMINISTRATION OFFICE
              </span>
              {ma.office}
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
                CONTACT PHONE / EXTENSION
              </span>
              {ma.phone}
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
                OFFICIAL SEU EMAIL
              </span>
              {ma.email}
            </div>
          </div>
        </div>

        {/* Right Card: Institutional Role & Permissions Matrix */}
        <div className="dept-ma-panel-card">
          <div className="dept-ma-panel-header">
            <div>
              <div className="dept-ma-panel-title">
                <span>🛡️</span>
                <span>Role-Based Access Control (RBAC) & Authority Matrix</span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Authorized privileges and institutional boundary restrictions for Department Management Assistant.
              </p>
            </div>
          </div>

          <div className="dept-ma-table-wrapper">
            <table className="dept-ma-rbac-table">
              <thead>
                <tr>
                  <th>Functional Domain</th>
                  <th>Institutional Activity / Operation</th>
                  <th>RBAC Permission</th>
                  <th>Governance Authority</th>
                </tr>
              </thead>
              <tbody>
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.domain}</strong>
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>{item.action}</td>
                    <td>
                      <span
                        className={`dept-ma-status-badge ${
                          item.status === 'AUTHORIZED' ? 'active' : 'rejected'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.authority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

