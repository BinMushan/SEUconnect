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
  const [reportDateRange, setReportDateRange] = useState('all');

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

  const [routeModalProcess, setRouteModalProcess] = useState(null);
  const [routeDestination, setRouteDestination] = useState('Dean, Faculty of Technology');
  const [routeNote, setRouteNote] = useState('');

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
  // 1. ECA Applications - Awaiting SAR Review
  const ecaInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'eca_application' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Review')
    );
  }, [processes]);

  // 2. ESA Applications - Awaiting SAR Review (Independent from ECA)
  const esaInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'esa_application' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Review')
    );
  }, [processes]);

  // 3. Examination Forms - Awaiting SAR Verification (HOD approved)
  const examFormsInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_form' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Verification')
    );
  }, [processes]);

  // 4. Examination Medical Forms - Awaiting SAR Administrative Action (Faculty Board MA / Dean Office stage)
  const examMedicalsInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_medical' && (p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Action')
    );
  }, [processes]);

  // 5. Examination Branch Forwarding Queue
  const examBranchForwardInbox = useMemo(() => {
    return processes.filter(
      (p) => p.currentAssignedRole === 'examination' || p.status === 'Pending Examination Branch'
    );
  }, [processes]);

  // 6. Examination Admission Processing (Dean Office Admission & Senate copy)
  const admissionProcessingInbox = useMemo(() => {
    return processes.filter(
      (p) => p.type === 'exam_form' && (p.status === 'Admission Generated' || p.admissionDetails?.admissionNo || p.currentStageIndex >= 4)
    );
  }, [processes]);

  // 7. Returned Applications
  const returnedInbox = useMemo(() => {
    return processes.filter(
      (p) => p.status === 'Returned for Correction' || p.status === 'Declined' || p.auditLog?.some((l) => l.action === 'RETURNED_BY_SAR' || l.action === 'CORRECTION_REQUESTED')
    );
  }, [processes]);

  // 8. Completed Applications
  const completedInbox = useMemo(() => {
    return processes.filter((p) => p.status === 'Approved');
  }, [processes]);

  // Array of Inboxes Definition
  const inboxesList = [
    { id: 'inbox_eca', label: '1. ECA Applications', title: 'ECA Applications - Awaiting SAR Review', list: ecaInbox, badgeColor: '#3b82f6', desc: 'Verify CA repeat payment receipts and forward to Examination Branch' },
    { id: 'inbox_esa', label: '2. ESA Applications', title: 'ESA Applications - Awaiting SAR Review', list: esaInbox, badgeColor: '#8b5cf6', desc: 'Verify ESA repeat payment receipts and forward to Examination Branch' },
    { id: 'inbox_exam_forms', label: '3. Examination Forms', title: 'Examination Forms - Awaiting SAR Verification', list: examFormsInbox, badgeColor: '#0284c7', desc: 'Administrative verification of HOD-approved examination forms' },
    { id: 'inbox_exam_medicals', label: '4. Exam Medical Forms', title: 'Examination Medical Forms - Awaiting SAR Administrative Action', list: examMedicalsInbox, badgeColor: '#e11d48', desc: 'Faculty Board MA / Dean Office approval stage (SAR Authorized)' },
    { id: 'inbox_exam_branch_forward', label: '5. Exam Branch Forwarding', title: 'Examination Branch Forwarding Queue', list: examBranchForwardInbox, badgeColor: '#f59e0b', desc: 'Applications verified by SAR and queued for Examination Branch' },
    { id: 'inbox_admission_processing', label: '6. Admission Processing', title: 'Examination Admission Processing (Dean Office Admission & Senate)', list: admissionProcessingInbox, badgeColor: '#10b981', desc: 'Process official Dean Office Admission (Examination Section) and Senate copies' },
    { id: 'inbox_returned', label: '7. Returned Applications', title: 'Returned Applications (Corrections Flagged)', list: returnedInbox, badgeColor: '#ef4444', desc: 'Applications returned to candidate or coordinator with deficiency notices' },
    { id: 'inbox_completed', label: '8. Completed Applications', title: 'Completed Applications Ledger', list: completedInbox, badgeColor: '#059669', desc: 'Finalized examinations, approved admissions, and archived Senate copies' },
  ];

  // Currently displayed inbox items
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
  const pendingAdminReview = processes.filter(
    (p) => (p.status === 'Pending Lecturer' || p.status === 'Draft' || p.currentAssignedRole === 'sar' || p.status === 'Pending SAR Review' || p.status === 'Pending SAR Verification' || p.status === 'Pending SAR Action') && p.status !== 'Approved' && p.status !== 'Declined'
  );
  const awaitingDean = processes.filter(
    (p) => (p.status === 'Pending Dean' || p.currentAssignedRole === 'dean') && p.status !== 'Approved' && p.status !== 'Declined'
  );
  const approvedRequests = processes.filter((p) => p.status === 'Approved');

  // Department metrics
  const bstProcesses = useMemo(() => processes.filter(isBST), [processes]);
  const ictProcesses = useMemo(() => processes.filter(isICT), [processes]);

  const bstMetrics = useMemo(() => ({
    total: bstProcesses.length,
    pending: bstProcesses.filter((p) => p.status !== 'Approved' && p.status !== 'Declined').length,
    awaitingDean: bstProcesses.filter((p) => p.status === 'Pending Dean' || p.currentAssignedRole === 'dean').length,
    completed: bstProcesses.filter((p) => p.status === 'Approved').length,
  }), [bstProcesses]);

  const ictMetrics = useMemo(() => ({
    total: ictProcesses.length,
    pending: ictProcesses.filter((p) => p.status !== 'Approved' && p.status !== 'Declined').length,
    awaitingDean: ictProcesses.filter((p) => p.status === 'Pending Dean' || p.currentAssignedRole === 'dean').length,
    completed: ictProcesses.filter((p) => p.status === 'Approved').length,
  }), [ictProcesses]);

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

  // 1. Verify & Forward to Examination Branch (Permitted SAR Action)
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

  // 2. Add Administrative Remark
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

  // 3. Return for Corrections / Clarification
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

  // 4. Process Dean Office Admission (Examination Section)
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

  // 5. Track Senate Copy Preparation
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

  // 6. Forward Department Examination List
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

  // 7. Toggle ECA / ESA Form Availability Online
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
            1. TOP 6 SUMMARY METRIC CARDS (Matches Student .std-stat-card style)
            ==================================================================== */}
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
                <span className="sar-stat-badge">BST & ICT</span>
              </div>
              <div className="sar-stat-number">{totalCount}</div>
              <div className="sar-stat-target">Across both departments</div>
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
              <div className="sar-stat-target">Payment receipts check</div>
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
              <div className="sar-stat-target">Admin verification pending</div>
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
                <span className="sar-stat-badge">SAR Auth</span>
              </div>
              <div className="sar-stat-number">{examMedicalsInbox.length}</div>
              <div className="sar-stat-target">Faculty Board MA stage</div>
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
                <span className="sar-stat-badge">Verified</span>
              </div>
              <div className="sar-stat-number">{examBranchForwardInbox.length}</div>
              <div className="sar-stat-target">Ready for exam branch</div>
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
                <span className="sar-stat-title">ADMISSIONS</span>
                <span className="sar-stat-badge">Dean Office</span>
              </div>
              <div className="sar-stat-number">{admissionProcessingInbox.length}</div>
              <div className="sar-stat-target">Official admission & senate</div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. SAR OPERATIONS & APPLICATION SEARCH CARD (Matches Student .std-guidance-card)
            ==================================================================== */}
        <section className="sar-guidance-card">
          <div className="sar-guidance-header">
            <div className="sar-guidance-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="sar-guidance-titles">
              <h3 className="sar-guidance-title">Faculty Administrative Operations & Examination Workflows</h3>
              <p className="sar-guidance-subtitle">
                Instant institutional lookup: Monitor ECA/ESA applications, verify payment vouchers, forward verified forms to Examination Branch, and manage Dean Office Admissions.
              </p>
            </div>
          </div>

          <div className="sar-guidance-search-bar">
            <div className="sar-search-input-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="sar-search-input-field"
                placeholder='Search by ID ("ECA-2026-1045", "EXAM-2026-3051"), Student Name, Reg No, or Module Code...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="sar-find-btn"
              onClick={() => handleNavigate('inboxes')}
            >
              Search Inboxes
            </button>
          </div>

          <div className="sar-suggested-row">
            <span className="sar-suggested-label">Faculty Scope:</span>
            <button
              type="button"
              className={`sar-suggested-chip ${deptFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDeptFilter('all')}
            >
              All Departments ({totalCount})
            </button>
            <button
              type="button"
              className={`sar-suggested-chip ${deptFilter === 'bst' ? 'active' : ''}`}
              onClick={() => setDeptFilter('bst')}
            >
              Biosystems Tech (BST) ({bstMetrics.total})
            </button>
            <button
              type="button"
              className={`sar-suggested-chip ${deptFilter === 'ict' ? 'active' : ''}`}
              onClick={() => setDeptFilter('ict')}
            >
              Information & Comm. Tech (ICT) ({ictMetrics.total})
            </button>

            <span className="sar-suggested-label" style={{ marginLeft: '0.65rem' }}>Workflow Portals:</span>
            <button
              type="button"
              className="sar-suggested-chip"
              onClick={() => setDeptListModal(true)}
            >
              🏢 Forward Dept Exam List
            </button>
            <button
              type="button"
              className={`sar-suggested-chip ${activeNav === 'portal_management' ? 'active' : ''}`}
              onClick={() => handleNavigate('portal_management')}
            >
              ⚙️ Manage Online ECA/ESA Portals
            </button>
          </div>
        </section>

        {/* ====================================================================
            3. THE 8 WORKFLOW INBOXES (Mandatory SAR Core Feature)
            ==================================================================== */}
        <section className="sar-inboxes-section">
          <div className="sar-inboxes-header">
            <div className="sar-inboxes-title-group">
              <h2>SAR Workflow Inboxes ({currentInboxDef.list.length} Items)</h2>
              <p>{currentInboxDef.desc}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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

          {/* Inbox Table Display: Application ID, Student Details, Department, Form Type, Current Status, Submission Date, Pending Duration, Actions */}
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
                        {/* 1. Application ID */}
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

                        {/* 2. Student Details */}
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.student?.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.student?.regNo} • {p.student?.programme}</div>
                        </td>

                        {/* 3. Department */}
                        <td>
                          <span className={`sar-dept-pill ${isBST(p) ? 'sar-dept-pill-bst' : 'sar-dept-pill-ict'}`}>
                            {getDeptShort(p)}
                          </span>
                        </td>

                        {/* 4. Form Type */}
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                            {getFormTypeLabel(p.type)}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {p.details?.courseCodes?.[0] || p.title?.slice(0, 32)}
                          </div>
                        </td>

                        {/* 5. Current Status */}
                        <td>
                          {renderStatusBadge(p.status)}
                        </td>

                        {/* 6. Submission Date */}
                        <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(submissionDate).toLocaleDateString('en-GB')}
                        </td>

                        {/* 7. Pending Duration */}
                        <td>
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                            ⏱️ {pendingDuration}
                          </span>
                        </td>

                        {/* 8. SAR Actions */}
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

        {/* ====================================================================
            4. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS (Image 1 Layout)
            ==================================================================== */}
        <section className="sar-middle-grid">
          {/* Left: Administrative Workflow Distribution & Status Card */}
          <div className="sar-trend-card">
            <div className="sar-trend-header-row">
              <div className="sar-trend-header-left">
                <div className="sar-trend-header-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="sar-trend-title-col">
                  <h3 className="sar-card-heading">Faculty Workflow Distribution & Status</h3>
                  <span className="sar-trend-subheading">Monitor real-time request volume across the 5 examination workflows</span>
                </div>
              </div>

              {/* Department Selector Dropdown */}
              <div className="sar-select-wrapper">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <select
                  className="sar-dropdown-select"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">🏢 All Departments ({totalCount})</option>
                  <option value="bst">🌱 BST Department ({bstMetrics.total})</option>
                  <option value="ict">💻 ICT Department ({ictMetrics.total})</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Top 3 Highlight Metric Boxes */}
            <div className="sar-trend-top-metrics">
              {/* Box 1: ECA & ESA Volume */}
              <div className="sar-trend-top-box">
                <div className="sar-trend-box-icon sar-box-icon-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div className="sar-trend-box-content">
                  <span className="sar-trend-box-lbl">ECA & ESA Queue</span>
                  <div className="sar-trend-box-val-row">
                    <span className="sar-trend-box-val">{ecaInbox.length + esaInbox.length}</span>
                    <span className="sar-trend-box-delta">▲ Awaiting SAR</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Exam Forms & Admissions */}
              <div className="sar-trend-top-box">
                <div className="sar-trend-box-icon sar-box-icon-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="sar-trend-box-content">
                  <span className="sar-trend-box-lbl">Exam Forms & Adm</span>
                  <div className="sar-trend-box-val-row">
                    <span className="sar-trend-box-val">{examFormsInbox.length + admissionProcessingInbox.length}</span>
                    <span className="sar-trend-box-denom">/ Active</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Clearance Standing */}
              <div className="sar-trend-top-box">
                <div className="sar-trend-box-icon sar-box-icon-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </div>
                <div className="sar-trend-box-content">
                  <span className="sar-trend-box-lbl">Admin Standing</span>
                  <div className="sar-trend-box-val-row">
                    <span className="sar-trend-box-val" style={{ fontSize: '1.05rem', color: '#10b981' }}>On Schedule</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spline Pipeline Area Chart */}
            <div className="sar-trend-chart-area">
              <div className="sar-chart-container">
                <div className="sar-y-axis-labels">
                  <span>High</span>
                  <span>Avg</span>
                  <span>Low</span>
                  <span>Min</span>
                </div>

                <div className="sar-chart-svg-wrap">
                  <svg viewBox="0 0 620 155" className="sar-spline-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sarPurpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="sarShadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="20" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="20" y1="55" x2="600" y2="55" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="20" y1="90" x2="600" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="20" y1="125" x2="600" y2="125" stroke="#f1f5f9" strokeWidth="1"/>

                    {/* Dotted guideline down from stage 3 (SAR Check) */}
                    <line x1="310" y1="45" x2="310" y2="125" stroke="#6366f1" strokeWidth="1.8" strokeDasharray="3 3"/>

                    {/* Area fill */}
                    <path
                      d="M 60,35 C 120,40 140,75 185,72 C 230,70 260,45 310,45 C 360,45 390,75 435,78 C 480,80 500,48 560,50 L 560,125 L 60,125 Z"
                      fill="url(#sarPurpleAreaGrad)"
                    />

                    {/* Smooth curve line */}
                    <path
                      d="M 60,35 C 120,40 140,75 185,72 C 230,70 260,45 310,45 C 360,45 390,75 435,78 C 480,80 500,48 560,50"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      filter="url(#sarShadow)"
                    />

                    {/* Node 1: ECA/ESA Submitted */}
                    <circle cx="60" cy="35" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                    <rect x="40" y="12" width="40" height="18" rx="5" fill="#1e1b4b" />
                    <text x="60" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ffffff">
                      {ecaInbox.length + esaInbox.length} Req
                    </text>

                    {/* Node 2: HOD Endorsed */}
                    <circle cx="185" cy="72" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                    <text x="185" y="62" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">
                      {examFormsInbox.length} Req
                    </text>

                    {/* Node 3: SAR Verified & Queued */}
                    <circle cx="310" cy="45" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3.5" />
                    <rect x="290" y="20" width="40" height="20" rx="5" fill="#4338ca" />
                    <text x="310" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">
                      {examBranchForwardInbox.length} Fwd
                    </text>

                    {/* Node 4: Dean Office Admission */}
                    <circle cx="435" cy="78" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                    <text x="435" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">
                      {admissionProcessingInbox.length} Adm
                    </text>

                    {/* Node 5: Senate Copy Archived */}
                    <circle cx="560" cy="50" r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                    <rect x="540" y="26" width="40" height="20" rx="5" fill="#10b981" />
                    <text x="560" y="40" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ffffff">
                      {completedInbox.length} Done
                    </text>

                    {/* Stage X-axis Labels */}
                    <text x="60" y="142" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#475569">ECA/ESA Rec</text>
                    <text x="185" y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#64748b">Exam Forms</text>
                    <text x="310" y="142" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#4338ca">To Exam Br</text>
                    <text x="435" y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#64748b">Dean Adm</text>
                    <text x="560" y="142" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#059669">Senate Copy</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom 3 Summary Statistics */}
            <div className="sar-bottom-stats-row">
              <div className="sar-bottom-stat-box">
                <div className="sar-bottom-stat-icon-circle sar-icon-circle-emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="sar-bottom-stat-info">
                  <span className="sar-bottom-stat-lbl">Payment Vouchers Checked</span>
                  <span className="sar-bottom-stat-val">100% In Order</span>
                </div>
              </div>

              <div className="sar-bottom-stat-box">
                <div className="sar-bottom-stat-icon-circle sar-icon-circle-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="sar-bottom-stat-info">
                  <span className="sar-bottom-stat-lbl">Active Inboxes Queue</span>
                  <span className="sar-bottom-stat-val">
                    {ecaInbox.length + esaInbox.length + examFormsInbox.length + examMedicalsInbox.length} Applications
                  </span>
                </div>
              </div>

              <div className="sar-bottom-stat-box">
                <div className="sar-bottom-progress-circle">
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                    <circle
                      cx="19"
                      cy="19"
                      r="15"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="94.2"
                      strokeDashoffset="20.7"
                      strokeLinecap="round"
                      transform="rotate(-90 19 19)"
                    />
                    <text x="19" y="23" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f172a">78%</text>
                  </svg>
                </div>
                <div className="sar-bottom-stat-info">
                  <span className="sar-bottom-stat-lbl">Faculty Clearance</span>
                  <div className="sar-mini-progress-track">
                    <div className="sar-mini-progress-bar-fill" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions Card */}
          <div className="sar-quick-actions-card">
            <div className="sar-qa-header-banner">
              <div className="sar-qa-header-content">
                <div className="sar-qa-header-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="sar-qa-title">Quick Actions</h3>
                  <p className="sar-qa-subtitle">Coordinate faculty examinations instantly</p>
                </div>
              </div>
              <div className="sar-qa-watermark">
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>

            <div className="sar-qa-actions-list">
              {[
                { label: 'ECA Applications Queue', actionId: 'inbox_eca', colorTheme: 'purple', icon: '📝' },
                { label: 'ESA Applications Queue', actionId: 'inbox_esa', colorTheme: 'blue', icon: '🎓' },
                { label: 'Examination Forms Verification', actionId: 'inbox_exam_forms', colorTheme: 'violet', icon: '📋' },
                { label: 'Exam Medicals (Dean Office)', actionId: 'inbox_exam_medicals', colorTheme: 'rose', icon: '🏥' },
                { label: 'Forward to Exam Branch', actionId: 'inbox_exam_branch_forward', colorTheme: 'emerald', icon: '🚀' },
                { label: 'Dean Office Admission Pass', actionId: 'inbox_admission_processing', colorTheme: 'cyan', icon: '🎫' },
                { label: 'Manage Online ECA / ESA Portals', actionId: 'portal_management', colorTheme: 'indigo', icon: '⚙️' },
                { label: 'Forward Dept Examination List', actionId: 'open_dept_list', colorTheme: 'teal', icon: '🏢' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sar-qa-item-btn"
                  onClick={() => {
                    if (action.actionId === 'open_dept_list') {
                      setDeptListModal(true);
                    } else if (action.actionId.startsWith('inbox_')) {
                      handleNavigate(action.actionId);
                    } else {
                      handleNavigate(action.actionId);
                    }
                  }}
                >
                  <div className="sar-qa-item-left">
                    <span className={`sar-qa-icon-circle sar-qa-icon-${action.colorTheme}`} style={{ fontSize: '1rem' }}>
                      {action.icon}
                    </span>
                    <span className="sar-qa-item-label">{action.label}</span>
                  </div>
                  <span className="sar-qa-item-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. ECA & ESA APPLICATION FORM PORTAL MANAGEMENT CARD
            ==================================================================== */}
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
            {/* ECA Portal Card */}
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

            {/* ESA Portal Card (Kept Independent) */}
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

        {/* ====================================================================
            6. DEPARTMENT-WISE OVERVIEW (BST & ICT)
            ==================================================================== */}
        <section className="sar-dept-grid">
          <div className="sar-dept-card" style={deptFilter === 'ict' ? { opacity: 0.6 } : {}}>
            <div className="sar-dept-header">
              <div className="sar-dept-title-group">
                <h3>Department of Biosystems Technology (BST)</h3>
                <p>Agricultural, Environmental & Food Bio-process Engineering</p>
              </div>
              <span className="sar-dept-pill sar-dept-pill-bst">BST Division</span>
            </div>

            <div className="sar-dept-metrics-row">
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val">{bstMetrics.total}</div>
                <div className="sar-dept-metric-lbl">Total</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#d97706' }}>{bstMetrics.pending}</div>
                <div className="sar-dept-metric-lbl">Under Review</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#7c3aed' }}>{bstMetrics.awaitingDean}</div>
                <div className="sar-dept-metric-lbl">To Dean</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#059669' }}>{bstMetrics.completed}</div>
                <div className="sar-dept-metric-lbl">Completed</div>
              </div>
            </div>
          </div>

          <div className="sar-dept-card" style={deptFilter === 'bst' ? { opacity: 0.6 } : {}}>
            <div className="sar-dept-header">
              <div className="sar-dept-title-group">
                <h3>Department of Information and Communication Technology (ICT)</h3>
                <p>Software Engineering, Networks, AI & Enterprise Solutions</p>
              </div>
              <span className="sar-dept-pill sar-dept-pill-ict">ICT Division</span>
            </div>

            <div className="sar-dept-metrics-row">
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val">{ictMetrics.total}</div>
                <div className="sar-dept-metric-lbl">Total</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#d97706' }}>{ictMetrics.pending}</div>
                <div className="sar-dept-metric-lbl">Under Review</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#7c3aed' }}>{ictMetrics.awaitingDean}</div>
                <div className="sar-dept-metric-lbl">To Dean</div>
              </div>
              <div className="sar-dept-metric-box">
                <div className="sar-dept-metric-val" style={{ color: '#059669' }}>{ictMetrics.completed}</div>
                <div className="sar-dept-metric-lbl">Completed</div>
              </div>
            </div>
          </div>
        </section>

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
                  className="sar-search-input-field"
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
                  className="sar-search-input-field"
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
