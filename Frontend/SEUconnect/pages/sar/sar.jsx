import React, { useState, useEffect, useMemo } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import api from '../../src/services/api.js';
import './sar.css';

export default function SAR({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Active Workflow Inbox Selection
  // 'inbox_eca', 'inbox_esa', 'inbox_exam_forms', 'inbox_exam_medicals',
  // 'inbox_exam_branch_forward', 'inbox_admission_processing', 'inbox_returned', 'inbox_completed'
  const [selectedInbox, setSelectedInbox] = useState('inbox_eca');

  // Filters & Search
  const [deptFilter, setDeptFilter] = useState('all'); // 'all', 'bst', 'ict'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [notifFilter, setNotifFilter] = useState('all'); // 'all', 'unread'

  // Form Availability State (SAR Managed)
  const [portalAvailability, setPortalAvailability] = useState({
    eca: { isOpen: true, semester: 'Semester 2', academicYear: '2025/2026', deadline: '2026-11-20T23:59:00Z' },
    esa: { isOpen: true, semester: 'Semester 2', academicYear: '2025/2026', deadline: '2026-11-25T23:59:00Z' },
  });

  // Modals state
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [remarkModalProcess, setRemarkModalProcess] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [docCheckStatus, setDocCheckStatus] = useState('Verified Complete');
  
  const [clarifyModalProcess, setClarifyModalProcess] = useState(null);
  const [clarifyNotes, setClarifyNotes] = useState('');
  const [selectedDeficiencies, setSelectedDeficiencies] = useState([]);

  // SAR Special Action Modals
  const [admissionModalProcess, setAdmissionModalProcess] = useState(null);
  const [customAdmissionNo, setCustomAdmissionNo] = useState('');
  const [admissionNotes, setAdmissionNotes] = useState('');

  const [senateModalProcess, setSenateModalProcess] = useState(null);
  const [senateTrackingNo, setSenateTrackingNo] = useState('');
  const [senateNote, setSenateNote] = useState('');

  const [deptListModal, setDeptListModal] = useState(false);
  const [deptListSelected, setDeptListSelected] = useState('Department of Information and Communication Technology');
  const [deptListNote, setDeptListNote] = useState('');

  const sarName = user?.name || 'Mr. K.L.M. Riyas';
  const sarDesignation = user?.designation || 'Senior Assistant Registrar (SAR)';
  const sarStaffId = user?.staffId || 'STAFF-SAR-001';

  // Load processes, notifications, and form availability
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [procRes, notifRes, availRes] = await Promise.all([
        api.getProcesses(),
        api.getNotifications('sar').catch(() => ({ data: [] })),
        api.getFormAvailability().catch(() => null),
      ]);

      if (procRes && procRes.data) {
        setProcesses(procRes.data);
      }
      if (notifRes && notifRes.data) {
        setNotifications(notifRes.data);
      }
      if (availRes && availRes.data) {
        setPortalAvailability(availRes.data);
      }
    } catch (err) {
      console.warn('Error loading SAR data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync activeNav with URL hash if present
  useEffect(() => {
    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (hash.startsWith('sar/')) {
      const sub = hash.replace('sar/', '');
      if (['dashboard', 'inboxes', 'monitoring', 'pending_actions', 'portal_management', 'faculty_records', 'reports', 'notifications'].includes(sub)) {
        setActiveNav(sub);
      } else if (sub.startsWith('inbox_')) {
        setActiveNav('inboxes');
        setSelectedInbox(sub);
      }
    }
  }, []);

  const handleNavigate = (id) => {
    if (id.startsWith('inbox_')) {
      setActiveNav('inboxes');
      setSelectedInbox(id);
      window.location.hash = `#sar/${id}`;
    } else {
      setActiveNav(id);
      window.location.hash = `#sar/${id}`;
    }
  };

  // Department classifiers
  const isBST = (p) => {
    const dept = (p.student?.department || '').toLowerCase();
    const prog = (p.student?.programme || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return dept.includes('bio') || prog.includes('bbst') || title.includes('bst');
  };

  const isICT = (p) => {
    const dept = (p.student?.department || '').toLowerCase();
    const prog = (p.student?.programme || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return dept.includes('information') || dept.includes('ict') || prog.includes('bict') || title.includes('ict');
  };

  const getDeptShort = (p) => {
    if (isBST(p)) return 'BST';
    if (isICT(p)) return 'ICT';
    return 'FOT';
  };

  // Pending duration calculator
  const getPendingDuration = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} pending`;
  };

  // Form type display label
  const getFormTypeLabel = (type) => {
    switch (type) {
      case 'eca_application':
        return 'ECA Application (Continuous Assessment)';
      case 'esa_application':
        return 'ESA Application (End Semester Exam)';
      case 'exam_form':
        return 'Examination Form (Official Entry)';
      case 'exam_medical':
        return 'Examination Medical Form';
      case 'subject_medical':
        return 'Subject Medical Form';
      case 'repeat_exam':
        return 'Repeat Exam Registration';
      case 'medical_excuse':
        return 'Medical Excuse Form';
      default:
        return (type || 'Application').replace('_', ' ').toUpperCase();
    }
  };

  // =========================================================================
  // THE 8 WORKFLOW INBOXES (Dynamic Database Calculations)
  // =========================================================================
  const ecaInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'eca_application' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Review')
    );
  }, [processes]);

  const esaInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'esa_application' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Review')
    );
  }, [processes]);

  const examFormsInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_form' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Verification')
    );
  }, [processes]);

  const examMedicalsInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_medical' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Action')
    );
  }, [processes]);

  const examBranchForwardInbox = useMemo(() => {
    return processes.filter(
      (p) => p.currentAssignedRole === 'examination' || p.status === 'Pending Examination Branch'
    );
  }, [processes]);

  const admissionProcessingInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_form' && (p.status === 'Admission Generated' || p.admissionDetails?.admissionNo || p.currentStageIndex >= 4)
    );
  }, [processes]);

  const returnedInbox = useMemo(() => {
    return processes.filter(
      (p) => p.status === 'Returned for Correction' || p.status === 'Declined' || p.auditLog?.some((l) => l.action === 'RETURNED_BY_SAR' || l.action === 'CORRECTION_REQUESTED')
    );
  }, [processes]);

  const completedInbox = useMemo(() => {
    return processes.filter((p) => p.status === 'Approved');
  }, [processes]);

  const inboxesList = [
    { id: 'inbox_eca', label: '1. ECA Applications', title: 'ECA Applications - Awaiting SAR Review', list: ecaInbox, badgeColor: '#3b82f6', desc: 'Verify CA repeat payment receipts and forward to Examination Branch' },
    { id: 'inbox_esa', label: '2. ESA Applications', title: 'ESA Applications - Awaiting SAR Review', list: esaInbox, badgeColor: '#8b5cf6', desc: 'Verify ESA repeat payment receipts and forward to Examination Branch' },
    { id: 'inbox_exam_forms', label: '3. Examination Forms', title: 'Examination Forms - Awaiting SAR Verification', list: examFormsInbox, badgeColor: '#0284c7', desc: 'Administrative verification of HOD-approved examination forms' },
    { id: 'inbox_exam_medicals', label: '4. Exam Medical Forms', title: 'Examination Medical Forms - Awaiting SAR Administrative Action', list: examMedicalsInbox, badgeColor: '#e11d48', desc: 'Faculty Board MA / Dean Office approval stage (SAR Authorized Officer)' },
    { id: 'inbox_exam_branch_forward', label: '5. Exam Branch Forwarding', title: 'Examination Branch Forwarding Queue', list: examBranchForwardInbox, badgeColor: '#f59e0b', desc: 'Applications verified by SAR and queued for Examination Branch' },
    { id: 'inbox_admission_processing', label: '6. Admission Processing', title: 'Examination Admission Processing (Dean Office Admission & Senate)', list: admissionProcessingInbox, badgeColor: '#10b981', desc: 'Process official Dean Office Admission (Examination Section) and Senate copies' },
    { id: 'inbox_returned', label: '7. Returned Applications', title: 'Returned Applications (Corrections Flagged)', list: returnedInbox, badgeColor: '#ef4444', desc: 'Applications returned to candidate or coordinator with deficiency notices' },
    { id: 'inbox_completed', label: '8. Completed Applications', title: 'Completed Applications Ledger', list: completedInbox, badgeColor: '#059669', desc: 'Finalized examinations, approved admissions, and archived Senate copies' },
  ];

  const currentInboxDef = inboxesList.find((i) => i.id === selectedInbox) || inboxesList[0];
  const currentInboxItems = useMemo(() => {
    let items = currentInboxDef.list || [];
    if (deptFilter === 'bst') items = items.filter(isBST);
    if (deptFilter === 'ict') items = items.filter(isICT);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          (p.trackingNumber || '').toLowerCase().includes(q) ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.student?.name || '').toLowerCase().includes(q) ||
          (p.student?.regNo || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [currentInboxDef, deptFilter, searchQuery]);

  // Overall metrics
  const totalCount = processes.length;
  const bstProcesses = useMemo(() => processes.filter(isBST), [processes]);
  const ictProcesses = useMemo(() => processes.filter(isICT), [processes]);

  // Notifications
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifs.length;

  const handleMarkNotifRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || String(n._id) === String(id) ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead('sar');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkNotifRead(notif._id);
    if (notif.relatedRequestId) {
      const match = processes.find((p) => p.trackingNumber === notif.relatedRequestId);
      if (match) {
        setSelectedProcess(match);
      } else {
        handleNavigate('monitoring');
      }
    }
  };

  // =========================================================================
  // SAR ACTIONS & WORKFLOW HANDLERS
  // =========================================================================
  const handleVerifyAndForward = async (processToForward) => {
    if (!processToForward) return;
    try {
      await api.sarVerifyAndForward(processToForward.trackingNumber || processToForward._id, {
        actorName: sarName,
        remarks: 'Payment receipt and supporting documents verified complete. Forwarded to Examination Branch.',
      });
      alert(`Application ${processToForward.trackingNumber} verified and forwarded to Examination Branch!`);
      await loadData();
    } catch (err) {
      alert('Error verifying and forwarding: ' + err.message);
    }
  };

  const handleSaveRemark = async () => {
    if (!remarkModalProcess || !remarkText.trim()) return;
    try {
      await api.addAdminRemark(remarkModalProcess.trackingNumber || remarkModalProcess._id, {
        actorName: sarName,
        actorRole: 'Senior Assistant Registrar (SAR)',
        actorEmail: user?.email || 'sar@gmail.com',
        remark: remarkText,
        documentCheckStatus: docCheckStatus,
      });
      setRemarkModalProcess(null);
      setRemarkText('');
      await loadData();
    } catch (err) {
      alert('Error saving administrative remark: ' + err.message);
    }
  };

  const handleRequestClarification = async () => {
    if (!clarifyModalProcess || !clarifyNotes.trim()) return;
    try {
      await api.requestClarification(clarifyModalProcess.trackingNumber || clarifyModalProcess._id, {
        actorName: sarName,
        actorRole: 'Senior Assistant Registrar (SAR)',
        actorEmail: user?.email || 'sar@gmail.com',
        issuesIdentified: selectedDeficiencies,
        notes: clarifyNotes,
      });
      setClarifyModalProcess(null);
      setClarifyNotes('');
      setSelectedDeficiencies([]);
      await loadData();
    } catch (err) {
      alert('Error returning application: ' + err.message);
    }
  };

  const handleProcessAdmission = async () => {
    if (!admissionModalProcess) return;
    try {
      await api.sarProcessAdmission(admissionModalProcess.trackingNumber || admissionModalProcess._id, {
        actorName: sarName,
        admissionNo: customAdmissionNo.trim() || undefined,
        notes: admissionNotes.trim() || undefined,
      });
      alert('Official Dean Office Admission (Examination Section) generated successfully!');
      setAdmissionModalProcess(null);
      setCustomAdmissionNo('');
      setAdmissionNotes('');
      await loadData();
    } catch (err) {
      alert('Error processing admission: ' + err.message);
    }
  };

  const handleTrackSenateCopy = async () => {
    if (!senateModalProcess) return;
    try {
      await api.sarTrackSenateCopy(senateModalProcess.trackingNumber || senateModalProcess._id, {
        actorName: sarName,
        trackingNo: senateTrackingNo.trim() || undefined,
        submissionNote: senateNote.trim() || undefined,
      });
      alert('Senate copy preparation and submission recorded!');
      setSenateModalProcess(null);
      setSenateTrackingNo('');
      setSenateNote('');
      await loadData();
    } catch (err) {
      alert('Error recording Senate copy: ' + err.message);
    }
  };

  const handleForwardDeptList = async () => {
    try {
      await api.sarForwardDepartmentList({
        department: deptListSelected,
        academicYear: '2025/2026',
        notes: deptListNote,
      });
      alert(`Official examination candidate list for ${deptListSelected} forwarded to HOD & Lecturers.`);
      setDeptListModal(false);
      setDeptListNote('');
    } catch (err) {
      alert('Error forwarding department list: ' + err.message);
    }
  };

  const handleToggleFormAvailability = async (formType) => {
    try {
      const current = portalAvailability[formType];
      const res = await api.toggleFormAvailability({
        formType,
        isOpen: !current?.isOpen,
      });
      if (res && res.data) {
        setPortalAvailability((prev) => ({
          ...prev,
          [formType]: res.data,
        }));
      }
    } catch (err) {
      alert('Error updating portal availability: ' + err.message);
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="sar-status-badge sar-status-approved">✓ Approved</span>;
      case 'Pending Dean':
        return <span className="sar-status-badge sar-status-pending-dean">⏳ Awaiting Dean</span>;
      case 'Pending HOD':
        return <span className="sar-status-badge sar-status-pending-hod">🏛️ Pending HOD</span>;
      case 'Pending Lecturer':
        return <span className="sar-status-badge sar-status-pending-lecturer">👨‍🏫 Pending Lecturer</span>;
      case 'Pending SAR Review':
      case 'Pending SAR Verification':
      case 'Pending SAR Action':
        return <span className="sar-status-badge sar-status-pending-sar">🔍 {status}</span>;
      case 'Pending Examination Branch':
        return <span className="sar-status-badge sar-status-pending-exam">🚀 To Exam Branch</span>;
      case 'Admission Generated':
        return <span className="sar-status-badge sar-status-admission">🎫 Admission Issued</span>;
      case 'Returned for Correction':
      case 'Declined':
        return <span className="sar-status-badge sar-status-declined">✕ Returned / Correction</span>;
      default:
        return <span className="sar-status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  // Reusable 8 Workflow Inboxes Table View
  const renderInboxesDesk = () => (
    <section className="sar-inboxes-section">
      <div className="sar-inboxes-header">
        <div className="sar-inboxes-title-group">
          <h2>SAR Workflow Inboxes ({currentInboxDef.list.length} Items)</h2>
          <p>{currentInboxDef.desc}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              className="sar-search-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
              placeholder="Filter inbox by ID, student, or reg no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="sar-btn-pill"
            onClick={loadData}
            title="Sync database and check for new student submissions"
          >
            ↻ Refresh Queue
          </button>
        </div>
      </div>

      {/* 8 Inbox Navigation Pills */}
      <div className="sar-inboxes-nav-pills">
        {inboxesList.map((inbox) => {
          const count = inbox.list.length;
          return (
            <button
              key={inbox.id}
              type="button"
              className={`sar-inbox-tab-btn ${selectedInbox === inbox.id ? 'active' : ''}`}
              onClick={() => setSelectedInbox(inbox.id)}
            >
              <span>{inbox.label}</span>
              <span className="sar-inbox-count-badge" style={selectedInbox !== inbox.id && count > 0 ? { background: '#fef3c7', color: '#b45309' } : {}}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inbox Table Display */}
      <div className="sar-table-responsive">
        <table className="sar-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Student Details</th>
              <th>Department</th>
              <th>Form Type</th>
              <th>Current Status</th>
              <th>Submission Date</th>
              <th>Pending Duration</th>
              <th style={{ textAlign: 'right' }}>SAR Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentInboxItems.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📭</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>No applications currently in {currentInboxDef.title}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>All pending tasks in this category are up to date.</div>
                </td>
              </tr>
            ) : (
              currentInboxItems.map((p) => {
                const submissionDate = p.createdAt || p.details?.absenceDate || new Date().toISOString();
                const pendingDuration = getPendingDuration(submissionDate);
                const canVerifyAndForward =
                  (p.type === 'eca_application' || p.type === 'esa_application' || p.type === 'exam_form' || p.type === 'exam_medical') &&
                  (p.currentAssignedRole === 'sar' || p.status.includes('Pending SAR'));
                const isExamFormForAdmission = p.type === 'exam_form' && (p.status === 'Pending Examination Branch' || p.currentStageIndex >= 4);

                return (
                  <tr key={p._id || p.trackingNumber}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.86rem' }}>
                        {p.trackingNumber}
                      </strong>
                      {p.priority === 'High' && (
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          HIGH
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.student?.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.student?.regNo} • {p.student?.programme}</div>
                    </td>

                    <td>
                      <span className={`sar-dept-pill ${isBST(p) ? 'sar-dept-pill-bst' : 'sar-dept-pill-ict'}`}>
                        {getDeptShort(p)}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                        {getFormTypeLabel(p.type)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {p.details?.courseCodes?.[0] || p.title?.slice(0, 32)}
                      </div>
                    </td>

                    <td>
                      {renderStatusBadge(p.status)}
                    </td>

                    <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(submissionDate).toLocaleDateString('en-GB')}
                    </td>

                    <td>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        ⏱️ {pendingDuration}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="sar-action-btn-secondary"
                          onClick={() => setSelectedProcess(p)}
                          title="Open application, examine payment voucher & verify documents"
                        >
                          Open
                        </button>

                        {canVerifyAndForward && (
                          <button
                            type="button"
                            className="sar-action-btn-success"
                            onClick={() => handleVerifyAndForward(p)}
                            title="Verify payment receipt & forward to Examination Branch"
                          >
                            Verify & Forward
                          </button>
                        )}

                        {canVerifyAndForward && (
                          <button
                            type="button"
                            className="sar-action-btn-secondary"
                            style={{ color: '#b91c1c' }}
                            onClick={() => setClarifyModalProcess(p)}
                            title="Return for correction with deficiency notes"
                          >
                            Return
                          </button>
                        )}

                        {isExamFormForAdmission && (
                          <button
                            type="button"
                            className="sar-action-btn-primary"
                            onClick={() => {
                              setAdmissionModalProcess(p);
                              setCustomAdmissionNo(`ADM-FOT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                            }}
                            title="Generate official Dean Office Admission (Examination Section)"
                          >
                            Issue Admission
                          </button>
                        )}

                        {(p.type === 'exam_form' || p.type === 'exam_medical') && (
                          <button
                            type="button"
                            className="sar-action-btn-secondary"
                            onClick={() => {
                              setSenateModalProcess(p);
                              setSenateTrackingNo(`SENATE-FOT-2026-${Math.floor(100 + Math.random() * 900)}`);
                            }}
                            title="Prepare and track Senate copy submission"
                          >
                            Senate Copy
                          </button>
                        )}

                        <button
                          type="button"
                          className="sar-action-btn-secondary"
                          onClick={() => setRemarkModalProcess(p)}
                          title="Add official administrative remarks to audit log"
                        >
                          Remark
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <DashboardTemplate
      user={user}
      onLogout={onLogout}
      activeItem={activeNav}
      onNavigate={handleNavigate}
      notificationCount={unreadCount}
      greetingText={`Welcome, ${sarName}`}
    >
      <div className="sar-portal-container">
        
        {/* ====================================================================
            PAGE ROUTE 1: DASHBOARD (MAIN)
            ==================================================================== */}
        {activeNav === 'dashboard' && (
          <>
            {/* Top 6 Summary Metric Cards (Spacious 3x2 Grid, Zero Overflow) */}
            <section className="sar-stats-grid">
              {/* Card 1: Total Requests */}
              <div className="sar-stat-card" onClick={() => handleNavigate('monitoring')}>
                <div className="sar-stat-icon-wrap sar-stat-icon-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title">TOTAL REQUESTS</span>
                    <span className="sar-stat-badge">Faculty Scope</span>
                  </div>
                  <div className="sar-stat-number">{totalCount}</div>
                  <div className="sar-stat-target">Across BST & ICT departments</div>
                </div>
              </div>

              {/* Card 2: ECA & ESA Awaiting SAR Review */}
              <div
                className="sar-stat-card"
                style={ecaInbox.length + esaInbox.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffdfa' } : {}}
                onClick={() => handleNavigate('inbox_eca')}
              >
                <div className="sar-stat-icon-wrap sar-stat-icon-amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title" style={ecaInbox.length + esaInbox.length > 0 ? { color: '#b45309' } : {}}>ECA & ESA REVIEW</span>
                    <span className="sar-stat-badge" style={ecaInbox.length + esaInbox.length > 0 ? { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } : {}}>SAR Action</span>
                  </div>
                  <div className="sar-stat-number" style={ecaInbox.length + esaInbox.length > 0 ? { color: '#b45309' } : {}}>
                    {ecaInbox.length + esaInbox.length}
                  </div>
                  <div className="sar-stat-target">Payment receipts & voucher verification</div>
                </div>
              </div>

              {/* Card 3: Exam Forms Awaiting SAR Verification */}
              <div className="sar-stat-card" onClick={() => handleNavigate('inbox_exam_forms')}>
                <div className="sar-stat-icon-wrap sar-stat-icon-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title">EXAM FORMS</span>
                    <span className="sar-stat-badge">HOD Endorsed</span>
                  </div>
                  <div className="sar-stat-number">{examFormsInbox.length}</div>
                  <div className="sar-stat-target">Administrative verification pending</div>
                </div>
              </div>

              {/* Card 4: Exam Medicals (Dean Office Stage) */}
              <div className="sar-stat-card" onClick={() => handleNavigate('inbox_exam_medicals')}>
                <div className="sar-stat-icon-wrap sar-stat-icon-rose">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title">EXAM MEDICALS</span>
                    <span className="sar-stat-badge">Dean Office Stage</span>
                  </div>
                  <div className="sar-stat-number">{examMedicalsInbox.length}</div>
                  <div className="sar-stat-target">Faculty Board MA authorized review</div>
                </div>
              </div>

              {/* Card 5: Exam Branch Forwarding Queue */}
              <div className="sar-stat-card" onClick={() => handleNavigate('inbox_exam_branch_forward')}>
                <div className="sar-stat-icon-wrap sar-stat-icon-emerald">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title">EXAM FORWARD</span>
                    <span className="sar-stat-badge">Verified Queue</span>
                  </div>
                  <div className="sar-stat-number">{examBranchForwardInbox.length}</div>
                  <div className="sar-stat-target">Queued for Examination Branch</div>
                </div>
              </div>

              {/* Card 6: Admission Processing */}
              <div className="sar-stat-card" onClick={() => handleNavigate('inbox_admission_processing')}>
                <div className="sar-stat-icon-wrap sar-stat-icon-cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="sar-stat-body">
                  <div className="sar-stat-top-row">
                    <span className="sar-stat-title">ADMISSIONS & SENATE</span>
                    <span className="sar-stat-badge">Dean Office</span>
                  </div>
                  <div className="sar-stat-number">{admissionProcessingInbox.length}</div>
                  <div className="sar-stat-target">Official admission & Senate copy tracking</div>
                </div>
              </div>
            </section>

            {/* The 8 Workflow Inboxes Desk */}
            {renderInboxesDesk()}

            {/* Online Application Form Portals (SAR Managed) */}
            <section className="sar-portal-mgmt-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    Online Application Form Portals (SAR Managed)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Control live online student accessibility for Continuous Assessment (ECA) and End Semester Assessment (ESA) forms.
                  </p>
                </div>
                <button
                  type="button"
                  className="sar-btn-pill"
                  onClick={() => setDeptListModal(true)}
                >
                  🏢 Forward Dept-wise Examination List to HOD
                </button>
              </div>

              <div className="sar-portal-mgmt-grid">
                <div className="sar-portal-box">
                  <div className="sar-portal-box-top">
                    <span className="sar-portal-box-title">ECA Application Portal (Continuous Assessment)</span>
                    <span className={`sar-portal-status-pill ${portalAvailability.eca?.isOpen ? 'sar-status-open' : 'sar-status-closed'}`}>
                      {portalAvailability.eca?.isOpen ? '● ONLINE / ACCEPTING' : '○ CLOSED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Academic Year: <strong>{portalAvailability.eca?.academicYear || '2025/2026'}</strong> • Semester: <strong>{portalAvailability.eca?.semester || 'Semester 2'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Deadline: 20 Nov 2026 (11:59 PM)
                    </span>
                    <button
                      type="button"
                      className={`sar-action-btn-${portalAvailability.eca?.isOpen ? 'secondary' : 'success'}`}
                      onClick={() => handleToggleFormAvailability('eca')}
                    >
                      {portalAvailability.eca?.isOpen ? 'Close ECA Portal' : 'Open ECA Portal Online'}
                    </button>
                  </div>
                </div>

                <div className="sar-portal-box">
                  <div className="sar-portal-box-top">
                    <span className="sar-portal-box-title">ESA Application Portal (End Semester Examination)</span>
                    <span className={`sar-portal-status-pill ${portalAvailability.esa?.isOpen ? 'sar-status-open' : 'sar-status-closed'}`}>
                      {portalAvailability.esa?.isOpen ? '● ONLINE / ACCEPTING' : '○ CLOSED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Academic Year: <strong>{portalAvailability.esa?.academicYear || '2025/2026'}</strong> • Semester: <strong>{portalAvailability.esa?.semester || 'Semester 2'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Deadline: 25 Nov 2026 (11:59 PM)
                    </span>
                    <button
                      type="button"
                      className={`sar-action-btn-${portalAvailability.esa?.isOpen ? 'secondary' : 'success'}`}
                      onClick={() => handleToggleFormAvailability('esa')}
                    >
                      {portalAvailability.esa?.isOpen ? 'Close ESA Portal' : 'Open ESA Portal Online'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 2: WORKFLOW INBOXES (DEDICATED FULL VIEW)
            ==================================================================== */}
        {activeNav === 'inboxes' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>SAR Examination Workflow Inboxes</h1>
                <p>Manage the 8 official examination queues across the Faculty of Technology (BST & ICT)</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('all')}
                >
                  All Depts ({processes.length})
                </button>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'bst' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('bst')}
                >
                  BST ({bstProcesses.length})
                </button>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'ict' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('ict')}
                >
                  ICT ({ictProcesses.length})
                </button>
              </div>
            </div>

            {renderInboxesDesk()}
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 3: ADMINISTRATIVE REQUEST MONITORING
            ==================================================================== */}
        {activeNav === 'monitoring' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>Administrative Request Monitoring</h1>
                <p>Continuous oversight of all examination requests, approvals, and dispatches across both BST and ICT</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('all')}
                >
                  All Departments ({processes.length})
                </button>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'bst' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('bst')}
                >
                  BST ({bstProcesses.length})
                </button>
                <button
                  type="button"
                  className={`sar-btn-pill ${deptFilter === 'ict' ? 'active' : ''}`}
                  onClick={() => setDeptFilter('ict')}
                >
                  ICT ({ictProcesses.length})
                </button>
              </div>
            </div>

            <div className="sar-main-card">
              <div className="sar-toolbar">
                <div style={{ display: 'flex', gap: '0.65rem', flex: 1, minWidth: '280px' }}>
                  <input
                    type="text"
                    className="sar-search-input"
                    placeholder="Search by Request ID, Student Name, Reg No, or Module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="sar-filter-group">
                  <select
                    className="sar-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Form Types</option>
                    <option value="eca_application">ECA Applications</option>
                    <option value="esa_application">ESA Applications</option>
                    <option value="exam_form">Examination Forms</option>
                    <option value="exam_medical">Examination Medicals</option>
                  </select>

                  <select
                    className="sar-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_sar">Pending SAR Actions</option>
                    <option value="pending_exam">Pending Exam Branch</option>
                    <option value="approved">Approved / Completed</option>
                    <option value="returned">Returned / Declined</option>
                  </select>
                </div>
              </div>

              <div className="sar-table-responsive">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Request Title & Type</th>
                      <th>Requesting Student</th>
                      <th>Department</th>
                      <th>Submission Date</th>
                      <th>Workflow Status</th>
                      <th>Responsible Officer</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes
                      .filter((p) => {
                        if (deptFilter === 'bst' && !isBST(p)) return false;
                        if (deptFilter === 'ict' && !isICT(p)) return false;
                        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
                        if (statusFilter === 'pending_sar' && !(p.currentAssignedRole === 'sar' || p.status.includes('Pending SAR'))) return false;
                        if (statusFilter === 'pending_exam' && p.currentAssignedRole !== 'examination') return false;
                        if (statusFilter === 'approved' && p.status !== 'Approved') return false;
                        if (statusFilter === 'returned' && !(p.status === 'Returned for Correction' || p.status === 'Declined')) return false;
                        if (searchQuery.trim()) {
                          const q = searchQuery.toLowerCase().trim();
                          return (
                            (p.trackingNumber || '').toLowerCase().includes(q) ||
                            (p.title || '').toLowerCase().includes(q) ||
                            (p.student?.name || '').toLowerCase().includes(q) ||
                            (p.student?.regNo || '').toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((p) => (
                        <tr key={p._id || p.trackingNumber}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{p.trackingNumber}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{getFormTypeLabel(p.type)}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.student?.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.student?.regNo}</div>
                          </td>
                          <td>
                            <span className={`sar-dept-pill ${isBST(p) ? 'sar-dept-pill-bst' : 'sar-dept-pill-ict'}`}>
                              {getDeptShort(p)}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {new Date(p.createdAt || new Date()).toLocaleDateString('en-GB')}
                          </td>
                          <td>{renderStatusBadge(p.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                            {p.currentAssignedRole === 'sar' ? 'Senior Assistant Registrar' : (p.currentAssignedRole || 'Examination Branch').toUpperCase()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="sar-action-btn-secondary"
                              onClick={() => setSelectedProcess(p)}
                            >
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 4: PENDING ADMINISTRATIVE ACTIONS
            ==================================================================== */}
        {activeNav === 'pending_actions' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>Pending Administrative Actions</h1>
                <p>Prioritized action queues requiring immediate SAR document audit, verification, or output generation</p>
              </div>
              <button
                type="button"
                className="sar-btn-pill"
                onClick={loadData}
              >
                ↻ Refresh Pending Tasks
              </button>
            </div>

            <div className="sar-actions-grid">
              {/* Box 1: ECA & ESA Receipt Verifications */}
              <div className="sar-action-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="sar-action-card-top">
                  <div className="sar-action-card-title">
                    <span>💳</span> ECA & ESA Payment Receipts
                  </div>
                  <span className="sar-stat-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                    {ecaInbox.length + esaInbox.length} Pending
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Verify People's Bank PIV vouchers, payment amounts (Rs. 250/500), and eligibility slips uploaded by repeat students.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="sar-action-btn-primary"
                    onClick={() => {
                      setSelectedInbox('inbox_eca');
                      setActiveNav('inboxes');
                    }}
                  >
                    Open ECA Queue ({ecaInbox.length})
                  </button>
                  <button
                    type="button"
                    className="sar-action-btn-secondary"
                    onClick={() => {
                      setSelectedInbox('inbox_esa');
                      setActiveNav('inboxes');
                    }}
                  >
                    Open ESA Queue ({esaInbox.length})
                  </button>
                </div>
              </div>

              {/* Box 2: HOD-Approved Examination Forms */}
              <div className="sar-action-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="sar-action-card-top">
                  <div className="sar-action-card-title">
                    <span>📋</span> Examination Form Verifications
                  </div>
                  <span className="sar-stat-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                    {examFormsInbox.length} Pending
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Review Examination Forms already endorsed by Assigned Lecturers & HOD, verify credits, and forward to Examination Branch.
                </p>
                <button
                  type="button"
                  className="sar-action-btn-primary"
                  style={{ marginTop: 'auto' }}
                  onClick={() => {
                    setSelectedInbox('inbox_exam_forms');
                    setActiveNav('inboxes');
                  }}
                >
                  Verify Exam Forms Queue ({examFormsInbox.length})
                </button>
              </div>

              {/* Box 3: Exam Medical Forms (Dean Office Action) */}
              <div className="sar-action-card" style={{ borderLeft: '4px solid #e11d48' }}>
                <div className="sar-action-card-top">
                  <div className="sar-action-card-title">
                    <span>🏥</span> Exam Medicals (Dean Office)
                  </div>
                  <span className="sar-stat-badge" style={{ background: '#ffe4e6', color: '#be123c' }}>
                    {examMedicalsInbox.length} Pending
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Perform SAR authorized review at Faculty Board MA / Dean Office stage and forward accepted medicals to Examination Branch.
                </p>
                <button
                  type="button"
                  className="sar-action-btn-primary"
                  style={{ marginTop: 'auto' }}
                  onClick={() => {
                    setSelectedInbox('inbox_exam_medicals');
                    setActiveNav('inboxes');
                  }}
                >
                  Act on Medicals ({examMedicalsInbox.length})
                </button>
              </div>

              {/* Box 4: Dean Office Admission Generation */}
              <div className="sar-action-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="sar-action-card-top">
                  <div className="sar-action-card-title">
                    <span>🎫</span> Dean Office Admission Cards
                  </div>
                  <span className="sar-stat-badge" style={{ background: '#d1fae5', color: '#047857' }}>
                    {admissionProcessingInbox.length} Active
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Generate and issue official Dean Office Admission (Examination Section) passes for approved candidates and print certified cards.
                </p>
                <button
                  type="button"
                  className="sar-action-btn-primary"
                  style={{ marginTop: 'auto' }}
                  onClick={() => {
                    setSelectedInbox('inbox_admission_processing');
                    setActiveNav('inboxes');
                  }}
                >
                  Process Admissions ({admissionProcessingInbox.length})
                </button>
              </div>
            </div>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 5: ECA & ESA PORTAL MANAGEMENT
            ==================================================================== */}
        {activeNav === 'portal_management' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>Online ECA & ESA Application Portals Management</h1>
                <p>Configure live form availability, semester deadlines, and forward department-wise examination rosters</p>
              </div>
              <button
                type="button"
                className="sar-action-btn-primary"
                onClick={() => setDeptListModal(true)}
              >
                🏢 Forward Department Examination List
              </button>
            </div>

            <section className="sar-portal-mgmt-card">
              <div className="sar-portal-mgmt-grid">
                {/* ECA Portal Details */}
                <div className="sar-portal-box" style={{ background: '#ffffff' }}>
                  <div className="sar-portal-box-top">
                    <span className="sar-portal-box-title">ECA Application Portal (Continuous Assessment)</span>
                    <span className={`sar-portal-status-pill ${portalAvailability.eca?.isOpen ? 'sar-status-open' : 'sar-status-closed'}`}>
                      {portalAvailability.eca?.isOpen ? '● ONLINE / ACCEPTING SUBMISSIONS' : '○ CLOSED TO STUDENTS'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                    <div>Academic Year: <strong>{portalAvailability.eca?.academicYear || '2025/2026'}</strong></div>
                    <div>Target Semester: <strong>{portalAvailability.eca?.semester || 'Semester 2'}</strong></div>
                    <div>Submission Deadline: <strong>20 Nov 2026 at 11:59 PM</strong></div>
                    <div>Total Submissions Received: <strong>{ecaInbox.length + completedInbox.filter(p => p.type === 'eca_application').length}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className={`sar-action-btn-${portalAvailability.eca?.isOpen ? 'secondary' : 'success'}`}
                      onClick={() => handleToggleFormAvailability('eca')}
                    >
                      {portalAvailability.eca?.isOpen ? 'Deactivate ECA Portal' : 'Activate ECA Portal Online'}
                    </button>
                    <button
                      type="button"
                      className="sar-action-btn-secondary"
                      onClick={() => {
                        setSelectedInbox('inbox_eca');
                        setActiveNav('inboxes');
                      }}
                    >
                      View ECA Inbox ({ecaInbox.length})
                    </button>
                  </div>
                </div>

                {/* ESA Portal Details */}
                <div className="sar-portal-box" style={{ background: '#ffffff' }}>
                  <div className="sar-portal-box-top">
                    <span className="sar-portal-box-title">ESA Application Portal (End Semester Examination)</span>
                    <span className={`sar-portal-status-pill ${portalAvailability.esa?.isOpen ? 'sar-status-open' : 'sar-status-closed'}`}>
                      {portalAvailability.esa?.isOpen ? '● ONLINE / ACCEPTING SUBMISSIONS' : '○ CLOSED TO STUDENTS'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                    <div>Academic Year: <strong>{portalAvailability.esa?.academicYear || '2025/2026'}</strong></div>
                    <div>Target Semester: <strong>{portalAvailability.esa?.semester || 'Semester 2'}</strong></div>
                    <div>Submission Deadline: <strong>25 Nov 2026 at 11:59 PM</strong></div>
                    <div>Total Submissions Received: <strong>{esaInbox.length + completedInbox.filter(p => p.type === 'esa_application').length}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className={`sar-action-btn-${portalAvailability.esa?.isOpen ? 'secondary' : 'success'}`}
                      onClick={() => handleToggleFormAvailability('esa')}
                    >
                      {portalAvailability.esa?.isOpen ? 'Deactivate ESA Portal' : 'Activate ESA Portal Online'}
                    </button>
                    <button
                      type="button"
                      className="sar-action-btn-secondary"
                      onClick={() => {
                        setSelectedInbox('inbox_esa');
                        setActiveNav('inboxes');
                      }}
                    >
                      View ESA Inbox ({esaInbox.length})
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 6: FACULTY ADMINISTRATIVE RECORDS
            ==================================================================== */}
        {activeNav === 'faculty_records' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>Faculty Administrative Records Ledger</h1>
                <p>Archived examination records, official Dean Office Admission Passes, and Senate dispatch proofs</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="sar-ledger-stamp">✓ Verified by SAR</span>
                <span className="sar-ledger-stamp" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                  🏛️ Dean Office Certified
                </span>
              </div>
            </div>

            <div className="sar-main-card">
              <div className="sar-toolbar">
                <input
                  type="text"
                  className="sar-search-input"
                  style={{ maxWidth: '380px' }}
                  placeholder="Search administrative ledger by record ID or student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sar-table-responsive">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>Record Reference</th>
                      <th>Candidate Details</th>
                      <th>Department</th>
                      <th>Document Category</th>
                      <th>Admission Card / Senate Tracking</th>
                      <th>Verification Date</th>
                      <th style={{ textAlign: 'right' }}>Official Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes
                      .filter((p) => p.status === 'Approved' || p.status === 'Admission Generated' || p.admissionDetails?.admissionNo || p.currentStageIndex >= 3)
                      .map((p) => (
                        <tr key={p._id || p.trackingNumber}>
                          <td>
                            <strong style={{ fontFamily: 'monospace' }}>{p.trackingNumber}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.student?.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.student?.regNo}</div>
                          </td>
                          <td>
                            <span className={`sar-dept-pill ${isBST(p) ? 'sar-dept-pill-bst' : 'sar-dept-pill-ict'}`}>
                              {getDeptShort(p)}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{getFormTypeLabel(p.type)}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>PIV Voucher: {p.paymentReceipt?.voucherNo || 'PIV-VERIFIED'}</div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: '#f8fafc', padding: '3px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                              {p.admissionDetails?.admissionNo || p.senateDetails?.trackingNo || 'REC-SAR-2026-FOT'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {new Date(p.updatedAt || p.createdAt || new Date()).toLocaleDateString('en-GB')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="sar-action-btn-secondary"
                              onClick={() => setSelectedProcess(p)}
                            >
                              View Official Record
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 7: REPORTS & WORKFLOW SUMMARY
            ==================================================================== */}
        {activeNav === 'reports' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>Reports & Workflow Summary</h1>
                <p>Performance metrics and departmental breakdown across the 5 Faculty of Technology examination workflows</p>
              </div>
              <button
                type="button"
                className="sar-btn-pill"
                onClick={() => window.print()}
              >
                🖨️ Print Summary Report
              </button>
            </div>

            <div className="sar-reports-summary-grid">
              <div className="sar-report-stat-card">
                <span className="sar-stat-title">ECA WORKFLOW COMPLETION</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  {completedInbox.filter(p => p.type === 'eca_application').length} / {processes.filter(p => p.type === 'eca_application').length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Continuous assessment repeat cycles</div>
              </div>

              <div className="sar-report-stat-card">
                <span className="sar-stat-title">ESA WORKFLOW COMPLETION</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  {completedInbox.filter(p => p.type === 'esa_application').length} / {processes.filter(p => p.type === 'esa_application').length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>End semester repeat examinations</div>
              </div>

              <div className="sar-report-stat-card">
                <span className="sar-stat-title">DEAN OFFICE ADMISSIONS ISSUED</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
                  {admissionProcessingInbox.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Examination Section certified admissions</div>
              </div>

              <div className="sar-report-stat-card">
                <span className="sar-stat-title">PAYMENT VOUCHERS VERIFIED</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>People's Bank PIV slips validated</div>
              </div>
            </div>

            <div className="sar-main-card">
              <div className="sar-card-header">
                <div className="sar-card-header-left">
                  <h2>Departmental Overview: BST vs ICT</h2>
                  <p>Distribution of examination requests between departments</p>
                </div>
              </div>

              <div className="sar-table-responsive">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Total Requests</th>
                      <th>Pending Review</th>
                      <th>Queued for Exam Branch</th>
                      <th>Approved / Completed</th>
                      <th>Clearance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Department of Information and Communication Technology (ICT)</strong></td>
                      <td>{ictProcesses.length}</td>
                      <td>{ictProcesses.filter(p => p.status.includes('Pending')).length}</td>
                      <td>{ictProcesses.filter(p => p.currentAssignedRole === 'examination').length}</td>
                      <td>{ictProcesses.filter(p => p.status === 'Approved').length}</td>
                      <td><span className="sar-ledger-stamp">100% On Schedule</span></td>
                    </tr>
                    <tr>
                      <td><strong>Department of Biosystems Technology (BST)</strong></td>
                      <td>{bstProcesses.length}</td>
                      <td>{bstProcesses.filter(p => p.status.includes('Pending')).length}</td>
                      <td>{bstProcesses.filter(p => p.currentAssignedRole === 'examination').length}</td>
                      <td>{bstProcesses.filter(p => p.status === 'Approved').length}</td>
                      <td><span className="sar-ledger-stamp">100% On Schedule</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ====================================================================
            PAGE ROUTE 8: SAR NOTIFICATIONS
            ==================================================================== */}
        {activeNav === 'notifications' && (
          <>
            <div className="sar-page-banner">
              <div className="sar-page-banner-title">
                <h1>SAR Notifications Center</h1>
                <p>Institutional workflow alerts, student payment uploads, and departmental handovers</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`sar-btn-pill ${notifFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('all')}
                >
                  All Alerts ({notifications.length})
                </button>
                <button
                  type="button"
                  className={`sar-btn-pill ${notifFilter === 'unread' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="sar-btn-pill"
                    onClick={handleMarkAllNotifsRead}
                  >
                    ✓ Mark All as Read
                  </button>
                )}
              </div>
            </div>

            <div className="sar-main-card">
              {notifications
                .filter((n) => (notifFilter === 'unread' ? !n.isRead : true))
                .length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔔</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>No {notifFilter === 'unread' ? 'unread ' : ''}notifications</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>You're all caught up with SAR administrative activities.</div>
                </div>
              ) : (
                notifications
                  .filter((n) => (notifFilter === 'unread' ? !n.isRead : true))
                  .map((n) => (
                    <div
                      key={n._id}
                      className={`sar-notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      {!n.isRead && <div className="sar-notif-dot" />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{n.title}</span>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {new Date(n.createdAt).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                          {n.message}
                        </p>
                        {n.relatedRequestId && (
                          <span style={{ display: 'inline-block', marginTop: '0.45rem', fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                            View Request: {n.relatedRequestId} →
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

      </div>

      {/* ======================================================================
          MODAL 1: APPLICATION DETAILS & DOCUMENT INSPECTION
          ====================================================================== */}
      {selectedProcess && (
        <div className="sar-modal-overlay" onClick={() => setSelectedProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <div>
                <span className="sar-status-badge sar-status-pending-sar" style={{ marginRight: '0.5rem' }}>
                  {getFormTypeLabel(selectedProcess.type)}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                  {selectedProcess.trackingNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProcess(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="sar-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Student Information</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedProcess.student?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Reg No: {selectedProcess.student?.regNo}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Dept: {selectedProcess.student?.department}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Application Details</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{selectedProcess.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Status: {renderStatusBadge(selectedProcess.status)}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Submitted: {new Date(selectedProcess.createdAt || selectedProcess.details?.absenceDate).toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Payment Receipt Evidence Check Box (SAR Responsibility) */}
              <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                    💳 Payment Voucher & Supporting Document Verification
                  </span>
                  <span className={`sar-portal-status-pill ${selectedProcess.paymentReceipt?.verifiedBySAR ? 'sar-status-open' : 'sar-status-closed'}`}>
                    {selectedProcess.paymentReceipt?.verifiedBySAR ? '✓ Verified by SAR' : 'Pending Verification'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  Bank Reference: <strong>{selectedProcess.paymentReceipt?.voucherNo || selectedProcess.details?.medicalCertNo || 'PIV-2026-COUNTERFOIL'}</strong> • Amount: <strong>Rs. {selectedProcess.paymentReceipt?.amount || 250}.00</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                  Attached Evidence Slip: <strong>{selectedProcess.details?.attachedDocumentName || 'bank_deposit_piv_voucher.pdf'}</strong>
                </div>
              </div>

              {/* Multi-stage Audit Trail */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Audit Trail & Workflow History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedProcess.auditLog?.map((log, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.55rem 0.8rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.actorName} ({log.actorRole})</span>
                        <span>{new Date(log.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                      <div style={{ color: '#334155', marginTop: '2px' }}>{log.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setSelectedProcess(null)}>
                Close
              </button>
              {(selectedProcess.type === 'eca_application' || selectedProcess.type === 'esa_application' || selectedProcess.type === 'exam_form' || selectedProcess.type === 'exam_medical') && (
                <button
                  type="button"
                  className="sar-action-btn-success"
                  onClick={() => {
                    handleVerifyAndForward(selectedProcess);
                    setSelectedProcess(null);
                  }}
                >
                  Verify & Forward to Examination Branch
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 2: ADD ADMINISTRATIVE REMARKS
          ====================================================================== */}
      {remarkModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setRemarkModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Record SAR Administrative Remark</h3>
              <button type="button" onClick={() => setRemarkModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Application: <strong>{remarkModalProcess.trackingNumber}</strong> ({remarkModalProcess.title})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Document Verification Status
                </label>
                <select
                  className="sar-select"
                  style={{ width: '100%' }}
                  value={docCheckStatus}
                  onChange={(e) => setDocCheckStatus(e.target.value)}
                >
                  <option value="Verified Complete">Verified Complete - All documents & payment receipt valid</option>
                  <option value="Minor Discrepancy Noted">Minor Discrepancy Noted - Subject to clarification</option>
                  <option value="Pending Physical Voucher Inspection">Pending Physical Voucher Inspection</option>
                  <option value="Documents Endorsed for Faculty Board">Documents Endorsed for Faculty Board</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Administrative Notation / Remarks
                </label>
                <textarea
                  rows="4"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Record administrative observations, prerequisite verification, or bank voucher inspection details..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setRemarkModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleSaveRemark}>Save Remark with Official Stamp</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 3: RETURN FOR CORRECTIONS / CLARIFICATION
          ====================================================================== */}
      {clarifyModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setClarifyModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Return Application for Corrections</h3>
              <button type="button" onClick={() => setClarifyModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Application: <strong>{clarifyModalProcess.trackingNumber}</strong> ({clarifyModalProcess.student?.name})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Deficiencies Identified
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Missing People\'s Bank PIV Voucher Slip',
                    'Payment Deposit Amount Discrepancy (e.g. Expected Rs. 250/500)',
                    'Unreadable / Blurry Image Upload of Bank Voucher',
                    'Medical Board Endorsement / Clinic Chit Missing',
                    'HOD / Lecturer Signature Incomplete on Physical Sheet',
                  ].map((def) => {
                    const isChecked = selectedDeficiencies.includes(def);
                    return (
                      <label key={def} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#334155' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setSelectedDeficiencies((p) => p.filter((x) => x !== def));
                            else setSelectedDeficiencies((p) => [...p, def]);
                          }}
                        />
                        <span>{def}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Detailed Instructions for Resubmission
                </label>
                <textarea
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Specify exactly what the student must upload to regularize this application..."
                  value={clarifyNotes}
                  onChange={(e) => setClarifyNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setClarifyModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" style={{ background: '#b91c1c' }} onClick={handleRequestClarification}>
                Return Application for Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 4: PROCESS DEAN OFFICE ADMISSION (EXAMINATION SECTION)
          ====================================================================== */}
      {admissionModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setAdmissionModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Generate Dean Office Admission (Examination Section)</h3>
              <button type="button" onClick={() => setAdmissionModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>Official Output Name:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>Dean Office Admission (Examination Section)</div>
                <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '2px' }}>
                  Candidate: <strong>{admissionModalProcess.student?.name}</strong> ({admissionModalProcess.student?.regNo})
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Admission Card Number
                </label>
                <input
                  type="text"
                  className="sar-search-input"
                  value={customAdmissionNo}
                  onChange={(e) => setCustomAdmissionNo(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Administrative Issuance Notation
                </label>
                <textarea
                  rows="2"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Official admission card processed by SAR. Valid for Semester 05 Examinations..."
                  value={admissionNotes}
                  onChange={(e) => setAdmissionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setAdmissionModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleProcessAdmission}>Issue Official Admission Card</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 5: SENATE COPY PREPARATION & SUBMISSION TRACKING
          ====================================================================== */}
      {senateModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setSenateModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Track Senate Copy Preparation & Submission</h3>
              <button type="button" onClick={() => setSenateModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Application: <strong>{senateModalProcess.trackingNumber}</strong> ({senateModalProcess.title})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Senate Copy Tracking Number
                </label>
                <input
                  type="text"
                  className="sar-search-input"
                  value={senateTrackingNo}
                  onChange={(e) => setSenateTrackingNo(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Senate Dispatch Notes
                </label>
                <textarea
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Senate copy certified and prepared by SAR for tabling at the forthcoming Senate meeting..."
                  value={senateNote}
                  onChange={(e) => setSenateNote(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setSenateModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleTrackSenateCopy}>Log Senate Submission</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 6: FORWARD DEPARTMENT-WISE EXAMINATION LIST
          ====================================================================== */}
      {deptListModal && (
        <div className="sar-modal-overlay" onClick={() => setDeptListModal(false)}>
          <div className="sar-modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Forward Department-wise Examination List</h3>
              <button type="button" onClick={() => setDeptListModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Select target department to dispatch the verified candidate list for lecturer check & HOD approval:
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Target Department
                </label>
                <select
                  className="sar-select"
                  style={{ width: '100%' }}
                  value={deptListSelected}
                  onChange={(e) => setDeptListSelected(e.target.value)}
                >
                  <option value="Department of Information and Communication Technology">Department of Information and Communication Technology (ICT)</option>
                  <option value="Department of Biosystems Technology">Department of Biosystems Technology (BST)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Administrative Routing Memo
                </label>
                <textarea
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Official list of verified examination candidates transmitted for lecturer checking and HOD final approval..."
                  value={deptListNote}
                  onChange={(e) => setDeptListNote(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setDeptListModal(false)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleForwardDeptList}>Transmit Department List</button>
            </div>
          </div>
        </div>
      )}

    </DashboardTemplate>
  );
}
