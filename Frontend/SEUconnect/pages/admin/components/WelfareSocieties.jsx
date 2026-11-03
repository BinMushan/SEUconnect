import { useState } from 'react';

export default function WelfareSocieties({
  students,
  onEndorsePermit
}) {
  const [activeTab, setActiveTab] = useState('welfare'); // 'welfare' | 'societies'
  const [permitToast, setPermitToast] = useState('');

  const societiesList = [
    {
      id: 'SOC-01',
      name: 'ICT Student Association (ICTSA)',
      department: 'ICT Department',
      president: 'M.B.M. Bin Mushan (SEU/IS/22/ICT/091)',
      advisor: 'Prof. Head of ICT Dept',
      status: 'Registered & Active',
      members: 320,
      upcomingEvent: 'TechVent Hackathon 2026',
      permitStatus: 'Approved'
    },
    {
      id: 'SOC-02',
      name: 'IEEE Student Branch - SEUSL',
      department: 'Faculty Wide',
      president: 'Kamsa Jeyasankar (SEU/IS/22/ICT/072)',
      advisor: 'Dr. Senior Lecturer',
      status: 'Registered & Active',
      members: 240,
      upcomingEvent: 'IEEE Extreme Workshop',
      permitStatus: 'Approved'
    },
    {
      id: 'SOC-03',
      name: 'Biosystems Technology Society (BSTS)',
      department: 'Biosystems Technology',
      president: 'R.M. Kavinda Rathnayake (SEU/IS/21/BST/045)',
      advisor: 'Head of Biosystems Technology',
      status: 'Registered & Active',
      members: 180,
      upcomingEvent: 'AgroTech Exhibition & Lab Expo',
      permitStatus: 'Pending Review'
    },
    {
      id: 'SOC-04',
      name: 'Technology Innovation & Coding Club (TICC)',
      department: 'Faculty Wide (BICT & BST)',
      president: 'T. Dinushan Weerasinghe (SEU/IS/22/ICT/032)',
      advisor: 'Head of ICT & BST Departments',
      status: 'Registered & Active',
      members: 210,
      upcomingEvent: 'Tech Expo & Hackathon 2026',
      permitStatus: 'Approved'
    }
  ];

  const handleEndorse = (socName) => {
    setPermitToast(`Official Permit & Facility Requisition endorsed for ${socName}.`);
    if (onEndorsePermit) onEndorsePermit(socName);
    setTimeout(() => setPermitToast(''), 3500);
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Welfare, Scholarships & Student Societies</h2>
          <p className="adm-section-subtitle">
            Administer Mahapola Higher Education grants, University Bursaries, student assistance programs, and technology society event permits.
          </p>
        </div>
      </div>

      {permitToast && (
        <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
          ✓ {permitToast}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('welfare')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'welfare' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'welfare' ? '#0f2b5c' : '#64748b'
          }}
        >
          Mahapola & Bursary Grants Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('societies')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'societies' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'societies' ? '#0f2b5c' : '#64748b'
          }}
        >
          Student Societies & Club Permits ({societiesList.length})
        </button>
      </div>

      {activeTab === 'welfare' ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>MAHAPOLA RECIPIENTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {students.filter((s) => s.welfare.includes('Mahapola')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Rs. 5,000 / month (Merit & Ordinary)</div>
            </div>

            <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>BURSARY RECIPIENTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {students.filter((s) => s.welfare.includes('Bursary')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>University Welfare Assistance</div>
            </div>

            <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE COMPLIANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>92.8%</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Required: &ge; 80% to disburse installment</div>
            </div>
          </div>

          {/* Welfare Table */}
          <div className="adm-table-card">
            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Student Name</th>
                    <th>Degree Programme</th>
                    <th>Welfare Scheme</th>
                    <th>Monthly Grant</th>
                    <th>Attendance Standing</th>
                    <th>Disbursement Eligibility</th>
                    <th>Payment Route</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((stu) => {
                    const isEligible = stu.attendance >= 80;
                    return (
                      <tr key={stu.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{stu.regNo}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{stu.name}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>{stu.programme}</div>
                        </td>
                        <td>
                          <span className={`adm-badge ${stu.welfare.includes('Mahapola') ? 'adm-badge-info' : stu.welfare.includes('Bursary') ? 'adm-badge-neutral' : 'adm-badge-neutral'}`}>
                            {stu.welfare}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            {stu.welfare.includes('Mahapola') ? 'Rs. 5,000' : stu.welfare.includes('Bursary') ? 'Rs. 4,000' : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: isEligible ? '#15803d' : '#dc2626' }}>
                            {stu.attendance}%
                          </span>
                        </td>
                        <td>
                          <span className={`adm-badge ${isEligible ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                            {isEligible ? 'Authorized (Disbursed)' : 'Withheld (Low Att)'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.74rem', color: '#475569' }}>People&apos;s Bank - Oluvil</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Societies List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {societiesList.map((soc) => (
            <div key={soc.id} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="adm-badge adm-badge-success">{soc.status}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{soc.members} Active Members</span>
              </div>

              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{soc.name}</h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                {soc.department} • Senior Treasurer: {soc.advisor}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>UPCOMING EVENT / PROJECT</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f2b5c' }}>{soc.upcomingEvent}</div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                  Lead Officer: {soc.president}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`adm-badge ${soc.permitStatus === 'Approved' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                  Permit: {soc.permitStatus}
                </span>
                <button
                  type="button"
                  className="adm-btn-xs-primary"
                  onClick={() => handleEndorse(soc.name)}
                >
                  Endorse Event Permit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
