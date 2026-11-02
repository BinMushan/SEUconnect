import React, { useMemo, useRef, useState } from "react";
import "./Invigilator_Roster.css";

const INITIAL_ROSTER = [
  { id: "INV-01", name: "Dr. K. Cassim", dept: "ICT", rank: "Senior Lecturer", paper: "IT3012 - Software Engineering", date: "2026-11-10", slot: "09:00 AM", hall: "Hall A", role: "Chief Invigilator", status: "Confirmed" },
  { id: "INV-02", name: "Prof. S. Riyas", dept: "ICT", rank: "Professor", paper: "IT3022 - Database Systems", date: "2026-11-12", slot: "09:00 AM", hall: "Hall A", role: "Chief Invigilator", status: "Confirmed" },
  { id: "INV-03", name: "Eng. M. Faleel", dept: "ICT", rank: "Lecturer", paper: "IT3032 - Computer Networks", date: "2026-11-14", slot: "02:00 PM", hall: "Hall B", role: "Hall Supervisor", status: "Confirmed" },
  { id: "INV-04", name: "Dr. A. Ilmudeen", dept: "ICT", rank: "Senior Lecturer", paper: "IT3042 - Web Technologies", date: "2026-11-17", slot: "09:00 AM", hall: "Hall B", role: "Hall Supervisor", status: "Confirmed" },
  { id: "INV-05", name: "Mr. T. Subahan", dept: "ICT", rank: "Demonstrator", paper: "IT3052 - Operating Systems", date: "2026-11-19", slot: "02:00 PM", hall: "Hall A", role: "Hall Invigilator", status: "Assigned" },
  { id: "INV-06", name: "Dr. R. Nafeez", dept: "ICT", rank: "Lecturer", paper: "IT3062 - Information Security", date: "2026-11-21", slot: "09:00 AM", hall: "Hall C", role: "Hall Supervisor", status: "Pending Acceptance" },
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
  Confirmed: "confirmed duties",
  Chief: "chief invigilators",
  Pending: "pending acceptance",
};

export default function InvigilatorRoster() {
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [selectedInv, setSelectedInv] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const totalStaff = new Set(roster.map((r) => r.name)).size;
    const confirmedDuties = roster.filter((r) => r.status === "Confirmed").length;
    const chiefCount = roster.filter((r) => r.role === "Chief Invigilator").length;
    const pendingDuties = roster.filter((r) => r.status.includes("Pending")).length;
    return { totalStaff, confirmedDuties, chiefCount, pendingDuties };
  }, [roster]);

  const statCards = [
    {
      label: "Invigilators rostered",
      value: stats.totalStaff,
      caption: "Academic staff on duty",
      pill: "Staff",
      color: "blue",
      filter: "All",
      icon: (
        <StatIcon>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </StatIcon>
      ),
    },
    {
      label: "Confirmed duties",
      value: stats.confirmedDuties,
      caption: "Accepted roster allocations",
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
      label: "Chief invigilators",
      value: stats.chiefCount,
      caption: "Senior academics appointed",
      pill: "Chiefs",
      color: "purple",
      filter: "Chief",
      icon: (
        <StatIcon>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </StatIcon>
      ),
    },
    {
      label: "Pending acceptance",
      value: stats.pendingDuties,
      caption: "Awaiting confirmation",
      pill: "Pending",
      color: "amber",
      filter: "Pending",
      icon: (
        <StatIcon>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </StatIcon>
      ),
    },
  ];

  const filtered = roster.filter((r) => {
    const term = search.toLowerCase().trim();
    const matchSearch =
      term === "" ||
      r.name.toLowerCase().includes(term) ||
      r.paper.toLowerCase().includes(term) ||
      r.hall.toLowerCase().includes(term) ||
      r.role.toLowerCase().includes(term);

    let matchStatus = true;
    if (statusFilter === "Confirmed") matchStatus = r.status === "Confirmed";
    else if (statusFilter === "Pending") matchStatus = r.status.includes("Pending");

    let matchRole = true;
    if (roleFilter === "Chief") matchRole = r.role === "Chief Invigilator";
    else if (roleFilter !== "All") matchRole = r.role === roleFilter;

    return matchSearch && matchStatus && matchRole;
  });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
    setActiveFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = activeFilter === filterValue ? "All" : filterValue;
    setActiveFilter(next);
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");

    if (next === "Confirmed") {
      setStatusFilter("Confirmed");
    } else if (next === "Chief") {
      setRoleFilter("Chief");
    } else if (next === "Pending") {
      setStatusFilter("Pending");
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

      {/* 2. ROSTER TABLE */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Invigilation Duty Allocation Roster</h3>
            <p className="adm-panel-sub">Official duty distribution approved by Dean (Handbook Section 8.1.1)</p>
          </div>
          <div className="adm-filter-group">
            <input
              type="text"
              className="adm-input"
              placeholder="Search staff, paper, or hall..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="adm-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActiveFilter(e.target.value === "Confirmed" ? "Confirmed" : e.target.value === "Pending" ? "Pending" : "All");
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending Acceptance</option>
            </select>
            <select
              className="adm-input"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setActiveFilter(e.target.value === "Chief" || e.target.value === "Chief Invigilator" ? "Chief" : "All");
              }}
            >
              <option value="All">All Roles</option>
              <option value="Chief">Chief Invigilator</option>
              <option value="Hall Supervisor">Hall Supervisor</option>
              <option value="Hall Invigilator">Hall Invigilator</option>
            </select>
            {(search || statusFilter !== "All" || roleFilter !== "All") && (
              <button type="button" className="adm-btn-clear" onClick={resetFilters}>
                Reset
              </button>
            )}
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => window.print()}>
              Print Duty Roster
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
                <th>Academic Staff</th>
                <th>Assigned Paper</th>
                <th>Date &amp; Time</th>
                <th>Hall</th>
                <th>Designated Duty Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--adm-muted)" }}>
                    No invigilation records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><br /><small>{r.rank} ({r.dept})</small></td>
                    <td>{r.paper}</td>
                    <td>{r.date} ({r.slot})</td>
                    <td><strong>{r.hall}</strong></td>
                    <td>{r.role}</td>
                    <td>
                      <span className={`adm-badge ${r.status === "Confirmed" ? "badge-green" : "badge-amber"}`}>{r.status}</span>
                    </td>
                    <td>
                      <button type="button" className="adm-btn-action" onClick={() => setSelectedInv(r)}>
                        Reassign
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
      {selectedInv && (
        <div className="adm-modal-overlay" onClick={() => setSelectedInv(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="adm-panel-title">Reassign Duty: {selectedInv.name}</h3>
            <p className="adm-panel-sub">{selectedInv.paper} · {selectedInv.date}</p>
            <div className="adm-modal-body">
              <label><strong>Designated Duty Role:</strong></label>
              <select className="adm-input" defaultValue={selectedInv.role}>
                <option value="Chief Invigilator">Chief Invigilator</option>
                <option value="Hall Supervisor">Hall Supervisor</option>
                <option value="Hall Invigilator">Hall Invigilator</option>
              </select>
              <label><strong>Assigned Examination Hall:</strong></label>
              <input type="text" className="adm-input" defaultValue={selectedInv.hall} />
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="adm-btn adm-btn-light" onClick={() => setSelectedInv(null)}>Cancel</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => setSelectedInv(null)}>Save Roster</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
