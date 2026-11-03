import React, { useMemo, useRef, useState } from "react";
import "./Special_Needs.css";

/* ==========================================================================
   SAMPLE DATA: SPECIAL NEEDS REGISTRY
   ========================================================================== */

const INITIAL_SPECIAL_NEEDS = [
  {
    id: "SN-2026-001",
    regNo: "22ICT056",
    name: "H. Nazeer",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    condition: "Right Wrist Fracture (Dominant Hand)",
    accommodations: ["Extra Time (30 mins/paper)", "Scribe / Amanuensis"],
    assignedHall: "Special Examination Room S-01",
    scribeAssigned: "K.M. Aslam (Demonstrator)",
    boardStatus: "Approved by Faculty Board",
    umoEndorsement: "Endorsed by UMO",
    medicalDocRef: "MED-FRAC-2026-04",
    extraTimeMinutes: 30,
    officerNotes: "Approved under Section 4.5. Separate scribe appointed. Invigilator briefed on timing.",
  },
  {
    id: "SN-2026-002",
    regNo: "22ICT115",
    name: "S. Divya",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    condition: "Visual Impairment (Severe Myopia & Astigmatism)",
    accommodations: ["Enlarged Font Question Paper (A3 / 18pt)", "Front Row Seating"],
    assignedHall: "Main Hall A (Front Row Desk 01)",
    scribeAssigned: "None (Independent)",
    boardStatus: "Approved by Faculty Board",
    umoEndorsement: "Endorsed by UMO",
    medicalDocRef: "MED-EYE-2026-19",
    extraTimeMinutes: 15,
    officerNotes: "Examination Unit instructed to prepare enlarged 18pt A3 question booklets.",
  },
  {
    id: "SN-2026-003",
    regNo: "21ICT045",
    name: "U.H. Farook",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    condition: "Chronic Mobility Impairment (Wheelchair Access)",
    accommodations: ["Ground Floor Seating", "Accessible Restroom Proximity"],
    assignedHall: "Ground Floor Lecture Theatre (GLT-01)",
    scribeAssigned: "None",
    boardStatus: "Approved by Faculty Board",
    umoEndorsement: "Endorsed by UMO",
    medicalDocRef: "MED-ORTHO-2025-88",
    extraTimeMinutes: 0,
    officerNotes: "Desk adjusted for wheelchair height. Venue verified by Examination Officer.",
  },
  {
    id: "SN-2026-004",
    regNo: "23ICT012",
    name: "R. Fernando",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 03",
    condition: "Type 1 Diabetes (Continuous Glucose Monitoring)",
    accommodations: ["Medical Device Permission (CGM)", "Emergency Snack/Water Permission"],
    assignedHall: "Main Hall B (Desk 14)",
    scribeAssigned: "None",
    boardStatus: "Pending Faculty Board",
    umoEndorsement: "Endorsed by UMO",
    medicalDocRef: "MED-ENDO-2026-03",
    extraTimeMinutes: 0,
    officerNotes: "Invigilator permitted to allow glucose monitor checks during paper.",
  },
  {
    id: "SN-2026-005",
    regNo: "22ICT089",
    name: "M.A. Akram",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    condition: "Severe Attention Deficit / Panic Anxiety Disorder",
    accommodations: ["Separate Low-Distraction Hall", "Rest Break (10 mins/hr)"],
    assignedHall: "Special Examination Room S-02",
    scribeAssigned: "None",
    boardStatus: "Under UMO Review",
    umoEndorsement: "Awaiting Specialist Letter",
    medicalDocRef: "PSYCH-2026-55",
    extraTimeMinutes: 20,
    officerNotes: "Specialist psychiatric endorsement requested by University Medical Officer.",
  },
];

/* =========================================
   HELPERS
========================================= */

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
  ExtraTime: "extra time allowances",
  SpecialVenue: "special venues",
  Approved: "board approved",
};

/* =========================================
   MAIN COMPONENT
========================================= */

