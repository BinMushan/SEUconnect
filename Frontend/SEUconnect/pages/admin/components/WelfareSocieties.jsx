import { useState, useEffect, useMemo } from 'react';

const SOCIETIES_STORAGE_KEY = 'seuconnect_admin_societies';
const PERMITS_STORAGE_KEY = 'seuconnect_admin_permits';

const DEFAULT_SOCIETIES = [
  {
    id: 'SOC-01',
    name: 'ICT Student Association (ICTSA)',
    department: 'Department of ICT',
    president: 'M.B.M. Bin Mushan (SEU/IS/22/ICT/091)',
    advisor: 'Dr. S. Sabraz Nawaz (HOD ICT)',
    status: 'Registered & Active',
    members: 320,
    establishedYear: '2021',
    email: 'ictsa@seu.ac.lk',
    upcomingEvent: 'TechVent Hackathon 2026',
    permitStatus: 'Approved'
  },
  {
    id: 'SOC-02',
    name: 'IEEE Student Branch - SEUSL',
    department: 'Faculty Wide (Technology)',
    president: 'Kamsa Jeyasankar (SEU/IS/22/ICT/072)',
    advisor: 'Dr. S. Kirushanth (Senior Lecturer)',
    status: 'Registered & Active',
    members: 240,
    establishedYear: '2020',
    email: 'ieee.seu@seu.ac.lk',
    upcomingEvent: 'IEEE Extreme 24-Hour Coding Workshop',
    permitStatus: 'Approved'
  },
  {
    id: 'SOC-03',
    name: 'Biosystems Technology Society (BSTS)',
    department: 'Department of Bio Systems Technology',
    president: 'R.M. Kavinda Rathnayake (SEU/IS/21/BST/045)',
    advisor: 'Dr. U.L. Abdul Majeed (HOD BST)',
    status: 'Registered & Active',
    members: 180,
    establishedYear: '2022',
    email: 'bsts@seu.ac.lk',
    upcomingEvent: 'AgroTech Exhibition & Hydroponics Lab Expo',
    permitStatus: 'Pending Review'
  },
  {
    id: 'SOC-04',
    name: 'Technology Innovation & Coding Club (TICC)',
    department: 'Faculty Wide (BICT & BST)',
    president: 'T. Dinushan Weerasinghe (SEU/IS/22/ICT/032)',
    advisor: 'Eng. K. Thanushan (Lecturer)',
    status: 'Registered & Active',
    members: 210,
    establishedYear: '2023',
    email: 'ticc@seu.ac.lk',
    upcomingEvent: 'Tech Expo & Robocup 2026',
    permitStatus: 'Approved'
  }
];

