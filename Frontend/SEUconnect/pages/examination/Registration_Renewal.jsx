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
  const [specFilter, setSpecFilter] = useState("All");
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

    let matchSpec = specFilter === "All" || d.spec === specFilter;

    return matchSearch && matchStatus && matchSpec;
  });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSpecFilter("All");
  };

  const handleCardClick = (filterValue) => {
    const next = statusFilter === filterValue ? "All" : filterValue;
    setSearch("");
    setSpecFilter("All");
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
      {/* 1. STATS CARDS */}
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

      {/* 2. REGISTRATION TABLE PANEL */}
      <section className="adm-panel" ref={tableRef}>
        <div className="adm-panel-head">
          <div>
            <h3 className="adm-panel-title">Registration &amp; Renewal Registry</h3>
            <p className="adm-panel-sub">Semester registration forms and renewal fee validation (Handbook Section 7.2 &amp; 7.6)</p>
          </div>
          <div className="adm-header-actions">
            <button
              type="button"
              className="adm-btn adm-btn-outline"
              onClick={() => window.print()}
            >
              Export Clearance List
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() =>
                setSelectedStudent({
                  id: `REG-${String(data.length + 1).padStart(2, "0")}`,
                  regNo: "",
                  name: "",
                  spec: "Software Systems",
                  sem: "Semester 05",
                  feeStatus: "Paid",
                  receiptNo: "REC-2026-NEW",
                  deanEndorsement: "Endorsed",
                  credits: 16,
                  status: "Cleared",
                })
              }
            >
              + New Registration
            </button>
          </div>
        </div>

        {/* Shows which card filter is on */}
        {statusFilter !== "All" && FILTER_LABELS[statusFilter] && (
          <div className="adm-active-filter">
            <span>
              Showing only: <strong>{FILTER_LABELS[statusFilter]}</strong> candidates ({filtered.length})
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
              className="adm-input adm-search-input"
              placeholder="Search candidate name or reg no..."
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
              <option value="All">All Registration Statuses</option>
              <option value="Cleared">Verified &amp; Cleared</option>
              <option value="Pending">Dean Pending</option>
              <option value="Overdue">Renewal Fee Overdue</option>
            </select>
            <select
              className="adm-select"
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Software Systems">Software Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Network Systems">Network Systems</option>
            </select>
            {(search || statusFilter !== "All" || specFilter !== "All") && (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--adm-muted)" }}>
                    No registration records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-student-meta">
                        <div className="adm-student-avatar">
                          {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="adm-student-name">{r.name}</div>
                          <div className="adm-student-reg">{r.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-spec-title">{r.spec}</div>
                      <div className="adm-spec-sub">{r.sem}</div>
                    </td>
                    <td>
                      <span className="adm-credits-val">
                        <strong>{r.credits}</strong> Credits
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${r.feeStatus === "Paid" ? "badge-green" : r.feeStatus === "Unpaid" ? "badge-red" : "badge-amber"}`}>
                        {r.feeStatus}
                      </span>
                      {r.receiptNo && r.receiptNo !== "None" && (
                        <div className="adm-receipt-hint">{r.receiptNo}</div>
                      )}
                    </td>
                    <td>
                      <span className={`adm-badge ${r.deanEndorsement === "Endorsed" ? "badge-green" : r.deanEndorsement === "Pending" ? "badge-amber" : "badge-red"}`}>
                        {r.deanEndorsement}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${r.status === "Cleared" ? "badge-green" : r.status === "Hold" ? "badge-amber" : "badge-red"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-action-btn"
                        onClick={() => setSelectedStudent(r)}
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RICH AUDIT / REGISTRATION MODAL */}
      {selectedStudent && (
        <div className="adm-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-tag">SEMESTER REGISTRATION &amp; RENEWAL AUDIT</span>
                <h2 className="adm-modal-title">
                  {selectedStudent.name ? selectedStudent.name : "New Registration Entry"}
                </h2>
                <div className="adm-modal-subtitle">
                  {selectedStudent.regNo ? `${selectedStudent.regNo} · ${selectedStudent.spec} · ${selectedStudent.sem}` : "Enter candidate enrollment details"}
                </div>
              </div>
              <button
                type="button"
                className="adm-close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                &times;
              </button>
            </div>

            <div className="adm-modal-body">
              {!selectedStudent.regNo ? (
                <>
                  <label><strong>Student Name:</strong></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. M.S. Hameed"
                    defaultValue={selectedStudent.name}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                  />
                  <label><strong>Registration No:</strong></label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. 22ICT099"
                    defaultValue={selectedStudent.regNo}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, regNo: e.target.value })}
                  />
                  <label><strong>Specialization:</strong></label>
                  <select
                    className="adm-select"
                    defaultValue={selectedStudent.spec}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, spec: e.target.value })}
                  >
                    <option value="Software Systems">Software Systems</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Network Systems">Network Systems</option>
                  </select>
                </>
              ) : (
                <>
                  <div className="adm-info-banner">
                    <div className="adm-info-item">
                      <span className="adm-info-lbl">Renewal Receipt Voucher</span>
                      <span className="adm-info-val">{selectedStudent.receiptNo}</span>
                    </div>
                    <div className="adm-info-item">
                      <span className="adm-info-lbl">Fee Status</span>
                      <span className="adm-info-val">{selectedStudent.feeStatus}</span>
                    </div>
                    <div className="adm-info-item">
                      <span className="adm-info-lbl">Dean Office Endorsement</span>
                      <span className="adm-info-val">{selectedStudent.deanEndorsement}</span>
                    </div>
                    <div className="adm-info-item">
                      <span className="adm-info-lbl">Clearance Standing</span>
                      <span className="adm-info-val">{selectedStudent.status}</span>
                    </div>
                  </div>

                  <div className="adm-advisory-box">
                    <strong>Clearance Checklist:</strong> Verification confirms student has settled semester renewal dues and satisfied faculty prerequisites under Student Handbook Section 7.2.
                  </div>
                </>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-outline"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  if (!data.find((item) => item.id === selectedStudent.id)) {
                    setData([...data, selectedStudent]);
                    setSelectedStudent(null);
                  } else {
                    handleVerify(selectedStudent.id);
                  }
                }}
              >
                {selectedStudent.regNo && data.find((item) => item.id === selectedStudent.id)
                  ? "Endorse & Clear Student"
                  : "Save Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
