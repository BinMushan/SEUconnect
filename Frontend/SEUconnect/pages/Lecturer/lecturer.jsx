import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';
import './lecturer.css';

export default function Lecturer({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'completed'

  const lecturerName = user?.name || 'Dr. S. Kirushanth';
  const lecturerDesignation = user?.designation || 'Senior Lecturer & Course Coordinator';

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Failed to load processes in Lecturer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const handleApprove = async (payload) => {
    if (!actionProcess) return;
    await api.approveStage(actionProcess.trackingNumber || actionProcess._id, payload);
    setActionProcess(null);
    await loadProcesses();
  };

  const handleDecline = async (payload) => {
    if (!declineProcess) return;
    await api.declineProcess(declineProcess.trackingNumber || declineProcess._id, payload);
    setDeclineProcess(null);
    await loadProcesses();
  };

  // Filter queues
  const pendingRequests = processes.filter(
    (p) => p.currentAssignedRole === 'lecturer' && p.status !== 'Approved' && p.status !== 'Declined'
  );

  const displayedProcesses = processes.filter((p) => {
    if (filter === 'pending') {
      return p.currentAssignedRole === 'lecturer' && p.status !== 'Approved' && p.status !== 'Declined';
    }
    if (filter === 'completed') {
      return p.status === 'Approved' || p.status === 'Declined';
    }
    return true;
  });

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem={activeNav} onNavigate={(id) => setActiveNav(id)}>
      <div className="lec-dashboard-container">
        {/* Banner */}
        <div className="lec-banner-card">
          <div>
            <h1 className="lec-banner-title">Welcome, {lecturerName}</h1>
            <p className="lec-banner-sub">
              {lecturerDesignation} • Department of Information and Communication Technology
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
              ACADEMIC YEAR 2025/2026
            </span>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="std-stats-grid">
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">COURSES COORDINATED</span>
                <span className="std-stat-badge">Active</span>
              </div>
              <div className="std-stat-number">2 Modules</div>
              <div className="std-stat-target">ICT 3112 & ICT 3122</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">ENROLLED STUDENTS</span>
                <span className="std-stat-badge">Sem 5</span>
              </div>
              <div className="std-stat-number">142</div>
              <div className="std-stat-target">Average Attendance: 88.4%</div>
            </div>
          </div>

          <div className="std-stat-card" style={pendingRequests.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffbeb' } : {}}>
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title" style={pendingRequests.length > 0 ? { color: '#b45309' } : {}}>
                  PENDING VERIFICATIONS
                </span>
                <span className="std-stat-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                  Action Needed
                </span>
              </div>
              <div className="std-stat-number" style={pendingRequests.length > 0 ? { color: '#92400e' } : {}}>
                {pendingRequests.length}
              </div>
              <div className="std-stat-target">Awaiting Course Lecturer Review</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">PROCESSED THIS SEMESTER</span>
                <span className="std-stat-badge">Total</span>
              </div>
              <div className="std-stat-number">{processes.length}</div>
              <div className="std-stat-target">Department Pipeline Active</div>
            </div>
          </div>
        </div>

        {/* ================================================================
            LECTURER VERIFICATION QUEUE (Action Hub)
            ================================================================ */}
        <div className="lec-queue-card">
          <div className="lec-queue-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f2b5c' }}>
                Student Process Verification & Recommendation Queue
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Verify student medical excuses, check attendance rosters, and recommend or decline before forwarding to HOD.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                style={{
                  background: filter === 'pending' ? '#0f2b5c' : '#f8fafc',
                  color: filter === 'pending' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Needs My Action ({pendingRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  background: filter === 'all' ? '#0f2b5c' : '#f8fafc',
                  color: filter === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All Department Requests ({processes.length})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Loading verification queue...
            </div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
              🎉 All student requests have been verified and forwarded!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lec-table">
                <thead>
                  <tr>
                    <th>Ref / Tracking #</th>
                    <th>Student Details</th>
                    <th>Affected Courses / Date</th>
                    <th>Medical Certificate Reference</th>
                    <th>Current Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingHere = proc.currentAssignedRole === 'lecturer' && proc.status !== 'Approved' && proc.status !== 'Declined';
                    return (
                      <tr key={proc._id || proc.trackingNumber}>
                        <td>
                          <span className="wf-tracking-badge" style={{ fontSize: '0.78rem' }}>
                            {proc.trackingNumber}
                          </span>
                        </td>
                        <td>
                          <strong>{proc.student?.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {proc.student?.regNo} • {proc.student?.programme}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{proc.details?.absenceDate}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                            {proc.details?.courseCodes?.slice(0, 2).join(', ')}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>{proc.details?.hospitalClinic}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Slip: {proc.details?.medicalCertNo}
                          </div>
                        </td>
                        <td>
                          <span className={`wf-status-badge ${
                            proc.status === 'Approved'
                              ? 'badge-approved'
                              : proc.status === 'Declined'
                              ? 'badge-declined'
                              : 'badge-pending'
                          }`}>
                            {proc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {isPendingHere && (
                              <>
                                <button
                                  type="button"
                                  className="lec-btn-recommend"
                                  onClick={() => setActionProcess(proc)}
                                  title="Recommend and forward to Head of Department"
                                >
                                  ✓ Recommend to HOD
                                </button>
                                <button
                                  type="button"
                                  className="lec-btn-decline"
                                  onClick={() => setDeclineProcess(proc)}
                                  title="Decline request with justification"
                                >
                                  ✕ Decline
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="wf-process-action-btn"
                              onClick={() => setSelectedProcess(proc)}
                            >
                              Track
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedProcess && (
          <ProcessTrackerModal
            process={selectedProcess}
            currentUserRole="lecturer"
            onClose={() => setSelectedProcess(null)}
          />
        )}

        {actionProcess && (
          <ApproveModal
            process={actionProcess}
            user={{ ...user, name: lecturerName, designation: lecturerDesignation, role: 'lecturer' }}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={{ ...user, name: lecturerName, designation: lecturerDesignation, role: 'lecturer' }}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
