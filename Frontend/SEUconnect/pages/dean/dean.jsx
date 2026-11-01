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
                <span className="std-stat-title">FACULTY DEPARTMENTS</span>
                <span className="std-stat-badge">3 Total</span>
              </div>
              <div className="std-stat-number">ICT, BST, ET</div>
              <div className="std-stat-target">1,280 Undergraduates</div>
            </div>
          </div>

          <div className="std-stat-card" style={pendingDean.length > 0 ? { borderLeft: '4px solid #8b5cf6', background: '#f5f3ff' } : {}}>
            <div className="std-stat-icon-wrap" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title" style={pendingDean.length > 0 ? { color: '#6d28d9' } : {}}>
                  ESCALATED TO DEAN
                </span>
                <span className="std-stat-badge" style={{ background: '#8b5cf6', color: '#ffffff' }}>
                  Final Sign-off
                </span>
              </div>
              <div className="std-stat-number" style={pendingDean.length > 0 ? { color: '#5b21b6' } : {}}>
                {pendingDean.length}
              </div>
              <div className="std-stat-target">Awaiting Executive Sanction</div>
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
                <span className="std-stat-title">SANCTIONED & EXECUTED</span>
                <span className="std-stat-badge">Approved</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.status === 'Approved').length}</div>
              <div className="std-stat-target">Official Digital Seal Issued</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">FACULTY REJECTIONS</span>
                <span className="std-stat-badge">Audit</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.status === 'Declined').length}</div>
              <div className="std-stat-target">With Permanent Justification</div>
            </div>
          </div>
        </div>

        {/* Dean Executive Table */}
        <div className="dean-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f2b5c' }}>
                Faculty Executive Sanctions & Escalations Desk
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Faculty-level final endorsement for medical waivers, repeat permissions, and departmental escalations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { id: 'pending_dean', label: `Needs Dean Sanction (${pendingDean.length})` },
                { id: 'all', label: `Faculty Pipeline (${processes.length})` },
                { id: 'approved', label: `Sanctioned (${processes.filter(p => p.status === 'Approved').length})` },
                { id: 'declined', label: `Declined (${processes.filter(p => p.status === 'Declined').length})` },
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
              Loading faculty records...
            </div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
              ✅ No processes currently awaiting Dean executive action.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lec-table">
                <thead>
                  <tr>
                    <th>Ref / Tracking #</th>
                    <th>Student & Department</th>
                    <th>Request Title</th>
                    <th>HOD Endorsement Remarks</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Faculty Executive Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingAtDean = (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') && proc.status !== 'Approved' && proc.status !== 'Declined';
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
                            {proc.student?.regNo} • {proc.student?.department}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{proc.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                            {proc.details?.absenceDate ? `Missed: ${proc.details?.absenceDate}` : proc.category}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '280px' }}>
                            {proc.stages && proc.stages[proc.currentStageIndex - 1]?.remarks ? (
                              <span>
                                🏛️ <strong>{proc.stages[proc.currentStageIndex - 1]?.actionTakenRole}:</strong> "
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
                              : 'badge-dean'
                          }`}>
                            {proc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {isPendingAtDean && (
                              <>
                                <button
                                  type="button"
                                  className="lec-btn-recommend"
                                  onClick={() => setActionProcess(proc)}
                                  title="Grant final faculty executive sanction"
                                >
                                  ⚖️ Grant Faculty Approval
                                </button>
                                <button
                                  type="button"
                                  className="lec-btn-decline"
                                  onClick={() => setDeclineProcess(proc)}
                                  title="Decline with faculty remarks"
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
