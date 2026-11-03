import React, { useState, useEffect } from 'react';
import api from '../../../src/services/api.js';

// Pre-seeded fallback events for all 5 batches (SEUSL Academic Year 2025/2026)
const INITIAL_CALENDAR_EVENTS = [
  // Faculty Milestones (Read-only)
  {
    id: 'cal_fac_01',
    title: 'Faculty Inauguration & Academic Commencement',
    type: 'semester_boundary',
    batch: 'All Batches',
    semester: 'Semester 1',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    scope: 'faculty',
    department: 'Faculty',
    description: 'Formal inauguration of academic semester across ICT and BST departments presided by Dean Prof. Rifai Kariapper.',
    createdBy: { name: 'Prof. Rifai Kariapper', role: 'dean', email: 'dean@seu.ac.lk' },
  },
  {
    id: 'cal_fac_02',
    title: 'Mid-Semester Written Evaluations & Continuous Assessments',
    type: 'assessment_ca',
    batch: 'All Batches',
    semester: 'Semester 1',
    startDate: '2026-10-12',
    endDate: '2026-10-23',
    scope: 'faculty',
    department: 'Faculty',
    description: 'Faculty-wide standardized mid-semester evaluation window across all academic complexes.',
    createdBy: { name: 'Prof. Rifai Kariapper', role: 'dean', email: 'dean@seu.ac.lk' },
  },
  {
    id: 'cal_fac_03',
    title: 'End-Semester Study Leave & Practical Hall Clearances',
    type: 'study_leave',
    batch: 'All Batches',
    semester: 'Semester 1',
    startDate: '2026-11-20',
    endDate: '2026-11-30',
    scope: 'faculty',
    department: 'Faculty',
    description: 'Statutory revision window and examination admission card distribution by Faculty Examination Branch.',
    createdBy: { name: 'Prof. Rifai Kariapper', role: 'dean', email: 'dean@seu.ac.lk' },
  },
  {
    id: 'cal_fac_04',
    title: 'End-Semester Theory Examinations (ESA)',
    type: 'end_semester_exam',
    batch: 'All Batches',
    semester: 'Semester 1',
    startDate: '2026-12-05',
    endDate: '2026-12-22',
    scope: 'faculty',
    department: 'Faculty',
    description: 'Final degree written assessments supervised by Faculty Examination Board.',
    createdBy: { name: 'Prof. Rifai Kariapper', role: 'dean', email: 'dean@seu.ac.lk' },
  },
  {
    id: 'cal_fac_05',
    title: 'End-Semester Vacation & Script Evaluation',
    type: 'vacation',
    batch: 'All Batches',
    semester: 'Semester 1',
    startDate: '2026-12-24',
    endDate: '2027-01-08',
    scope: 'faculty',
    department: 'Faculty',
    description: 'Vacation window for undergraduates and centralized marking at the Examination Branch.',
    createdBy: { name: 'Prof. Rifai Kariapper', role: 'dean', email: 'dean@seu.ac.lk' },
  },

  // 1st Year (2025/2024 Batch)
  {
    id: 'cal_ict_b1_01',
    title: 'Orientation & Computing Fundamentals Lab Induction',
    type: 'department_event',
    batch: '2025/2024',
    semester: 'Semester 1',
    startDate: '2026-08-20',
    endDate: '2026-08-22',
    scope: 'department',
    department: 'ICT',
    description: 'Software lab access setup, Linux workstation onboarding, and GitHub classroom allocations for freshers.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b1_02',
    title: '1st Year CA 1 Programming Quiz & Viva Voce',
    type: 'assessment_ca',
    batch: '2025/2024',
    semester: 'Semester 1',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 1113 Structured Programming practical assessment in Software Labs 1 & 2.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b1_03',
    title: 'Medical Certificate Submission Deadline (1st Year)',
    type: 'medical_submission_deadline',
    batch: '2025/2024',
    semester: 'Semester 1',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    scope: 'department',
    department: 'ICT',
    description: 'Deadline to submit UMC endorsed medical excuses for mid-semester assessments.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b1_04',
    title: 'ICT 1113 End-Semester Practical Coding Exam',
    type: 'department_event',
    batch: '2025/2024',
    semester: 'Semester 1',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    scope: 'department',
    department: 'ICT',
    description: 'Hands-on practical programming evaluation for 1st Year undergraduates.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 2nd Year (2024/2023 Batch)
  {
    id: 'cal_ict_b2_01',
    title: 'Data Structures & Algorithms Lab Assessment',
    type: 'assessment_ca',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-09-08',
    endDate: '2026-09-12',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 2113 practical algorithmic problem solving viva supervised by Mr. R. Jeyanth.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b2_02',
    title: 'Database Management Systems ER & SQL Practical Viva',
    type: 'assessment_ca',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 2123 relational schema normalisation and query evaluations supervised by Eng. K. Thanushan.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b2_03',
    title: '2nd Year 80% Attendance Audit Cut-off',
    type: 'department_event',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-10-28',
    endDate: '2026-10-28',
    scope: 'department',
    department: 'ICT',
    description: 'Final audit of biometric and manual lecture attendance rolls to determine exam eligibility.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b2_04',
    title: 'Examination Entry Form Submission Deadline (2nd Year)',
    type: 'exam_form_submission',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-11-18',
    endDate: '2026-11-18',
    scope: 'department',
    department: 'ICT',
    description: 'Final date to submit signed exam admission dossiers to HOD office.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 3rd Year (2023/2022 Batch)
  {
    id: 'cal_ict_b3_01',
    title: 'Mobile Apps Architecture Pitch & Sprint 1 Demo',
    type: 'department_event',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 3122 Flutter/React Native prototype presentations evaluated by industry visiting staff.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b3_02',
    title: 'Enterprise Application Development Midterm Evaluation',
    type: 'assessment_ca',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-10-16',
    endDate: '2026-10-20',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 3112 microservices and enterprise spring architecture mid-term evaluation.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b3_03',
    title: 'Medical Excuse Submission Final Date for CA (3rd Year)',
    type: 'medical_submission_deadline',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-11-05',
    endDate: '2026-11-05',
    scope: 'department',
    department: 'ICT',
    description: 'Last call for student medical appeals (Afnan, Bilal and batch-mates) before CA Marks Board.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b3_04',
    title: 'Capstone Project Phase 1 Interim Progress Review',
    type: 'department_event',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-11-25',
    endDate: '2026-11-27',
    scope: 'department',
    department: 'ICT',
    description: 'Comprehensive research and development milestones defense before Department Review Panel.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 4th Year (2022/2021 Batch)
  {
    id: 'cal_ict_b4_01',
    title: 'Cloud Computing & Distributed Systems AWS/Docker Lab Viva',
    type: 'assessment_ca',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-09-22',
    endDate: '2026-09-25',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 4113 Kubernetes deployment and resilience tests assessed by HOD M.J Ahamed Sabani.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b4_02',
    title: 'Final Year Research Dissertation Draft Submission',
    type: 'department_event',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-10-30',
    endDate: '2026-10-30',
    scope: 'department',
    department: 'ICT',
    description: 'Turnitin similarity verification (<15%) and formal thesis submission to academic advisors.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b4_03',
    title: 'Repeat Examination Entry Application Deadline (4th Year)',
    type: 'exam_form_submission',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-11-15',
    endDate: '2026-11-15',
    scope: 'department',
    department: 'ICT',
    description: 'Submission of paid repeat candidate registration slips for 100-300 level prerequisite clearances.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b4_04',
    title: 'Industrial Internship Pre-Placement Interviews',
    type: 'department_event',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-12-15',
    endDate: '2026-12-18',
    scope: 'department',
    department: 'ICT',
    description: 'Interviews conducted by corporate partners (Virtusa, IFS, WSO2, Dialog) for Semester 8 placements.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 2021/2020 Batch
  {
    id: 'cal_ict_b5_01',
    title: 'Repeat Exam Candidacy & Special Senate Waiver Verification',
    type: 'department_event',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-10-08',
    endDate: '2026-10-08',
    scope: 'department',
    department: 'ICT',
    description: 'HOD scrutiny of special repeat petitions for 2021/2020 cohort students eligible for final concession.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b5_02',
    title: '2021/2020 Batch Degree Completion Final Clearance',
    type: 'exam_form_submission',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-11-02',
    endDate: '2026-11-02',
    scope: 'department',
    department: 'ICT',
    description: 'Library, laboratory, and academic transcript clearance verification ahead of Senate release.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    id: 'cal_ict_b5_03',
    title: 'Results Release: Semester 8 Make-up Assessments',
    type: 'results_release',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-11-12',
    endDate: '2026-11-12',
    scope: 'department',
    department: 'ICT',
    description: 'Senate ratified final results publish notice for 2021/2020 graduating students.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
];

// Color palette config per batch
const BATCH_COLORS = {
  '2025/2024': { text: '#1e40af', bg: '#dbeafe', border: '#93c5fd', dot: '#2563eb', label: '1st Year (2025/2024)' },
  '2024/2023': { text: '#065f46', bg: '#d1fae5', border: '#6ee7b7', dot: '#059669', label: '2nd Year (2024/2023)' },
  '2023/2022': { text: '#92400e', bg: '#fef3c7', border: '#fcd34d', dot: '#d97706', label: '3rd Year (2023/2022)' },
  '2022/2021': { text: '#5b21b6', bg: '#ede9fe', border: '#c4b5fd', dot: '#7c3aed', label: '4th Year (2022/2021)' },
  '2021/2020': { text: '#115e59', bg: '#ccfbf1', border: '#5eead4', dot: '#0d9488', label: '2021/2020' },
  'All Batches': { text: '#0f2b5c', bg: '#f1f5f9', border: '#cbd5e1', dot: '#0f2b5c', label: 'All Batches' },
};

const EVENT_TYPE_LABELS = {
  semester_boundary: { label: 'Semester Boundary', color: '#0f2b5c', bg: '#f1f5f9' },
  lecture_period: { label: 'Lecture Period', color: '#1e40af', bg: '#dbeafe' },
  assessment_ca: { label: 'Continuous Assessment (CA)', color: '#92400e', bg: '#fef3c7' },
  study_leave: { label: 'Study Leave', color: '#065f46', bg: '#d1fae5' },
  end_semester_exam: { label: 'End-Semester Exam (ESA)', color: '#991b1b', bg: '#fee2e2' },
  exam_form_submission: { label: 'Exam Form Submission', color: '#5b21b6', bg: '#ede9fe' },
  medical_submission_deadline: { label: 'Medical Deadline', color: '#c2410c', bg: '#ffedd5' },
  results_release: { label: 'Results Release', color: '#15803d', bg: '#dcfce7' },
  vacation: { label: 'Vacation Window', color: '#475569', bg: '#f8fafc' },
  public_holiday: { label: 'Public Holiday', color: '#6b7280', bg: '#f3f4f6' },
  department_event: { label: 'Department Event', color: '#0f2b5c', bg: '#e0e7ff' },
  other: { label: 'Other Academic Note', color: '#334155', bg: '#f1f5f9' },
};

export default function DepartmentAcademicCalendar({ onNavigate }) {
  const [events, setEvents] = useState(INITIAL_CALENDAR_EVENTS);
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [inspectEvent, setInspectEvent] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('department_event');
  const [formBatch, setFormBatch] = useState('2023/2022');
  const [formSemester, setFormSemester] = useState('Semester 1');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Fetch events from API on mount
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAcademicEvents();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      }
    } catch (err) {
      console.warn('Using local pre-seeded calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormType('department_event');
    setFormBatch(batchFilter !== 'All Batches' ? batchFilter : '2023/2022');
    setFormSemester('Semester 1');
    setFormStartDate('2026-11-15');
    setFormEndDate('2026-11-15');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormType(evt.type || 'department_event');
    setFormBatch(evt.batch || '2023/2022');
    setFormSemester(evt.semester || 'Semester 1');
    setFormStartDate(evt.startDate || '');
    setFormEndDate(evt.endDate || evt.startDate || '');
    setFormDescription(evt.description || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate) {
      alert('Please provide an event title and start date.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      type: formType,
      batch: formBatch,
      semester: formSemester,
      startDate: formStartDate,
      endDate: formEndDate || formStartDate,
      scope: 'department',
      department: 'ICT',
      description: formDescription.trim(),
      createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
    };

    try {
      if (editingEvent) {
        const res = await api.updateAcademicEvent(editingEvent._id || editingEvent.id, payload);
        if (res && res.success) {
          setEvents((prev) =>
            prev.map((it) => ((it._id || it.id) === (editingEvent._id || editingEvent.id) ? { ...it, ...payload } : it))
          );
        } else {
          setEvents((prev) =>
            prev.map((it) => ((it._id || it.id) === (editingEvent._id || editingEvent.id) ? { ...it, ...payload } : it))
          );
        }
        setStatusMessage(`Event "${payload.title}" updated successfully.`);
      } else {
        const res = await api.createAcademicEvent(payload);
        const newEvent = res && res.data ? res.data : { ...payload, id: `dept_evt_${Date.now()}` };
        setEvents((prev) => [newEvent, ...prev]);
        setStatusMessage(`New department event "${payload.title}" created.`);
      }
    } catch (err) {
      console.warn('Failed to save via API, applying in-memory:', err);
      if (editingEvent) {
        setEvents((prev) =>
          prev.map((it) => ((it._id || it.id) === (editingEvent._id || editingEvent.id) ? { ...it, ...payload } : it))
        );
        setStatusMessage(`Event "${payload.title}" updated.`);
      } else {
        const newEvent = { ...payload, id: `dept_evt_${Date.now()}` };
        setEvents((prev) => [newEvent, ...prev]);
        setStatusMessage(`New department event "${payload.title}" created.`);
      }
    }

    setTimeout(() => setStatusMessage(''), 4000);
    setIsModalOpen(false);
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the event: "${title}"?`)) return;
    try {
      await api.deleteAcademicEvent(id);
    } catch (err) {
      console.warn('API delete fallback to in-memory:', err);
    }
    setEvents((prev) => prev.filter((it) => (it._id || it.id) !== id));
    setStatusMessage(`Event "${title}" has been deleted.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const isAll = batchFilter === 'All Batches' || batchFilter === 'All';
    const matchesBatch =
      isAll ||
      evt.batch === 'All Batches' ||
      evt.batch === batchFilter;

    const matchesSemester =
      semesterFilter === 'All Semesters' ||
      evt.semester === 'All Semesters' ||
      evt.semester === semesterFilter;

    const matchesSearch =
      !searchQuery ||
      evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.batch?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBatch && matchesSemester && matchesSearch;
  });

  // Calendar Month helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust Monday-first index: Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfMonth + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 10, 1)); // Default to Nov 2026 demo

  // Get events falling on a day
  const getEventsForDay = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return filteredEvents.filter((e) => {
      const s = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= s && dateStr <= end;
    });
  };

  const batchesList = [
    { key: 'All Batches', label: 'All Batches' },
    { key: '2025/2024', label: '1st Year 2025/2024' },
    { key: '2024/2023', label: '2nd Year 2024/2023' },
    { key: '2023/2022', label: '3rd Year 2023/2022' },
    { key: '2022/2021', label: '4th Year 2022/2021' },
    { key: '2021/2020', label: '2021/2020' },
  ];

  const semestersList = ['All Semesters', 'Semester 1', 'Semester 2'];

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">ACADEMIC SCHEDULE & MILESTONES</span>
          <h1 className="hod-view-title">Department Academic Calendar</h1>
          <p className="hod-view-subtitle">
            Integrated Academic Schedule Across All 5 Batches • Department of Information and Communication Technology
          </p>
        </div>
        <div className="hod-banner-actions">
          {/* View Mode Toggle */}
          <div className="hod-btn-group" style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            <button
              type="button"
              className={`hod-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
              style={{
                border: 'none',
                background: viewMode === 'month' ? '#ffffff' : 'transparent',
                color: viewMode === 'month' ? '#0f2b5c' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              📅 Month View
            </button>
            <button
              type="button"
              className={`hod-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0f2b5c' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              📋 Timeline / List View
            </button>
          </div>

          <button type="button" className="hod-banner-btn primary" onClick={openCreateModal}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Department Event
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          ✓ {statusMessage}
        </div>
      )}

      {/* 2. Batch Filter Tabs (Styled like Undergraduates Directory tabs) */}
      <div className="hod-toolbar-card" style={{ marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
          {/* Row 1: Batch Filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="hod-filter-tabs">
              {batchesList.map((b) => {
                const isSelected =
                  batchFilter === b.key ||
                  (b.key === 'All Batches' && (batchFilter === 'All' || batchFilter === 'All Batches'));

                const count =
                  b.key === 'All Batches'
                    ? events.length
                    : events.filter((e) => e.batch === b.key || e.batch === 'All Batches').length;

                return (
                  <button
                    key={b.key}
                    type="button"
                    className={`hod-tab-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setBatchFilter(b.key)}
                    style={{ cursor: 'pointer' }}
                  >
                    {b.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="hod-table-search-box" style={{ maxWidth: '280px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search calendar events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Semester Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Semester:</span>
            <div className="hod-filter-tabs" style={{ gap: '0.35rem' }}>
              {semestersList.map((sem) => (
                <button
                  key={sem}
                  type="button"
                  className={`hod-tab-btn ${semesterFilter === sem ? 'active' : ''}`}
                  onClick={() => setSemesterFilter(sem)}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', cursor: 'pointer' }}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Batch Color Legend Strip (Clickable to Filter by Batch) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.55rem',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ fontWeight: 700, color: '#0f2b5c', marginRight: '0.25rem' }}>Filter by Batch:</span>
        {Object.entries(BATCH_COLORS).map(([bKey, cfg]) => {
          const isSelected =
            batchFilter === bKey ||
            (bKey === 'All Batches' && (batchFilter === 'All' || batchFilter === 'All Batches'));

          return (
            <button
              key={bKey}
              type="button"
              onClick={() => setBatchFilter(bKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                background: isSelected ? cfg.dot : cfg.bg,
                color: isSelected ? '#ffffff' : cfg.text,
                border: `1px solid ${isSelected ? cfg.dot : cfg.border}`,
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
              }}
              title={`Click to filter by ${cfg.label}`}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSelected ? '#ffffff' : cfg.dot,
                }}
              ></span>
              {cfg.label}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.73rem' }}>
          🏛️ Faculty directives are read-only • 🏢 HOD can manage ICT events
        </span>
      </div>

      {/* 4. MAIN CONTENT VIEW: MONTH OR TIMELINE */}
      {viewMode === 'month' ? (
        /* MONTH CALENDAR VIEW */
        <div className="hod-card" style={{ padding: '1rem' }}>
          {/* Calendar Month Header Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.8rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b5c', margin: 0 }}>
                {monthName}
              </h2>
              <button
                type="button"
                className="hod-btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                onClick={goToToday}
              >
                Current Demo Month
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="hod-btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}
                onClick={prevMonth}
                title="Previous Month"
              >
                ‹ Prev
              </button>
              <button
                type="button"
                className="hod-btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}
                onClick={nextMonth}
                title="Next Month"
              >
                Next ›
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              background: '#e2e8f0',
              border: '1px solid #e2e8f0',
              borderRadius: '8px 8px 0 0',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                style={{
                  background: '#f8fafc',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              background: '#e2e8f0',
              border: '1px solid #e2e8f0',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
            }}
          >
            {/* Empty slots for offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#f8fafc', minHeight: '110px', padding: '0.4rem' }}></div>
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = getEventsForDay(dayNum);
              const isToday = dayNum === 15; // Demo highlight

              return (
                <div
                  key={`day-${dayNum}`}
                  style={{
                    background: '#ffffff',
                    minHeight: '110px',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    border: isToday ? '2px solid #2563eb' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: isToday ? '#2563eb' : '#0f172a',
                        background: isToday ? '#dbeafe' : 'transparent',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                        {dayEvents.length} ev
                      </span>
                    )}
                  </div>

                  {/* Event chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', overflowY: 'auto', maxHeight: '85px' }}>
                    {dayEvents.map((ev) => {
                      const batchCfg = BATCH_COLORS[ev.batch] || BATCH_COLORS['All Batches'];
                      const isFaculty = ev.scope === 'faculty';

                      return (
                        <div
                          key={ev._id || ev.id}
                          onClick={() => setInspectEvent(ev)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 5px',
                            borderRadius: '3px',
                            background: batchCfg.bg,
                            color: batchCfg.text,
                            borderLeft: `3px solid ${batchCfg.dot}`,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer',
                          }}
                          title={`${ev.title} (${ev.batch}) - Click for details`}
                        >
                          {isFaculty && '🏛️ '}{ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIMELINE / LIST VIEW */
        <div className="hod-table-card">
          <div className="hod-table-header">
            <div>
              <h3 className="hod-card-title">Chronological Academic Calendar Timeline</h3>
              <p className="hod-card-subtitle">
                Comprehensive semester schedules, examination milestones, and continuous assessment deadlines.
              </p>
            </div>
            <span className="hod-counter-badge">{filteredEvents.length} Events Listed</span>
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredEvents.length === 0 ? (
              <div className="hod-empty-state" style={{ padding: '2.5rem' }}>
                <p>No calendar events matched the selected filters.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const batchCfg = BATCH_COLORS[evt.batch] || BATCH_COLORS['All Batches'];
                const typeCfg = EVENT_TYPE_LABELS[evt.type] || EVENT_TYPE_LABELS.other;
                const isFaculty = evt.scope === 'faculty';

                return (
                  <div
                    key={evt._id || evt.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderLeft: `5px solid ${batchCfg.dot}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1.15rem',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Left: Date & Info */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: '1 1 500px' }}>
                      <div
                        style={{
                          minWidth: '105px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0.4rem 0.6rem',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f2b5c' }}>
                          {evt.startDate}
                        </div>
                        {evt.endDate && evt.endDate !== evt.startDate && (
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                            to {evt.endDate}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
                            {evt.title}
                          </h4>

                          {/* Batch Chip */}
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: batchCfg.bg,
                              color: batchCfg.text,
                              border: `1px solid ${batchCfg.border}`,
                            }}
                          >
                            {evt.batch}
                          </span>

                          {/* Type Chip */}
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: typeCfg.bg,
                              color: typeCfg.color,
                            }}
                          >
                            {typeCfg.label}
                          </span>

                          {/* Scope Chip */}
                          {isFaculty ? (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                              }}
                            >
                              🏛️ Faculty Directive (Read-Only)
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#eff6ff',
                                color: '#1e40af',
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              🏢 Department of ICT
                            </span>
                          )}
                        </div>

                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="hod-btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                        onClick={() => setInspectEvent(evt)}
                      >
                        Inspect
                      </button>

                      {!isFaculty ? (
                        <>
                          <button
                            type="button"
                            className="hod-btn-endorse"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                            onClick={() => openEditModal(evt)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="hod-btn-decline"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                            onClick={() => handleDeleteEvent(evt._id || evt.id, evt.title)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Statutory
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT DEPARTMENT EVENT SHORT FORM POPUP MODAL */}
      {isModalOpen && (
        <div
          className="hod-modal-overlay hod-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="hod-modal-card hod-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '470px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100000,
              animation: 'hodPopupIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              className="hod-modal-header"
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 className="hod-modal-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b5c' }}>
                  {editingEvent ? 'Edit Department Event' : 'Add Department Event'}
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Quick milestone entry for Department of ICT
                </p>
              </div>
              <button
                type="button"
                className="hod-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Concise Short Form */}
            <form onSubmit={handleSaveEvent}>
              <div
                className="hod-modal-body"
                style={{
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* 1. Title */}
                <div>
                  <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    className="hod-input"
                    placeholder="e.g. CA 1 Practical Exam or Guest Lecture"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    autoFocus
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* 2. Batch & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Target Batch *
                    </label>
                    <select
                      className="hod-select"
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    >
                      <option value="All Batches">All Batches</option>
                      <option value="2025/2024">1st Year (2025/2024)</option>
                      <option value="2024/2023">2nd Year (2024/2023)</option>
                      <option value="2023/2022">3rd Year (2023/2022)</option>
                      <option value="2022/2021">4th Year (2022/2021)</option>
                      <option value="2021/2020">2021/2020</option>
                    </select>
                  </div>

                  <div>
                    <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Event Type *
                    </label>
                    <select
                      className="hod-select"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    >
                      <option value="department_event">Department Event</option>
                      <option value="assessment_ca">Continuous Assessment (CA)</option>
                      <option value="end_semester_exam">End-Semester Exam (ESA)</option>
                      <option value="medical_submission_deadline">Medical Deadline</option>
                      <option value="exam_form_submission">Exam Form Submission</option>
                      <option value="results_release">Results Release</option>
                      <option value="study_leave">Study Leave</option>
                      <option value="other">Other Note</option>
                    </select>
                  </div>
                </div>

                {/* 3. Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      className="hod-input"
                      value={formStartDate}
                      onChange={(e) => {
                        setFormStartDate(e.target.value);
                        if (!formEndDate || formEndDate < e.target.value) {
                          setFormEndDate(e.target.value);
                        }
                      }}
                      required
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="hod-input"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* 4. Short Note / Venue */}
                <div>
                  <label className="hod-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Short Note / Venue (Optional)
                  </label>
                  <textarea
                    className="hod-textarea"
                    rows="2"
                    placeholder="e.g. Software Lab 2, 09:00 AM. Bring student ID."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', resize: 'none' }}
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="hod-modal-footer"
                style={{
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  background: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  className="hod-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hod-btn-endorse"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingEvent ? 'Save Changes' : '+ Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. INSPECT EVENT POPUP MODAL */}
      {inspectEvent && (
        <div
          className="hod-modal-overlay hod-modal-backdrop"
          onClick={() => setInspectEvent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="hod-modal-card hod-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100000,
              animation: 'hodPopupIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="hod-modal-header"
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <h3 className="hod-modal-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b5c' }}>
                Calendar Event Dossier
              </h3>
              <button
                type="button"
                className="hod-modal-close-btn"
                onClick={() => setInspectEvent(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div className="hod-modal-body" style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>EVENT TITLE:</span>
                <h4 style={{ margin: '0.15rem 0 0', color: '#0f2b5c', fontSize: '0.95rem', fontWeight: 800 }}>{inspectEvent.title}</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Academic Batch:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectEvent.batch}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semester:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectEvent.semester}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Start Date:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectEvent.startDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>End Date:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectEvent.endDate || inspectEvent.startDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Governance Scope:</span>
                  <div style={{ fontWeight: 700, color: inspectEvent.scope === 'faculty' ? '#b45309' : '#1e40af' }}>
                    {inspectEvent.scope === 'faculty' ? 'Faculty Directive (Read-Only)' : 'Department of ICT'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Author:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {inspectEvent.createdBy?.name || 'Academic Administration'}
                  </div>
                </div>
              </div>

              {inspectEvent.description && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Description / Venue:</span>
                  <p style={{ margin: '0.2rem 0 0', color: '#334155', lineHeight: 1.4, background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {inspectEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="hod-modal-footer" style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button
                type="button"
                className="hod-btn-outline"
                onClick={() => setInspectEvent(null)}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

