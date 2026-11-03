import React, { useState, useMemo, useRef } from "react";
import "./Invigilator_Roster.css";

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

const INITIAL_DUTIES = [
  { id: "d-1", name: "Prof. K.L. Fernando", dept: "Computing", paper: "IT3012 - Software Engineering", date: "2026-11-10", session: "Morning (09:00 - 12:00)", hall: "Hall A", role: "Chief Invigilator", status: "Confirmed" },
  { id: "d-2", name: "Dr. S.P. Jayawardena", dept: "Computing", paper: "IT3012 - Software Engineering", date: "2026-11-10", session: "Morning (09:00 - 12:00)", hall: "Hall A", role: "Hall Invigilator", status: "Confirmed" },
  { id: "d-3", name: "Ms. M.N. Fathima", dept: "Software Systems", paper: "IT3022 - Database Systems", date: "2026-11-12", session: "Morning (09:00 - 12:00)", hall: "Hall B", role: "Hall Invigilator", status: "Pending" },
  { id: "d-4", name: "Mr. T. Rajapakse", dept: "Data Science", paper: "IT3032 - Computer Networks", date: "2026-11-14", session: "Afternoon (13:30 - 16:30)", hall: "Hall A", role: "Chief Invigilator", status: "Confirmed" },
  { id: "d-5", name: "Dr. A.H.M. Munas", dept: "Computing", paper: "IT3042 - Web Technologies", date: "2026-11-17", session: "Morning (09:00 - 12:00)", hall: "Hall C", role: "Hall Invigilator", status: "Pending" },
  { id: "d-6", name: "Ms. K.D. Silva", dept: "Network Systems", paper: "IT3052 - Operating Systems", date: "2026-11-19", session: "Afternoon (13:30 - 16:30)", hall: "Hall A", role: "Relief Invigilator", status: "Confirmed" },
];

const FILTER_LABELS = {
  All: "All Invigilation Duties",
  Confirmed: "Confirmed Allocations",
  "Hall A": "Hall A Duties",
  Chief: "Chief Invigilators",
};

