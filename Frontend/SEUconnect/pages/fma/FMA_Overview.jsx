import React from 'react';

export default function FMA_Overview({ stats, onNavigate, onOpenDetail }) {
  const statCards = [
    {
      label: 'Subject Registrations',
      value: stats.pendingSubjectReg,
      caption: 'Awaiting Dean Office audit',
      pill: 'Pending',
      color: 'amber',
      target: 'subject_reg',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      label: 'Record Books & PIVs',
      value: stats.pendingRecordBooks,
      caption: 'Bank voucher verification',
      pill: 'Action Required',
      color: 'blue',
      target: 'record_renewal',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="7" y1="3" x2="7" y2="21" />
          <circle cx="14" cy="9" r="2" />
          <line x1="11" y1="15" x2="17" y2="15" />
        </svg>
      )
    },
    {
      label: 'Student Leave Notices',
      value: stats.pendingLeave,
      caption: '48h notifications & medicals',
      pill: 'Urgent',
      color: 'red',
      target: 'student_leave',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      label: 'Clearance & Letters',
      value: stats.pendingClearance,
      caption: 'Bonafide & medium certificates',
      pill: 'Processing',
      color: 'green',
      target: 'clearance',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    }
  ];

  return (
    <div className="fma-page">
      {/* 1. Handbook Context Header */}
      <div className="fma-handbook-card">
        <div>
          <span className="fma-handbook-tag">Undergraduate Handbook • Section 2.3 &amp; Section 7</span>
          <h2 className="fma-handbook-title">Office of the Dean — Faculty Management Assistant Desk</h2>
          <p className="fma-handbook-desc">
            Executive administrative workflow for student enrolment, semester subject registrations (Handbook §7.2),
            Student Record Books &amp; Identity Cards (§7.5), annual renewal fee verification (§7.6), and academic leave processing (§7.4).
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <button
            type="button"
            className="fma-btn fma-btn-outline"
            style={{ color: '#0f172a', background: '#fff' }}
            onClick={() => onNavigate('subject_reg')}
          >
            Review Enrolments →
          </button>
        </div>
      </div>

      {/* 2. Clickable Stats Grid */}
      <section className="fma-stats-grid">
        {statCards.map((card) => (
          <button
            type="button"
            key={card.label}
            className="fma-stat-card"
            onClick={() => onNavigate(card.target)}
          >
            <div className="fma-stat-head">
              <div className={`fma-stat-icon fma-icon-${card.color}`}>
                {card.icon}
              </div>
              <span className={`fma-stat-pill fma-pill-${card.color}`}>
                {card.pill}
              </span>
            </div>
            <div className="fma-stat-body">
              <span className="fma-stat-label">{card.label}</span>
              <span className="fma-stat-val">{card.value}</span>
              <span className="fma-stat-sub">{card.caption}</span>
            </div>
          </button>
        ))}
      </section>

      {/* 3. Quick Functional Navigation Hub */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Faculty Administrative Operations</h3>
            <p className="fma-panel-sub">Select an official workflow governed by the South Eastern University Undergraduate Handbook</p>
          </div>
        </div>

        <div className="fma-quick-grid">
          <div className="fma-quick-card" onClick={() => onNavigate('subject_reg')}>
            <div className="fma-quick-icon fma-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="fma-quick-name">Subject Registration &amp; Add/Drop</div>
            <div className="fma-quick-desc">Handbook §7.2: Verify 2-week semester course forms, HOD signatures, and Add/Drop amendments.</div>
          </div>

          <div className="fma-quick-card" onClick={() => onNavigate('record_renewal')}>
            <div className="fma-quick-icon fma-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <line x1="15" y1="8" x2="17" y2="8" />
                <line x1="15" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="17" y2="16" />
              </svg>
            </div>
            <div className="fma-quick-name">Record Books &amp; Renewal PIVs</div>
            <div className="fma-quick-desc">Handbook §7.5 &amp; §7.6: Official Record Book issuance, seal embossing, and Bank PIV slips verification.</div>
          </div>

          <div className="fma-quick-card" onClick={() => onNavigate('student_leave')}>
            <div className="fma-quick-icon fma-icon-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="fma-quick-name">Leave of Absence Management</div>
            <div className="fma-quick-desc">Handbook §7.4 &amp; §4.2.4: 48h sick notices, 15-day short leave, long leave &amp; 8-week absence rule.</div>
          </div>

          <div className="fma-quick-card" onClick={() => onNavigate('training')}>
            <div className="fma-quick-icon fma-icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="fma-quick-name">Industrial Training Daily Diaries</div>
            <div className="fma-quick-desc">Handbook §3.8.4 &amp; §3.9.3: Issue continuous training record books, verify company mentors &amp; supervisors.</div>
          </div>

          <div className="fma-quick-card" onClick={() => onNavigate('streaming')}>
            <div className="fma-quick-icon fma-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="fma-quick-name">Specialization Streaming</div>
            <div className="fma-quick-desc">Handbook §3.8.6 &amp; §3.9.5: BBST &amp; BICT majoring allocation (CGPA ≥ 2.0 prerequisite check &amp; transfers).</div>
          </div>

          <div className="fma-quick-card" onClick={() => onNavigate('clearance')}>
            <div className="fma-quick-icon fma-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="fma-quick-name">Certificates &amp; Clearance Letters</div>
            <div className="fma-quick-desc">Handbook §7.8: Issue Bonafide certificates, English Medium confirmations (§3.4), and semester clearances.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

