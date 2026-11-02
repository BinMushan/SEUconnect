import React, { useMemo, useState, useRef } from "react";
import "./Eligibility_Verification.css";

/* ==========================================================================
   SAMPLE DATA: SUBJECTS & CANDIDATES (Replaced with API in production)
   ========================================================================== */

const COURSE_MODULES = [
  {
    code: "IT3012",
    name: "Software Engineering",
    lecturer: "Dr. K. Cassim",
    totalHours: 45,
  },
  {
    code: "IT3022",
    name: "Database Systems",
    lecturer: "Prof. S. Riyas",
    totalHours: 45,
  },
  {
    code: "IT3032",
    name: "Computer Networks",
    lecturer: "Eng. M. Faleel",
    totalHours: 45,
  },
  {
    code: "IT3042",
    name: "Web Technologies",
    lecturer: "Dr. A. Ilmudeen",
    totalHours: 45,
  },
  {
    code: "IT3052",
    name: "Operating Systems",
    lecturer: "Mr. T. Subahan",
    totalHours: 45,
  },
  {
    code: "IT3062",
    name: "Information Security",
    lecturer: "Dr. R. Nafeez",
    totalHours: 45,
  },
];

const INITIAL_STUDENTS = [
  {
    regNo: "22ICT041",
    name: "K.P. Silva",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 41, total: 45 },
      { code: "IT3022", attended: 40, total: 45 },
      { code: "IT3032", attended: 39, total: 45 },
      { code: "IT3042", attended: 42, total: 45 },
      { code: "IT3052", attended: 38, total: 45 },
      { code: "IT3062", attended: 39, total: 45 },
    ],
    officerRemarks:
      "All course registrations cleared and attendance criteria met.",
    overrideStatus: null,
  },
  {
    regNo: "22ICT078",
    name: "A.N. Perera",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 33, total: 45 }, // 73%
      { code: "IT3022", attended: 35, total: 45 }, // 77%
      { code: "IT3032", attended: 37, total: 45 }, // 82%
      { code: "IT3042", attended: 31, total: 45 }, // 68%
      { code: "IT3052", attended: 34, total: 45 }, // 75%
    ],
    officerRemarks:
      "Barred from ESA in IT3012, IT3022, IT3042, IT3052 due to sub-80% attendance.",
    overrideStatus: null,
  },
  {
    regNo: "21ICT019",
    name: "M.F. Rasheed",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "Repeat (2nd)",
    subjectRecords: [
      { code: "IT3012", attended: 37, total: 45 },
      { code: "IT3022", attended: 38, total: 45 },
      { code: "IT3032", attended: 36, total: 45 },
      { code: "IT3042", attended: 40, total: 45 },
      { code: "IT3052", attended: 38, total: 45 },
      { code: "IT3062", attended: 37, total: 45 },
    ],
    officerRemarks: "Repeat candidate. Attendance requirement satisfied.",
    overrideStatus: null,
  },
  {
    regNo: "22ICT103",
    name: "S. Jayasuriya",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 41, total: 45 },
      { code: "IT3022", attended: 42, total: 45 },
      { code: "IT3032", attended: 39, total: 45 },
      { code: "IT3042", attended: 41, total: 45 },
      { code: "IT3052", attended: 40, total: 45 },
    ],
    officerRemarks: "Cleared for End Semester Assessment.",
    overrideStatus: null,
  },
  {
    regNo: "22ICT056",
    name: "H. Nazeer",
    programme: "BICT (Hons)",
    specialization: "Software Systems",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "Medical Submitted (Pending Board)",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 39, total: 45 },
      { code: "IT3022", attended: 34, total: 45 }, // 75.5% (Covered by Medical MC-2026-08)
      { code: "IT3032", attended: 40, total: 45 },
      { code: "IT3042", attended: 38, total: 45 },
      { code: "IT3052", attended: 39, total: 45 },
      { code: "IT3062", attended: 41, total: 45 },
    ],
    officerRemarks:
      "Govt hospital MC submitted within 2 weeks. Awaiting Faculty Board confirmation.",
    overrideStatus: "Medical Concession Pending",
  },
  {
    regNo: "23ICT012",
    name: "R. Fernando",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 03",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 43, total: 45 },
      { code: "IT3022", attended: 41, total: 45 },
      { code: "IT3032", attended: 40, total: 45 },
      { code: "IT3042", attended: 42, total: 45 },
      { code: "IT3052", attended: 41, total: 45 },
    ],
    officerRemarks: "Satisfies all eligibility conditions.",
    overrideStatus: null,
  },
  {
    regNo: "23ICT027",
    name: "T. Kumar",
    programme: "BICT (Hons)",
    specialization: "Network Systems",
    semester: "Semester 03",
    academicYear: "2025/2026",
    registrationStatus: "Verified",
    medicalNotice: "None",
    attempt: "1st Attempt",
    subjectRecords: [
      { code: "IT3012", attended: 35, total: 45 }, // 77.7%
      { code: "IT3022", attended: 39, total: 45 },
      { code: "IT3032", attended: 40, total: 45 },
      { code: "IT3042", attended: 41, total: 45 },
      { code: "IT3052", attended: 39, total: 45 },
    ],
    officerRemarks: "Deficient in IT3012 (77.7%). No medical excuse lodged.",
    overrideStatus: null,
  },
  {
    regNo: "21ICT064",
    name: "F. Nilufar",
    programme: "BICT (Hons)",
    specialization: "Data Science",
    semester: "Semester 05",
    academicYear: "2025/2026",
    registrationStatus: "Pending Dean Signature",
    medicalNotice: "Medical Pending",
    attempt: "Repeat (3rd)",
    subjectRecords: [
      { code: "IT3012", attended: 38, total: 45 },
      { code: "IT3022", attended: 39, total: 45 },
      { code: "IT3032", attended: 37, total: 45 },
      { code: "IT3042", attended: 38, total: 45 },
      { code: "IT3052", attended: 40, total: 45 },
      { code: "IT3062", attended: 37, total: 45 },
    ],
    officerRemarks:
      "Subject registration payment receipt pending Dean's endorsement.",
    overrideStatus: null,
  },
];

