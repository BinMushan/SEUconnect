import React, { useState, useMemo, useRef } from "react";
import "./examination.css";
import DashboardTemplate from "../../components/dashbord/dashboard_template";
import ExamEntry from "./Exam_Entry";
import Eligibility_Verification from "./Eligibility_Verification";
import Repeat_Candidates from "./Repeat_Candidates";
import Medical_Notifications from "./Medical_Notifications";
import Special_Needs from "./Special_Needs";
import Examination_Offences from "./Examination_Offences";
import Results_Compilation from "./Results_Compilation";
import Registration_Renewal from "./Registration_Renewal";
import Timetable_Builder from "./Timetable_Builder";
import Invigilator_Roster from "./Invigilator_Roster";
import Reports from "./Reports";

function ComingSoon({ title }) {
  return (
    <div className="std-quick-actions-card">
      <h3 className="std-card-heading">{title}</h3>
      <p className="std-card-sub">This page is not built yet.</p>
    </div>
  );
}

// Sidebar icon wrapper
const Icon = ({ children }) => (
  <svg
    width="18"
    height="18"
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
   SIDEBAR MENU
   The "id" of each item must match a case in renderPage()
========================================= */

const EXAM_NAV_SECTIONS = [
  {
    title: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <Icon>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </Icon>
        ),
      },
    ],
  },
  {
    title: "EXAMINATIONS",
    items: [
      {
        id: "exam_entry",
        label: "Exam Entry & Admission Cards",
        icon: (
          <Icon>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </Icon>
        ),
      },
      {
        id: "eligibility",
        label: "Eligibility Verification",
        icon: (
          <Icon>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </Icon>
        ),
      },
      {
        id: "repeat",
        label: "Repeat Candidates",
        icon: (
          <Icon>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="m9 14 2 2 4-4" />
          </Icon>
        ),
      },
      {
        id: "medical",
        label: "Medical Notifications",
        icon: (
          <Icon>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </Icon>
        ),
      },
      {
        id: "special_needs",
        label: "Special Needs Requests",
        icon: (
          <Icon>
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </Icon>
        ),
      },
      {
        id: "offences",
        label: "Examination Offences",
        icon: (
          <Icon>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </Icon>
        ),
      },
      {
        id: "results",
        label: "Results Compilation",
        icon: (
          <Icon>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </Icon>
        ),
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        id: "registration",
        label: "Registration & Renewal",
        icon: (
          <Icon>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </Icon>
        ),
      },
      {
        id: "timetable",
        label: "Timetable Builder",
        icon: (
          <Icon>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </Icon>
        ),
      },
      {
        id: "invigilator",
        label: "Invigilator Roster",
        icon: (
          <Icon>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </Icon>
        ),
      },
      {
        id: "reports",
        label: "Reports",
        icon: (
          <Icon>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </Icon>
        ),
      },
    ],
  },
];

/* =========================================
   DASHBOARD STAT CARDS & QUEUE DATA
========================================= */

const DASH_STAT_CARDS = [
  {
    id: "cards",
    filter: "cards",
    title: "ADMISSION CARDS",
    number: "342",
    target: "18 awaiting eligibility check",
    badge: "Pending",
    color: "blue",
    pageId: "exam_entry",
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
    id: "eligibility",
    filter: "eligibility",
    title: "ELIGIBILITY ALERTS",
    number: "57",
    target: "Barred from sitting ESA",
    badge: "Below 80%",
    color: "red",
    pageId: "eligibility",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "repeat",
    filter: "repeat",
    title: "REPEAT CANDIDATES",
    number: "6",
    target: "On their 3rd attempt this semester",
    badge: "Near Limit",
    color: "amber",
    pageId: "repeat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </svg>
    ),
  },
  {
    id: "medical",
    filter: "medical",
    title: "MEDICAL NOTIFICATIONS",
    number: "11",
    target: "4 nearing the 2-week deadline",
    badge: "Open",
    color: "emerald",
    pageId: "medical",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      </svg>
    ),
  },
];

