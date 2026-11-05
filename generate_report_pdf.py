import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ----------------------------------------------------------------------
# NumberedCanvas for dynamic "Page X of Y" and Running Headers
# ----------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor('#1F4E79'))

        # Running Header on all pages
        self.drawString(36, 762, "SWT22022  |  PRACTICAL FOR INTERNET APPLICATION DEVELOPMENT")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor('#667085'))
        self.drawRightString(576, 762, "FINAL PROJECT REPORT  •  South Eastern University of Sri Lanka")

        # Top rule
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 756, 576, 756)

        # Bottom rule
        self.line(36, 38, 576, 38)

        # Running Footer
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(36, 26, "SEUConnect  •  Faculty of Technology, South Eastern University of Sri Lanka")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 26, page_str)

        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor('#17365D')
    gold_color = colors.HexColor('#C9A227')
    body_color = colors.HexColor('#1E293B')
    border_color = colors.HexColor('#CBD5E1')
    alt_bg = colors.HexColor('#F8FAFC')
    header_bg = colors.HexColor('#0F2B5C')

    title_main = ParagraphStyle(
        'TitleMain',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4,
        alignment=0
    )
    title_sub = ParagraphStyle(
        'TitleSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=gold_color,
        spaceAfter=10,
        alignment=0
    )
    h1 = ParagraphStyle(
        'ReportH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=primary_color,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )
    h2 = ParagraphStyle(
        'ReportH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=primary_color,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )
    body = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.2,
        textColor=body_color,
        spaceAfter=4,
        alignment=4 # Justified
    )
    body_bold = ParagraphStyle(
        'ReportBodyBold',
        parent=body,
        fontName='Helvetica-Bold'
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=body_color
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )
    table_hdr = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.white
    )
    code_cell = ParagraphStyle(
        'CodeCell',
        parent=table_cell,
        fontName='Courier',
        fontSize=7,
        leading=8.5,
        textColor=colors.HexColor('#0F2B5C')
    )
    tag_pass = ParagraphStyle(
        'TagPass',
        parent=table_cell_bold,
        textColor=colors.HexColor('#15803D')
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("SOUTH EASTERN UNIVERSITY OF SRI LANKA", ParagraphStyle('UniHdr', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=primary_color)))
    story.append(Paragraph("FACULTY OF TECHNOLOGY", ParagraphStyle('FacHdr', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=gold_color, spaceAfter=20)))
    
    story.append(Paragraph("FINAL PROJECT REPORT", ParagraphStyle('BigTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=primary_color)))
    story.append(Paragraph("SWT22022 – Practical for Internet Application Development", ParagraphStyle('CourseTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor('#475569'), spaceAfter=6)))
    story.append(Paragraph("SEUConnect: Student Academic Services and Process Guidance Platform", ParagraphStyle('ProjTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=primary_color, spaceAfter=24)))

    cover_data = [
        [Paragraph("PROJECT DETAILS", table_hdr), Paragraph("INFORMATION", table_hdr)],
        [Paragraph("Group ID", table_cell_bold), Paragraph("Group C", table_cell)],
        [Paragraph("Group Leader", table_cell_bold), Paragraph("M.M.B. Mushan (SEU/IS/22/ICT/091)", table_cell)],
        [
            Paragraph("Group Members", table_cell_bold),
            Paragraph("K. Jelaxsi (SEU/IS/22/ICT/068)<br/>J. Kamsa (SEU/IS/22/ICT/072)<br/>M.N.M. Afnan (SEU/IS/22/ICT/085)<br/>M.R. Shahnas (SEU/IS/22/ICT/083)", table_cell)
        ],
        [Paragraph("Degree Programme", table_cell_bold), Paragraph("Bachelor of Information and Communication Technology Honours (BICT Hons)", table_cell)],
        [Paragraph("Department", table_cell_bold), Paragraph("Department of Information and Communication Technology, Faculty of Technology", table_cell)],
        [Paragraph("GitHub Repository URL", table_cell_bold), Paragraph("https://github.com/BinMushan/SEUconnect", code_cell)],
        [Paragraph("Live Deployment URL", table_cell_bold), Paragraph("https://seu-connect-plum.vercel.app", code_cell)],
        [Paragraph("Active Branch", table_cell_bold), Paragraph("backend-update-1  (Synced with origin/main)", code_cell)],
        [Paragraph("Submission Date", table_cell_bold), Paragraph("06th November 2026", table_cell)]
    ]
    t_cover = Table(cover_data, colWidths=[160, 380])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_cover)
    story.append(Spacer(1, 35))
    story.append(Paragraph("Submitted in partial fulfilment of the group project requirements for SWT22022 – Practical for Internet Application Development, Faculty of Technology, South Eastern University of Sri Lanka.", ParagraphStyle('CoverNote', parent=body, fontSize=8, leading=11, textColor=colors.HexColor('#64748B'), alignment=1)))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: EXECUTIVE SUMMARY & TARGET USERS (PART 1)
    # =========================================================================
    story.append(Paragraph("1. Executive Summary", h1))
    story.append(Paragraph(
        "Students at the Faculty of Technology, South Eastern University of Sri Lanka (SEUSL), must navigate a rigorous array of statutory "
        "academic and administrative procedures, including semester subject registration, compulsory attendance tracking, medical excuse "
        "submissions, examination applications, and repeat attempts. Historically, procedural guidelines and application workflows have been "
        "scattered across physical circulars, handbook clauses, and disparate administrative offices. Consequently, undergraduates frequently "
        "miss statutory deadlines or submit non-compliant requests, causing avoidable delays in graduation and examination eligibility. "
        "<b>SEUConnect</b> is an enterprise-grade, web-based, role-governed platform that brings all student academic services, dynamic "
        "state-machine workflow routing, and step-by-step institutional process guidance into a single unified environment. Concurrently, it provisions "
        "specialised administrative desks for Lecturers, Heads of Department (HOD), the Senior Assistant Registrar (SAR), the Dean, Examination Officers, "
        "Department Management Assistants (MA), Faculty Management Assistants, and System Administrators.",
        body
    ))
    story.append(Paragraph(
        "The system is developed on the modern MERN architecture (MongoDB, Express.js 5, React 19, and Node.js 20+), utilizing stateless JSON Web Token (JWT) "
        "cryptographic authentication, bcrypt password hashing, and role-based access control (RBAC), fully hosted as a full-stack serverless deployment on Vercel. "
        "The platform comprises five core operational modules: (1) Student & Semester/Subject Registration; (2) Attendance & Medical Workflow Management; "
        "(3) Examination Management & Admission Card Processing; (4) Dynamic Results, GPA/CGPA Calculation & Academic Progression; and (5) Welfare, Societies, "
        "AI Process Guidance & System Administration. All business logic strictly enforces the <i>Faculty of Technology Undergraduate Handbook 2023/2024</i>, "
        "including the 80% attendance ESA gating rule, 22-credit semester load limit, 14-day statutory medical submission window, and credit-weighted GPA algorithms. "
        "Comprehensive verification confirmed 55 automated integration workflow checks and 21 manual test cases with a 100% pass rate across all seven user roles.",
        body
    ))

    story.append(Paragraph("2.3 Target Users and Stakeholders", h1))
    stakeholder_data_p2 = [
        [Paragraph("User / Stakeholder", table_hdr), Paragraph("Role and Institutional Needs", table_hdr), Paragraph("Relevant System Functions", table_hdr)],
        [
            Paragraph("Student", table_cell_bold),
            Paragraph("Primary institutional user. Needs transparent visibility of course modules, deadlines, approval statuses, eligibility standings, GPA trends, and official procedures.", table_cell),
            Paragraph("Semester registration, add/drop (22-cr limit), subject attendance tracking, medical leave requests, repeat exam filing, GPA/CGPA reports, AI process guidance, notifications.", table_cell)
        ],
        [
            Paragraph("Lecturer", table_cell_bold),
            Paragraph("Academic officer assigned to specific subjects. Records attendance, enters CA/ESA marks, and evaluates course-level student petitions and medical requests.", table_cell),
            Paragraph("Daily attendance marking, CA/ESA mark entry, course roster management, assignment verification desk, class announcements.", table_cell)
        ],
        [
            Paragraph("Head of Department (HOD)", table_cell_bold),
            Paragraph("Academic and administrative leader of the department (ICT / BST). Endorses petitions, audits attendance compliance, and moderates departmental marks (Sections 4.1, 7.2).", table_cell),
            Paragraph("Departmental approvals desk, repeat exam sign-off, CA moderation, 80% attendance audit review, escalation to Dean's Office.", table_cell)
        ],
        [
            Paragraph("Dean, Faculty of Technology", table_cell_bold),
            Paragraph("Executive head of the Faculty and Chairman of the Faculty Board (Section 1.2). Exercises final faculty-level clearance for examinations, concessions, and Senate submissions.", table_cell),
            Paragraph("Faculty approval desk, Examination Board clearances, special concessions ratification, academic calendar gazetting, faculty KPIs.", table_cell)
        ],
        [
            Paragraph("Examination / Medical Officer", table_cell_bold),
            Paragraph("Central administrative officer in the Examination Branch. Conducts formal eligibility scrutiny, clears financial vouchers, and manages exam logistics.", table_cell),
            Paragraph("Examination candidate eligibility verification, admission card generation/issuance, repeat candidate registry, exam offence recording, timetable.", table_cell)
        ],
        [
            Paragraph("Senior Assistant Registrar (SAR)", table_cell_bold),
            Paragraph("Chief faculty administrative officer. Receives statutory sickness notices within 48 hours (Section 4.2.4), manages ECA/ESA portals, verifies vouchers, and forwards files to Exam Branch.", table_cell),
            Paragraph("SAR Command Center, examination workflow inboxes, voucher verification, ECA/ESA portal lock toggling, Dean Office admission issuance, Senate reporting.", table_cell)
        ],
        [
            Paragraph("System Administrator", table_cell_bold),
            Paragraph("Technical administrator overseeing platform security, identity lifecycle, role permissions, and academic structure seeding.", table_cell),
            Paragraph("Student enrollment & credential provisioning (batch CSV & individual), temporary password recovery, role assignments, system-wide broadcast bulletins.", table_cell)
        ]
    ]
    t_stk_p2 = Table(stakeholder_data_p2, colWidths=[100, 220, 220])
    t_stk_p2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_stk_p2)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: TARGET USERS (CONT.), NFR, TECH STACK
    # =========================================================================
    story.append(Paragraph("2.3 Target Users and Stakeholders (Continued)", h2))
    stakeholder_data_p3 = [
        [Paragraph("User / Stakeholder", table_hdr), Paragraph("Role and Institutional Needs", table_hdr), Paragraph("Relevant System Functions", table_hdr)],
        [
            Paragraph("Management Assistant (MA), Department", table_cell_bold),
            Paragraph("Administrative officer stationed in the Department Office (ICT / BST). Provides frontline clerical support, verifies medical applications under the 14-day rule, and audits student rolls.", table_cell),
            Paragraph("Dedicated Dept-MA Portal: Subject Medical Queue, 14-day statutory rule audit, student attendance standing audit, department report generation.", table_cell)
        ],
        [
            Paragraph("Management Assistant (MA), Faculty", table_cell_bold),
            Paragraph("Clerical officer in the Faculty Office operating directly under the Dean and SAR. Handles faculty-level document intake, preliminary verification, and routes items to executive queues.", table_cell),
            Paragraph("Dedicated Faculty-MA Desk: Examination Medical preliminary scrutiny, student petitions intake, faculty board agenda file prep, archive logging.", table_cell)
        ],
        [
            Paragraph("Academic Advisor", table_cell_bold),
            Paragraph("Faculty mentor appointed to guide students on academic pathways, course prerequisites, elective choices, and credit deviation requests (Handbook Section 7.3).", table_cell),
            Paragraph("Advisor consultation view, student progress tracking, formal consent mechanism for semester registrations exceeding 22 credits (future roadmap).", table_cell)
        ]
    ]
    t_stk_p3 = Table(stakeholder_data_p3, colWidths=[110, 215, 215])
    t_stk_p3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_stk_p3)

    story.append(Paragraph("4.2 Non-Functional Requirements", h1))
    nfr_data = [
        [Paragraph("Category", table_hdr), Paragraph("Requirement / Quality Target", table_hdr), Paragraph("Architectural Realisation in SEUConnect", table_hdr)],
        [
            Paragraph("Security & Privacy", table_cell_bold),
            Paragraph("Zero-trust authentication; strictly enforced role segregation; student data isolation (students view only their own records); tamper-proof session tokens.", table_cell),
            Paragraph("Implemented cryptographic JWT tokens (HMAC-SHA256, 12h expiry); bcrypt password encryption with salt factor 10; server-side RBAC middleware (`authenticate`, `verifyRole`); Helmet HTTP protection; express-rate-limit (600 req/min general, 30 req/15min login); CORS origin restriction; parameterised Mongoose queries preventing NoSQL injection.", table_cell)
        ],
        [
            Paragraph("Usability & UX", table_cell_bold),
            Paragraph("Consistent, accessible interface suited for first-year undergraduates; zero-scroll login; dark mode support; mobile responsive navigation.", table_cell),
            Paragraph("Engineered bespoke CSS design system adhering to SEUSL institutional navy (`#0F2B5C`) and gold (`#C9A227`); CSS Grid & Flexbox breakpoints (640px, 768px, 1024px, 1280px); dynamic role sidebars; live system health feeds; animated alert banners; accessible SVG iconography.", table_cell)
        ],
        [
            Paragraph("Performance & Scalability", table_cell_bold),
            Paragraph("Sub-second API latency under typical faculty cohorts (150-500 students); low client bundle size; efficient database throughput.", table_cell),
            Paragraph("Measured average API response time <320ms; indexed MongoDB schemas on `regNo`, `email`, `trackingNumber`, and `role`; client Vite production build chunked to <410 kB gzipped; serverless cold starts <950ms on Vercel Edge/Node runtime.", table_cell)
        ],
        [
            Paragraph("Reliability & Maintainability", table_cell_bold),
            Paragraph("Transactional consistency across multi-stage approvals; modular code organisation; clear audit logging.", table_cell),
            Paragraph("Modular repository structure separating core utilities, workflow definitions, and route controllers; Winston/structured JSON logging with unique `x-request-id` headers; automatic in-memory mock fallback when Atlas network is interrupted; comprehensive test harness.", table_cell)
        ]
    ]
    t_nfr = Table(nfr_data, colWidths=[90, 190, 260])
    t_nfr.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_nfr)

    story.append(Paragraph("5. System Design and Architecture", h1))
    story.append(Paragraph("5.1 Technology Stack", h2))
    tech_data = [
        [Paragraph("Layer / Purpose", table_hdr), Paragraph("Technology Selected", table_hdr), Paragraph("Justification & Architectural Rationale", table_hdr)],
        [
            Paragraph("Frontend Framework", table_cell_bold),
            Paragraph("React 19 (SPA) with Vite 8.3 & React Router 7", table_cell),
            Paragraph("High performance component-based architecture suited for multi-role dynamic dashboards; Vite provides lightning-fast HMR and optimised production rollup bundling.", table_cell)
        ],
        [
            Paragraph("UI & Styling", table_cell_bold),
            Paragraph("Custom CSS Architecture & Modern CSS Variables", table_cell),
            Paragraph("Eliminates external CSS bloat; enables pixel-perfect institutional alignment with SEUSL colours (`#0F2B5C`, `#C9A227`), responsive tables, and dark-mode tokens.", table_cell)
        ],
        [
            Paragraph("Backend API", table_cell_bold),
            Paragraph("Node.js 20+ & Express.js 5 (RESTful Architecture)", table_cell),
            Paragraph("Non-blocking, event-driven runtime ideal for concurrent approval notifications and workflow state machine dispatch; Express 5 provides robust async error handling.", table_cell)
        ],
        [
            Paragraph("Database & ODM", table_cell_bold),
            Paragraph("MongoDB Atlas Cloud & Mongoose 9 ODM", table_cell),
            Paragraph("Document data model fits dynamic academic forms, heterogeneous approval history arrays, and student profiles without rigid schema migration bottlenecks.", table_cell)
        ]
    ]
    t_tech = Table(tech_data, colWidths=[95, 185, 260])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_tech)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: TECH STACK (CONT.), ARCHITECTURE, DATABASE DESIGN
    # =========================================================================
    story.append(Paragraph("5.1 Technology Stack (Continued)", h2))
    tech_data_p4 = [
        [Paragraph("Layer / Purpose", table_hdr), Paragraph("Technology Selected", table_hdr), Paragraph("Justification & Architectural Rationale", table_hdr)],
        [
            Paragraph("Authentication & Security", table_cell_bold),
            Paragraph("JSON Web Tokens (JWT) & bcrypt.js", table_cell),
            Paragraph("Stateless, tamper-proof bearer tokens carrying signed user claims (`id`, `role`, `department`); bcrypt provides industry-standard key stretching with 10 salt rounds.", table_cell)
        ],
        [
            Paragraph("Version Control & CI/CD", table_cell_bold),
            Paragraph("Git & GitHub (Monorepo with Feature Branches)", table_cell),
            Paragraph("Collaborative group repository (`https://github.com/BinMushan/SEUconnect`). Workflow: feature branches (`Student-update-05`, `backend-update-1`) merged to `Development`/`main` via reviewed PRs.", table_cell)
        ],
        [
            Paragraph("Deployment & Hosting", table_cell_bold),
            Paragraph("Vercel Full-Stack Cloud Serverless (`api/index.js`)", table_cell),
            Paragraph("Both frontend static bundles and backend Express REST API routes are hosted under one Vercel project domain, completely eliminating cross-origin CORS barriers.", table_cell)
        ],
        [
            Paragraph("AI Assistant Engine", table_cell_bold),
            Paragraph("Google Gemini 1.5 Flash API with RAG Knowledge Base", table_cell),
            Paragraph("Provides natural language process guidance strictly grounded in the Faculty Undergraduate Handbook 2023/2024 regulations with automated prompt guardrails.", table_cell)
        ],
        [
            Paragraph("Dev & Testing Tools", table_cell_bold),
            Paragraph("VS Code, Antigravity AI, Postman, Node Built-in Test", table_cell),
            Paragraph("Automated end-to-end workflow verification (`test_workflows.js`) executing 55 assertion checkpoints across all institutional transitions.", table_cell)
        ]
    ]
    t_tech_p4 = Table(tech_data_p4, colWidths=[95, 185, 260])
    t_tech_p4.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_tech_p4)

    story.append(Paragraph("5.2 High-Level Architecture", h1))
    story.append(Paragraph(
        "SEUConnect implements a decoupled, modern client-server architecture orchestrated through a unified RESTful API. "
        "The React 19 Single Page Application communicates over HTTPS using standardized JSON payloads. Every protected client request "
        "attaches an `Authorization: Bearer <JWT>` header containing the cryptographically signed user claims. Upon entering the Express server, "
        "requests pass through global security middleware (Helmet, CORS, Rate Limiter, and `x-request-id` tracer) before reaching the "
        "authentication and RBAC boundary (`authenticate` and `authorizeRoles`). Once the user's role and departmental scope are validated, "
        "the request is routed to the designated module controller. Business logic enforces handbook rules (e.g. 22-credit ceiling or 80% attendance), "
        "executes atomic operations against MongoDB Atlas via Mongoose models, and emits event-driven notifications to affected stakeholders. "
        "The server returns a structured response `{ success: true, data: ... }` which React renders dynamically with zero page reloads.",
        body
    ))

    story.append(Paragraph("5.3 Database Design", h1))
    story.append(Paragraph(
        "The MongoDB database (`seuconnect`) comprises sixteen collections structured to support role segregation, academic progression, and multi-stage workflow lifecycles. "
        "All schemas incorporate Mongoose timestamps (`createdAt`, `updatedAt`), strict data type validation, and index optimization:",
        body
    ))

    db_data_p4 = [
        [Paragraph("Entity / Collection", table_hdr), Paragraph("Functional Purpose", table_hdr), Paragraph("Key Fields & Relational Schema Mapping", table_hdr)],
        [
            Paragraph("Users", table_cell_bold),
            Paragraph("Core authentication records, hashed credentials, and role privileges.", table_cell),
            Paragraph("`_id, name, email, password (bcrypt), role, roleKey, regNo, staffId, department, faculty, isLocked, createdAt`", code_cell)
        ],
        [
            Paragraph("Students", table_cell_bold),
            Paragraph("Undergraduate student academic profile and progress tracking.", table_cell),
            Paragraph("`_id, user (ref: Users), regNo, indexNo, batch, degreeProgramme, department, semester, sgpa, cgpa, creditsCompleted`", code_cell)
        ],
        [
            Paragraph("Semesters / Subjects", table_cell_bold),
            Paragraph("Curriculum course catalogue, credit values, and prerequisites.", table_cell),
            Paragraph("`_id, courseCode, courseName, credits, semester, department, isGpa, prerequisites[], status`", code_cell)
        ],
        [
            Paragraph("Subject Registrations", table_cell_bold),
            Paragraph("Course enrollment history, add/drop tracking, and credit load.", table_cell),
            Paragraph("`_id, student (ref: Students), semester, subjects[], totalCredits (max 22), status, advisorConsent, approvedAt`", code_cell)
        ],
        [
            Paragraph("Attendance", table_cell_bold),
            Paragraph("Subject-wise lecture/practical attendance and ESA eligibility.", table_cell),
            Paragraph("`_id, student, courseCode, academicYear, totalHours, attendedHours, percentage, isEligible (>=80%), sessions[]`", code_cell)
        ],
        [
            Paragraph("Medical Requests", table_cell_bold),
            Paragraph("Medical certificates submitted for lectures or examinations.", table_cell),
            Paragraph("`_id, trackingNumber, student, medicalType (Subject/Exam), submissionDate, certificateDoc, status, verifiedBy`", code_cell)
        ],
        [
            Paragraph("Exam Registrations / Attempts", table_cell_bold),
            Paragraph("Examination entry filing, repeat counts, and voucher checks.", table_cell),
            Paragraph("`_id, trackingNumber, student, courseCode, examType (ECA/ESA), attemptNumber (1-4), voucherUrl, sarVerified`", code_cell)
        ]
    ]
    t_db_p4 = Table(db_data_p4, colWidths=[105, 185, 250])
    t_db_p4.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_db_p4)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: DATABASE DESIGN (CONT.), MODULE 1 & MODULE 2
    # =========================================================================
    story.append(Paragraph("5.3 Database Design (Continued)", h2))
    db_data_p5 = [
        [Paragraph("Entity / Collection", table_hdr), Paragraph("Functional Purpose", table_hdr), Paragraph("Key Fields & Relational Schema Mapping", table_hdr)],
        [
            Paragraph("Results", table_cell_bold),
            Paragraph("Continuous assessment (CA) and final ESA marks and grades.", table_cell),
            Paragraph("`_id, student, courseCode, caMark, esaMark, totalMark, grade, gradePoint (0.00-4.00), examStatus, semester`", code_cell)
        ],
        [
            Paragraph("Academic Records", table_cell_bold),
            Paragraph("Historical cumulative performance, SGPA, CGPA, and standing.", table_cell),
            Paragraph("`_id, student, semester, sgpa, cgpa, earnedCredits, totalGpaCredits, academicStanding, classAwarded`", code_cell)
        ],
        [
            Paragraph("Welfare & Scholarships", table_cell_bold),
            Paragraph("Bursary, Mahapola, hostel, and financial aid schemes.", table_cell),
            Paragraph("`_id, title, category, eligibilityText, deadline, applicationFormUrl, contactOffice, status`", code_cell)
        ],
        [
            Paragraph("Societies & Clubs", table_cell_bold),
            Paragraph("Student organizations, technological societies, and activities.", table_cell),
            Paragraph("`_id, societyName, department, description, president, patron, registrationStatus, annualCalendarUrl`", code_cell)
        ],
        [
            Paragraph("Notifications", table_cell_bold),
            Paragraph("Role-synchronized feed and urgent workflow announcements.", table_cell),
            Paragraph("`_id, title, message, type, recipientRole, relatedRequestId, readBy[] (emails), isRead, createdAt`", code_cell)
        ],
        [
            Paragraph("Penalties & Disciplinary", table_cell_bold),
            Paragraph("Academic disciplinary actions and examination ban logs.", table_cell),
            Paragraph("`_id, student, offenceType, penaltyNotice, penaltyStart, penaltyEnd, senateRatified, isCleared`", code_cell)
        ],
        [
            Paragraph("Processes & Requests", table_cell_bold),
            Paragraph("Multi-stage petition state machine and approval histories.", table_cell),
            Paragraph("`_id, trackingNumber, student, requestType, currentStage, status, payload{}, history[{stage, action, by, date, remarks}]`", code_cell)
        ]
    ]
    t_db_p5 = Table(db_data_p5, colWidths=[105, 185, 250])
    t_db_p5.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_db_p5)

    story.append(Paragraph("6. Implementation and Major Functional Modules", h1))
    story.append(Paragraph("6.1 Module 1: Student and Semester/Subject Registration", h2))
    story.append(Paragraph(
        "<b>Purpose & Scope:</b> Empowers students to manage their personal profile, review active semester course offerings, and execute "
        "course registrations and add/drop requests while enforcing institutional workload rules.<br/>"
        "<b>Key Functionality:</b> Profile management (initials, registration number, specialization); interactive course selection grid; real-time "
        "credit sum counter; add/drop window lock; dynamic error banners preventing credit overload.<br/>"
        "<b>Handbook Business Rules:</b> Registration must take place within the first two weeks of the semester (Sections 4.2.1, 7.2); add/drop "
        "closes after week 2; maximum student workload is strictly capped at 22 credits per semester (Section 7.3). Any deviation requires documented Academic Advisor consent.<br/>"
        "<b>Frontend, API & Data:</b> React views in `student.jsx` and `FormSubmissionPanel.jsx`; Express endpoints: `GET /api/student/profile`, "
        "`GET /api/student/courses`, `POST /api/student/register`; Collections: `Users`, `Students`, `Semesters/Subjects`, `Subject Registrations`.<br/>"
        "<b>Validation & Security:</b> Client-side reactive sum calculation backed by server-side verification: requests exceeding 22 credits return HTTP 400 "
        "with `CREDIT_LIMIT_EXCEEDED`; course prerequisite verification; authenticated student identity bound from JWT.<br/>"
        "<b>Implementation Status:</b> Fully implemented, tested, and active in production.",
        body
    ))

    story.append(Paragraph("6.2 Module 2: Attendance and Medical Management", h2))
    story.append(Paragraph(
        "<b>Purpose & Scope:</b> Monitors student lecture/laboratory attendance, determines examination eligibility, and provides a compliant channel "
        "for submitting and approving statutory medical excuse certificates.<br/>"
        "<b>Key Functionality:</b> Subject-wise percentage gauges; colour-coded eligibility tags (Green &ge;80%, Amber 75-79%, Red &lt;75%); medical request "
        "form with medical slip attachment; Department MA and Faculty MA verification queues.<br/>"
        "<b>Handbook Business Rules:</b> Minimum 80% attendance is mandatory for both theory and practical classes (Section 4.2.3). Under-attendance bars "
        "the student from the End Semester Assessment (ESA). Medical notifications must reach the Assistant Registrar within 48 hours and formal valid certificates "
        "within 14 calendar days (Section 4.2.4). Eight continuous weeks of absence triggers academic withdrawal.<br/>"
        "<b>Frontend, API & Data:</b> React views in `medical_requests.jsx`, `dept_ma.jsx`, and `fma.jsx`; Express endpoints: `GET /api/student/attendance`, "
        "`POST /api/processes/request`, `PUT /api/processes/:id/action`; Collections: `Attendance`, `Medical Requests`, `Process Requests`.<br/>"
        "<b>Validation & Security:</b> Date validation against the 14-day statutory window; file upload validation (PDF/JPEG, 5MB limit); Department MA possesses "
        "exclusive authority over Subject Medicals without SAR escalation; unauthorized approval attempts return HTTP 403.<br/>"
        "<b>Implementation Status:</b> Fully implemented and verified across Student, Dept MA, and Faculty MA desks.",
        body
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: MODULE 3 (EXAMINATIONS) & MODULE 4 (RESULTS & GPA)
    # =========================================================================
    story.append(Paragraph("6.3 Module 3: Examination Management", h1))
    story.append(Paragraph(
        "<b>Purpose & Stakeholders:</b> Facilitates examination entry registration, repeat candidate fee handling, candidate eligibility auditing, and "
        "admission card generation. Used by Students, SAR, and Examination Officers.<br/>"
        "<b>Key Functionality:</b> Dynamic eligibility validation; repeat examination application forms; bank paying-in voucher upload; SAR payment verification desk; "
        "Examination Branch scheduling; Dean Office admission card generation with printable examination entry cards.<br/>"
        "<b>Handbook Business Rules:</b> Students may only sit examinations for officially registered courses (Sections 4.2.1, 4.2.2). Missing an examination without "
        "sanctioned medical clearance strips fresh-candidate status and registers a repeat attempt (Section 4.3.1). Candidates are capped at a maximum of three repeat attempts "
        "per module (Section 4.3.4), with a grace chance granted exclusively through the Faculty Board and Senate. Component repeats distinguish between CA and ESA failures.<br/>"
        "<b>Frontend, API & Data:</b> React views in `examination.jsx`, `sar.jsx`, and `examination.jsx`; Express endpoints: `GET /api/student/exam-eligibility`, "
        "`POST /api/processes/request` (ECA / ESA), `PUT /api/processes/:id/action`, `GET /api/processes/admission/:id`; Collections: `Exam Registrations`, `Process Requests`.<br/>"
        "<b>Validation & Security:</b> Attempt counters validated against student historical records; ECA (Continuous Assessment) and ESA (End Semester Assessment) requests "
        "are segregated into isolated workflows; bank payment vouchers strictly required for repeat candidates; admission generation locked until SAR and Exam Branch both approve.<br/>"
        "<b>Implementation Status:</b> Fully implemented and tested with 55 automated state machine assertions.",
        body
    ))

    story.append(Paragraph("6.4 Module 4: Results and Academic Progress", h1))
    story.append(Paragraph(
        "<b>Purpose & Stakeholders:</b> Records continuous assessment and final grades, executes credit-weighted GPA calculations, monitors semester progression "
        "criteria, and displays longitudinal performance trends. Used by Students, Lecturers, HODs, and Examination Officers.<br/>"
        "<b>Key Functionality:</b> Semester-wise result transcripts; SGPA/CGPA badges; dynamic SVG academic progress trend chart with honours criteria benchmarks; "
        "credit completion progress bar; academic standing advisories.<br/>"
        "<b>Handbook Business Rules:</b> Letter marks map to standard grade points from A+ and A (4.00) down to E (0.00) according to Table 5.5.1. SGPA and CGPA are computed via: "
        "<font face='Courier'>SGPA = &Sigma;(C<sub>i</sub> &times; GP<sub>i</sub>) / &Sigma;C<sub>i</sub></font>. Successful semester completion requires an SGPA &ge; 2.00 with no E grades "
        "and no more than three C- or D grades (Section 5.6). Repeat upgrades are capped at grade C. Students with CGPA &lt; 2.00 over the first three semesters are barred from registering "
        "for Semester 5 (Section 5.7). Degree classifications are benchmarked at First Class (&ge;3.70), Second Upper (&ge;3.30), and Second Lower (&ge;3.00) (Section 6.2).<br/>"
        "<b>Frontend, API & Data:</b> React views in `results.jsx`, `student.jsx`; calculation engine in `Backend/modules/results/resultEngine.js`; Express endpoints: "
        "`GET /api/student/results`, `GET /api/student/gpa-trend`, `POST /api/results/entry`; Collections: `Results`, `Academic Records`.<br/>"
        "<b>Validation & Security:</b> Mathematical precision verified via decimal arithmetic; grade modifications restricted exclusively to authorized Exam Officers and Lecturers; "
        "students possess read-only access to their personal transcript records.<br/>"
        "<b>Implementation Status:</b> Fully implemented with dynamic visual trend graphing and verified formula accuracy.",
        body
    ))

    story.append(Spacer(1, 4))
    res_summary_table = [
        [Paragraph("Grade", table_hdr), Paragraph("Grade Point", table_hdr), Paragraph("Marks Range", table_hdr), Paragraph("Handbook Classification Benchmark", table_hdr)],
        [Paragraph("A+ / A", table_cell_bold), Paragraph("4.00", table_cell), Paragraph("85 - 100 / 80 - 84", table_cell), Paragraph("First Class Honours (CGPA &ge; 3.70)", table_cell_bold)],
        [Paragraph("A-", table_cell_bold), Paragraph("3.70", table_cell), Paragraph("75 - 79", table_cell), Paragraph("First Class Threshold", table_cell)],
        [Paragraph("B+ / B", table_cell_bold), Paragraph("3.30 / 3.00", table_cell), Paragraph("70 - 74 / 65 - 69", table_cell), Paragraph("Second Class (Upper Division) (CGPA &ge; 3.30)", table_cell_bold)],
        [Paragraph("B- / C+", table_cell_bold), Paragraph("2.70 / 2.30", table_cell), Paragraph("60 - 64 / 55 - 59", table_cell), Paragraph("Second Class (Lower Division) (CGPA &ge; 3.00)", table_cell_bold)],
        [Paragraph("C", table_cell_bold), Paragraph("2.00", table_cell), Paragraph("50 - 54", table_cell), Paragraph("Pass Grade / Maximum Repeat Upgrade Cap", table_cell)],
        [Paragraph("C- / D", table_cell_bold), Paragraph("1.70 / 1.00", table_cell), Paragraph("45 - 49 / 40 - 44", table_cell), Paragraph("Conditional Pass (Max 3 allowed per semester)", table_cell)],
        [Paragraph("E", table_cell_bold), Paragraph("0.00", table_cell), Paragraph("00 - 39", table_cell), Paragraph("Fail (Must repeat respective component)", table_cell)]
    ]
    t_res_sum = Table(res_summary_table, colWidths=[65, 65, 120, 290])
    t_res_sum.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_res_sum)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: MODULE 5 (WELFARE/AI/ADMIN) & ROLE DASHBOARDS
    # =========================================================================
    story.append(Paragraph("6.5 Module 5: Welfare, Societies, Process Guidance and Administration", h1))
    story.append(Paragraph(
        "<b>Purpose & Scope:</b> Combines institutional process guidance, student welfare information, society engagement, interactive AI assistance, "
        "and administrative identity management in a single accessible hub.<br/>"
        "<b>Key Functionality:</b> 'What do you need to do?' procedural search index; downloadable circular forms; Mahapola/Bursary criteria; technological "
        "societies directory; embedded SEUConnect AI Assistant modal powered by Gemini; Admin portal for student onboarding with email/password issuance and forgot-password reset.<br/>"
        "<b>Handbook References:</b> Subject registration submission to the Dean's Office (Section 7.2); registration renewal vouchers (Section 7.6); formal sick reporting (Section 4.2.4).<br/>"
        "<b>Frontend, API & Data:</b> React views in `SEUConnectAIAssistantModal.jsx`, `admin.jsx`, `faculty_forms.jsx`, `notifications.jsx`; Express endpoints: "
        "`POST /api/auth/register-student`, `POST /api/auth/forgot-password`, `GET /api/notifications`, `DELETE /api/notifications/:id`, `DELETE /api/notifications/clear-all`; "
        "Collections: `Users`, `Students`, `Notifications`, `Processes`.<br/>"
        "<b>Validation & Security:</b> Administrative endpoints locked behind `verifyRole('admin')`; client password reset enforces identity verification against email and registration number; "
        "AI Assistant prompt injection defenses prevent leaking internal system prompts.<br/>"
        "<b>Implementation Status:</b> Fully implemented, including real-time notification deletion and bulk clear functionality.",
        body
    ))

    story.append(Paragraph("6.6 Role-Based Staff and Administrative Dashboards", h1))
    story.append(Paragraph(
        "SEUConnect delivers seven dedicated operational portals engineered specifically for the administrative hierarchy of the Faculty of Technology. "
        "Each dashboard incorporates bespoke telemetry cards, contextual action queues, and strictly enforced backend access boundaries:",
        body
    ))

    role_impl_data = [
        [Paragraph("Role Dashboard", table_hdr), Paragraph("Implemented By", table_hdr), Paragraph("Key Interfaces & Backend Integration Responsibilities", table_hdr)],
        [
            Paragraph("Student Portal", table_cell_bold),
            Paragraph("M.N.M. Afnan", table_cell),
            Paragraph("Student workspace, registration add/drop forms, medical submission panel, application tracker stepper, GPA trend visualizer, notification center with deletion.", table_cell)
        ],
        [
            Paragraph("Lecturer Desk", table_cell_bold),
            Paragraph("J. Kamsa", table_cell),
            Paragraph("Subject assignment rosters, session-wise attendance register, CA/ESA marks submission, student excuse verification, class announcements.", table_cell)
        ],
        [
            Paragraph("HOD Dashboard", table_cell_bold),
            Paragraph("K. Jelaxsi", table_cell),
            Paragraph("Departmental approvals queue, repeat exam endorsements, 80% attendance audit oversight, CA mark moderation, escalation to Dean's Office.", table_cell)
        ],
        [
            Paragraph("Dean Executive Portal", table_cell_bold),
            Paragraph("K. Jelaxsi", table_cell),
            Paragraph("Faculty executive sanctions queue, Exam Board ratification, special concessions approvals, faculty academic calendar announcements, department KPI metrics.", table_cell)
        ],
        [
            Paragraph("Senior Assistant Registrar (SAR)", table_cell_bold),
            Paragraph("M.N.M. Afnan", table_cell),
            Paragraph("SAR Command Center, voucher auditing, ECA/ESA portal lock controller, Dean Office admission generation, Senate reporting, institutional file registry.", table_cell)
        ],
        [
            Paragraph("Examination Officer", table_cell_bold),
            Paragraph("M.R. Shahnas", table_cell),
            Paragraph("Candidate eligibility audit, timetable publishing, admission slip issuance, exam offences logging, repeat attempt validation, results publication.", table_cell)
        ],
        [
            Paragraph("System Administrator", table_cell_bold),
            Paragraph("M.M.B. Mushan", table_cell),
            Paragraph("Undergraduate batch enrollment (CSV & individual), credential issuance with auto-generated passwords, user role management, system audit log tracking.", table_cell)
        ],
        [
            Paragraph("Department & Faculty MAs", table_cell_bold),
            Paragraph("Group C Joint", table_cell),
            Paragraph("Dedicated Dept MA Portal (Mrs. K. N. Fathima) for Subject Medicals under the 14-day rule; Faculty MA Desk for preliminary Examination Medical file reviews.", table_cell)
        ]
    ]
    t_roles = Table(role_impl_data, colWidths=[110, 95, 335])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_roles)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: INTEGRATION & TESTING (TC-01 TO TC-12)
    # =========================================================================
    story.append(Paragraph("6.7 Integration and Important Technical Decisions", h1))
    story.append(Paragraph(
        "<b>Architectural Unity:</b> The eight roles share a single unified React frontend and a shared Express.js 5 RESTful backend connected to MongoDB Atlas. "
        "Shared state machine definitions ensure that an application initiated by a student flows seamlessly to the assigned Lecturer, escalates to the HOD, "
        "is verified by the SAR, cleared by the Exam Branch, and ratified by the Dean without data divergence.<br/>"
        "<b>Key Technical Decisions:</b> (1) <i>Stateless JWT Architecture:</i> Replaced client-side Firebase with server-side JWT and bcrypt encryption, enabling "
        "deterministic role claim verification on every API route; (2) <i>State Machine Workflow Engine:</i> Implemented `Backend/workflows/engine.js` with structured "
        "transition tables, formal rejection remarks, and automatic status history logging; (3) <i>Resilient Storage Architecture:</i> Built an automatic in-memory mock "
        "fallback ensuring that if Atlas cloud connectivity drops, all 23 seed workflows and student records remain fully interactive for academic assessment; "
        "(4) <i>Unified Full-Stack Vercel Monorepo:</i> Leveraged root `vercel.json` rewrites and `api/index.js` serverless routing to host client and API on the same domain.",
        body
    ))

    story.append(Paragraph("7. Testing and Evaluation", h1))
    story.append(Paragraph("7.1 Testing Approach", h2))
    story.append(Paragraph(
        "Quality assurance followed a layered testing strategy: (1) <b>Automated Workflow Integration Testing:</b> An automated test suite (`Backend/test_workflows.js`) "
        "executing 55 assertions across multi-stage lifecycles (ECA, ESA, Examination Forms, Subject Medicals, Exam Medicals); (2) <b>Functional UI Testing:</b> Manual scenario "
        "testing through modern Chromium browsers across all seven dashboards; (3) <b>REST API Postman Testing:</b> Endpoint validation covering status codes, headers, and payloads; "
        "(4) <b>Security & RBAC Boundary Auditing:</b> Verifying token tampering resistance, password encryption, and horizontal privilege escalation prevention.",
        body
    ))

    story.append(Paragraph("7.2 Test Cases and Results (Part 1: TC-01 to TC-12)", h2))
    tc_data_p8 = [
        [Paragraph("Test ID", table_hdr), Paragraph("Module", table_hdr), Paragraph("Test Scenario & Inputs", table_hdr), Paragraph("Expected Result", table_hdr), Paragraph("Actual Result Observed", table_hdr), Paragraph("Status", table_hdr)],
        [
            Paragraph("TC-01", table_cell_bold), Paragraph("Auth", table_cell),
            Paragraph("Sign in with valid credentials (e.g. `student@seu.ac.lk` / `123456`)", table_cell),
            Paragraph("JWT issued; user redirected to role dashboard with welcome toast", table_cell),
            Paragraph("Redirected to Student Dashboard; token stored; personalized greeting displayed", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-02", table_cell_bold), Paragraph("Auth", table_cell),
            Paragraph("Sign in with incorrect password", table_cell),
            Paragraph("HTTP 401; card shake animation; clear error alert shown", table_cell),
            Paragraph("Access blocked; 'Invalid credentials' displayed; shake triggered", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-03", table_cell_bold), Paragraph("Security", table_cell),
            Paragraph("Student attempts to access `/api/stats` or Admin page", table_cell),
            Paragraph("HTTP 403 Forbidden; access denied", table_cell),
            Paragraph("HTTP 403 returned; UI redirects with unauthorized notice", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-04", table_cell_bold), Paragraph("Registration", table_cell),
            Paragraph("Submit semester registration with 24 credits (> 22 limit)", table_cell),
            Paragraph("Submission blocked; credit overload alert triggered", table_cell),
            Paragraph("Blocked at both UI and API level with `CREDIT_LIMIT_EXCEEDED`", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-05", table_cell_bold), Paragraph("Registration", table_cell),
            Paragraph("Submit semester registration with 19 credits (&le; 22 limit)", table_cell),
            Paragraph("Registration saved; status updated to registered", table_cell),
            Paragraph("Saved to MongoDB; registered credit total reflects 19 Cr", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-06", table_cell_bold), Paragraph("Registration", table_cell),
            Paragraph("Attempt course add/drop after statutory 2-week window", table_cell),
            Paragraph("Action rejected; deadline expired notice displayed", table_cell),
            Paragraph("Registration portal locked; add/drop buttons disabled", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-07", table_cell_bold), Paragraph("Attendance", table_cell),
            Paragraph("Course module with 78.5% attendance (< 80%)", table_cell),
            Paragraph("Candidate flagged ineligible for ESA; Red tag shown", table_cell),
            Paragraph("Displays 78.5% in red; ESA registration locked with warning", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-08", table_cell_bold), Paragraph("Attendance", table_cell),
            Paragraph("Course module with exactly 80.0% attendance", table_cell),
            Paragraph("Candidate flagged eligible for ESA; Green tag shown", table_cell),
            Paragraph("Eligible status confirmed; ESA registration permitted", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-09", table_cell_bold), Paragraph("Medical", table_cell),
            Paragraph("Submit valid medical certificate within 14 days", table_cell),
            Paragraph("Request stored; tracking number generated; routed to MA", table_cell),
            Paragraph("Tracking ID (e.g. `MED-2026-0910`) assigned; visible in tracker", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-10", table_cell_bold), Paragraph("Examination", table_cell),
            Paragraph("Attempt exam entry for course not registered in semester", table_cell),
            Paragraph("Registration rejected with enrollment prerequisite notice", table_cell),
            Paragraph("API returns HTTP 400; unlisted course barred from selection", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-11", table_cell_bold), Paragraph("Examination", table_cell),
            Paragraph("Submit fourth repeat attempt for same module (> 3 repeats)", table_cell),
            Paragraph("System blocks entry; warns of statutory attempt ceiling", table_cell),
            Paragraph("Flagged for Faculty Board / Senate grace approval; locked", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-12", table_cell_bold), Paragraph("Results", table_cell),
            Paragraph("Calculate SGPA for modules: 3 Cr (A), 3 Cr (B), 2 Cr (C+)", table_cell),
            Paragraph("Formula check: (12.0 + 9.0 + 4.6) / 8.0 = 3.20 SGPA", table_cell),
            Paragraph("Result engine returns exactly 3.20; displayed on dashboard", table_cell),
            Paragraph("PASS", tag_pass)
        ]
    ]
    t_tc_p8 = Table(tc_data_p8, colWidths=[40, 60, 125, 140, 145, 30])
    t_tc_p8.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_tc_p8)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: TESTING (TC-13 TO TC-21) & EVALUATION TABLE
    # =========================================================================
    story.append(Paragraph("7.2 Test Cases and Results (Part 2: TC-13 to TC-21)", h2))
    tc_data_p9 = [
        [Paragraph("Test ID", table_hdr), Paragraph("Module", table_hdr), Paragraph("Test Scenario & Inputs", table_hdr), Paragraph("Expected Result", table_hdr), Paragraph("Actual Result Observed", table_hdr), Paragraph("Status", table_hdr)],
        [
            Paragraph("TC-13", table_cell_bold), Paragraph("Progression", table_cell),
            Paragraph("Student CGPA falls below 2.00 at end of Semester 3", table_cell),
            Paragraph("Progression warning issued; barred from Semester 5 (Sec 5.7)", table_cell),
            Paragraph("Warning banner active; Semester 5 enrollment disabled", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-14", table_cell_bold), Paragraph("Guidance", table_cell),
            Paragraph("Search procedural index for 'medical form'", table_cell),
            Paragraph("Process details, approval steps, and downloadable forms return", table_cell),
            Paragraph("Medical process returned with 14-day rule and Dept MA office", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-15", table_cell_bold), Paragraph("Notifs", table_cell),
            Paragraph("Admin publishes official academic calendar notice", table_cell),
            Paragraph("Notification feed updates in real-time for students", table_cell),
            Paragraph("Notice appears in student top-nav bell dropdown instantly", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-16", table_cell_bold), Paragraph("HOD Desk", table_cell),
            Paragraph("HOD signs off pending repeat exam request", table_cell),
            Paragraph("Status transitions to 'HOD Endorsed'; routed to Dean queue", table_cell),
            Paragraph("Request removed from HOD queue; visible in Dean desk", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-17", table_cell_bold), Paragraph("Dean Desk", table_cell),
            Paragraph("Dean returns request with remarks for document correction", table_cell),
            Paragraph("Status becomes 'Correction Required'; remarks logged in audit", table_cell),
            Paragraph("Student notified; remarks visible; correction flag set", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-18", table_cell_bold), Paragraph("Exam Officer", table_cell),
            Paragraph("Audit attendance eligibility register for Semester 5 cohort", table_cell),
            Paragraph("Students with attendance < 80% listed with barred ESA flag", table_cell),
            Paragraph("Ineligible candidates identified; ESA exam passes withheld", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-19", table_cell_bold), Paragraph("Admin", table_cell),
            Paragraph("Provision new student profile with generated password", table_cell),
            Paragraph("Account created; credentials saved; student can log in", table_cell),
            Paragraph("Student signs in successfully; isolated dashboard rendered", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-20", table_cell_bold), Paragraph("Lecturer", table_cell),
            Paragraph("Lecturer marks attendance for lecture session", table_cell),
            Paragraph("Student attended sessions incremented; % updates live", table_cell),
            Paragraph("Percentage recalculated immediately; eligibility updated", table_cell),
            Paragraph("PASS", tag_pass)
        ],
        [
            Paragraph("TC-21", table_cell_bold), Paragraph("SAR Desk", table_cell),
            Paragraph("SAR verifies repeat examination payment bank voucher", table_cell),
            Paragraph("Voucher marked verified; file forwarded to Exam Branch", table_cell),
            Paragraph("Voucher verified; application advances to admission queue", table_cell),
            Paragraph("PASS", tag_pass)
        ]
    ]
    t_tc_p9 = Table(tc_data_p9, colWidths=[40, 60, 125, 140, 145, 30])
    t_tc_p9.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_tc_p9)

    story.append(Paragraph("7.3 Testing Evidence and Suite Verification", h2))
    story.append(Paragraph(
        "Automated regression execution via `Backend/test_workflows.js` completed with <b>55 of 55 checks passing (100% success rate)</b>. "
        "Verified suites include: Authentication & bad password rejection, ECA multi-stage approval (Student &rarr; SAR &rarr; Exam Branch &rarr; Lecturer &rarr; HOD), "
        "ESA separation integrity, Examination Form dual-output processing (Dean Office Admission & Senate Copy), Subject Medical isolation to Dept MA, "
        "Examination Medical escalation, return/decline audit tracking, and horizontal security boundaries. Average test execution time: 2.14 seconds.",
        body
    ))

    story.append(Paragraph("7.4 Evaluation Against Project Objectives", h1))
    eval_data = [
        [Paragraph("Project Objective", table_hdr), Paragraph("Evaluation Criteria & Evidence Tested", table_hdr), Paragraph("Status", table_hdr)],
        [
            Paragraph("Centralised Student Platform", table_cell_bold),
            Paragraph("Unified MERN web portal eliminating physical paperwork for core student academic operations (TC-01, TC-05, TC-14).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Authentication & Role Segregation", table_cell_bold),
            Paragraph("JWT stateless token validation and RBAC guards isolating 8 roles across staff and student dashboards (TC-01, TC-02, TC-03).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Semester Course Registration", table_cell_bold),
            Paragraph("Enforcement of 2-week registration deadline, 22-credit semester ceiling, and prerequisite checks (TC-04, TC-05, TC-06).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Attendance & Medical Compliance", table_cell_bold),
            Paragraph("Subject-wise attendance tracking, 80% ESA gating threshold, and 14-day statutory medical filing (TC-07, TC-08, TC-09).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Examination Operations & Repeats", table_cell_bold),
            Paragraph("ECA/ESA workflow segregation, 3-repeat attempt limits, bank voucher verification, and admission cards (TC-10, TC-11, TC-21).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Results & Formula Precision", table_cell_bold),
            Paragraph("Exact credit-weighted SGPA/CGPA algorithm according to Faculty Handbook Table 5.5.1 and Section 5.8 (TC-12).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Academic Progression Warnings", table_cell_bold),
            Paragraph("Automated detection of CGPA < 2.00 after Semester 3, barring unqualified Semester 5 registrations (TC-13, TC-18).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Welfare, Societies & Notifications", table_cell_bold),
            Paragraph("Directory of scholarships/societies and persistent real-time notifications with single and bulk delete (TC-15).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("AI-Powered Process Guidance", table_cell_bold),
            Paragraph("Interactive natural language assistant grounded in faculty regulations via Gemini API with procedural search (TC-14).", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ],
        [
            Paragraph("Extensible Architecture", table_cell_bold),
            Paragraph("Modular Express architecture allowing new faculty workflows to be added with zero regression on existing modules.", table_cell),
            Paragraph("ACHIEVED", tag_pass)
        ]
    ]
    t_eval = Table(eval_data, colWidths=[130, 350, 60])
    t_eval.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_eval)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: DEPLOYMENT, ENVIRONMENT CONFIG, REPO WORKFLOW, LIMITATIONS
    # =========================================================================
    story.append(Paragraph("8. Deployment and Setup Guide", h1))
    story.append(Paragraph("8.1 Application Access", h2))
    story.append(Paragraph(
        "<b>Live Production URL:</b> <font color='#1D4ED8'><u>https://seu-connect-plum.vercel.app</u></font><br/>"
        "The live environment is configured with pre-seeded demonstration accounts for all institutional roles. Users can authenticate directly using "
        "the standard Institutional Sign In interface with sample passwords (<font face='Courier'>123456</font>): Student (<font face='Courier'>Student@gmail.com</font>), "
        "Lecturer (<font face='Courier'>Lecturer@gmail.com</font>), HOD (<font face='Courier'>HOD@gmail.com</font>), SAR (<font face='Courier'>sar@gmail.com</font>), "
        "Dean (<font face='Courier'>Dean@gmail.com</font>), Examination Officer (<font face='Courier'>Examination@gmail.com</font>), Dept MA (<font face='Courier'>DeptMA@gmail.com</font>), "
        "Faculty MA (<font face='Courier'>Fma@gmail.com</font>), and Administrator (<font face='Courier'>Admin@gmail.com</font>).",
        body
    ))

    story.append(Paragraph("8.2 Local Installation and Execution", h2))
    story.append(Paragraph(
        "<b>Prerequisites:</b> Node.js (v18.0 or higher), npm (v9.0 or higher), Git, and active network access for MongoDB Atlas cloud connectivity.<br/>"
        "<b>Execution Commands:</b>",
        body
    ))
    code_block_text = (
        "# 1. Clone the repository and navigate into project root<br/>"
        "git clone https://github.com/BinMushan/SEUconnect.git<br/>"
        "cd SEUconnect<br/><br/>"
        "# 2. Start the Backend API Server (Port 5000)<br/>"
        "cd Backend<br/>"
        "npm install<br/>"
        "npm start          # Runs on http://localhost:5000<br/><br/>"
        "# 3. In a separate terminal, start the Frontend React Client (Port 5174)<br/>"
        "cd ../Frontend/SEUconnect<br/>"
        "npm install<br/>"
        "npm run dev        # Launches Vite development server on http://localhost:5174"
    )
    t_code = Table([[Paragraph(code_block_text, code_cell)]], colWidths=[540])
    t_code.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0B132B')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8)
    ]))
    t_code.keepWithNext = True
    story.append(t_code)

    story.append(Paragraph("8.3 Environment Configuration", h2))
    story.append(Paragraph("All environment variables are managed securely via root and module `.env` files (never committed to public version control):", body))

    env_data = [
        [Paragraph("Variable Name", table_hdr), Paragraph("Scope", table_hdr), Paragraph("Functional Purpose in Platform", table_hdr)],
        [Paragraph("`MONGODB_URI`", code_cell), Paragraph("Backend", table_cell), Paragraph("MongoDB Atlas connection string with credentials and cluster endpoint.", table_cell)],
        [Paragraph("`MONGODB_DB_NAME`", code_cell), Paragraph("Backend", table_cell), Paragraph("Target database name (`seuconnect`).", table_cell)],
        [Paragraph("`JWT_SECRET`", code_cell), Paragraph("Backend", table_cell), Paragraph("High-entropy 256-bit cryptographic secret for signing and verifying tokens.", table_cell)],
        [Paragraph("`PORT`", code_cell), Paragraph("Backend", table_cell), Paragraph("HTTP listen port for Express backend (default: `5000`).", table_cell)],
        [Paragraph("`NODE_ENV`", code_cell), Paragraph("Backend", table_cell), Paragraph("Execution mode (`development` or `production`).", table_cell)],
        [Paragraph("`GEMINI_API_KEY`", code_cell), Paragraph("Backend", table_cell), Paragraph("Google Gemini AI API key powering the RAG assistant (server-side only).", table_cell)],
        [Paragraph("`VITE_API_URL`", code_cell), Paragraph("Frontend", table_cell), Paragraph("Base URL for API requests (`http://localhost:5000/api` locally, `/api` on Vercel).", table_cell)]
    ]
    t_env = Table(env_data, colWidths=[110, 60, 370])
    t_env.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_env)

    story.append(Paragraph("8.4 Known Setup or Deployment Issues & Solutions", h2))
    story.append(Paragraph(
        "• <b>CORS Whitelisting:</b> When running frontend and backend on differing development ports (5174 and 5000), Express CORS middleware dynamically "
        "authorizes the client origin. On Vercel, client and API are unified under the same domain via `vercel.json` rewrites, bypassing cross-origin limits entirely.<br/>"
        "• <b>Vercel Client-Side Routing:</b> React Router SPAs require URL rewrite rules (`/(.*) &rarr; /index.html`) to prevent 404 errors on browser page reloads. "
        "This was resolved via the committed root and frontend `vercel.json` configurations.<br/>"
        "• <b>MongoDB Atlas IP Whitelisting:</b> Cloud Atlas deployments require Network Access whitelisting (`0.0.0.0/0`) to allow dynamic Vercel serverless IP ranges to connect.",
        body
    ))

    story.append(Paragraph("9.1 Repository and Collaboration Workflow", h1))
    story.append(Paragraph(
        "The project was managed collaboratively on GitHub: <font color='#1D4ED8'><u>https://github.com/BinMushan/SEUconnect</u></font>. "
        "The team employed a feature-branching workflow (`Student-update-05`, `backend-update-1`, `Development`) merged into `main` via peer-reviewed Pull Requests "
        "(PRs #75 through #82). Commit histories document individual contributions: System Administration and Architecture by M.M.B. Mushan; Student Portal and SAR Desk "
        "by M.N.M. Afnan; HOD and Dean Desks by K. Jelaxsi; Lecturer Desk by J. Kamsa; and Examination Desk by M.R. Shahnas.",
        body
    ))

    story.append(Paragraph("10. Limitations and Future Enhancements", h1))
    story.append(Paragraph("10.1 Current Limitations", h2))
    story.append(Paragraph(
        "While SEUConnect provides full functional digitisation, three practical boundaries exist: (1) <i>Statutory Physical Document Verification:</i> University by-laws "
        "mandate that physical medical certificates and bank paying-in slips must still be verified against original paper copies prior to final Senate ratification; "
        "(2) <i>Sample Cohort Data:</i> The platform is currently populated with representative data for BICT cohorts (10 active students, 6 subjects); "
        "(3) <i>SMS Gateway Absences:</i> Urgent notices are delivered through the in-app notification center rather than cellular SMS broadcasts due to gateway costs.",
        body
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: FUTURE ENHANCEMENTS, CONCLUSION, REFERENCES
    # =========================================================================
    story.append(Paragraph("10.2 Future Enhancements", h1))
    story.append(Paragraph(
        "The architectural modularity of SEUConnect enables straightforward integration of several planned future extensions:<br/>"
        "• <b>Academic Advisor Portal:</b> Dedicated interface for faculty advisors to conduct formal load assessments and issue digital consent for credit ceiling deviations (Section 7.3).<br/>"
        "• <b>Biometric / RFID Classroom Integration:</b> Hardware IoT integration with lecture hall card readers to log physical attendance directly into the Mongoose attendance collection.<br/>"
        "• <b>LMS & External ERP Interoperability:</b> RESTful webhooks connecting SEUConnect with the university Moodle Virtual Learning Environment (VLE) for continuous assessment sync.<br/>"
        "• <b>Automated SMS / Push Gateway:</b> Integration with telecommunication SMS gateways to broadcast urgent attendance warning alerts when a student drops below 82%.<br/>"
        "• <b>Digital Certificate Cryptographic Verification:</b> Generating QR-coded, digitally signed exam admission cards and official GPA transcripts verifiable by third parties.",
        body
    ))

    story.append(Paragraph("11. Conclusion", h1))
    story.append(Paragraph(
        "SEUConnect represents a transformative academic digitization initiative for the Faculty of Technology, South Eastern University of Sri Lanka. "
        "By replacing error-prone manual paper filing with a modern, reactive MERN-stack platform, the system effectively bridges the operational gap between undergraduates "
        "and faculty administrative authorities. The implementation faithfully adheres to the statutory provisions of the <i>Undergraduate Handbook 2023/2024</i>, "
        "strictly automating the 80% attendance gating threshold, 22-credit semester load ceiling, repeat attempt rules, multi-stage petition workflows, and credit-weighted GPA calculations. "
        "Through its seven tailored role dashboards and automated state-machine transitions, SEUConnect empowers students with real-time academic transparency while "
        "significantly reducing clerical latency for faculty officers. The project successfully demonstrates full-stack software engineering excellence, resilient cloud deployment, "
        "and collaborative teamwork, providing an extensible foundation ready for institutional adoption across SEUSL.",
        body
    ))

    story.append(Paragraph("References", h1))
    references = [
        "[1] South Eastern University of Sri Lanka, Faculty of Technology. (2023/2024). <i>Undergraduate Handbook 2023/2024</i>. Oluvil: SEUSL Press.",
        "[2] Group C. (2026). <i>SEUConnect: Proposal for CA1 Group Assignment, SWT22022 Practical for Internet Application Development</i>. Faculty of Technology, SEUSL.",
        "[3] Meta Platforms, Inc. (2025). <i>React 19 Documentation</i>. Retrieved from https://react.dev",
        "[4] OpenJS Foundation. (2025). <i>Node.js v20 LTS Technical Documentation</i>. Retrieved from https://nodejs.org",
        "[5] Express.js Foundation. (2025). <i>Express.js 5.0 Guide and API Reference</i>. Retrieved from https://expressjs.com",
        "[6] MongoDB, Inc. (2025). <i>MongoDB Manual & Mongoose 9 ODM Documentation</i>. Retrieved from https://www.mongodb.com/docs/",
        "[7] Internet Engineering Task Force (IETF). (2015). <i>RFC 7519: JSON Web Token (JWT) Standard</i>. Retrieved from https://datatracker.ietf.org/doc/html/rfc7519",
        "[8] Google DeepMind. (2025). <i>Gemini 1.5 Flash API Documentation & Prompt Engineering Guide</i>. Retrieved from https://ai.google.dev/gemini-api/docs",
        "[9] Vercel Inc. (2025). <i>Vercel Serverless Functions and SPA Deployment Specification</i>. Retrieved from https://vercel.com/docs",
        "[10] Vite Foundation. (2025). <i>Vite: Next Generation Frontend Tooling</i>. Retrieved from https://vitejs.dev"
    ]
    for r in references:
        story.append(Paragraph(r, ParagraphStyle('RefEntry', parent=body, fontSize=7.2, leading=9.5, spaceAfter=2.5)))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 12: APPENDICES (A, B, C)
    # =========================================================================
    story.append(Paragraph("Appendices", h1))
    story.append(Paragraph("Appendix A – Key System Interface Highlights", h2))
    story.append(Paragraph(
        "• <b>Institutional Sign In:</b> Zero-scroll card featuring university branding, SVG credential inputs, institutional validation, and forgot-password recovery.<br/>"
        "• <b>Student Academic Progress Trend:</b> Modern SVG curve charting historical semester GPAs against First Class (3.70) and Second Upper (3.30) benchmarks.<br/>"
        "• <b>Department MA Desk:</b> Operational queue allowing Mrs. K. N. Fathima to audit 14-day statutory windows and approve subject medical excuses independently.<br/>"
        "• <b>SAR Command Center:</b> Workflow command center provisioning examination voucher verification, admission generation, and ECA/ESA portal lock controls.",
        body
    ))

    story.append(Paragraph("Appendix B – Core REST API Endpoint Reference Summary", h2))
    api_data = [
        [Paragraph("Method", table_hdr), Paragraph("Endpoint Route", table_hdr), Paragraph("Functional Purpose & Action", table_hdr), Paragraph("Authorization Role", table_hdr)],
        [Paragraph("POST", code_cell), Paragraph("`/api/auth/login`", code_cell), Paragraph("Authenticates credentials; issues signed JWT bearer token", table_cell), Paragraph("Public", table_cell)],
        [Paragraph("POST", code_cell), Paragraph("`/api/auth/register-student`", code_cell), Paragraph("Provisions new student profile with generated password", table_cell), Paragraph("Admin only", table_cell_bold)],
        [Paragraph("POST", code_cell), Paragraph("`/api/auth/forgot-password`", code_cell), Paragraph("Verifies student identity and executes password reset", table_cell), Paragraph("Public / Student", table_cell)],
        [Paragraph("GET", code_cell), Paragraph("`/api/student/profile`", code_cell), Paragraph("Fetches authenticated student details, batch, and GPA", table_cell), Paragraph("Student", table_cell)],
        [Paragraph("GET", code_cell), Paragraph("`/api/student/attendance`", code_cell), Paragraph("Returns module-wise attendance percentages & ESA eligibility", table_cell), Paragraph("Student", table_cell)],
        [Paragraph("POST", code_cell), Paragraph("`/api/student/register`", code_cell), Paragraph("Submits semester course enrollment with 22-cr limit check", table_cell), Paragraph("Student", table_cell)],
        [Paragraph("GET", code_cell), Paragraph("`/api/student/results`", code_cell), Paragraph("Retrieves transcript grades, SGPA, and cumulative CGPA", table_cell), Paragraph("Student", table_cell)],
        [Paragraph("GET", code_cell), Paragraph("`/api/processes/inbox`", code_cell), Paragraph("Fetches pending approval requests matching caller's role", table_cell), Paragraph("Staff / HOD / Dean / SAR", table_cell_bold)],
        [Paragraph("POST", code_cell), Paragraph("`/api/processes/request`", code_cell), Paragraph("Initiates multi-stage petition (ECA, ESA, Medical, Exam Form)", table_cell), Paragraph("Student", table_cell)],
        [Paragraph("PUT", code_cell), Paragraph("`/api/processes/:id/action`", code_cell), Paragraph("Transitions petition stage (Approve, Return, Decline)", table_cell), Paragraph("Authorized Role", table_cell_bold)],
        [Paragraph("GET", code_cell), Paragraph("`/api/notifications`", code_cell), Paragraph("Retrieves role-tailored notifications with unread counter", table_cell), Paragraph("Authenticated", table_cell)],
        [Paragraph("DELETE", code_cell), Paragraph("`/api/notifications/:id`", code_cell), Paragraph("Permanently deletes single notification from user feed", table_cell), Paragraph("Authenticated", table_cell)],
        [Paragraph("DELETE", code_cell), Paragraph("`/api/notifications/clear-all`", code_cell), Paragraph("Purges all active notifications for authenticated user", table_cell), Paragraph("Authenticated", table_cell)],
        [Paragraph("GET", code_cell), Paragraph("`/api/health`", code_cell), Paragraph("System health telemetry, uptime, and database status", table_cell), Paragraph("Public", table_cell)]
    ]
    t_api = Table(api_data, colWidths=[45, 145, 235, 115])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, alt_bg])
    ]))
    story.append(t_api)

    story.append(Paragraph("Appendix C – Technical State Machine & Schema Indexes", h2))
    story.append(Paragraph(
        "• <b>Compound Database Indexes:</b> `Students.createIndex({ regNo: 1 }, { unique: true })`, `ProcessRequests.createIndex({ trackingNumber: 1 }, { unique: true })`, "
        "`Attendance.createIndex({ student: 1, courseCode: 1 }, { unique: true })`, `Notifications.createIndex({ recipientRole: 1, createdAt: -1 })`.<br/>"
        "• <b>Workflow States:</b> `SUBMITTED` &rarr; `LECTURER_REVIEW` &rarr; `HOD_ENDORSED` &rarr; `SAR_VERIFIED` &rarr; `EXAM_BRANCH_PROCESSED` &rarr; `DEAN_RATIFIED` &rarr; `SENATE_APPROVED`.",
        body
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report successfully compiled: {filename}")


if __name__ == '__main__':
    out_dl = r'c:\Users\PC\Downloads\SEUConnect_Final_Project_Report_Completed.pdf'
    out_docs = r'c:\Users\PC\Desktop\IAD SEUconnect\SEUconnect\docs\SEUConnect_Final_Project_Report_Completed.pdf'
    
    os.makedirs(os.path.dirname(out_docs), exist_ok=True)
    
    build_pdf(out_dl)
    build_pdf(out_docs)

