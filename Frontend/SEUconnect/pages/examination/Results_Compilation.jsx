import React, { useMemo, useRef, useState } from "react";
import "./Results_Compilation.css";

/* ==========================================================================
   SAMPLE DATA: RESULTS COMPILATION REGISTRY
   ========================================================================== */

const INITIAL_RESULTS_DATA = [
  {
    id: "RES-2026-001",
    regNo: "22ICT041",
    name: "K.P. Silva",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    totalCredits: 16,
    earnedCredits: 16,
    isRepeat: false,
    boardStatus: "Board Cleared",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 34, esa: 52, total: 86, grade: "A", gp: 4.0 },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 32, esa: 48, total: 80, grade: "A", gp: 4.0 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 30, esa: 45, total: 75, grade: "A-", gp: 3.7 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 36, esa: 50, total: 86, grade: "A", gp: 4.0 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 26, esa: 42, total: 68, grade: "B", gp: 3.0 },
      { code: "IT3062", name: "Information Security", credits: 2, ca: 28, esa: 44, total: 72, grade: "B+", gp: 3.3 },
    ],
    officerNotes: "All CA & ESA marks signed by respective examiners. Ready for Senate publication.",
  },
  {
    id: "RES-2026-002",
    regNo: "22ICT078",
    name: "A.N. Perera",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    totalCredits: 14,
    earnedCredits: 8,
    isRepeat: false,
    boardStatus: "Referred to Board",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 18, esa: 0, total: 18, grade: "E*", gp: 0.0, note: "Barred (<80% Attendance)" },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 28, esa: 38, total: 66, grade: "B", gp: 3.0 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 26, esa: 36, total: 62, grade: "B-", gp: 2.7 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 15, esa: 0, total: 15, grade: "E*", gp: 0.0, note: "Barred (<80% Attendance)" },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 22, esa: 34, total: 56, grade: "C+", gp: 2.3 },
    ],
    officerNotes: "Candidate barred from ESA in IT3012 and IT3042 due to attendance deficiency.",
  },
  {
    id: "RES-2026-003",
    regNo: "21ICT019",
    name: "M.F. Rasheed",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    totalCredits: 16,
    earnedCredits: 16,
    isRepeat: true,
    boardStatus: "Board Cleared",
    subjects: [
      { code: "IT3012", name: "Software Engineering (Repeat)", credits: 3, ca: 28, esa: 46, total: 74, grade: "C", gp: 2.0, note: "Grade capped at C (Repeat)" },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 30, esa: 44, total: 74, grade: "B+", gp: 3.3 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 28, esa: 40, total: 68, grade: "B", gp: 3.0 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 32, esa: 44, total: 76, grade: "A-", gp: 3.7 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 25, esa: 38, total: 63, grade: "B-", gp: 2.7 },
      { code: "IT3062", name: "Information Security", credits: 2, ca: 26, esa: 40, total: 66, grade: "B", gp: 3.0 },
    ],
    officerNotes: "Repeat exam paper IT3012 successfully completed. Capped at Grade C as per Section 4.3.4.",
  },
  {
    id: "RES-2026-004",
    regNo: "22ICT103",
    name: "S. Jayasuriya",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    totalCredits: 14,
    earnedCredits: 14,
    isRepeat: false,
    boardStatus: "Board Cleared",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 33, esa: 51, total: 84, grade: "A", gp: 4.0 },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 35, esa: 53, total: 88, grade: "A", gp: 4.0 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 34, esa: 49, total: 83, grade: "A", gp: 4.0 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 36, esa: 52, total: 88, grade: "A", gp: 4.0 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 28, esa: 46, total: 74, grade: "B+", gp: 3.3 },
    ],
    officerNotes: "Dean's List nomination candidate. Outstanding performance.",
  },
  {
    id: "RES-2026-005",
    regNo: "22ICT056",
    name: "H. Nazeer",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    totalCredits: 16,
    earnedCredits: 13,
    isRepeat: false,
    boardStatus: "Medical Concession",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 30, esa: 45, total: 75, grade: "A-", gp: 3.7 },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 28, esa: 0, total: 28, grade: "MC", gp: 0.0, note: "Medical Concession (Proper Attempt Preserved)" },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 29, esa: 43, total: 72, grade: "B+", gp: 3.3 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 32, esa: 46, total: 78, grade: "A-", gp: 3.7 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 25, esa: 39, total: 64, grade: "B-", gp: 2.7 },
      { code: "IT3062", name: "Information Security", credits: 2, ca: 26, esa: 41, total: 67, grade: "B", gp: 3.0 },
    ],
    officerNotes: "IT3022 marked as Medical Concession (MC) by Senate. Not counted against attempt limit.",
  },
  {
    id: "RES-2026-006",
    regNo: "23ICT012",
    name: "R. Fernando",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 03",
    totalCredits: 14,
    earnedCredits: 14,
    isRepeat: false,
    boardStatus: "Board Cleared",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 37, esa: 54, total: 91, grade: "A+", gp: 4.0 },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 34, esa: 50, total: 84, grade: "A", gp: 4.0 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 33, esa: 48, total: 81, grade: "A", gp: 4.0 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 35, esa: 53, total: 88, grade: "A", gp: 4.0 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 27, esa: 45, total: 72, grade: "B+", gp: 3.3 },
    ],
    officerNotes: "Semester 03 results finalized.",
  },
  {
    id: "RES-2026-007",
    regNo: "20ICT031",
    name: "M.S.M. Safwan",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    totalCredits: 14,
    earnedCredits: 6,
    isRepeat: true,
    boardStatus: "Academic Probation",
    subjects: [
      { code: "IT3012", name: "Software Engineering", credits: 3, ca: 16, esa: 22, total: 38, grade: "D", gp: 1.0 },
      { code: "IT3022", name: "Database Systems", credits: 3, ca: 15, esa: 18, total: 33, grade: "E", gp: 0.0 },
      { code: "IT3032", name: "Computer Networks", credits: 3, ca: 24, esa: 36, total: 60, grade: "B-", gp: 2.7 },
      { code: "IT3042", name: "Web Technologies", credits: 3, ca: 14, esa: 16, total: 30, grade: "E", gp: 0.0 },
      { code: "IT3052", name: "Operating Systems", credits: 2, ca: 18, esa: 26, total: 44, grade: "D+", gp: 1.3 },
    ],
    officerNotes: "SGPA below 1.50. Automatic referral for Academic Probation counselling.",
  },
];

