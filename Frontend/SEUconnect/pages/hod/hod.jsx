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
                <span className="std-stat-title">DEPT ENROLLMENT</span>
                <span className="std-stat-badge">ICT</span>
              </div>
              <div className="std-stat-number">420</div>
              <div className="std-stat-target">Undergraduate Students</div>
            </div>
          </div>

          <div className="std-stat-card" style={pendingHOD.length > 0 ? { borderLeft: '4px solid #f59e0b', background: '#fffbeb' } : {}}>
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title" style={pendingHOD.length > 0 ? { color: '#b45309' } : {}}>
                  NEEDS HOD APPROVAL
                </span>
                <span className="std-stat-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                  Urgent
                </span>
              </div>
              <div className="std-stat-number" style={pendingHOD.length > 0 ? { color: '#92400e' } : {}}>
                {pendingHOD.length}
              </div>
              <div className="std-stat-target">Recommended by Lecturers</div>
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
                <span className="std-stat-title">APPROVED AT DEPT</span>
                <span className="std-stat-badge">Success</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.status === 'Approved').length}</div>
              <div className="std-stat-target">Sanctioned & Recorded</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">DECLINED PROCESSES</span>
                <span className="std-stat-badge" style={{ background: '#ef4444', color: '#ffffff' }}>Audit</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.status === 'Declined').length}</div>
              <div className="std-stat-target">With Mandatory Justification</div>
            </div>
          </div>
        </div>

        {/* HOD Approvals Table */}
        <div className="hod-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f2b5c' }}>
                Department Process Approvals & Escalation Desk
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Review recommendations from course lecturers, verify university bylaws, endorse, or decline with recorded justification.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { id: 'pending_hod', label: `Awaiting HOD (${pendingHOD.length})` },
                { id: 'all', label: `All Requests (${processes.length})` },
                { id: 'declined', label: `Declined (${processes.filter(p => p.status === 'Declined').length})` },
                { id: 'approved', label: `Approved (${processes.filter(p => p.status === 'Approved').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  style={{
                    background: filter === tab.id ? '#0f2b5c' : '#f8fafc',
                    color: filter === tab.id ? '#ffffff' : '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Loading departmental queue...
            </div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
              ✅ No requests currently awaiting HOD action in this view.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lec-table">
                <thead>
                  <tr>
                    <th>Ref / Tracking #</th>
                    <th>Applicant Student</th>
                    <th>Type & Title</th>
                    <th>Prior Reviewer Note</th>
                    <th>Current Status</th>
                    <th style={{ textAlign: 'right' }}>HOD Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingHOD = (proc.currentAssignedRole === 'hod' || proc.status === 'Pending HOD') && proc.status !== 'Approved' && proc.status !== 'Declined';
                    const isDec = proc.status === 'Declined';
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
                          <div style={{ fontWeight: 600 }}>{proc.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                            {proc.details?.absenceDate ? `Missed: ${proc.details?.absenceDate}` : proc.category}
                          </div>
                        </td>
                        <td>
                          {/* Prior step note */}
                          <div style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '280px' }}>
                            {proc.stages && proc.stages[proc.currentStageIndex - 1]?.remarks ? (
                              <span>
                                🗣️ <strong>{proc.stages[proc.currentStageIndex - 1]?.actionTakenRole}:</strong> "
                                {proc.stages[proc.currentStageIndex - 1]?.remarks}"
                              </span>
                            ) : isDec && proc.declineDetails ? (
                              <span style={{ color: '#b91c1c' }}>
                                ❌ <strong>Declined by {proc.declineDetails.declinedBy}:</strong> "{proc.declineDetails.reason?.substring(0, 70)}..."
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Awaiting review</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`wf-status-badge ${
                            proc.status === 'Approved'
                              ? 'badge-approved'
                              : isDec
                              ? 'badge-declined'
                              : 'badge-hod'
                          }`}>
                            {proc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {isPendingHOD && (
                              <>
                                <button
                                  type="button"
                                  className="lec-btn-recommend"
                                  onClick={() => setActionProcess(proc)}
                                  title="Approve at Department level and forward to Dean"
                                >
                                  ✓ Endorse to Dean
                                </button>
                                <button
                                  type="button"
                                  className="lec-btn-decline"
                                  onClick={() => setDeclineProcess(proc)}
                                  title="Decline request with official reason"
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
