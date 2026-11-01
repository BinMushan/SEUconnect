import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';
import './lecturer.css';

/**
 * Lecturer Navigation Sections matching Screenshot 1
 */
const LECTURER_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'ACADEMIC INSTRUCTION',
    items: [
      {
        id: 'assigned_courses',
        label: 'My Assigned Courses',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        )
      },
      {
        id: 'record_attendance',
        label: 'Record Attendance',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="11" x2="15" y2="11" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )
      },
      {
        id: 'continuous_assessment',
        label: 'Continuous Assessment (CA)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      },
      {
        id: 'end_semester_exam',
        label: 'End Semester Exam (ESA)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'SERVICES & FORMS',
    items: [
      {
        id: 'faculty_forms',
        label: 'Faculty Forms & Documents',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        )
      },
      {
        id: 'faculty_notices',
        label: 'Faculty Notices',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      },
      {
        id: 'my_profile',
        label: 'My Profile',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      }
    ]
  }
];

/**
 * Lecturer Metadata items matching Screenshot 2
 */
const LECTURER_META_ITEMS = [
  { label: 'Staff ID:', value: 'LEC-FT-001' },
  { label: 'Designation:', value: 'Senior Lecturer Gr. I & Head of Department' },
  { label: 'Department:', value: 'Department of Information and Communication Technology' }
];

export default function Lecturer({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'completed'

  const lecturerName = user?.name || 'Dr. R. Ketheeswaran';
  const lecturerDesignation = user?.designation || 'Senior Lecturer Gr. I & Head of Department';

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

  const lecturerHeroActions = (
    <>
      <button type="button" className="seu-btn-attendance">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        Mark Attendance
      </button>

      <button type="button" className="seu-btn-ca-marks">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Upload CA Marks
      </button>
    </>
  );

  return (
    <DashboardTemplate
      user={{ name: lecturerName, role: 'LECTURER', ...user }}
      onLogout={onLogout}
      activeItem={activeNav}
      onNavigate={(id) => setActiveNav(id)}
      className="lecturer-portal"
      facultyPillText="SOUTH EASTERN UNIVERSITY OF SRI LANKA · FACULTY OF TECHNOLOGY"
      greetingText={`Good Morning, ${lecturerName}`}
      metaItems={LECTURER_META_ITEMS}
      navSections={LECTURER_NAV_SECTIONS}
      heroActions={lecturerHeroActions}
    >
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
                <span className="std-stat-badge">Verified</span>
              </div>
              <div className="std-stat-number">
                {processes.filter(p => p.history?.some(h => h.role === 'lecturer')).length}
              </div>
              <div className="std-stat-target">Student Requests Recommended</div>
            </div>
          </div>
        </div>

        {/* Requests Management Table */}
        <div className="lec-queue-card">
          <div className="lec-queue-header">
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Course-Level Verification & Recommendation Queue
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Review medical certificates and CA repeat submissions for subjects coordinated by you.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Needs Action ({pendingRequests.length})
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Requests ({processes.length})
              </button>
              <button
                type="button"
                className={`std-tab-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading student queue...</div>
          ) : displayedProcesses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No requests found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                There are no student requests waiting for your verification under this filter.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="lec-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Student Name & Reg No</th>
                    <th>Process Title</th>
                    <th>Subject / Course</th>
                    <th>Stage Status</th>
                    <th>Submitted On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isAwaitingMe = proc.currentAssignedRole === 'lecturer' && proc.status !== 'Approved' && proc.status !== 'Declined';
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
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {proc.formData?.subjectCode || proc.formData?.subject || 'ICT 3112'}
                          </span>
                        </td>
                        <td>
                          <span className={`std-status-pill status-${proc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {proc.status}
                          </span>
                        </td>
                        <td>{new Date(proc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              className="std-track-btn"
                              onClick={() => setSelectedProcess(proc)}
                              title="Audit Trail"
                            >
                              Audit
                            </button>
                            {isAwaitingMe && (
                              <>
                                <button
                                  type="button"
                                  className="lec-btn-recommend"
                                  onClick={() => setActionProcess(proc)}
                                >
                                  Recommend
                                </button>
                                <button
                                  type="button"
                                  className="lec-btn-decline"
                                  onClick={() => setDeclineProcess(proc)}
                                >
                                  Decline
                                </button>
                              </>
                            )}
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