const FILTER_LABELS = {
  All: "All Examination Tasks",
  cards: "Admission Cards & Exam Entry Queue",
  eligibility: "Eligibility Alerts (< 80% Attendance)",
  repeat: "Repeat Candidates (3rd Attempt Limit)",
  medical: "Medical Notifications (Awaiting MC)",
};

const INITIAL_QUEUE_ITEMS = [
  {
    id: "q-1",
    name: "K.P. Silva · 22ICT041",
    detail: "Software Systems · 6 subjects registered",
    status: "Eligible",
    statusClass: "status-success",
    avatar: "KP",
    avatarClass: "avatar-blue",
    category: "cards",
  },
  {
    id: "q-2",
    name: "A.N. Perera · 22ICT078",
    detail: "Data Science · Attendance 74% (Barred from ESA)",
    status: "Ineligible",
    statusClass: "status-danger",
    avatar: "AN",
    avatarClass: "avatar-red",
    category: "eligibility",
  },
  {
    id: "q-3",
    name: "M.F. Rasheed · 21ICT019",
    detail: "Software Systems · Repeat candidate, attempt 2",
    status: "Review",
    statusClass: "status-warning",
    avatar: "MF",
    avatarClass: "avatar-blue",
    category: "repeat",
  },
  {
    id: "q-4",
    name: "S. Jayasuriya · 22ICT103",
    detail: "Network Systems · 5 subjects registered",
    status: "Eligible",
    statusClass: "status-success",
    avatar: "SJ",
    avatarClass: "avatar-blue",
    category: "cards",
  },
  {
    id: "q-5",
    name: "H. Nazeer · 22ICT056",
    detail: "Software Systems · Sickness notice filed (Base Hospital)",
    status: "Medical Notice",
    statusClass: "status-info",
    avatar: "HN",
    avatarClass: "avatar-purple",
    category: "medical",
  },
  {
    id: "q-6",
    name: "F. Nilufar · 21ICT064",
    detail: "Data Science · 2 days remaining for medical certificate",
    status: "Urgent MC",
    statusClass: "status-danger",
    avatar: "FN",
    avatarClass: "avatar-red",
    category: "medical",
  },
  {
    id: "q-7",
    name: "S. Divya · 22ICT115",
    detail: "Data Science · Attendance 68% (Appeals committee pending)",
    status: "Ineligible",
    statusClass: "status-danger",
    avatar: "SD",
    avatarClass: "avatar-red",
    category: "eligibility",
  },
  {
    id: "q-8",
    name: "T. Kumar · 23ICT027",
    detail: "Network Systems · 3rd attempt repeat registration",
    status: "Review",
    statusClass: "status-warning",
    avatar: "TK",
    avatarClass: "avatar-blue",
    category: "repeat",
  },
];

/* =========================================
   DASHBOARD PAGE
   goTo(id) switches the page from the Quick Actions buttons
========================================= */

