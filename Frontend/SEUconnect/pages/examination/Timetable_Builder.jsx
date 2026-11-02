import React, { useMemo, useRef, useState } from "react";
import "./Timetable_Builder.css";

const INITIAL_SCHEDULE = [
  { id: "TB-01", code: "IT3012", name: "Software Engineering", date: "2026-11-10", slot: "09:00 AM - 12:00 PM", hall: "Hall A", capacity: 80, candidates: 65, status: "Confirmed" },
  { id: "TB-02", code: "IT3022", name: "Database Systems", date: "2026-11-12", slot: "09:00 AM - 12:00 PM", hall: "Hall A", capacity: 80, candidates: 72, status: "Confirmed" },
  { id: "TB-03", code: "IT3032", name: "Computer Networks", date: "2026-11-14", slot: "02:00 PM - 05:00 PM", hall: "Hall B", capacity: 60, candidates: 58, status: "Confirmed" },
  { id: "TB-04", code: "IT3042", name: "Web Technologies", date: "2026-11-17", slot: "09:00 AM - 12:00 PM", hall: "Hall B", capacity: 60, candidates: 60, status: "Confirmed" },
  { id: "TB-05", code: "IT3052", name: "Operating Systems", date: "2026-11-19", slot: "02:00 PM - 05:00 PM", hall: "Hall A", capacity: 80, candidates: 68, status: "Confirmed" },
  { id: "TB-06", code: "IT3062", name: "Information Security", date: "2026-11-21", slot: "09:00 AM - 12:00 PM", hall: "Hall C", capacity: 40, candidates: 35, status: "Draft" },
];

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
  Confirmed: "confirmed exam slots",
  "Hall A": "Hall A scheduled papers",
  Large: "high-capacity sittings (60+ candidates)",
};

