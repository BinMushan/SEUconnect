import React, { useState, useMemo, useRef } from "react";
import "./Timetable_Builder.css";

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

const INITIAL_SCHEDULE = [
  { id: "s-1", code: "IT3012", name: "Software Engineering", date: "2026-11-10", slot: "09:00 - 12:00", hall: "Hall A", capacity: 80, candidates: 74, status: "Confirmed" },
  { id: "s-2", code: "IT3022", name: "Database Systems", date: "2026-11-12", slot: "09:00 - 12:00", hall: "Hall B", capacity: 60, candidates: 58, status: "Confirmed" },
  { id: "s-3", code: "IT3032", name: "Computer Networks", date: "2026-11-14", slot: "13:30 - 16:30", hall: "Hall A", capacity: 80, candidates: 65, status: "Draft" },
  { id: "s-4", code: "IT3042", name: "Web Technologies", date: "2026-11-17", slot: "09:00 - 12:00", hall: "Hall C", capacity: 40, candidates: 38, status: "Confirmed" },
  { id: "s-5", code: "IT3052", name: "Operating Systems", date: "2026-11-19", slot: "13:30 - 16:30", hall: "Hall A", capacity: 80, candidates: 72, status: "Confirmed" },
  { id: "s-6", code: "IT3062", name: "Artificial Intelligence", date: "2026-11-21", slot: "09:00 - 12:00", hall: "Hall B", capacity: 60, candidates: 45, status: "Draft" },
];

const FILTER_LABELS = {
  All: "All Examination Slots",
  Confirmed: "Confirmed Schedules",
  "Hall A": "Hall A Allocations",
  Large: "High Capacity (60+ Candidates)",
};

