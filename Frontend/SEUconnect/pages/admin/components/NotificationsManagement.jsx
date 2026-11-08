import { useState, useMemo, useEffect } from 'react';
import api, { localNotificationStorage } from '../../../src/services/api.js';

/**
 * Top-level immutable initial notification dataset
 * Reflects all 61 pending faculty items across BICT & BST
 */
const INITIAL_ADMIN_NOTIFICATIONS = [
  {
    id: 'NOTIF-MED-01',
    category: 'Medicals',
    priority: 'Urgent',
    title: 'Emergency Medical Excuse Verification (Fracture Cast)',
    studentName: 'T. Dinushan Weerasinghe',
    regNo: 'SEU/IS/21/BST/032',
    department: 'Department of Bio Systems Technology (BST)',
    programme: 'BST (Hons)',
    summary: 'Diagnosis: Fracture of right radius bone with cast immobilization (8 days). Attendance fell to 68%. Approval will restore attendance to 80% and grant ESA exam eligibility.',
    meta: 'Hospital Ref: DGH/AMP/MED/1104 • District General Hospital Ampara',
    time: '12 mins ago',
    isRead: false,
    actionType: 'medical',
    targetId: 'MED-2026-015',
    targetSection: 'attendance_medicals'
  },
  {
    id: 'NOTIF-REG-01',
    category: 'Registrations',
    priority: 'High',
    title: 'Course Registration Exceeding Credit Threshold (>22 Credits)',
    studentName: 'T. Ketheeswaran',
    regNo: 'SEU/IS/21/BST/034',
    department: 'Department of Bio Systems Technology (BST)',
    programme: 'BST (Hons)',
    summary: 'Undergraduate has registered for 23 academic credits in Semester 6 (Limit is 22). Requires Head of Department (HOD) special dispensation endorsement.',
    meta: 'App Code: REG-2024-002 • 7 Core Modules + 1 Elective',
    time: '28 mins ago',
    isRead: false,
    actionType: 'registration',
    targetId: 'REG-2024-002',
    targetSection: 'semester_registration'
  },
  {
    id: 'NOTIF-EXAM-01',
    category: 'Examinations',
    priority: 'Urgent',
    title: 'Repeat Exam PIV Slip Submission Verified (Entry Clearance)',
    studentName: 'M.R.F. Sumaiya',
    regNo: 'SEU/IS/21/BST/042',
    department: 'Department of Bio Systems Technology (BST)',
    programme: 'BST (Hons)',
    summary: 'Repeat candidate has submitted People\'s Bank Pay-In-Voucher (PIV #88391) of Rs. 500 for module BST 21013 Organic Agriculture. Awaiting Exam Branch admission slip clearance.',
    meta: 'Reference: REP-01 • People\'s Bank Sammanthurai Branch',
    time: '45 mins ago',
    isRead: false,
    actionType: 'examination',
    targetId: 'REP-01',
    targetSection: 'examinations'
  },
  {
    id: 'NOTIF-MED-02',
    category: 'Medicals',
    priority: 'Urgent',
    title: 'Dengue Fever Medical Submission (Missed Mid-Semester CA)',
    studentName: 'K.L. Fathima Farha',
    regNo: 'SEU/IS/22/ICT/042',
    department: 'Department of Information & Communication Technology (BICT)',
    programme: 'BICT (Hons)',
    summary: 'Student was hospitalized for severe Dengue Fever (6 days). Missed ICT3102 Practical Lab Test. Medical officer certified illness; requires administrative endorsement.',
    meta: 'Certificate Ref: MC/SEUSL/2026/892 • SEUSL Health Centre',
    time: '1 hour ago',
    isRead: false,
    actionType: 'medical',
    targetId: 'MED-2026-014',
    targetSection: 'attendance_medicals'
  },
  {
    id: 'NOTIF-REG-02',
    category: 'Registrations',
    priority: 'Normal',
    title: 'Semester 5 Academic Registration Submission',
    studentName: 'A.R. Mohamed Aslam',
    regNo: 'SEU/IS/22/ICT/015',
    department: 'Department of Information & Communication Technology (BICT)',
    programme: 'BICT (Hons)',
    summary: 'Enrolled in 21 credits across Advanced Web Architecture, Distributed DBs, Mobile Computing, and AI Fundamentals. Prerequisites verified.',
    meta: 'App Code: REG-2024-001 • All prerequisites satisfied',
    time: '1.5 hours ago',
    isRead: false,
    actionType: 'registration',
    targetId: 'REG-2024-001',
    targetSection: 'semester_registration'
  },
  {
    id: 'NOTIF-EXAM-02',
    category: 'Examinations',
    priority: 'High',
    title: 'Medical Concession Repeat Application (First Attempt Privileges)',
    studentName: 'S. Thanushan',
    regNo: 'SEU/IS/22/ICT/088',
    department: 'Department of Information & Communication Technology (BICT)',
    programme: 'BICT (Hons)',
    summary: 'Candidate submitted approved medical certificate MC-2024-009 for Semester 2 exam absence. Requesting ESA registration with first attempt (Grade A-C) concession.',
    meta: 'Module: ICT 12023 Object-Oriented Programming • Concession Pending',
    time: '2 hours ago',
    isRead: false,
    actionType: 'examination',
    targetId: 'REP-02',
    targetSection: 'examinations'
  },
  {
    id: 'NOTIF-MED-03',
    category: 'Medicals',
    priority: 'Normal',
    title: 'Outpatient Medical Slip for Practical Lab Absence',
    studentName: 'P. Kavindi Nilakshika',
    regNo: 'SEU/IS/23/ICT/078',
    department: 'Department of Information & Communication Technology (BICT)',
    programme: 'BICT (Hons)',
    summary: 'Acute respiratory infection treatment (3 days). Doctor recommended bed rest. Absence reported for Data Structures Lab session.',
    meta: 'Health Centre Ref: MC/SEUSL/2026/911 • Dr. K.M. Farook',
    time: '3 hours ago',
    isRead: false,
    actionType: 'medical',
    targetId: 'MED-2026-016',
    targetSection: 'attendance_medicals'
  },
  {
    id: 'NOTIF-DIS-01',
    category: 'Disciplinary',
    priority: 'High',
    title: 'Hostel Curfew Infraction & Library Textbook Fine Awaiting Recovery',
    studentName: 'R.M. Kavinda Rathnayake',
    regNo: 'SEU/IS/21/BST/045',
    department: 'Department of Bio Systems Technology (BST)',
    programme: 'BST (Hons)',
    summary: 'Fine of Rs. 1,500 pending with Senior Proctor\'s division for overdue reference textbooks and hostel clearance. Academic results held pending settlement.',
    meta: 'Case: PEN-01 • Senior Student Proctor Office',
    time: '4 hours ago',
    isRead: false,
    actionType: 'penalty',
    targetId: 'PEN-01',
    targetSection: 'penalties'
  },
  {
    id: 'NOTIF-REG-03',
    category: 'Registrations',
    priority: 'Normal',
    title: 'Course Registration for Batch 04 (Freshers / Year 2)',
    studentName: 'M.B.M. Bin Mushan',
    regNo: 'SEU/IS/22/ICT/091',
    department: 'Department of Information & Communication Technology (BICT)',
    programme: 'BICT (Hons)',
    summary: 'Submitted Semester 5 specialization module registration (Software Systems & Cloud Architecture). 20 credits loaded.',
    meta: 'App Code: REG-2024-003 • Batch 03 (2022/2023)',
    time: '5 hours ago',
    isRead: false,
    actionType: 'registration',
    targetId: 'REG-2024-003',
    targetSection: 'semester_registration'
  },
  {
    id: 'NOTIF-SYS-01',
    category: 'System',
    priority: 'Normal',
    title: 'Batch 05 (2024/2025) Enrollment Completed (240 Students)',
    studentName: 'Faculty Dean & Registrar',
    regNo: 'FACULTY-SYSTEM',
    department: 'Dean\'s Secretariat',
    programme: 'Faculty Wide',
    summary: '120 BICT and 120 BST freshers enrolled across Batch 05. Initial institutional student credentials generated and synced to authentication DB.',
    meta: 'Batch: BATCH-05 • 240 Undergraduates Provisioned',
    time: '6 hours ago',
    isRead: true,
    actionType: 'system',
    targetId: 'BATCH-05',
    targetSection: 'student_management'
  },
  {
    id: 'NOTIF-EXAM-03',
    category: 'Examinations',
    priority: 'Urgent',
    title: 'End-Semester Examination Admission Card Cutoff Deadline',
    studentName: 'Examination Branch - SEUSL',
    regNo: 'EXAM-OFFICE',
    department: 'Examination Branch',
    programme: 'Faculty Wide',
    summary: '80% Attendance Clearance lock scheduled for Friday 4:00 PM. All pending medical certificates must be finalized prior to admission card generation.',
    meta: 'Cutoff: ESA 2026 Season • 1,200 Undergraduates Enrolled',
    time: '8 hours ago',
    isRead: false,
    actionType: 'examination',
    targetId: 'EXAM-SEASON-2026',
    targetSection: 'examinations'
  },
  {
    id: 'NOTIF-SYS-02',
    category: 'System',
    priority: 'Normal',
    title: 'Dean\'s Honour List SGPA Ledger (>=3.70) Generated',
    studentName: 'Examination Board',
    regNo: 'SENATE-AUDIT',
    department: 'Faculty Administration Office',
    programme: 'BICT & BST',
    summary: '14 Undergraduates qualified for Dean\'s List honours for the previous semester. Moderated ledger ready for Faculty Board endorsement.',
    meta: 'Audit Reference: RES-2026-DL • Ready for Release',
    time: '12 hours ago',
    isRead: true,
    actionType: 'system',
    targetId: 'RESULTS-DEAN-LIST',
    targetSection: 'results_progress'
  }
];

