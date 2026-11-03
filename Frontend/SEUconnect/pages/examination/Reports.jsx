import React, { useState, useMemo, useRef } from "react";
import "./Reports.css";

// Icon wrapper for the stat cards
const StatIcon = ({ children }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const REPORTS_DATA = [
  {
    id: "rep-1",
    title: "Master Examination BroadSheet",
    cat: "BroadSheet",
    pill: "BroadSheet",
    color: "blue",
    text: "Complete module-by-module marks breakdown, SGPA, CGPA calculations and Dean's list recommendations for Senate approval.",
    generated: "Today, 10:30 AM",
    recipients: "Dean & Senate Board",
  },
  {
    id: "rep-2",
    title: "Repeat Examination Summary & Caps",
    cat: "Repeat",
    pill: "Repeat Registry",
    color: "amber",
    text: "Details of candidates re-sitting modules, attempt count tracker, and enforcement of Grade C ceiling caps per Section 4.3.4.",
    generated: "Yesterday",
    recipients: "Exam Department",
  },
  {
    id: "rep-3",
    title: "Attendance Compliance & Debarment Dossier",
    cat: "Attendance",
    pill: "Attendance (80%)",
    color: "red",
    text: "List of candidates barred from End Semester Assessments (ESA) due to attendance deficiency below the statutory 80% threshold.",
    generated: "Oct 30, 2026",
    recipients: "Heads of Department",
  },
  {
    id: "rep-4",
    title: "Medical Concession (MC) Log",
    cat: "Attendance",
    pill: "Medical (MC)",
    color: "green",
    text: "Approved university medical officer submissions preserving first-attempt privileges without academic grade penalty.",
    generated: "Oct 28, 2026",
    recipients: "Chief Medical Officer",
  },
  {
    id: "rep-5",
    title: "Examination Malpractices & Senate Inquiries",
    cat: "Offences",
    pill: "Disciplinary",
    color: "red",
    text: "Registry of confiscated evidence, invigilator reports, and Senate Disciplinary Committee referral dossiers.",
    generated: "Oct 29, 2026",
    recipients: "EOC Disciplinary Panel",
  },
  {
    id: "rep-6",
    title: "Special Needs Examination Accommodations",
    cat: "Accommodations",
    pill: "Accommodations",
    color: "purple",
    text: "Special sitting arrangements, amanuensis allocations, extra-time provisions, and ground-floor venue logistics.",
    generated: "Oct 26, 2026",
    recipients: "Chief Invigilators",
  },
  {
    id: "rep-7",
    title: "Hall Allocation & Venue Utilization Summary",
    cat: "Logistics",
    pill: "Venue Quota",
    color: "blue",
    text: "Desk utilization metrics, hall capacity saturation audits, and examination material distribution registers.",
    generated: "Oct 31, 2026",
    recipients: "Exam Support Staff",
  },
  {
    id: "rep-8",
    title: "Invigilator Duty Attendance Audit",
    cat: "Logistics",
    pill: "Staff Duty",
    color: "green",
    text: "Staff attendance sign-in logs, emergency relief invigilator callouts, and academic duty allocation verifications.",
    generated: "Nov 01, 2026",
    recipients: "Faculty Board",
  },
];

const FILTER_LABELS = {
  All: "All Official Reports",
  Attendance: "Attendance & Concessions",
  BroadSheet: "Master BroadSheets",
  Repeat: "Repeat Cohort Summaries",
  Offences: "Disciplinary Inquiries",
};

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const totalReports = REPORTS_DATA.length;
    const broadsheetCount = REPORTS_DATA.filter((r) => r.cat === "BroadSheet").length;
    const attendanceCount = REPORTS_DATA.filter((r) => r.cat === "Attendance").length;
    const disciplinaryCount = REPORTS_DATA.filter((r) => r.cat === "Offences").length;

    return { totalReports, broadsheetCount, attendanceCount, disciplinaryCount };
  }, []);

  const statCards = [
    {
      label: "Official Reports",
      value: stats.totalReports,
      caption: "Certified Senate dossiers",
      pill: "Published",
      color: "blue",
      filter: "All",
      icon: (
        <StatIcon>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </StatIcon>
      ),
    },
    {
      label: "Senate BroadSheets",
      value: stats.broadsheetCount,
      caption: "Finalized result broadsheets",
      pill: "BroadSheet",
      color: "purple",
      filter: "BroadSheet",
      icon: (
        <StatIcon>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </StatIcon>
      ),
    },
    {
      label: "Attendance Audits",
      value: stats.attendanceCount,
      caption: "80% threshold & MC concessions",
      pill: "Attendance",
      color: "amber",
      filter: "Attendance",
      icon: (
        <StatIcon>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </StatIcon>
      ),
    },
    {
      label: "Disciplinary Dossiers",
      value: stats.disciplinaryCount,
      caption: "Confiscated evidence records",
      pill: "Inquiries",
      color: "red",
      filter: "Offences",
      icon: (
        <StatIcon>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </StatIcon>
      ),
    },
  ];

  const handleCardClick = (filterValue) => {
    const next = activeFilter === filterValue ? "All" : filterValue;
    setActiveFilter(next);
    setSearch("");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearch("");
  };

  const filteredReports = useMemo(() => {
    return REPORTS_DATA.filter((r) => {
      const matchFilter = activeFilter === "All" || r.cat === activeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.pill.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [activeFilter, search]);

  return (
    <div className="adm-page">
      {/* 1. STATS CARDS */}
      <section className="adm-stats-grid">
        {statCards.map((card) => {
          const isActive = card.filter !== "All" && activeFilter === card.filter;
          return (
            <button
              type="button"
              key={card.label}
              className={`adm-stat-card adm-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="adm-stat-head">
                <div className={`adm-stat-icon adm-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`adm-stat-pill adm-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>
              <div className="adm-stat-body">
                <span className="adm-stat-label">{card.label}</span>
                <span className="adm-stat-val">{card.value}</span>
                <span className="adm-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* 2. REPORT CATALOGUE PANEL */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Official Examination &amp; Faculty Reports</h3>
            <p className="adm-panel-sub">
              Generate and download verified reports for Dean, Faculty Board, and Senate meetings
            </p>
          </div>
          <div className="adm-header-actions">
            <button
              type="button"
              className="adm-btn adm-btn-outline"
              onClick={() => window.print()}
            >
              Print All Reports
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() => window.print()}
            >
              + Export Summary Dossier
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {activeFilter !== "All" && (
          <div className="adm-active-filter">
            <span>
              Showing only: <strong>{FILTER_LABELS[activeFilter] || activeFilter}</strong> ({filteredReports.length})
            </span>
            <button
              type="button"
              className="adm-btn-clear"
              onClick={resetFilters}
            >
              Show all
            </button>
          </div>
        )}

        {/* Horizontal Filter Toolbar */}
        <div className="adm-filter-toolbar">
          <div className="adm-search-wrap">
            <svg
              className="adm-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search reports by title, category, or summary..."
              className="adm-input adm-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="adm-filter-group">
            <select
              className="adm-select"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Attendance">Attendance &amp; Compliance</option>
              <option value="BroadSheet">Master BroadSheet</option>
              <option value="Repeat">Repeat Summary</option>
              <option value="Offences">Examination Offences</option>
              <option value="Accommodations">Accommodations</option>
              <option value="Logistics">Venue &amp; Logistics</option>
            </select>
            {(activeFilter !== "All" || search) && (
              <button
                type="button"
                className="adm-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="rep-grid">
          {filteredReports.length === 0 ? (
            <div style={{ padding: "36px", textAlign: "center", color: "var(--adm-muted)", gridColumn: "1 / -1" }}>
              No official reports match your current filter criteria.
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="rep-card">
                <div className="rep-card-header">
                  <div className="rep-card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <span className={`adm-badge badge-${report.color}`}>
                    {report.pill}
                  </span>
                </div>

                <div className="rep-card-body">
                  <h4>{report.title}</h4>
                  <p>{report.text}</p>
                </div>

                <div className="rep-card-footer">
                  <span className="rep-card-meta">
                    Target: <strong>{report.recipients}</strong>
                  </span>
                  <button
                    type="button"
                    className="adm-btn adm-btn-outline"
                    onClick={() => setSelectedReport(report)}
                  >
                    View / Print PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RICH REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div className="adm-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-tag">OFFICIAL EXAMINATION DOSSIER</span>
                <h2 className="adm-modal-title">{selectedReport.title}</h2>
                <div className="adm-modal-subtitle">
                  Generated {selectedReport.generated} · Authorized for {selectedReport.recipients}
                </div>
              </div>
              <button
                type="button"
                className="adm-close-btn"
                onClick={() => setSelectedReport(null)}
              >
                &times;
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-info-banner">
                <div className="adm-info-item">
                  <span className="adm-info-lbl">Report Dossier ID</span>
                  <span className="adm-info-val">{selectedReport.id.toUpperCase()}</span>
                </div>
                <div className="adm-info-item">
                  <span className="adm-info-lbl">Category Classification</span>
                  <span className="adm-info-val">{selectedReport.pill}</span>
                </div>
                <div className="adm-info-item">
                  <span className="adm-info-lbl">Target Audience</span>
                  <span className="adm-info-val">{selectedReport.recipients}</span>
                </div>
                <div className="adm-info-item">
                  <span className="adm-info-lbl">Certification Status</span>
                  <span className="adm-info-val">Verified by Exam Branch</span>
                </div>
              </div>

              <div>
                <label><strong>Executive Summary &amp; Scope:</strong></label>
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--adm-text)", lineHeight: 1.6 }}>
                  {selectedReport.text}
                </p>
              </div>

              <div className="adm-advisory-box">
                <strong>Senate Statutory Notice:</strong> This document constitutes an official university record. Any modifications or distribution beyond authorized statutory boards is prohibited under Faculty By-laws.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => window.print()}
              >
                Print Official Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