export default function Timetable_Builder() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hallFilter, setHallFilter] = useState("All");
  const [volumeFilter, setVolumeFilter] = useState("All");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const totalSlots = schedule.length;
    const confirmed = schedule.filter((s) => s.status === "Confirmed").length;
    const hallA = schedule.filter((s) => s.hall === "Hall A").length;
    const largePapers = schedule.filter((s) => s.candidates >= 60).length;

    return { totalSlots, confirmed, hallA, largePapers };
  }, [schedule]);

  const statCards = [
    {
      label: "Total Exam Slots",
      value: stats.totalSlots,
      caption: "Scheduled for Semester Examination",
      pill: "Total",
      color: "blue",
      filter: "All",
      icon: (
        <StatIcon>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </StatIcon>
      ),
    },
    {
      label: "Confirmed Slots",
      value: stats.confirmed,
      caption: "Approved by Senate Board",
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
      label: "Hall A Allocations",
      value: stats.hallA,
      caption: "Main auditorium sittings",
      pill: "Hall A",
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
      label: "Large Sessions",
      value: stats.largePapers,
      caption: "60+ registered students",
      pill: "60+ Seats",
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

  const handleCardClick = (filterValue) => {
    const next = activeFilter === filterValue ? "All" : filterValue;
    setActiveFilter(next);
    setSearch("");
    setStatusFilter("All");
    setHallFilter("All");
    setVolumeFilter("All");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearch("");
    setStatusFilter("All");
    setHallFilter("All");
    setVolumeFilter("All");
  };

  const filtered = useMemo(() => {
    return schedule.filter((s) => {
      if (activeFilter === "Confirmed" && s.status !== "Confirmed") return false;
      if (activeFilter === "Hall A" && s.hall !== "Hall A") return false;
      if (activeFilter === "Large" && s.candidates < 60) return false;

      if (search) {
        const q = search.toLowerCase();
        const m = s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.hall.toLowerCase().includes(q);
        if (!m) return false;
      }
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (hallFilter !== "All" && s.hall !== hallFilter) return false;
      if (volumeFilter === "Large" && s.candidates < 60) return false;
      if (volumeFilter === "Medium" && (s.candidates < 40 || s.candidates >= 60)) return false;
      if (volumeFilter === "Small" && s.candidates >= 40) return false;
      return true;
    });
  }, [schedule, activeFilter, search, statusFilter, hallFilter, volumeFilter]);

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

      {/* 2. TIMETABLE SCHEDULE PANEL */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Examination Timetable Master Schedule</h3>
            <p className="adm-panel-sub">
              Coordinated examination venues and time allocations (Faculty Handbook Section 3.4)
            </p>
          </div>
          <div className="adm-header-actions">
            <button
              type="button"
              className="adm-btn adm-btn-outline"
              onClick={() => window.print()}
            >
              Print Timetable
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() =>
                setSelectedSlot({
                  id: `s-${Date.now()}`,
                  code: "",
                  name: "",
                  date: new Date().toISOString().split("T")[0],
                  slot: "09:00 - 12:00",
                  hall: "Hall A",
                  capacity: 80,
                  candidates: 0,
                  status: "Draft",
                })
              }
            >
              + Add Exam Slot
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {activeFilter !== "All" && FILTER_LABELS[activeFilter] && (
          <div className="adm-active-filter">
            <span>
              Showing only: <strong>{FILTER_LABELS[activeFilter]}</strong> ({filtered.length})
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
              placeholder="Search code, course, or hall..."
              className="adm-input adm-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="adm-filter-group">
            <select
              className="adm-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Draft">Draft</option>
            </select>
            <select
              className="adm-select"
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
            >
              <option value="All">All Halls</option>
              <option value="Hall A">Hall A</option>
              <option value="Hall B">Hall B</option>
              <option value="Hall C">Hall C</option>
            </select>
            {(search || statusFilter !== "All" || hallFilter !== "All" || volumeFilter !== "All" || activeFilter !== "All") && (
              <button type="button" className="adm-btn-clear" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Enclosed Data Table (Results_Compilation Style) */}
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Exam Paper &amp; Code</th>
                <th>Exam Date</th>
                <th>Time Slot</th>
                <th>Hall Allocation</th>
                <th>Candidate Attendance</th>
                <th>Schedule Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--adm-muted)" }}>
                    No timetable slots match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="adm-student-meta">
                        <div className="adm-code-avatar">
                          {s.code.slice(0, 2)}
                        </div>
                        <div>
                          <div className="adm-student-name">{s.code} · {s.name}</div>
                          <div className="adm-student-reg">Venue capacity: {s.capacity} seats</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.date}</td>
                    <td>{s.slot}</td>
                    <td>
                      <strong>{s.hall}</strong>
                    </td>
                    <td>
                      <span className="adm-credits-val">
                        <strong>{s.candidates}</strong> of {s.capacity} seated
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${s.status === "Confirmed" ? "badge-green" : "badge-amber"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-action-btn"
                        onClick={() => setSelectedSlot(s)}
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RICH EDIT / RESCHEDULE MODAL */}
      {selectedSlot && (
        <div className="adm-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-tag">TIMETABLE SLOT ALLOCATION &amp; RESCHEDULING</span>
                <h2 className="adm-modal-title">
                  {selectedSlot.code ? `${selectedSlot.code} — ${selectedSlot.name}` : "Add New Examination Slot"}
                </h2>
                <div className="adm-modal-subtitle">
                  {selectedSlot.hall ? `${selectedSlot.hall} · ${selectedSlot.date || "Date Unset"}` : "Configure paper slot details"}
                </div>
              </div>
              <button
                type="button"
                className="adm-close-btn"
                onClick={() => setSelectedSlot(null)}
              >
                &times;
              </button>
            </div>

            <div className="adm-modal-body">
              {selectedSlot.code && (
                <div className="adm-info-banner">
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Course Paper</span>
                    <span className="adm-info-val">{selectedSlot.code}</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Allocated Hall</span>
                    <span className="adm-info-val">{selectedSlot.hall} (Cap: {selectedSlot.capacity})</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Registered Candidates</span>
                    <span className="adm-info-val">{selectedSlot.candidates} Candidates</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Current Status</span>
                    <span className="adm-info-val">{selectedSlot.status}</span>
                  </div>
                </div>
              )}

              {!selectedSlot.code && (
                <>
                  <label><strong>Course Code:</strong></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. IT3072"
                    defaultValue={selectedSlot.code}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, code: e.target.value })}
                  />
                  <label><strong>Course Name:</strong></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Machine Learning"
                    defaultValue={selectedSlot.name}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, name: e.target.value })}
                  />
                </>
              )}

              <label><strong>Exam Date:</strong></label>
              <input
                type="date"
                className="adm-input"
                defaultValue={selectedSlot.date}
                onChange={(e) => setSelectedSlot({ ...selectedSlot, date: e.target.value })}
              />

              <label><strong>Time Session:</strong></label>
              <select
                className="adm-select"
                defaultValue={selectedSlot.slot}
                onChange={(e) => setSelectedSlot({ ...selectedSlot, slot: e.target.value })}
              >
                <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                <option value="13:30 - 16:30">Afternoon (13:30 - 16:30)</option>
              </select>

              <label><strong>Assigned Venue / Hall:</strong></label>
              <select
                className="adm-select"
                defaultValue={selectedSlot.hall}
                onChange={(e) =>
                  setSelectedSlot({
                    ...selectedSlot,
                    hall: e.target.value,
                    capacity: e.target.value === "Hall A" ? 80 : e.target.value === "Hall B" ? 60 : 40,
                  })
                }
              >
                <option value="Hall A">Hall A (Capacity 80 seats)</option>
                <option value="Hall B">Hall B (Capacity 60 seats)</option>
                <option value="Hall C">Hall C (Capacity 40 seats)</option>
              </select>

              <div className="adm-advisory-box">
                <strong>Schedule Audit Note:</strong> Hall allocations are validated against simultaneous paper registrations and venue capacity quotas as governed by Faculty Examination Policy Section 3.4.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setSelectedSlot(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  if (!schedule.find((s) => s.id === selectedSlot.id)) {
                    setSchedule([...schedule, selectedSlot]);
                  } else {
                    setSchedule(schedule.map((s) => (s.id === selectedSlot.id ? selectedSlot : s)));
                  }
                  setSelectedSlot(null);
                }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
