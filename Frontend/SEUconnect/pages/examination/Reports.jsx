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

// Stat cards (edit the value, pill, caption and colour here)
// colour can be: blue, green, amber, purple, red
// Keep captions short (about 30 characters) so they stay on one line
const STAT_CARDS = [
  {
    label: "Faculty compliance",
    value: "87.4%",
    caption: "Overall 80%+ attendance rate",
    pill: "Attendance",
    color: "blue",
    filter: "Attendance",
    icon: (
      <StatIcon>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </StatIcon>
    ),
  },
  {
    label: "Pass rate",
    value: "91.2%",
    caption: "Semester 03 & 05 assessments",
    pill: "SGPA 2.0+",
    color: "green",
    filter: "BroadSheet",
    icon: (
      <StatIcon>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </StatIcon>
    ),
  },
  {
    label: "Repeat load",
    value: "6",
    caption: "Repeat entries this semester",
    pill: "Repeat",
    color: "amber",
    filter: "Repeat",
    icon: (
      <StatIcon>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </StatIcon>
    ),
  },
  {
    label: "Active reports",
    value: "4",
    caption: "For Faculty Board & Senate",
    pill: "Ready",
    color: "purple",
    filter: "All",
    icon: (
      <StatIcon>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </StatIcon>
    ),
  },
];

const FILTER_LABELS = {
  All: "All Reports",
  Attendance: "Attendance Compliance Report",
  BroadSheet: "Board of Examiners BroadSheet",
  Repeat: "Repeat Candidate Summary",
  Offences: "Examination Offences Summary",
};

// The report catalogue
const REPORTS = [
  {
    id: "rep-attendance",
    category: "Attendance",
    title: "Attendance Compliance Report (Sec. 4.2.3)",
    text: "Full breakdown of student attendance percentages per course module, flagging barred candidates.",
  },
  {
    id: "rep-broadsheet",
    category: "BroadSheet",
    title: "Board of Examiners BroadSheet (Sec. 4.6)",
    text: "Official master grade broadsheet containing CA, ESA, final grades, and SGPA computations.",
  },
  {
    id: "rep-repeat",
    category: "Repeat",
    title: "Repeat Candidate & Capping Summary (Sec. 4.3.4)",
    text: "Schedule of 2nd, 3rd, and 4th attempt candidates with Grade C capping and fee clearance status.",
  },
  {
    id: "rep-offences",
    category: "Offences",
    title: "Examination Offences Summary (Sec. 8.1.2)",
    text: "Confidential log of hall malpractices, confiscated evidence, and Senate disciplinary decisions.",
  },
];

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const tableRef = useRef(null);

  const handleCardClick = (cardFilter) => {
    if (activeFilter === cardFilter && cardFilter !== "All") {
      setActiveFilter("All");
    } else {
      setActiveFilter(cardFilter);
      setSearch("");
    }
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearch("");
  };

  const filteredReports = useMemo(() => {
    return REPORTS.filter((report) => {
      if (activeFilter !== "All" && report.category !== activeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          report.title.toLowerCase().includes(q) ||
          report.text.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [activeFilter, search]);

  return (
    <div className="adm-page">
      {/* 1. STATS CARDS (icon on the left, pill on the right) */}
      <section className="adm-stats-grid">
        {STAT_CARDS.map((card) => {
          const isActive =
            activeFilter === card.filter ||
            (card.filter === "All" && activeFilter === "All");
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

      {/* 2. REPORT CATALOGUE */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Official Examination &amp; Faculty Reports</h3>
            <p className="adm-panel-sub">Generate and download official reports for Dean and Senate meetings</p>
          </div>

          <div className="adm-filter-group">
            <input
              type="text"
              placeholder="Search reports..."
              className="adm-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search reports"
            />
            <select
              className="adm-input"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label="Filter report category"
            >
              <option value="All">All Categories</option>
              <option value="Attendance">Attendance Compliance</option>
              <option value="BroadSheet">Master BroadSheet</option>
              <option value="Repeat">Repeat Summary</option>
              <option value="Offences">Examination Offences</option>
            </select>
            {(activeFilter !== "All" || search) && (
              <button
                type="button"
                className="adm-btn-outline-sm"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {activeFilter !== "All" && (
          <div className="adm-active-filter">
            <span>
              Showing: <strong>{FILTER_LABELS[activeFilter] || activeFilter}</strong> ({filteredReports.length} report{filteredReports.length === 1 ? "" : "s"})
            </span>
            <button type="button" className="adm-btn-clear" onClick={resetFilters}>
              Show all
            </button>
          </div>
        )}

        <div className="rep-grid">
          {filteredReports.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--adm-muted)", gridColumn: "1 / -1" }}>
              No reports match your current filter criteria.
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.title} className="rep-card">
                <h4>{report.title}</h4>
                <p>{report.text}</p>
                <button type="button" className="adm-btn adm-btn-primary" onClick={() => window.print()}>
                  Print / Export PDF
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
