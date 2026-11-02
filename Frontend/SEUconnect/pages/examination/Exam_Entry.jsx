import React, { useMemo, useState, useRef } from "react";
import "./Exam_Entry.css";

/* =========================================
   SAMPLE DATA (replace with backend data later)
========================================= */

// Exam timetable used for every student (code, name, date, time, hall)
const EXAMS = [
  ["IT3012", "Software Engineering", "2026-11-10", "09:00 AM", "Hall A"],
  ["IT3022", "Database Systems", "2026-11-12", "09:00 AM", "Hall A"],
  ["IT3032", "Computer Networks", "2026-11-14", "02:00 PM", "Hall B"],
  ["IT3042", "Web Technologies", "2026-11-17", "09:00 AM", "Hall B"],
  ["IT3052", "Operating Systems", "2026-11-19", "02:00 PM", "Hall A"],
  ["IT3062", "Information Security", "2026-11-21", "09:00 AM", "Hall C"],
];


// Build a subject list from an array of attendance numbers
const makeSubjects = (attendance) =>
  attendance.map((att, i) => ({
    code: EXAMS[i][0],
    name: EXAMS[i][1],
    date: EXAMS[i][2],
    time: EXAMS[i][3],
    hall: EXAMS[i][4],
    attendance: att,
  }));

const STUDENTS = [
  {
    regNo: "22ICT041",
    name: "K.P. Silva",
    specialization: "Software Systems",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "1st",
    medical: "None",
    subjects: makeSubjects([92, 88, 85, 90, 84, 86]),
  },
  {
    regNo: "22ICT078",
    name: "A.N. Perera",
    specialization: "Data Science",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "1st",
    medical: "None",
    subjects: makeSubjects([74, 78, 81, 70, 76]),
  },
  {
    regNo: "21ICT019",
    name: "M.F. Rasheed",
    specialization: "Software Systems",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "Repeat (2nd)",
    medical: "None",
    subjects: makeSubjects([82, 85, 80, 88, 83, 81]),
  },
  {
    regNo: "22ICT103",
    name: "S. Jayasuriya",
    specialization: "Network Systems",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "1st",
    medical: "None",
    subjects: makeSubjects([90, 93, 87, 91, 89]),
  },
  {
    regNo: "22ICT056",
    name: "H. Nazeer",
    specialization: "Software Systems",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "1st",
    medical: "Pending",
    subjects: makeSubjects([85, 82, 88, 84, 86, 90]),
  },
  {
    regNo: "23ICT012",
    name: "R. Fernando",
    specialization: "Data Science",
    semester: "Semester 03",
    programme: "BICT",
    attempt: "1st",
    medical: "None",
    subjects: makeSubjects([95, 91, 89, 94, 92]),
  },
  {
    regNo: "23ICT027",
    name: "T. Kumar",
    specialization: "Network Systems",
    semester: "Semester 03",
    programme: "BICT",
    attempt: "1st",
    medical: "None",
    subjects: makeSubjects([79, 85, 88, 90, 86]),
  },
  {
    regNo: "21ICT064",
    name: "F. Nilufar",
    specialization: "Data Science",
    semester: "Semester 05",
    programme: "BICT",
    attempt: "Repeat (3rd)",
    medical: "Pending",
    subjects: makeSubjects([84, 86, 82, 85, 88, 83]),
  },
];

const SPECIALIZATIONS = [
  "All",
  "Software Systems",
  "Data Science",
  "Network Systems",
];
const SEMESTERS = ["All", "Semester 03", "Semester 05"];
const STATUS_FILTERS = ["All", "Eligible", "Ineligible", "Review", "Issued"];

/* =========================================
   HELPERS
========================================= */

