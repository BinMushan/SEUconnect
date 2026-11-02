import React, { useMemo, useRef, useState } from "react";
import "./Repeat_Candidates.css";

/* ==========================================================================
   SAMPLE DATA: REPEAT CANDIDATES REGISTRY
   ========================================================================== */

const INITIAL_REPEAT_CANDIDATES = [
  {
    id: "RC-01",
    regNo: "21ICT019",
    name: "M.F. Rasheed",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    moduleCode: "IT3012",
    moduleName: "Software Engineering",
    credits: 3,
    previousGrade: "E",
    attemptNumber: 2,
    feeStatus: "Paid",
    receiptNo: "REC-2026-8812",
    paymentDate: "2026-10-14",
    senateStatus: "Approved",
    reason: "Failed ESA in 1st proper attempt (2024/2025).",
    officerNotes:
      "Repeat exam registration fee verified. Grade capped at C (2.0 GP).",
  },
  {
    id: "RC-02",
    regNo: "21ICT064",
    name: "F. Nilufar",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    moduleCode: "IT3022",
    moduleName: "Database Systems",
    credits: 3,
    previousGrade: "F",
    attemptNumber: 3,
    feeStatus: "Paid",
    receiptNo: "REC-2026-8940",
    paymentDate: "2026-10-16",
    senateStatus: "Near Limit Warning",
    reason:
      "3rd and final standard attempt under Faculty Handbook Section 4.3.4.",
    officerNotes:
      "Final standard attempt. Formal warning issued regarding 3-attempt limit.",
  },
  {
    id: "RC-03",
    regNo: "20ICT008",
    name: "K. Thanushan",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    moduleCode: "IT3032",
    moduleName: "Computer Networks",
    credits: 3,
    previousGrade: "E",
    attemptNumber: 4,
    feeStatus: "Paid",
    receiptNo: "REC-2026-9021",
    paymentDate: "2026-10-18",
    senateStatus: "Pending Senate",
    reason:
      "Exceeded 3 standard attempts. Appeal submitted on grounds of documented hospitalization during 2nd attempt.",
    officerNotes: "Escalated to HOD for Senate Grace Chance evaluation.",
  },
  {
    id: "RC-04",
    regNo: "21ICT045",
    name: "U.H. Farook",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    moduleCode: "IT3042",
    moduleName: "Web Technologies",
    credits: 2,
    previousGrade: "C-",
    attemptNumber: 2,
    feeStatus: "Pending Verification",
    receiptNo: "SLIP-UPLOADED-662",
    paymentDate: "2026-10-20",
    senateStatus: "Fee Hold",
    reason: "Seeking grade upgrade from C- to C.",
    officerNotes:
      "Bank payment deposit slip uploaded; awaiting Bursar confirmation.",
  },
  {
    id: "RC-05",
    regNo: "20ICT031",
    name: "M.S.M. Safwan",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    moduleCode: "IT3052",
    moduleName: "Operating Systems",
    credits: 3,
    previousGrade: "F",
    attemptNumber: 4,
    feeStatus: "Unpaid",
    receiptNo: "None",
    paymentDate: "N/A",
    senateStatus: "Barred - Exceeded Attempts",
    reason: "Exceeded 3 attempts without Senate medical concession.",
    officerNotes:
      "Barred under Section 4.3.4. No valid medical ground submitted.",
  },
  {
    id: "RC-06",
    regNo: "21ICT082",
    name: "T. Janani",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    moduleCode: "IT3012",
    moduleName: "Software Engineering",
    credits: 3,
    previousGrade: "E",
    attemptNumber: 3,
    feeStatus: "Paid",
    receiptNo: "REC-2026-9114",
    paymentDate: "2026-10-17",
    senateStatus: "Near Limit Warning",
    reason: "3rd attempt. Attendance requirement satisfied.",
    officerNotes: "Cleared for admission card generation. Grade capped at C.",
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

// Text shown in the "Showing only ..." line (keys match the attempt dropdown values)
const FILTER_LABELS = {
  2: "2nd attempt",
  3: "3rd attempt",
  4: "4th attempt / grace",
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function RepeatCandidates() {
  const [candidates, setCandidates] = useState(INITIAL_REPEAT_CANDIDATES);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [attemptFilter, setAttemptFilter] = useState("All");
  const [feeFilter, setFeeFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showSenateDossier, setShowSenateDossier] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modal Temp Edit State
  const [tempNotes, setTempNotes] = useState("");
  const [tempSenateStatus, setTempSenateStatus] = useState("");

  // Scroll target for the table
  const tableRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  /* ---------- Statistics Calculation ---------- */
  const stats = useMemo(() => {
    const total = candidates.length;
    const attempt2 = candidates.filter((c) => c.attemptNumber === 2).length;
    const attempt3 = candidates.filter((c) => c.attemptNumber === 3).length;
    const attempt4Plus = candidates.filter((c) => c.attemptNumber >= 4).length;
    const feeCleared = candidates.filter((c) => c.feeStatus === "Paid").length;
    const pendingSenate = candidates.filter(
      (c) => c.senateStatus === "Pending Senate",
    ).length;

    return {
      total,
      attempt2,
      attempt3,
      attempt4Plus,
      feeCleared,
      pendingSenate,
    };
  }, [candidates]);

  // Stat cards (edit the pill, caption and colour here)
  // filter: the value the card sets in the attempt dropdown ("All", "2", "3", "4")
  const statCards = [
    {
      label: "Total repeat applicants",
      value: stats.total,
      caption: `${stats.feeCleared} of ${stats.total} fees cleared`,
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
      label: "2nd attempt (standard)",
      value: stats.attempt2,
      caption: "Normal repeat rules apply",
      pill: "Standard",
      color: "green",
      filter: "2",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
    {
      label: "3rd attempt (near limit)",
      value: stats.attempt3,
      caption: "Final standard attempt",
      pill: "Near Limit",
      color: "amber",
      filter: "3",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </StatIcon>
      ),
    },
    {
      label: "4th attempt / grace appeals",
      value: stats.attempt4Plus,
      caption: `${stats.pendingSenate} awaiting Board escalation`,
      pill: "Appeals",
      color: "red",
      filter: "4",
      icon: (
        <StatIcon>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </StatIcon>
      ),
    },
  ];

  /* ---------- Filtered Candidates ---------- */
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        c.name.toLowerCase().includes(term) ||
        c.regNo.toLowerCase().includes(term) ||
        c.moduleCode.toLowerCase().includes(term) ||
        c.moduleName.toLowerCase().includes(term);

      let matchAttempt = true;
      if (attemptFilter === "2") matchAttempt = c.attemptNumber === 2;
      else if (attemptFilter === "3") matchAttempt = c.attemptNumber === 3;
      else if (attemptFilter === "4") matchAttempt = c.attemptNumber >= 4;

      const matchFee = feeFilter === "All" || c.feeStatus === feeFilter;
      const matchSpec = specFilter === "All" || c.specialization === specFilter;

      return matchSearch && matchAttempt && matchFee && matchSpec;
    });
  }, [candidates, searchTerm, attemptFilter, feeFilter, specFilter]);

  /* ---------- Action Handlers ---------- */
  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setTempNotes(candidate.officerNotes || "");
    setTempSenateStatus(candidate.senateStatus || "Approved");
  };

  const handleSaveDecision = () => {
    if (!selectedCandidate) return;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === selectedCandidate.id) {
          return {
            ...c,
            officerNotes: tempNotes,
            senateStatus: tempSenateStatus,
          };
        }
        return c;
      }),
    );

    triggerToast(`Updated repeat record for ${selectedCandidate.regNo}`);
    setSelectedCandidate(null);
  };

  const handleQuickApproveFee = (candidateId, regNo) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            feeStatus: "Paid",
            receiptNo: `REC-VERIFIED-${Math.floor(1000 + Math.random() * 9000)}`,
            senateStatus: c.attemptNumber >= 4 ? "Pending Senate" : "Approved",
          };
        }
        return c;
      }),
    );
    triggerToast(`Repeat payment voucher confirmed for ${regNo}`);
  };

  // Clears every filter
  const resetFilters = () => {
    setSearchTerm("");
    setAttemptFilter("All");
    setFeeFilter("All");
    setSpecFilter("All");
  };

  // Click on a stat card
  const handleCardClick = (filterValue) => {
    // Clicking the active card again shows everyone
    const next = attemptFilter === filterValue ? "All" : filterValue;

    setSearchTerm("");
    setFeeFilter("All");
    setSpecFilter("All");
    setAttemptFilter(next);

    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rc-page">
      {/* ====================================================================
          1. STATS CARDS (click a card to filter the table)
          ==================================================================== */}
      <section className="rc-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && attemptFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`rc-stat-card rc-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="rc-stat-head">
                <div className={`rc-stat-icon rc-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`rc-stat-pill rc-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="rc-stat-body">
                <span className="rc-stat-label">{card.label}</span>
                <span className="rc-stat-val">{card.value}</span>
                <span className="rc-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          2. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="rc-panel" ref={tableRef}>
        <div className="rc-panel-header">
          <div>
            <h3 className="rc-panel-title">Repeat Candidates Registry</h3>
            <p className="rc-panel-desc">
              Manage repeat exam registration vouchers, track attempt limits,
              and record Senate decisions.
            </p>
          </div>
          <span className="rc-table-counter">
            Showing <strong>{filteredCandidates.length}</strong> of{" "}
            {candidates.length} Registered Modules
          </span>
        </div>

        {/* Shows which card filter is on */}
        {attemptFilter !== "All" && (
          <p className="rc-active-filter">
            Showing only <strong>{FILTER_LABELS[attemptFilter]}</strong>{" "}
            candidates ({filteredCandidates.length})
            <button
              type="button"
              className="rc-btn rc-btn-outline"
              onClick={resetFilters}
            >
              Show all
            </button>
          </p>
        )}

        {/* Filter Toolbar */}
        <div className="rc-filter-toolbar">
          <div className="rc-search-wrap">
            <svg
              className="rc-search-icon"
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
              className="rc-input rc-search-input"
              placeholder="Search by student name, reg no, or module code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rc-filter-group">
            <select
              className="rc-select"
              value={attemptFilter}
              onChange={(e) => setAttemptFilter(e.target.value)}
            >
              <option value="All">All Attempt Levels</option>
              <option value="2">2nd Attempt Only</option>
              <option value="3">3rd Attempt (Near Limit)</option>
              <option value="4">4th Attempt (Grace Appeal)</option>
            </select>

            <select
              className="rc-select"
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Fee Cleared (Paid)</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select
              className="rc-select"
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>

            {(searchTerm ||
              attemptFilter !== "All" ||
              feeFilter !== "All" ||
              specFilter !== "All") && (
              <button
                type="button"
                className="rc-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="rc-table-container">
          <table className="rc-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Repeat Module</th>
                <th>Prev. Grade</th>
                <th>Attempt Stage</th>
                <th>Fee Voucher</th>
                <th>Status / Senate Review</th>
                <th className="rc-th-action">Officer Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="rc-empty-cell">
                    <div className="rc-empty-state">
                      <p>
                        No repeat candidates match the specified filter
                        criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const isThirdAttempt = c.attemptNumber === 3;
                  const isFourthAttempt = c.attemptNumber >= 4;

                  return (
                    <tr
                      key={c.id}
                      className={
                        isFourthAttempt
                          ? "rc-row-danger"
                          : isThirdAttempt
                            ? "rc-row-warning"
                            : ""
                      }
                    >
                      {/* Candidate Name & Reg */}
                      <td>
                        <div className="rc-student-meta">
                          <span className="rc-student-avatar">
                            {c.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div>
                            <div className="rc-student-name">{c.name}</div>
                            <div className="rc-student-reg">
                              {c.regNo} · {c.specialization}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Repeat Module */}
                      <td>
                        <div className="rc-mod-code">
                          {c.moduleCode} ({c.credits} Credits)
                        </div>
                        <div className="rc-mod-name">{c.moduleName}</div>
                      </td>

                      {/* Previous Grade */}
                      <td>
                        <span className="rc-prev-grade">{c.previousGrade}</span>
                      </td>

                      {/* Attempt Stage */}
                      <td>
                        {c.attemptNumber === 2 && (
                          <span className="rc-badge rc-badge-blue">
                            2nd Attempt
                          </span>
                        )}
                        {c.attemptNumber === 3 && (
                          <span className="rc-badge rc-badge-amber">
                            3rd Attempt (Final)
                          </span>
                        )}
                        {c.attemptNumber >= 4 && (
                          <span className="rc-badge rc-badge-red">
                            4th Attempt (Grace)
                          </span>
                        )}
                        <span className="rc-grade-cap-hint">
                          Max Cap: Grade 'C'
                        </span>
                      </td>

                      {/* Fee Voucher */}
                      <td>
                        {c.feeStatus === "Paid" ? (
                          <span
                            className="rc-tag rc-tag-green"
                            title={`Receipt: ${c.receiptNo}`}
                          >
                            ✓ Paid ({c.receiptNo})
                          </span>
                        ) : c.feeStatus === "Pending Verification" ? (
                          <button
                            type="button"
                            className="rc-tag rc-tag-amber rc-tag-action"
                            onClick={() => handleQuickApproveFee(c.id, c.regNo)}
                            title="Click to verify voucher"
                          >
                            Verify Voucher ↵
                          </button>
                        ) : (
                          <span className="rc-tag rc-tag-red">Unpaid</span>
                        )}
                      </td>

                      {/* Status / Senate Decision */}
                      <td>
                        <span
                          className={`rc-status-pill ${
                            c.senateStatus === "Approved"
                              ? "rc-status-ok"
                              : c.senateStatus === "Near Limit Warning"
                                ? "rc-status-warn"
                                : c.senateStatus === "Pending Senate"
                                  ? "rc-status-purple"
                                  : "rc-status-danger"
                          }`}
                        >
                          {c.senateStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="rc-action-btn-group">
                          <button
                            type="button"
                            className="rc-action-btn rc-btn-inspect"
                            onClick={() => handleOpenDetail(c)}
                          >
                            Review &amp; Edit
                          </button>
                        </div>
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
          3. CANDIDATE REPEAT AUDIT & DECISION MODAL
          ==================================================================== */}
      {selectedCandidate && (
        <div
          className="rc-modal-overlay"
          onClick={() => setSelectedCandidate(null)}
        >
          <div className="rc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-header">
              <div>
                <span className="rc-modal-tag">
                  REPEAT EXAMINATION CANDIDATE AUDIT
                </span>
                <h2 className="rc-modal-title">
                  {selectedCandidate.name} ({selectedCandidate.regNo})
                </h2>
                <span className="rc-modal-subtitle">
                  {selectedCandidate.programme} ·{" "}
                  {selectedCandidate.specialization} ·{" "}
                  {selectedCandidate.semester}
                </span>
              </div>
              <button
                type="button"
                className="rc-close-btn"
                onClick={() => setSelectedCandidate(null)}
              >
                &times;
              </button>
            </div>

            <div className="rc-modal-body">
              {/* Info Grid */}
              <div className="rc-info-banner">
                <div className="rc-info-item">
                  <span className="rc-info-lbl">Module to Repeat</span>
                  <span className="rc-info-val">
                    {selectedCandidate.moduleCode} —{" "}
                    {selectedCandidate.moduleName}
                  </span>
                </div>
                <div className="rc-info-item">
                  <span className="rc-info-lbl">Attempt Level</span>
                  <span className="rc-info-val">
                    Attempt #{selectedCandidate.attemptNumber} (Grade Capping at
                    'C' applies)
                  </span>
                </div>
                <div className="rc-info-item">
                  <span className="rc-info-lbl">Previous Result</span>
                  <span className="rc-info-val">
                    Grade {selectedCandidate.previousGrade}
                  </span>
                </div>
                <div className="rc-info-item">
                  <span className="rc-info-lbl">Payment Status</span>
                  <span className="rc-info-val">
                    {selectedCandidate.feeStatus} ({selectedCandidate.receiptNo}
                    )
                  </span>
                </div>
              </div>

              {/* Handbook Advisory Warning */}
              {selectedCandidate.attemptNumber >= 4 ? (
                <div className="rc-advisory-box rc-advisory-danger">
                  <strong>Senate Grace Chance Required:</strong> This candidate
                  has exceeded the 3 standard attempt limit. Under Section
                  4.3.4, sitting for this examination is prohibited unless
                  approved by the Senate through a formal memo from the Dean.
                </div>
              ) : selectedCandidate.attemptNumber === 3 ? (
                <div className="rc-advisory-box rc-advisory-warning">
                  <strong>Final Attempt Warning:</strong> This candidate is on
                  their 3rd and final standard attempt. Failure in this attempt
                  will require formal Senate intervention or academic
                  termination in this course.
                </div>
              ) : (
                <div className="rc-advisory-box rc-advisory-info">
                  <strong>Standard Repeat:</strong> Normal 2nd attempt. Ensure
                  that examination entry forms are endorsed and the final grade
                  is capped at Grade C (2.0 GP).
                </div>
              )}

              {/* Form Controls for Examination Officer */}
              <div className="rc-form-group">
                <label className="rc-field-label">
                  Repeat Status &amp; Senate Recommendation
                </label>
                <select
                  className="rc-select"
                  value={tempSenateStatus}
                  onChange={(e) => setTempSenateStatus(e.target.value)}
                >
                  <option value="Approved">
                    Approved (Normal 2nd Attempt Entry)
                  </option>
                  <option value="Near Limit Warning">
                    Near Limit Warning (3rd Attempt Cleared)
                  </option>
                  <option value="Pending Senate">
                    Pending Senate (Grace Chance Escalation)
                  </option>
                  <option value="Barred - Exceeded Attempts">
                    Barred - Exceeded Attempts (No Concession)
                  </option>
                  <option value="Fee Hold">
                    Fee Hold (Awaiting Bursar Clearance)
                  </option>
                </select>
              </div>

              <div className="rc-form-group">
                <label className="rc-field-label">
                  Examination Officer Audit Notes
                </label>
                <textarea
                  className="rc-textarea"
                  rows="3"
                  placeholder="Record Senate memo numbers, payment verification dates, or HOD comments..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="rc-modal-footer">
              <button
                type="button"
                className="rc-btn rc-btn-outline"
                onClick={() => setSelectedCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rc-btn rc-btn-primary"
                onClick={handleSaveDecision}
              >
                Save Decision &amp; Update Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. SENATE ESCALATION DOSSIER MODAL
          ==================================================================== */}
      {showSenateDossier && (
        <div
          className="rc-modal-overlay"
          onClick={() => setShowSenateDossier(false)}
        >
          <div
            className="rc-modal-card rc-dossier-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rc-modal-header rc-no-print">
              <div>
                <span className="rc-modal-tag">
                  FACULTY BOARD &amp; SENATE DOCUMENT
                </span>
                <h2 className="rc-modal-title">
                  Repeat Candidate Grace Chance Dossier
                </h2>
                <span className="rc-modal-subtitle">
                  Recommendations for Special 4th Attempt Concessions — Handbook
                  Section 4.3.4
                </span>
              </div>
              <button
                type="button"
                className="rc-close-btn"
                onClick={() => setShowSenateDossier(false)}
              >
                &times;
              </button>
            </div>

            {/* Printable Memo */}
            <div className="rc-print-letter">
              <div className="rc-letter-head">
                <div className="rc-uni-title">
                  SOUTH EASTERN UNIVERSITY OF SRI LANKA
                </div>
                <div className="rc-uni-sub">
                  FACULTY OF TECHNOLOGY · EXAMINATION UNIT
                </div>
                <div className="rc-letter-meta">
                  MEMORANDUM TO THE BOARD OF EXAMINERS &amp; SENATE
                </div>
              </div>

              <div className="rc-letter-divider" />

              <div className="rc-letter-body">
                <p>
                  <strong>Subject:</strong> Submission of Repeat Candidates
                  Exceeding Standard Attempt Limits (4th Attempt Grace Requests)
                  for Semester 05 Examinations.
                </p>
                <p>
                  The following candidate(s) have submitted formal appeals for
                  consideration of a 4th attempt grace chance. Attendance
                  compliance and previous attempt histories have been audited by
                  the Examination Officer:
                </p>

                <table className="rc-letter-table">
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Candidate Name</th>
                      <th>Module Code &amp; Title</th>
                      <th>Attempt</th>
                      <th>Appeals / Justification</th>
                      <th>EO Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates
                      .filter((c) => c.attemptNumber >= 4)
                      .map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.regNo}</strong>
                          </td>
                          <td>{c.name}</td>
                          <td>
                            {c.moduleCode} - {c.moduleName}
                          </td>
                          <td>Attempt #{c.attemptNumber}</td>
                          <td>{c.reason}</td>
                          <td>{c.senateStatus}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <p>
                  <strong>Grade Capping Notice:</strong> In the event that the
                  Senate grants concession for any of the above candidates,
                  their earned module grade will be strictly capped at{" "}
                  <strong>Grade 'C' (2.00 GP)</strong>.
                </p>
              </div>

              <div className="rc-letter-sign-row">
                <div className="rc-sign-box">
                  <div className="rc-sign-line" />
                  <strong>Examination Officer</strong>
                  <br />
                  Faculty of Technology
                </div>
                <div className="rc-sign-box">
                  <div className="rc-sign-line" />
                  <strong>Dean of the Faculty</strong>
                  <br />
                  Faculty of Technology
                </div>
              </div>
            </div>

            <div className="rc-modal-footer rc-no-print">
              <button
                type="button"
                className="rc-btn rc-btn-outline"
                onClick={() => setShowSenateDossier(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rc-btn rc-btn-primary"
                onClick={() => window.print()}
              >
                Print Official Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="rc-toast">{toastMessage}</div>}
    </div>
  );
}