const DEFAULT_PERMITS = [
  {
    id: 'PRM-2026-001',
    societyId: 'SOC-01',
    societyName: 'ICT Student Association (ICTSA)',
    eventTitle: 'TechVent Hackathon 2026',
    eventType: 'Competitive Hackathon & Workshop',
    venue: 'Faculty Auditorium & Software Lab 01',
    eventDate: '2026-11-20',
    duration: '08:30 AM - 05:30 PM',
    expectedAttendees: 150,
    advisorEndorsed: true,
    status: 'Approved',
    approvedBy: 'Prof. M.L.M. Mansoor (Dean)',
    issuedDate: '2026-11-01',
    remarks: 'Approved for faculty facility use. Sound equipment and Wi-Fi access authorized.'
  },
  {
    id: 'PRM-2026-002',
    societyId: 'SOC-02',
    societyName: 'IEEE Student Branch - SEUSL',
    eventTitle: 'IEEE Extreme 24-Hour Coding Workshop',
    eventType: 'Technical Training Bootcamp',
    venue: 'ICT Department Seminar Hall',
    eventDate: '2026-11-25',
    duration: '09:00 AM - 04:00 PM',
    expectedAttendees: 90,
    advisorEndorsed: true,
    status: 'Approved',
    approvedBy: 'Senior Assistant Registrar (SAR)',
    issuedDate: '2026-11-03',
    remarks: 'Facility booking confirmed with Department MA.'
  },
  {
    id: 'PRM-2026-003',
    societyId: 'SOC-03',
    societyName: 'Biosystems Technology Society (BSTS)',
    eventTitle: 'AgroTech Exhibition & Hydroponics Lab Expo',
    eventType: 'Public Exhibition & Demonstration',
    venue: 'Technology Faculty Open Ground & Green House',
    eventDate: '2026-12-05',
    duration: '08:00 AM - 04:00 PM',
    expectedAttendees: 220,
    advisorEndorsed: true,
    status: 'Pending Review',
    approvedBy: null,
    issuedDate: '2026-11-05',
    remarks: 'Awaiting venue safety clearance from Faculty Administration Office.'
  },
  {
    id: 'PRM-2026-004',
    societyId: 'SOC-04',
    societyName: 'Technology Innovation & Coding Club (TICC)',
    eventTitle: 'Tech Expo & Robocup 2026',
    eventType: 'Robotics Competition & Showcase',
    venue: 'Faculty Multipurpose Complex',
    eventDate: '2026-12-12',
    duration: '09:30 AM - 05:00 PM',
    expectedAttendees: 180,
    advisorEndorsed: true,
    status: 'Approved',
    approvedBy: 'Prof. M.L.M. Mansoor (Dean)',
    issuedDate: '2026-10-28',
    remarks: 'Full power supply and security supervision allocated.'
  }
];

