import React, { useState } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import './student.css';

export default function Student({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestedChips = [
    'CA Repeat Form',
    'Medical Excuse for Lectures',
    "People's Bank PIV Voucher",
    'Add / Drop Modules'
  ];

  const quickActions = [
    {
      label: 'Register Subjects',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      label: 'Check Attendance',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="m9 14 2 2 4-4"/>
        </svg>
      )
    },
    {
      label: 'Exam Registration',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      )
    },
    {
      label: 'View Results',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      label: 'Submit Medical Request',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )
    },
    {
      label: 'Calculate GPA Report',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      )
    },
    {
      label: 'Degree Progress',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      )
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
      )
    }
  ];

  const deadlines = [
    {
      category: 'Registration',
      status: 'Open',
      statusType: 'open',
      title: 'Semester Subject Registration (Add/Drop)',
      deadline: 'Deadline: 2026-10-15'
    },
    {
      category: 'Examination',
      status: 'Upcoming',
      statusType: 'upcoming',
      title: 'ESA Examination Entry Submission',
      deadline: 'Deadline: 2026-10-30'
    },
    {
      category: 'Medical',
      status: 'Active',
      statusType: 'active',
      title: 'Medical Certificate Submission Deadline',
      deadline: 'Deadline: Within 7 days of absence'
    },
    {
      category: 'Welfare',
      status: 'Open',
      statusType: 'open',
      title: 'Mahapola / Bursary Welfare Renewal',
      deadline: 'Deadline: 2026-11-10'
    }
  ];

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem="dashboard">
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
            2. "WHAT DO YOU NEED TO DO?" GUIDANCE CARD
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
            <button type="button" className="std-find-process-btn">
              Find Process
            </button>
          </div>

          <div className="std-suggested-row">
            <span className="std-suggested-label">Suggested:</span>
            {suggestedChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="std-suggested-chip"
                onClick={() => setSearchQuery(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================
            3. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS
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
                <button key={idx} type="button" className="std-action-btn">
                  <span className="std-action-icon">{action.icon}</span>
                  <span className="std-action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. UPCOMING INSTITUTIONAL DEADLINES
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
                <button type="button" className="std-view-details-btn">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </DashboardTemplate>
  );
}

