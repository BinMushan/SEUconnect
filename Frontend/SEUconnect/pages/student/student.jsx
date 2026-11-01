import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import SubmitMedicalModal from '../../components/workflow/SubmitMedicalModal.jsx';
import api from '../../src/services/api.js';
import './student.css';

export default function Student({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [processes, setProcesses] = useState([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [processFilter, setProcessFilter] = useState('all');

  // Load student processes
  const loadProcesses = async () => {
    try {
      setIsLoadingProcesses(true);
      const res = await api.getProcesses({
        role: 'student',
        email: user?.email || 'student@gmail.com',
      });
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Could not load processes via API:', err);
    } finally {
      setIsLoadingProcesses(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, [user]);

  const handleCreateProcess = async (formData) => {
    const res = await api.createProcess(formData);
    await loadProcesses();
    return res;
  };

  const filteredProcesses = processes.filter((p) => {
    if (processFilter === 'approved') return p.status === 'Approved';
    if (processFilter === 'declined') return p.status === 'Declined';
    if (processFilter === 'in-progress') return p.status !== 'Approved' && p.status !== 'Declined';
    return true;
  });

  const suggestedChips = [
    'Medical Excuse for Lectures',
    'CA Repeat Form',
    "People's Bank PIV Voucher",
    'Add / Drop Modules',
  ];

  const quickActions = [
    {
      label: 'Submit Medical Request',
      action: () => setIsSubmitModalOpen(true),
      highlight: true,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
    },
    {
      label: 'Register Subjects',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'Check Attendance',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="m9 14 2 2 4-4"/>
        </svg>
      ),
    },
    {
      label: 'Exam Registration',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
    },
    {
      label: 'View Results',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
    },
    {
      label: 'Calculate GPA Report',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
    {
      label: 'Degree Progress',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      ),
    },
    {
      label: 'Find a Faculty Form',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
  ];

  const deadlines = [
    {
      category: 'Registration',
      status: 'Open',
      statusType: 'open',
      title: 'Semester Subject Registration (Add/Drop)',
      deadline: 'Deadline: 2026-10-15',
    },
    {
      category: 'Examination',
      status: 'Upcoming',
      statusType: 'upcoming',
      title: 'ESA Examination Entry Submission',
      deadline: 'Deadline: 2026-10-30',
    },
    {
      category: 'Medical',
      status: 'Active',
      statusType: 'active',
      title: 'Medical Certificate Submission Deadline',
      deadline: 'Deadline: Within 7 days of absence',
    },
    {
      category: 'Welfare',
      status: 'Open',
      statusType: 'open',
      title: 'Mahapola / Bursary Welfare Renewal',
      deadline: 'Deadline: 2026-11-10',
    },
  ];

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="wf-status-badge badge-approved">✓ Approved</span>;
    if (status === 'Declined') return <span className="wf-status-badge badge-declined">✕ Declined</span>;
    if (status === 'Pending HOD') return <span className="wf-status-badge badge-hod">⏳ Pending HOD</span>;
    if (status === 'Pending Dean') return <span className="wf-status-badge badge-dean">⏳ Pending Dean</span>;
    return <span className="wf-status-badge badge-pending">⏳ {status}</span>;
  };

  return (
    <DashboardTemplate
      user={user}
      onLogout={onLogout}
      activeItem={activeNav}
      onNavigate={(id) => {
        setActiveNav(id);
        if (id === 'medical_requests') {
          const el = document.querySelector('.wf-tracking-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      <div className="std-dashboard-container">
        
        {/* =========================================================
            1. TOP 4 METRIC STAT CARDS
            ========================================================= */}
        <section className="std-stats-grid">
          {/* Card 1: Current SGPA */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">CURRENT SGPA</span>
                <span className="std-stat-badge">Sem 5</span>
              </div>
              <div className="std-stat-number">3.50</div>
              <div className="std-stat-target">Target: First Class (&ge; 3.70)</div>
            </div>
          </div>

          {/* Card 2: Current CGPA */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">CURRENT CGPA</span>
                <span className="std-stat-badge">Cumulative</span>
              </div>
              <div className="std-stat-number">3.58</div>
              <div className="std-stat-target">Second Class (Upper Division)</div>
            </div>
          </div>

          {/* Card 3: Attendance Standing */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="m9 14 2 2 4-4"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">ATTENDANCE STANDING</span>
                <span className="std-stat-badge">Eligible</span>
              </div>
              <div className="std-stat-number">87%</div>
              <div className="std-stat-target">ESA Minimum: 80%</div>
            </div>
          </div>

          {/* Card 4: Registered Credits */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">REGISTERED CREDITS</span>
                <span className="std-stat-badge">Semester Load</span>
              </div>
              <div className="std-stat-number">18 / 22</div>
              <div className="std-stat-target">4 credits remaining</div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. MULTI-STAGE PROCESS TRACKING SECTION (Core Requirement)
            ========================================================= */}
        <section className="wf-tracking-section" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  WORKFLOW PIPELINE
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f2b5c' }}>
                  Live Process & Medical Excuse Tracking
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Track every stage of your requests as they move through Lecturer &rarr; Medical Officer &rarr; HOD &rarr; Dean.
              </p>
            </div>

            <button
              type="button"
              className="wf-btn-primary"
              onClick={() => setIsSubmitModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 100%)', boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Apply for Lecture Medical Excuse
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            {[
              { id: 'all', label: `All Requests (${processes.length})` },
              { id: 'in-progress', label: `In Progress (${processes.filter(p => p.status !== 'Approved' && p.status !== 'Declined').length})` },
              { id: 'approved', label: `Approved (${processes.filter(p => p.status === 'Approved').length})` },
              { id: 'declined', label: `Declined (${processes.filter(p => p.status === 'Declined').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProcessFilter(tab.id)}
                style={{
                  background: processFilter === tab.id ? '#0f2b5c' : '#f8fafc',
                  color: processFilter === tab.id ? '#ffffff' : '#64748b',
                  border: processFilter === tab.id ? '1px solid #0f2b5c' : '1px solid #e2e8f0',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Process Cards Grid */}
          {isLoadingProcesses ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Loading process tracking data from SEUConnect Backend...
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📋</div>
              <h4 style={{ margin: 0, color: '#334155' }}>No requests in this category</h4>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Click "Apply for Lecture Medical Excuse" to initiate a new request.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {filteredProcesses.map((proc) => {
                const isDec = proc.status === 'Declined';
                return (
                  <div
                    key={proc._id || proc.trackingNumber}
                    className="wf-process-card"
                    style={{
                      borderLeft: isDec ? '4px solid #ef4444' : proc.status === 'Approved' ? '4px solid #10b981' : '4px solid #0ea5e9',
                    }}
                  >
                    <div className="wf-process-card-header">
                      <span className="wf-process-code">{proc.trackingNumber}</span>
                      {getStatusBadge(proc.status)}
                    </div>

                    <h4 className="wf-process-title">{proc.title}</h4>

                    <div className="wf-process-meta-row">
                      <span>📅 Missed: {proc.details?.absenceDate || 'N/A'}</span>
                      <span>🏥 {proc.details?.hospitalClinic || 'Health Center'}</span>
                    </div>

                    {/* Mini Stepper Progress */}
                    <div className="wf-process-stepper-mini">
                      {proc.stages?.map((stg, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <div
                            className={`mini-step-dot ${
                              stg.status === 'COMPLETED'
                                ? 'completed'
                                : stg.status === 'DECLINED'
                                ? 'declined'
                                : stg.status === 'CURRENT'
                                ? 'current'
                                : ''
                            }`}
                            title={`${stg.label}: ${stg.status}`}
                          />
                          {sIdx < proc.stages.length - 1 && <div className="mini-step-line" />}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Prominent Decline preview if declined */}
                    {isDec && proc.declineDetails && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.55rem 0.75rem', fontSize: '0.78rem', color: '#991b1b' }}>
                        <strong>Declined by:</strong> {proc.declineDetails.declinedBy} ({proc.declineDetails.declinedByRole})<br/>
                        <span style={{ color: '#b91c1c' }}>"{proc.declineDetails.reason?.substring(0, 85)}..."</span>
                      </div>
                    )}

                    <div className="wf-process-card-footer">
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isDec
                          ? 'Review complete (Declined)'
                          : proc.status === 'Approved'
                          ? 'Endorsed by Dean Office'
                          : `Currently at: ${proc.currentAssignedRole?.toUpperCase()}`}
                      </span>

                      <button
                        type="button"
                        className="wf-process-action-btn"
                        onClick={() => setSelectedProcess(proc)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Track & Audit Trail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================
            3. "WHAT DO YOU NEED TO DO?" GUIDANCE CARD
            ========================================================= */}
        <section className="std-guidance-card">
          <div className="std-guidance-header">
            <div className="std-guidance-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="std-guidance-titles">
              <h3 className="std-guidance-title">What do you need to do?</h3>
              <p className="std-guidance-subtitle">
                Instant institutional guidance: Search faculty procedures, required forms, submission locations, and approval steps.
              </p>
            </div>
          </div>

          <div className="std-guidance-search-bar">
            <div className="std-search-input-box">
              <svg className="std-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="std-search-input"
                placeholder='Try "I need a medical form", "How do I register repeat exam?", "PIV bank voucher"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="std-find-process-btn"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Apply Online
            </button>
          </div>

          <div className="std-suggested-row">
            <span className="std-suggested-label">Suggested:</span>
            {suggestedChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="std-suggested-chip"
                onClick={() => {
                  setSearchQuery(chip);
                  if (chip.includes('Medical')) {
                    setIsSubmitModalOpen(true);
                  }
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================
            4. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS
            ========================================================= */}
        <section className="std-middle-grid">
          {/* Left: Academic Progression Trend */}
          <div className="std-trend-card">
            <h3 className="std-card-heading">Academic Progression Trend (SGPA)</h3>

            {/* SVG Chart */}
            <div className="std-chart-wrapper">
              <svg viewBox="0 0 540 180" className="std-trend-svg">
                {/* Dashed Horizontal Grid Lines */}
                <line x1="50" y1="20" x2="520" y2="20" className="std-grid-line" />
                <line x1="50" y1="65" x2="520" y2="65" className="std-grid-line" />
                <line x1="50" y1="105" x2="520" y2="105" className="std-grid-line" />
                <line x1="50" y1="145" x2="520" y2="145" className="std-grid-line" />

                {/* Y-Axis Labels */}
                <text x="40" y="24" className="std-axis-text">4</text>
                <text x="28" y="69" className="std-axis-text">3.3</text>
                <text x="28" y="109" className="std-axis-text">2.9</text>
                <text x="28" y="149" className="std-axis-text">2.5</text>

                {/* Vertical Dashed Guidelines under points */}
                <line x1="75" y1="36" x2="75" y2="145" className="std-grid-line-vert" />
                <line x1="175" y1="58" x2="175" y2="145" className="std-grid-line-vert" />
                <line x1="280" y1="58" x2="280" y2="145" className="std-grid-line-vert" />
                <line x1="385" y1="75" x2="385" y2="145" className="std-grid-line-vert" />
                <line x1="490" y1="75" x2="490" y2="145" className="std-grid-line-vert" />

                {/* Blue Trend Line */}
                <path
                  d="M 75,36 C 120,48 140,58 175,58 L 280,58 C 330,58 350,75 385,75 L 490,75"
                  className="std-trend-path"
                />

                {/* Trend Points */}
                <circle cx="75" cy="36" r="4.5" className="std-trend-dot" />
                <circle cx="175" cy="58" r="4.5" className="std-trend-dot" />
                <circle cx="280" cy="58" r="4.5" className="std-trend-dot" />
                <circle cx="385" cy="75" r="4.5" className="std-trend-dot" />
                <circle cx="490" cy="75" r="4.5" className="std-trend-dot" />

                {/* X-Axis Labels */}
                <text x="75" y="165" className="std-axis-text-x">Semester 1</text>
                <text x="175" y="165" className="std-axis-text-x">Semester 2</text>
                <text x="280" y="165" className="std-axis-text-x">Semester 3</text>
                <text x="385" y="165" className="std-axis-text-x">Semester 4</text>
                <text x="490" y="165" className="std-axis-text-x">Semester 5</text>
              </svg>
            </div>

            {/* Bottom 3 Stats */}
            <div className="std-trend-metrics">
              <div className="std-metric-col">
                <span className="std-metric-label">Credits Completed</span>
                <span className="std-metric-value">78</span>
              </div>
              <div className="std-metric-col">
                <span className="std-metric-label">Credits Remaining</span>
                <span className="std-metric-value">52</span>
              </div>
              <div className="std-metric-col">
                <span className="std-metric-label">Degree Progress</span>
                <span className="std-metric-value text-green">60%</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="std-quick-actions-card">
            <h3 className="std-card-heading">Quick Actions</h3>
            <div className="std-actions-list">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="std-action-btn"
                  onClick={action.action}
                  style={action.highlight ? { borderLeft: '3px solid #f59e0b', background: '#fef3c7' } : {}}
                >
                  <span className="std-action-icon">{action.icon}</span>
                  <span className="std-action-label" style={action.highlight ? { fontWeight: 700, color: '#92400e' } : {}}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. UPCOMING INSTITUTIONAL DEADLINES
            ========================================================= */}
        <section className="std-deadlines-section">
          <h3 className="std-deadlines-heading">Upcoming Institutional Deadlines</h3>
          <div className="std-deadlines-grid">
            {deadlines.map((item, idx) => (
              <div key={idx} className="std-deadline-card">
                <div className="std-deadline-header">
                  <span className="std-deadline-pill">{item.category}</span>
                  <span className={`std-status-label status-${item.statusType}`}>{item.status}</span>
                </div>
                <h4 className="std-deadline-title">{item.title}</h4>
                <div className="std-deadline-time">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{item.deadline}</span>
                </div>
                <button
                  type="button"
                  className="std-view-details-btn"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  View Details / Apply
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Workflow Modals */}
      {selectedProcess && (
        <ProcessTrackerModal
          process={selectedProcess}
          currentUserRole="student"
          onClose={() => setSelectedProcess(null)}
        />
      )}

      {isSubmitModalOpen && (
        <SubmitMedicalModal
          user={user}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitSuccess={handleCreateProcess}
        />
      )}
    </DashboardTemplate>
  );
}
