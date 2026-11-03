import React, { useMemo, useRef, useState } from "react";
import "./Examination_Offences.css";

/* ==========================================================================
   SAMPLE DATA: EXAMINATION OFFENCES REGISTRY
   ========================================================================== */

const INITIAL_OFFENCES = [
  {
    id: "OFF-2026-001",
    caseNumber: "EOC/2026/FT/01",
    regNo: "22ICT078",
    name: "A.N. Perera",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    paperCode: "IT3022",
    paperName: "Database Systems",
    hall: "Hall A (Desk 42)",
    examDate: "2026-10-12",
    reportingInvigilator: "Dr. K. Cassim (Senior Lecturer)",
    offenceType: "Possession of Unauthorized Material",
    evidence: "2 handwritten paper chits concealed inside pencil pouch containing SQL queries.",
    status: "Under EOC Inquiry",
    senatePunishment: "Pending Committee Recommendation",
    officerNotes: "Candidate admitted possession on the spot. Confiscated material signed by candidate and Chief Invigilator. Forwarded to SAR Examinations.",
  },
  {
    id: "OFF-2026-002",
    caseNumber: "EOC/2026/FT/02",
    regNo: "21ICT089",
    name: "M.A. Akram",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    paperCode: "IT3032",
    paperName: "Computer Networks",
    hall: "Hall B (Desk 18)",
    examDate: "2026-10-14",
    reportingInvigilator: "Eng. M. Faleel (Lecturer)",
    offenceType: "Possession of Mobile Phone / Electronic Device",
    evidence: "Samsung smartphone switched on in silent mode found in candidate's pocket during toilet break.",
    status: "Senate Confirmed - Debarred",
    senatePunishment: "Cancellation of Paper & Suspended for 1 Academic Year",
    officerNotes: "Senate Meeting #288 ratified 1-year suspension under Section 8.1.2. Formal notification letter dispatched to candidate and parents.",
  },
  {
    id: "OFF-2026-003",
    caseNumber: "EOC/2026/FT/03",
    regNo: "23ICT027",
    name: "T. Kumar",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 03",
    paperCode: "IT3012",
    paperName: "Software Engineering",
    hall: "Hall C (Desk 09)",
    examDate: "2026-10-16",
    reportingInvigilator: "Dr. A. Ilmudeen (Senior Lecturer)",
    offenceType: "Copying / Collusion with Another Candidate",
    evidence: "Exchanging rough working answer sheets with candidate 23ICT031 during exam.",
    status: "Under EOC Inquiry",
    senatePunishment: "Awaiting Committee Inquiry",
    officerNotes: "Both answer sheets seized and marked with invigilator red ink signatures. Committee hearing scheduled for Oct 28.",
  },
  {
    id: "OFF-2026-004",
    caseNumber: "EOC/2026/FT/04",
    regNo: "20ICT031",
    name: "M.S.M. Safwan",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    paperCode: "IT3052",
    paperName: "Operating Systems",
    hall: "Hall A (Desk 02)",
    examDate: "2026-10-19",
    reportingInvigilator: "Prof. S. Riyas (Chief Invigilator)",
    offenceType: "Disorderly Conduct & Insubordination",
    evidence: "Refused to surrender paper at final bell; verbally challenged hall supervisor.",
    status: "Case Dismissed (Warning Issued)",
    senatePunishment: "Severe Written Reprimand (No Academic Penalty)",
    officerNotes: "Inquiry found candidate had misunderstanding regarding extra-time bell. Written warning recorded in personal dossier.",
  },
];

