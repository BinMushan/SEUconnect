# SEUconnect 🎓

> **Unified University Academic & Administrative Digital Platform**  
> *Developed for the South Eastern University of Sri Lanka (SEUSL) • Faculty of Technology*  
> *Internet Application Development (IAD) Continuous Assessment Project*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![AI Assistant](https://img.shields.io/badge/AI_Assistant-Google_Gemini_RAG-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Project Status](https://img.shields.io/badge/Status-Active_Development-orange.svg)]()

---

## 📌 Table of Contents

- [About SEUconnect](#-about-seuconnect)
- [System Architecture & Core Highlights](#-system-architecture--core-highlights)
- [Role-Based Portals & Modules](#-role-based-portals--modules)
- [Official SEUSL Digital Forms & Workflow Engine](#-official-seusl-digital-forms--workflow-engine)
- [AI Academic Assistant & RAG Engine](#-ai-academic-assistant--rag-engine)
- [Demo Credentials](#-demo-credentials)
- [Directory Structure](#-directory-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started & Installation](#-getting-started--installation)
- [Available Scripts & Automated Tests](#-available-scripts--automated-tests)
- [Project Academic Context](#-project-academic-context)
- [License](#-license)

---

## 📖 About SEUconnect

**SEUconnect** is a comprehensive, production-oriented university web platform designed to digitize, unify, and automate academic and administrative operations across the **Faculty of Technology at the South Eastern University of Sri Lanka (SEUSL)**.

The platform bridges students, lecturers, academic advisors, heads of departments (HOD), faculty deans, senior assistant registrars (SAR), and examination officers within an integrated, paperless ecosystem. It standardizes curriculum tracking, semester enrolments, attendance verification, continuous assessment, official examination workflows, grade compilation, and student administrative requests in strict accordance with the official SEUSL Faculty Handbook and academic regulations.

---

## 🏛️ System Architecture & Core Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Vite)                     │
│  Role Portals: Student • Lecturer • HOD • Dean • Exam • Admin • SAR   │
│  Stateful Hash Routing  •  SEUSL Design System  •  Digital Form Suite  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ RESTful JSON APIs / Auth Bearer JWT
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Backend (Node.js + Express 5)                    │
│  ┌───────────────────────────────┐   ┌──────────────────────────────┐  │
│  │   /api/* (Workflow Engine)    │   │  /api/v1/* (Core Academic)   │  │
│  │  • Multi-Tier Stage Routing   │   │  • Auth, RBAC & Scopes       │  │
│  │  • Digital Upload Handlers    │   │  • Students, Batches & Staff │  │
│  │  • Form Audit & Status Trails │   │  • Curriculum & Timetables   │  │
│  └───────────────────────────────┘   └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         AI Assistant Module (RAG + Google Gemini + Tools)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose 9 Transactions & Replica Sets
┌───────────────────────────────────▼────────────────────────────────────┐
│                 Database & Cloud Infrastructure (MongoDB Atlas)        │
│       Normalized Collections • Indexed Aggregations • Audit Logs       │
└────────────────────────────────────────────────────────────────────────┘
```

- **Dual API Design:**
  - `/api/*`: Dedicated process request engine powering official university paperless workflows, file attachments, and multi-tier approval chains.
  - `/api/v1/*`: Modular academic management service covering authenticated users, permissions, curriculum allocation, student cohorts, results, and notifications.
- **Enterprise Security & RBAC:**
  - Passwords secured with scrypt hashing; brute-force protection via account lockout policies and rate limiting.
  - Scoped data access rules (`own < assigned < department < faculty < system`) enforced on server controllers.
  - Immutable audit logs for academic grade modifications and formal approvals.
- **Handbook-Compliant Curriculum Engine:**
  - Authentic 8-semester course structure across degree programmes (BICT Honours, BBST Honours) and specializations (Software Technology - SWT, Network Technology - NST, Biosystems Technology tracks).
  - Dynamic prerequisite enforcement, credit limit boundaries, and core/elective rules.

---

## 🎓 Role-Based Portals & Modules

The platform delivers purpose-built workspaces customized to the responsibilities of each university authority:

### 1. 🎓 Student Portal
- **Academic Progress & Overview:** Real-time metrics showing accumulated credits, current semester status, and degree progression.
- **Live Attendance Matrix:** Subject-wise breakdown with automatic detection of the mandatory 80% examination eligibility cutoff.
- **GPA & CGPA Calculator:** Real-time GPA projection with grade-point weighting and historical semester transcript view.
- **Interactive Timetable:** Live schedule displaying lecture hours, labs, lecture halls, and assigned course staff.
- **Semester Registration & Course Enrolment:** One-click registration for active semester subjects according to academic curriculum.
- **Paperless Faculty Forms:** Digital submission of official faculty forms with live progress tracking across approval stages.

### 2. 👨‍🏫 Lecturer Portal
- **Attendance Management:** Live recording of lecture attendance with student eligibility counters and bulk session submission.
- **Continuous Assessment (CA) & Marks Entry:** In-portal grading for assignments, midterms, practicals, and ESA components.
- **Course Allocations:** View assigned modules, enrolled batch lists, syllabus outlines, and lecture timetables.
- **Announcements & Broadcasts:** Publish notices and academic circulars targeted to specific enrolled batches.

### 3. 🏛️ Head of Department (HOD) Portal
- **Course & Staff Allocation:** Assign lecturers and demonstrators to 8-semester handbook courses across degree specializations.
- **Attendance Audits:** Department-wide audit reports flagging low attendance before examination entry clearances.
- **Repeat Examination Endorsements:** Review, endorse, or escalate repeat exam applications.
- **Department Board Minutes:** Maintain and archive department academic committee minutes and decisions.
- **Faculty Dean Escalations:** Structured channel to forward student matters and appeals to the Dean's office.

### 4. 📜 Dean Portal
- **Faculty Progression KPIs:** Executive analytics covering overall pass rates, batch progression, and student demographics.
- **Examination Board Clearances:** Final faculty-level clearance for semester examination sittings and results compilation.
- **Departmental Oversight:** Review escalated student requests, repeat appeals, and inter-departmental matters.

### 5. ⚙️ Administrative & Super Admin Portals
- **Student & Batch Management:** Dynamic student registry with multi-attribute filtering (batch, department, degree, status), bulk student onboarding, progression transitions, and cascading data integrity.
- **Curriculum & Subject Management:** Comprehensive course registry with credits, lecture/practical hours, course codes, and prerequisite mapping.
- **User & Role Administration:** System-wide user profile management, password resets, role assignment, and access control.
- **Notification Broadcast Center:** Send instant in-app alerts and notifications to roles, departments, or individual student batches.

### 6. 📝 Examination Officer & Senior Assistant Registrar (SAR) Portals
- **Results Compilation:** Multi-stage compilation of CA and final exam marks into official grade distribution sheets.
- **Medical Requests Review:** Inspection and verification of student medical certificates with hospital PIV proofs.
- **Examination Admissions:** Verification of exam admission eligibility, repeat candidates, and fee payment receipts.

---

## 📄 Official SEUSL Digital Forms & Workflow Engine

SEUconnect replaces physical paperwork with high-fidelity digital replicas of official SEUSL paper forms, complete with multi-tier approval routing, file uploads, and digital signature capture:

| Form Name | Workflow Purpose | Approval Stages | Required Attachments |
| :--- | :--- | :--- | :--- |
| **Examination Entry Form** | Registration for regular semester end examinations | Student → Examination Officer → SAR | Payment Receipt / PIV (if applicable) |
| **Medical Submission Form** | Official 2-page medical excuse application for missed exams or lectures | Student → Dept MA → Lecturer / HOD → Dean / SAR | Registered Medical Certificate, Hospital Records, PIV |
| **CA Repeat Examination Form** | Registration to re-sit continuous assessment components | Student → Course Lecturer → HOD → Exam Branch | Payment Verification Slip, Signature |
| **Marks Re-Scrutinization Form** | Formal application for re-scrutinizing exam marks and grades | Student → Department Head → Dean → Examination Board | Bank Paying-In Voucher (PIV), Digital Signature |
| **Email & Administrative Requests** | Official inquiries, certificate requests, and general grievances | Student → Administrative Officer / SAR | Supporting Documents |

Each submission generates an immutable tracking record with real-time status badges (`Submitted`, `Under Review`, `Approved`, `Rejected`), stage timestamps, and officer comments.

---

## 🤖 AI Academic Assistant & RAG Engine

SEUconnect includes an intelligent academic assistant (`/api/v1/assistant`) powered by Google Gemini and Retrieval-Augmented Generation (RAG):

- **Role-Gated Personas:** Automatically adopts the appropriate persona based on the authenticated user's session token (Student Assistant, Lecturer Assistant, HOD Advisor).
- **RAG Policy Retrieval:** Chunks and indexes the Faculty Handbook, academic regulations, examination by-laws, and graduation criteria using Gemini Embeddings and BM25 search.
- **Function Calling & Dynamic Tools:**
  - `my_gpa`: Analyzes semester SGPA and calculates target grades required to hit class honors thresholds.
  - `my_attendance`: Checks attendance eligibility for upcoming semester examinations.
  - `pending_actions`: Summarizes submitted faculty forms and pending administrative approvals.
  - `student_overview`: Provides academic staff with aggregated statistics on student standing.
- **Rule-Based Fallback Mode:** Operates safely using local handbook rules and database queries even if external LLM APIs are offline.

---

## 🔑 Demo Credentials

Pre-configured demo accounts are provided for testing all system roles:

| Portal Role | Demo Email | Password | URL Hash Route |
| :--- | :--- | :--- | :--- |
| **Student** | `Student@gmail.com` | `123456` | `/#student` |
| **Lecturer** | `Lecturer@gmail.com` | `123456` | `/#lecturer` |
| **Head of Department (HOD)** | `HOD@gmail.com` | `123456` | `/#hod` |
| **Dean** | `Dean@gmail.com` | `123456` | `/#dean` |
| **System Admin** | `Admin@gmail.com` | `123456` | `/#admin` |
| **Examination Officer** | `Examination@gmail.com` | `123456` | `/#examination` |
| **Super Admin** | `SuperAdmin@gmail.com` | `123456` | `/#superadmin` |

*(Note: Email authentication is case-insensitive for testing convenience).*

---

## 📁 Directory Structure

```text
SEUconnect/
├── Backend/
│   ├── config/                   # Curriculum schedules and database configurations
│   ├── controller/               # Student domain controllers
│   ├── controllers/              # Auth, process, stats, and notification controllers
│   ├── core/                     # Shared infra (RBAC, validation, pagination, audit, transactions)
│   ├── middleware/               # Authentication and permission verification middleware
│   ├── models/                   # Mongoose schemas (User, Student, Batch, Subject, ProcessRequest, etc.)
│   ├── modules/                  # Modular sub-systems (Assistant RAG, LLM services, knowledge base)
│   ├── routes/                   # Express routes (/api and /api/v1 endpoints)
│   ├── scripts/                  # Data migration and administrative backup scripts
│   ├── store/                    # In-memory persistence fallback layer
│   ├── tests/                    # Unit, integration, and workflow automated test suites
│   ├── workflows/                # Form workflow definitions and multi-stage lifecycle engine
│   ├── server.js                 # Primary backend Express entrypoint
│   └── package.json              # Backend dependencies (Express 5, Mongoose 9, JWT, Zod)
│
├── Frontend/
│   └── SEUconnect/               # React 19 + Vite client application
│       ├── public/               # Static assets, university crest, campus photography
│       ├── pages/                # Role portal modules
│       │   ├── admin/            # Administrator components (Batches, Students, Curriculums)
│       │   ├── dean/             # Dean oversight and KPI dashboards
│       │   ├── dept_ma/          # Department Management Assistant portal
│       │   ├── examination/      # Examination board and results compilation
│       │   ├── fma/              # Faculty Management Assistant portal
│       │   ├── hod/              # Department Head course and staff coordination
│       │   ├── Lecturer/         # Lecturer attendance, results, and timetables
│       │   ├── login/            # SEUSL branded authentication interface
│       │   ├── sar/              # Senior Assistant Registrar portal
│       │   ├── student/          # Student portal and digital form suites
│       │   └── superadmin/       # Super administrator system controls
│       ├── src/
│       │   ├── components/       # Shared UI components, role switcher, navigation bars
│       │   ├── services/         # API client utilities and curriculum data stores
│       │   ├── App.jsx           # Master application router & state manager
│       │   ├── index.css         # Global SEUSL design tokens & CSS resets
│       │   └── main.jsx          # React DOM entry point
│       ├── package.json          # Frontend dependencies (React 19, React Router, Vite)
│       └── vite.config.js        # Vite build configuration
│
├── docs/                         # Architecture documentation and implementation plans
│   ├── backend/                  # Detailed system architecture and ER diagrams
│   └── branch-sync-automation.md # Branch synchronization guidelines
│
├── LICENSE                       # MIT License
└── README.md                     # Project documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (`^19.2.8`)
- **Build Tool:** Vite 8 (`^8.2.2`)
- **Routing:** React Router (`^7.18.4`) with Client-Side Stateful Hash Navigation
- **Spreadsheet & Reporting:** SheetJS / XLSX (`^0.18.5`)
- **Styling:** Modular CSS3 with CSS Custom Properties, Responsive Flexbox & Grid Systems
- **Typography:** Google Fonts (*Plus Jakarta Sans*, *Outfit*)
- **Code Quality:** ESLint (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

### Backend
- **Runtime:** Node.js (v18.x or higher)
- **Web Framework:** Express 5 (`^5.2.1`)
- **Database ODM:** Mongoose 9 (`^9.11.4`) with MongoDB Atlas Replica Sets
- **Security & Validation:** JSON Web Tokens (`jsonwebtoken`), Scrypt password hashing, Helmet (`^8.3.0`), Express Rate Limit (`^8.7.3`), Zod (`^3.25.76`)
- **File & Media Handling:** Multer (`^2.5.0`), Cloudinary (`^2.11.0`), PDF-Parse (`^2.4.5`)
- **Numerical Precision:** Decimal.js (`^10.6.0`) for exact GPA calculations

### AI & Knowledge Engine
- **LLM Integration:** Google Gemini API (Dual fast/smart model tiers)
- **Information Retrieval:** BM25 keyword matching + Gemini dense vector embeddings
- **Tool Capabilities:** Dynamic function calling with role-based permission scopes

---

## 💻 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance
- [Git](https://git-scm.com/) installed
- Modern web browser (Chrome, Edge, Firefox, Safari)

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SEUconnect
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create an environment configuration file:
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables inside `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/seuconnect?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_optional_gemini_api_key
   SEED_DEMO_DATA=true
   ```
4. Seed demo data (optional for initial database setup):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API runs at: `http://localhost:5000`

---

### 3. Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd Frontend/SEUconnect
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web platform in your browser at:
   ```
   http://localhost:5173
   ```

---

## 🧪 Available Scripts & Automated Tests

### Backend Scripts
- `npm start` – Run backend server with Node.js
- `npm run dev` – Run backend server in watch mode (`node --watch`)
- `npm test` – Execute full test suite including unit, integration, and workflow tests
- `npm run test:unit` – Run unit tests without requiring a database connection
- `npm run test:workflows` – Validate multi-tier form approval lifecycles
- `npm run migrate` – Execute database migration runners
- `npm run backup` – Export database collections to local backup directory
- `npm run kb:reindex` – Rebuild embeddings and RAG knowledge chunks for AI assistant

### Frontend Scripts
- `npm run dev` – Launch Vite development server with Hot Module Replacement (HMR)
- `npm run build` – Compile optimized production bundle into `dist/`
- `npm run preview` – Locally preview production build
- `npm run lint` – Run ESLint checks across codebase

---

## 🎓 Project Academic Context

This software application is developed as part of the **Internet Application Development (IAD) Continuous Assessment** curriculum at the **South Eastern University of Sri Lanka (SEUSL)**.

- **Institution:** South Eastern University of Sri Lanka (SEUSL)
- **Faculty:** Faculty of Technology
- **Department:** Department of Information and Communication Technology
- **Degree Programmes:** 
  - Bachelor of Information and Communication Technology (Honours) [BICT]
  - Bachelor of Biosystems Technology (Honours) [BBST]
- **Academic Focus:** Full-Stack Enterprise Web Engineering, Distributed Role-Based Portals, and Paperless Workflow Automation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

---

<p align="center">
  <b>South Eastern University of Sri Lanka (SEUSL)</b><br>
  <i>Faculty of Technology • Department of Information and Communication Technology</i><br>
  <sub>Academic Year 2026/2027</sub>
</p>