export default function TimetableBuilder() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hallFilter, setHallFilter] = useState("All");
  const [volumeFilter, setVolumeFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const totalPapers = schedule.length;
    const confirmed = schedule.filter((s) => s.status === "Confirmed").length;
    const hallsUsed = new Set(schedule.map((s) => s.hall)).size;
    const totalCandidates = schedule.reduce((sum, s) => sum + s.candidates, 0);
    return { totalPapers, confirmed, hallsUsed, totalCandidates };
  }, [schedule]);

  // Names of the halls in use, e.g. "Hall A, Hall B, Hall C"
  const hallNames = [...new Set(schedule.map((s) => s.hall))].sort().join(", ");

  const statCards = [
    {
      label: "Total papers",
      value: stats.totalPapers,
      caption: "Semester 03 & 05 courses",
      pill: "Papers",
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
      label: "Confirmed slots",
      value: stats.confirmed,
      caption: "HOD & Dean dates approved",
      pill: "Confirmed",
      color: "green",
      filter: "Confirmed",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
    {
      label: "Exam halls allocated",
      value: stats.hallsUsed,
      caption: `${hallNames} active`,
      pill: "Halls",
      color: "purple",
      filter: "Hall A",
      icon: (
        <StatIcon>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </StatIcon>
      ),
    },
    {
      label: "Seats scheduled",
      value: stats.totalCandidates,
      caption: "Total student sittings",
      pill: "Sittings",
      color: "amber",
      filter: "Large",
      icon: (
        <StatIcon>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </StatIcon>
      ),
    },
  ];

  const filtered = schedule.filter((s) => {
    const term = search.toLowerCase().trim();
    const matchSearch =
      term === "" ||
      s.code.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      s.hall.toLowerCase().includes(term);

    let matchStatus = true;
    if (statusFilter === "Confirmed") matchStatus = s.status === "Confirmed";
    else if (statusFilter === "Draft") matchStatus = s.status === "Draft";

    let matchHall = true;
    if (hallFilter !== "All") matchHall = s.hall === hallFilter;

    let matchVolume = true;
    if (volumeFilter === "Large") matchVolume = s.candidates >= 60;

    return matchSearch && matchStatus && matchHall && matchVolume;
  });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setHallFilter("All");
    setVolumeFilter("All");
    setActiveFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = activeFilter === filterValue ? "All" : filterValue;
    setActiveFilter(next);
    setSearch("");
    setStatusFilter("All");
    setHallFilter("All");
    setVolumeFilter("All");

    if (next === "Confirmed") {
      setStatusFilter("Confirmed");
    } else if (next === "Hall A") {
      setHallFilter("Hall A");
    } else if (next === "Large") {
      setVolumeFilter("Large");
    }

    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="adm-page">
      {/* 1. STATS CARDS (click a card to filter the table) */}
      <section className="adm-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && activeFilter === card.filter;

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

      {/* 2. TIMETABLE SCHEDULE TABLE */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Examination Timetable Master Schedule</h3>
            <p className="adm-panel-sub">Coordinated examination venues and time allocations (Faculty Handbook Section 3.4)</p>
          </div>
          <div className="adm-filter-group">
            <input
              type="text"
              className="adm-input"
              placeholder="Search code, course, or hall..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="adm-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActiveFilter(e.target.value === "Confirmed" ? "Confirmed" : "All");
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed Only</option>
              <option value="Draft">Draft Only</option>
            </select>
            <select
              className="adm-input"
              value={hallFilter}
              onChange={(e) => {
                setHallFilter(e.target.value);
                setActiveFilter(e.target.value === "Hall A" ? "Hall A" : "All");
              }}
            >
              <option value="All">All Halls</option>
              <option value="Hall A">Hall A</option>
              <option value="Hall B">Hall B</option>
              <option value="Hall C">Hall C</option>
            </select>
            {(search || statusFilter !== "All" || hallFilter !== "All" || volumeFilter !== "All") && (
              <button type="button" className="adm-btn-clear" onClick={resetFilters}>
                Reset
              </button>
            )}
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => window.print()}>
              Print Timetable
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {activeFilter !== "All" && FILTER_LABELS[activeFilter] && (
          <p className="adm-active-filter">
            Showing only <strong>{FILTER_LABELS[activeFilter]}</strong> ({filtered.length})
            <button
              type="button"
              className="adm-btn-outline-sm"
              onClick={resetFilters}
            >
              Show all
            </button>
          </p>
        )}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Course Paper</th>
                <th>Exam Date</th>
                <th>Time Slot</th>
                <th>Hall &amp; Capacity</th>
                <th>Candidate Count</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--adm-muted)" }}>
                    No timetable schedule records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.code}</strong><br /><small>{s.name}</small></td>
                    <td>{s.date}</td>
                    <td>{s.slot}</td>
                    <td><strong>{s.hall}</strong> (Max {s.capacity})</td>
                    <td>{s.candidates} Students</td>
                    <td>
                      <span className={`adm-badge ${s.status === "Confirmed" ? "badge-green" : "badge-amber"}`}>{s.status}</span>
                    </td>
                    <td>
                      <button type="button" className="adm-btn-action" onClick={() => setSelectedSlot(s)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {selectedSlot && (
        <div className="adm-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="adm-panel-title">Reschedule Slot: {selectedSlot.code}</h3>
            <p className="adm-panel-sub">{selectedSlot.name}</p>
            <div className="adm-modal-body">
              <label><strong>Exam Date:</strong></label>
              <input type="date" className="adm-input" defaultValue={selectedSlot.date} />
              <label><strong>Assigned Hall:</strong></label>
              <select className="adm-input" defaultValue={selectedSlot.hall}>
                <option value="Hall A">Hall A (Capacity 80)</option>
                <option value="Hall B">Hall B (Capacity 60)</option>
                <option value="Hall C">Hall C (Capacity 40)</option>
              </select>
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="adm-btn adm-btn-light" onClick={() => setSelectedSlot(null)}>Cancel</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => setSelectedSlot(null)}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
