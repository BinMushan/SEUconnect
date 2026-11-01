import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';
import './dean.css';

export default function Dean({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('pending_dean');

  const deanName = user?.name || 'Prof. U.L. Abdul Majeed';
  const deanDesignation = user?.designation || 'Dean, Faculty of Technology';

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Failed to load processes in Dean:', err);
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

  const pendingDean = processes.filter(
    (p) => (p.currentAssignedRole === 'dean' || p.status === 'Pending Dean') && p.status !== 'Approved' && p.status !== 'Declined'
  );

  const displayedProcesses = processes.filter((p) => {
    if (filter === 'pending_dean') {
      return (p.currentAssignedRole === 'dean' || p.status === 'Pending Dean') && p.status !== 'Approved' && p.status !== 'Declined';
    }
    if (filter === 'approved') return p.status === 'Approved';
    if (filter === 'declined') return p.status === 'Declined';
    return true;
  });

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem={activeNav} onNavigate={(id) => setActiveNav(id)}>
      <div className="dean-portal-container">
        {/* Banner */}
        <div className="dean-header-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ background: '#f59e0b', color: '#071733', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                FACULTY EXECUTIVE OFFICE
              </span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Welcome, {deanName}</h1>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: '#93c5fd', fontSize: '0.85rem' }}>
              {deanDesignation} • South Eastern University of Sri Lanka
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              Faculty of Technology Board Authority
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="std-stats-grid">
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">DEPARTMENTS OVERSEEN</span>
                <span className="std-stat-badge">Faculty</span>
              </div>
              <div className="std-stat-number">3 Depts</div>
              <div className="std-stat-target">ICT, BST, & ET</div>
            </div>
          </div>

          <div className="std-stat-card" style={pendingDean.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffbeb' } : {}}>
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title" style={pendingDean.length > 0 ? { color: '#b45309' } : {}}>
                  PENDING DEAN APPROVAL
                </span>
                <span className="std-stat-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                  Action Needed
                </span>
              </div>
              <div className="std-stat-number" style={pendingDean.length > 0 ? { color: '#92400e' } : {}}>
                {pendingDean.length}
              </div>
              <div className="std-stat-target">Escalated from HODs & Examination</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">CONFIRMED REQUESTS</span>
                <span className="std-stat-badge">Final</span>
              </div>
              <div className="std-stat-number">
                {processes.filter((p) => p.status === 'Approved').length}
              </div>
              <div className="std-stat-target">Official Endorsements Granted</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-rose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">DECLINED / RETURNED</span>
                <span className="std-stat-badge">Total</span>
              </div>
              <div className="std-stat-number">
                {processes.filter((p) => p.status === 'Declined').length}
              </div>
              <div className="std-stat-target">Non-compliant Requests</div>
            </div>
          </div>
        </div>

        {/* Executive Table */}
        <div className="dean-table-card">
          <div className="dean-table-header">
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Executive Endorsement & Faculty Approval Queue
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Exercise final faculty authority on recommended student petitions, CA repeat policies, and medical leaves.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'pending_dean' ? 'active' : ''}`}
                onClick={() => setFilter('pending_dean')}
              >
                Awaiting Dean ({pendingDean.length})
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Submissions ({processes.length})
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'declined' ? 'active' : ''}`}
                onClick={() => setFilter('declined')}
              >
                Declined
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading faculty queue...</div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No requests found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                There are currently no requests requiring executive endorsement under this filter.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dean-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Student Name & Reg No</th>
                    <th>Process Description</th>
                    <th>Prior Endorsements</th>
                    <th>Status</th>
                    <th>Submission Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingMe =
                      (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') &&
                      proc.status !== 'Approved' &&
                      proc.status !== 'Declined';

                    const hasHodEndorsement = proc.history?.some((h) => h.role === 'hod');
                    const hasLecEndorsement = proc.history?.some((h) => h.role === 'lecturer');

                    return (
                      <tr key={proc._id || proc.trackingNumber}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f2b5c' }}>
                            {proc.trackingNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{proc.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.registrationNumber}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{proc.processTitle}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {hasLecEndorsement && (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                ✓ Lecturer
                              </span>
                            )}
                            {hasHodEndorsement && (
                              <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                ✓ HOD
                              </span>
                            )}
                            {!hasLecEndorsement && !hasHodEndorsement && (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Direct Submission</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`std-status-pill status-${proc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {proc.status}
                          </span>
                        </td>
                        <td>{new Date(proc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {isPendingMe && (
                              <>
                                <button
                                  type="button"
                                  className="dean-btn-approve"
                                  onClick={() => setActionProcess(proc)}
                                >
                                  Grant Approval
                                </button>
                                <button
                                  type="button"
                                  className="dean-btn-decline"
                                  onClick={() => setDeclineProcess(proc)}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="wf-process-action-btn"
                              onClick={() => setSelectedProcess(proc)}
                            >
                              Audit Trail
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
            currentUserRole="dean"
            onClose={() => setSelectedProcess(null)}
          />
        )}

        {actionProcess && (
          <ApproveModal
            process={actionProcess}
            user={{ ...user, name: deanName, designation: deanDesignation, role: 'dean' }}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={{ ...user, name: deanName, designation: deanDesignation, role: 'dean' }}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