/* ==========================================================================
   HELPERS
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

const FILTER_LABELS = {
  Inquiry: "under EOC inquiry",
  Debarred: "debarred / suspended",
  Resolved: "cases resolved",
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function ExaminationOffences() {
  const [offences, setOffences] = useState(INITIAL_OFFENCES);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const tableRef = useRef(null);

  // Modals
  const [selectedOffence, setSelectedOffence] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit State
  const [tempStatus, setTempStatus] = useState("");
  const [tempPunishment, setTempPunishment] = useState("");
  const [tempNotes, setTempNotes] = useState("");

  // New Offence Form State
  const [newOffence, setNewOffence] = useState({
    regNo: "",
    name: "",
    specialization: "Software Systems",
    semester: "Semester 05",
    paperCode: "IT3012 - Software Engineering",
    hall: "Hall A",
    examDate: new Date().toISOString().split("T")[0],
    reportingInvigilator: "",
    offenceType: "Possession of Unauthorized Material",
    evidence: "",
    officerNotes: "",
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  /* ---------- Statistics Calculation ---------- */
  const stats = useMemo(() => {
    const total = offences.length;
    const underInquiry = offences.filter((o) => o.status === "Under EOC Inquiry").length;
    const debarredCount = offences.filter((o) => o.status.includes("Debarred")).length;
    const resolvedCount = offences.filter((o) => o.status.includes("Dismissed") || o.status.includes("Confirmed")).length;

    return { total, underInquiry, debarredCount, resolvedCount };
  }, [offences]);

  // Stat cards
  const statCards = [
    {
      label: "Offences logged",
      value: stats.total,
      caption: "Across all examination halls",
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
      label: "Under EOC inquiry",
      value: stats.underInquiry,
      caption: "Referred to SAR Examinations",
      pill: "Inquiry",
      color: "amber",
      filter: "Inquiry",
      icon: (
        <StatIcon>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </StatIcon>
      ),
    },
    {
      label: "Suspensions & debarments",
      value: stats.debarredCount,
      caption: "Results cancelled & suspended",
      pill: "Debarred",
      color: "red",
      filter: "Debarred",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </StatIcon>
      ),
    },
    {
      label: "Cases resolved",
      value: stats.resolvedCount,
      caption: "Senate memos dispatched",
      pill: "Resolved",
      color: "green",
      filter: "Resolved",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
  ];

  /* ---------- Filtered Records ---------- */
  const filteredOffences = useMemo(() => {
    return offences.filter((o) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        o.name.toLowerCase().includes(term) ||
        o.regNo.toLowerCase().includes(term) ||
        o.caseNumber.toLowerCase().includes(term) ||
        o.paperCode.toLowerCase().includes(term);

      let matchStatus = true;
      if (statusFilter === "Inquiry") matchStatus = o.status.includes("Inquiry");
      else if (statusFilter === "Debarred") matchStatus = o.status.includes("Debarred");
      else if (statusFilter === "Dismissed") matchStatus = o.status.includes("Dismissed");
      else if (statusFilter === "Resolved") matchStatus = o.status.includes("Dismissed") || o.status.includes("Confirmed");

      const matchType = typeFilter === "All" || o.offenceType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [offences, searchTerm, statusFilter, typeFilter]);

  /* ---------- Handlers ---------- */
  const handleOpenDetail = (offence) => {
    setSelectedOffence(offence);
    setTempStatus(offence.status);
    setTempPunishment(offence.senatePunishment);
    setTempNotes(offence.officerNotes);
  };

  const handleSaveDecision = () => {
    if (!selectedOffence) return;

    setOffences((prev) =>
      prev.map((o) => {
        if (o.id === selectedOffence.id) {
          return {
            ...o,
            status: tempStatus,
            senatePunishment: tempPunishment,
            officerNotes: tempNotes,
          };
        }
        return o;
      })
    );

    triggerToast(`Disciplinary record updated for Case ${selectedOffence.caseNumber}`);
    setSelectedOffence(null);
  };

  const handleCreateOffence = (e) => {
    e.preventDefault();
    if (!newOffence.regNo || !newOffence.name || !newOffence.paperCode || !newOffence.evidence) {
      triggerToast("Please provide Student Reg No, Name, Paper, and Seized Evidence description.");
      return;
    }

    const created = {
      id: `OFF-2026-${String(offences.length + 1).padStart(3, "0")}`,
      caseNumber: `EOC/2026/FT/${String(offences.length + 1).padStart(2, "0")}`,
      regNo: newOffence.regNo.toUpperCase(),
      name: newOffence.name,
      programme: "BICT (Hons)",
      specialization: newOffence.specialization,
      semester: newOffence.semester,
      paperCode: newOffence.paperCode.split(" - ")[0],
      paperName: newOffence.paperCode.includes(" - ") ? newOffence.paperCode.split(" - ")[1] : newOffence.paperCode,
      hall: newOffence.hall,
      examDate: newOffence.examDate,
      reportingInvigilator: newOffence.reportingInvigilator || "Examination Invigilation Team",
      offenceType: newOffence.offenceType,
      evidence: newOffence.evidence,
      status: "Under EOC Inquiry",
      senatePunishment: "Awaiting Committee Hearing",
      officerNotes: newOffence.officerNotes || "Incident report registered by examination supervisor. Evidence held in secure examination vault.",
    };

    setOffences([created, ...offences]);
    triggerToast(`Logged examination offence: ${created.caseNumber}`);
    setShowLogModal(false);
    setNewOffence({
      regNo: "",
      name: "",
      specialization: "Software Systems",
      semester: "Semester 05",
      paperCode: "IT3012 - Software Engineering",
      hall: "Hall A",
      examDate: new Date().toISOString().split("T")[0],
      reportingInvigilator: "",
      offenceType: "Possession of Unauthorized Material",
      evidence: "",
      officerNotes: "",
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = statusFilter === filterValue ? "All" : filterValue;
    setSearchTerm("");
    setTypeFilter("All");
    setStatusFilter(next);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="eo-page">
      {/* ====================================================================
          1. STATS CARDS (click a card to filter the table)
          ==================================================================== */}
      <section className="eo-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && statusFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`eo-stat-card eo-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="eo-stat-head">
                <div className={`eo-stat-icon eo-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`eo-stat-pill eo-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="eo-stat-body">
                <span className="eo-stat-label">{card.label}</span>
                <span className="eo-stat-val">{card.value}</span>
                <span className="eo-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          2. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="eo-panel" ref={tableRef}>
        <div className="eo-panel-header">
          <div>
            <h3 className="eo-panel-title">Examination Malpractices Registry</h3>
            <p className="eo-panel-desc">
              Record invigilator statements, track confiscated evidence, and enforce Senate disciplinary rulings.
            </p>
          </div>
          <div className="eo-header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              className="eo-btn eo-btn-outline"
              onClick={() => setShowDossier(true)}
            >
              EOC Referral Dossier
            </button>
            <button
              type="button"
              className="eo-btn eo-btn-primary"
              onClick={() => setShowLogModal(true)}
            >
              + Log Incident Case
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {statusFilter !== "All" && FILTER_LABELS[statusFilter] && (
          <p className="eo-active-filter">
            Showing only <strong>{FILTER_LABELS[statusFilter]}</strong> cases ({filteredOffences.length})
            <button
              type="button"
              className="eo-btn eo-btn-outline"
              onClick={resetFilters}
            >
              Show all
            </button>
          </p>
        )}

        {/* Filter Toolbar */}
        <div className="eo-filter-toolbar">
          <div className="eo-search-wrap">
            <svg className="eo-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="eo-input eo-search-input"
              placeholder="Search by candidate name, reg no, or case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="eo-filter-group">
            <select
              className="eo-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Case Statuses</option>
              <option value="Inquiry">Under EOC Inquiry</option>
              <option value="Debarred">Senate Debarred / Suspended</option>
              <option value="Dismissed">Dismissed / Warning</option>
              <option value="Resolved">Resolved Cases (Dismissed/Confirmed)</option>
            </select>

            <select
              className="eo-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Offence Categories</option>
              <option value="Possession of Unauthorized Material">Unauthorized Material / Notes</option>
              <option value="Possession of Mobile Phone / Electronic Device">Mobile Phones / Smart Devices</option>
              <option value="Copying / Collusion with Another Candidate">Copying / Collusion</option>
              <option value="Disorderly Conduct & Insubordination">Disorderly Conduct</option>
            </select>

            {(searchTerm || statusFilter !== "All" || typeFilter !== "All") && (
              <button
                type="button"
                className="eo-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="eo-table-container">
          <table className="eo-table">
            <thead>
              <tr>
                <th>Case ID &amp; Date</th>
                <th>Candidate Details</th>
                <th>Exam Paper &amp; Hall</th>
                <th>Offence &amp; Confiscated Evidence</th>
                <th>Reporting Invigilator</th>
                <th>Status &amp; Senate Ruling</th>
                <th className="eo-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffences.length === 0 ? (
                <tr>
                  <td colSpan="7" className="eo-empty-cell">
                    <p>No examination offence incidents match the specified filter.</p>
                  </td>
                </tr>
              ) : (
                filteredOffences.map((o) => {
                  const isDebarred = o.status.includes("Debarred");
                  return (
                    <tr key={o.id} className={isDebarred ? "eo-row-danger" : ""}>
                      {/* Case ID */}
                      <td>
                        <div className="eo-case-id">{o.caseNumber}</div>
                        <div className="eo-case-date">{o.examDate}</div>
                      </td>

                      {/* Candidate */}
                      <td>
                        <div className="eo-student-meta">
                          <span className="eo-student-avatar">
                            {o.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div>
                            <div className="eo-student-name">{o.name}</div>
                            <div className="eo-student-reg">{o.regNo} · {o.specialization}</div>
                          </div>
                        </div>
                      </td>

                      {/* Paper & Hall */}
                      <td>
                        <div className="eo-paper-code">{o.paperCode} - {o.paperName}</div>
                        <div className="eo-hall-loc">{o.hall}</div>
                      </td>

                      {/* Offence & Evidence */}
                      <td>
                        <div className="eo-offence-type">{o.offenceType}</div>
                        <div className="eo-evidence-snippet">{o.evidence}</div>
                      </td>

                      {/* Reporting Invigilator */}
                      <td>
                        <div className="eo-invig-name">{o.reportingInvigilator}</div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`eo-status-pill ${
                            o.status.includes("Debarred")
                              ? "eo-status-red"
                              : o.status.includes("Inquiry")
                              ? "eo-status-amber"
                              : "eo-status-green"
                          }`}
                        >
                          {o.status}
                        </span>
                        <div className="eo-punish-hint">{o.senatePunishment}</div>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          type="button"
                          className="eo-action-btn eo-btn-inspect"
                          onClick={() => handleOpenDetail(o)}
                        >
                          Audit &amp; Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          4. AUDIT & INQUIRY UPDATE MODAL
          ==================================================================== */}
      {selectedOffence && (
        <div className="eo-modal-overlay" onClick={() => setSelectedOffence(null)}>
          <div className="eo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="eo-modal-header">
              <div>
                <span className="eo-modal-tag">DISCIPLINARY INQUIRY RECORD</span>
                <h2 className="eo-modal-title">Case {selectedOffence.caseNumber}</h2>
                <span className="eo-modal-subtitle">
                  {selectedOffence.name} ({selectedOffence.regNo}) · {selectedOffence.paperCode}
                </span>
              </div>
              <button
                type="button"
                className="eo-close-btn"
                onClick={() => setSelectedOffence(null)}
              >
                &times;
              </button>
            </div>

            <div className="eo-modal-body">
              {/* Evidence & Case Overview */}
              <div className="eo-info-banner">
                <div className="eo-info-item">
                  <span className="eo-info-lbl">Offence Classification</span>
                  <span className="eo-info-val">{selectedOffence.offenceType}</span>
                </div>
                <div className="eo-info-item">
                  <span className="eo-info-lbl">Reporting Invigilator</span>
                  <span className="eo-info-val">{selectedOffence.reportingInvigilator}</span>
                </div>
                <div className="eo-info-item">
                  <span className="eo-info-lbl">Examination Venue</span>
                  <span className="eo-info-val">{selectedOffence.hall} ({selectedOffence.examDate})</span>
                </div>
                <div className="eo-info-item">
                  <span className="eo-info-lbl">Confiscated Evidence</span>
                  <span className="eo-info-val">{selectedOffence.evidence}</span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="eo-form-group">
                <label className="eo-field-label">Disciplinary Status (EOC &amp; Senate Stage)</label>
                <select
                  className="eo-select"
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                >
                  <option value="Under EOC Inquiry">Under EOC Inquiry (Preliminary Hearing)</option>
                  <option value="Senate Confirmed - Debarred">Senate Confirmed - Debarred / Suspended</option>
                  <option value="Senate Confirmed - Paper Cancelled">Senate Confirmed - Paper Cancelled Only</option>
                  <option value="Case Dismissed (Warning Issued)">Case Dismissed (Formal Warning Issued)</option>
                  <option value="Exonerated (Not Guilty)">Exonerated (Case Dismissed - Not Guilty)</option>
                </select>
              </div>

              <div className="eo-form-group">
                <label className="eo-field-label">Senate Disciplinary Decision / Punishment</label>
                <input
                  type="text"
                  className="eo-input"
                  value={tempPunishment}
                  onChange={(e) => setTempPunishment(e.target.value)}
                  placeholder="e.g. Cancellation of paper and debarment for 2 semesters (Senate Memo #288)"
                />
              </div>

              <div className="eo-form-group">
                <label className="eo-field-label">Examination Officer Confidential Notes</label>
                <textarea
                  className="eo-textarea"
                  rows="3"
                  placeholder="Record committee hearing dates, student signed confession status, or SAR dispatch reference numbers..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="eo-modal-footer">
              <button
                type="button"
                className="eo-btn eo-btn-outline"
                onClick={() => setSelectedOffence(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="eo-btn eo-btn-primary"
                onClick={handleSaveDecision}
              >
                Save Disciplinary Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. LOG NEW INCIDENT MODAL
          ==================================================================== */}
      {showLogModal && (
        <div className="eo-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="eo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="eo-modal-header">
              <div>
                <span className="eo-modal-tag">MALPRACTICE INTAKE</span>
                <h2 className="eo-modal-title">Log Examination Offence Incident</h2>
                <span className="eo-modal-subtitle">
                  Immediate recording of confiscated evidence under Section 8.1.2.
                </span>
              </div>
              <button
                type="button"
                className="eo-close-btn"
                onClick={() => setShowLogModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOffence}>
              <div className="eo-modal-body">
                <div className="eo-form-grid">
                  <div className="eo-form-group">
                    <label className="eo-field-label">Student Registration No *</label>
                    <input
                      type="text"
                      className="eo-input"
                      placeholder="e.g. 22ICT099"
                      value={newOffence.regNo}
                      onChange={(e) => setNewOffence({ ...newOffence, regNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="eo-form-group">
                    <label className="eo-field-label">Student Full Name *</label>
                    <input
                      type="text"
                      className="eo-input"
                      placeholder="e.g. K.L. Fernando"
                      value={newOffence.name}
                      onChange={(e) => setNewOffence({ ...newOffence, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="eo-form-group">
                    <label className="eo-field-label">Specialization</label>
                    <select
                      className="eo-select"
                      value={newOffence.specialization}
                      onChange={(e) => setNewOffence({ ...newOffence, specialization: e.target.value })}
                    >
                      <option value="Software Systems">Software Systems</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Network Systems">Network Systems</option>
                    </select>
                  </div>

                  <div className="eo-form-group">
                    <label className="eo-field-label">Course Paper Code &amp; Name *</label>
                    <input
                      type="text"
                      className="eo-input"
                      placeholder="e.g. IT3012 - Software Engineering"
                      value={newOffence.paperCode}
                      onChange={(e) => setNewOffence({ ...newOffence, paperCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="eo-form-group">
                    <label className="eo-field-label">Hall &amp; Desk Location *</label>
                    <input
                      type="text"
                      className="eo-input"
                      placeholder="e.g. Hall A (Desk 24)"
                      value={newOffence.hall}
                      onChange={(e) => setNewOffence({ ...newOffence, hall: e.target.value })}
                      required
                    />
                  </div>

                  <div className="eo-form-group">
                    <label className="eo-field-label">Reporting Invigilator *</label>
                    <input
                      type="text"
                      className="eo-input"
                      placeholder="e.g. Dr. K. Cassim"
                      value={newOffence.reportingInvigilator}
                      onChange={(e) => setNewOffence({ ...newOffence, reportingInvigilator: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="eo-form-group">
                  <label className="eo-field-label">Offence Classification *</label>
                  <select
                    className="eo-select"
                    value={newOffence.offenceType}
                    onChange={(e) => setNewOffence({ ...newOffence, offenceType: e.target.value })}
                  >
                    <option value="Possession of Unauthorized Material">Possession of Unauthorized Material (Chits, Notes)</option>
                    <option value="Possession of Mobile Phone / Electronic Device">Possession of Mobile Phone / Electronic Device</option>
                    <option value="Copying / Collusion with Another Candidate">Copying / Collusion with Another Candidate</option>
                    <option value="Impersonation / Forgery">Impersonation / Forgery</option>
                    <option value="Disorderly Conduct & Insubordination">Disorderly Conduct &amp; Insubordination</option>
                  </select>
                </div>

                <div className="eo-form-group">
                  <label className="eo-field-label">Description of Confiscated Evidence *</label>
                  <textarea
                    className="eo-textarea"
                    rows="2"
                    placeholder="Describe seized materials (e.g. 2 chits with diagrams, smartphone brand/model, seized answer book)..."
                    value={newOffence.evidence}
                    onChange={(e) => setNewOffence({ ...newOffence, evidence: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="eo-modal-footer">
                <button
                  type="button"
                  className="eo-btn eo-btn-outline"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="eo-btn eo-btn-primary">
                  Save &amp; Generate Case ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          6. PRINTABLE EOC REFERRAL DOSSIER
          ==================================================================== */}
      {showDossier && (
        <div className="eo-modal-overlay" onClick={() => setShowDossier(false)}>
          <div className="eo-modal-card eo-dossier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eo-modal-header eo-no-print">
              <div>
                <span className="eo-modal-tag">CONFIDENTIAL DISCIPLINARY DOSSIER</span>
                <h2 className="eo-modal-title">EOC Referral Dossier</h2>
                <span className="eo-modal-subtitle">
                  Academic Session 2025/2026 · Referral to Senior Assistant Registrar (Examinations)
                </span>
              </div>
              <button
                type="button"
                className="eo-close-btn"
                onClick={() => setShowDossier(false)}
              >
                &times;
              </button>
            </div>

            <div className="eo-print-letter">
              <div className="eo-letter-head">
                <div className="eo-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
                <div className="eo-uni-sub">FACULTY OF TECHNOLOGY · EXAMINATION UNIT</div>
                <div className="eo-letter-meta">CONFIDENTIAL REFERRAL TO THE EXAMINATION OFFENCES COMMITTEE (EOC)</div>
              </div>

              <div className="eo-letter-divider" />

              <div className="eo-letter-body">
                <p>
                  <strong>TO:</strong> Senior Assistant Registrar (Examinations) &amp; Chairman, Examination Offences Committee<br />
                  <strong>FROM:</strong> Examination Officer, Faculty of Technology<br />
                  <strong>SUBJECT:</strong> Referral of Examination Malpractices detected during Semester 05 Assessments (Section 8.1.2)
                </p>

                <p>
                  The following incident reports and confiscated materials have been audited and signed by the respective hall invigilators. 
                  These cases are formally submitted for disciplinary inquiry and subsequent recommendation to the Senate:
                </p>

                <table className="eo-letter-table">
                  <thead>
                    <tr>
                      <th>Case No</th>
                      <th>Candidate Name &amp; Reg No</th>
                      <th>Module &amp; Date</th>
                      <th>Offence &amp; Confiscated Evidence</th>
                      <th>Reporting Invigilator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offences.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.caseNumber}</strong></td>
                        <td>{o.name}<br /><small>{o.regNo}</small></td>
                        <td>{o.paperCode}<br /><small>{o.examDate}</small></td>
                        <td><strong>{o.offenceType}</strong><br /><small>{o.evidence}</small></td>
                        <td>{o.reportingInvigilator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="eo-letter-sign-row">
                <div className="eo-sign-box">
                  <div className="eo-sign-line" />
                  <strong>Examination Officer</strong><br />
                  Faculty of Technology
                </div>
                <div className="eo-sign-box">
                  <div className="eo-sign-line" />
                  <strong>Dean of the Faculty</strong><br />
                  Faculty of Technology
                </div>
              </div>
            </div>

            <div className="eo-modal-footer eo-no-print">
              <button
                type="button"
                className="eo-btn eo-btn-outline"
                onClick={() => setShowDossier(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="eo-btn eo-btn-primary"
                onClick={() => window.print()}
              >
                Print Referral Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && <div className="eo-toast">{toastMessage}</div>}
    </div>
  );
}
