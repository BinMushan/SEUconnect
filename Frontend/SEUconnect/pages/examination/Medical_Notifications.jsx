import React, { useMemo, useState, useRef } from "react";
import "./Medical_Notifications.css";

/* ==========================================================================
   SAMPLE DATA: MEDICAL NOTIFICATIONS REGISTRY
   ========================================================================== */

const INITIAL_MEDICAL_NOTICES = [
  {
    id: "MED-2026-001",
    regNo: "22ICT056",
    name: "H. Nazeer",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    affectedModule: "IT3022 - Database Systems",
    examDate: "2026-10-18",
    initialNoticeDate: "2026-10-19", // Within 48 hours
    reportedWithin48h: true,
    mcDeadline: "2026-11-01",
    daysRemaining: 10,
    mcStatus: "MC Submitted (Govt Hospital)",
    mcRefNo: "GH-SAM-8841",
    issuingHospital: "Base Hospital Sammanthurai",
    umoEndorsement: "Endorsed by UMO",
    senateDecision: "Pending Senate",
    concessionType: "Proper Candidate (Excused)",
    officerNotes: "Valid medical certificate submitted within 48 hours. Endorsed by University Medical Officer. Escalated to HOD for Senate approval.",
  },
  {
    id: "MED-2026-002",
    regNo: "21ICT064",
    name: "F. Nilufar",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    affectedModule: "IT3012 - Software Engineering",
    examDate: "2026-10-10",
    initialNoticeDate: "2026-10-11",
    reportedWithin48h: true,
    mcDeadline: "2026-10-24",
    daysRemaining: 2, // Near deadline!
    mcStatus: "MC Awaited (Pending Hardcopy)",
    mcRefNo: "Pending",
    issuingHospital: "Awaiting Certificate",
    umoEndorsement: "Pending Submission",
    senateDecision: "Under 2-Week Window",
    concessionType: "Awaiting Documents",
    officerNotes: "Initial sickness notification logged via email. Hardcopy medical certificate must be submitted within 2 days.",
  },
  {
    id: "MED-2026-003",
    regNo: "22ICT089",
    name: "M.A. Akram",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    affectedModule: "IT3032 - Computer Networks",
    examDate: "2026-10-12",
    initialNoticeDate: "2026-10-13",
    reportedWithin48h: true,
    mcDeadline: "2026-10-26",
    daysRemaining: 4,
    mcStatus: "MC Awaited",
    mcRefNo: "Pending",
    issuingHospital: "DGH Ampara (Stated)",
    umoEndorsement: "Pending Submission",
    senateDecision: "Under 2-Week Window",
    concessionType: "Awaiting Documents",
    officerNotes: "Candidate reported dengue fever. Medical officer reminded of Oct 26 submission deadline.",
  },
  {
    id: "MED-2026-004",
    regNo: "21ICT019",
    name: "M.F. Rasheed",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    affectedModule: "IT3042 - Web Technologies",
    examDate: "2026-10-05",
    initialNoticeDate: "2026-10-06",
    reportedWithin48h: true,
    mcDeadline: "2026-10-19",
    daysRemaining: 0,
    mcStatus: "Verified & Endorsed",
    mcRefNo: "TH-BAT-4412",
    issuingHospital: "Teaching Hospital Batticaloa",
    umoEndorsement: "Endorsed by UMO",
    senateDecision: "Approved by Senate",
    concessionType: "Proper Candidate (Excused)",
    officerNotes: "Senate confirmed excused medical absence (Memo SN/2026/104). Student permitted to sit next session as proper candidate without repeat fee.",
  },
  {
    id: "MED-2026-005",
    regNo: "22ICT115",
    name: "S. Divya",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    affectedModule: "IT3052 - Operating Systems",
    examDate: "2026-09-28",
    initialNoticeDate: "2026-10-05", // 7 days later - violated 48h rule!
    reportedWithin48h: false,
    mcDeadline: "2026-10-12",
    daysRemaining: -10,
    mcStatus: "Rejected (Late Report)",
    mcRefNo: "PVT-COL-112",
    issuingHospital: "Private Clinic Colombo",
    umoEndorsement: "Rejected by UMO",
    senateDecision: "Rejected - Time Barred",
    concessionType: "Unexcused Absence (Grade F)",
    officerNotes: "Violated 48-hour notification clause and submitted non-government private prescription. Rejected under Section 4.2.4.",
  },
  {
    id: "MED-2026-006",
    regNo: "23ICT027",
    name: "T. Kumar",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 03",
    affectedModule: "IT3012 - Software Engineering",
    examDate: "2026-10-15",
    initialNoticeDate: "2026-10-16",
    reportedWithin48h: true,
    mcDeadline: "2026-10-29",
    daysRemaining: 7,
    mcStatus: "MC Submitted (Govt Hospital)",
    mcRefNo: "BH-KAL-9021",
    issuingHospital: "Base Hospital Kalmunai",
    umoEndorsement: "Under UMO Review",
    senateDecision: "Pending UMO",
    concessionType: "Attendance Concession",
    officerNotes: "MC submitted for covering 2 weeks of laboratory sessions. Awaiting University Medical Officer confirmation.",
  },
];

