import React, { useState, useEffect } from 'react';
import './examination.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';

export default function Examination({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  const officerName = user?.name || 'Dr. (Mrs.) R. Fathima';
  const designation = user?.designation || 'Senior Assistant Registrar (Examinations & Medical)';

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) setProcesses(res.data);
    } catch (err) {
      console.warn('Error loading processes in Examination:', err);
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

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem={activeNav} onNavigate={(id) => setActiveNav(id)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #071733 0%, #0f2b5c 100%)', padding: '1.5rem', borderRadius: '14px', color: '#fff', borderBottom: '3px solid #f59e0b' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Examination & Health Records Desk</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#93c5fd', fontSize: '0.85rem' }}>
            {officerName} • {designation} • Faculty of Technology
          </p>
        </div>

        <div className="std-stats-grid">
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">HEALTH REGISTRY</span>
                <span className="std-stat-badge">Active</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.type === 'medical_excuse').length} Slips</div>
              <div className="std-stat-target">Health Centre Log</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">AWAITING VERIFICATION</span>
                <span className="std-stat-badge" style={{ background: '#f59e0b', color: '#fff' }}>Queue</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.currentAssignedRole === 'examination' && p.status !== 'Approved' && p.status !== 'Declined').length}</div>
              <div className="std-stat-target">Exam & Medical Endorsements</div>
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
                <span className="std-stat-title">ATTENDANCE ADJUSTED</span>
                <span className="std-stat-badge">ESA Eligible</span>
              </div>
              <div className="std-stat-number">{processes.filter(p => p.status === 'Approved').length}</div>
              <div className="std-stat-target">Officially Endorsed</div>
            </div>
          </div>
        </div>

        {/* Process Table */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#0f2b5c' }}>
            Medical & Examination Verification Registry
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="lec-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Student</th>
                  <th>Title & Diagnosis</th>
                  <th>Hospital / Medical Slip</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc) => {
                  const isPending = proc.currentAssignedRole === 'examination' && proc.status !== 'Approved' && proc.status !== 'Declined';
                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td><span className="wf-tracking-badge">{proc.trackingNumber}</span></td>
                      <td>
                        <strong>{proc.student?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.student?.regNo}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{proc.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{proc.details?.reason}</div>
                      </td>
                      <td>
                        <div>{proc.details?.hospitalClinic}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.details?.medicalCertNo}</div>
                      </td>
                      <td>
                        <span className={`wf-status-badge ${
                          proc.status === 'Approved' ? 'badge-approved' : proc.status === 'Declined' ? 'badge-declined' : 'badge-pending'
                        }`}>
                          {proc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="lec-btn-recommend"
                                onClick={() => setActionProcess(proc)}
                              >
                                ✓ Endorse Slip
                              </button>
                              <button
                                type="button"
                                className="lec-btn-decline"
                                onClick={() => setDeclineProcess(proc)}
                              >
                                ✕ Invalidate
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
        </div>

        {selectedProcess && (
          <ProcessTrackerModal
            process={selectedProcess}
            currentUserRole="examination"
            onClose={() => setSelectedProcess(null)}
          />
        )}

        {actionProcess && (
          <ApproveModal
            process={actionProcess}
            user={{ ...user, name: officerName, designation, role: 'examination' }}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={{ ...user, name: officerName, designation, role: 'examination' }}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