export default function WelfareSocieties({
  students,
  initialTab = 'welfare',
  onEndorsePermit,
  onAddAuditLog,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'welfare' | 'societies'
  const [subTab, setSubTab] = useState('societies'); // 'societies' | 'permits'
  const [permitToast, setPermitToast] = useState('');

  // Societies and Permits Persistent State
  const [societies, setSocieties] = useState(() => {
    try {
      const saved = localStorage.getItem(SOCIETIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SOCIETIES;
    } catch {
      return DEFAULT_SOCIETIES;
    }
  });

  const [permits, setPermits] = useState(() => {
    try {
      const saved = localStorage.getItem(PERMITS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PERMITS;
    } catch {
      return DEFAULT_PERMITS;
    }
  });

  // Keep activeTab synchronized when sidebar nav switches between Welfare and Societies
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(SOCIETIES_STORAGE_KEY, JSON.stringify(societies));
    } catch (e) {
      console.warn('Failed saving societies:', e);
    }
  }, [societies]);

  useEffect(() => {
    try {
      localStorage.setItem(PERMITS_STORAGE_KEY, JSON.stringify(permits));
    } catch (e) {
      console.warn('Failed saving permits:', e);
    }
  }, [permits]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isAddSocietyModalOpen, setIsAddSocietyModalOpen] = useState(false);
  const [isAddPermitModalOpen, setIsAddPermitModalOpen] = useState(false);
  const [editingSociety, setEditingUserSociety] = useState(null);

  // New Society Form
  const [newSocName, setNewSocName] = useState('');
  const [newSocDept, setNewSocDept] = useState('Department of ICT');
  const [newSocPresident, setNewSocPresident] = useState('');
  const [newSocAdvisor, setNewSocAdvisor] = useState('');
  const [newSocMembers, setNewSocMembers] = useState(120);
  const [newSocEmail, setNewSocEmail] = useState('');

  // New Permit Form
  const [permitSocietyId, setPermitSocietyId] = useState('');
  const [permitTitle, setPermitTitle] = useState('');
  const [permitType, setPermitType] = useState('Workshop & Bootcamp');
  const [permitVenue, setPermitVenue] = useState('Faculty Auditorium');
  const [permitDate, setPermitDate] = useState('');
  const [permitDuration, setPermitDuration] = useState('09:00 AM - 04:00 PM');
  const [permitAttendees, setPermitAttendees] = useState(100);
  const [permitRemarks, setPermitRemarks] = useState('');

  const triggerToast = (msg) => {
    setPermitToast(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setPermitToast(''), 3500);
  };

  // 1. Endorse / Approve Permit
  const handleApprovePermit = (permitId) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === permitId ? { ...p, status: 'Approved', approvedBy: 'Faculty Administration / Dean' } : p))
    );
    const target = permits.find((p) => p.id === permitId);
    const label = target ? `${target.eventTitle} (${target.societyName})` : permitId;
    triggerToast(`Official Event Permit approved for ${label}.`);
    if (onAddAuditLog) onAddAuditLog('Approved Event Permit', `Endorsed official permit for ${label}.`);
    if (onEndorsePermit && target) onEndorsePermit(target.societyName);
  };

  // 2. Decline Permit
  const handleDeclinePermit = (permitId) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === permitId ? { ...p, status: 'Declined' } : p))
    );
    const target = permits.find((p) => p.id === permitId);
    triggerToast(`Permit declined for ${target?.eventTitle || permitId}.`);
    if (onAddAuditLog) onAddAuditLog('Declined Event Permit', `Permit declined for ${target?.eventTitle}.`);
  };

  // 3. Revoke Permit
  const handleRevokePermit = (permitId) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === permitId ? { ...p, status: 'Pending Review', approvedBy: null } : p))
    );
    const target = permits.find((p) => p.id === permitId);
    triggerToast(`Permit revoked and returned to Pending Review for ${target?.eventTitle || permitId}.`);
    if (onAddAuditLog) onAddAuditLog('Revoked Event Permit', `Permit returned to pending for ${target?.eventTitle}.`);
  };

  // 4. Register New Society
  const handleCreateSociety = (e) => {
    e.preventDefault();
    if (!newSocName.trim() || !newSocPresident.trim()) return;

    const newId = `SOC-${String(societies.length + 1).padStart(2, '0')}`;
    const newEntry = {
      id: newId,
      name: newSocName.trim(),
      department: newSocDept,
      president: newSocPresident.trim(),
      advisor: newSocAdvisor.trim() || 'Senior Faculty Advisor',
      status: 'Registered & Active',
      members: Number(newSocMembers) || 50,
      establishedYear: new Date().getFullYear().toString(),
      email: newSocEmail.trim() || `${newSocName.toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`,
      upcomingEvent: 'Inaugural Society Assembly 2026',
      permitStatus: 'Pending Review'
    };

    setSocieties((prev) => [newEntry, ...prev]);
    setIsAddSocietyModalOpen(false);
    triggerToast(`Student Society "${newEntry.name}" officially registered.`);
    if (onAddAuditLog) onAddAuditLog('Registered Student Society', `Added new society ${newEntry.name} (${newEntry.department}).`);

    // Reset Form
    setNewSocName('');
    setNewSocPresident('');
    setNewSocAdvisor('');
    setNewSocMembers(120);
    setNewSocEmail('');
  };

  // 5. Issue New Permit
  const handleCreatePermit = (e) => {
    e.preventDefault();
    if (!permitTitle.trim()) return;

    const chosenSociety = societies.find((s) => s.id === permitSocietyId) || societies[0];
    const newPermitId = `PRM-2026-${String(permits.length + 1).padStart(3, '0')}`;

    const newPermit = {
      id: newPermitId,
      societyId: chosenSociety?.id || 'SOC-01',
      societyName: chosenSociety?.name || 'Technology Society',
      eventTitle: permitTitle.trim(),
      eventType: permitType,
      venue: permitVenue,
      eventDate: permitDate || new Date().toISOString().split('T')[0],
      duration: permitDuration,
      expectedAttendees: Number(permitAttendees) || 80,
      advisorEndorsed: true,
      status: 'Pending Review',
      approvedBy: null,
      issuedDate: new Date().toISOString().split('T')[0],
      remarks: permitRemarks.trim() || 'Submitted through Dean & SAR student activities portal.'
    };

    setPermits((prev) => [newPermit, ...prev]);
    setIsAddPermitModalOpen(false);
    triggerToast(`Event permit request submitted for ${newPermit.eventTitle}.`);
    if (onAddAuditLog) onAddAuditLog('Requested Event Permit', `New permit request for ${newPermit.eventTitle} (${newPermit.societyName}).`);

    // Reset Form
    setPermitTitle('');
    setPermitRemarks('');
  };

  // 6. Edit Society Submit
  const handleUpdateSocietySubmit = (e) => {
    e.preventDefault();
    if (!editingSociety) return;

    setSocieties((prev) =>
      prev.map((s) => (s.id === editingSociety.id ? editingSociety : s))
    );
    setEditingUserSociety(null);
    triggerToast(`Society details updated for ${editingSociety.name}.`);
    if (onAddAuditLog) onAddAuditLog('Updated Student Society', `Modified records for ${editingSociety.name}.`);
  };

  // 7. Toggle Society Status
  const handleToggleSocietyStatus = (socId) => {
    setSocieties((prev) =>
      prev.map((s) => {
        if (s.id !== socId) return s;
        const nextStatus = s.status === 'Registered & Active' ? 'Suspended / Inactive' : 'Registered & Active';
        triggerToast(`Status for ${s.name} changed to ${nextStatus}.`);
        if (onAddAuditLog) onAddAuditLog('Updated Society Status', `${s.name} is now ${nextStatus}.`);
        return { ...s, status: nextStatus };
      })
    );
  };

  // Filtered lists
  const filteredSocieties = useMemo(() => {
    return societies.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.president.toLowerCase().includes(q) ||
        s.advisor.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.status.includes('Active')) ||
        (statusFilter === 'SUSPENDED' && s.status.includes('Suspended'));
      return matchSearch && matchStatus;
    });
  }, [societies, searchQuery, statusFilter]);

  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.eventTitle.toLowerCase().includes(q) ||
        p.societyName.toLowerCase().includes(q) ||
        p.venue.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'APPROVED' && p.status === 'Approved') ||
        (statusFilter === 'PENDING' && p.status === 'Pending Review') ||
        (statusFilter === 'DECLINED' && p.status === 'Declined');
      return matchSearch && matchStatus;
    });
  }, [permits, searchQuery, statusFilter]);

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">
            {activeTab === 'societies' ? 'Student Societies & Club Permits' : 'Welfare, Scholarships & Student Societies'}
          </h2>
          <p className="adm-section-subtitle">
            {activeTab === 'societies'
              ? 'Maintain Faculty of Technology student societies, executive committee rosters, and Dean & SAR endorsed facility event permits.'
              : 'Administer Mahapola Higher Education grants, University Bursaries, student assistance programs, and technology society event permits.'}
          </p>
        </div>

        {activeTab === 'societies' && (
          <div className="adm-section-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="adm-find-process-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setPermitSocietyId(societies[0]?.id || '');
                setIsAddPermitModalOpen(true);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              + Issue Event Permit
            </button>
            <button
              type="button"
              className="adm-find-process-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#047857', borderColor: '#047857' }}
              onClick={() => setIsAddSocietyModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Register New Society
            </button>
          </div>
        )}
      </div>

      {permitToast && (
        <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          ✓ {permitToast}
        </div>
      )}

      {/* Main Tabs Strip */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
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
          Student Societies & Club Permits ({societies.length})
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
                          <span className={`adm-badge ${stu.welfare.includes('Mahapola') ? 'adm-badge-info' : 'adm-badge-neutral'}`}>
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
        /* =========================================================
            STUDENT SOCIETIES & CLUB PERMITS MAINTENANCE TAB
           ========================================================= */
        <>
          {/* Key Statistics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <div className="adm-card" style={{ padding: '0.9rem 1.1rem', borderTop: '3px solid #0f2b5c' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>REGISTERED SOCIETIES</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{societies.length}</div>
              <div style={{ fontSize: '0.7rem', color: '#0f2b5c', fontWeight: 600 }}>Technology Faculty Associations</div>
            </div>

            <div className="adm-card" style={{ padding: '0.9rem 1.1rem', borderTop: '3px solid #2563eb' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>STUDENT MEMBERSHIP</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb', margin: '2px 0' }}>
                {societies.reduce((sum, s) => sum + (Number(s.members) || 0), 0)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Undergraduate Members</div>
            </div>

            <div className="adm-card" style={{ padding: '0.9rem 1.1rem', borderTop: '3px solid #16a34a' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>APPROVED PERMITS</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', margin: '2px 0' }}>
                {permits.filter((p) => p.status === 'Approved').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>Dean & SAR Endorsed Events</div>
            </div>

            <div className="adm-card" style={{ padding: '0.9rem 1.1rem', borderTop: '3px solid #d97706' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PENDING REVIEWS</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706', margin: '2px 0' }}>
                {permits.filter((p) => p.status === 'Pending Review').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>Awaiting Administrative Action</div>
            </div>
          </div>

          {/* Sub-Tabs & Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
            {/* View Pill Buttons */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSubTab('societies');
                  setStatusFilter('ALL');
                }}
                style={{
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: subTab === 'societies' ? '#ffffff' : 'transparent',
                  color: subTab === 'societies' ? '#0f2b5c' : '#64748b',
                  boxShadow: subTab === 'societies' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Societies & Leadership Roster ({societies.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubTab('permits');
                  setStatusFilter('ALL');
                }}
                style={{
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: subTab === 'permits' ? '#ffffff' : 'transparent',
                  color: subTab === 'permits' ? '#0f2b5c' : '#64748b',
                  boxShadow: subTab === 'permits' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Event & Facility Permits ({permits.length})
              </button>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={subTab === 'societies' ? 'Search societies or president...' : 'Search events or venues...'}
                className="adm-input"
                style={{ width: '220px', padding: '5px 10px', fontSize: '0.78rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="adm-input"
                style={{ width: '150px', padding: '5px 10px', fontSize: '0.78rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                {subTab === 'societies' ? (
                  <>
                    <option value="ACTIVE">Active Societies</option>
                    <option value="SUSPENDED">Suspended</option>
                  </>
                ) : (
                  <>
                    <option value="APPROVED">Approved Permits</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="DECLINED">Declined</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Sub-View A: Societies & Leadership Roster */}
          {subTab === 'societies' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {filteredSocieties.map((soc) => (
                <div key={soc.id} className="adm-card" style={{ padding: '1.1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span className={`adm-badge ${soc.status.includes('Active') ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                        {soc.status}
                      </span>
                      <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                        Est. {soc.establishedYear}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#0f2b5c', fontWeight: 700, background: '#eff6ff', padding: '2px 8px', borderRadius: '12px' }}>
                      {soc.members} Members
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                    {soc.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    {soc.department} • {soc.email}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.76rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>President:</span>
                      <strong style={{ color: '#0f172a' }}>{soc.president}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Senior Treasurer:</span>
                      <strong style={{ color: '#0f172a' }}>{soc.advisor}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '4px' }}>
                      <span style={{ color: '#64748b' }}>Active Project:</span>
                      <strong style={{ color: '#0f2b5c' }}>{soc.upcomingEvent}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="adm-btn-xs-secondary"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => setEditingUserSociety(soc)}
                    >
                      Edit Leadership & Details
                    </button>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="adm-btn-xs-secondary"
                        style={{ fontSize: '0.72rem', color: soc.status.includes('Active') ? '#dc2626' : '#16a34a' }}
                        onClick={() => handleToggleSocietyStatus(soc.id)}
                      >
                        {soc.status.includes('Active') ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="adm-btn-xs-primary"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => {
                          setPermitSocietyId(soc.id);
                          setIsAddPermitModalOpen(true);
                        }}
                      >
                        + Issue Permit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-View B: Event & Facility Permits */}
          {subTab === 'permits' && (
            <div className="adm-table-card">
              <div className="adm-table-wrapper">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Permit ID & Society</th>
                      <th>Event Title & Type</th>
                      <th>Scheduled Date & Time</th>
                      <th>Requested Venue</th>
                      <th>Attendees</th>
                      <th>Approval Status</th>
                      <th>Administration Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermits.map((p) => {
                      const isApproved = p.status === 'Approved';
                      const isPending = p.status === 'Pending Review';
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f2b5c', fontSize: '0.82rem' }}>{p.id}</div>
                            <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>{p.societyName}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.eventTitle}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.eventType}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.eventDate}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.duration}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0f2b5c', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                              {p.venue}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{p.expectedAttendees}</span>
                          </td>
                          <td>
                            <span className={`adm-badge ${isApproved ? 'adm-badge-success' : isPending ? 'adm-badge-warning' : 'adm-badge-danger'}`}>
                              {p.status}
                            </span>
                            {p.approvedBy && (
                              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                                By: {p.approvedBy}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    className="adm-btn-xs-primary"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => handleApprovePermit(p.id)}
                                  >
                                    ✓ Endorse & Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="adm-btn-xs-secondary"
                                    style={{ fontSize: '0.7rem', color: '#dc2626' }}
                                    onClick={() => handleDeclinePermit(p.id)}
                                  >
                                    ✗ Decline
                                  </button>
                                </>
                              )}
                              {isApproved && (
                                <button
                                  type="button"
                                  className="adm-btn-xs-secondary"
                                  style={{ fontSize: '0.7rem', color: '#b45309' }}
                                  onClick={() => handleRevokePermit(p.id)}
                                >
                                  Revoke Permit
                                </button>
                              )}
                              {p.status === 'Declined' && (
                                <button
                                  type="button"
                                  className="adm-btn-xs-secondary"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => handleRevokePermit(p.id)}
                                >
                                  Re-evaluate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          MODAL 1: REGISTER NEW STUDENT SOCIETY / CLUB
          ========================================================= */}
      {isAddSocietyModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddSocietyModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Register New Student Society & Executive Board</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddSocietyModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSociety}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group full-width">
                    <label className="adm-label">Official Society / Club Name *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Technology Cyber Security Club (TCSC)"
                      value={newSocName}
                      onChange={(e) => setNewSocName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Faculty / Department Division *</label>
                    <select
                      className="adm-input"
                      value={newSocDept}
                      onChange={(e) => setNewSocDept(e.target.value)}
                    >
                      <option value="Department of ICT">Department of ICT</option>
                      <option value="Department of Bio Systems Technology">Department of Biosystems Technology</option>
                      <option value="Faculty Wide (Technology)">Faculty Wide (Technology)</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Official Contact Email</label>
                    <input
                      type="email"
                      className="adm-input"
                      placeholder="society@seu.ac.lk"
                      value={newSocEmail}
                      onChange={(e) => setNewSocEmail(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">President Name & Student Reg No *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. M.N.M. Afnan (SEU/IS/22/ICT/085)"
                      value={newSocPresident}
                      onChange={(e) => setNewSocPresident(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Senior Treasurer / Academic Advisor *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Dr. S. Kirushanth (Senior Lecturer)"
                      value={newSocAdvisor}
                      onChange={(e) => setNewSocAdvisor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Initial Active Membership Count</label>
                    <input
                      type="number"
                      className="adm-input"
                      min="10"
                      max="1000"
                      value={newSocMembers}
                      onChange={(e) => setNewSocMembers(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#475569' }}>
                  <strong>Governance Policy:</strong> New student societies require registration endorsement under the Faculty Board and Dean’s Secretariat before conducting on-campus activities or booking university facilities.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddSocietyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Register Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ISSUE / REQUEST EVENT & FACILITY PERMIT
          ========================================================= */}
      {isAddPermitModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddPermitModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Issue Official Event & Facility Permit</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddPermitModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePermit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Organizing Society *</label>
                    <select
                      className="adm-input"
                      value={permitSocietyId || (societies[0]?.id || '')}
                      onChange={(e) => setPermitSocietyId(e.target.value)}
                      required
                    >
                      {societies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Event Category *</label>
                    <select
                      className="adm-input"
                      value={permitType}
                      onChange={(e) => setPermitType(e.target.value)}
                    >
                      <option value="Workshop & Bootcamp">Workshop & Bootcamp</option>
                      <option value="Hackathon & Coding Contest">Hackathon & Coding Contest</option>
                      <option value="Exhibition & Demonstration">Exhibition & Demonstration</option>
                      <option value="Sports & Tournament">Sports & Tournament</option>
                      <option value="Cultural Celebration">Cultural Celebration</option>
                      <option value="Guest Lecture & Industry Talk">Guest Lecture & Industry Talk</option>
                    </select>
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Event Title / Project Name *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Annual Technology Innovators Summit 2026"
                      value={permitTitle}
                      onChange={(e) => setPermitTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Approved Venue / Facility *</label>
                    <select
                      className="adm-input"
                      value={permitVenue}
                      onChange={(e) => setPermitVenue(e.target.value)}
                    >
                      <option value="Faculty Auditorium">Faculty Auditorium</option>
                      <option value="ICT Software Lab 01">ICT Software Lab 01</option>
                      <option value="ICT Software Lab 02">ICT Software Lab 02</option>
                      <option value="Biosystems Technology Labs & Green House">Biosystems Technology Labs & Green House</option>
                      <option value="Faculty Open Ground & Pavilion">Faculty Open Ground & Pavilion</option>
                      <option value="Multipurpose Sports Complex">Multipurpose Sports Complex</option>
                      <option value="Dean's Conference Room">Dean&apos;s Conference Room</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Scheduled Date *</label>
                    <input
                      type="date"
                      className="adm-input"
                      value={permitDate}
                      onChange={(e) => setPermitDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Time & Duration</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. 08:30 AM - 05:00 PM"
                      value={permitDuration}
                      onChange={(e) => setPermitDuration(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Expected Attendees Count</label>
                    <input
                      type="number"
                      className="adm-input"
                      min="10"
                      value={permitAttendees}
                      onChange={(e) => setPermitAttendees(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Administrative Remarks & Logistics Clearance</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Audio visual equipment and student security clearance approved."
                      value={permitRemarks}
                      onChange={(e) => setPermitRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#166534' }}>
                  <strong>Dean & SAR Clearance:</strong> Submitting will record the event permit in the faculty calendar. Approvals notify campus security and maintenance divisions for facility access.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddPermitModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Issue & Queue Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: EDIT SOCIETY LEADERSHIP & RECORDS
          ========================================================= */}
      {editingSociety && (
        <div className="adm-modal-backdrop" onClick={() => setEditingUserSociety(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Edit Society Details: {editingSociety.name}</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setEditingUserSociety(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSocietySubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">President & Reg No</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={editingSociety.president}
                      onChange={(e) => setEditingUserSociety({ ...editingSociety, president: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Senior Treasurer / Academic Advisor</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={editingSociety.advisor}
                      onChange={(e) => setEditingUserSociety({ ...editingSociety, advisor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Active Membership Count</label>
                    <input
                      type="number"
                      className="adm-input"
                      value={editingSociety.members}
                      onChange={(e) => setEditingUserSociety({ ...editingSociety, members: e.target.value })}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Society Status</label>
                    <select
                      className="adm-input"
                      value={editingSociety.status}
                      onChange={(e) => setEditingUserSociety({ ...editingSociety, status: e.target.value })}
                    >
                      <option value="Registered & Active">Registered & Active</option>
                      <option value="Under Annual Renewal">Under Annual Renewal</option>
                      <option value="Suspended / Inactive">Suspended / Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setEditingUserSociety(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