/* ==========================================================================
   CALCULATION HELPERS
   ========================================================================== */

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

function calculateSGPA(subjects) {
  let totalGradePoints = 0;
  let totalValidCredits = 0;

  subjects.forEach((sub) => {
    // Exclude MC (Medical Concession) from SGPA divisor
    if (sub.grade !== "MC") {
      totalGradePoints += sub.credits * sub.gp;
      totalValidCredits += sub.credits;
    }
  });

  if (totalValidCredits === 0) return "0.00";
  return (totalGradePoints / totalValidCredits).toFixed(2);
}

function getAcademicStanding(sgpa) {
  const gpa = parseFloat(sgpa);
  if (gpa >= 2.0) {
    return { status: "Good Standing", badgeClass: "res-badge-green" };
  } else if (gpa >= 1.5) {
    return { status: "Academic Warning", badgeClass: "res-badge-amber" };
  } else {
    return { status: "Academic Probation", badgeClass: "res-badge-red" };
  }
}

const FILTER_LABELS = {
  "Good Standing": "good standing",
  "Academic Warning": "academic warning",
  "Academic Probation": "academic probation",
};

/* =========================================
   MAIN COMPONENT
========================================= */

export default function ResultsCompilation() {
  const [candidates, setCandidates] = useState(INITIAL_RESULTS_DATA);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [standingFilter, setStandingFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const tableRef = useRef(null);

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showBroadSheet, setShowBroadSheet] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Pre-calculate SGPA and Standings
  const compiledData = useMemo(() => {
    return candidates.map((c) => {
      const sgpa = calculateSGPA(c.subjects);
      const standing = getAcademicStanding(sgpa);
      return {
        ...c,
        sgpa,
        standing,
      };
    });
  }, [candidates]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = compiledData.length;
    const goodStanding = compiledData.filter((c) => c.standing.status === "Good Standing").length;
    const warningCount = compiledData.filter((c) => c.standing.status === "Academic Warning").length;
    const probationCount = compiledData.filter((c) => c.standing.status === "Academic Probation").length;
    const passRate = Math.round((goodStanding / total) * 100) || 0;

    return { total, goodStanding, warningCount, probationCount, passRate };
  }, [compiledData]);

  const specCount = new Set(compiledData.map((c) => c.specialization)).size;

  const statCards = [
    {
      label: "Candidates compiled",
      value: stats.total,
      caption: `Across ${specCount} specializations`,
      pill: "Total",
      color: "blue",
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
    {
      label: "Good standing",
      value: stats.goodStanding,
      caption: "Cleared for progression",
      pill: "SGPA 2.0+",
      color: "green",
      filter: "Good Standing",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
    {
      label: "Academic warning",
      value: stats.warningCount,
      caption: "Referral to Academic Advisor",
      pill: "1.5 - 1.99",
      color: "amber",
      filter: "Academic Warning",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </StatIcon>
      ),
    },
    {
      label: "Academic probation",
      value: stats.probationCount,
      caption: "Faculty Board review needed",
      pill: "Below 1.50",
      color: "red",
      filter: "Academic Probation",
      icon: (
        <StatIcon>
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </StatIcon>
      ),
    },
  ];

  // Filtered List
  const filteredCandidates = useMemo(() => {
    return compiledData.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        c.name.toLowerCase().includes(term) ||
        c.regNo.toLowerCase().includes(term) ||
        c.specialization.toLowerCase().includes(term);

      let matchStanding = true;
      if (standingFilter !== "All") matchStanding = c.standing.status === standingFilter;

      const matchSpec = specFilter === "All" || c.specialization === specFilter;
      const matchSem = semFilter === "All" || c.semester === semFilter;

      return matchSearch && matchStanding && matchSpec && matchSem;
    });
  }, [compiledData, searchTerm, standingFilter, specFilter, semFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStandingFilter("All");
    setSpecFilter("All");
    setSemFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = standingFilter === filterValue ? "All" : filterValue;
    setSearchTerm("");
    setSpecFilter("All");
    setSemFilter("All");
    setStandingFilter(next);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="res-page">
      {/* ====================================================================
          1. STATS CARDS (click a card to filter the table)
          ==================================================================== */}
      <section className="res-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && standingFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`res-stat-card res-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="res-stat-head">
                <div className={`res-stat-icon res-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`res-stat-pill res-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="res-stat-body">
                <span className="res-stat-label">{card.label}</span>
                <span className="res-stat-val">{card.value}</span>
                <span className="res-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          2. GUIDANCE BANNER
          ==================================================================== */}
      <section className="res-guidance-card">
        <div>
          <span className="res-guidance-badge">ACADEMIC REGULATIONS COMPLIANCE</span>
          <h4 className="res-guidance-heading">
            Marks BroadSheet &amp; Progression Audit (Faculty Handbook Section 4.6 &amp; 4.7)
          </h4>
          <p className="res-guidance-text">
            End semester final broadsheets compute GPA according to Senate formula. Repeat grades are capped 
            at Grade C (GP 2.00). Candidates with SGPA below 1.50 are referred for Academic Probation. 
            Official results require ratification by the Board of Examiners.
          </p>
        </div>
        <div className="res-guidance-actions">
          <button
            type="button"
            className="res-btn res-btn-outline"
            onClick={() => setShowBroadSheet(true)}
          >
            Board BroadSheet
          </button>
          <button
            type="button"
            className="res-btn res-btn-primary"
            onClick={() => window.print()}
          >
            Export BroadSheet PDF
          </button>
        </div>
      </section>

      {/* ====================================================================
          3. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="res-panel" ref={tableRef}>
        <div className="res-panel-header">
          <div>
            <h3 className="res-panel-title">Results Compilation Registry</h3>
            <p className="res-panel-desc">
              Review module grade breakdowns, verify repeat caps, audit SGPA calculations, and prepare Senate results.
            </p>
          </div>
          <span className="res-table-counter">
            Showing <strong>{filteredCandidates.length}</strong> of {candidates.length} Candidate BroadSheets
          </span>
        </div>

        {/* Shows which card filter is on */}
        {standingFilter !== "All" && FILTER_LABELS[standingFilter] && (
          <p className="res-active-filter">
            Showing only <strong>{FILTER_LABELS[standingFilter]}</strong> candidates ({filteredCandidates.length})
            <button
              type="button"
              className="res-btn res-btn-outline"
              onClick={resetFilters}
            >
              Show all
            </button>
          </p>
        )}

        {/* Filter Toolbar */}
        <div className="res-filter-toolbar">
          <div className="res-search-wrap">
            <svg className="res-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="res-input res-search-input"
              placeholder="Search by student name, reg no (e.g. 22ICT041)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="res-filter-group">
            <select
              className="res-select"
              value={standingFilter}
              onChange={(e) => setStandingFilter(e.target.value)}
            >
              <option value="All">All Academic Standings</option>
              <option value="Good Standing">Good Standing (&ge; 2.00)</option>
              <option value="Academic Warning">Academic Warning (1.50 - 1.99)</option>
              <option value="Academic Probation">Academic Probation (&lt; 1.50)</option>
            </select>

            <select
              className="res-select"
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>

            <select
              className="res-select"
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
            >
              <option value="All">All Semesters</option>
              <option value="Semester 03">Semester 03</option>
              <option value="Semester 05">Semester 05</option>
            </select>

            {(searchTerm || standingFilter !== "All" || specFilter !== "All" || semFilter !== "All") && (
              <button
                type="button"
                className="res-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="res-table-container">
          <table className="res-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Specialization &amp; Sem</th>
                <th>Course Grades Breakdown</th>
                <th>Credits Earned</th>
                <th>Semester GPA</th>
                <th>Academic Standing</th>
                <th className="res-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="res-empty-cell">
                    <p>No results records match the specified filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id}>
                    {/* 1. Candidate Details */}
                    <td>
                      <div className="res-student-meta">
                        <span className="res-student-avatar">
                          {c.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <div className="res-student-name">{c.name}</div>
                          <div className="res-student-reg">
                            {c.regNo} {c.isRepeat && <span className="res-repeat-tag">· Repeat</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Specialization */}
                    <td>
                      <div className="res-spec-title">{c.specialization}</div>
                      <div className="res-spec-sub">{c.semester}</div>
                    </td>

                    {/* 3. Grades Chips */}
                    <td>
                      <div className="res-grade-chip-list">
                        {c.subjects.map((sub) => {
                          const isFail = sub.grade.includes("E") || sub.grade === "F";
                          const isMed = sub.grade === "MC";
                          return (
                            <span
                              key={sub.code}
                              className={`res-grade-chip ${
                                isFail
                                  ? "chip-fail"
                                  : isMed
                                  ? "chip-med"
                                  : sub.grade.startsWith("A")
                                  ? "chip-a"
                                  : "chip-pass"
                              }`}
                              title={`${sub.code}: ${sub.name} (CA: ${sub.ca}, ESA: ${sub.esa})`}
                            >
                              <strong>{sub.code}:</strong> {sub.grade}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* 4. Credits */}
                    <td>
                      <span className="res-credits-val">
                        <strong>{c.earnedCredits}</strong> / {c.totalCredits}
                      </span>
                    </td>

                    {/* 5. SGPA */}
                    <td>
                      <div className="res-gpa-badge">
                        <span className="res-gpa-num">{c.sgpa}</span>
                      </div>
                    </td>

                    {/* 6. Academic Standing */}
                    <td>
                      <span className={`res-status-badge ${c.standing.badgeClass}`}>
                        {c.standing.status}
                      </span>
                      <div className="res-board-hint">{c.boardStatus}</div>
                    </td>

                    {/* 7. Action Button */}
                    <td>
                      <button
                        type="button"
                        className="res-action-btn res-btn-inspect"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        View Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          4. CANDIDATE DETAILED TRANSCRIPT & AUDIT MODAL
          ==================================================================== */}
      {selectedCandidate && (
        <div className="res-modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="res-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-header">
              <div>
                <span className="res-modal-tag">SEMESTER GRADE REPORT &amp; AUDIT</span>
                <h2 className="res-modal-title">{selectedCandidate.name} ({selectedCandidate.regNo})</h2>
                <span className="res-modal-subtitle">
                  {selectedCandidate.programme} · {selectedCandidate.specialization} · {selectedCandidate.semester}
                </span>
              </div>
              <button
                type="button"
                className="res-close-btn"
                onClick={() => setSelectedCandidate(null)}
              >
                &times;
              </button>
            </div>

            <div className="res-modal-body">
              {/* Info Grid */}
              <div className="res-info-banner">
                <div className="res-info-item">
                  <span className="res-info-lbl">Semester GPA (SGPA)</span>
                  <span className="res-info-val res-text-blue">{selectedCandidate.sgpa}</span>
                </div>
                <div className="res-info-item">
                  <span className="res-info-lbl">Academic Standing</span>
                  <span className="res-info-val">{selectedCandidate.standing.status}</span>
                </div>
                <div className="res-info-item">
                  <span className="res-info-lbl">Credits Completed</span>
                  <span className="res-info-val">{selectedCandidate.earnedCredits} of {selectedCandidate.totalCredits} Credits</span>
                </div>
                <div className="res-info-item">
                  <span className="res-info-lbl">Board Approval Status</span>
                  <span className="res-info-val">{selectedCandidate.boardStatus}</span>
                </div>
              </div>

              {/* Module Marks Breakdown Table */}
              <h4 className="res-section-title">Continuous &amp; End Semester Assessment Audit</h4>
              <div className="res-modal-table-wrap">
                <table className="res-table res-detail-table">
                  <thead>
                    <tr>
                      <th>Module Code &amp; Title</th>
                      <th>Credits</th>
                      <th>CA Mark (40%)</th>
                      <th>ESA Mark (60%)</th>
                      <th>Total (100)</th>
                      <th>Final Grade</th>
                      <th>Grade Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCandidate.subjects.map((s) => (
                      <tr key={s.code}>
                        <td>
                          <strong>{s.code}</strong> — {s.name}
                          {s.note && <div className="res-mod-note">{s.note}</div>}
                        </td>
                        <td>{s.credits}</td>
                        <td>{s.ca} / 40</td>
                        <td>{s.esa} / 60</td>
                        <td><strong>{s.total}</strong></td>
                        <td>
                          <span className={`res-grade-pill ${s.grade.startsWith("A") ? "res-g-a" : s.grade.startsWith("E") ? "res-g-e" : "res-g-pass"}`}>
                            {s.grade}
                          </span>
                        </td>
                        <td>{s.gp.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="res-advisory-box">
                <strong>Examination Officer Note:</strong> {selectedCandidate.officerNotes}
              </div>
            </div>

            <div className="res-modal-footer">
              <button
                type="button"
                className="res-btn res-btn-outline"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="res-btn res-btn-primary"
                onClick={() => window.print()}
              >
                Print Student Grade Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. BOARD OF EXAMINERS MASTER BROADSHEET MODAL
          ==================================================================== */}
      {showBroadSheet && (
        <div className="res-modal-overlay" onClick={() => setShowBroadSheet(false)}>
          <div className="res-modal-card res-broadsheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-header res-no-print">
              <div>
                <span className="res-modal-tag">BOARD OF EXAMINERS CONFIDENTIAL DOCUMENT</span>
                <h2 className="res-modal-title">Master Results BroadSheet</h2>
                <span className="res-modal-subtitle">
                  Faculty of Technology · Academic Session 2025/2026 · Semester 05 Assessments
                </span>
              </div>
              <button
                type="button"
                className="res-close-btn"
                onClick={() => setShowBroadSheet(false)}
              >
                &times;
              </button>
            </div>

            {/* Printable BroadSheet Letter */}
            <div className="res-print-letter">
              <div className="res-letter-head">
                <div className="res-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
                <div className="res-uni-sub">FACULTY OF TECHNOLOGY · EXAMINATION UNIT</div>
                <div className="res-letter-meta">CONFIDENTIAL BROADSHEET SUBMITTED TO THE BOARD OF EXAMINERS</div>
              </div>

              <div className="res-letter-divider" />

              <div className="res-broadsheet-meta-row">
                <span><strong>Session:</strong> 2025/2026</span>
                <span><strong>Programme:</strong> BICT (Hons)</span>
                <span><strong>Semester:</strong> Semester 05</span>
                <span><strong>Date of Board:</strong> 26 October 2026</span>
              </div>

              <table className="res-letter-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Candidate Name</th>
                    <th>Specialization</th>
                    <th>Earned / Total Cr</th>
                    <th>Semester GPA</th>
                    <th>Academic Standing</th>
                  </tr>
                </thead>
                <tbody>
                  {compiledData.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.regNo}</strong></td>
                      <td>{c.name}</td>
                      <td>{c.specialization}</td>
                      <td>{c.earnedCredits} / {c.totalCredits}</td>
                      <td><strong>{c.sgpa}</strong></td>
                      <td>{c.standing.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="res-letter-sign-row">
                <div className="res-sign-box">
                  <div className="res-sign-line" />
                  <strong>Examination Officer</strong><br />
                  Faculty of Technology
                </div>
                <div className="res-sign-box">
                  <div className="res-sign-line" />
                  <strong>Head of the Department</strong><br />
                  Dept. of Information &amp; Comm. Technology
                </div>
                <div className="res-sign-box">
                  <div className="res-sign-line" />
                  <strong>Dean of the Faculty</strong><br />
                  Chairman, Board of Examiners
                </div>
              </div>
            </div>

            <div className="res-modal-footer res-no-print">
              <button
                type="button"
                className="res-btn res-btn-outline"
                onClick={() => setShowBroadSheet(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="res-btn res-btn-primary"
                onClick={() => window.print()}
              >
                Print Official BroadSheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="res-toast">{toastMessage}</div>}
    </div>
  );
}