export default function NotificationsManagement({
  stats,
  onNavigate,
  onApproveMedical,
  onRejectMedical,
  onApproveRegistration,
  onShowToast
}) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const deleted = new Set(JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]'));
      const saved = localStorage.getItem('seuconnect_admin_notifications');
      const base = saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATIONS;
      return base.filter((n) => !deleted.has(String(n.id || n._id)));
    } catch {
      return INITIAL_ADMIN_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('seuconnect_admin_notifications', JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  const [activeTab, setActiveTab] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: notifications.length,
      Medicals: notifications.filter((n) => n.category === 'Medicals').length,
      Registrations: notifications.filter((n) => n.category === 'Registrations').length,
      Examinations: notifications.filter((n) => n.category === 'Examinations').length,
      Disciplinary: notifications.filter((n) => n.category === 'Disciplinary').length,
      System: notifications.filter((n) => n.category === 'System').length
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab !== 'ALL' && n.category !== activeTab) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && n.priority !== priorityFilter) return false;

      // Read filter
      if (readFilter === 'UNREAD' && n.isRead) return false;
      if (readFilter === 'READ' && !n.isRead) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(query);
        const matchName = n.studentName.toLowerCase().includes(query);
        const matchReg = n.regNo.toLowerCase().includes(query);
        const matchSummary = n.summary.toLowerCase().includes(query);
        const matchDept = n.department.toLowerCase().includes(query);
        if (!matchTitle && !matchName && !matchReg && !matchSummary && !matchDept) return false;
      }

      return true;
    });
  }, [notifications, activeTab, priorityFilter, readFilter, searchTerm]);

  // Toggle read
  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onShowToast) onShowToast('All notifications marked as read.');
    try {
      await api.markAllNotificationsRead();
    } catch (_) {}
  };

  // Clear read notifications
  const handleClearRead = async () => {
    const unreadOnly = notifications.filter((n) => !n.isRead);
    const readOnes = notifications.filter((n) => n.isRead);
    setNotifications(unreadOnly);
    if (onShowToast) onShowToast('Cleared read notifications.');

    try {
      const deleted = JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]');
      readOnes.forEach((r) => {
        const key = String(r.id || r._id);
        if (!deleted.includes(key)) deleted.push(key);
      });
      localStorage.setItem('seu_deleted_notif_ids', JSON.stringify(deleted));
    } catch (_) {}

    for (const r of readOnes) {
      const key = r.id || r._id;
      try {
        localNotificationStorage.remove(key);
        await api.deleteNotification(key);
      } catch (_) {}
    }
  };

  // Delete / Dismiss
  const handleDismiss = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    if (onShowToast) onShowToast('Notification dismissed.');

    try {
      const deleted = JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]');
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
        localStorage.setItem('seu_deleted_notif_ids', JSON.stringify(deleted));
      }
    } catch (_) {}

    try {
      localNotificationStorage.remove(id);
      await api.deleteNotification(id);
    } catch (_) {}
  };

  // Action Click
  const handleActionClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    if (onNavigate && notif.targetSection) {
      onNavigate(notif.targetSection);
    }
  };

  // Quick Direct Approval from Notification Card
  const handleQuickApprove = (notif, e) => {
    e.stopPropagation();
    if (notif.actionType === 'medical' && onApproveMedical) {
      onApproveMedical(notif.targetId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true, isApproved: true } : n))
      );
      if (onShowToast) onShowToast(`Medical Certificate verified for ${notif.studentName}.`);
    } else if (notif.actionType === 'registration' && onApproveRegistration) {
      onApproveRegistration(notif.targetId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true, isApproved: true } : n))
      );
      if (onShowToast) onShowToast(`Course Registration approved for ${notif.studentName}.`);
    } else if (notif.actionType === 'examination') {
      if (onNavigate) onNavigate('examinations');
    }
  };

  // Quick Direct Rejection from Notification Card
  const handleQuickReject = (notif, e) => {
    e.stopPropagation();
    if (notif.actionType === 'medical' && onRejectMedical) {
      onRejectMedical(notif.targetId, 'Rejected from Admin Action Center');
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true, isRejected: true } : n))
      );
      if (onShowToast) onShowToast(`Medical Request rejected for ${notif.studentName}.`);
    }
  };

  return (
    <div className="adm-dashboard-container">
      {/* =========================================================
          1. SECTION HEADER & WORKFLOW METRICS
          ========================================================= */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="adm-section-title">Administrative Notifications & Action Center</h2>
            {unreadCount > 0 && (
              <span className="adm-badge badge-pending" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                {unreadCount} Unread Alerts
              </span>
            )}
          </div>
          <p className="adm-section-subtitle">
            Centralized intake for pending student medicals, semester registration authorizations, examination entry vouchers, and critical faculty action items.
          </p>
        </div>

        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-btn-xs-secondary"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark All as Read
          </button>

          <button
            type="button"
            className="adm-btn-xs-secondary"
            onClick={handleClearRead}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear Read
          </button>
        </div>
      </div>

      {/* =========================================================
          2. METRIC STRIP (Reflecting 61 Pending Faculty Items)
          ========================================================= */}
      <div className="adm-stats-grid">
        {/* Total Pending */}
        <div
          className="adm-stat-card adm-stat-click"
          onClick={() => {
            setActiveTab('ALL');
            setReadFilter('UNREAD');
          }}
          title="Click to view all pending action items"
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">TOTAL PENDING</span>
              <span className="adm-badge badge-pending">Active Queue</span>
            </div>
            <div className="adm-stat-value">{stats ? stats.pendingMedicals + stats.pendingRegistrations + stats.pendingExamClearance : 61}</div>
            <div className="adm-stat-sub">Across 5 Batches (BICT & BST)</div>
          </div>
        </div>

        {/* Pending Medicals */}
        <div
          className="adm-stat-card adm-stat-click"
          onClick={() => {
            setActiveTab('Medicals');
            setReadFilter('ALL');
          }}
          title="Click to filter Medical requests"
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-stat-icon-wrap icon-rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">PENDING MEDICALS</span>
              <span className="adm-badge badge-inactive">{stats ? stats.pendingMedicals : 14}</span>
            </div>
            <div className="adm-stat-value">{stats ? stats.pendingMedicals : 14} Slips</div>
            <div className="adm-stat-sub">Awaiting SAR Tech & CMO Verification</div>
          </div>
        </div>

        {/* Pending Registrations */}
        <div
          className="adm-stat-card adm-stat-click"
          onClick={() => {
            setActiveTab('Registrations');
            setReadFilter('ALL');
          }}
          title="Click to filter Course Registrations"
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">COURSE REGISTRATIONS</span>
              <span className="adm-badge badge-pending">{stats ? stats.pendingRegistrations : 28}</span>
            </div>
            <div className="adm-stat-value">{stats ? stats.pendingRegistrations : 28} Students</div>
            <div className="adm-stat-sub">Credit approvals & Add/Drop reviews</div>
          </div>
        </div>

        {/* Exam Clearances */}
        <div
          className="adm-stat-card adm-stat-click"
          onClick={() => {
            setActiveTab('Examinations');
            setReadFilter('ALL');
          }}
          title="Click to filter Exam clearances"
          style={{ cursor: 'pointer' }}
        >
          <div className="adm-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">EXAM REPEAT CLEARANCE</span>
              <span className="adm-badge badge-pending">{stats ? stats.pendingExamClearance : 19}</span>
            </div>
            <div className="adm-stat-value">{stats ? stats.pendingExamClearance : 19} Vouchers</div>
            <div className="adm-stat-sub">PIV bank vouchers & admission slips</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. CATEGORY TABS & FILTER TOOLBAR
          ========================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
        {/* Category Pill Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
          {[
            { id: 'ALL', label: 'All Notifications', count: tabCounts.ALL },
            { id: 'Medicals', label: 'Medical Verifications', count: tabCounts.Medicals },
            { id: 'Registrations', label: 'Course Registrations', count: tabCounts.Registrations },
            { id: 'Examinations', label: 'Exam & Repeat Clearances', count: tabCounts.Examinations },
            { id: 'Disciplinary', label: 'Disciplinary & Welfare', count: tabCounts.Disciplinary },
            { id: 'System', label: 'System & Security', count: tabCounts.System }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`adm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #0f2b5c' : '1px solid #e2e8f0',
                background: activeTab === tab.id ? '#0f2b5c' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === tab.id ? '#ffffff' : '#0f172a',
                  padding: '1px 6px',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar: Search & Select Dropdowns */}
        <div className="adm-toolbar" style={{ marginTop: '0' }}>
          <div className="adm-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="adm-search-input"
              placeholder="Search by student name, reg no (e.g. SEU/IS/22/ICT/091), module, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="adm-filter-group">
            {/* Priority Filter */}
            <select
              className="adm-filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
            </select>

            {/* Read Filter */}
            <select
              className="adm-filter-select"
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>

            {(searchTerm || priorityFilter !== 'ALL' || readFilter !== 'ALL' || activeTab !== 'ALL') && (
              <button
                type="button"
                className="adm-btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('ALL');
                  setReadFilter('ALL');
                  setActiveTab('ALL');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          4. NOTIFICATIONS FEED LIST
          ========================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
        {filteredNotifications.length === 0 ? (
          <div className="adm-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontSize: '1rem', fontWeight: 600 }}>No Notifications Found</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              There are currently no notifications matching your active filter criteria.
            </p>
            <button
              type="button"
              className="adm-btn-xs-secondary"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('ALL');
                setReadFilter('ALL');
                setActiveTab('ALL');
              }}
            >
              Show All Notifications
            </button>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif.id}
                className="adm-card"
                style={{
                  padding: '1.15rem 1.35rem',
                  borderLeft: isUnread
                    ? notif.priority === 'Urgent'
                      ? '4px solid #ef4444'
                      : notif.priority === 'High'
                      ? '4px solid #f59e0b'
                      : '4px solid #0f2b5c'
                    : '4px solid #cbd5e1',
                  background: isUnread ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                {/* Top Row: Category, Priority, RegNo, Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Priority Badge */}
                    <span
                      style={{
                        padding: '0.18rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          notif.priority === 'Urgent'
                            ? '#fee2e2'
                            : notif.priority === 'High'
                            ? '#fef3c7'
                            : '#e0f2fe',
                        color:
                          notif.priority === 'Urgent'
                            ? '#b91c1c'
                            : notif.priority === 'High'
                            ? '#b45309'
                            : '#0369a1'
                      }}
                    >
                      {notif.priority}
                    </span>

                    {/* Category Tag */}
                    <span
                      style={{
                        padding: '0.18rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569'
                      }}
                    >
                      {notif.category}
                    </span>

                    {/* Student Reg No */}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#0f2b5c',
                        background: '#eff6ff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {notif.regNo}
                    </span>

                    {/* Student Name */}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      {notif.studentName}
                    </span>
                  </div>

                  {/* Timestamp & Unread Dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUnread && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          display: 'inline-block'
                        }}
                        title="Unread notification"
                      />
                    )}
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {notif.time}
                    </span>
                  </div>
                </div>

                {/* Main Content: Title & Summary */}
                <div>
                  <h3
                    style={{
                      margin: '0 0 0.3rem',
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: isUnread ? '#0f172a' : '#334155'
                    }}
                  >
                    {notif.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.83rem', color: '#475569', lineHeight: '1.45' }}>
                    {notif.summary}
                  </p>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                    {notif.meta} • <span style={{ color: '#0284c7', fontWeight: 500 }}>{notif.department}</span>
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', marginTop: '0.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Primary Navigation Action */}
                    <button
                      type="button"
                      className="adm-find-process-btn"
                      style={{ padding: '0.38rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => handleActionClick(notif)}
                    >
                      {notif.actionType === 'medical' && 'Open Medical Request in Attendance'}
                      {notif.actionType === 'registration' && 'Inspect Registration Ledger'}
                      {notif.actionType === 'examination' && 'View Exam Repeats & PIV Voucher'}
                      {notif.actionType === 'penalty' && 'Inspect Disciplinary Case'}
                      {notif.actionType === 'system' && 'Open Management View'}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>

                    {/* Quick Inline Approve if applicable */}
                    {(notif.actionType === 'medical' || notif.actionType === 'registration') && !notif.isApproved && !notif.isRejected && (
                      <>
                        <button
                          type="button"
                          className="adm-btn-xs-success"
                          style={{ padding: '0.38rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={(e) => handleQuickApprove(notif, e)}
                        >
                          ✓ Direct Endorse
                        </button>

                        {notif.actionType === 'medical' && (
                          <button
                            type="button"
                            className="adm-btn-xs-danger"
                            style={{ padding: '0.38rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={(e) => handleQuickReject(notif, e)}
                          >
                            ✗ Reject
                          </button>
                        )}
                      </>
                    )}

                    {notif.isApproved && (
                      <span className="adm-badge badge-active" style={{ fontSize: '0.72rem' }}>
                        ✓ Endorsed
                      </span>
                    )}

                    {notif.isRejected && (
                      <span className="adm-badge badge-inactive" style={{ fontSize: '0.72rem' }}>
                        ✗ Rejected
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      type="button"
                      className="adm-btn-xs-secondary"
                      onClick={() => handleToggleRead(notif.id)}
                      title={isUnread ? 'Mark as read' : 'Mark as unread'}
                    >
                      {isUnread ? 'Mark as Read' : 'Mark as Unread'}
                    </button>

                    <button
                      type="button"
                      className="adm-btn-xs-danger"
                      onClick={() => handleDismiss(notif.id)}
                      title="Dismiss notification"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