// Eligibility rule: 80% attendance needed in every subject
function getEligibility(student) {
  const low = student.subjects.filter((s) => s.attendance < 80);

  if (low.length > 0) {
    return {
      status: "Ineligible",
      reason: `Attendance below 80% in ${low.map((s) => s.code).join(", ")}`,
    };
  }

  const reasons = [];
  if (student.attempt !== "1st")
    reasons.push(`${student.attempt} attempt needs officer check`);
  if (student.medical === "Pending")
    reasons.push("Medical / special needs request is pending");

  if (reasons.length > 0) {
    return { status: "Review", reason: reasons.join(". ") };
  }

  return { status: "Eligible", reason: "" };
}

function getAverageAttendance(student) {
  const total = student.subjects.reduce((sum, s) => sum + s.attendance, 0);
  return Math.round(total / student.subjects.length);
}

function getInitials(name) {
  return name
    .replace(/\./g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CLASS = {
  Eligible: "ee-badge-green",
  Ineligible: "ee-badge-red",
  Review: "ee-badge-amber",
};

// Icon wrapper for the summary cards
const CardIcon = ({ children }) => (
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

/* =========================================
   MAIN COMPONENT
========================================= */

export default function ExamEntry() {
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");

  // Data changed by the officer
  const [issued, setIssued] = useState({ "22ICT103": true });
  const [notes, setNotes] = useState({});

  // Which popup is open (store the reg number)
  const [viewRegNo, setViewRegNo] = useState(null);
  const [cardRegNo, setCardRegNo] = useState(null);

  // Small message after issuing a card
  const [toast, setToast] = useState("");

  // Add eligibility info to every student once
  const students = useMemo(
    () =>
      STUDENTS.map((s) => ({
        ...s,
        eligibility: getEligibility(s),
        average: getAverageAttendance(s),
      })),
    [],
  );

  /* ---------- Summary numbers ---------- */
  const summary = {
    received: students.length,
    eligible: students.filter((s) => s.eligibility.status === "Eligible")
      .length,
    ineligible: students.filter((s) => s.eligibility.status === "Ineligible")
      .length,
    issued: students.filter((s) => issued[s.regNo]).length,
    review: students.filter((s) => s.eligibility.status === "Review").length,
  };

  // Number of different specializations in the list (used in a caption)
  const specCount = new Set(students.map((s) => s.specialization)).size;

  // Summary cards (edit the pill, caption and colour here)
  // colour can be: blue, green, red, purple, amber
  const summaryCards = [
    {
      label: "Entry forms received",
      value: summary.received,
      caption: `Across ${specCount} specializations`,
      pill: "Total",
      color: "blue",
      filter: "All",
      icon: (
        <CardIcon>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </CardIcon>
      ),
    },
    {
      label: "Eligible",
      value: summary.eligible,
      caption: "Ready for admission cards",
      pill: "Cleared",
      color: "green",
      filter:"Eligible",
      icon: (
        <CardIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </CardIcon>
      ),
    },
    {
      label: "Ineligible",
      value: summary.ineligible,
      caption: "Attendance below 80%",
      pill: "Below 80%",
      color: "red",
       filter:"Ineligible",
      icon: (
        <CardIcon>
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </CardIcon>
      ),
    },
    {
      label: "Cards issued",
      value: summary.issued,
      caption: `Out of ${summary.received} entry forms`,
      pill: "Issued",
      color: "purple",
      filter:"Issued",
      icon: (
        <CardIcon>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </CardIcon>
      ),
    },
    {
      label: "Pending review",
      value: summary.review,
      caption: "Repeat or medical cases",
      pill: "Review",
      color: "amber",
      filter: "Review",
      icon: (
        <CardIcon>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </CardIcon>
      ),
    },
  ];

  /* ---------- Filtered table rows ---------- */
  const filtered = students.filter((s) => {
    const text = search.trim().toLowerCase();
    const matchSearch =
      text === "" ||
      s.name.toLowerCase().includes(text) ||
      s.regNo.toLowerCase().includes(text);

    let matchStatus = true;
    if (statusFilter === "Issued") matchStatus = !!issued[s.regNo];
    else if (statusFilter !== "All")
      matchStatus = s.eligibility.status === statusFilter;

    const matchSpec = specFilter === "All" || s.specialization === specFilter;
    const matchSem = semFilter === "All" || s.semester === semFilter;

    return matchSearch && matchStatus && matchSpec && matchSem;
  });

  const viewStudent = students.find((s) => s.regNo === viewRegNo);
  const cardStudent = students.find((s) => s.regNo === cardRegNo);

  /* ---------- Actions ---------- */
  const issueCard = (regNo) => {
    setIssued((prev) => ({ ...prev, [regNo]: true }));
    setToast(`Admission card issued for ${regNo}`);
    setTimeout(() => setToast(""), 3000);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSpecFilter("All");
    setSemFilter("All");
  };

  const tableRef = useRef(null);

const handleCardClick = (filterValue) => {
  // Clicking the active card again shows everyone
  const next = statusFilter === filterValue ? "All" : filterValue;
  setStatusFilter(next);

  // Clear the other filters so the table matches the number on the card
  setSearch("");
  setSpecFilter("All");
  setSemFilter("All");

  // Scroll down to the table
  tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
};

  return (
    <div className="ee-page">
      {/* =========================================
          1. SUMMARY CARDS
      ========================================= */}
      <section className="ee-summary-grid">
        {summaryCards.map((card) => {
          const isActive =
            card.filter !== "All" && statusFilter === card.filter;

          return (
            <button
              type="button"
              key={card.label}
              className={`ee-summary-card ee-summary-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="ee-summary-head">
                <div className={`ee-summary-icon ee-icon-${card.color}`}>
                  {card.icon}
                </div>
                <span className={`ee-summary-pill ee-pill-${card.color}`}>
                  {card.pill}
                </span>
              </div>

              <div className="ee-summary-body">
                <span className="ee-summary-label">{card.label}</span>
                <span className="ee-summary-number">{card.value}</span>
                <span className="ee-summary-caption">{card.caption}</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* =========================================
          2. SEARCH + FILTERS
      ========================================= */}
      <section className="ee-panel" ref={tableRef}>
        <h3 className="ee-heading">Exam Entry &amp; Admission Cards</h3>
        <p className="ee-sub">Check entry forms and issue admission cards</p>

        {statusFilter !== "All" && (
          <p className="ee-active-filter">
            Showing <strong>{statusFilter}</strong> students ({filtered.length})
            <button
              type="button"
              className="ee-btn ee-btn-light"
              onClick={clearFilters}
            >
              Show all
            </button>
          </p>
        )}

        <div className="ee-filter-row">
          <input
            type="text"
            className="ee-input ee-search"
            placeholder="Search by name or reg no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="ee-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>

          <select
            className="ee-input"
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All specializations" : s}
              </option>
            ))}
          </select>

          <select
            className="ee-input"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All semesters" : s}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="ee-btn ee-btn-light"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {/* =========================================
            3. STUDENT TABLE
        ========================================= */}
        <div className="ee-table-wrap">
          <table className="ee-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Subjects</th>
                <th>Attendance</th>
                <th>Attempt</th>
                <th>Medical / special needs</th>
                <th>Eligibility</th>
                <th>Card</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="ee-empty">
                    No students match these filters. Try clearing the search or
                    filters.
                  </td>
                </tr>
              )}

              {filtered.map((s) => {
                const isIssued = !!issued[s.regNo];
                const blocked = s.eligibility.status === "Ineligible";

                return (
                  <tr key={s.regNo}>
                    <td>{s.regNo}</td>
                    <td>{s.name}</td>
                    <td>{s.specialization}</td>
                    <td>{s.subjects.length}</td>
                    <td className={s.average < 80 ? "ee-text-red" : ""}>
                      {s.average}%
                    </td>
                    <td>{s.attempt}</td>
                    <td>{s.medical}</td>
                    <td>
                      <span
                        className={`ee-badge ${STATUS_CLASS[s.eligibility.status]}`}
                      >
                        {s.eligibility.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ee-badge ${isIssued ? "ee-badge-blue" : "ee-badge-grey"}`}
                      >
                        {isIssued ? "Issued" : "Not issued"}
                      </span>
                    </td>
                    <td>
                      <div className="ee-action-cell">
                        <button
                          type="button"
                          className="ee-btn ee-btn-light"
                          onClick={() => setViewRegNo(s.regNo)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="ee-btn ee-btn-primary"
                          disabled={blocked}
                          title={blocked ? "Student is ineligible" : ""}
                          onClick={() => setCardRegNo(s.regNo)}
                        >
                          {isIssued ? "Open Card" : "Issue Card"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================
          4. STUDENT DETAIL POPUP
      ========================================= */}
      {viewStudent && (
        <div className="ee-overlay" onClick={() => setViewRegNo(null)}>
          <div className="ee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ee-modal-head">
              <div>
                <h3 className="ee-heading">{viewStudent.name}</h3>
                <p className="ee-sub">{viewStudent.regNo}</p>
              </div>
              <button
                type="button"
                className="ee-close"
                onClick={() => setViewRegNo(null)}
              >
                ×
              </button>
            </div>

            {/* Student info */}
            <div className="ee-info-grid">
              <div>
                <span className="ee-info-label">Programme</span>
                <span className="ee-info-value">{viewStudent.programme}</span>
              </div>
              <div>
                <span className="ee-info-label">Semester</span>
                <span className="ee-info-value">{viewStudent.semester}</span>
              </div>
              <div>
                <span className="ee-info-label">Specialization</span>
                <span className="ee-info-value">
                  {viewStudent.specialization}
                </span>
              </div>
              <div>
                <span className="ee-info-label">Attempt</span>
                <span className="ee-info-value">{viewStudent.attempt}</span>
              </div>
              <div>
                <span className="ee-info-label">Medical / special needs</span>
                <span className="ee-info-value">{viewStudent.medical}</span>
              </div>
              <div>
                <span className="ee-info-label">Eligibility</span>
                <span
                  className={`ee-badge ${STATUS_CLASS[viewStudent.eligibility.status]}`}
                >
                  {viewStudent.eligibility.status}
                </span>
              </div>
            </div>

            {/* Reason box */}
            {viewStudent.eligibility.reason && (
              <div
                className={`ee-reason ${
                  viewStudent.eligibility.status === "Ineligible"
                    ? "ee-reason-red"
                    : "ee-reason-amber"
                }`}
              >
                {viewStudent.eligibility.reason}
              </div>
            )}

            {/* Subject attendance */}
            <h4 className="ee-subheading">Subjects and attendance</h4>
            <div className="ee-table-wrap">
              <table className="ee-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject</th>
                    <th>Attendance</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {viewStudent.subjects.map((sub) => (
                    <tr key={sub.code}>
                      <td>{sub.code}</td>
                      <td>{sub.name}</td>
                      <td className={sub.attendance < 80 ? "ee-text-red" : ""}>
                        {sub.attendance}%
                      </td>
                      <td>
                        <span
                          className={`ee-badge ${
                            sub.attendance < 80
                              ? "ee-badge-red"
                              : "ee-badge-green"
                          }`}
                        >
                          {sub.attendance < 80 ? "Below 80%" : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Officer notes */}
            <h4 className="ee-subheading">Examination officer notes</h4>
            <textarea
              className="ee-input ee-textarea"
              rows="3"
              placeholder="Write a note about this student..."
              value={notes[viewStudent.regNo] || ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [viewStudent.regNo]: e.target.value,
                }))
              }
            />

            <div className="ee-modal-footer">
              <button
                type="button"
                className="ee-btn ee-btn-light"
                onClick={() => setViewRegNo(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="ee-btn ee-btn-primary"
                disabled={viewStudent.eligibility.status === "Ineligible"}
                onClick={() => {
                  setCardRegNo(viewStudent.regNo);
                  setViewRegNo(null);
                }}
              >
                Preview Admission Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          5. ADMISSION CARD PREVIEW POPUP
      ========================================= */}
      {cardStudent && (
        <div className="ee-overlay" onClick={() => setCardRegNo(null)}>
          <div
            className="ee-modal ee-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ee-modal-head ee-no-print">
              <h3 className="ee-heading">Admission Card Preview</h3>
              <button
                type="button"
                className="ee-close"
                onClick={() => setCardRegNo(null)}
              >
                ×
              </button>
            </div>

            {/* Only this part is printed */}
            <div className="ee-print-area">
              <div className="ee-admit-card">
                <div className="ee-admit-header">
                  <div className="ee-admit-uni">
                    South Eastern University of Sri Lanka
                  </div>
                  <div className="ee-admit-faculty">Faculty of Technology</div>
                  <div className="ee-admit-title">
                    EXAMINATION ADMISSION CARD
                  </div>
                </div>

                <div className="ee-admit-student">
                  <div className="ee-admit-photo">
                    {getInitials(cardStudent.name)}
                  </div>
                  <div className="ee-admit-details">
                    <div>
                      <span className="ee-info-label">Name</span>
                      <span className="ee-info-value">{cardStudent.name}</span>
                    </div>
                    <div>
                      <span className="ee-info-label">Reg No</span>
                      <span className="ee-info-value">{cardStudent.regNo}</span>
                    </div>
                    <div>
                      <span className="ee-info-label">Programme</span>
                      <span className="ee-info-value">
                        {cardStudent.programme}
                      </span>
                    </div>
                    <div>
                      <span className="ee-info-label">Semester</span>
                      <span className="ee-info-value">
                        {cardStudent.semester}
                      </span>
                    </div>
                  </div>
                </div>

                <table className="ee-table ee-admit-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Hall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardStudent.subjects.map((sub) => (
                      <tr key={sub.code}>
                        <td>{sub.code}</td>
                        <td>{sub.name}</td>
                        <td>{formatDate(sub.date)}</td>
                        <td>{sub.time}</td>
                        <td>{sub.hall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="ee-admit-instructions">
                  <strong>Instructions</strong>
                  <ul>
                    <li>
                      Bring this card and your university ID to every paper.
                    </li>
                    <li>Arrive at least 15 minutes before the exam starts.</li>
                    <li>
                      Mobile phones and smart watches are not allowed in the
                      hall.
                    </li>
                    <li>Follow the instructions given by the invigilators.</li>
                  </ul>
                </div>

                <div className="ee-admit-footer">
                  <span>
                    Examination Officer signature: ____________________
                  </span>
                  <span className="ee-admit-stamp">
                    {issued[cardStudent.regNo] ? "ISSUED" : "NOT YET ISSUED"}
                  </span>
                </div>
              </div>
            </div>

            <div className="ee-modal-footer ee-no-print">
              <button
                type="button"
                className="ee-btn ee-btn-light"
                onClick={() => setCardRegNo(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="ee-btn ee-btn-light"
                onClick={() => window.print()}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="ee-btn ee-btn-light"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                type="button"
                className="ee-btn ee-btn-primary"
                disabled={!!issued[cardStudent.regNo]}
                onClick={() => issueCard(cardStudent.regNo)}
              >
                {issued[cardStudent.regNo] ? "Card Issued" : "Issue Card"}
              </button>
            </div>

            <p className="ee-hint ee-no-print">
              For Download PDF, choose "Save as PDF" as the printer in the print
              window.
            </p>
          </div>
        </div>
      )}

      {/* Small message at the bottom */}
      {toast && <div className="ee-toast">{toast}</div>}
    </div>
  );
}
