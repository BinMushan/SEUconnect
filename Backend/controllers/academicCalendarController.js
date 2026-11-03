const AcademicEvent = require('../models/AcademicEvent');
const { getStatus } = require('../config/db');

// Realistic initial seed events for all 5 batches (current academic year 2025/2026)
const SEED_ACADEMIC_EVENTS = [
  // Faculty-wide Milestone Events (Read-only for HOD)
  {
    _id: 'cal_fac_01',
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
    _id: 'cal_fac_02',
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
    _id: 'cal_fac_03',
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
    _id: 'cal_fac_04',
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

  // 1st Year (2025/2024 Batch) Events
  {
    _id: 'cal_ict_b1_01',
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
    _id: 'cal_ict_b1_02',
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
    _id: 'cal_ict_b1_03',
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
    _id: 'cal_ict_b1_04',
    title: 'ESA Admission Form Submission Window (1st Year)',
    type: 'exam_form_submission',
    batch: '2025/2024',
    semester: 'Semester 1',
    startDate: '2026-11-10',
    endDate: '2026-11-16',
    scope: 'department',
    department: 'ICT',
    description: 'Verification of 80% attendance eligibility and online ESA registration confirmation.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 2nd Year (2024/2023 Batch) Events
  {
    _id: 'cal_ict_b2_01',
    title: 'Database Management Systems Practical Evaluation',
    type: 'assessment_ca',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 2123 DBMS SQL schema design and normalization workbench evaluations.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b2_02',
    title: 'IoT & Microprocessor Hardware Demo Days',
    type: 'department_event',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-11-04',
    endDate: '2026-11-06',
    scope: 'department',
    department: 'ICT',
    description: 'Group embedded system prototypes presentation in Hardware Systems Laboratory.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b2_03',
    title: '2nd Year Examination Candidacy Clearances',
    type: 'exam_form_submission',
    batch: '2024/2023',
    semester: 'Semester 1',
    startDate: '2026-11-12',
    endDate: '2026-11-18',
    scope: 'department',
    department: 'ICT',
    description: 'Attendance verification ledger sign-off with course coordinators.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 3rd Year (2023/2022 Batch) Events
  {
    _id: 'cal_ict_b3_01',
    title: 'Enterprise Application Development Mid-Term Review',
    type: 'assessment_ca',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-10-14',
    endDate: '2026-10-16',
    scope: 'department',
    department: 'ICT',
    description: 'ICT 3112 sprint review and automated CI/CD pipeline code audits.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b3_02',
    title: 'Network & Cloud Security Red-Team Exercise',
    type: 'department_event',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-10-28',
    endDate: '2026-10-30',
    scope: 'department',
    department: 'ICT',
    description: 'Live ethical hacking challenge in Cisco Networking Laboratory under Dr. A.M. Aslam.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b3_03',
    title: 'Medical Appeal Ledger Sign-off (3rd Year)',
    type: 'medical_submission_deadline',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    scope: 'department',
    department: 'ICT',
    description: 'Final submission deadline for semester 5 medical attendance excuse applications.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b3_04',
    title: 'Industrial Internship Orientation & Placement Briefing',
    type: 'department_event',
    batch: '2023/2022',
    semester: 'Semester 1',
    startDate: '2026-11-25',
    endDate: '2026-11-25',
    scope: 'department',
    department: 'ICT',
    description: 'Guest session by Virtusa & WSO2 talent teams on 6-month industrial internship placements.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 4th Year (2022/2021 Batch) Events
  {
    _id: 'cal_ict_b4_01',
    title: 'Capstone Research Project Interim Viva Voce',
    type: 'assessment_ca',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-10-21',
    endDate: '2026-10-23',
    scope: 'department',
    department: 'ICT',
    description: 'Final year thesis progress presentations assessed by departmental research evaluation panel.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b4_02',
    title: 'Final Degree Clearance & Senate Recommendation Filing',
    type: 'exam_form_submission',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2026-11-15',
    endDate: '2026-11-20',
    scope: 'department',
    department: 'ICT',
    description: 'Credit check audit and submission of Senate graduation eligibility dossiers.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b4_03',
    title: 'Semester 07 Marks Moderation & Release',
    type: 'results_release',
    batch: '2022/2021',
    semester: 'Semester 1',
    startDate: '2027-01-15',
    endDate: '2027-01-15',
    scope: 'department',
    department: 'ICT',
    description: 'Official publication of moderated grades following Faculty Board endorsement.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },

  // 5th Batch (2021/2020 Batch) Events (Graduation & Concession Track)
  {
    _id: 'cal_ict_b5_01',
    title: 'Repeat & Special Concession Examination Window',
    type: 'end_semester_exam',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-12-08',
    endDate: '2026-12-18',
    scope: 'department',
    department: 'ICT',
    description: 'Special repeat examinations under Faculty Regulation 9.2 for senior batch students.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b5_02',
    title: 'Thesis Final Bound Copy & Plagiarism Clearance Filing',
    type: 'exam_form_submission',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-11-02',
    endDate: '2026-11-06',
    scope: 'department',
    department: 'ICT',
    description: 'Submission of hardbound capstone documentation with Turnitin similarity report < 15%.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
  {
    _id: 'cal_ict_b5_03',
    title: 'Degree Award Clearance & Conferred List Senate Release',
    type: 'results_release',
    batch: '2021/2020',
    semester: 'Semester 1',
    startDate: '2026-12-28',
    endDate: '2026-12-28',
    scope: 'department',
    department: 'ICT',
    description: 'Final degree graduation list recommended to University Senate for formal conferment.',
    createdBy: { name: 'M.J Ahamed Sabani', role: 'hod', email: 'sabani@seu.ac.lk' },
  },
];

// In-memory store for fallback
let memoryEvents = [...SEED_ACADEMIC_EVENTS];

// 1. Get Academic Events (with filters)
exports.getAcademicEvents = async (req, res) => {
  try {
    const { batch, semester, scope, department } = req.query;

    let events = [];
    if (getStatus()) {
      const query = {};
      if (batch && batch !== 'All' && batch !== 'All Batches') {
        query.$or = [{ batch: batch }, { batch: 'All Batches' }];
      }
      if (semester && semester !== 'All' && semester !== 'All Semesters') {
        query.$or = [{ semester: semester }, { semester: 'All Semesters' }];
      }
      if (scope && scope !== 'All') query.scope = scope;
      if (department && department !== 'All') {
        query.$or = [{ department: department }, { department: 'Faculty' }];
      }

      events = await AcademicEvent.find(query).sort({ startDate: 1 });
    }

    if (!events || events.length === 0) {
      // Memory fallback
      events = memoryEvents.filter((ev) => {
        const matchesBatch = !batch || batch === 'All' || batch === 'All Batches' || ev.batch === batch || ev.batch === 'All Batches';
        const matchesSem = !semester || semester === 'All' || semester === 'All Semesters' || ev.semester === semester || ev.semester === 'All Semesters';
        const matchesScope = !scope || scope === 'All' || ev.scope === scope;
        const matchesDept = !department || department === 'All' || ev.department === department || ev.department === 'Faculty';
        return matchesBatch && matchesSem && matchesScope && matchesDept;
      });
    }

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch academic calendar events', error: error.message });
  }
};

// 2. Create Department Event (HOD Authorized)
exports.createAcademicEvent = async (req, res) => {
  try {
    const { title, type, batch, semester, startDate, endDate, scope, department, description, createdBy } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, start date, and end date are mandatory' });
    }

    const eventPayload = {
      title,
      type: type || 'department_event',
      batch: batch || 'All Batches',
      semester: semester || 'Semester 1',
      startDate,
      endDate,
      scope: 'department', // HOD creates department events
      department: department || 'ICT',
      description: description || '',
      createdBy: createdBy || {
        name: 'M.J Ahamed Sabani',
        role: 'hod',
        email: 'sabani@seu.ac.lk',
      },
    };

    let newEvent = null;
    if (getStatus()) {
      newEvent = await AcademicEvent.create(eventPayload);
    } else {
      newEvent = {
        _id: 'ev_' + Date.now(),
        ...eventPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryEvents.unshift(newEvent);
    }

    return res.status(201).json({
      success: true,
      message: 'Department academic event created successfully',
      data: newEvent,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create academic event', error: error.message });
  }
};

// 3. Update Department Event (HOD Authorized)
exports.updateAcademicEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getStatus()) {
      const existing = await AcademicEvent.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      if (existing.scope === 'faculty') {
        return res.status(403).json({ success: false, message: 'Faculty-wide events are read-only and cannot be modified by department heads' });
      }

      const updated = await AcademicEvent.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, message: 'Event updated successfully', data: updated });
    }

    // Memory store
    const idx = memoryEvents.findIndex((e) => (e._id && String(e._id) === String(id)) || e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (memoryEvents[idx].scope === 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty-wide events are read-only' });
    }

    memoryEvents[idx] = { ...memoryEvents[idx], ...updates, updatedAt: new Date() };
    return res.json({ success: true, message: 'Event updated successfully', data: memoryEvents[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update academic event', error: error.message });
  }
};

// 4. Delete Department Event (HOD Authorized)
exports.deleteAcademicEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (getStatus()) {
      const existing = await AcademicEvent.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      if (existing.scope === 'faculty') {
        return res.status(403).json({ success: false, message: 'Faculty-wide events cannot be deleted' });
      }

      await AcademicEvent.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Event deleted successfully' });
    }

    const idx = memoryEvents.findIndex((e) => (e._id && String(e._id) === String(id)) || e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (memoryEvents[idx].scope === 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty-wide events cannot be deleted' });
    }

    memoryEvents.splice(idx, 1);
    return res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete academic event', error: error.message });
  }
};
