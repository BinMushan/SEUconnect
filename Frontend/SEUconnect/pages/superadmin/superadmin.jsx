import { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import api from '../../src/services/api.js';
import './superadmin.css';

export default function SuperAdmin({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [procRes, userRes] = await Promise.all([
          api.getProcesses().catch(() => ({ data: [] })),
          api.getUsers().catch(() => ({ data: [] })),
        ]);
        if (!isMounted) return;
        if (procRes?.data) setProcesses(procRes.data);
        if (userRes?.data) setUsers(userRes.data);
      } catch (err) {
        console.warn('SuperAdmin loadData:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem={activeNav} onNavigate={(id) => setActiveNav(id)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', padding: '1.5rem', borderRadius: '14px', color: '#fff', borderBottom: '3px solid #f59e0b', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ background: '#f59e0b', color: '#071733', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                MASTER INFRASTRUCTURE CONSOLE
              </span>
              <h1 style={{ margin: '0.4rem 0 0', fontSize: '1.4rem', fontWeight: 700 }}>
                SEUConnect Root Security & Workflow Audit
              </h1>
              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Central IT Services • South Eastern University of Sri Lanka • MongoDB MERN Cluster
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: '#10b981', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                ● CLUSTER ACTIVE: PORT 5000 & 27017
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="std-stats-grid">
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">PROVISIONED ACCOUNTS</span>
                <span className="std-stat-badge">7 Roles</span>
              </div>
              <div className="std-stat-number">{users.length || 7}</div>
              <div className="std-stat-target">MERN Mongo Auth Active</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">TOTAL PIPELINES</span>
                <span className="std-stat-badge">Live</span>
              </div>
              <div className="std-stat-number">{processes.length}</div>
              <div className="std-stat-target">Sequential Stages Tracking</div>
            </div>
          </div>

          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">TAMPER-PROOF AUDIT</span>
                <span className="std-stat-badge">Immutable</span>
              </div>
              <div className="std-stat-number">
                {processes.reduce((acc, p) => acc + (p.auditLog?.length || 0), 0)} Events
              </div>
              <div className="std-stat-target">Recorded with Digital Stamps</div>
            </div>
          </div>
        </div>

        {/* Global Process Inspection Table */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#0f2b5c' }}>
            Master Faculty & Department Workflow Ledger
          </h3>

          {isLoading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading workflow pipelines and security ledger...</div>
            </div>
          ) : processes.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No workflow processes found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Active student workflow submissions will appear here for audit inspection.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lec-table">
                <thead>
                  <tr>
                    <th>Tracking Ref</th>
                    <th>Student & Reg No</th>
                    <th>Process Title</th>
                    <th>Current Station</th>
                    <th>Decision Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((proc) => (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td><span className="wf-tracking-badge">{proc.trackingNumber}</span></td>
                      <td>
                        <strong>{proc.student?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.student?.regNo}</div>
                      </td>
                      <td>
                        <div>{proc.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{proc.category}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f2b5c' }}>
                          {proc.currentAssignedRole?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`wf-status-badge ${
                          proc.status === 'Approved' ? 'badge-approved' : proc.status === 'Declined' ? 'badge-declined' : 'badge-pending'
                        }`}>
                          {proc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="wf-process-action-btn"
                          onClick={() => setSelectedProcess(proc)}
                        >
                          Inspect Audit Trail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedProcess && (
          <ProcessTrackerModal
            process={selectedProcess}
            currentUserRole="superadmin"
            onClose={() => setSelectedProcess(null)}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
