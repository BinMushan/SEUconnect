import React, { useMemo, useRef, useState } from "react";
import "./Registration_Renewal.css";

const INITIAL_REGISTRATIONS = [
  { id: "REG-01", regNo: "22ICT041", name: "K.P. Silva", spec: "Software Systems", sem: "Semester 05", feeStatus: "Paid", receiptNo: "REC-2026-101", deanEndorsement: "Endorsed", credits: 16, status: "Cleared" },
  { id: "REG-02", regNo: "22ICT078", name: "A.N. Perera", spec: "Data Science", sem: "Semester 05", feeStatus: "Paid", receiptNo: "REC-2026-104", deanEndorsement: "Endorsed", credits: 14, status: "Cleared" },
  { id: "REG-03", regNo: "21ICT064", name: "F. Nilufar", spec: "Data Science", sem: "Semester 05", feeStatus: "Pending Verification", receiptNo: "SLIP-662", deanEndorsement: "Pending", credits: 16, status: "Hold" },
  { id: "REG-04", regNo: "22ICT089", name: "M.A. Akram", spec: "Network Systems", sem: "Semester 05", feeStatus: "Unpaid", receiptNo: "None", deanEndorsement: "Not Signed", credits: 14, status: "Payment Overdue" },
  { id: "REG-05", regNo: "23ICT012", name: "R. Fernando", spec: "Data Science", sem: "Semester 03", feeStatus: "Paid", receiptNo: "REC-2026-202", deanEndorsement: "Endorsed", credits: 14, status: "Cleared" },
  { id: "REG-06", regNo: "23ICT027", name: "T. Kumar", spec: "Network Systems", sem: "Semester 03", feeStatus: "Paid", receiptNo: "REC-2026-205", deanEndorsement: "Pending", credits: 14, status: "Hold" },
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
  Cleared: "verified & cleared",
  Pending: "Dean office pending",
  Overdue: "renewal fee overdue",
};

export default function RegistrationRenewal() {
  const [data, setData] = useState(INITIAL_REGISTRATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const tableRef = useRef(null);

  const stats = useMemo(() => {
    const total = data.length;
    const cleared = data.filter((d) => d.status === "Cleared").length;
    const pendingDean = data.filter((d) => d.deanEndorsement === "Pending").length;
    const unpaid = data.filter((d) => d.feeStatus === "Unpaid").length;
    return { total, cleared, pendingDean, unpaid };
  }, [data]);

  const statCards = [
    {
      label: "Total registered",
      value: stats.total,
      caption: "Active students this semester",
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
      label: "Verified & cleared",
      value: stats.cleared,
      caption: "Fee & Dean both cleared",
      pill: "Cleared",
      color: "green",
      filter: "Cleared",
      icon: (
        <StatIcon>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </StatIcon>
      ),
    },
    {
      label: "Dean office pending",
      value: stats.pendingDean,
      caption: "Awaiting Dean signature",
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
    {
      label: "Renewal fee overdue",
      value: stats.unpaid,
      caption: "No payment voucher yet",
      pill: "Overdue",
      color: "red",
      filter: "Overdue",
      icon: (
        <StatIcon>
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </StatIcon>
      ),
    },
  ];

  const filtered = data.filter((d) => {
    const matchSearch =
      search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.regNo.toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    if (statusFilter === "Cleared") matchStatus = d.status === "Cleared";
    else if (statusFilter === "Pending") matchStatus = d.deanEndorsement === "Pending";
    else if (statusFilter === "Overdue") matchStatus = d.feeStatus === "Unpaid" || d.status === "Payment Overdue";
    return matchSearch && matchStatus;
  });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = statusFilter === filterValue ? "All" : filterValue;
    setSearch("");
    setStatusFilter(next);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVerify = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, feeStatus: "Paid", deanEndorsement: "Endorsed", status: "Cleared" }
          : item
      )
    );
    setSelectedStudent(null);
  };

  return (
    <div className="adm-page">
      {/* 1. STATS CARDS (click a card to filter the table) */}
      <section className="adm-stats-grid">
        {statCards.map((card) => {
          const isActive =
            card.filter !== "All" && statusFilter === card.filter;

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

      {/* 2. REGISTRATION TABLE */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Registration &amp; Renewal Registry</h3>
            <p className="adm-panel-sub">Semester registration forms and renewal fee validation (Handbook Section 7.2 &amp; 7.6)</p>
          </div>
          <div className="adm-filter-group">
            <input
              type="text"
              className="adm-input"
              placeholder="Search name or reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="adm-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Registrations</option>
              <option value="Cleared">Verified &amp; Cleared</option>
              <option value="Pending">Dean Pending</option>
              <option value="Overdue">Fee Overdue</option>
            </select>
            {(search || statusFilter !== "All") && (
              <button type="button" className="adm-btn-clear" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Shows which card filter is on */}
        {statusFilter !== "All" && FILTER_LABELS[statusFilter] && (
          <p className="adm-active-filter">
            Showing only <strong>{FILTER_LABELS[statusFilter]}</strong> candidates ({filtered.length})
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
                <th>Candidate</th>
                <th>Specialization &amp; Sem</th>
                <th>Credits</th>
                <th>Renewal Fee</th>
                <th>Dean's Endorsement</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong><br /><small>{r.regNo}</small></td>
                  <td>{r.spec}<br /><small>{r.sem}</small></td>
                  <td>{r.credits} Credits</td>
                  <td>
                    <span className={`adm-badge ${r.feeStatus === "Paid" ? "badge-green" : r.feeStatus === "Unpaid" ? "badge-red" : "badge-amber"}`}>
                      {r.feeStatus}
                    </span>
                  </td>
                  <td>{r.deanEndorsement}</td>
                  <td>
                    <span className={`adm-badge ${r.status === "Cleared" ? "badge-green" : "badge-amber"}`}>{r.status}</span>
                  </td>
                  <td>
                    <button type="button" className="adm-btn-action" onClick={() => setSelectedStudent(r)}>
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {selectedStudent && (
        <div className="adm-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="adm-panel-title">Audit Registration: {selectedStudent.name}</h3>
            <p className="adm-panel-sub">{selectedStudent.regNo} · {selectedStudent.spec}</p>
            <div className="adm-modal-body">
              <p><strong>Renewal Receipt:</strong> {selectedStudent.receiptNo}</p>
              <p><strong>Fee Status:</strong> {selectedStudent.feeStatus}</p>
              <p><strong>Dean Endorsement:</strong> {selectedStudent.deanEndorsement}</p>
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="adm-btn adm-btn-light" onClick={() => setSelectedStudent(null)}>Close</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => handleVerify(selectedStudent.id)}>Endorse &amp; Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
