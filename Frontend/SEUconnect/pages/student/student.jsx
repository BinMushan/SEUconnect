import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import AcademicProfile from './academic_profile.jsx';
import SemesterRegistration from './semester_registration.jsx';
import Attendance from './attendance.jsx';
import MedicalRequests from './medical_requests.jsx';
import StudentExamination from './examination.jsx';
import StudentResults from './results.jsx';
import StudentGpaCgpa from './gpa_cgpa.jsx';
import StudentAcademicProgress from './academic_progress.jsx';
import StudentProcessGuidance from './process_guidance.jsx';
import StudentWelfare from './welfare_scholarships.jsx';
import StudentSocieties from './societies_clubs.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import SubmitMedicalModal from '../../components/workflow/SubmitMedicalModal.jsx';
import api from '../../src/services/api.js';
import './student.css';

export default function Student({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash.replace('#', '') || window.location.pathname).toLowerCase();
      if (hash.includes('welfare') || hash.includes('scholarship')) return 'welfare_scholarships';
      if (hash.includes('societ') || hash.includes('club')) return 'societies_clubs';
      if (hash.includes('process') || hash.includes('guidance')) return 'process_guidance';
      if (hash.includes('examination')) return 'examinations';
      if (hash.includes('result')) return 'results';
      if (hash.includes('progress')) return 'academic_progress';
      if (hash.includes('gpa') || hash.includes('cgpa')) return 'gpa_cgpa';
      if (hash.includes('medical')) return 'medical_requests';
      if (hash.includes('attendance')) return 'attendance';
      if (hash.includes('registration')) return 'semester_registration';
      if (hash.includes('profile')) return 'academic_profile';
    }
    return 'dashboard';
  });

  // Listen for hash changes to sync navigation
  useEffect(() => {
    const handleHashSync = () => {
      const hash = (window.location.hash.replace('#', '') || window.location.pathname).toLowerCase();
      if (hash.includes('welfare') || hash.includes('scholarship')) {
        setActiveTab('welfare_scholarships');
      } else if (hash.includes('societ') || hash.includes('club')) {
        setActiveTab('societies_clubs');
      } else if (hash.includes('process') || hash.includes('guidance')) {
        setActiveTab('process_guidance');
      } else if (hash.includes('examination')) {
        setActiveTab('examinations');
      } else if (hash.includes('result')) {
        setActiveTab('results');
      } else if (hash.includes('progress')) {
        setActiveTab('academic_progress');
      } else if (hash.includes('gpa') || hash.includes('cgpa')) {
        setActiveTab('gpa_cgpa');
      } else if (hash.includes('medical')) {
        setActiveTab('medical_requests');
      } else if (hash.includes('attendance')) {
        setActiveTab('attendance');
      } else if (hash.includes('registration')) {
        setActiveTab('semester_registration');
      } else if (hash.includes('profile')) {
        setActiveTab('academic_profile');
      } else if (!hash || hash === 'student' || hash === 'student/dashboard') {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const [studentUser, setStudentUser] = useState(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [processes, setProcesses] = useState([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
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
      actionId: 'semester_registration',
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
      actionId: 'attendance',
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
      actionId: 'examinations',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
    },
    {
      label: 'View Results',
      actionId: 'results',
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
      actionId: 'gpa_cgpa',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
    {
      label: 'Degree Progress',
      actionId: 'academic_progress',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      ),
    },
    {
      label: 'Find a Faculty Form',
      actionId: 'process_guidance',
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
      actionId: 'semester_registration',
    },
    {
      category: 'Examination',
      status: 'Upcoming',
      statusType: 'upcoming',
      title: 'ESA Examination Entry Submission',
      deadline: 'Deadline: 2026-10-30',
      actionId: 'examinations',
    },
    {
      category: 'Medical',
      status: 'Active',
      statusType: 'active',
      title: 'Medical Certificate Submission Deadline',
      deadline: 'Deadline: Within 7 days of absence',
      actionId: 'medical_requests',
    },
    {
      category: 'Welfare',
      status: 'Open',
      statusType: 'open',
      title: 'Mahapola / Bursary Welfare Renewal',
      deadline: 'Deadline: 2026-11-10',
      actionId: 'welfare_scholarships',
    },
  ];

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="wf-status-badge badge-approved">✓ Approved</span>;
    if (status === 'Declined') return <span className="wf-status-badge badge-declined">✕ Declined</span>;
    if (status === 'Pending HOD') return <span className="wf-status-badge badge-hod">⏳ Pending HOD</span>;
    if (status === 'Pending Dean') return <span className="wf-status-badge badge-dean">⏳ Pending Dean</span>;
    return <span className="wf-status-badge badge-pending">⏳ {status}</span>;
  };

  const handleNavigate = (id) => {
    setActiveTab(id);
    if (typeof window !== 'undefined') {
      if (id === 'dashboard') {
        window.location.hash = '#student';
      } else {
        window.location.hash = `#student/${id}`;
      }
    }
  };

  return (
    <DashboardTemplate
      user={studentUser || user}
      onLogout={onLogout}
      activeItem={
        activeTab === 'examination' ? 'examinations' :
        activeTab === 'processes' ? 'process_guidance' :
        activeTab === 'welfare' ? 'welfare_scholarships' :
        activeTab === 'societies' ? 'societies_clubs' :
        activeTab
      }
      onNavigate={handleNavigate}
    >
      {activeTab === 'academic_profile' ? (
        <AcademicProfile
          user={studentUser || user}
          onProfileUpdate={(updated) => setStudentUser(updated)}
        />
      ) : activeTab === 'semester_registration' ? (
        <SemesterRegistration
          user={studentUser || user}
        />
      ) : activeTab === 'attendance' ? (
        <Attendance
          onNavigateMedical={() => handleNavigate('medical_requests')}
        />
      ) : activeTab === 'medical_requests' ? (
        <MedicalRequests
          user={studentUser || user}
        />
      ) : activeTab === 'examinations' || activeTab === 'examination' ? (
        <StudentExamination
          user={studentUser || user}
        />
      ) : activeTab === 'results' || activeTab === 'result' ? (
        <StudentResults
          user={studentUser || user}
        />
      ) : activeTab === 'gpa_cgpa' || activeTab === 'gpa' ? (
        <StudentGpaCgpa
          user={studentUser || user}
        />
      ) : activeTab === 'academic_progress' || activeTab === 'progress' ? (
        <StudentAcademicProgress
          user={studentUser || user}
        />
      ) : activeTab === 'process_guidance' || activeTab === 'processes' ? (
        <StudentProcessGuidance
          user={studentUser || user}
          onNavigate={handleNavigate}
        />
      ) : activeTab === 'welfare_scholarships' || activeTab === 'welfare' ? (
        <StudentWelfare
          user={studentUser || user}
        />
      ) : activeTab === 'societies_clubs' || activeTab === 'societies' ? (
        <StudentSocieties
          user={studentUser || user}
        />
      ) : (
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
              2. REAL-TIME SUBMITTED PROCESS TRACKER & AUDIT TRAIL
              ========================================================= */}
          <section className="wf-tracking-section">
            <div className="wf-tracking-header">
              <div>
                <h3 className="wf-tracking-title">My Submitted Applications & Tracking</h3>
                <p className="wf-tracking-sub">
                  Live workflow tracking through Lecturer, HOD, and Dean clearance stages with audit logs.
                </p>
              </div>
              <div className="wf-tracking-actions">
                <button
                  type="button"
                  className="wf-new-request-btn"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Submit New Request
                </button>
              </div>
            </div>

            <div className="wf-filter-pills">
              <button
                type="button"
                className={`wf-pill ${processFilter === 'all' ? 'active' : ''}`}
                onClick={() => setProcessFilter('all')}
              >
                All Requests ({processes.length})
              </button>
              <button
                type="button"
                className={`wf-pill ${processFilter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setProcessFilter('in-progress')}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`wf-pill ${processFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setProcessFilter('approved')}
              >
                Approved
              </button>
              <button
                type="button"
                className={`wf-pill ${processFilter === 'declined' ? 'active' : ''}`}
                onClick={() => setProcessFilter('declined')}
              >
                Declined
              </button>
            </div>

            {isLoadingProcesses ? (
              <div className="wf-loading-box">Loading submitted processes...</div>
            ) : filteredProcesses.length === 0 ? (
              <div className="wf-empty-box">
                <p>No applications match the selected filter.</p>
                <button
                  type="button"
                  className="std-suggested-chip"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  + Submit Your First Medical Excuse / CA Repeat
                </button>
              </div>
            ) : (
              <div className="wf-cards-grid">
                {filteredProcesses.map((proc) => {
                  const currentStepIdx = proc.steps?.findIndex((s) => s.status === 'in-progress') ?? 0;
                  return (
                    <div key={proc._id || proc.trackingNumber} className="wf-process-card">
                      <div className="wf-card-top">
                        <span className="wf-tracking-badge">{proc.trackingNumber}</span>
                        {getStatusBadge(proc.status)}
                      </div>

                      <h4 className="wf-card-title">{proc.processTitle}</h4>
                      <p className="wf-card-sub">
                        Submitted: {new Date(proc.createdAt).toLocaleDateString()} • Assigned: <strong style={{ textTransform: 'capitalize' }}>{proc.currentAssignedRole}</strong>
                      </p>

                      {/* Mini visual stage stepper */}
                      <div className="wf-mini-stepper">
                        {proc.steps?.map((step, idx) => {
                          const isDone = step.status === 'completed';
                          const isCurrent = step.status === 'in-progress';
                          const isFailed = step.status === 'declined';

                          return (
                            <div key={step.id || idx} className="wf-mini-step-item">
                              <div
                                className={`wf-mini-dot ${
                                  isDone ? 'dot-done' : isFailed ? 'dot-declined' : isCurrent ? 'dot-current' : 'dot-waiting'
                                }`}
                                title={`${step.role.toUpperCase()}: ${step.status}`}
                              />
                              <span className="wf-mini-label">{step.role}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="wf-card-footer">
                        <button
                          type="button"
                          className="wf-track-btn"
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
              <span className="std-guidance-badge">Student Navigation</span>
              <h2 className="std-guidance-title">What do you need to do?</h2>
              <p className="std-guidance-sub">
                Search standard operational procedures, forms, or select quick actions.
              </p>
            </div>

            <div className="std-search-input-wrap">
              <span className="std-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                className="std-search-input"
                placeholder="Search processes (e.g. submit medical, exam registration, CA repeat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <div className="std-middle-card">
              <div className="std-middle-card-header">
                <div>
                  <h3 className="std-card-heading">Academic Progression Trend</h3>
                  <p className="std-card-sub">Semester-wise GPA and Cumulative GPA growth</p>
                </div>
                <div className="std-legend-row">
                  <div className="std-legend-item">
                    <span className="std-legend-dot dot-sgpa"></span>
                    <span>SGPA</span>
                  </div>
                  <div className="std-legend-item">
                    <span className="std-legend-dot dot-cgpa"></span>
                    <span>CGPA</span>
                  </div>
                </div>
              </div>

              <div className="std-trend-container">
                <div className="std-trend-y-axis">
                  <span>4.0</span>
                  <span>3.0</span>
                  <span>2.0</span>
                  <span>1.0</span>
                  <span>0.0</span>
                </div>
                <div className="std-trend-chart-area">
                  <div className="std-chart-gridlines">
                    <div className="std-gridline"></div>
                    <div className="std-gridline"></div>
                    <div className="std-gridline"></div>
                    <div className="std-gridline"></div>
                    <div className="std-gridline"></div>
                  </div>

                  <svg className="std-chart-svg" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points="50,48 150,40 250,56 350,44 450,40"
                    />
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      points="50,48 150,44 250,46 350,45 450,42"
                    />
                    <circle cx="50" cy="48" r="4.5" fill="#2563eb" />
                    <circle cx="150" cy="40" r="4.5" fill="#2563eb" />
                    <circle cx="250" cy="56" r="4.5" fill="#2563eb" />
                    <circle cx="350" cy="44" r="4.5" fill="#2563eb" />
                    <circle cx="450" cy="40" r="4.5" fill="#2563eb" />
                    <circle cx="50" cy="48" r="4.5" fill="#059669" />
                    <circle cx="150" cy="44" r="4.5" fill="#059669" />
                    <circle cx="250" cy="46" r="4.5" fill="#059669" />
                    <circle cx="350" cy="45" r="4.5" fill="#059669" />
                    <circle cx="450" cy="42" r="4.5" fill="#059669" />
                  </svg>

                  <div className="std-chart-x-labels">
                    <span>Sem 1</span>
                    <span>Sem 2</span>
                    <span>Sem 3</span>
                    <span>Sem 4</span>
                    <span>Sem 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="std-middle-card">
              <h3 className="std-card-heading">Quick Actions</h3>
              <div className="std-actions-list">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="std-action-btn"
                    onClick={() => {
                      if (action.action) {
                        action.action();
                      } else if (action.actionId) {
                        handleNavigate(action.actionId);
                      }
                    }}
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
                    <span className="std-deadline-category">{item.category}</span>
                    <span className={`std-deadline-pill pill-${item.statusType}`}>
                      {item.status}
                    </span>
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
                    onClick={() => {
                      if (item.actionId) {
                        handleNavigate(item.actionId);
                      } else {
                        setIsSubmitModalOpen(true);
                      }
                    }}
                  >
                    View Details / Apply
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

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
          user={studentUser || user}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitSuccess={handleCreateProcess}
        />
      )}
    </DashboardTemplate>
  );
}
