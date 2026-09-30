# SEUconnect 🎓

> **Unified University Academic & Administrative Digital Platform**  
> _Developed for the South Eastern University of Sri Lanka (SEUSL) • Faculty of Technology_  
> _Internet Application Development (IAD) Continuous Assessment Project_

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![Project Status](https://img.shields.io/badge/Status-Active_Development-orange.svg)]()

---

## 📌 Table of Contents

- [About SEUconnect](#-about-seuconnect)
- [Project Vision & Objectives](#-project-vision--objectives)
- [What Has Been Done Up To Now](#-what-has-been-done-up-to-now)
- [Role-Based Access & Demo Accounts](#-role-based-access--demo-accounts)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started / Installation](#-getting-started--installation)
- [Project Roadmap](#-project-roadmap)
- [Project Team](#-project-team)
- [License](#-license)

---

## 📖 About SEUconnect

**SEUconnect** is a unified university web platform created to bridge communication, academic management, and administrative procedures across the **Faculty of Technology at the South Eastern University of Sri Lanka (SEUSL)**.

In standard university environments, students, lecturers, heads of departments, deans, and administrative officers often interact across disjointed channels. **SEUconnect** consolidates all essential academic operations—ranging from student enrollment and course registration to examination processing and administrative auditing—into a single digital ecosystem.

---

## 🎯 Project Vision & Objectives

- **Unified Access Point:** Single digital gateway for all academic stakeholders.
- **Role-Based Segmentation:** Dedicated portals custom-tailored to the responsibilities of each university authority.
- **Workflow Efficiency:** Reduce manual paperwork and speed up approvals between Students, Lecturers, HODs, Deans, and Examination Officers.
- **Modern User Experience:** Fast, responsive, accessible interface adhering strictly to SEUSL's visual identity and standards.

---

## 🚀 What Has Been Done Up To Now

The repository has been structured and developed with a solid modular foundation:

### 1. 🏗️ Repository Scaffolding & Multi-Tier Architecture

- Organized monorepo structure separating **`Frontend`** and **`Backend`**.
- Setup Git version control workflow with `development` and feature branching.
- Established an open-source MIT License and project metadata.

### 2. 🔐 Authentication & Single Sign-On (SSO) System

- **SEUSL-Themed Login Interface:**
  - High-fidelity, zero-scroll centered card interface styled with official SEUSL branding colors (Deep Blue `#0f2b5c`, Gold `#f59e0b`, and Cyan accents).
  - Background imagery featuring the SEUSL campus (`seu_campus_bg.jpg`) and official university crest (`seusl_logo.png`).
- **Interactive Form Validation & Feedback:**
  - Email format and non-empty field checks with visual input highlight states.
  - Smooth interactive error shake animation (`seu-shake-active`) on failed attempts.
  - Alert banners for error handling and success toasts with animated icons.
  - Password visibility toggle (Show/Hide password) and "Remember me" option.
  - Realistic loading state simulation on submit.

### 3. 🏛️ Role-Based Portals & Client-Side Hash Routing

- Modular page components and dedicated styling sheets created for **7 university roles**:
  - 🎓 **Student Portal** (`Frontend/SEUconnect/pages/student/`): View student identity, faculty details, and academic home.
  - 👨‍🏫 **Lecturer Portal** (`Frontend/SEUconnect/pages/Lecturer/`): Academic staff dashboard foundation.
  - 🏛️ **HOD Portal** (`Frontend/SEUconnect/pages/hod/`): Department head overview and departmental controls.
  - 📜 **Dean Portal** (`Frontend/SEUconnect/pages/dean/`): Faculty-wide executive oversight.
  - ⚙️ **Admin Portal** (`Frontend/SEUconnect/pages/admin/`): System and faculty services administration.
  - 📝 **Examination Officer Portal** (`Frontend/SEUconnect/pages/examination/`): Examination and marks processing module.
  - 👑 **Super Admin Portal** (`Frontend/SEUconnect/pages/superadmin/`): Global security and role delegation controls.
- **Dynamic Hash-Routing Engine (`App.jsx`):**
  - Instant client-side switching between portals using URL hashes (`#student`, `#lecturer`, `#hod`, etc.).
  - Session state tracking with authenticated user info display and one-click Logout functionality.

### 4. 🎨 Design System & Visual Identity

- Integrated Google Fonts: **Plus Jakarta Sans** and **Outfit** for clean typography.
- CSS token system supporting smooth transitions, glassmorphic card overlays, responsive layouts, and cross-browser consistency.

### 5. ⚡ Backend Initialization

- Node.js environment configured with **Express 5.x** (`Backend/package.json`).
- Ready for RESTful route definition, controller creation, and database connectivity.

---

## 🔑 Role-Based Access & Demo Accounts

For demonstration and testing purposes, pre-configured accounts are active in the authentication module:

| Portal Role                  | Demo Email              | Password | Role Key / Hash Route |
| :--------------------------- | :---------------------- | :------- | :-------------------- |
| **Student**                  | `Student@gmail.com`     | `123456` | `#student`            |
| **Lecturer**                 | `Lecturer@gmail.com`    | `123456` | `#lecturer`           |
| **Head of Department (HOD)** | `HOD@gmail.com`         | `123456` | `#hod`                |
| **Dean**                     | `Dean@gmail.com`        | `123456` | `#dean`               |
| **System Admin**             | `Admin@gmail.com`       | `123456` | `#admin`              |
| **Examination Officer**      | `Examination@gmail.com` | `123456` | `#examination`        |
| **Super Admin**              | `SuperAdmin@gmail.com`  | `123456` | `#superadmin`         |

_(Note: Emails are matched case-insensitively for testing convenience)._

---

## 📁 System Architecture & Folder Structure

```text
SEUconnect/
├── Backend/
│   ├── node_modules/             # Node.js server dependencies
│   ├── package.json              # Express 5 backend configuration
│   └── package-lock.json
│
├── Frontend/
│   └── SEUconnect/               # React + Vite application
│       ├── public/
│       │   ├── favicon.svg        # Platform favicon
│       │   ├── icons.svg          # SVG sprite icons
│       │   ├── seusl_logo.png     # Official SEUSL university crest
│       │   └── seu_campus_bg.jpg  # SEUSL campus background visual
│       ├── pages/
│       │   ├── login/             # Login component & styling
│       │   ├── student/           # Student portal module
│       │   ├── Lecturer/          # Lecturer portal module
│       │   ├── hod/               # Head of Department portal module
│       │   ├── dean/              # Dean portal module
│       │   ├── admin/             # System Admin portal module
│       │   ├── examination/       # Examination officer portal module
│       │   └── superadmin/        # Super Administrator portal module
│       ├── src/
│       │   ├── App.jsx            # Main app router & state coordinator
│       │   ├── App.css            # Layout styling
│       │   ├── index.css          # Global design tokens & CSS reset
│       │   └── main.jsx           # React DOM root entry point
│       ├── index.html             # Main HTML template
│       ├── package.json           # Frontend dependencies (React 19, Vite)
│       └── vite.config.js         # Vite build configuration
│
├── LICENSE                       # MIT License
└── README.md                     # Project documentation
```

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 19 (`^19.2.8`)
- **Build Tool:** Vite 8 (`^8.2.2`)
- **Styling:** Vanilla CSS3 with CSS Variables, Flexbox/Grid, and Keyframe Animations
- **Typography:** Google Fonts (_Plus Jakarta Sans_, _Outfit_)
- **Code Quality:** ESLint (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

### Backend

- **Runtime:** Node.js
- **Server Framework:** Express 5 (`^5.2.1`)
- **Architecture:** RESTful API ready

### Version Control & Collaboration

- **VCS:** Git & GitHub
- **Workflow:** Feature branch & pull request methodology

---

## 💻 Getting Started / Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18.x or higher recommended)
- [Git](https://git-scm.com/)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone the Repository

```bash
git clone https://github.com/BinMushan/SEUconnect.git
cd SEUconnect
```

### 2. Frontend Setup & Run

```bash
# Navigate to the frontend directory
cd Frontend/SEUconnect

# Install dependencies
npm install

# Start the local Vite development server
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

### 3. Backend Setup

```bash
# Open a new terminal in the root directory and navigate to Backend
cd Backend

# Install backend dependencies
npm install

# Start backend server (upon entrypoint configuration)
node index.js
```

---

## 🗺️ Project Roadmap

- [x] Initial repository scaffolding and multi-tier structure setup
- [x] High-fidelity, responsive login UI with SEUSL branding
- [x] Authentication state handling with client-side role validation
- [x] Dedicated page layouts and hash-routing for all 7 user roles
- [ ] Connect Express backend with database (MongoDB / MySQL)
- [ ] Implement JWT-based secure authentication & session cookies
- [ ] **Student Features:** Course registration, attendance tracking, GPA calculator, lecture timetable
- [ ] **Lecturer Features:** Course material uploads, attendance submission, continuous assessment grade recording
- [ ] **HOD & Dean Features:** Module allocation, leave approvals, departmental statistics & reports
- [ ] **Examination Features:** Final marks submission review, grade moderation, exam timetable publishing
- [ ] **Admin & SuperAdmin:** User creation, role assignment, system logging & audit trails

---

## 👥 Project Team

This project is being developed as part of the **Internet Application Development (IAD) Continuous Assessment** for the **Faculty of Technology, South Eastern University of Sri Lanka (SEUSL)**.

|   #    | Student Name         | Registration / Index No. | Role / Contribution                               | GitHub Profile                                            |
| :----: | :------------------- | :----------------------- | :------------------------------------------------ | :-------------------------------------------------------- |
| **01** | **Bin Mushan**       | _SEU/IS/22/ICT/091_      | Full-stack Architecture, Frontend Routing & Setup | [@BinMushan](https://github.com/BinMushan)                |
| **02** | **Mohommadhu Afnan** | _[Enter Reg No]_         | Authentication UI & Role Portal Scaffolding       | [@mohommadhuafnan](https://github.com/mohommadhuafnan756) |
| **03** | _Kamsa Jeyasankar_   | _SEU/IS/22/ICT/072_      | _[Contribution / Module Area]_                    | [@jeyashankarkamsa](https://github.com/JeyashankarKamsa)  |
| **04** | _Jelaxsi Kularasan_ | _SEU/IS/22/ICT/068_         | _[Contribution / Module Area]_                    | [@Jelaxsi](https://github.com/Jelaxsi)                          |
| **05** | _Shahnaz Razick_ | _SEU/IS/22/ICT/083_         | _[Contribution / Module Area]_                    | [@shahnas-razick]                          |

> _Tip: Team members can replace the bracketed placeholders `[Enter Reg No]` and `[Team Member Name]` with their respective details._

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.

---

<p align="center">
  <b>South Eastern University of Sri Lanka (SEUSL)</b><br>
  <i>Faculty of Technology • Department of Information and Communication Technology</i><br>
  <sub>Academic Year 2026/2027</sub>
</p>
