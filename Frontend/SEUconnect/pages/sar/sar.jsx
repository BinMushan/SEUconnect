import React, { useState, useEffect, useMemo } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import api from '../../src/services/api.js';
import './sar.css';

export default function SAR({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Filters & Search
  const [deptFilter, setDeptFilter] = useState('all'); // 'all', 'bst', 'ict'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [actionCategory, setActionCategory] = useState('all');
  const [notifFilter, setNotifFilter] = useState('all'); // 'all', 'unread'
  const [reportDateRange, setReportDateRange] = useState('all');

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

  const sarName = user?.name || 'Mr. K.L.M. Riyas';
  const sarDesignation = user?.designation || 'Senior Assistant Registrar (SAR)';
  const sarStaffId = user?.staffId || 'STAFF-SAR-001';

  // Load processes and notifications
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [procRes, notifRes] = await Promise.all([
        api.getProcesses(),
        api.getNotifications('sar').catch(() => ({ data: [] })),
      ]);

      if (procRes && procRes.data) {
        setProcesses(procRes.data);
      }
      if (notifRes && notifRes.data) {
        setNotifications(notifRes.data);
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
      if (['dashboard', 'monitoring', 'pending_actions', 'faculty_records', 'reports', 'notifications'].includes(sub)) {
        setActiveNav(sub);
      }
    }
  }, []);

  const handleNavigate = (id) => {
    setActiveNav(id);
    window.location.hash = `#sar/${id}`;
  };

  // Helper: Department classifier
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

  // Dynamic Metrics Calculations (Real DB Values)
  const totalCount = processes.length;
  const pendingAdminReview = processes.filter(
    (p) => (p.status === 'Pending Lecturer' || p.status === 'Draft' || p.currentAssignedRole === 'sar') && p.status !== 'Approved' && p.status !== 'Declined'
  );
  const awaitingDean = processes.filter(
    (p) => (p.status === 'Pending Dean' || p.currentAssignedRole === 'dean') && p.status !== 'Approved' && p.status !== 'Declined'
  );
  const returnedCorrections = processes.filter((p) => {
    const hasCorrectionLog = p.auditLog?.some((l) => l.action === 'CORRECTION_REQUESTED' || l.comment?.includes('CORRECTION'));
    return p.status === 'Declined' || hasCorrectionLog;
  });
  const approvedRequests = processes.filter((p) => p.status === 'Approved');
  
  // Recently completed (approved or declined in the past 30 days)
  const recentlyCompleted = processes.filter((p) => {
    if (p.status !== 'Approved' && p.status !== 'Declined') return false;
    const date = new Date(p.approvalDetails?.approvedAt || p.declineDetails?.declinedAt || p.updatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  // Department-wise Calculations
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

  // Filtered processes for Administrative Monitoring
  const filteredProcesses = useMemo(() => {
    return processes
      .filter((p) => {
        // Department Filter
        if (deptFilter === 'bst' && !isBST(p)) return false;
        if (deptFilter === 'ict' && !isICT(p)) return false;

        // Type Filter
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;

        // Status Filter
        if (statusFilter === 'pending' && (p.status === 'Approved' || p.status === 'Declined')) return false;
        if (statusFilter === 'approved' && p.status !== 'Approved') return false;
        if (statusFilter === 'declined' && p.status !== 'Declined') return false;
        if (statusFilter === 'awaiting_dean' && p.status !== 'Pending Dean') return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTrack = (p.trackingNumber || '').toLowerCase().includes(q);
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchStudent = (p.student?.name || '').toLowerCase().includes(q);
          const matchReg = (p.student?.regNo || '').toLowerCase().includes(q);
          const matchReason = (p.details?.reason || '').toLowerCase().includes(q);
          return matchTrack || matchTitle || matchStudent || matchReg || matchReason;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
        if (sortBy === 'oldest') return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt);
        if (sortBy === 'priority') {
          const prioScore = { High: 3, Urgent: 3, Standard: 1 };
          return (prioScore[b.priority] || 1) - (prioScore[a.priority] || 1);
        }
        return 0;
      });
  }, [processes, deptFilter, typeFilter, statusFilter, searchQuery, sortBy]);

  // Filtered for Pending Administrative Actions section
  const actionProcesses = useMemo(() => {
    return processes.filter((p) => {
      if (deptFilter === 'bst' && !isBST(p)) return false;
      if (deptFilter === 'ict' && !isICT(p)) return false;

      switch (actionCategory) {
        case 'newly_submitted':
          return p.status === 'Pending Lecturer' || p.currentStageIndex === 1;
        case 'pending_admin':
          return (p.status === 'Pending Lecturer' || p.status === 'In Progress') && p.status !== 'Approved' && p.status !== 'Declined';
        case 'awaiting_hod':
          return p.status === 'Pending HOD' || p.currentAssignedRole === 'hod';
        case 'endorsed_hod':
          return p.stages?.some((s) => s.stageKey === 'hod_approval' && s.status === 'COMPLETED');
        case 'awaiting_dean':
          return p.status === 'Pending Dean' || p.currentAssignedRole === 'dean';
        case 'returned_corrections':
          return p.auditLog?.some((l) => l.action === 'CORRECTION_REQUESTED') || p.status === 'Declined';
        case 'completed':
          return p.status === 'Approved';
        case 'all':
        default:
          return true;
      }
    });
  }, [processes, deptFilter, actionCategory]);

  // SAR Actions: Add Administrative Remark
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

  // SAR Actions: Request Clarification / Return for Corrections
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
      alert('Error requesting clarification: ' + err.message);
    }
  };

  // SAR Actions: Route / Forward Request
  const handleRouteRequest = async () => {
    if (!routeModalProcess) return;
    try {
      await api.routeProcess(routeModalProcess.trackingNumber || routeModalProcess._id, {
        actorName: sarName,
        actorRole: 'Senior Assistant Registrar (SAR)',
        actorEmail: user?.email || 'sar@gmail.com',
        destinationOfficer: routeDestination,
        routingNote: routeNote,
      });
      setRouteModalProcess(null);
      setRouteNote('');
      await loadData();
    } catch (err) {
      alert('Error routing request: ' + err.message);
    }
  };

  
  const quickActions = [
    {
      label: 'Review Pending Queue',
      actionId: 'pending_actions',
      colorTheme: 'purple',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      )
    },
    {
      label: 'Request Monitoring',
      actionId: 'monitoring',
      colorTheme: 'blue',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    {
      label: 'Audit Supporting Documents',
      actionId: 'pending_actions',
      colorTheme: 'violet',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
    },
    {
      label: 'Faculty Records Ledger',
      actionId: 'faculty_records',
      colorTheme: 'indigo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      label: 'Workflow Analytics & Reports',
      actionId: 'reports',
      colorTheme: 'teal',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      label: 'Department of BST Queue',
      actionId: 'filter_bst',
      colorTheme: 'green',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      )
    },
    {
      label: 'Department of ICT Queue',
      actionId: 'filter_ict',
      colorTheme: 'blue',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
        </svg>
      )
    },
    {
      label: 'SAR Notifications',
      actionId: 'notifications',
      colorTheme: 'rose',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    }
  ];

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
      case 'Declined':
        return <span className="sar-status-badge sar-status-declined">✕ Returned / Declined</span>;
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
            1. TOP 6 SUMMARY METRIC CARDS (Clean Student Portal Style)
            ==================================================================== */}
        <section className="sar-stats-grid">
          {/* Card 1: Total Requests */}
          <div className="sar-stat-card">
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

          {/* Card 2: Pending Admin Review */}
          <div className="sar-stat-card" style={pendingAdminReview.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffdfa' } : {}}>
            <div className="sar-stat-icon-wrap sar-stat-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="sar-stat-body">
              <div className="sar-stat-top-row">
                <span className="sar-stat-title" style={pendingAdminReview.length > 0 ? { color: '#b45309' } : {}}>PENDING REVIEW</span>
                <span className="sar-stat-badge" style={pendingAdminReview.length > 0 ? { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } : {}}>Action Req</span>
              </div>
              <div className="sar-stat-number" style={pendingAdminReview.length > 0 ? { color: '#b45309' } : {}}>
                {pendingAdminReview.length}
              </div>
              <div className="sar-stat-target">Document check required</div>
            </div>
          </div>

          {/* Card 3: Awaiting Dean Approval */}
          <div className="sar-stat-card">
            <div className="sar-stat-icon-wrap sar-stat-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="sar-stat-body">
              <div className="sar-stat-top-row">
                <span className="sar-stat-title">AWAITING DEAN</span>
                <span className="sar-stat-badge">Executive</span>
              </div>
              <div className="sar-stat-number">{awaitingDean.length}</div>
              <div className="sar-stat-target">Dean sanction required</div>
            </div>
          </div>

          {/* Card 4: Returned / Corrections */}
          <div className="sar-stat-card">
            <div className="sar-stat-icon-wrap sar-stat-icon-rose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="sar-stat-body">
              <div className="sar-stat-top-row">
                <span className="sar-stat-title">CORRECTIONS</span>
                <span className="sar-stat-badge">Flagged</span>
              </div>
              <div className="sar-stat-number">{returnedCorrections.length}</div>
              <div className="sar-stat-target">Returned for revision</div>
            </div>
          </div>

          {/* Card 5: Approved Requests */}
          <div className="sar-stat-card">
            <div className="sar-stat-icon-wrap sar-stat-icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="sar-stat-body">
              <div className="sar-stat-top-row">
                <span className="sar-stat-title">APPROVED</span>
                <span className="sar-stat-badge">Sanctioned</span>
              </div>
              <div className="sar-stat-number">{approvedRequests.length}</div>
              <div className="sar-stat-target">Officially sanctioned</div>
            </div>
          </div>

          {/* Card 6: Recently Completed */}
          <div className="sar-stat-card">
            <div className="sar-stat-icon-wrap sar-stat-icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div className="sar-stat-body">
              <div className="sar-stat-top-row">
                <span className="sar-stat-title">COMPLETED</span>
                <span className="sar-stat-badge">Archive</span>
              </div>
              <div className="sar-stat-number">{recentlyCompleted.length}</div>
              <div className="sar-stat-target">Past 30 days throughput</div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. "WHAT DO YOU NEED TO DO?" / SAR OPERATIONS & SEARCH CARD
            ==================================================================== */}
        <section className="sar-guidance-card">
          <div className="sar-guidance-header">
            <div className="sar-guidance-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="sar-guidance-titles">
              <h3 className="sar-guidance-title">Faculty Administrative Operations & Request Search</h3>
              <p className="sar-guidance-subtitle">
                Instant institutional lookup: Search requests by Tracking ID, student reg number, department, or review status across BST & ICT.
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
                placeholder='Try "MED-2025-0104", "CA Repeat Form", "22ICT085", "Pending Review", "Awaiting Dean"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="sar-find-btn"
              onClick={() => handleNavigate('monitoring')}
            >
              Search Requests
            </button>
          </div>

          <div className="sar-suggested-row">
            <span className="sar-suggested-label">Faculty Scope & Filters:</span>
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
            <button
              type="button"
              className={`sar-suggested-chip ${activeNav === 'pending_actions' ? 'active' : ''}`}
              onClick={() => handleNavigate('pending_actions')}
            >
              Pending Admin Review ({pendingAdminReview.length})
            </button>
            <button
              type="button"
              className="sar-suggested-chip"
              onClick={() => {
                setStatusFilter('awaiting_dean');
                handleNavigate('monitoring');
              }}
            >
              Awaiting Dean ({awaitingDean.length})
            </button>
          </div>
        </section>

        {/* ====================================================================
            3. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS (Image 1 Layout)
            ==================================================================== */}
        <section className="sar-middle-grid">
          {/* Left: Administrative Workflow Distribution & Status Card */}
          <div className="sar-trend-card">
            {/* Header: Badge Icon, Title, and Department Selector */}
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
                  <span className="sar-trend-subheading">Monitor real-time request volume and turnaround across BST & ICT</span>
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
              {/* Box 1: BST Department Volume */}
              <div className="sar-trend-top-box">
                <div className="sar-trend-box-icon sar-box-icon-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div className="sar-trend-box-content">
                  <span className="sar-trend-box-lbl">BST Requests</span>
                  <div className="sar-trend-box-val-row">
                    <span className="sar-trend-box-val">{bstMetrics.total}</span>
                    <span className="sar-trend-box-delta">▲ Active</span>
                  </div>
                </div>
              </div>

              {/* Box 2: ICT Department Volume */}
              <div className="sar-trend-top-box">
                <div className="sar-trend-box-icon sar-box-icon-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="sar-trend-box-content">
                  <span className="sar-trend-box-lbl">ICT Requests</span>
                  <div className="sar-trend-box-val-row">
                    <span className="sar-trend-box-val">{ictMetrics.total}</span>
                    <span className="sar-trend-box-denom">/ {totalCount}</span>
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

                    {/* Node 1: Submitted (2) */}
                    <circle cx="60" cy="35" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                    <rect x="42" y="12" width="36" height="18" rx="5" fill="#1e1b4b" />
                    <text x="60" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ffffff">2 Req</text>

                    {/* Node 2: HOD Review (1) */}
                    <circle cx="185" cy="72" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                    <text x="185" y="62" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">1 Req</text>

                    {/* Node 3: SAR Check (2) Selected */}
                    <circle cx="310" cy="45" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3.5" />
                    <rect x="290" y="20" width="40" height="20" rx="5" fill="#4338ca" />
                    <text x="310" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">2 Req</text>

                    {/* Node 4: Dean Sanction (1) */}
                    <circle cx="435" cy="78" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                    <text x="435" y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">1 Req</text>

                    {/* Node 5: Approved (1) */}
                    <circle cx="560" cy="50" r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                    <rect x="540" y="26" width="40" height="20" rx="5" fill="#10b981" />
                    <text x="560" y="40" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ffffff">1 Req</text>

                    {/* Stage X-axis Labels */}
                    <text x="60" y="142" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">Submitted</text>
                    <text x="185" y="142" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">HOD Review</text>
                    <text x="310" y="142" textAnchor="middle" fontSize="11" fontWeight="800" fill="#4338ca">SAR Check</text>
                    <text x="435" y="142" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">Dean Office</text>
                    <text x="560" y="142" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">Completed</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom 3 Summary Statistics */}
            <div className="sar-bottom-stats-row">
              {/* Stat 1: Document Verifications */}
              <div className="sar-bottom-stat-box">
                <div className="sar-bottom-stat-icon-circle sar-icon-circle-emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="sar-bottom-stat-info">
                  <span className="sar-bottom-stat-lbl">Document Verification</span>
                  <span className="sar-bottom-stat-val">100% In Order</span>
                </div>
              </div>

              {/* Stat 2: Active Review Queue */}
              <div className="sar-bottom-stat-box">
                <div className="sar-bottom-stat-icon-circle sar-icon-circle-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="sar-bottom-stat-info">
                  <span className="sar-bottom-stat-lbl">Active Pending Queue</span>
                  <span className="sar-bottom-stat-val">{pendingAdminReview.length + awaitingDean.length} Requests</span>
                </div>
              </div>

              {/* Stat 3: Clearance Rate */}
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

          {/* Right: Quick Actions Card (Image 1 Mockup layout) */}
          <div className="sar-quick-actions-card">
            {/* Dark Purple Gradient Header Banner with Watermark */}
            <div className="sar-qa-header-banner">
              <div className="sar-qa-header-content">
                <div className="sar-qa-header-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="sar-qa-title">Quick Actions</h3>
                  <p className="sar-qa-subtitle">Coordinate faculty operations instantly</p>
                </div>
              </div>
              {/* Decorative Watermark Icon */}
              <div className="sar-qa-watermark">
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>

            {/* 8 Action Items */}
            <div className="sar-qa-actions-list">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sar-qa-item-btn"
                  onClick={() => {
                    if (action.actionId === 'filter_bst') {
                      setDeptFilter('bst');
                      handleNavigate('monitoring');
                    } else if (action.actionId === 'filter_ict') {
                      setDeptFilter('ict');
                      handleNavigate('monitoring');
                    } else {
                      handleNavigate(action.actionId);
                    }
                  }}
                >
                  <div className="sar-qa-item-left">
                    <span className={`sar-qa-icon-circle sar-qa-icon-${action.colorTheme}`}>
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
            4. DEPARTMENT-WISE OVERVIEW (BST & ICT)
            ==================================================================== */}
        <section className="sar-dept-grid">
          {/* Department of Biosystems Technology (BST) */}
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

          {/* Department of Information and Communication Technology (ICT) */}
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

        {/* ====================================================================
            5. MAIN OPERATIONS CARD (Matches Table Standards)
            ==================================================================== */}
        <div className="sar-main-card">
          
          {/* Header */}
          <div className="sar-card-header">
            <div className="sar-card-header-left">
              <h2>
                {activeNav === 'dashboard' && 'Administrative Overview & Workflow Status'}
                {activeNav === 'monitoring' && 'Administrative Request Monitoring (BST & ICT)'}
                {activeNav === 'pending_actions' && 'Pending Administrative Actions & Review Queue'}
                {activeNav === 'faculty_records' && 'Faculty Administrative Records Ledger'}
                {activeNav === 'reports' && 'Faculty Workflow Analytics & Reports Summary'}
                {activeNav === 'notifications' && `SAR Administrative Notifications (${unreadCount} Unread)`}
              </h2>
              <p>
                {activeNav === 'dashboard' && 'Coordinate administrative tracking, document verification, and officer routing across departments.'}
                {activeNav === 'monitoring' && 'Track real-time requests submitted through the existing system with full audit trail history.'}
                {activeNav === 'pending_actions' && 'Perform document checks, record administrative remarks, and route to appropriate authorities.'}
                {activeNav === 'faculty_records' && 'Authoritative ledger of certified requests, remarks, digital stamps, and approval records.'}
                {activeNav === 'reports' && 'Summary statistics, processing time metrics, and departmental distributions.'}
                {activeNav === 'notifications' && 'System alerts for submissions, HOD endorsements, Dean sanctions, and correction flags.'}
              </p>
            </div>

            {/* Quick action buttons on card header */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`sar-btn-pill ${activeNav === 'monitoring' ? 'active' : ''}`}
                onClick={() => handleNavigate('monitoring')}
              >
                All Requests ({processes.length})
              </button>
              <button
                type="button"
                className={`sar-btn-pill ${activeNav === 'pending_actions' ? 'active' : ''}`}
                onClick={() => handleNavigate('pending_actions')}
              >
                Pending Review ({pendingAdminReview.length})
              </button>
              <button
                type="button"
                className={`sar-btn-pill ${activeNav === 'faculty_records' ? 'active' : ''}`}
                onClick={() => handleNavigate('faculty_records')}
              >
                Records Ledger
              </button>
              <button
                type="button"
                className={`sar-btn-pill ${activeNav === 'reports' ? 'active' : ''}`}
                onClick={() => handleNavigate('reports')}
              >
                Reports
              </button>
              <button
                type="button"
                className={`sar-btn-pill ${activeNav === 'notifications' ? 'active' : ''}`}
                onClick={() => handleNavigate('notifications')}
              >
                Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '0 5px', fontSize: '0.65rem' }}>{unreadCount}</span>}
              </button>
            </div>
          </div>

          {/* ====================================================================
              SUB-VIEW 1: REQUEST MONITORING (SECTION 4)
              ==================================================================== */}
          {(activeNav === 'dashboard' || activeNav === 'monitoring') && (
            <>
              {/* Search & Filter Toolbar */}
              <div className="sar-toolbar">
                <div className="sar-search-box">
                  <span className="sar-search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="sar-search-input"
                    placeholder="Search by ID (MED-...), Student Name, Reg No, or Reason..."
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
                    <option value="all">All Request Types</option>
                    <option value="medical_excuse">Medical Excuse</option>
                    <option value="repeat_exam">Repeat Exam Entry</option>
                    <option value="leave_absence">Leave of Absence</option>
                    <option value="add_drop">Add / Drop Registration</option>
                  </select>

                  <select
                    className="sar-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Workflow Statuses</option>
                    <option value="pending">Pending / Active</option>
                    <option value="awaiting_dean">Awaiting Dean</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Returned / Declined</option>
                  </select>

                  <select
                    className="sar-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="priority">Sort: By Priority</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="sar-table-responsive">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Title & Type</th>
                      <th>Requesting Student</th>
                      <th>Department</th>
                      <th>Submitted On</th>
                      <th>Workflow Status</th>
                      <th>Current Handler</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProcesses.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          No requests found matching the current search & filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProcesses.map((p) => (
                        <tr key={p._id || p.trackingNumber}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>
                              {p.trackingNumber}
                            </strong>
                            {p.priority === 'High' && (
                              <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>
                                HIGH
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'capitalize' }}>
                              {p.type?.replace('_', ' ')} • {p.category}
                            </div>
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
                          <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                            {new Date(p.createdAt || p.details?.absenceDate).toLocaleDateString('en-GB')}
                          </td>
                          <td>
                            {renderStatusBadge(p.status)}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                              {p.currentAssignedRole === 'dean' ? 'Dean Office' : p.currentAssignedRole === 'hod' ? `HOD (${getDeptShort(p)})` : p.currentAssignedRole === 'lecturer' ? 'Course Lecturer' : p.status === 'Approved' ? 'Registry Archive' : p.currentAssignedRole}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className="sar-action-btn-primary"
                                onClick={() => setSelectedProcess(p)}
                                title="View details and full multi-stage history"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                className="sar-action-btn-secondary"
                                onClick={() => setRemarkModalProcess(p)}
                                title="Add administrative remarks"
                              >
                                Remark
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ====================================================================
              SUB-VIEW 2: PENDING ADMINISTRATIVE ACTIONS (SECTION 5)
              ==================================================================== */}
          {activeNav === 'pending_actions' && (
            <div>
              {/* Category selector */}
              <div className="sar-toolbar" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'All Actionable' },
                    { key: 'newly_submitted', label: 'Newly Submitted' },
                    { key: 'pending_admin', label: 'Pending Administrative Review' },
                    { key: 'awaiting_hod', label: 'Awaiting HOD Review' },
                    { key: 'endorsed_hod', label: 'Endorsed by HOD' },
                    { key: 'awaiting_dean', label: 'Awaiting Dean Approval' },
                    { key: 'returned_corrections', label: 'Returned for Corrections' },
                    { key: 'completed', label: 'Completed Requests' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`sar-btn-pill ${actionCategory === cat.key ? 'active' : ''}`}
                      onClick={() => setActionCategory(cat.key)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Cards List */}
              <div style={{ padding: '1.25rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {actionProcesses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No requests currently in category: <strong>{actionCategory.replace('_', ' ')}</strong>
                  </div>
                ) : (
                  actionProcesses.map((p) => {
                    const hasCorrection = p.auditLog?.some((l) => l.action === 'CORRECTION_REQUESTED');
                    return (
                      <div
                        key={p.trackingNumber}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1.25rem 1.4rem',
                          background: hasCorrection ? '#fff8f8' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                              {p.trackingNumber}
                            </span>
                            <span className={`sar-dept-pill ${isBST(p) ? 'sar-dept-pill-bst' : 'sar-dept-pill-ict'}`}>
                              {getDeptShort(p)}
                            </span>
                            {renderStatusBadge(p.status)}
                          </div>

                          <div style={{ display: 'flex', gap: '0.45rem' }}>
                            <button
                              type="button"
                              className="sar-action-btn-secondary"
                              onClick={() => setSelectedProcess(p)}
                            >
                              Inspect Full
                            </button>
                            <button
                              type="button"
                              className="sar-action-btn-primary"
                              onClick={() => setRemarkModalProcess(p)}
                            >
                              Add Remark
                            </button>
                            <button
                              type="button"
                              className="sar-action-btn-secondary"
                              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                              onClick={() => setClarifyModalProcess(p)}
                            >
                              Request Clarification
                            </button>
                            <button
                              type="button"
                              className="sar-action-btn-secondary"
                              style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                              onClick={() => setRouteModalProcess(p)}
                            >
                              Route / Forward
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{p.title}</h4>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#475569' }}>
                            Student: <strong>{p.student?.name}</strong> ({p.student?.regNo}) • {p.student?.department}
                          </p>
                        </div>

                        {/* Document Verification Checklist */}
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                            SAR Administrative Document Checklist:
                          </div>
                          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                            <span>✓ Student Identity & Reg No: <strong>Verified</strong></span>
                            <span>
                              {p.details?.attachedDocumentName ? '✓' : '⚠️'} Attached Evidence: <strong>{p.details?.attachedDocumentName || 'Missing'}</strong>
                            </span>
                            <span>
                              {p.stages?.some((s) => s.role === 'lecturer' && s.status === 'COMPLETED') ? '✓' : '⏳'} Lecturer Recommendation: <strong>{p.stages?.some((s) => s.role === 'lecturer' && s.status === 'COMPLETED') ? 'Recorded' : 'Pending'}</strong>
                            </span>
                            <span>
                              {p.stages?.some((s) => s.role === 'hod' && s.status === 'COMPLETED') ? '✓' : '⏳'} HOD Endorsement: <strong>{p.stages?.some((s) => s.role === 'hod' && s.status === 'COMPLETED') ? 'Signed' : 'Pending'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Recent remark if any */}
                        {p.auditLog?.length > 0 && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Last Action: <strong>{p.auditLog[p.auditLog.length - 1].action}</strong> by {p.auditLog[p.auditLog.length - 1].actorName} ({new Date(p.auditLog[p.auditLog.length - 1].timestamp).toLocaleString('en-GB')}) — <em>"{p.auditLog[p.auditLog.length - 1].comment}"</em>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ====================================================================
              SUB-VIEW 3: FACULTY ADMINISTRATIVE RECORDS (SECTION 6)
              ==================================================================== */}
          {activeNav === 'faculty_records' && (
            <div>
              <div className="sar-toolbar">
                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                  Showing authoritative faculty ledger entries ({filteredProcesses.length} records)
                </span>
                <button
                  type="button"
                  className="sar-btn-pill"
                  onClick={() => window.print()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print / Export Ledger Summary
                </button>
              </div>

              <div className="sar-table-responsive">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Application Details</th>
                      <th>Department & Programme</th>
                      <th>Supporting Documents</th>
                      <th>Digital Seals & Approvals</th>
                      <th>Status & Code</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProcesses.map((p) => (
                      <tr key={p.trackingNumber}>
                        <td>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.trackingNumber}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {new Date(p.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {p.student?.name} ({p.student?.regNo})
                          </div>
                        </td>
                        <td>
                          <div>{getDeptShort(p)}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.student?.programme}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                            📎 {p.details?.attachedDocumentName || 'Certified Slip'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                            {p.approvalDetails?.finalApprovalCode ? (
                              <strong style={{ color: '#15803d' }}>{p.approvalDetails.finalApprovalCode}</strong>
                            ) : p.stages?.some((s) => s.digitalStamp) ? (
                              <span>{p.stages.find((s) => s.digitalStamp)?.digitalStamp}</span>
                            ) : (
                              'Under Review'
                            )}
                          </div>
                        </td>
                        <td>
                          {renderStatusBadge(p.status)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="sar-action-btn-secondary"
                            onClick={() => setSelectedProcess(p)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================================
              SUB-VIEW 4: REPORTS AND WORKFLOW SUMMARY (SECTION 8)
              ==================================================================== */}
          {activeNav === 'reports' && (
            <div style={{ padding: '1.5rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Date range filter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Workflow Performance & Turnaround Metrics
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['all', 'semester', '30days', '7days'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`sar-btn-pill ${reportDateRange === range ? 'active' : ''}`}
                      onClick={() => setReportDateRange(range)}
                    >
                      {range === 'all' ? 'All Time' : range === 'semester' ? 'Current Semester' : range === '30days' ? 'Last 30 Days' : 'Last 7 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparative Department Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', color: '#0f172a' }}>
                    Biosystems Technology (BST) Throughput
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Requests Logged:</span>
                      <strong>{bstMetrics.total}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Approved & Sanctioned:</span>
                      <strong style={{ color: '#15803d' }}>{bstMetrics.completed} ({bstMetrics.total > 0 ? Math.round((bstMetrics.completed / bstMetrics.total) * 100) : 0}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Under Administrative & HOD Review:</span>
                      <strong style={{ color: '#b45309' }}>{bstMetrics.pending}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Average Turnaround Time:</span>
                      <strong>2.4 Working Days</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', color: '#0f172a' }}>
                    Information & Communication Technology (ICT) Throughput
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Requests Logged:</span>
                      <strong>{ictMetrics.total}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Approved & Sanctioned:</span>
                      <strong style={{ color: '#15803d' }}>{ictMetrics.completed} ({ictMetrics.total > 0 ? Math.round((ictMetrics.completed / ictMetrics.total) * 100) : 0}%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Under Administrative & HOD Review:</span>
                      <strong style={{ color: '#b45309' }}>{ictMetrics.pending}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Average Turnaround Time:</span>
                      <strong>2.8 Working Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Bar */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0f172a' }}>
                  Faculty-Wide Workflow Distribution
                </h4>
                <div style={{ display: 'flex', height: '14px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0' }}>
                  <div style={{ width: `${totalCount > 0 ? (approvedRequests.length / totalCount) * 100 : 0}%`, background: '#22c55e' }} title={`Approved: ${approvedRequests.length}`} />
                  <div style={{ width: `${totalCount > 0 ? (awaitingDean.length / totalCount) * 100 : 0}%`, background: '#f59e0b' }} title={`Awaiting Dean: ${awaitingDean.length}`} />
                  <div style={{ width: `${totalCount > 0 ? (pendingAdminReview.length / totalCount) * 100 : 0}%`, background: '#3b82f6' }} title={`Pending Review: ${pendingAdminReview.length}`} />
                  <div style={{ width: `${totalCount > 0 ? (returnedCorrections.length / totalCount) * 100 : 0}%`, background: '#ef4444' }} title={`Returned / Declined: ${returnedCorrections.length}`} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.76rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>🟢 Approved: <strong>{approvedRequests.length}</strong></span>
                  <span>🟡 Awaiting Dean: <strong>{awaitingDean.length}</strong></span>
                  <span>🔵 In Review: <strong>{pendingAdminReview.length}</strong></span>
                  <span>🔴 Returned / Declined: <strong>{returnedCorrections.length}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              SUB-VIEW 5: NOTIFICATIONS (SECTION 7)
              ==================================================================== */}
          {activeNav === 'notifications' && (
            <div>
              <div className="sar-toolbar">
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className={`sar-btn-pill ${notifFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setNotifFilter('all')}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    className={`sar-btn-pill ${notifFilter === 'unread' ? 'active' : ''}`}
                    onClick={() => setNotifFilter('unread')}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="sar-action-btn-secondary"
                    onClick={handleMarkAllNotifsRead}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div>
                {notifications
                  .filter((n) => (notifFilter === 'unread' ? !n.isRead : true))
                  .map((notif) => (
                    <div
                      key={notif._id}
                      className={`sar-notif-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div style={{ display: 'flex', gap: '0.85rem', flex: 1 }}>
                        {!notif.isRead && <span className="sar-notif-dot" />}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '0.83rem', color: '#475569' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                            <span>{new Date(notif.createdAt).toLocaleString('en-GB')}</span>
                            {notif.relatedRequestId && (
                              <span style={{ color: '#2563eb', fontWeight: 600 }}>
                                Ref: {notif.relatedRequestId}
                              </span>
                            )}
                            <span>{notif.department}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {!notif.isRead && (
                          <button
                            type="button"
                            className="sar-btn-pill"
                            style={{ fontSize: '0.7rem' }}
                            onClick={(e) => handleMarkNotifRead(notif._id, e)}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================================
          MODAL 1: FULL REQUEST DETAILS & MULTI-STAGE TIMELINE
          ====================================================================== */}
      {selectedProcess && (
        <div className="sar-modal-overlay" onClick={() => setSelectedProcess(null)}>
          <div className="sar-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <div>
                <span className="sar-banner-badge">FACULTY REQUEST AUDIT</span>
                <h3 className="sar-modal-title" style={{ marginTop: '0.25rem' }}>
                  {selectedProcess.trackingNumber} — {selectedProcess.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProcess(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="sar-modal-body">
              {/* Student & Department Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#0f172a' }}>Applicant Profile</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div>Name: <strong>{selectedProcess.student?.name}</strong></div>
                  <div>Reg No: <strong>{selectedProcess.student?.regNo}</strong></div>
                  <div>Department: <strong>{selectedProcess.student?.department}</strong></div>
                  <div>Programme: <strong>{selectedProcess.student?.programme}</strong></div>
                  <div>Semester: <strong>{selectedProcess.student?.semester}</strong></div>
                  <div>Email: <strong>{selectedProcess.student?.email}</strong></div>
                </div>
              </div>

              {/* Request Specifics */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#0f172a' }}>Submission Evidence & Medical Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div>Absence Dates: <strong>{selectedProcess.details?.absenceDate} to {selectedProcess.details?.endDate}</strong></div>
                  <div>Modules Impacted: <strong>{selectedProcess.details?.courseCodes?.join(', ') || 'N/A'}</strong></div>
                  <div>Clinical Diagnosis / Justification: <strong>{selectedProcess.details?.reason || 'N/A'}</strong></div>
                  <div>Doctor / Hospital: <strong>{selectedProcess.details?.doctorName} ({selectedProcess.details?.hospitalClinic})</strong></div>
                  <div>Certificate / PIV No: <strong>{selectedProcess.details?.medicalCertNo || 'N/A'}</strong></div>
                  <div>Attached Document: <strong style={{ color: '#2563eb' }}>📎 {selectedProcess.details?.attachedDocumentName || 'Certified Slip'}</strong></div>
                </div>
              </div>

              {/* Workflow Multi-Stage Timeline */}
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#0f172a' }}>Official Approval Stages</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedProcess.stages?.map((stage, idx) => (
                    <div
                      key={stage.stageKey || idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: stage.status === 'COMPLETED' ? '#86efac' : stage.status === 'DECLINED' ? '#fca5a5' : '#cbd5e1',
                        background: stage.status === 'COMPLETED' ? '#f0fdf4' : stage.status === 'DECLINED' ? '#fef2f2' : '#ffffff',
                        fontSize: '0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{idx + 1}. {stage.label}</strong> ({stage.role?.toUpperCase()})
                        {stage.remarks && <div style={{ color: '#475569', fontSize: '0.74rem', marginTop: '0.2rem' }}>"{stage.remarks}"</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: stage.status === 'COMPLETED' ? '#15803d' : stage.status === 'DECLINED' ? '#b91c1c' : '#64748b' }}>
                          {stage.status}
                        </span>
                        {stage.actionDate && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {new Date(stage.actionDate).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immutable Audit Ledger */}
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#0f172a' }}>Immutable Audit Log</h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  {selectedProcess.auditLog?.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.76rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <strong style={{ color: '#0f172a' }}>{log.action}</strong>
                        <span>{new Date(log.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                      <div>By: <strong>{log.actorName}</strong> ({log.actorRole})</div>
                      <div style={{ color: '#475569', fontStyle: 'italic' }}>"{log.comment}"</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sar-modal-footer">
              <button
                type="button"
                className="sar-action-btn-secondary"
                onClick={() => {
                  setRemarkModalProcess(selectedProcess);
                  setSelectedProcess(null);
                }}
              >
                Add Administrative Remark
              </button>
              <button
                type="button"
                className="sar-action-btn-primary"
                onClick={() => setSelectedProcess(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 2: ADD ADMINISTRATIVE REMARKS
          ====================================================================== */}
      {remarkModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setRemarkModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Record Administrative Remark</h3>
              <button type="button" onClick={() => setRemarkModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Ref: <strong>{remarkModalProcess.trackingNumber}</strong> ({remarkModalProcess.student?.name})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Document Compliance Check
                </label>
                <select
                  className="sar-select"
                  style={{ width: '100%' }}
                  value={docCheckStatus}
                  onChange={(e) => setDocCheckStatus(e.target.value)}
                >
                  <option value="Verified Complete">Verified Complete & Formally Compliant</option>
                  <option value="Certified Medical Chit Endorsed">Certified Medical Chit Endorsed by Health Centre</option>
                  <option value="Bank PIV Slip Validated">Bank PIV Slip Validated with Accounts Ledger</option>
                  <option value="Pending Further Verification">Pending Further Verification</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  SAR Administrative Remarks / Coordination Note
                </label>
                <textarea
                  rows="4"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Enter administrative observation, regulation compliance check, or coordinating note..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setRemarkModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleSaveRemark}>Save & Stamp Audit Log</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 3: REQUEST CLARIFICATION / CORRECTIONS
          ====================================================================== */}
      {clarifyModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setClarifyModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title" style={{ color: '#b91c1c' }}>Request Clarification / Return for Corrections</h3>
              <button type="button" onClick={() => setClarifyModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Ref: <strong>{clarifyModalProcess.trackingNumber}</strong> ({clarifyModalProcess.student?.name})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Identify Deficiencies (Select all that apply)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  {[
                    'Missing certified University Health Center slip',
                    'Bank PIV deposit receipt not attached or incomplete',
                    'Exceeded 7-calendar-day submission limit under By-law',
                    'Course Lecturer recommendation missing',
                    'Illegible clinical diagnosis or missing doctor signature',
                  ].map((def) => {
                    const isChecked = selectedDeficiencies.includes(def);
                    return (
                      <label key={def} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
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
                  Detailed Instructions for Rectification
                </label>
                <textarea
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Specify what the student or department coordinator must submit to regularize this petition..."
                  value={clarifyNotes}
                  onChange={(e) => setClarifyNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setClarifyModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" style={{ background: '#b91c1c' }} onClick={handleRequestClarification}>
                Flag for Corrections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 4: ROUTE / FORWARD REQUEST
          ====================================================================== */}
      {routeModalProcess && (
        <div className="sar-modal-overlay" onClick={() => setRouteModalProcess(null)}>
          <div className="sar-modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sar-modal-header">
              <h3 className="sar-modal-title">Route / Forward Administrative Request</h3>
              <button type="button" onClick={() => setRouteModalProcess(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="sar-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                Ref: <strong>{routeModalProcess.trackingNumber}</strong> ({routeModalProcess.title})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Destination Authorized Officer
                </label>
                <select
                  className="sar-select"
                  style={{ width: '100%' }}
                  value={routeDestination}
                  onChange={(e) => setRouteDestination(e.target.value)}
                >
                  <option value="Dean, Faculty of Technology">Dean, Faculty of Technology (Prof. U.L. Abdul Majeed)</option>
                  <option value="Head of Department, Biosystems Technology (BST)">Head of Department, Biosystems Technology (BST)</option>
                  <option value="Head of Department, ICT (Dr. M.A. Rifky)">Head of Department, ICT (Dr. M.A. Rifky)</option>
                  <option value="Senior Assistant Registrar, Examination Branch">Senior Assistant Registrar, Examination Branch</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  SAR Endorsement / Routing Notation
                </label>
                <textarea
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  placeholder="Administrative check completed. Supporting documents examined and found in order. Forwarded for official endorsement..."
                  value={routeNote}
                  onChange={(e) => setRouteNote(e.target.value)}
                />
              </div>
            </div>
            <div className="sar-modal-footer">
              <button type="button" className="sar-action-btn-secondary" onClick={() => setRouteModalProcess(null)}>Cancel</button>
              <button type="button" className="sar-action-btn-primary" onClick={handleRouteRequest}>Forward with Stamp</button>
            </div>
          </div>
        </div>
      )}

    </DashboardTemplate>
  );
}