/* ==========================================================================
   HELPERS & CALCULATION LOGIC
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

function calculateStudentEligibility(student) {
  // Check registration
  const isRegVerified = student.registrationStatus === "Verified";

  // Check per-subject attendance percentages
  const subjectsWithPct = student.subjectRecords.map((s) => {
    const pct = Math.round((s.attended / s.total) * 100);
    const modInfo = COURSE_MODULES.find((m) => m.code === s.code) || {};
    return {
      ...s,
      percentage: pct,
      isPassed: pct >= 80,
      name: modInfo.name || s.code,
      lecturer: modInfo.lecturer || "Assigned Lecturer",
    };
  });

  const failedSubjects = subjectsWithPct.filter((s) => !s.isPassed);
  const totalAttended = student.subjectRecords.reduce(
    (acc, s) => acc + s.attended,
    0,
  );
  const totalHours = student.subjectRecords.reduce(
    (acc, s) => acc + s.total,
    0,
  );
  const overallPct = Math.round((totalAttended / totalHours) * 100);

  // If officer already applied an override (e.g., Faculty Board approved)
  if (student.overrideStatus === "Exemption Granted") {
    return {
      status: "Eligible (Exemption)",
      badgeClass: "ev-badge-green",
      overallPct,
      failedSubjects,
      subjectsWithPct,
      isRegVerified,
      reason: "Faculty Board exemption granted upon medical validation.",
    };
  }

  if (student.overrideStatus === "Medical Concession Pending") {
    return {
      status: "Under Medical Review",
      badgeClass: "ev-badge-amber",
      overallPct,
      failedSubjects,
      subjectsWithPct,
      isRegVerified,
      reason: `Medical certificate under evaluation for: ${failedSubjects.map((f) => f.code).join(", ")}`,
    };
  }

  if (!isRegVerified) {
    return {
      status: "Registration Incomplete",
      badgeClass: "ev-badge-purple",
      overallPct,
      failedSubjects,
      subjectsWithPct,
      isRegVerified,
      reason: `Registration holds pending: ${student.registrationStatus}`,
    };
  }

  if (failedSubjects.length > 0) {
    return {
      status: "Barred from ESA",
      badgeClass: "ev-badge-red",
      overallPct,
      failedSubjects,
      subjectsWithPct,
      isRegVerified,
      reason: `Attendance below 80% in: ${failedSubjects.map((f) => `${f.code} (${f.percentage}%)`).join(", ")}`,
    };
  }

  return {
    status: "Eligible",
    badgeClass: "ev-badge-green",
    overallPct,
    failedSubjects: [],
    subjectsWithPct,
    isRegVerified,
    reason: "Satisfies all Faculty attendance & registration criteria.",
  };
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function EligibilityVerification() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noticeStudent, setNoticeStudent] = useState(null);
  const [showBoardReport, setShowBoardReport] = useState(false);

  // Modal temporary inputs
  const [tempRemarks, setTempRemarks] = useState("");
  const [tempOverride, setTempOverride] = useState("");

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Compute eligibility records
  const processedStudents = useMemo(() => {
    return students.map((s) => ({
      ...s,
      metrics: calculateStudentEligibility(s),
    }));
  }, [students]);

  // Aggregate Metrics for Statistics Bar
  const stats = useMemo(() => {
    const total = processedStudents.length;
    const eligible = processedStudents.filter(
      (s) =>
        s.metrics.status === "Eligible" ||
        s.metrics.status === "Eligible (Exemption)",
    ).length;
    const barred = processedStudents.filter(
      (s) => s.metrics.status === "Barred from ESA",
    ).length;
    const medicalReview = processedStudents.filter(
      (s) => s.metrics.status === "Under Medical Review",
    ).length;
    const regIncomplete = processedStudents.filter(
      (s) => s.metrics.status === "Registration Incomplete",
    ).length;
    const complianceRate = Math.round((eligible / total) * 100) || 0;

    return {
      total,
      eligible,
      barred,
      medicalReview,
      regIncomplete,
      complianceRate,
    };
  }, [processedStudents]);

  // Stat cards (edit the pill, caption and colour here)
  // colour can be: blue, green, red, amber
  // Keep captions short (about 30 characters) so they stay on one line
  const specCount = new Set(processedStudents.map((s) => s.specialization))
    .size;

  const statCards = [
    {
      label: "Candidates reviewed",
      value: stats.total,
      caption: `Across ${specCount} specializations`,
      pill: "Total",
      color: "blue",
      filter:"All",
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
      label: "Eligible to sit ESA",
      value: stats.eligible,
      caption: `${stats.complianceRate}% compliance rate`,
      pill: "Cleared",
      color: "green",
      filter:"Eligible",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
    {
      label: "Barred from ESA",
      value: stats.barred,
      caption: "Barring letter required",
      pill: "Below 80%",
      color: "red",
      filter:"Barred",
      icon: (
        <StatIcon>
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </StatIcon>
      ),
    },
    {
      label: "Medical / appeals",
      value: stats.medicalReview,
      caption: "Awaiting Board decision",
      pill: "Review",
      color: "amber",
      filter:"Medical",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </StatIcon>
      ),
    },
  ];

  // Filtered Rows
  const filteredStudents = useMemo(() => {
    return processedStudents.filter((s) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        s.name.toLowerCase().includes(term) ||
        s.regNo.toLowerCase().includes(term) ||
        s.specialization.toLowerCase().includes(term);

      let matchStatus = true;
      if (statusFilter === "Eligible") {
        matchStatus =
          s.metrics.status === "Eligible" ||
          s.metrics.status === "Eligible (Exemption)";
      } else if (statusFilter === "Barred") {
        matchStatus = s.metrics.status === "Barred from ESA";
      } else if (statusFilter === "Medical") {
        matchStatus = s.metrics.status === "Under Medical Review";
      } else if (statusFilter === "Registration") {
        matchStatus = s.metrics.status === "Registration Incomplete";
      }

      const matchSpec = specFilter === "All" || s.specialization === specFilter;
      const matchSem =
        semesterFilter === "All" || s.semester === semesterFilter;

      return matchSearch && matchStatus && matchSpec && matchSem;
    });
  }, [processedStudents, searchTerm, statusFilter, specFilter, semesterFilter]);

  // Open Detailed Modal
  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    setTempRemarks(student.officerRemarks || "");
    setTempOverride(student.overrideStatus || "None");
  };

  // Save Officer Decision in Modal
  const handleSaveDecision = () => {
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.regNo === selectedStudent.regNo) {
          return {
            ...s,
            officerRemarks: tempRemarks,
            overrideStatus: tempOverride === "None" ? null : tempOverride,
          };
        }
        return s;
      }),
    );

    triggerToast(`Eligibility record updated for ${selectedStudent.regNo}`);
    setSelectedStudent(null);
  };

  // Dispatch Ineligibility Notice
  const handleSendNotice = (student) => {
    setNoticeStudent(student);
  };

  const handleConfirmNotice = () => {
    triggerToast(
      `Official ineligibility warning dispatched to ${noticeStudent.regNo} (${noticeStudent.name})`,
    );
    setNoticeStudent(null);
  };

  // Scroll target for the table
  const tableRef = useRef(null);

  // Clears every filter
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSpecFilter("All");
    setSemesterFilter("All");
  };

  // Click on a stat card
  const handleCardClick = (filterValue) => {
    // Clicking the active card again shows everyone
    const next = statusFilter === filterValue ? "All" : filterValue;

    setSearchTerm("");
    setSpecFilter("All");
    setSemesterFilter("All");
    setStatusFilter(next);

    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Text shown in the "Showing ..." line
  const FILTER_LABELS = {
    Eligible: "eligible",
    Barred: "barred",
    Medical: "medical appeal",
    Registration: "registration hold",
  };

  return (
    <div className="ev-page">
      {/* ====================================================================
          1. STATS CARDS (icon on the left, pill on the right)
          ==================================================================== */}
      <section className="ev-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && statusFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`ev-stat-card ev-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="ev-stat-head">
                <div className={`ev-stat-icon ev-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`ev-stat-pill ev-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="ev-stat-body">
                <span className="ev-stat-label">{card.label}</span>
                <span className="ev-stat-val">{card.value}</span>
                <span className="ev-stat-sub">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ====================================================================
          3. MAIN TABLE & FILTERS PANEL
          ==================================================================== */}
      <section className="ev-panel">
        <div className="ev-panel-header">
          {statusFilter !== "All" && (
            <p className="ev-active-filter">
              Showing only <strong>{FILTER_LABELS[statusFilter]}</strong>{" "}
              candidates ({filteredStudents.length})
              <button
                type="button"
                className="ev-btn ev-btn-outline"
                onClick={resetFilters}
              >
                Show all
              </button>
            </p>
          )}
          <div>
            <h3 className="ev-panel-title">
              Eligibility Verification Registry
            </h3>
            <p className="ev-panel-desc">
              Review real-time subject attendance submitted by lecturers and
              verify registration status.
            </p>
          </div>
          <span className="ev-table-counter">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            {students.length} Candidates
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="ev-filter-toolbar">
          <div className="ev-search-wrap">
            <svg
              className="ev-search-icon"
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
              className="ev-input ev-search-input"
              placeholder="Search by student name, reg no (e.g. 22ICT041)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ev-filter-group">
            <select
              className="ev-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Eligibility Statuses</option>
              <option value="Eligible">Eligible Only (&ge; 80%)</option>
              <option value="Barred">Barred Only (&lt; 80%)</option>
              <option value="Medical">Medical Appeal Pending</option>
              <option value="Registration">Registration Hold</option>
            </select>

            <select
              className="ev-select"
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>

            <select
              className="ev-select"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="All">All Semesters</option>
              <option value="Semester 03">Semester 03</option>
              <option value="Semester 05">Semester 05</option>
            </select>

            {(searchTerm ||
              statusFilter !== "All" ||
              specFilter !== "All" ||
              semesterFilter !== "All") && (
              <button
                type="button"
                className="ev-btn-clear"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setSpecFilter("All");
                  setSemesterFilter("All");
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Verification Registry Table */}
        <div className="ev-table-container">
          <table className="ev-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Specialization &amp; Sem</th>
                <th>Subject Attendance Pct (Min 80%)</th>
                <th>Overall</th>
                <th>Registration</th>
                <th>Eligibility Status</th>
                <th className="ev-th-action">Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ev-empty-cell">
                    <div className="ev-empty-state">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p>No candidates match the specified filter criteria.</p>
                      <button
                        type="button"
                        className="ev-btn ev-btn-outline"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All");
                          setSpecFilter("All");
                          setSemesterFilter("All");
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isBarred = s.metrics.status === "Barred from ESA";
                  return (
                    <tr
                      key={s.regNo}
                      className={isBarred ? "ev-row-barred" : ""}
                    >
                      {/* 1. Student identity */}
                      <td>
                        <div className="ev-student-meta">
                          <span className="ev-student-avatar">
                            {s.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div>
                            <div className="ev-student-name">{s.name}</div>
                            <div className="ev-student-reg">
                              {s.regNo} ·{" "}
                              <span className="ev-attempt-tag">
                                {s.attempt}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Degree & Semester */}
                      <td>
                        <div className="ev-spec-title">{s.specialization}</div>
                        <div className="ev-spec-sub">{s.semester}</div>
                      </td>

                      {/* 3. Per-subject chip breakdown */}
                      <td>
                        <div className="ev-subject-chip-list">
                          {s.metrics.subjectsWithPct.map((sub) => (
                            <span
                              key={sub.code}
                              className={`ev-sub-chip ${sub.isPassed ? "ev-chip-pass" : "ev-chip-fail"}`}
                              title={`${sub.name}: ${sub.attended}/${sub.total} hrs (${sub.percentage}%)`}
                            >
                              {sub.code}: {sub.percentage}%
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 4. Overall Attendance */}
                      <td>
                        <div className="ev-pct-box">
                          <span
                            className={`ev-pct-num ${s.metrics.overallPct < 80 ? "ev-text-red" : "ev-text-green"}`}
                          >
                            {s.metrics.overallPct}%
                          </span>
                          <div className="ev-pct-bar-bg">
                            <div
                              className={`ev-pct-bar-fill ${s.metrics.overallPct < 80 ? "bar-red" : "bar-green"}`}
                              style={{
                                width: `${Math.min(s.metrics.overallPct, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. Subject Registration */}
                      <td>
                        <span
                          className={`ev-reg-badge ${
                            s.metrics.isRegVerified
                              ? "ev-reg-ok"
                              : "ev-reg-warn"
                          }`}
                        >
                          {s.metrics.isRegVerified ? "Complete" : "Hold"}
                        </span>
                      </td>

                      {/* 6. Eligibility Badge */}
                      <td>
                        <span
                          className={`ev-status-badge ${s.metrics.badgeClass}`}
                        >
                          {s.metrics.status}
                        </span>
                      </td>

                      {/* 7. Action Cell */}
                      <td>
                        <div className="ev-action-btn-group">
                          <button
                            type="button"
                            className="ev-action-btn ev-btn-inspect"
                            onClick={() => handleOpenDetail(s)}
                            title="Verify course attendance details"
                          >
                            Verify &amp; Edit
                          </button>
                          {isBarred && (
                            <button
                              type="button"
                              className="ev-action-btn ev-btn-notify"
                              onClick={() => handleSendNotice(s)}
                              title="Send formal barring letter"
                            >
                              Notice
                            </button>
                          )}
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
          4. STUDENT DETAILED VERIFICATION MODAL
          ==================================================================== */}
      {selectedStudent && (
        <div
          className="ev-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >
          <div className="ev-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ev-modal-header">
              <div>
                <span className="ev-modal-tag">
                  CANDIDATE ELIGIBILITY AUDIT
                </span>
                <h2 className="ev-modal-title">{selectedStudent.name}</h2>
                <span className="ev-modal-subtitle">
                  {selectedStudent.regNo} · {selectedStudent.specialization} ·{" "}
                  {selectedStudent.semester}
                </span>
              </div>
              <button
                type="button"
                className="ev-close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                &times;
              </button>
            </div>

            <div className="ev-modal-body">
              {/* Quick Info Grid */}
              <div className="ev-info-banner">
                <div className="ev-info-item">
                  <span className="ev-info-lbl">Programme</span>
                  <span className="ev-info-val">
                    {selectedStudent.programme}
                  </span>
                </div>
                <div className="ev-info-item">
                  <span className="ev-info-lbl">Attempt Type</span>
                  <span className="ev-info-val">{selectedStudent.attempt}</span>
                </div>
                <div className="ev-info-item">
                  <span className="ev-info-lbl">Registration Status</span>
                  <span className="ev-info-val">
                    {selectedStudent.registrationStatus === "Verified"
                      ? "✓ Verified (Dean's Office)"
                      : "⚠ Pending"}
                  </span>
                </div>
                <div className="ev-info-item">
                  <span className="ev-info-lbl">Medical Notice</span>
                  <span className="ev-info-val">
                    {selectedStudent.medicalNotice}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <h4 className="ev-section-title">
                Course Modules Attendance Breakdown
              </h4>
              <div className="ev-modal-table-wrap">
                <table className="ev-table ev-detail-table">
                  <thead>
                    <tr>
                      <th>Module Code &amp; Title</th>
                      <th>Lecturer-in-Charge</th>
                      <th>Hours Attended</th>
                      <th>Attendance %</th>
                      <th>Status (80% Rule)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.metrics.subjectsWithPct.map((mod) => (
                      <tr key={mod.code}>
                        <td>
                          <strong>{mod.code}</strong> — {mod.name}
                        </td>
                        <td>{mod.lecturer}</td>
                        <td>
                          {mod.attended} / {mod.total} hrs
                        </td>
                        <td>
                          <span
                            className={
                              mod.isPassed ? "ev-text-green" : "ev-text-red"
                            }
                          >
                            {mod.percentage}%
                          </span>
                        </td>
                        <td>
                          <span
                            className={`ev-sub-chip ${mod.isPassed ? "ev-chip-pass" : "ev-chip-fail"}`}
                          >
                            {mod.isPassed ? "Eligible" : "Barred (<80%)"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Officer Overrides & Concessions */}
              <div className="ev-override-box">
                <h4 className="ev-section-title">
                  Examination Officer Concession / Override
                </h4>
                <div className="ev-form-row">
                  <div className="ev-form-col">
                    <label className="ev-field-label">
                      Eligibility Override Status
                    </label>
                    <select
                      className="ev-select"
                      value={tempOverride}
                      onChange={(e) => setTempOverride(e.target.value)}
                    >
                      <option value="None">
                        None (Standard 80% Rule Evaluation)
                      </option>
                      <option value="Exemption Granted">
                        Exemption Granted (Senate / Board Approved)
                      </option>
                      <option value="Medical Concession Pending">
                        Medical Concession Under Review
                      </option>
                    </select>
                  </div>
                </div>

                <div className="ev-form-row">
                  <div className="ev-form-col">
                    <label className="ev-field-label">
                      Examination Officer Official Notes
                    </label>
                    <textarea
                      className="ev-textarea"
                      rows="3"
                      placeholder="Enter verification notes, medical certificate registration numbers, or Senate memo references..."
                      value={tempRemarks}
                      onChange={(e) => setTempRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ev-modal-footer">
              <button
                type="button"
                className="ev-btn ev-btn-outline"
                onClick={() => setSelectedStudent(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={handleSaveDecision}
              >
                Save Decision &amp; Update Record
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ====================================================================
          5. FORMAL INELIGIBILITY NOTICE LETTER MODAL
          ==================================================================== */}
      {noticeStudent && (
        <div
          className="ev-modal-overlay"
          onClick={() => setNoticeStudent(null)}
        >
          <div
            className="ev-modal-card ev-notice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-modal-header ev-no-print">
              <div>
                <span className="ev-modal-tag">OFFICIAL FACULTY NOTICE</span>
                <h2 className="ev-modal-title">
                  ESA Ineligibility Notification Letter
                </h2>
              </div>
              <button
                type="button"
                className="ev-close-btn"
                onClick={() => setNoticeStudent(null)}
              >
                &times;
              </button>
            </div>

            {/* Official Letterhead Printable Area */}
            <div className="ev-print-letter">
              <div className="ev-letter-head">
                <div className="ev-uni-title">
                  SOUTH EASTERN UNIVERSITY OF SRI LANKA
                </div>
                <div className="ev-uni-sub">
                  FACULTY OF TECHNOLOGY · EXAMINATION UNIT
                </div>
                <div className="ev-letter-meta">
                  Oluvil, Sri Lanka | Email: examination@seu.ac.lk
                </div>
              </div>

              <div className="ev-letter-divider" />

              <div className="ev-letter-reference">
                <span>
                  <strong>Ref:</strong> SEU/FT/EX/2026/EL-{noticeStudent.regNo}
                </span>
                <span>
                  <strong>Date:</strong> 21 October 2026
                </span>
              </div>

              <div className="ev-letter-to">
                <strong>To:</strong> Candidate{" "}
                <strong>{noticeStudent.name}</strong> ({noticeStudent.regNo})
                <br />
                {noticeStudent.programme} — {noticeStudent.specialization} (
                {noticeStudent.semester})
              </div>

              <div className="ev-letter-subject">
                SUB: NOTIFICATION OF INELIGIBILITY TO SIT END SEMESTER
                ASSESSMENT (ESA)
              </div>

              <div className="ev-letter-body">
                <p>
                  You are hereby formally notified under{" "}
                  <strong>
                    Section 4.2.3 of the Faculty Examination Handbook
                  </strong>{" "}
                  that based on attendance records finalized by the respective
                  course lecturers, you have{" "}
                  <strong>
                    failed to achieve the mandatory 80% attendance requirement
                  </strong>{" "}
                  in the following module(s):
                </p>

                <table className="ev-letter-table">
                  <thead>
                    <tr>
                      <th>Module Code</th>
                      <th>Module Title</th>
                      <th>Attended / Total</th>
                      <th>Attendance %</th>
                      <th>Deficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticeStudent.metrics.failedSubjects.map((f) => (
                      <tr key={f.code}>
                        <td>
                          <strong>{f.code}</strong>
                        </td>
                        <td>{f.name}</td>
                        <td>
                          {f.attended} / {f.total} hrs
                        </td>
                        <td>
                          <strong className="ev-text-red">
                            {f.percentage}%
                          </strong>
                        </td>
                        <td>Short of 80% requirement</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>
                  Consequently, you are <strong>BARRED</strong> from sitting the
                  End Semester Assessment in the above listed course(s) for the
                  current session.
                </p>

                <p>
                  <strong>Appeals &amp; Inquiries:</strong> If you possess valid
                  medical certification or special concession endorsed by the
                  Faculty Medical Officer that was submitted within the 2-week
                  statutory window, please submit an appeal to the Examination
                  Officer via the Dean's Office within <strong>48 hours</strong>{" "}
                  of this notice.
                </p>
              </div>

              <div className="ev-letter-sign-row">
                <div className="ev-sign-box">
                  <div className="ev-sign-line" />
                  <strong>Examination Officer</strong>
                  <br />
                  Faculty of Technology
                  <br />
                  South Eastern University of Sri Lanka
                </div>
                <div className="ev-stamp-box">[ EXAMINATION UNIT SEAL ]</div>
              </div>
            </div>

            <div className="ev-modal-footer ev-no-print">
              <button
                type="button"
                className="ev-btn ev-btn-outline"
                onClick={() => setNoticeStudent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-outline"
                onClick={() => window.print()}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Official Notice
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={handleConfirmNotice}
              >
                Dispatch via Student Portal &amp; Email
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ====================================================================
          6. FACULTY BOARD COMPLIANCE REPORT MODAL
          ==================================================================== */}
      {showBoardReport && (
        <div
          className="ev-modal-overlay"
          onClick={() => setShowBoardReport(false)}
        >
          <div
            className="ev-modal-card ev-report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-modal-header ev-no-print">
              <div>
                <span className="ev-modal-tag">OFFICIAL REPORTING</span>
                <h2 className="ev-modal-title">
                  Faculty Board Attendance Compliance Report
                </h2>
                <span className="ev-modal-subtitle">
                  Academic Session 2025/2026 · Faculty of Technology
                </span>
              </div>
              <button
                type="button"
                className="ev-close-btn"
                onClick={() => setShowBoardReport(false)}
              >
                &times;
              </button>
            </div>

            <div className="ev-print-letter">
              <div className="ev-letter-head">
                <div className="ev-uni-title">
                  SOUTH EASTERN UNIVERSITY OF SRI LANKA
                </div>
                <div className="ev-uni-sub">
                  BOARD OF EXAMINERS &amp; FACULTY BOARD REPORT
                </div>
                <div className="ev-letter-meta">
                  Attendance Compliance &amp; ESA Barring Summary — Section
                  4.2.3
                </div>
              </div>

              <div className="ev-letter-divider" />

              <div className="ev-report-summary-stats">
                <div className="ev-rep-stat">
                  <span>Total Reviewed:</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="ev-rep-stat">
                  <span>Eligible Candidates:</span>
                  <strong>
                    {stats.eligible} ({stats.complianceRate}%)
                  </strong>
                </div>
                <div className="ev-rep-stat">
                  <span>Barred Candidates:</span>
                  <strong className="ev-text-red">{stats.barred}</strong>
                </div>
                <div className="ev-rep-stat">
                  <span>Medical Appeals Pending:</span>
                  <strong>{stats.medicalReview}</strong>
                </div>
              </div>

              <h4 className="ev-report-heading">
                Schedule of Barred Candidates &amp; Deficiencies
              </h4>
              <table className="ev-letter-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Candidate Name</th>
                    <th>Specialization</th>
                    <th>Barred Module(s) &amp; Pct</th>
                    <th>Medical / Appeals Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedStudents
                    .filter(
                      (s) =>
                        s.metrics.status === "Barred from ESA" ||
                        s.metrics.status === "Under Medical Review",
                    )
                    .map((s) => (
                      <tr key={s.regNo}>
                        <td>
                          <strong>{s.regNo}</strong>
                        </td>
                        <td>{s.name}</td>
                        <td>{s.specialization}</td>
                        <td>
                          {s.metrics.failedSubjects.length > 0
                            ? s.metrics.failedSubjects
                                .map((f) => `${f.code} (${f.percentage}%)`)
                                .join(", ")
                            : "None"}
                        </td>
                        <td>{s.overrideStatus || s.medicalNotice}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="ev-letter-sign-row">
                <div className="ev-sign-box">
                  <div className="ev-sign-line" />
                  <strong>Prepared By: Examination Officer</strong>
                  <br />
                  Faculty of Technology
                </div>
                <div className="ev-sign-box">
                  <div className="ev-sign-line" />
                  <strong>Confirmed By: Dean / HOD</strong>
                  <br />
                  Faculty of Technology
                </div>
              </div>
            </div>

            <div className="ev-modal-footer ev-no-print">
              <button
                type="button"
                className="ev-btn ev-btn-outline"
                onClick={() => setShowBoardReport(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={() => window.print()}
              >
                Print / Save PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Feedback */}
      {toastMessage && <div className="ev-toast">{toastMessage}</div>}
    </div>
  );
}