const FILTER_LABELS = {
  All: "All Notifications",
  NearDeadline: "Nearing 2-Week Deadline (≤ 4 Days)",
  Review: "Under Board / Senate Review",
  Approved: "Senate Approved",
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function MedicalNotifications() {
  const [notices, setNotices] = useState(INITIAL_MEDICAL_NOTICES);

  // Active Filter & Ref
  const [activeFilter, setActiveFilter] = useState("All");
  const tableRef = useRef(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");

  // Modals
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSenateSchedule, setShowSenateSchedule] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit Modal State
  const [tempDecision, setTempDecision] = useState("");
  const [tempConcession, setTempConcession] = useState("");
  const [tempNotes, setTempNotes] = useState("");

  // New Medical Form State
  const [newNotice, setNewNotice] = useState({
    regNo: "",
    name: "",
    specialization: "Software Systems",
    semester: "Semester 05",
    affectedModule: "IT3012 - Software Engineering",
    examDate: new Date().toISOString().split("T")[0],
    initialNoticeDate: new Date().toISOString().split("T")[0],
    mcRefNo: "",
    issuingHospital: "Base Hospital Sammanthurai",
    officerNotes: "",
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  /* ---------- Statistics Calculation ---------- */
  const stats = useMemo(() => {
    const total = notices.length;
    const nearingDeadline = notices.filter(
      (n) => n.daysRemaining >= 0 && n.daysRemaining <= 4 && n.mcStatus.includes("Awaited")
    ).length;
    const underReview = notices.filter(
      (n) => n.senateDecision === "Pending Senate" || n.senateDecision === "Pending UMO"
    ).length;
    const approved = notices.filter((n) => n.senateDecision === "Approved by Senate").length;

    return { total, nearingDeadline, underReview, approved };
  }, [notices]);

  // Stat Cards Data matching dashboard design
  const statCards = [
    {
      label: "TOTAL NOTIFICATIONS",
      val: stats.total,
      sub: "Across all examination papers",
      badge: "Total",
      color: "blue",
      filter: "All",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </svg>
      ),
    },
    {
      label: "NEARING 2-WEEK DEADLINE",
      val: stats.nearingDeadline,
      sub: "Certificates due to prevent barring",
      badge: "≤ 4 Days",
      color: "red",
      filter: "NearDeadline",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "UNDER BOARD / SENATE REVIEW",
      val: stats.underReview,
      sub: "Submitted & undergoing verification",
      badge: "Review",
      color: "amber",
      filter: "Review",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "SENATE APPROVED",
      val: stats.approved,
      sub: "Excused absence ratified by Senate",
      badge: "Approved",
      color: "green",
      filter: "Approved",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  const handleCardClick = (cardFilter) => {
    if (activeFilter === cardFilter && cardFilter !== "All") {
      setActiveFilter("All");
    } else {
      setActiveFilter(cardFilter);
      setSearchTerm("");
      setStatusFilter("All");
      setUrgencyFilter("All");
      setSpecFilter("All");
    }
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearchTerm("");
    setStatusFilter("All");
    setUrgencyFilter("All");
    setSpecFilter("All");
  };

  /* ---------- Filtered Records ---------- */
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        n.name.toLowerCase().includes(term) ||
        n.regNo.toLowerCase().includes(term) ||
        n.affectedModule.toLowerCase().includes(term) ||
        n.mcRefNo.toLowerCase().includes(term);

      // Active Stat Card Filter
      let matchStat = true;
      if (activeFilter === "NearDeadline") {
        matchStat = n.daysRemaining >= 0 && n.daysRemaining <= 4 && n.mcStatus.includes("Awaited");
      } else if (activeFilter === "Review") {
        matchStat = n.senateDecision === "Pending Senate" || n.senateDecision === "Pending UMO";
      } else if (activeFilter === "Approved") {
        matchStat = n.senateDecision === "Approved by Senate";
      }

      let matchStatus = true;
      if (statusFilter === "Awaited") matchStatus = n.mcStatus.includes("Awaited");
      else if (statusFilter === "Submitted") matchStatus = n.mcStatus.includes("Submitted");
      else if (statusFilter === "Approved") matchStatus = n.senateDecision === "Approved by Senate";
      else if (statusFilter === "Rejected") matchStatus = n.senateDecision.includes("Rejected");

      let matchUrgency = true;
      if (urgencyFilter === "NearDeadline") matchUrgency = n.daysRemaining >= 0 && n.daysRemaining <= 4;
      else if (urgencyFilter === "Overdue") matchUrgency = n.daysRemaining < 0;

      const matchSpec = specFilter === "All" || n.specialization === specFilter;

      return matchSearch && matchStat && matchStatus && matchUrgency && matchSpec;
    });
  }, [notices, searchTerm, activeFilter, statusFilter, urgencyFilter, specFilter]);

  /* ---------- Handlers ---------- */
  const handleOpenDetail = (notice) => {
    setSelectedNotice(notice);
    setTempDecision(notice.senateDecision || "Pending Senate");
    setTempConcession(notice.concessionType || "Proper Candidate (Excused)");
    setTempNotes(notice.officerNotes || "");
  };

  const handleSaveDecision = () => {
    if (!selectedNotice) return;

    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === selectedNotice.id) {
          return {
            ...n,
            senateDecision: tempDecision,
            concessionType: tempConcession,
            officerNotes: tempNotes,
            umoEndorsement:
              tempDecision === "Approved by Senate" ? "Endorsed by UMO" : n.umoEndorsement,
          };
        }
        return n;
      })
    );

    triggerToast(`Medical record updated for ${selectedNotice.regNo}`);
    setSelectedNotice(null);
  };

  const handleLogNewNotice = (e) => {
    e.preventDefault();
    if (!newNotice.regNo || !newNotice.name) {
      triggerToast("Please provide both Registration No and Candidate Name.");
      return;
    }

    // Compute deadline (14 days from exam date)
    const examD = new Date(newNotice.examDate);
    const deadlineD = new Date(examD.getTime() + 14 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffDays = Math.ceil((deadlineD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const createdRecord = {
      id: `MED-2026-${String(notices.length + 1).padStart(3, "0")}`,
      regNo: newNotice.regNo.toUpperCase(),
      name: newNotice.name,
      programme: "BICT (Hons)",
      specialization: newNotice.specialization,
      semester: newNotice.semester,
      affectedModule: newNotice.affectedModule,
      examDate: newNotice.examDate,
      initialNoticeDate: newNotice.initialNoticeDate,
      reportedWithin48h: true,
      mcDeadline: deadlineD.toISOString().split("T")[0],
      daysRemaining: diffDays,
      mcStatus: newNotice.mcRefNo ? "MC Submitted (Govt Hospital)" : "MC Awaited",
      mcRefNo: newNotice.mcRefNo || "Pending Submission",
      issuingHospital: newNotice.issuingHospital,
      umoEndorsement: "Under UMO Review",
      senateDecision: "Pending UMO",
      concessionType: "Proper Candidate (Excused)",
      officerNotes: newNotice.officerNotes || "Initial sickness notification logged by Examination Officer.",
    };

    setNotices([createdRecord, ...notices]);
    triggerToast(`Logged sickness notification for ${createdRecord.regNo}`);
    setShowLogModal(false);
    setNewNotice({
      regNo: "",
      name: "",
      specialization: "Software Systems",
      semester: "Semester 05",
      affectedModule: "IT3012 - Software Engineering",
      examDate: new Date().toISOString().split("T")[0],
      initialNoticeDate: new Date().toISOString().split("T")[0],
      mcRefNo: "",
      issuingHospital: "Base Hospital Sammanthurai",
      officerNotes: "",
    });
  };

  return (
    <div className="mn-page">
      {/* ====================================================================
          1. STATS METRICS ROW (4 Cards with Icon Box & Pill Badge)
          ==================================================================== */}
      <section className="mn-stats-grid">
        {statCards.map((card) => {
          const isActive =
            activeFilter === card.filter ||
            (card.filter === "All" && activeFilter === "All");
          return (
            <button
              type="button"
              key={card.label}
              className={`mn-stat-card mn-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="mn-stat-head">
                <div className={`mn-stat-icon-wrap icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`mn-stat-badge badge-${card.color}`}>
                  {card.badge}
                </span>
              </div>
              <div className="mn-stat-body">
                <span className="mn-stat-label">{card.label}</span>
                <div className="mn-stat-val">{card.val}</div>
                <div className="mn-stat-sub">{card.sub}</div>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          2. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="mn-panel" ref={tableRef}>
        <div className="mn-panel-header">
          <div>
            <h3 className="mn-panel-title">Medical Notifications Registry</h3>
            <p className="mn-panel-desc">
              Track 48-hour sickness reports, monitor 14-day statutory certificate deadlines, and record Senate concessions.
            </p>
          </div>
          <div className="mn-header-actions">
            <button
              type="button"
              className="mn-btn mn-btn-outline"
              onClick={() => setShowSenateSchedule(true)}
            >
              Senate Concession Schedule
            </button>
            <button
              type="button"
              className="mn-btn mn-btn-primary"
              onClick={() => setShowLogModal(true)}
            >
              + Log Sickness Notice
            </button>
          </div>
        </div>

        {/* Active Filter Banner */}
        {activeFilter !== "All" && (
          <div className="mn-active-filter">
            <span>
              Showing only: <strong>{FILTER_LABELS[activeFilter] || activeFilter}</strong> ({filteredNotices.length} record{filteredNotices.length === 1 ? "" : "s"})
            </span>
            <button type="button" className="mn-btn-clear" onClick={resetFilters}>
              Show all
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="mn-filter-toolbar">
          <div className="mn-search-wrap">
            <svg className="mn-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="mn-input mn-search-input"
              placeholder="Search by student name, reg no, or MC ref no..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeFilter !== "All") setActiveFilter("All");
              }}
            />
          </div>

          <div className="mn-filter-group">
            <select
              className="mn-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (activeFilter !== "All") setActiveFilter("All");
              }}
            >
              <option value="All">All Submission Statuses</option>
              <option value="Awaited">MC Awaited (Within 2 Weeks)</option>
              <option value="Submitted">MC Submitted (Under UMO Check)</option>
              <option value="Approved">Senate Approved</option>
              <option value="Rejected">Rejected / Time-Barred</option>
            </select>

            <select
              className="mn-select"
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                if (activeFilter !== "All") setActiveFilter("All");
              }}
            >
              <option value="All">All Timelines</option>
              <option value="NearDeadline">Urgent (&le; 4 Days Left)</option>
              <option value="Overdue">Overdue / Expired</option>
            </select>

            <select
              className="mn-select"
              value={specFilter}
              onChange={(e) => {
                setSpecFilter(e.target.value);
                if (activeFilter !== "All") setActiveFilter("All");
              }}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>

            {(searchTerm || statusFilter !== "All" || urgencyFilter !== "All" || specFilter !== "All" || activeFilter !== "All") && (
              <button
                type="button"
                className="mn-btn-clear"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="mn-table-container">
          <table className="mn-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Affected Module &amp; Date</th>
                <th>48h Notice</th>
                <th>2-Week MC Deadline</th>
                <th>Certificate Details</th>
                <th>Senate Concession Status</th>
                <th className="mn-th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="mn-empty-cell">
                    <p>No medical notifications match the specified filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((n) => {
                  const isUrgent = n.daysRemaining >= 0 && n.daysRemaining <= 4 && n.mcStatus.includes("Awaited");
                  const isExpired = n.daysRemaining < 0 && !n.senateDecision.includes("Approved");

                  return (
                    <tr
                      key={n.id}
                      className={isUrgent ? "mn-row-urgent" : isExpired ? "mn-row-expired" : ""}
                    >
                      {/* 1. Candidate Details */}
                      <td>
                        <div className="mn-student-meta">
                          <span className="mn-student-avatar">
                            {n.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div>
                            <div className="mn-student-name">{n.name}</div>
                            <div className="mn-student-reg">{n.regNo} · {n.specialization}</div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Affected Module */}
                      <td>
                        <div className="mn-mod-title">{n.affectedModule}</div>
                        <div className="mn-mod-date">Exam: {n.examDate}</div>
                      </td>

                      {/* 3. 48-Hour Notice Compliance */}
                      <td>
                        {n.reportedWithin48h ? (
                          <span className="mn-badge mn-badge-green" title={`Reported on ${n.initialNoticeDate}`}>
                            ✓ Within 48h
                          </span>
                        ) : (
                          <span className="mn-badge mn-badge-red" title="Reported after 48h limit">
                            ✕ Late Report
                          </span>
                        )}
                      </td>

                      {/* 4. 2-Week MC Deadline */}
                      <td>
                        <div className="mn-deadline-box">
                          <span className="mn-deadline-date">Due: {n.mcDeadline}</span>
                          {n.daysRemaining > 4 && (
                            <span className="mn-countdown-pill mn-pill-blue">{n.daysRemaining} days left</span>
                          )}
                          {n.daysRemaining >= 0 && n.daysRemaining <= 4 && (
                            <span className="mn-countdown-pill mn-pill-red">⚠ {n.daysRemaining} days left</span>
                          )}
                          {n.daysRemaining < 0 && (
                            <span className="mn-countdown-pill mn-pill-grey">Expired</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Certificate & UMO */}
                      <td>
                        <div className="mn-cert-status">{n.mcStatus}</div>
                        <div className="mn-cert-meta">
                          {n.mcRefNo !== "Pending" ? `Ref: ${n.mcRefNo}` : n.issuingHospital}
                        </div>
                      </td>

                      {/* 6. Senate Concession Status */}
                      <td>
                        <span
                          className={`mn-status-pill ${
                            n.senateDecision === "Approved by Senate"
                              ? "mn-status-green"
                              : n.senateDecision === "Pending Senate" || n.senateDecision === "Pending UMO"
                              ? "mn-status-amber"
                              : n.senateDecision.includes("Under")
                              ? "mn-status-blue"
                              : "mn-status-red"
                          }`}
                        >
                          {n.senateDecision}
                        </span>
                        <span className="mn-concession-hint">{n.concessionType}</span>
                      </td>

                      {/* 7. Action Button */}
                      <td>
                        <button
                          type="button"
                          className="mn-action-btn mn-btn-inspect"
                          onClick={() => handleOpenDetail(n)}
                        >
                          Review &amp; Edit
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
          3. VERIFICATION & DECISION MODAL
          ==================================================================== */}
      {selectedNotice && (
        <div className="mn-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="mn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-header">
              <div>
                <span className="mn-modal-tag">MEDICAL ABSENCE AUDIT</span>
                <h2 className="mn-modal-title">{selectedNotice.name} ({selectedNotice.regNo})</h2>
                <span className="mn-modal-subtitle">
                  {selectedNotice.programme} · {selectedNotice.specialization} · Case ID: {selectedNotice.id}
                </span>
              </div>
              <button
                type="button"
                className="mn-close-btn"
                onClick={() => setSelectedNotice(null)}
              >
                &times;
              </button>
            </div>

            <div className="mn-modal-body">
              {/* Information Grid */}
              <div className="mn-info-banner">
                <div className="mn-info-item">
                  <span className="mn-info-lbl">Affected Paper</span>
                  <span className="mn-info-val">{selectedNotice.affectedModule}</span>
                </div>
                <div className="mn-info-item">
                  <span className="mn-info-lbl">Exam Date</span>
                  <span className="mn-info-val">{selectedNotice.examDate}</span>
                </div>
                <div className="mn-info-item">
                  <span className="mn-info-lbl">48-Hour Notice Compliance</span>
                  <span className="mn-info-val">
                    {selectedNotice.reportedWithin48h ? "✓ Valid (Reported in time)" : "✕ Violated (>48h)"}
                  </span>
                </div>
                <div className="mn-info-item">
                  <span className="mn-info-lbl">2-Week Statutory Window</span>
                  <span className="mn-info-val">Deadline: {selectedNotice.mcDeadline}</span>
                </div>
                <div className="mn-info-item">
                  <span className="mn-info-lbl">Medical Certificate Ref</span>
                  <span className="mn-info-val">{selectedNotice.mcRefNo}</span>
                </div>
                <div className="mn-info-item">
                  <span className="mn-info-lbl">Issuing Health Facility</span>
                  <span className="mn-info-val">{selectedNotice.issuingHospital}</span>
                </div>
              </div>

              {/* Handbook Rules Alert */}
              <div className="mn-advisory-box">
                <strong>Handbook Section 4.3.2 Concession Standard:</strong> If confirmed as genuine by the University Medical Officer (UMO) and approved by the Senate, the absence will not be counted as an attempt. The student is granted <strong>Proper Candidate</strong> status for the next scheduled examination.
              </div>

              {/* Form Controls */}
              <div className="mn-form-group">
                <label className="mn-field-label">Senate / Faculty Board Concession Decision</label>
                <select
                  className="mn-select"
                  value={tempDecision}
                  onChange={(e) => setTempDecision(e.target.value)}
                >
                  <option value="Approved by Senate">Approved by Senate (Proper Candidate Status)</option>
                  <option value="Pending Senate">Pending Senate (Awaiting Board Meeting)</option>
                  <option value="Pending UMO">Pending UMO (Awaiting Medical Officer Verification)</option>
                  <option value="Under 2-Week Window">Under 2-Week Window (Awaiting Hardcopy MC)</option>
                  <option value="Rejected - Time Barred">Rejected - Time Barred (&gt; 2 Weeks / Late Notice)</option>
                  <option value="Rejected - Invalid MC">Rejected - Non-Recognized Certificate</option>
                </select>
              </div>

              <div className="mn-form-group">
                <label className="mn-field-label">Concession Classification</label>
                <select
                  className="mn-select"
                  value={tempConcession}
                  onChange={(e) => setTempConcession(e.target.value)}
                >
                  <option value="Proper Candidate (Excused)">Proper Candidate (Excused Absence - 1st Attempt Preserved)</option>
                  <option value="Attendance Concession">Attendance Concession (Permitted to sit ESA)</option>
                  <option value="Awaiting Documents">Awaiting Documents</option>
                  <option value="Unexcused Absence (Grade F)">Unexcused Absence (Grade F / Repeat Required)</option>
                </select>
              </div>

              <div className="mn-form-group">
                <label className="mn-field-label">Examination Officer Audit Remarks</label>
                <textarea
                  className="mn-textarea"
                  rows="3"
                  placeholder="Record UMO verification date, hospital admission dates, or Senate memo references..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="mn-modal-footer">
              <button
                type="button"
                className="mn-btn mn-btn-outline"
                onClick={() => setSelectedNotice(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mn-btn mn-btn-primary"
                onClick={handleSaveDecision}
              >
                Save Decision &amp; Update Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. LOG NEW SICKNESS NOTIFICATION MODAL
          ==================================================================== */}
      {showLogModal && (
        <div className="mn-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="mn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-header">
              <div>
                <span className="mn-modal-tag">EXAMINATION ABSENCE REPORT</span>
                <h2 className="mn-modal-title">Log New Sickness Notification</h2>
                <span className="mn-modal-subtitle">
                  Record immediate sickness report within the 48-hour statutory window.
                </span>
              </div>
              <button
                type="button"
                className="mn-close-btn"
                onClick={() => setShowLogModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLogNewNotice}>
              <div className="mn-modal-body">
                <div className="mn-form-grid">
                  <div className="mn-form-group">
                    <label className="mn-field-label">Student Registration No *</label>
                    <input
                      type="text"
                      className="mn-input"
                      placeholder="e.g. 22ICT099"
                      value={newNotice.regNo}
                      onChange={(e) => setNewNotice({ ...newNotice, regNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Student Full Name *</label>
                    <input
                      type="text"
                      className="mn-input"
                      placeholder="e.g. S.M. Perera"
                      value={newNotice.name}
                      onChange={(e) => setNewNotice({ ...newNotice, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Specialization</label>
                    <select
                      className="mn-select"
                      value={newNotice.specialization}
                      onChange={(e) => setNewNotice({ ...newNotice, specialization: e.target.value })}
                    >
                      <option value="Software Systems">Software Systems</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Network Systems">Network Systems</option>
                    </select>
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Semester</label>
                    <select
                      className="mn-select"
                      value={newNotice.semester}
                      onChange={(e) => setNewNotice({ ...newNotice, semester: e.target.value })}
                    >
                      <option value="Semester 03">Semester 03</option>
                      <option value="Semester 05">Semester 05</option>
                    </select>
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Affected Course Module *</label>
                    <input
                      type="text"
                      className="mn-input"
                      placeholder="e.g. IT3012 - Software Engineering"
                      value={newNotice.affectedModule}
                      onChange={(e) => setNewNotice({ ...newNotice, affectedModule: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Exam Paper Date *</label>
                    <input
                      type="date"
                      className="mn-input"
                      value={newNotice.examDate}
                      onChange={(e) => setNewNotice({ ...newNotice, examDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Issuing Health Facility / Hospital</label>
                    <input
                      type="text"
                      className="mn-input"
                      placeholder="e.g. Base Hospital Sammanthurai"
                      value={newNotice.issuingHospital}
                      onChange={(e) => setNewNotice({ ...newNotice, issuingHospital: e.target.value })}
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-field-label">Medical Certificate Ref No (If available)</label>
                    <input
                      type="text"
                      className="mn-input"
                      placeholder="e.g. GH-2026-9921 (or leave blank if pending)"
                      value={newNotice.mcRefNo}
                      onChange={(e) => setNewNotice({ ...newNotice, mcRefNo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mn-form-group">
                  <label className="mn-field-label">Initial Communication Notes</label>
                  <textarea
                    className="mn-textarea"
                    rows="2"
                    placeholder="e.g. Email received from student stating sudden fever; advised to submit government MC within 14 days."
                    value={newNotice.officerNotes}
                    onChange={(e) => setNewNotice({ ...newNotice, officerNotes: e.target.value })}
                  />
                </div>
              </div>

              <div className="mn-modal-footer">
                <button
                  type="button"
                  className="mn-btn mn-btn-outline"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="mn-btn mn-btn-primary">
                  Save &amp; Generate Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. SENATE CONCESSION SCHEDULE (PRINTABLE DOSSIER)
          ==================================================================== */}
      {showSenateSchedule && (
        <div className="mn-modal-overlay" onClick={() => setShowSenateSchedule(false)}>
          <div className="mn-modal-card mn-dossier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-header mn-no-print">
              <div>
                <span className="mn-modal-tag">FACULTY BOARD &amp; SENATE SCHEDULE</span>
                <h2 className="mn-modal-title">Schedule of Medical Notifications &amp; Concessions</h2>
                <span className="mn-modal-subtitle">
                  Academic Session 2025/2026 · Submission to the Board of Examiners
                </span>
              </div>
              <button
                type="button"
                className="mn-close-btn"
                onClick={() => setShowSenateSchedule(false)}
              >
                &times;
              </button>
            </div>

            {/* Printable Memo */}
            <div className="mn-print-letter">
              <div className="mn-letter-head">
                <div className="mn-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
                <div className="mn-uni-sub">FACULTY OF TECHNOLOGY · EXAMINATION UNIT</div>
                <div className="mn-letter-meta">SUBMISSION OF MEDICAL NOTIFICATIONS TO THE BOARD OF EXAMINERS</div>
              </div>

              <div className="mn-letter-divider" />

              <div className="mn-letter-body">
                <p>
                  <strong>Subject:</strong> Schedule of candidates absent from End Semester Assessment (ESA) papers on medical grounds under <strong>Faculty Handbook Section 4.2.4 &amp; 4.3.2</strong>.
                </p>
                <p>
                  The following medical certificates have been received, verified against the statutory 48-hour and 14-day rules, and checked by the University Medical Officer (UMO) for Senate ratification:
                </p>

                <table className="mn-letter-table">
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Candidate Name</th>
                      <th>Affected Module</th>
                      <th>Exam Date</th>
                      <th>MC Reference &amp; Hospital</th>
                      <th>Recommended Concession</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((n) => (
                      <tr key={n.id}>
                        <td><strong>{n.regNo}</strong></td>
                        <td>{n.name}</td>
                        <td>{n.affectedModule}</td>
                        <td>{n.examDate}</td>
                        <td>{n.mcRefNo !== "Pending" ? n.mcRefNo : "Pending submission"} ({n.issuingHospital})</td>
                        <td>
                          <strong>{n.concessionType}</strong><br />
                          <small>({n.senateDecision})</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mn-letter-sign-row">
                <div className="mn-sign-box">
                  <div className="mn-sign-line" />
                  <strong>Examination Officer</strong><br />
                  Faculty of Technology
                </div>
                <div className="mn-sign-box">
                  <div className="mn-sign-line" />
                  <strong>University Medical Officer (UMO)</strong><br />
                  SEUSL Health Centre
                </div>
                <div className="mn-sign-box">
                  <div className="mn-sign-line" />
                  <strong>Dean of the Faculty</strong><br />
                  Faculty of Technology
                </div>
              </div>
            </div>

            <div className="mn-modal-footer mn-no-print">
              <button
                type="button"
                className="mn-btn mn-btn-outline"
                onClick={() => setShowSenateSchedule(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="mn-btn mn-btn-primary"
                onClick={() => window.print()}
              >
                Print Schedule for Senate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback */}
      {toastMessage && <div className="mn-toast">{toastMessage}</div>}
    </div>
  );
}