function ExaminationHome({ goTo }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const queueRef = useRef(null);

  const handleCardClick = (filter) => {
    if (activeFilter === filter && filter !== "All") {
      setActiveFilter("All");
    } else {
      setActiveFilter(filter);
    }
    queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setSearchQuery("");
  };

  const filteredQueue = useMemo(() => {
    return INITIAL_QUEUE_ITEMS.filter((item) => {
      if (activeFilter !== "All" && item.category !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.detail.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="std-dashboard-container">
      {/* ---------- 1. STATISTICS ---------- */}
      <section className="std-stats-grid">
        {DASH_STAT_CARDS.map((card) => {
          const isActive = activeFilter === card.filter;
          const badgeClass =
            card.color === "blue"
              ? "badge-blue"
              : card.color === "red"
              ? "badge-red"
              : card.color === "amber"
              ? "badge-amber"
              : "badge-green";
          const iconWrapClass =
            card.color === "blue"
              ? "icon-blue"
              : card.color === "red"
              ? "icon-red"
              : card.color === "amber"
              ? "icon-amber"
              : "icon-emerald";

          return (
            <button
              type="button"
              key={card.id}
              className={`std-stat-card std-stat-click ${isActive ? "is-active" : ""}`}
              onClick={() => handleCardClick(card.filter)}
              aria-pressed={isActive}
            >
              <div className="std-stat-head">
                <div className={`std-stat-icon-wrap ${iconWrapClass}`}>
                  {card.icon}
                </div>
                <span className={`std-stat-badge ${badgeClass}`}>
                  {card.badge}
                </span>
              </div>
              <div className="std-stat-body">
                <span className="std-stat-title">{card.title}</span>
                <div className="std-stat-number">{card.number}</div>
                <div className="std-stat-target">{card.target}</div>
              </div>
            </button>
          );
        })}
      </section>

      {/* ---------- 2. WHAT DO YOU NEED TO PROCESS ---------- */}
      <section className="std-guidance-card exam-process-card">
        <div className="std-guidance-header">
          <div className="std-guidance-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="std-guidance-title">What do you need to process?</h3>
        </div>

        <p className="std-guidance-subtitle">
          Look up examination procedures, forms, eligibility rules, and
          deadlines from the Faculty Handbook.
        </p>

        <div className="std-guidance-search-bar">
          <div className="std-search-input-box">
            <svg className="std-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="std-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={'Try "process a special needs request", "issue admission card", "repeat attempt limit"...'}
            />
          </div>
          <button
            type="button"
            className="std-find-process-btn"
            onClick={() => queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Find Process
          </button>
        </div>

        <div className="std-suggested-row">
          <span className="std-suggested-label">Suggested:</span>
          <button
            type="button"
            className="std-suggested-chip"
            onClick={() => handleCardClick("cards")}
          >
            Admission Card Checklist
          </button>
          <button
            type="button"
            className="std-suggested-chip"
            onClick={() => handleCardClick("medical")}
          >
            Sick Notification Form
          </button>
          <button
            type="button"
            className="std-suggested-chip"
            onClick={() => goTo("offences")}
          >
            Offence Referral Steps
          </button>
          <button
            type="button"
            className="std-suggested-chip"
            onClick={() => handleCardClick("repeat")}
          >
            Repeat Attempt Policy
          </button>
        </div>
      </section>

      {/* ---------- 3. QUEUE + QUICK ACTIONS + DEADLINES ---------- */}
      <section className="std-middle-grid">
        {/* LEFT: queue */}
        <div className="std-quick-actions-card" ref={queueRef}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 className="std-card-heading">Exam Entry &amp; Admission Card Queue</h3>
              <p className="std-card-sub">
                Submitted entry forms awaiting eligibility check and card issuance
              </p>
            </div>
            {(activeFilter !== "All" || searchQuery) && (
              <button
                type="button"
                className="std-btn-clear"
                onClick={resetFilters}
                style={{ fontSize: 13, alignSelf: "center" }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {activeFilter !== "All" && (
            <div className="std-active-filter">
              <span>
                Showing only: <strong>{FILTER_LABELS[activeFilter] || activeFilter}</strong> ({filteredQueue.length} record{filteredQueue.length === 1 ? "" : "s"})
              </span>
              <button type="button" className="std-btn-clear" onClick={resetFilters}>
                Show all
              </button>
            </div>
          )}

          <ul className="std-queue-list">
            {filteredQueue.length === 0 ? (
              <li style={{ padding: "24px 0", textAlign: "center", color: "#8a94a6", fontSize: 13 }}>
                No queue records match your active filter.
              </li>
            ) : (
              filteredQueue.map((item) => (
                <li key={item.id} className="std-queue-item">
                  <span className={`std-avatar ${item.avatarClass}`}>{item.avatar}</span>
                  <div className="std-queue-info">
                    <div className="std-queue-name">{item.name}</div>
                    <div className="std-queue-detail">{item.detail}</div>
                  </div>
                  <span className={`std-status-label ${item.statusClass}`}>{item.status}</span>
                </li>
              ))
            )}
          </ul>

          {activeFilter !== "All" && (
            <button
              type="button"
              className="std-queue-jump-btn"
              onClick={() => {
                const card = DASH_STAT_CARDS.find((c) => c.filter === activeFilter);
                if (card?.pageId) goTo(card.pageId);
              }}
            >
              Open Full {FILTER_LABELS[activeFilter]} Module &rarr;
            </button>
          )}
        </div>

        {/* RIGHT: quick actions + deadlines */}
        <div className="std-quick-actions-card">
          <h3 className="std-card-heading">Quick Actions</h3>
          <p className="std-card-sub">Common tasks for this session</p>

          <div className="std-actions-list">
            <button type="button" className="std-action-btn" onClick={() => goTo("exam_entry")}>
              <span className="std-action-icon icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <line x1="8" y1="9" x2="16" y2="9" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="12" y2="17" />
                </svg>
              </span>
              <span className="std-action-label">Issue Admission Cards</span>
            </button>

            <button type="button" className="std-action-btn" onClick={() => goTo("medical")}>
              <span className="std-action-icon icon-emerald">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                </svg>
              </span>
              <span className="std-action-label">Log Medical Notification</span>
            </button>

            <button type="button" className="std-action-btn" onClick={() => goTo("offences")}>
              <span className="std-action-icon icon-red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
              </span>
              <span className="std-action-label">Review Offence Report</span>
            </button>

            <button type="button" className="std-action-btn" onClick={() => goTo("timetable")}>
              <span className="std-action-icon icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                </svg>
              </span>
              <span className="std-action-label">Build Exam Timetable</span>
            </button>
          </div>

          <h3 className="std-card-heading std-dl-heading">Upcoming Deadlines</h3>

          <ul className="std-dl-list">
            <li className="std-dl-item">
              <span className="std-dl-dot dot-red" />
              <span className="std-dl-text">4 medical certificates due — 2-week window</span>
              <span className="std-dl-when">2 days</span>
            </li>
            <li className="std-dl-item">
              <span className="std-dl-dot dot-amber" />
              <span className="std-dl-text">Special needs approvals from Faculty Board</span>
              <span className="std-dl-when">5 days</span>
            </li>
            <li className="std-dl-item">
              <span className="std-dl-dot dot-blue" />
              <span className="std-dl-text">CA/ESA marks close-out for Board of Examiners</span>
              <span className="std-dl-when">9 days</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function Examination({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const examinationUser = {
    ...user,
    name: user?.name || "Examination Officer",
    email: user?.email || "examination@seu.ac.lk",
    semester: user?.semester || "Examination Unit",
    role: "EXAMINATION OFFICER",
  };

  // Picks which page to show under the banner
  const renderPage = () => {
    switch (activePage) {
      case "exam_entry":
        return <ExamEntry />;
      case "eligibility":
        return <Eligibility_Verification />;
      case "repeat":
        return <Repeat_Candidates />;
      case "medical":
        return <Medical_Notifications />;
      case "special_needs":
        return <Special_Needs />;
      case "offences":
        return <Examination_Offences />;
      case "results":
        return <Results_Compilation />;
      case "registration":
        return <Registration_Renewal />;
      case "timetable":
        return <Timetable_Builder />;
      case "invigilator":
        return <Invigilator_Roster />;
      case "reports":
        return <Reports />;
      default:
        return <ExaminationHome goTo={setActivePage} />;
    }
  };

  return (
    <DashboardTemplate
      user={examinationUser}
      onLogout={onLogout}
      activeItem={activePage}
      onNavigate={setActivePage}
      navSections={EXAM_NAV_SECTIONS}
      greetingText="Good Morning, Examination Officer"
      notificationCount={3}
      searchPlaceholder="Search students, examinations, results..."
      metaItems={[
        { label: "Unit:", value: "Examination Unit" },
        { label: "Faculty:", value: "Technology" },
        { label: "Role:", value: "Examination Officer" },
      ]}
      actionButtons={
        <>
          <button
            type="button"
            className="seu-btn-gpa-report"
            onClick={() => setActivePage("exam_entry")}
          >
            Issue Admission Cards
          </button>
          <button
            type="button"
            className="seu-btn-faculty-forms"
            onClick={() => setActivePage("timetable")}
          >
            Build Timetable
          </button>
        </>
      }
    >
      {renderPage()}
    </DashboardTemplate>
  );
}
