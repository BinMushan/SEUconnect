import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';
import './hod.css';

export default function HOD({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('pending_hod');

  const hodName = user?.name || 'Dr. M.A. Rifky';
  const hodDesignation = user?.designation || 'Head of the Department (ICT)';
  const departmentName = user?.department || 'Department of Information and Communication Technology';

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Failed to load processes in HOD:', err);
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

  const pendingHOD = processes.filter(
    (p) => (p.currentAssignedRole === 'hod' || p.status === 'Pending HOD') && p.status !== 'Approved' && p.status !== 'Declined'
  );

  const displayedProcesses = processes.filter((p) => {
    if (filter === 'pending_hod') {
      return (p.currentAssignedRole === 'hod' || p.status === 'Pending HOD') && p.status !== 'Approved' && p.status !== 'Declined';
    }
    if (filter === 'declined') {
      return p.status === 'Declined';
    }
    if (filter === 'approved') {
      return p.status === 'Approved';
    }
    return true;
  });

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem={activeNav} onNavigate={(id) => setActiveNav(id)}>
      <div className="hod-portal-container">
        {/* Banner */}
        <div className="hod-header-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ background: '#f59e0b', color: '#071733', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                HOD COMMAND CENTER
              </span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Welcome, {hodName}</h1>
            </div>
            <p style={{ margin: '0.35rem 0 0', color: '#93c5fd', fontSize: '0.85rem' }}>
              {hodDesignation} • {departmentName}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              Faculty of Technology • SEUSL
            </span>
          </div>
        </div>

        {/* Metric Stat Cards */}
        <div className="std-stats-grid">
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">DEPARTMENT INSTRUCTORS</span>
                <span className="std-stat-badge">ICT Dept</span>
              </div>
              <div className="std-stat-number">18 Staff</div>
              <div className="std-stat-target">Academic & Demonstrators</div>
            </div>
          </div>

          <div className="std-stat-card" style={pendingHOD.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffbeb' } : {}}>
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title" style={pendingHOD.length > 0 ? { color: '#b45309' } : {}}>
                  AWAITING HOD SIGN-OFF
                </span>
                <span className="std-stat-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                  Urgent
                </span>
              </div>
              <div className="std-stat-number" style={pendingHOD.length > 0 ? { color: '#92400e' } : {}}>
                {pendingHOD.length}
              </div>
              <div className="std-stat-target">Escalated from Course Lecturers</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">ENDORSED TO DEAN</span>
                <span className="std-stat-badge">Forwarded</span>
              </div>
              <div className="std-stat-number">
                {processes.filter(p => p.history?.some(h => h.role === 'hod')).length}
              </div>
              <div className="std-stat-target">Transferred for Faculty Clearance</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">TOTAL DEPT PETITIONS</span>
                <span className="std-stat-badge">2025/26</span>
              </div>
              <div className="std-stat-number">{processes.length}</div>
              <div className="std-stat-target">All Recorded Processes</div>
            </div>
          </div>
        </div>

        {/* HOD Endorsement Table */}
        <div className="hod-table-card">
          <div className="hod-table-header">
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Departmental Verification & Escalation Dashboard
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Endorse verified medical appeals and academic requests before escalating to the Dean's Office.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'pending_hod' ? 'active' : ''}`}
                onClick={() => setFilter('pending_hod')}
              >
                Awaiting HOD ({pendingHOD.length})
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Dept Requests ({processes.length})
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
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading departmental queue...</div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No requests found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                There are no requests waiting for HOD endorsement under this filter.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="hod-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Student Name & Reg No</th>
                    <th>Process Title</th>
                    <th>Lecturer Recommendation</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingMe =
                      (proc.currentAssignedRole === 'hod' || proc.status === 'Pending HOD') &&
                      proc.status !== 'Approved' &&
                      proc.status !== 'Declined';

                    const lecStep = proc.history?.find((h) => h.role === 'lecturer');

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
                          {lecStep ? (
                            <div>
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                ✓ Recommended
                              </span>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                by {lecStep.actedBy}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Pending / Not Required</span>
                          )}
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
                                  className="hod-btn-endorse"
                                  onClick={() => setActionProcess(proc)}
                                >
                                  Endorse & Forward
                                </button>
                                <button
                                  type="button"
                                  className="hod-btn-decline"
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
                              Track & Audit
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
            currentUserRole="hod"
            onClose={() => setSelectedProcess(null)}
          />
        )}

        {actionProcess && (
          <ApproveModal
            process={actionProcess}
            user={{ ...user, name: hodName, designation: hodDesignation, role: 'hod' }}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={{ ...user, name: hodName, designation: hodDesignation, role: 'hod' }}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