export default function Invigilator_Roster() {
  const [duties, setDuties] = useState(INITIAL_DUTIES);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [hallFilter, setHallFilter] = useState("All");
  const [editingDuty, setEditingDuty] = useState(null);
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const total = duties.length;
    const confirmed = duties.filter((d) => d.status === "Confirmed").length;
    const hallA = duties.filter((d) => d.hall === "Hall A").length;
    const chief = duties.filter((d) => d.role.includes("Chief")).length;
    return { total, confirmed, hallA, chief };
  }, [duties]);

  const statCards = [
    {
      label: "Total duties allocated",
      value: stats.total,
      caption: "Across all halls this session",
      pill: "Total",
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
      value: stats.confirmed,
      caption: "Staff acknowledged allocation",
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
      label: "Hall A duties",
      value: stats.hallA,
      caption: "Main venue roster assignments",
      pill: "Hall A",
      color: "amber",
      filter: "Hall A",
      icon: (
        <StatIcon>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </StatIcon>
      ),
    },
    {
      label: "Chief invigilators",
      value: stats.chief,
      caption: "Senior academics designated",
      pill: "Chiefs",
      color: "purple",
      filter: "Chief",
      icon: (
        <StatIcon>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </StatIcon>
      ),
    },
  ];

  const handleCardClick = (filterValue) => {
    const next = activeFilter === filterValue ? "All" : filterValue;
    setActiveFilter(next);
    setSearch("");
    setRoleFilter("All");
    setHallFilter("All");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearch("");
    setRoleFilter("All");
    setHallFilter("All");
  };

  const filtered = useMemo(() => {
    return duties.filter((d) => {
      if (activeFilter === "Confirmed" && d.status !== "Confirmed") return false;
      if (activeFilter === "Hall A" && d.hall !== "Hall A") return false;
      if (activeFilter === "Chief" && !d.role.includes("Chief")) return false;

      if (search) {
        const q = search.toLowerCase();
        const m = d.name.toLowerCase().includes(q) || d.dept.toLowerCase().includes(q) || d.paper.toLowerCase().includes(q) || d.hall.toLowerCase().includes(q);
        if (!m) return false;
      }
      if (roleFilter !== "All" && d.role !== roleFilter) return false;
      if (hallFilter !== "All" && d.hall !== hallFilter) return false;
      return true;
    });
  }, [duties, activeFilter, search, roleFilter, hallFilter]);

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

      {/* 2. ROSTER TABLE PANEL */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Invigilator Duty Master Roster</h3>
            <p className="adm-panel-sub">
              Faculty examination supervision allocations and session assignments (Section 4.1)
            </p>
          </div>
          <div className="adm-header-actions">
            <button
              type="button"
              className="adm-btn adm-btn-outline"
              onClick={() => window.print()}
            >
              Print Duty Roster
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() =>
                setEditingDuty({
                  id: `d-${Date.now()}`,
                  name: "",
                  dept: "Computing",
                  paper: "",
                  date: new Date().toISOString().split("T")[0],
                  session: "Morning (09:00 - 12:00)",
                  hall: "Hall A",
                  role: "Hall Invigilator",
                  status: "Allocated",
                })
              }
            >
              + Assign Invigilator
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
              placeholder="Search invigilator, department, or paper..."
              className="adm-input adm-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="adm-filter-group">
            <select
              className="adm-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Chief Invigilator">Chief Invigilator</option>
              <option value="Hall Invigilator">Hall Invigilator</option>
              <option value="Relief Invigilator">Relief Invigilator</option>
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
            {(search || roleFilter !== "All" || hallFilter !== "All" || activeFilter !== "All") && (
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
                <th>Invigilator Details</th>
                <th>Assigned Paper</th>
                <th>Duty Session &amp; Date</th>
                <th>Hall Allocation</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--adm-muted)" }}>
                    No invigilator assignments match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="adm-student-meta">
                        <div className="adm-student-avatar">
                          {d.name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="adm-student-name">{d.name}</div>
                          <div className="adm-student-reg">{d.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-paper-title">{d.paper}</div>
                    </td>
                    <td>
                      <div><strong>{d.date}</strong></div>
                      <div className="adm-paper-sub">{d.session}</div>
                    </td>
                    <td>
                      <strong>{d.hall}</strong>
                    </td>
                    <td>
                      <span className={`adm-badge ${d.role.includes("Chief") ? "badge-purple" : "badge-blue"}`}>
                        {d.role}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${d.status === "Confirmed" ? "badge-green" : "badge-amber"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-action-btn"
                        onClick={() => setEditingDuty(d)}
                      >
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

      {/* RICH AUDIT / REASSIGN MODAL */}
      {editingDuty && (
        <div className="adm-modal-overlay" onClick={() => setEditingDuty(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-tag">INVIGILATOR DUTY ALLOCATION &amp; ROSTER AUDIT</span>
                <h2 className="adm-modal-title">
                  {editingDuty.name ? editingDuty.name : "New Duty Assignment"}
                </h2>
                <div className="adm-modal-subtitle">
                  {editingDuty.dept ? `${editingDuty.dept} · ${editingDuty.hall}` : "Configure supervision details"}
                </div>
              </div>
              <button
                type="button"
                className="adm-close-btn"
                onClick={() => setEditingDuty(null)}
              >
                &times;
              </button>
            </div>

            <div className="adm-modal-body">
              {editingDuty.name && (
                <div className="adm-info-banner">
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Academic Staff</span>
                    <span className="adm-info-val">{editingDuty.name}</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Assigned Paper</span>
                    <span className="adm-info-val">{editingDuty.paper || "General Invigilation"}</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Session Schedule</span>
                    <span className="adm-info-val">{editingDuty.date} · {editingDuty.session}</span>
                  </div>
                  <div className="adm-info-item">
                    <span className="adm-info-lbl">Allocation Status</span>
                    <span className="adm-info-val">{editingDuty.status}</span>
                  </div>
                </div>
              )}

              {!editingDuty.name && (
                <>
                  <label><strong>Invigilator Name &amp; Title:</strong></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Dr. K.M. Silva"
                    defaultValue={editingDuty.name}
                    onChange={(e) => setEditingDuty({ ...editingDuty, name: e.target.value })}
                  />
                  <label><strong>Department:</strong></label>
                  <select
                    className="adm-select"
                    defaultValue={editingDuty.dept}
                    onChange={(e) => setEditingDuty({ ...editingDuty, dept: e.target.value })}
                  >
                    <option value="Computing">Computing</option>
                    <option value="Software Systems">Software Systems</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Network Systems">Network Systems</option>
                  </select>
                </>
              )}

              <label><strong>Examination Paper:</strong></label>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. IT3012 - Software Engineering"
                defaultValue={editingDuty.paper}
                onChange={(e) => setEditingDuty({ ...editingDuty, paper: e.target.value })}
              />

              <label><strong>Examination Venue:</strong></label>
              <select
                className="adm-select"
                defaultValue={editingDuty.hall}
                onChange={(e) => setEditingDuty({ ...editingDuty, hall: e.target.value })}
              >
                <option value="Hall A">Hall A</option>
                <option value="Hall B">Hall B</option>
                <option value="Hall C">Hall C</option>
              </select>

              <label><strong>Assigned Supervisory Role:</strong></label>
              <select
                className="adm-select"
                defaultValue={editingDuty.role}
                onChange={(e) => setEditingDuty({ ...editingDuty, role: e.target.value })}
              >
                <option value="Chief Invigilator">Chief Invigilator</option>
                <option value="Hall Invigilator">Hall Invigilator</option>
                <option value="Relief Invigilator">Relief Invigilator</option>
              </select>

              <div className="adm-advisory-box">
                <strong>Supervision Guideline:</strong> Chief invigilators must verify candidate seating plans and seal answer script packets immediately following session conclusion.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setEditingDuty(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  if (!duties.find((d) => d.id === editingDuty.id)) {
                    setDuties([...duties, editingDuty]);
                  } else {
                    setDuties(duties.map((d) => (d.id === editingDuty.id ? editingDuty : d)));
                  }
                  setEditingDuty(null);
                }}
              >
                Save Duty Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