export default function SpecialNeeds() {
  const [requests, setRequests] = useState(INITIAL_SPECIAL_NEEDS);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [accommodationFilter, setAccommodationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");
  const [activeStatFilter, setActiveStatFilter] = useState("All");
  const tableRef = useRef(null);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSupervisorDossier, setShowSupervisorDossier] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit State
  const [tempHall, setTempHall] = useState("");
  const [tempScribe, setTempScribe] = useState("");
  const [tempExtraTime, setTempExtraTime] = useState(0);
  const [tempStatus, setTempStatus] = useState("");
  const [tempNotes, setTempNotes] = useState("");

  // New Request State
  const [newReq, setNewReq] = useState({
    regNo: "",
    name: "",
    specialization: "Software Systems",
    semester: "Semester 05",
    condition: "",
    accommodationType: "Extra Time (30 mins/paper)",
    assignedHall: "Special Examination Room S-01",
    scribeAssigned: "None",
    extraTimeMinutes: 30,
    medicalDocRef: "",
    officerNotes: "",
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  /* ---------- Statistics ---------- */
  const stats = useMemo(() => {
    const total = requests.length;
    const extraTimeCount = requests.filter((r) => r.extraTimeMinutes > 0).length;
    const specialVenueCount = requests.filter(
      (r) => r.assignedHall.includes("Special") || r.assignedHall.includes("Ground")
    ).length;
    const approvedCount = requests.filter((r) => r.boardStatus === "Approved by Faculty Board").length;

    return { total, extraTimeCount, specialVenueCount, approvedCount };
  }, [requests]);

  // Stat cards
  const statCards = [
    {
      label: "Special requests",
      value: stats.total,
      caption: "Across active exam sessions",
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
      label: "Extra time allowances",
      value: stats.extraTimeCount,
      caption: "Time extensions applied",
      pill: "Extra Time",
      color: "amber",
      filter: "ExtraTime",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </StatIcon>
      ),
    },
    {
      label: "Special venues",
      value: stats.specialVenueCount,
      caption: "Wheelchair & separate rooms",
      pill: "Venues",
      color: "purple",
      filter: "SpecialVenue",
      icon: (
        <StatIcon>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </StatIcon>
      ),
    },
    {
      label: "Board confirmed",
      value: stats.approvedCount,
      caption: "Ratified by Faculty Board",
      pill: "Approved",
      color: "green",
      filter: "Approved",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
  ];

  /* ---------- Filtered Records ---------- */
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        r.name.toLowerCase().includes(term) ||
        r.regNo.toLowerCase().includes(term) ||
        r.condition.toLowerCase().includes(term) ||
        r.assignedHall.toLowerCase().includes(term);

      let matchAcc = true;
      if (accommodationFilter === "ExtraTime") matchAcc = r.extraTimeMinutes > 0;
      else if (accommodationFilter === "Scribe") matchAcc = r.scribeAssigned !== "None";
      else if (accommodationFilter === "GroundFloor") matchAcc = r.assignedHall.includes("Ground");
      else if (accommodationFilter === "SpecialRoom") matchAcc = r.assignedHall.includes("Special");
      else if (accommodationFilter === "SpecialVenue")
        matchAcc = r.assignedHall.includes("Special") || r.assignedHall.includes("Ground");

      let matchStatus = true;
      if (statusFilter === "Approved") matchStatus = r.boardStatus === "Approved by Faculty Board";
      else if (statusFilter === "Pending") matchStatus = r.boardStatus.includes("Pending");
      else if (statusFilter === "Review") matchStatus = r.boardStatus.includes("Review");

      const matchSpec = specFilter === "All" || r.specialization === specFilter;

      return matchSearch && matchAcc && matchStatus && matchSpec;
    });
  }, [requests, searchTerm, accommodationFilter, statusFilter, specFilter]);

  /* ---------- Handlers ---------- */
  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setTempHall(req.assignedHall || "");
    setTempScribe(req.scribeAssigned || "None");
    setTempExtraTime(req.extraTimeMinutes || 0);
    setTempStatus(req.boardStatus || "Approved by Faculty Board");
    setTempNotes(req.officerNotes || "");
  };

  const handleSaveDecision = () => {
    if (!selectedRequest) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === selectedRequest.id) {
          return {
            ...r,
            assignedHall: tempHall,
            scribeAssigned: tempScribe,
            extraTimeMinutes: Number(tempExtraTime),
            boardStatus: tempStatus,
            officerNotes: tempNotes,
          };
        }
        return r;
      })
    );

    triggerToast(`Accommodations saved for ${selectedRequest.regNo}`);
    setSelectedRequest(null);
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!newReq.regNo || !newReq.name || !newReq.condition) {
      triggerToast("Please provide Registration No, Name, and Medical Condition.");
      return;
    }

    const created = {
      id: `SN-2026-${String(requests.length + 1).padStart(3, "0")}`,
      regNo: newReq.regNo.toUpperCase(),
      name: newReq.name,
      programme: "BICT (Hons)",
      specialization: newReq.specialization,
      semester: newReq.semester,
      condition: newReq.condition,
      accommodations: [newReq.accommodationType],
      assignedHall: newReq.assignedHall,
      scribeAssigned: newReq.scribeAssigned,
      boardStatus: "Under UMO Review",
      umoEndorsement: "Pending Formal Verification",
      medicalDocRef: newReq.medicalDocRef || "MED-PENDING",
      extraTimeMinutes: Number(newReq.extraTimeMinutes),
      officerNotes: newReq.officerNotes || "Logged by Examination Officer for upcoming exam session.",
    };

    setRequests([created, ...requests]);
    triggerToast(`Logged special needs request for ${created.regNo}`);
    setShowLogModal(false);
    setNewReq({
      regNo: "",
      name: "",
      specialization: "Software Systems",
      semester: "Semester 05",
      condition: "",
      accommodationType: "Extra Time (30 mins/paper)",
      assignedHall: "Special Examination Room S-01",
      scribeAssigned: "None",
      extraTimeMinutes: 30,
      medicalDocRef: "",
      officerNotes: "",
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setAccommodationFilter("All");
    setStatusFilter("All");
    setSpecFilter("All");
    setActiveStatFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = activeStatFilter === filterValue ? "All" : filterValue;
    setActiveStatFilter(next);
    setSearchTerm("");
    setSpecFilter("All");

    if (next === "ExtraTime") {
      setAccommodationFilter("ExtraTime");
      setStatusFilter("All");
    } else if (next === "SpecialVenue") {
      setAccommodationFilter("SpecialVenue");
      setStatusFilter("All");
    } else if (next === "Approved") {
      setAccommodationFilter("All");
      setStatusFilter("Approved");
    } else {
      setAccommodationFilter("All");
      setStatusFilter("All");
    }

    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sn-page">
      {/* ====================================================================
          1. STATS CARDS (click a card to filter the table)
          ==================================================================== */}
      <section className="sn-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && activeStatFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`sn-stat-card sn-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="sn-stat-head">
                <div className={`sn-stat-icon sn-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`sn-stat-pill sn-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="sn-stat-body">
                <span className="sn-stat-label">{card.label}</span>
                <span className="sn-stat-val">{card.value}</span>
                <span className="sn-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          2. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="sn-panel" ref={tableRef}>
        <div className="sn-panel-header">
          <div>
            <h3 className="sn-panel-title">Special Accommodations Registry</h3>
            <p className="sn-panel-desc">
              Audit candidate conditions, allocate specialized examination rooms, and configure invigilator instructions.
            </p>
          </div>
          <div className="sn-header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              className="sn-btn sn-btn-outline"
              onClick={() => setShowSupervisorDossier(true)}
            >
              Invigilator Dossier
            </button>
            <button
              type="button"
              className="sn-btn sn-btn-primary"
              onClick={() => setShowLogModal(true)}
            >
              + Log Special Request
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {activeStatFilter !== "All" && (
          <p className="sn-active-filter">
            Showing only <strong>{FILTER_LABELS[activeStatFilter]}</strong> candidates ({filteredRequests.length})
            <button
              type="button"
              className="sn-btn sn-btn-outline"
              onClick={resetFilters}
            >
              Show all
            </button>
          </p>
        )}

        {/* Filter Toolbar */}
        <div className="sn-filter-toolbar">
          <div className="sn-search-wrap">
            <svg className="sn-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="sn-input sn-search-input"
              placeholder="Search by student name, reg no, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sn-filter-group">
            <select
              className="sn-select"
              value={accommodationFilter}
              onChange={(e) => {
                setAccommodationFilter(e.target.value);
                setActiveStatFilter(
                  e.target.value === "ExtraTime" || e.target.value === "SpecialVenue"
                    ? e.target.value
                    : "All"
                );
              }}
            >
              <option value="All">All Accommodation Types</option>
              <option value="ExtraTime">Extra Time Granted</option>
              <option value="SpecialVenue">Special Venues (Ground/Separate)</option>
              <option value="Scribe">Scribe / Amanuensis</option>
              <option value="GroundFloor">Ground Floor Seating</option>
              <option value="SpecialRoom">Special Examination Room</option>
            </select>

            <select
              className="sn-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActiveStatFilter(e.target.value === "Approved" ? "Approved" : "All");
              }}
            >
              <option value="All">All Approval Statuses</option>
              <option value="Approved">Approved by Faculty Board</option>
              <option value="Pending">Pending Faculty Board</option>
              <option value="Review">Under UMO Review</option>
            </select>

            <select
              className="sn-select"
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>

            {(searchTerm || accommodationFilter !== "All" || statusFilter !== "All" || specFilter !== "All") && (
              <button
                type="button"
                className="sn-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="sn-table-container">
          <table className="sn-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Medical Condition</th>
                <th>Approved Accommodations</th>
                <th>Assigned Hall &amp; Desk</th>
                <th>Scribe / Assistant</th>
                <th>Faculty Board Status</th>
                <th className="sn-th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="sn-empty-cell">
                    <p>No special needs records match the specified filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id}>
                    {/* 1. Candidate Details */}
                    <td>
                      <div className="sn-student-meta">
                        <span className="sn-student-avatar">
                          {r.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <div className="sn-student-name">{r.name}</div>
                          <div className="sn-student-reg">{r.regNo} · {r.specialization}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Condition */}
                    <td>
                      <div className="sn-condition-text">{r.condition}</div>
                      <div className="sn-doc-ref">Ref: {r.medicalDocRef}</div>
                    </td>

                    {/* 3. Accommodations */}
                    <td>
                      <div className="sn-chip-wrap">
                        {r.extraTimeMinutes > 0 && (
                          <span className="sn-chip sn-chip-amber">
                            +{r.extraTimeMinutes}m Extra Time
                          </span>
                        )}
                        {r.accommodations.map((acc, idx) => (
                          <span key={idx} className="sn-chip sn-chip-blue">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 4. Assigned Hall */}
                    <td>
                      <div className="sn-hall-tag">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{r.assignedHall}</span>
                      </div>
                    </td>

                    {/* 5. Scribe */}
                    <td>
                      <span className={r.scribeAssigned !== "None" ? "sn-scribe-active" : "sn-scribe-none"}>
                        {r.scribeAssigned}
                      </span>
                    </td>

                    {/* 6. Board Status */}
                    <td>
                      <span
                        className={`sn-status-badge ${
                          r.boardStatus.includes("Approved")
                            ? "sn-status-green"
                            : r.boardStatus.includes("Pending")
                            ? "sn-status-amber"
                            : "sn-status-purple"
                        }`}
                      >
                        {r.boardStatus}
                      </span>
                      <div className="sn-umo-sub">{r.umoEndorsement}</div>
                    </td>

                    {/* 7. Action Button */}
                    <td>
                      <button
                        type="button"
                        className="sn-action-btn sn-btn-inspect"
                        onClick={() => handleOpenDetail(r)}
                      >
                        Audit &amp; Allocate
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
          4. AUDIT & HALL ALLOCATION MODAL
          ==================================================================== */}
      {selectedRequest && (
        <div className="sn-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="sn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sn-modal-header">
              <div>
                <span className="sn-modal-tag">SPECIAL NEEDS EXAMINATION AUDIT</span>
                <h2 className="sn-modal-title">{selectedRequest.name} ({selectedRequest.regNo})</h2>
                <span className="sn-modal-subtitle">
                  {selectedRequest.programme} · {selectedRequest.specialization} · Case ID: {selectedRequest.id}
                </span>
              </div>
              <button
                type="button"
                className="sn-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                &times;
              </button>
            </div>

            <div className="sn-modal-body">
              {/* Info Grid */}
              <div className="sn-info-banner">
                <div className="sn-info-item">
                  <span className="sn-info-lbl">Verified Condition</span>
                  <span className="sn-info-val">{selectedRequest.condition}</span>
                </div>
                <div className="sn-info-item">
                  <span className="sn-info-lbl">Medical Reference</span>
                  <span className="sn-info-val">{selectedRequest.medicalDocRef}</span>
                </div>
                <div className="sn-info-item">
                  <span className="sn-info-lbl">UMO Endorsement</span>
                  <span className="sn-info-val">{selectedRequest.umoEndorsement}</span>
                </div>
                <div className="sn-info-item">
                  <span className="sn-info-lbl">Faculty Board Status</span>
                  <span className="sn-info-val">{selectedRequest.boardStatus}</span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="sn-form-grid">
                <div className="sn-form-group">
                  <label className="sn-field-label">Assigned Examination Venue / Hall *</label>
                  <input
                    type="text"
                    className="sn-input"
                    value={tempHall}
                    onChange={(e) => setTempHall(e.target.value)}
                    placeholder="e.g. Special Examination Room S-01 (Ground Floor)"
                  />
                </div>

                <div className="sn-form-group">
                  <label className="sn-field-label">Assigned Scribe / Amanuensis</label>
                  <input
                    type="text"
                    className="sn-input"
                    value={tempScribe}
                    onChange={(e) => setTempScribe(e.target.value)}
                    placeholder="e.g. K.M. Aslam (Demonstrator) or None"
                  />
                </div>

                <div className="sn-form-group">
                  <label className="sn-field-label">Extra Time Allowance (Minutes)</label>
                  <select
                    className="sn-select"
                    value={tempExtraTime}
                    onChange={(e) => setTempExtraTime(e.target.value)}
                  >
                    <option value={0}>No Extra Time (Standard Duration)</option>
                    <option value={15}>+15 Minutes per paper</option>
                    <option value={20}>+20 Minutes per paper</option>
                    <option value={30}>+30 Minutes per paper (Standard Allowance)</option>
                    <option value={45}>+45 Minutes per paper</option>
                    <option value={60}>+60 Minutes (Double Time Exception)</option>
                  </select>
                </div>

                <div className="sn-form-group">
                  <label className="sn-field-label">Faculty Board Ratification Status</label>
                  <select
                    className="sn-select"
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                  >
                    <option value="Approved by Faculty Board">Approved by Faculty Board</option>
                    <option value="Pending Faculty Board">Pending Faculty Board (Tabled for next meeting)</option>
                    <option value="Under UMO Review">Under UMO Review (Awaiting Medical Endorsement)</option>
                  </select>
                </div>
              </div>

              <div className="sn-form-group">
                <label className="sn-field-label">Examination Officer &amp; Invigilator Instructions</label>
                <textarea
                  className="sn-textarea"
                  rows="3"
                  placeholder="Record specific invigilation instructions, seating placement, or emergency medical kit authorizations..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="sn-modal-footer">
              <button
                type="button"
                className="sn-btn sn-btn-outline"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sn-btn sn-btn-primary"
                onClick={handleSaveDecision}
              >
                Save Accommodations &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. LOG NEW SPECIAL REQUEST MODAL
          ==================================================================== */}
      {showLogModal && (
        <div className="sn-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="sn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sn-modal-header">
              <div>
                <span className="sn-modal-tag">SPECIAL NEEDS INTAKE</span>
                <h2 className="sn-modal-title">Register Special Accommodation Request</h2>
                <span className="sn-modal-subtitle">
                  Record new special needs request under Faculty Handbook Section 4.5.
                </span>
              </div>
              <button
                type="button"
                className="sn-close-btn"
                onClick={() => setShowLogModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="sn-modal-body">
                <div className="sn-form-grid">
                  <div className="sn-form-group">
                    <label className="sn-field-label">Student Registration No *</label>
                    <input
                      type="text"
                      className="sn-input"
                      placeholder="e.g. 22ICT077"
                      value={newReq.regNo}
                      onChange={(e) => setNewReq({ ...newReq, regNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Student Full Name *</label>
                    <input
                      type="text"
                      className="sn-input"
                      placeholder="e.g. M.S. Rikas"
                      value={newReq.name}
                      onChange={(e) => setNewReq({ ...newReq, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Specialization</label>
                    <select
                      className="sn-select"
                      value={newReq.specialization}
                      onChange={(e) => setNewReq({ ...newReq, specialization: e.target.value })}
                    >
                      <option value="Software Systems">Software Systems</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Network Systems">Network Systems</option>
                    </select>
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Semester</label>
                    <select
                      className="sn-select"
                      value={newReq.semester}
                      onChange={(e) => setNewReq({ ...newReq, semester: e.target.value })}
                    >
                      <option value="Semester 03">Semester 03</option>
                      <option value="Semester 05">Semester 05</option>
                    </select>
                  </div>
                </div>

                <div className="sn-form-group">
                  <label className="sn-field-label">Medical Condition / Disability Justification *</label>
                  <input
                    type="text"
                    className="sn-input"
                    placeholder="e.g. Right hand bone fracture, Visual impairment, Mobility constraint"
                    value={newReq.condition}
                    onChange={(e) => setNewReq({ ...newReq, condition: e.target.value })}
                    required
                  />
                </div>

                <div className="sn-form-grid">
                  <div className="sn-form-group">
                    <label className="sn-field-label">Primary Accommodation Requested *</label>
                    <select
                      className="sn-select"
                      value={newReq.accommodationType}
                      onChange={(e) => setNewReq({ ...newReq, accommodationType: e.target.value })}
                    >
                      <option value="Extra Time (30 mins/paper)">Extra Time (30 mins/paper)</option>
                      <option value="Scribe / Amanuensis Assistance">Scribe / Amanuensis Assistance</option>
                      <option value="Ground Floor Seating (Wheelchair Accessible)">Ground Floor Seating (Wheelchair Accessible)</option>
                      <option value="Separate Low-Distraction Examination Room">Separate Low-Distraction Examination Room</option>
                      <option value="Enlarged Question Paper (18pt/24pt A3)">Enlarged Question Paper (18pt/24pt A3)</option>
                      <option value="Medical Device / Medication Permission">Medical Device / Medication Permission</option>
                    </select>
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Extra Time Allowance</label>
                    <select
                      className="sn-select"
                      value={newReq.extraTimeMinutes}
                      onChange={(e) => setNewReq({ ...newReq, extraTimeMinutes: e.target.value })}
                    >
                      <option value={0}>0 Minutes (No extra time)</option>
                      <option value={15}>+15 Minutes</option>
                      <option value={30}>+30 Minutes (Recommended)</option>
                      <option value={45}>+45 Minutes</option>
                    </select>
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Assigned Venue / Hall</label>
                    <input
                      type="text"
                      className="sn-input"
                      value={newReq.assignedHall}
                      onChange={(e) => setNewReq({ ...newReq, assignedHall: e.target.value })}
                      placeholder="e.g. Special Examination Room S-01"
                    />
                  </div>

                  <div className="sn-form-group">
                    <label className="sn-field-label">Medical Certificate Reference</label>
                    <input
                      type="text"
                      className="sn-input"
                      value={newReq.medicalDocRef}
                      onChange={(e) => setNewReq({ ...newReq, medicalDocRef: e.target.value })}
                      placeholder="e.g. GH-2026-SN-41"
                    />
                  </div>
                </div>

                <div className="sn-form-group">
                  <label className="sn-field-label">Special Invigilator Instructions</label>
                  <textarea
                    className="sn-textarea"
                    rows="2"
                    placeholder="e.g. Ensure desk is near exit; invigilator to check extra time clock."
                    value={newReq.officerNotes}
                    onChange={(e) => setNewReq({ ...newReq, officerNotes: e.target.value })}
                  />
                </div>
              </div>

              <div className="sn-modal-footer">
                <button
                  type="button"
                  className="sn-btn sn-btn-outline"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sn-btn sn-btn-primary">
                  Save &amp; Register Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          6. PRINTABLE SUPERVISOR & INVIGILATOR DOSSIER
          ==================================================================== */}
      {showSupervisorDossier && (
        <div className="sn-modal-overlay" onClick={() => setShowSupervisorDossier(false)}>
          <div className="sn-modal-card sn-dossier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sn-modal-header sn-no-print">
              <div>
                <span className="sn-modal-tag">CHIEF INVIGILATOR BRIEFING DOCUMENT</span>
                <h2 className="sn-modal-title">Schedule of Special Needs Examination Accommodations</h2>
                <span className="sn-modal-subtitle">
                  Academic Session 2025/2026 · Confidential Invigilation Directive
                </span>
              </div>
              <button
                type="button"
                className="sn-close-btn"
                onClick={() => setShowSupervisorDossier(false)}
              >
                &times;
              </button>
            </div>

            <div className="sn-print-letter">
              <div className="sn-letter-head">
                <div className="sn-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
                <div className="sn-uni-sub">FACULTY OF TECHNOLOGY · EXAMINATION UNIT</div>
                <div className="sn-letter-meta">CONFIDENTIAL DIRECTIVE TO CHIEF INVIGILATORS &amp; SUPERVISORS</div>
              </div>

              <div className="sn-letter-divider" />

              <div className="sn-letter-body">
                <p>
                  Under <strong>Faculty Handbook Section 4.5</strong>, the Faculty Board has sanctioned the following special examination accommodations for candidates sitting for the End Semester Assessments. 
                  Chief Invigilators and Hall Supervisors are required to enforce the designated extra time and seating allocations:
                </p>

                <table className="sn-letter-table">
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Candidate Name</th>
                      <th>Assigned Hall &amp; Desk</th>
                      <th>Extra Time Allowance</th>
                      <th>Approved Accommodations</th>
                      <th>Invigilator Directive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.regNo}</strong></td>
                        <td>{r.name}</td>
                        <td><strong>{r.assignedHall}</strong></td>
                        <td>
                          {r.extraTimeMinutes > 0 ? (
                            <strong>+{r.extraTimeMinutes} Minutes</strong>
                          ) : (
                            "Standard Time"
                          )}
                        </td>
                        <td>{r.accommodations.join(", ")}</td>
                        <td>{r.officerNotes || "Follow standard invigilation"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>
                  <strong>Invigilation Instructions:</strong>
                  <br />
                  1. Scribes must strictly transcribe words dictated by the candidate without providing academic guidance.
                  <br />
                  2. Extra time must be calculated from the official end-of-paper bell and logged on the supervisor's session report.
                </p>
              </div>

              <div className="sn-letter-sign-row">
                <div className="sn-sign-box">
                  <div className="sn-sign-line" />
                  <strong>Examination Officer</strong><br />
                  Faculty of Technology
                </div>
                <div className="sn-sign-box">
                  <div className="sn-sign-line" />
                  <strong>Dean / Chairman Board of Examiners</strong><br />
                  Faculty of Technology
                </div>
              </div>
            </div>

            <div className="sn-modal-footer sn-no-print">
              <button
                type="button"
                className="sn-btn sn-btn-outline"
                onClick={() => setShowSupervisorDossier(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="sn-btn sn-btn-primary"
                onClick={() => window.print()}
              >
                Print Invigilator Briefing Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && <div className="sn-toast">{toastMessage}</div>}
    </div>
  );
}
