import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../src/services/api.js';
import FormSubmissionPanel from './FormSubmissionPanel.jsx';
import { WORKFLOW_INFO, resolveWorkflowType, defaultExtras, validateSubmission, buildPayload, prefillFromProcess } from './formSubmission.js';
import './faculty_forms.css';

// Trilingual University Emblem SVG
export const UniversityEmblem = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto 4px auto' }}>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#000000" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="41" fill="none" stroke="#000000" strokeWidth="1" strokeDasharray="2,2" />
    <path d="M 50,18 L 50,11 M 42,21 L 37,15 M 58,21 L 63,15 M 35,26 L 29,22 M 65,26 L 71,22" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M 33,32 L 67,32 C 67,52 50,68 50,68 C 50,68 33,52 33,32 Z" fill="#ffffff" stroke="#000000" strokeWidth="2" />
    <path d="M 38,44 C 44,42 49,45 50,47 C 51,45 56,42 62,44 L 62,56 C 56,54 51,57 50,59 C 49,57 44,54 38,56 Z" fill="none" stroke="#000" strokeWidth="1.6" />
    <line x1="50" y1="47" x2="50" y2="59" stroke="#000" strokeWidth="1.5" />
    <path d="M 23,45 C 21,58 29,74 50,81 C 71,74 79,58 77,45" fill="none" stroke="#000000" strokeWidth="2" />
    <path d="M 30,81 L 50,77 L 70,81 L 65,85 L 35,85 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

// Authoritative SEUSL Faculty Forms Specification Catalog
export const OFFICIAL_FORMS = [
  {
    _id: 'form_piv_001',
    formId: 'SEU-PIV-VOUCHER',
    name: 'Pay In Voucher (PIV)',
    officialTitle: "PEOPLE'S BANK — ADDALAICHENAI BRANCH: PAY IN VOUCHER (PIV) — SEUSL",
    issuingDivision: "People's Bank / University Bursar",
    category: 'Finance & Fees',
    version: '2026.1',
    description: 'Official SEUSL 3-part bank pay-in slip (Bank Copy, Bursar Copy, Student Copy) for all cash fee deposits to the university account at People’s Bank.',
    purpose: 'Standard payment instrument for Repeat Examination Fees, Medical Excuse Submission Penalties, Re-scrutinization Fees, and Transcript Issuance.',
    whoShouldUse: 'All students making official financial remittances to South Eastern University of Sri Lanka.',
    whenToUse: 'Prior to submitting repeat examination forms, re-scrutiny appeals, or late medical certificates.',
    eligibility: 'Open to all enrolled undergraduate and postgraduate students across all faculties.',
    submissionLocation: "Any branch of People's Bank (Credited to A/C No: 228 1001 9000 1704, Addalaichenai Branch)",
    feeDetails: 'Repeat Exam: Rs. 100/subject or Rs. 400 for 4+ subjects; Re-scrutinization: Rs. 500/subject; Medical penalty: As determined.',
    requiredDocuments: [
      'Original Bank Pink Student Slip stamped with teller seal',
      'Affixed copy attached to corresponding faculty application'
    ],
    approvalRequirements: [
      'Signature of Depositor',
      'Bank Teller & Authorized Officer Stamp and Endorsement'
    ],
    instructions: [
      'Print the official 3-copy PIV form or obtain a pre-printed slip from the student counter.',
      'Fill your Full Name, Registration Number, Faculty of Technology, and exact payment purpose.',
      'Enter amount in figures (Rs. 400/=) and amount in words (Rupees Four Hundred Only).',
      'Deposit cash at any People’s Bank branch islandwide to SEUSL Account 228 1001 9000 1704.',
      'Retain Student Pink Copy and affix Bursar Copy to your faculty application.'
    ]
  },
  {
    _id: 'form_exam_001',
    formId: 'SEU-EX-ESA-REP',
    name: 'ESA Application - Application for Examination (End Semester)',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — EXAMINATIONS DIVISION: APPLICATION FOR EXAMINATION',
    issuingDivision: 'Examinations Division',
    category: 'Examination',
    version: '2026.1',
    description: 'Official 2-page unified Examination Application Form (Page 1: Part I Candidate particulars 01-13, 12-row applied subjects schedule, attempt count; Page 2: 14 Fees paid, PIV voucher affix attachment box, candidate declaration & signature, Part II Subject In-charge & SAR verification, Part III Deputy Registrar/Exams approval).',
    purpose: 'Comprehensive university examination registration for Fresh and Repeat candidates for End Semester Examinations.',
    whoShouldUse: 'Undergraduate candidates (FT, FAS, FE, FMC, FIA, FAC) appearing for End Semester Examinations.',
    whenToUse: 'During the official examination registration period announced by the Examinations Division.',
    eligibility: 'Must be an enrolled student with requisite attendance (minimum 80%) and coursework completion.',
    submissionLocation: 'Examinations Division / Administrative Complex, SEUSL',
    feeDetails: 'Repeat Candidates: Rs. 100 per subject or Rs. 400 for 4 or more subjects. Fresh candidates: Free.',
    requiredDocuments: [
      "Affixed copy of People's Bank Pay In Voucher (PIV) for repeat fees",
      'Completed 2-Page Application for Examination with Student Signature'
    ],
    approvalRequirements: [
      'Signature of Candidate',
      'Signature of Head of Department for applied subjects',
      'Signature of Subject in-charge and Senior Assistant Registrar (Part II)',
      'Approval of Deputy Registrar / Examinations (Part III)'
    ],
    instructions: [
      'Part I: Enter candidate particulars (01 Name with Initials, 02 Reg No, 03 Batch, 04 Faculty, 05 Medium, 06 Semester, 07 Candidate Type, 08 Year of Exam, 09 Specialization, 10 Address, 11 Mobile).',
      'Item 12: List all course units/subjects applied with Subject Code and Subject Title.',
      'Item 13 & 14: Enter attempt count and fee details.',
      'Affix your bank PIV voucher slip securely in the designated box on Page 2.',
      'Obtain Head of Department signature and submit to Examinations Division before deadline.'
    ]
  },
  {
    _id: 'form_exam_000',
    formId: 'SEU-EX-FORM',
    name: 'Examination Form',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — EXAMINATIONS DIVISION: EXAMINATION FORM (ADMISSION TO THE EXAMINATION)',
    issuingDivision: 'Examinations Division / Dean Office Admission (Examination Section)',
    category: 'Examination',
    version: '2026.1',
    description: 'Examination Form submitted online to your assigned lecturer. It is reviewed by the Lecturer, approved by the HOD, verified by the SAR and checked by the Examination Branch. The SAR then issues the Dean Office Admission (Examination Section) and prepares the Copy to Senate.',
    purpose: 'Registers the candidate for the examination and leads to the official Dean Office Admission.',
    whoShouldUse: 'Undergraduate candidates appearing for the End Semester Examination.',
    whenToUse: 'During the examination form submission window announced by the SAR.',
    eligibility: 'Enrolled student with the required attendance (minimum 80%).',
    submissionLocation: 'Submitted online to the assigned lecturer through SEUConnect',
    feeDetails: 'No fee is collected with this form.',
    requiredDocuments: ['Completed Examination Form'],
    approvalRequirements: ['Lecturer approval', 'HOD approval', 'SAR administrative verification', 'Examination Branch checks'],
    instructions: [
      'Check your particulars and the list of subjects you will sit.',
      'Select the lecturer who coordinates your subjects.',
      'Press Submit. The form travels Lecturer, HOD, SAR, then the Examination Branch.',
      'Track every step under Track Applications; your admission appears there once issued.'
    ]
  },
  {
    _id: 'form_exam_002',
    formId: 'SEU-EX-CA-REP',
    name: 'Application for Examination (Continuous Assessment) (Repeat Candidates only)',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — APPLICATION FOR EXAMINATION (CONTINUOUS ASSESSMENT) (REPEAT CANDIDATES ONLY)',
    issuingDivision: 'Examinations Division / Office of Assistant Registrar',
    category: 'Examination',
    version: '2026.1',
    description: 'Official application form for repeat candidates resitting Continuous Assessment (CA) components in Faculty of Technology degrees.',
    purpose: 'Allows students with failed or incomplete continuous assessment components to repeat assignments, quizzes, or mid-semester exams.',
    whoShouldUse: 'Undergraduate students with pending or failed CA marks in semester subjects.',
    whenToUse: 'At the start of the semester in which the respective course unit is offered.',
    eligibility: 'Active registered undergraduate student eligible under faculty examination by-laws.',
    submissionLocation: 'Examination Division / Faculty Academic Coordinator, SEUSL',
    feeDetails: 'Repeat fee of Rs. 100 per credit or subject as gazetted.',
    requiredDocuments: [
      'Bank PIV deposit slip confirming payment of repeat CA fee',
      'Previous CA performance statement or transcript excerpt'
    ],
    approvalRequirements: [
      'Candidate Signature',
      'Lecturer in Charge verification of syllabus alignment',
      'Head of Department recommendation',
      'Assistant Registrar approval'
    ],
    instructions: [
      'Complete Section 1 to 9 with your student profile and subject particulars.',
      'Verify CA repeat eligibility with your course coordinator.',
      'Make payment at People’s Bank and staple pink slip.',
      'Submit to Assistant Registrar / Technology Faculty Office before deadline.'
    ]
  },
  {
    _id: 'form_med_001',
    formId: 'SEU-MED-ABSENT',
    name: 'Medical Submission Form',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — OFFICE OF THE DEAN, FACULTY OF TECHNOLOGY: MEDICAL SUBMISSION FORM',
    issuingDivision: 'Office of the Dean, Faculty of Technology',
    category: 'Medical / Attendance',
    version: '2026.1',
    description: 'Official 2-page unified Medical Submission Form (Front: Details of Applicant, Subject, Leave Dates, Reason for Absence, 8 Requested Subjects; Back: Office Use, Head of Department Recommendation, Dean’s Office Forwarding).',
    purpose: 'Formal submission of medical certificates to cover absence from compulsory lectures, continuous assessments, or final exams.',
    whoShouldUse: 'All Faculty of Technology students absent due to verified illness or clinical emergency.',
    whenToUse: 'Within 7 calendar days after expiration of medical leave (or within 48 hours notice for final exams).',
    eligibility: 'Must be verified by a University Medical Officer (UMC) or a Government Hospital DMO.',
    submissionLocation: 'Office of the Dean / Head of Department, Faculty of Technology, SEUSL',
    feeDetails: 'Free within 7 days; Late submission requires special Senate condonation.',
    requiredDocuments: [
      'Original Medical Certificate (UMC endorsed or Government DMO sealed)',
      'Completed 2-Page Medical Submission Form signed by student'
    ],
    approvalRequirements: [
      'Student Signature',
      'Head of Department Recommendation & Stamp',
      'Dean of Faculty Final Endorsement'
    ],
    instructions: [
      'Section 1: Applicant Details (Name, Reg No, Index, Repeat/Fresh candidate checkbox, Department, Postal Address).',
      'Section 2: Check box for Subject (Attendance for Lecture, End Semester Exam, CA, or Other).',
      'Section 3 & 4: Enter Leave Dates (From / To) and statement of illness.',
      'Section 5: Complete up to 8 affected subject codes and subject titles.',
      'Print and sign, attach doctor slip, and deliver to Faculty Office.'
    ]
  },
  {
    _id: 'form_med_002',
    formId: 'SEU-ICT-MED-LEC',
    name: 'Medical Submission Form - Absent for Lectures (Dept of ICT)',
    officialTitle: 'DEPARTMENT OF INFORMATION AND COMMUNICATION TECHNOLOGY — MEDICAL SUBMISSION FORM: ABSENT FOR LECTURES',
    issuingDivision: 'Department of ICT, Faculty of Technology',
    category: 'Medical / Attendance',
    version: '2026.1',
    description: 'Departmental medical submission form specifically customized for BICT students in the Department of ICT to document absence from lectures and practicals.',
    purpose: 'Protects the 80% lecture and lab attendance requirement for End Semester Exam eligibility.',
    whoShouldUse: 'All BICT undergraduate students absent from ICT lectures or practical sessions.',
    whenToUse: 'Immediately upon returning to classes following certified illness.',
    eligibility: 'Registered BICT student with valid medical proof.',
    submissionLocation: 'Department of ICT Office, Technology Building, SEUSL',
    feeDetails: 'No charge.',
    requiredDocuments: [
      'UMC Health Centre confirmation slip',
      'Medical Submission Form signed with dates'
    ],
    approvalRequirements: [
      'Signature of Head of Department of ICT & Official Department Seal'
    ],
    instructions: [
      'Enter your Admission Year, Reg No, Year/Semester, and Contact Number.',
      'List the specific ICT module codes and dates missed.',
      'Sign and date the form.',
      'Submit to Department of ICT clerical coordinator for recording into SEUConnect.'
    ]
  },
  {
    _id: 'form_exam_003',
    formId: 'SEU-EX-RESCRUTINY',
    name: 'Application for re-scrutinization of Marks & Grades',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — EXAMINATIONS DIVISION: APPLICATION FOR RE-SCRUTINIZATION OF MARKS & GRADES',
    issuingDivision: 'Examinations Division',
    category: 'Examination',
    version: 'CC/No 078 of 09/04/2012',
    description: 'Official application for verification and re-scrutinization of examination marks and grades under Senate regulations (CC/No 078 of 09/04/2012).',
    purpose: 'Enables students to request official marks verification, recounting, and grade audit for semester examinations.',
    whoShouldUse: 'Undergraduate candidates disputing published provisional examination results.',
    whenToUse: 'Within 14 calendar days from the official date of publication of exam results.',
    eligibility: 'Must have sat for the specific examination paper in the recently concluded semester.',
    submissionLocation: 'Examinations Division, Administrative Complex, SEUSL',
    feeDetails: 'Non-refundable re-scrutiny fee of Rs. 500 per subject / course unit via People’s Bank PIV voucher.',
    requiredDocuments: [
      'Original People’s Bank PIV deposit slip confirming payment of Rs. 500 per subject',
      'Photocopy of Provisional Results Sheet signed by SAR/Exams'
    ],
    approvalRequirements: [
      'Candidate Signature',
      'Senior Assistant Registrar / Examinations verification',
      'Senate Results Re-scrutiny Committee endorsement'
    ],
    instructions: [
      'Pay Rs. 500 per course unit at People’s Bank Addalaichenai Account 228 1001 9000 1704.',
      'Enter your Reg No, Index No, Year of Examination, Subject Code, and Grade Received.',
      'Attach bank receipt and submit to Examinations Division within 2 weeks of results release.'
    ]
  },
  {
    _id: 'form_acad_001',
    formId: 'SEU-EMAIL-REQ',
    name: 'Official Email Request Form',
    officialTitle: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA — OFFICIAL EMAIL REQUEST FORM',
    issuingDivision: 'ICT Center, SEUSL',
    category: 'Academic / Registration',
    version: '2026.1',
    description: 'Official institutional email account issuance form for students, lecturers, and faculty staff to obtain an @seu.ac.lk email address.',
    purpose: 'Issuance and activation of student institutional email ID for SEU LMS access, Microsoft 365, and university correspondence.',
    whoShouldUse: 'Newly enrolled or continuing undergraduate students needing an institutional email ID.',
    whenToUse: 'Upon initial enrollment or when requesting email reactivation / credential reissue.',
    eligibility: 'Registered student of South Eastern University of Sri Lanka with active university ID.',
    submissionLocation: 'ICT Center / Department Office, SEUSL',
    feeDetails: 'Free of charge.',
    requiredDocuments: [
      'University Student Identity Card copy or Faculty Admission Letter'
    ],
    approvalRequirements: [
      'Signature of Applicant',
      'Recommendation by Head of Department',
      'Dean of Faculty Approval',
      'Issuance by Coordinator, ICT Center'
    ],
    instructions: [
      'Complete applicant information in CAPITAL letters.',
      'Specify preferred username prefix (e.g. 22ict085).',
      'Provide your active WhatsApp number and personal email for credential delivery.',
      'Submit to Department Office or upload to SEUConnect.'
    ]
  }
];

export default function FacultyForms({ user, activeSubTab = 'forms_all', onNavigate, resubmitProcess = null, onResubmitDone }) {
  // Determine initial category filter based on activeSubTab prop
  const getInitialCategory = () => {
    if (activeSubTab === 'forms_exam') return 'Examination';
    if (activeSubTab === 'forms_medical') return 'Medical / Attendance';
    if (activeSubTab === 'forms_piv' || activeSubTab === 'forms_finance') return 'Finance & Fees';
    if (activeSubTab === 'forms_academic') return 'Academic / Registration';
    return 'All';
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'spec' | 'fill'
  const [selectedForm, setSelectedForm] = useState(() => {
    if (activeSubTab === 'forms_piv') {
      return OFFICIAL_FORMS.find(f => f.formId === 'SEU-PIV-VOUCHER') || OFFICIAL_FORMS[0];
    }
    return null;
  });

  // Keep category in sync when activeSubTab changes from sidebar
  useEffect(() => {
    if (activeSubTab === 'forms_exam') {
      setSelectedCategory('Examination');
      setViewMode('list');
    } else if (activeSubTab === 'forms_medical') {
      setSelectedCategory('Medical / Attendance');
      setViewMode('list');
    } else if (activeSubTab === 'forms_piv' || activeSubTab === 'forms_finance') {
      setSelectedCategory('Finance & Fees');
      setViewMode('list');
    } else if (activeSubTab === 'forms_academic') {
      setSelectedCategory('Academic / Registration');
      setViewMode('list');
    } else if (activeSubTab === 'forms_all' || activeSubTab === 'faculty_forms') {
      setSelectedCategory('All');
      setViewMode('list');
    }
  }, [activeSubTab]);

  // Student default particulars
  const studentName = user?.name || 'M.N.M. Afnan';
  const studentRegNo = user?.regNo || '22ICT085';
  const studentIndexNo = user?.indexNo || 'ICT22085';
  const studentProgramme = user?.programme || 'BICT';
  const studentDept = user?.department || 'Department of Information and Communication Technology';
  const studentSemester = user?.semester || 'Semester 05';
  const studentSpecialization = user?.specialization || 'Software Systems';
  const studentEmail = user?.email || '22ict085@seu.ac.lk';
  const studentPhone = user?.phone || '+94 77 1234567';

  // Helper to parse Sri Lankan University segmented registration number (e.g. SEU/IS/22/ICT/085)
  const parseRegParts = (regNo = '') => {
    const raw = String(regNo || '').trim();
    const parts = raw.split(/[\/\-_]/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 5) {
      return { p1: parts[0], p2: parts[1], p3: parts[2], p4: parts[3], p5: parts[4] };
    }
    const match = raw.match(/^(?:(SEU)[-\/]?([A-Z]+)[-\/]?)?(\d{2})[-\/]?([A-Z]+)[-\/]?(\d+)$/i);
    if (match) {
      return {
        p1: match[1] || 'SEU',
        p2: match[2] || 'IS',
        p3: match[3] || '22',
        p4: match[4] || 'ICT',
        p5: match[5] || '085'
      };
    }
    return { p1: 'SEU', p2: 'IS', p3: '22', p4: 'ICT', p5: '085' };
  };

  const initialParts = parseRegParts(studentRegNo);

  // Interactive Form Editor State
  const [formData, setFormData] = useState(() => ({
    name: studentName,
    registrationNumber: studentRegNo,
    candidateTitle: 'Mr.',
    regPart1: initialParts.p1,
    regPart2: initialParts.p2,
    regPart3: initialParts.p3,
    regPart4: initialParts.p4,
    regPart5: initialParts.p5,
    indexNumber: studentIndexNo,
    degreeProgramme: studentProgramme,
    department: studentDept,
    currentSemester: studentSemester,
    specialization: studentSpecialization,
    personalEmail: studentEmail,
    phone: studentPhone,
    address: 'Technology Hostel, Faculty of Technology, SEUSL, Oluvil',
    applicationDate: new Date().toISOString().split('T')[0],
    
    // Exam specific matching physical paper form
    examBatch: '2021/2022',
    examFaculty: 'FT',
    examMedium: 'English',
    examSemester: '1st',
    examAppliedFor: 'Repeat',
    examYear: 'Third Year',
    examAttempts: '1',
    examFeesPaid: '400',
    examNameYear: 'Third Year Examination in Technology - Semester I - 2025/2026',
    pivVoucherImage: null,
    pivVoucherFileName: '',
    candidateSignatureImage: null,
    candidateSignatureFileName: '',
    examSubjects: [
      { sno: '01', code: 'ICT21013', title: 'Data Structures and Algorithms' },
      { sno: '02', code: 'ICT21023', title: 'Database Management Systems' },
      { sno: '03', code: 'ICT21032', title: 'Computer Networks' },
      { sno: '04', code: 'ICT22011', title: 'Web Application Development' },
      { sno: '05', code: '', title: '' },
      { sno: '06', code: '', title: '' },
      { sno: '07', code: '', title: '' },
      { sno: '08', code: '', title: '' },
      { sno: '09', code: '', title: '' },
      { sno: '10', code: '', title: '' },
      { sno: '11', code: '', title: '' },
      { sno: '12', code: '', title: '' }
    ],

    // Medical specific
    medicalCandidateType: 'Fresh',
    medicalSubjectType: 'Attendance for the Lecture',
    medicalReason: 'Diagnosed with acute viral fever with clinical rest certified by Medical Officer.',
    leaveFrom: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    leaveTo: new Date().toISOString().split('T')[0],
    medicalSubjectsList: [
      { sno: 1, code: 'ICT31012', title: 'Advanced Software Engineering' },
      { sno: 2, code: 'ICT31023', title: 'Mobile Application Development' },
      { sno: 3, code: 'ICT31033', title: 'Cloud Computing Architecture' },
      { sno: 4, code: '', title: '' },
      { sno: 5, code: '', title: '' },
      { sno: 6, code: '', title: '' },
      { sno: 7, code: '', title: '' },
      { sno: 8, code: '', title: '' }
    ],

    // PIV specific
    pivPurpose: 'Repeat Examination Fee',
    pivCategory: 'Examination Fee',
    pivAmount: '400',
    amountWords: 'Rupees Four Hundred Only',
    pivCourse: 'Bachelor of Information and Communication Technology (BICT)',
    pivAccountNo: '228 1001 9000 1704',
    pivBankBranch: "People's Bank, Addalaichenai Branch",
    receiptNo: 'PB-SEU-849201',

    // Email request specific
    preferredEmailPrefix: studentRegNo.toLowerCase(),
    emailPurpose: 'Academic coursework, LMS access, official faculty correspondence, and exam indexing',
    whatsappNo: studentPhone,

    // Rescrutiny specific
    rescrutinyCode: 'ICT22011',
    rescrutinyTitle: 'Web Application Development',
    gradeReceived: 'C-',
    signatureName: studentName
  }));

  const pivFileInputRef = useRef(null);
  const sigFileInputRef = useRef(null);

  // Handle live uploading of PIV voucher image
  const handlePivUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      setFormData((prev) => ({
        ...prev,
        pivVoucherImage: dataUrl,
        pivVoucherFileName: file.name
      }));
      setExtras((prev) => ({
        ...prev,
        receipt: {
          name: file.name,
          mime: file.type || 'image/jpeg',
          size: file.size,
          dataUrl: dataUrl
        },
        payment: {
          ...prev.payment,
          voucherNo: prev.payment.voucherNo || `PIV-${Date.now().toString().slice(-6)}`,
          amount: prev.payment.amount || String(formData.examFeesPaid || '400')
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePiv = () => {
    setFormData((prev) => ({
      ...prev,
      pivVoucherImage: null,
      pivVoucherFileName: ''
    }));
    setExtras((prev) => ({
      ...prev,
      receipt: null
    }));
    if (pivFileInputRef.current) pivFileInputRef.current.value = '';
  };

  // Handle live uploading of Candidate Handwritten Signature image
  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setFormData((prev) => ({
        ...prev,
        candidateSignatureImage: loadEvt.target.result,
        candidateSignatureFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setFormData((prev) => ({
      ...prev,
      candidateSignatureImage: null,
      candidateSignatureFileName: ''
    }));
    if (sigFileInputRef.current) sigFileInputRef.current.value = '';
  };

  // Synchronize segmented registration number parts
  const handleRegPartChange = (partKey, val) => {
    const cleaned = val.toUpperCase().replace(/\s+/g, '');
    setFormData((prev) => {
      const currentParts = {
        p1: prev.regPart1 || parseRegParts(prev.registrationNumber).p1,
        p2: prev.regPart2 || parseRegParts(prev.registrationNumber).p2,
        p3: prev.regPart3 || parseRegParts(prev.registrationNumber).p3,
        p4: prev.regPart4 || parseRegParts(prev.registrationNumber).p4,
        p5: prev.regPart5 || parseRegParts(prev.registrationNumber).p5,
        [partKey]: cleaned
      };
      const formatted = `${currentParts.p1}/${currentParts.p2}/${currentParts.p3}/${currentParts.p4}/${currentParts.p5}`;
      return {
        ...prev,
        [partKey]: cleaned,
        registrationNumber: formatted
      };
    });
  };

  const handleExamSubjectChange = (index, field, value) => {
    setFormData((prev) => {
      const nextSubjects = (prev.examSubjects || []).map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
      return { ...prev, examSubjects: nextSubjects };
    });
  };

  // Auto-calculate repeat exam fee per SEUSL Examinations Division rule:
  // "Payment: Rs. 100/- per subject for Four (04) and more subject Rs. 400/-"
  useEffect(() => {
    if (formData.examAppliedFor === 'Fresh') {
      if (formData.examFeesPaid !== '0') {
        setFormData((prev) => ({ ...prev, examFeesPaid: '0' }));
      }
      return;
    }
    const filledCount = (formData.examSubjects || []).filter((s) => s.code?.trim() || s.title?.trim()).length;
    let fee = '0';
    if (filledCount === 1) fee = '100';
    else if (filledCount === 2) fee = '200';
    else if (filledCount === 3) fee = '300';
    else if (filledCount >= 4) fee = '400';

    if (formData.examFeesPaid !== fee) {
      setFormData((prev) => ({ ...prev, examFeesPaid: fee }));
    }
  }, [formData.examAppliedFor, formData.examSubjects]);

  // ---- Online submission (students only) ----
  const isStudent = String(user?.role || user?.roleKey || 'student').toLowerCase() === 'student';
  const [extras, setExtras] = useState(defaultExtras);
  const [availability, setAvailability] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const workflowType = selectedForm ? resolveWorkflowType(selectedForm.formId, formData) : null;

  useEffect(() => {
    if (!isStudent) return;
    api.getFormAvailability().then((res) => setAvailability(res.data)).catch(() => {});
  }, [isStudent]);

  // Opening a returned application pre-fills the matching form so the student can correct it.
  useEffect(() => {
    if (!resubmitProcess) return;
    const formIdByType = {
      eca_application: 'SEU-EX-CA-REP',
      esa_application: 'SEU-EX-ESA-REP',
      exam_form: 'SEU-EX-FORM',
      subject_medical: 'SEU-ICT-MED-LEC',
      exam_medical: 'SEU-MED-ABSENT',
    };
    const form = OFFICIAL_FORMS.find((f) => f.formId === formIdByType[resubmitProcess.type]);
    if (!form) return;
    setSelectedForm(form);
    setFormData((prev) => {
      const next = prefillFromProcess(resubmitProcess, prev);
      if (resubmitProcess.type === 'exam_medical') next.medicalSubjectType = 'End Semester Examination';
      return next;
    });
    const receipt = resubmitProcess.paymentReceipt;
    setExtras((prev) => ({
      ...prev,
      payment: receipt?.voucherNo
        ? { ...prev.payment, voucherNo: receipt.voucherNo, amount: String(receipt.amount || ''), date: String(receipt.date || prev.payment.date).slice(0, 10) }
        : prev.payment,
      lecturerEmail: resubmitProcess.assignedLecturer?.email || prev.lecturerEmail,
    }));
    setSubmitResult(null);
    setSubmitError('');
    setViewMode('fill');
  }, [resubmitProcess]);

  const handleSubmit = async () => {
    setSubmitError('');
    if (!isStudent) {
      setSubmitError('Only students can submit forms.');
      return;
    }
    // A corrected application may keep the receipt that is already on file.
    const keepsReceipt = Boolean(resubmitProcess?.paymentReceipt?.hasFile) && !extras.receipt;
    const problem = validateSubmission(workflowType, formData, keepsReceipt ? { ...extras, receipt: { existing: true } } : extras);
    if (problem) {
      setSubmitError(problem);
      document.querySelector('.seu-submit-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload(workflowType, formData, extras, selectedForm.name);
      if (keepsReceipt) delete payload.receipt;
      const res = resubmitProcess ? await api.resubmitProcess(resubmitProcess.trackingNumber, payload) : await api.createProcess(payload);
      setSubmitResult(res.data);
      onResubmitDone?.();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Examination', 'Medical / Attendance', 'Finance & Fees', 'Academic / Registration'];

  // Filter forms based on search and selected category
  const filteredForms = useMemo(() => {
    return OFFICIAL_FORMS.filter(form => {
      const matchCategory = selectedCategory === 'All' || form.category === selectedCategory;
      const matchSearch = !searchQuery.trim() ||
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.formId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.issuingDivision.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handlers
  const handleOpenSpec = (form) => {
    setSelectedForm(form);
    setViewMode('spec');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFiller = (form) => {
    setSubmitResult(null);
    setSubmitError('');
    setExtras(defaultExtras());
    setSelectedForm(form);
    setViewMode('fill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCopy = () => {
    const summary = `
======================================================================
SOUTH EASTERN UNIVERSITY OF SRI LANKA — FACULTY OF TECHNOLOGY
OFFICIAL APPLICATION SUBMISSION RECORD: ${selectedForm.name}
Reference: ${selectedForm.formId}
Generated Date: ${new Date().toLocaleString()}
======================================================================

APPLICANT PARTICULARS:
- Full Name: ${formData.name}
- Registration No: ${formData.registrationNumber}
- Index No: ${formData.indexNumber}
- Degree Programme: ${formData.degreeProgramme}
- Department: ${formData.department}
- Current Semester: ${formData.currentSemester}
- Contact Phone: ${formData.phone}
- Email: ${formData.personalEmail}

FORM DETAILS:
- Form Code: ${selectedForm.formId}
- Category: ${selectedForm.category}
- Issuing Office: ${selectedForm.issuingDivision}
- Submission Target: ${selectedForm.submissionLocation}
- Application Date: ${formData.applicationDate}
${selectedForm.formId === 'SEU-PIV-VOUCHER' ? `
BANKING DETAILS:
- Bank: People's Bank, Addalaichenai Branch
- University A/C: 228 1001 9000 1704
- Purpose: ${formData.pivPurpose}
- Amount: Rs. ${formData.pivAmount}/= (${formData.amountWords})
` : ''}
${selectedForm.formId.includes('EX') ? `
EXAMINATION SCHEDULE:
- Applied For: ${formData.examAppliedFor}
- Semester: ${formData.examSemester}
- Amount Paid: Rs. ${formData.examFeesPaid}/=
` : ''}

Note: Present this completed official document with attached original bank PIV slips to the faculty office.
======================================================================
`;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedForm.formId}_${formData.registrationNumber}_Submission.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper for category badge styling
  const getBadgeClass = (category) => {
    if (category === 'Examination') return 'badge-exam';
    if (category === 'Medical / Attendance') return 'badge-med';
    if (category === 'Finance & Fees') return 'badge-finance';
    return 'badge-academic';
  };

  // Render Printable Document Template
  const renderPrintableDocument = () => {
    if (!selectedForm) return null;

    switch (selectedForm.formId) {
      // 1. PEOPLE'S BANK PIV VOUCHER (3-Copy Slip)
      case 'SEU-PIV-VOUCHER':
        return (
          <div className="printable-document">
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.03em' }}>
                PEOPLE'S BANK — ADDALAICHENAI BRANCH
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '3px 0' }}>
                PAY IN VOUCHER (PIV) — SOUTH EASTERN UNIVERSITY OF SRI LANKA
              </div>
              <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>
                Account No: 228 1001 9000 1704 · Oluvil / Addalaichenai
              </div>
            </div>

            <div className="piv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
              {['BANK COPY', 'BURSAR COPY', 'STUDENT COPY'].map((copyName, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1.5px solid #000',
                    padding: '10px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '440px',
                    backgroundColor: idx === 2 ? '#fff9fa' : '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                      {copyName}
                    </div>
                    <div style={{ lineHeight: 1.75 }}>
                      <div>Date: <strong>{formData.applicationDate}</strong></div>
                      <div>Depositor: <strong>{formData.name.toUpperCase()}</strong></div>
                      <div>Reg No: <strong>{formData.registrationNumber.toUpperCase()}</strong></div>
                      <div>Course: <strong>{formData.pivCourse || 'BICT (Faculty of Tech)'}</strong></div>
                      <div>Faculty: <strong>Faculty of Technology</strong></div>
                      <div>Purpose: <strong>{formData.pivPurpose || 'Repeat Exam / Medical Fees'}</strong></div>
                      <div>A/C No: <strong>228 1001 9000 1704</strong></div>
                      
                      <div style={{ marginTop: '10px', borderTop: '1px solid #999', paddingTop: '6px' }}>
                        Amount in Figures:{' '}
                        <strong style={{ fontSize: '0.92rem' }}>
                          Rs. {formData.pivAmount || '400'}/=
                        </strong>
                      </div>
                      <div style={{ fontStyle: 'italic', fontSize: '0.74rem', marginTop: '2px' }}>
                        ({formData.amountWords || 'Rupees Four Hundred Only'})
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.76rem', fontStyle: 'italic', borderBottom: '1px dotted #000', width: '80%', textAlign: 'center', paddingBottom: '2px' }}>
                        {formData.signatureName || formData.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>
                        Signature of Depositor
                      </div>
                    </div>

                    <div style={{ border: '1px solid #000', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.7rem', color: '#666' }}>
                      Bank Branch Official Teller Stamp & Signature
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 2. MEDICAL SUBMISSION FORM (2-Page Official Format)
      case 'SEU-MED-ABSENT':
      case 'SEU-ICT-MED-LEC':
        return (
          <div className="printable-document">
            {/* Page 1: Student Particulars */}
            <div className="printable-page-block">
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <UniversityEmblem size={55} />
                <div style={{ fontSize: '0.98rem', fontWeight: 'bold', lineHeight: 1.25 }}>ශ්‍රී ලංකා අග්නිදිග විශ්වවිද්‍යාලය</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', lineHeight: 1.25 }}>இலங்கை தென்கிழக்குப் பல்கலைக்கழகம்</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 'bold', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                  SOUTH EASTERN UNIVERSITY OF SRI LANKA
                </div>
                <div style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', height: '3px', margin: '6px 0 8px 0' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 'bold', letterSpacing: '0.03em' }}>
                  OFFICE OF THE DEAN, FACULTY OF TECHNOLOGY
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 'bold', textDecoration: 'underline', marginTop: '6px', letterSpacing: '0.04em' }}>
                  MEDICAL SUBMISSION FORM
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', marginTop: '12px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.82rem', marginBottom: '3px' }}>1. Details of the Applicant:</div>
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ width: '42%', fontWeight: 600 }}>Name</td>
                        <td><strong>{formData.name.toUpperCase()}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Registration Number</td>
                        <td><strong>{formData.registrationNumber.toUpperCase()}</strong></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Index Number</td>
                        <td>{formData.indexNumber.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Candidate Type</td>
                        <td>
                          <span style={{ marginRight: '14px' }}>[{formData.medicalCandidateType === 'Repeat' ? '✓' : ' '}] Repeat</span>
                          <span>[{formData.medicalCandidateType === 'Fresh' ? '✓' : ' '}] Fresh</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Department</td>
                        <td>{formData.department}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Postal Address</td>
                        <td style={{ fontSize: '0.78rem' }}>{formData.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.82rem', marginBottom: '3px' }}>2. Subject (Please ✓ one):</div>
                  <table>
                    <tbody>
                      <tr>
                        <td>Attendance for the Lecture</td>
                        <td style={{ textAlign: 'center', width: '38px', fontWeight: 'bold' }}>
                          {formData.medicalSubjectType === 'Attendance for the Lecture' ? '✓' : ''}
                        </td>
                      </tr>
                      <tr>
                        <td>End Semester Examination</td>
                        <td style={{ textAlign: 'center', width: '38px', fontWeight: 'bold' }}>
                          {formData.medicalSubjectType === 'End Semester Examination' ? '✓' : ''}
                        </td>
                      </tr>
                      <tr>
                        <td>Continuous Assessment (CA)</td>
                        <td style={{ textAlign: 'center', width: '38px', fontWeight: 'bold' }}>
                          {formData.medicalSubjectType === 'Continuous Assessment (CA)' ? '✓' : ''}
                        </td>
                      </tr>
                      <tr>
                        <td>Other (Specify)</td>
                        <td style={{ textAlign: 'center', width: '38px', fontWeight: 'bold' }}>
                          {formData.medicalSubjectType.includes('Other') ? '✓' : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '0.82rem' }}>
                  <strong>3. Dates of Medical Leave:</strong>
                  <div style={{ marginTop: '4px' }}>
                    From: <strong>{formData.leaveFrom}</strong> &nbsp; To: <strong>{formData.leaveTo}</strong>
                  </div>
                </div>
                <div style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '0.82rem' }}>
                  <strong>4. Reason for Absence:</strong>
                  <div style={{ marginTop: '2px', fontSize: '0.78rem' }}>{formData.medicalReason}</div>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.82rem', marginBottom: '3px' }}>5. Requested Subject/s:</div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>S.No</th>
                      <th style={{ width: '130px' }}>Subject Code</th>
                      <th>Subject Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.medicalSubjectsList.map((sub, i) => (
                      <tr key={i} style={{ height: '24px' }}>
                        <td style={{ textAlign: 'center' }}>{sub.sno}</td>
                        <td style={{ fontWeight: 600, paddingLeft: '8px' }}>{sub.code}</td>
                        <td style={{ paddingLeft: '8px' }}>{sub.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '22px' }}>
                <div style={{ fontSize: '0.82rem' }}>
                  Date: <strong>{formData.applicationDate}</strong>
                </div>
                <div style={{ textAlign: 'center', minWidth: '180px' }}>
                  <div style={{ fontStyle: 'italic', borderBottom: '1px dotted #000', paddingBottom: '2px' }}>
                    {formData.signatureName || formData.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>Signature of the Student</div>
                </div>
              </div>
            </div>

            <div className="print-divider" />

            {/* Page 2: Office & HoD Recommendation */}
            <div className="printable-page-block">
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.92rem', marginBottom: '12px', letterSpacing: '0.04em' }}>
                (FOR OFFICE USE ONLY / FACULTY RECOMMENDATIONS)
              </div>
              <div style={{ border: '1px solid #000', padding: '12px', minHeight: '120px', marginBottom: '14px', fontSize: '0.82rem' }}>
                <strong>Recommendation of the Head of Department:</strong>
                <div style={{ margin: '8px 0', minHeight: '40px', color: '#444' }}>
                  Verified with attendance logs. Recommended for medical excuse recording.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div>Date: .......................................</div>
                  <div>Signature of Head of Department & Official Stamp</div>
                </div>
              </div>

              <div style={{ border: '1px solid #000', padding: '12px', minHeight: '120px', fontSize: '0.82rem' }}>
                <strong>Endorsement by the Dean, Faculty of Technology:</strong>
                <div style={{ margin: '8px 0', minHeight: '40px', color: '#444' }}>
                  Approved under University Medical Examination Regulations.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div>Date: .......................................</div>
                  <div>Signature of the Dean / Senior Assistant Registrar</div>
                </div>
              </div>
            </div>
          </div>
        );

      // 3. APPLICATION FOR EXAMINATION (Exact Physical Paper Layout - Page 1 & Page 2)
      case 'SEU-EX-ESA-REP':
      case 'SEU-EX-CA-REP':
      case 'SEU-EX-FORM':
      default: {
        const regP = {
          p1: formData.regPart1 || parseRegParts(formData.registrationNumber).p1,
          p2: formData.regPart2 || parseRegParts(formData.registrationNumber).p2,
          p3: formData.regPart3 || parseRegParts(formData.registrationNumber).p3,
          p4: formData.regPart4 || parseRegParts(formData.registrationNumber).p4,
          p5: formData.regPart5 || parseRegParts(formData.registrationNumber).p5,
        };

        const subjects12 = formData.examSubjects && formData.examSubjects.length >= 12
          ? formData.examSubjects.slice(0, 12)
          : [...(formData.examSubjects || []), ...Array(12).fill(null)].slice(0, 12).map((s, idx) => s || { sno: String(idx + 1).padStart(2, '0'), code: '', title: '' });

        return (
          <div className="printable-document exam-form-container">
            {/* ========================================================
                PAGE 1 (PART - I: CANDIDATE APPLICATION & SUBJECT SCHEDULE)
                ======================================================== */}
            <div className="printable-page-block exam-page-1">
              {/* Header Grid: Crest + Centered Titles + Office Use Only Box */}
              <div className="exam-header-grid">
                <div style={{ width: '65px', flexShrink: 0 }}>
                  <UniversityEmblem size={55} />
                </div>

                <div style={{ textAlign: 'center', flexGrow: 1, padding: '0 8px' }}>
                  <div style={{ fontSize: '1.02rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    SOUTH EASTERN UNIVERSITY OF SRI LANKA
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.05em', marginTop: '1px' }}>
                    EXAMINATIONS DIVISION
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, textDecoration: 'underline', marginTop: '2px', letterSpacing: '0.04em' }}>
                    APPLICATION FOR EXAMINATION
                  </div>
                  <div style={{ fontSize: '0.74rem', fontStyle: 'italic', marginTop: '3px' }}>
                    (This form should be completed in BLOCK CAPITAL letters &amp; Tick &#10003; appropriate box)
                  </div>
                </div>

                <div className="exam-office-box">
                  <div className="exam-office-box-title">OFFICE USE ONLY</div>
                  <div className="exam-office-box-content"></div>
                </div>
              </div>

              {/* PART - I Header */}
              <div style={{ fontWeight: 800, fontSize: '0.92rem', margin: '4px 0 6px 0', letterSpacing: '0.03em' }}>
                PART - I
              </div>

              {/* 01. Name with initials */}
              <div style={{ display: 'flex', border: '1px solid #000', marginBottom: '5px' }}>
                <div style={{ borderRight: '1px solid #000', padding: '3px 8px', fontWeight: 600, width: '150px', flexShrink: 0, fontSize: '0.84rem' }}>
                  01. Name with initials:
                </div>
                <div style={{ display: 'flex', borderRight: '1px solid #000', flexShrink: 0 }}>
                  <div style={{ borderRight: '1px solid #000', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{formData.candidateTitle === 'Mr.' ? '✓' : ''}</span> Mr.
                  </div>
                  <div style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{formData.candidateTitle === 'Ms.' ? '✓' : ''}</span> Ms.
                  </div>
                </div>
                <div style={{ padding: '3px 8px', flexGrow: 1, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.86rem', letterSpacing: '0.04em' }}>
                  {formData.name}
                </div>
              </div>

              {/* 02. Registration No (Segmented Boxes) */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '150px', fontWeight: 600, flexShrink: 0, fontSize: '0.84rem' }}>
                  02. Registration No:
                </div>
                <div className="exam-reg-grid">
                  <div className="exam-reg-seg">{regP.p1 || 'SEU'}</div>
                  <div className="exam-reg-seg">{regP.p2 || 'IS'}</div>
                  <div className="exam-reg-seg">{regP.p3 || '22'}</div>
                  <div className="exam-reg-seg">{regP.p4 || 'ICT'}</div>
                  <div className="exam-reg-seg" style={{ minWidth: '55px' }}>{regP.p5 || '085'}</div>
                </div>
              </div>

              {/* 03. Current Batch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                  03. Current Batch (If transferred to others batch indicate intake academic year):
                </div>
                <div style={{ border: '1px solid #000', padding: '3px 14px', minWidth: '130px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.86rem' }}>
                  {formData.examBatch || '2021 / 2022'}
                </div>
              </div>

              {/* 04 - 07: Faculty, Medium, Semester, Applied for */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap', margin: '4px 0 6px 0' }}>
                {/* 04. Faculty */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '2px' }}>04. Faculty:</div>
                  <table className="exam-tick-table">
                    <thead>
                      <tr>
                        <th>FAC</th>
                        <th>FE</th>
                        <th>FIA</th>
                        <th>FMC</th>
                        <th>FT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formData.examFaculty === 'FAC' ? '✓' : ''}</td>
                        <td>{formData.examFaculty === 'FE' ? '✓' : ''}</td>
                        <td>{formData.examFaculty === 'FIA' ? '✓' : ''}</td>
                        <td>{formData.examFaculty === 'FMC' ? '✓' : ''}</td>
                        <td>{formData.examFaculty === 'FT' || !formData.examFaculty ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 05. Medium */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '2px' }}>05. Medium:</div>
                  <table className="exam-tick-table">
                    <thead>
                      <tr>
                        <th>English</th>
                        <th>Tamil</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formData.examMedium === 'English' || !formData.examMedium ? '✓' : ''}</td>
                        <td>{formData.examMedium === 'Tamil' ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 06. Semester */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '2px' }}>06. Semester:</div>
                  <table className="exam-tick-table">
                    <thead>
                      <tr>
                        <th>1st</th>
                        <th>2nd</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formData.examSemester === '1st' || formData.examSemester === 'I' || !formData.examSemester ? '✓' : ''}</td>
                        <td>{formData.examSemester === '2nd' || formData.examSemester === 'II' ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 07. Applied for */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '2px' }}>07. Applied for:</div>
                  <table className="exam-tick-table">
                    <thead>
                      <tr>
                        <th>Fresh</th>
                        <th>Repeat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formData.examAppliedFor === 'Fresh' ? '✓' : ''}</td>
                        <td>{formData.examAppliedFor === 'Repeat' || !formData.examAppliedFor ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 08. Year of Examinations */}
              <div style={{ margin: '4px 0 6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>08. Year of Examinations:</span>
                  <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: '#333' }}>(Use Separate form each year)</span>
                </div>
                <table className="exam-tick-table" style={{ width: '100%', maxWidth: '520px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>First Year</th>
                      <th style={{ width: '25%' }}>Second Year</th>
                      <th style={{ width: '25%' }}>Third Year</th>
                      <th style={{ width: '25%' }}>Fourth Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{formData.examYear === 'First Year' ? '✓' : ''}</td>
                      <td>{formData.examYear === 'Second Year' ? '✓' : ''}</td>
                      <td>{formData.examYear === 'Third Year' || !formData.examYear ? '✓' : ''}</td>
                      <td>{formData.examYear === 'Fourth Year' ? '✓' : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 09. Field of Specialization */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '210px', fontWeight: 600, flexShrink: 0, fontSize: '0.84rem' }}>
                  09. Field of Specialization (if any):
                </div>
                <div style={{ border: '1px solid #000', padding: '3px 8px', flexGrow: 1, fontSize: '0.84rem' }}>
                  {formData.specialization || 'Software Systems'}
                </div>
              </div>

              {/* 10. Present Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '5px' }}>
                <div style={{ width: '210px', fontWeight: 600, flexShrink: 0, fontSize: '0.84rem', paddingTop: '3px' }}>
                  10. Present Address:
                </div>
                <div style={{ border: '1px solid #000', padding: '4px 8px', flexGrow: 1, minHeight: '36px', fontSize: '0.82rem' }}>
                  {formData.address}
                </div>
              </div>

              {/* 11. Contact Mobile No. */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '210px', fontWeight: 600, flexShrink: 0, fontSize: '0.84rem' }}>
                  11. Contact Mobile No.
                </div>
                <div style={{ border: '1px solid #000', padding: '3px 8px', width: '260px', fontSize: '0.84rem', fontWeight: 600 }}>
                  {formData.phone}
                </div>
              </div>

              {/* 12. Applied Subjects (Exact 12 Rows Table) */}
              <div style={{ margin: '6px 0 4px 0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>
                  12. Applied Subjects:
                </div>
                <table className="exam-subjects-grid">
                  <thead>
                    <tr>
                      <th style={{ width: '38px' }}>S.No</th>
                      <th style={{ width: '170px' }}>Subject Code (Specify clearly)</th>
                      <th>Subject Title</th>
                      <th style={{ width: '180px' }}>Signature of Head of Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects12.map((sub, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{String(idx + 1).padStart(2, '0')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '0.04em' }}>{sub.code || ''}</td>
                        <td style={{ paddingLeft: '8px' }}>{sub.title || ''}</td>
                        <td style={{ textAlign: 'center', fontSize: '0.72rem', color: '#777' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 13. Repeat candidates please state No. of attempts completed */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 10px 0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                  13. Repeat candidates please state No. of attempts completed
                </div>
                <div style={{ border: '1px solid #000', padding: '3px 18px', minWidth: '70px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  {formData.examAttempts || '1'}
                </div>
              </div>

              {/* Footnote */}
              <div style={{ fontSize: '0.73rem', lineHeight: 1.35, marginTop: '8px', borderTop: '0.5px solid #ccc', paddingTop: '4px' }}>
                <div><strong>Note:</strong></div>
                <div>
                  Please note that a Candidate is eligible for 3 consecutive attempts irrespective of whether a candidate appears
                  for a schedule examinations or not, after completion of course work. Each scheduled examination will be
                  counted as an exhausted attempt.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#555', marginTop: '6px' }}>
                <div>D:\NAZAR MHMIEXAMS\Formats\App. of Exam</div>
                <div style={{ fontWeight: 'bold' }}>(P.T.O)</div>
              </div>
            </div>

            <div className="print-divider" />

            {/* ========================================================
                PAGE 2 (P.T.O / REVERSE SIDE: FEES, PIV AFFIX, DECLARATION & APPROVALS)
                ======================================================== */}
            <div className="printable-page-block">
              {/* Centered Page Number */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px' }}>
                02
              </div>

              {/* 14. Fees paid by Repeat Candidate */}
              <div style={{ fontSize: '0.84rem', lineHeight: 1.45, marginBottom: '8px' }}>
                <div>
                  <strong>14. Fees paid by Repeat Candidate of Rs. </strong>
                  <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px', padding: '0 8px', fontWeight: 'bold', textAlign: 'center' }}>
                    {formData.examAppliedFor === 'Fresh' ? 'N/A (Fresh Candidate)' : `${formData.examFeesPaid || '400'}/=`}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#222' }}>
                  (Please affix a copy of paying in Voucher as proof of the payment of examination fees)
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                  Payment: Rs. 100/- per subject for Four (04) and more subject Rs. 400/-
                </div>
              </div>

              {/* Dedicated Box: A copy of PIV should be affix here */}
              <div className="piv-affix-box">
                {formData.pivVoucherImage ? (
                  <>
                    <img
                      src={formData.pivVoucherImage}
                      alt="Affixed PIV Slip"
                      className="piv-preview-img"
                    />
                    <div className="piv-actions-bar no-print">
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#15803d' }}>
                        ✓ PIV Voucher Affixed: {formData.pivVoucherFileName || 'piv_voucher.png'}
                      </span>
                      <button
                        type="button"
                        className="sig-upload-btn-sm"
                        onClick={() => pivFileInputRef.current?.click()}
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        className="sig-clear-btn-sm"
                        onClick={handleRemovePiv}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="piv-watermark-text">
                      A copy of PIV should be affix here
                    </div>
                    <div className="piv-upload-prompt no-print">
                      <button
                        type="button"
                        className="piv-upload-btn"
                        onClick={() => pivFileInputRef.current?.click()}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload / Affix PIV Voucher Image
                      </button>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Supported formats: PNG, JPG, JPEG, PDF (max 5 MB)
                      </span>
                    </div>
                  </>
                )}
                {/* Hidden input for PIV */}
                <input
                  type="file"
                  ref={pivFileInputRef}
                  accept="image/png,image/jpeg,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handlePivUpload}
                />
              </div>

              {/* Candidate Declaration */}
              <div style={{ fontSize: '0.84rem', margin: '14px 0 10px 0', fontWeight: 500 }}>
                The above details are given by me true and correct according to my knowledge.
              </div>

              {/* Date & Signature Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.84rem' }}>
                  Date: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '160px', padding: '0 8px', fontWeight: 600 }}>{formData.applicationDate}</span>
                </div>

                <div className="exam-sig-container">
                  <div className="exam-sig-display-area">
                    {formData.candidateSignatureImage ? (
                      <img
                        src={formData.candidateSignatureImage}
                        alt="Candidate Signature"
                        className="sig-preview-img"
                      />
                    ) : (
                      <span className="sig-script-fallback">
                        {formData.name || studentName}
                      </span>
                    )}
                  </div>
                  <div style={{ borderBottom: '1px dotted #000', width: '100%', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Signature of Candidate</div>

                  {/* Candidate Signature Upload Button (no-print) */}
                  <div className="no-print" style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="sig-upload-btn-sm"
                      onClick={() => sigFileInputRef.current?.click()}
                    >
                      {formData.candidateSignatureImage ? 'Change Signature' : 'Upload Signature'}
                    </button>
                    {formData.candidateSignatureImage && (
                      <button
                        type="button"
                        className="sig-clear-btn-sm"
                        onClick={handleRemoveSignature}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={sigFileInputRef}
                    accept="image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={handleSignatureUpload}
                  />
                </div>
              </div>

              {/* Divider Line */}
              <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0 10px 0' }} />

              {/* Part - II */}
              <div style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em' }}>Part - II</div>
              <div style={{ fontSize: '0.82rem', margin: '2px 0 16px 0', fontStyle: 'italic' }}>
                Particulars from 01 - 14 are checked with me and found correct
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1.4fr', gap: '15px', alignItems: 'flex-end', fontSize: '0.82rem', marginBottom: '8px' }}>
                <div>
                  <div style={{ borderBottom: '1px dotted #000', height: '35px', marginBottom: '4px' }}></div>
                  <div style={{ fontWeight: 600 }}>Signature of Subject in-charge</div>
                  <div style={{ marginTop: '8px' }}>
                    Dept. of <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '170px' }}>{formData.department ? formData.department.replace('Department of ', '') : ''}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginTop: '35px' }}>
                    Date: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '90px' }}></span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ borderBottom: '1px dotted #000', height: '35px', marginBottom: '4px' }}></div>
                  <div style={{ fontWeight: 600 }}>Senior Asst. Registrar</div>
                  <div style={{ marginTop: '8px' }}>
                    Faculty of <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '140px', textAlign: 'center', fontWeight: 'bold' }}>Technology</span>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '16px 0 10px 0' }} />

              {/* Part - III */}
              <div style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em' }}>Part - III</div>
              <div style={{ fontSize: '0.82rem', margin: '2px 0 16px 0' }}>
                Please register / do not register the candidate for the examination
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div>
                  Date: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '140px' }}></span>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <div style={{ borderBottom: '1px dotted #000', height: '35px', marginBottom: '4px' }}></div>
                  <div style={{ fontWeight: 600 }}>Deputy Registrar/ Examinations</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '22px', fontSize: '0.68rem', color: '#666' }}>
                <div>D:\NAZAR MHMIEXAMS\Formats\App. of Exam</div>
                <div>(P.T.O)</div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="seu-forms-container">
      {/* ====================================================================
          1. VIEW MODE: FORMS DIRECTORY / CATALOG
          ==================================================================== */}
      {viewMode === 'list' && (
        <>
          {/* Header */}
          <div className="seu-forms-header">
            <h1>Faculty Forms &amp; Official Instructions</h1>
            <p>Authoritative university forms, bank vouchers, and departmental submission templates for the Faculty of Technology.</p>
          </div>

          {/* Search & Filter Card */}
          <div className="seu-forms-toolbar">
            <div className="seu-forms-search-box">
              <span className="seu-forms-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                className="seu-forms-search-input"
                placeholder="Search forms by name, purpose, or issuing office..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="seu-forms-status-bar">
              <div className="seu-forms-active-cat-indicator">
                <span className="seu-forms-cat-dot"></span>
                <span>Active Filter: <strong>{selectedCategory === 'All' ? 'All Forms & Circulars' : selectedCategory}</strong></span>
              </div>
              <div className="seu-forms-count-badge">
                Showing <strong>{filteredForms.length}</strong> official form{filteredForms.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Forms Grid */}
          <div className="seu-forms-grid">
            {filteredForms.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No forms found matching your search criteria.
              </div>
            ) : (
              filteredForms.map((form) => (
                <div key={form.formId} className="seu-form-card">
                  <div>
                    <div className="seu-form-card-header">
                      <span className={`seu-badge ${getBadgeClass(form.category)}`}>
                        {form.category}
                      </span>
                      <span className="seu-ref-tag">Ref: {form.formId}</span>
                    </div>

                    <h3 className="seu-form-card-title">{form.name}</h3>
                    <p className="seu-form-card-desc">{form.description}</p>

                    <div className="seu-form-card-meta">
                      <div className="seu-form-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Office: <strong>{form.submissionLocation}</strong></span>
                      </div>
                      <div className="seu-form-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>Attachments: <strong>{form.requiredDocuments.length} required item(s)</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="seu-form-card-actions">
                    <button
                      type="button"
                      className="seu-btn-secondary-sm"
                      onClick={() => handleOpenSpec(form)}
                    >
                      Specifications
                    </button>
                    <button
                      type="button"
                      className="seu-btn-primary-sm"
                      onClick={() => handleOpenFiller(form)}
                    >
                      <span>Fill &amp; Print</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ====================================================================
          2. VIEW MODE: FORM SPECIFICATION & INSTRUCTIONS
          ==================================================================== */}
      {viewMode === 'spec' && selectedForm && (
        <div className="seu-spec-layout">
          <button
            type="button"
            className="seu-back-btn"
            onClick={() => setViewMode('list')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Forms Directory
          </button>

          {/* Hero Spec Card */}
          <div className="seu-spec-hero">
            <div className="seu-spec-hero-info">
              <div className="seu-spec-tags">
                <span className={`seu-badge ${getBadgeClass(selectedForm.category)}`}>
                  {selectedForm.category}
                </span>
                <span className="seu-ref-tag">Ref: {selectedForm.formId}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Version {selectedForm.version}</span>
              </div>
              <h1>{selectedForm.name}</h1>
              <div className="seu-spec-authority">
                Issuing Authority: <strong>{selectedForm.issuingDivision}</strong>
              </div>
            </div>

            <button
              type="button"
              className="seu-btn-primary-sm"
              style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
              onClick={() => handleOpenFiller(selectedForm)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Fill, Submit &amp; Download Form
            </button>
          </div>

          {/* 2-Column Spec Details */}
          <div className="seu-spec-grid">
            <div className="seu-spec-panel">
              <h3 className="seu-spec-panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Purpose &amp; Eligibility
              </h3>

              <div className="seu-spec-field">
                <strong>Purpose of this Form:</strong>
                <p>{selectedForm.purpose}</p>
              </div>

              <div className="seu-spec-field">
                <strong>Who Should Complete This?</strong>
                <p>{selectedForm.whoShouldUse}</p>
              </div>

              <div className="seu-spec-field">
                <strong>When Should It Be Used?</strong>
                <p>{selectedForm.whenToUse}</p>
              </div>

              <div className="seu-spec-field">
                <strong>Eligibility Criteria:</strong>
                <p>{selectedForm.eligibility}</p>
              </div>
            </div>

            <div className="seu-spec-panel">
              <h3 className="seu-spec-panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Submission &amp; Approvals
              </h3>

              <div className="seu-spec-field">
                <strong>Submission Office:</strong>
                <p>{selectedForm.submissionLocation}</p>
              </div>

              <div className="seu-spec-field">
                <strong>Fee / Bank Remittance:</strong>
                <p>{selectedForm.feeDetails || 'Free of charge'}</p>
              </div>

              <div className="seu-spec-field">
                <strong>Required Attachments:</strong>
                <ul className="seu-spec-list">
                  {selectedForm.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="seu-spec-field">
                <strong>Official Endorsements:</strong>
                <ul className="seu-spec-list">
                  {selectedForm.approvalRequirements.map((appr, idx) => (
                    <li key={idx}>{appr}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Procedure Steps */}
          <div className="seu-spec-panel">
            <h3 className="seu-spec-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Step-by-Step Filing Instructions
            </h3>
            <ol className="seu-spec-list" style={{ marginLeft: '1.4rem' }}>
              {selectedForm.instructions.map((inst, idx) => (
                <li key={idx} style={{ marginBottom: '0.6rem', lineHeight: 1.5 }}>
                  {inst}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ====================================================================
          3. VIEW MODE: INTERACTIVE FORM FILLER & LIVE PRINTABLE PREVIEW
          ==================================================================== */}
      {viewMode === 'fill' && selectedForm && (
        <div className="seu-filler-layout">
          {/* Top Sticky Toolbar */}
          <div className="seu-filler-toolbar">
            <div className="seu-filler-toolbar-left">
              <button
                type="button"
                className="seu-back-btn"
                onClick={() => setViewMode('spec')}
              >
                &larr; Back to Specifications
              </button>
              <span className={`seu-badge ${getBadgeClass(selectedForm.category)}`}>
                Ref: {selectedForm.formId}
              </span>
            </div>

            <div className="seu-filler-toolbar-right">
              <button
                type="button"
                className="seu-btn-secondary-sm"
                onClick={handleDownloadCopy}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Data (.txt)
              </button>
              {isStudent && workflowType && !submitResult && (
                <button
                  type="button"
                  className="seu-btn-primary-sm seu-btn-submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                  title={`Submit this ${WORKFLOW_INFO[workflowType].label} online to ${WORKFLOW_INFO[workflowType].submitTo}`}
                >
                  {submitting ? 'Submitting…' : resubmitProcess ? 'Resubmit' : 'Submit'}
                </button>
              )}
              <button
                type="button"
                className="seu-btn-primary-sm"
                onClick={handlePrint}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Interactive Input Form Panel */}
          <div className="seu-editor-panel no-print">
            <h3 className="seu-editor-panel-title">
              <span>1. Complete / Verify Application Particulars</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>
                Values auto-sync into official printable template below
              </span>
            </h3>

            <div className="seu-editor-grid">
              <div className="seu-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="seu-form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>

              <div className="seu-form-group">
                <label>Index Number</label>
                <input
                  type="text"
                  value={formData.indexNumber}
                  onChange={(e) => setFormData({ ...formData, indexNumber: e.target.value })}
                />
              </div>

              <div className="seu-form-group">
                <label>Department / Faculty</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="seu-form-group">
                <label>Contact Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="seu-form-group">
                <label>Submission Date</label>
                <input
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                />
              </div>

              {/* Form Specific Extra Inputs */}
              {(selectedForm.formId === 'SEU-EX-FORM' || selectedForm.formId === 'SEU-EX-ESA-REP' || selectedForm.formId === 'SEU-EX-CA-REP') && (
                <>
                  <div className="seu-form-group">
                    <label>Title (01. Name with Initials)</label>
                    <select
                      value={formData.candidateTitle || 'Mr.'}
                      onChange={(e) => setFormData({ ...formData, candidateTitle: e.target.value })}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>03. Current Batch (Academic Year)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2021 / 2022"
                      value={formData.examBatch}
                      onChange={(e) => setFormData({ ...formData, examBatch: e.target.value })}
                    />
                  </div>

                  <div className="seu-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>02. Segmented Registration Number (SEU / IS / Batch / Dept / Roll No)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Univ</span>
                        <input
                          type="text"
                          value={formData.regPart1 || 'SEU'}
                          onChange={(e) => handleRegPartChange('regPart1', e.target.value)}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Type</span>
                        <input
                          type="text"
                          value={formData.regPart2 || 'IS'}
                          onChange={(e) => handleRegPartChange('regPart2', e.target.value)}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Intake Year</span>
                        <input
                          type="text"
                          value={formData.regPart3 || '22'}
                          onChange={(e) => handleRegPartChange('regPart3', e.target.value)}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Department</span>
                        <input
                          type="text"
                          value={formData.regPart4 || 'ICT'}
                          onChange={(e) => handleRegPartChange('regPart4', e.target.value)}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Student No</span>
                        <input
                          type="text"
                          value={formData.regPart5 || '085'}
                          onChange={(e) => handleRegPartChange('regPart5', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="seu-form-group">
                    <label>04. Faculty</label>
                    <select
                      value={formData.examFaculty || 'FT'}
                      onChange={(e) => setFormData({ ...formData, examFaculty: e.target.value })}
                    >
                      <option value="FT">FT — Faculty of Technology</option>
                      <option value="FAC">FAC — Faculty of Applied Sciences</option>
                      <option value="FE">FE — Faculty of Engineering</option>
                      <option value="FIA">FIA — Faculty of Islamic Studies &amp; Arabic</option>
                      <option value="FMC">FMC — Faculty of Management &amp; Commerce</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>05. Medium of Instruction</label>
                    <select
                      value={formData.examMedium || 'English'}
                      onChange={(e) => setFormData({ ...formData, examMedium: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>06. Semester</label>
                    <select
                      value={formData.examSemester || '1st'}
                      onChange={(e) => setFormData({ ...formData, examSemester: e.target.value })}
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>07. Applied For</label>
                    <select
                      value={formData.examAppliedFor || 'Repeat'}
                      onChange={(e) => setFormData({ ...formData, examAppliedFor: e.target.value })}
                    >
                      <option value="Repeat">Repeat Candidate</option>
                      <option value="Fresh">Fresh Candidate</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>08. Year of Examinations</label>
                    <select
                      value={formData.examYear || 'Third Year'}
                      onChange={(e) => setFormData({ ...formData, examYear: e.target.value })}
                    >
                      <option value="First Year">First Year</option>
                      <option value="Second Year">Second Year</option>
                      <option value="Third Year">Third Year</option>
                      <option value="Fourth Year">Fourth Year</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>09. Field of Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Systems / Network Systems"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>

                  <div className="seu-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>10. Present Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="seu-form-group">
                    <label>13. Repeat Candidates: No. of attempts completed</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={formData.examAttempts}
                      onChange={(e) => setFormData({ ...formData, examAttempts: e.target.value })}
                    />
                  </div>

                  <div className="seu-form-group">
                    <label>14. Repeat Examination Fee (Rs.)</label>
                    <input
                      type="text"
                      value={formData.examFeesPaid}
                      onChange={(e) => setFormData({ ...formData, examFeesPaid: e.target.value })}
                      placeholder="Rs. 100/subject (4+ subjects Rs. 400)"
                    />
                  </div>

                  {/* Upload PIV Slip & Upload Signature Cards */}
                  <div className="seu-form-group" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* PIV Slip Upload */}
                      <div>
                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px', color: '#1e3a8a' }}>
                          Upload A copy of PIV Voucher (Affixes to Page 2)
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 8px 0' }}>
                          Proof of examination payment. PNG, JPG or PDF (max 5 MB).
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,application/pdf"
                            onChange={handlePivUpload}
                            style={{ fontSize: '0.82rem' }}
                          />
                          {formData.pivVoucherImage && (
                            <button
                              type="button"
                              className="sig-clear-btn-sm"
                              onClick={handleRemovePiv}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {formData.pivVoucherImage && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={formData.pivVoucherImage}
                              alt="PIV Slip Preview"
                              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                              ✓ Affixed: {formData.pivVoucherFileName || 'piv_voucher.png'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Signature Upload */}
                      <div>
                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px', color: '#0f766e' }}>
                          Upload Candidate Signature Image (Page 2)
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 8px 0' }}>
                          Scanned or handwritten signature image. PNG or JPG.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleSignatureUpload}
                            style={{ fontSize: '0.82rem' }}
                          />
                          {formData.candidateSignatureImage && (
                            <button
                              type="button"
                              className="sig-clear-btn-sm"
                              onClick={handleRemoveSignature}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {formData.candidateSignatureImage && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={formData.candidateSignatureImage}
                              alt="Signature Preview"
                              style={{ height: '36px', maxWidth: '100px', objectFit: 'contain', border: '1px solid #cbd5e1', padding: '2px', background: '#fff' }}
                            />
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                              ✓ Attached: {formData.candidateSignatureFileName || 'signature.png'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 12 Applied Subjects Inline Table Editor */}
                  <div className="seu-form-group" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontWeight: 700 }}>12. Applied Subjects Schedule (Up to 12 Course Units)</label>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Row 01 - 12 auto-update on physical examination paper
                      </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                          <th style={{ width: '38px', padding: '5px 8px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '160px', padding: '5px 8px', textAlign: 'left' }}>Subject Code</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left' }}>Subject Title</th>
                          <th style={{ width: '45px', padding: '5px 8px', textAlign: 'center' }}>Clear</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.examSubjects || []).map((sub, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                              {String(i + 1).padStart(2, '0')}
                            </td>
                            <td style={{ padding: '3px 6px' }}>
                              <input
                                type="text"
                                placeholder={`ICT${20 + i}012`}
                                value={sub.code}
                                onChange={(e) => handleExamSubjectChange(i, 'code', e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                              />
                            </td>
                            <td style={{ padding: '3px 6px' }}>
                              <input
                                type="text"
                                placeholder={`Course unit ${i + 1} name`}
                                value={sub.title}
                                onChange={(e) => handleExamSubjectChange(i, 'title', e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {(sub.code || sub.title) ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExamSubjectChange(i, 'code', '');
                                    handleExamSubjectChange(i, 'title', '');
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                                  title="Clear row"
                                >
                                  &times;
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {selectedForm.formId.includes('MED') && (
                <>
                  <div className="seu-form-group">
                    <label>Medical Absence Category</label>
                    <select
                      value={formData.medicalSubjectType}
                      onChange={(e) => setFormData({ ...formData, medicalSubjectType: e.target.value })}
                    >
                      <option value="Attendance for the Lecture">Attendance for the Lecture</option>
                      <option value="End Semester Examination">End Semester Examination</option>
                      <option value="Continuous Assessment (CA)">Continuous Assessment (CA)</option>
                    </select>
                  </div>

                  <div className="seu-form-group">
                    <label>Medical Leave Range</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="date"
                        value={formData.leaveFrom}
                        onChange={(e) => setFormData({ ...formData, leaveFrom: e.target.value })}
                      />
                      <input
                        type="date"
                        value={formData.leaveTo}
                        onChange={(e) => setFormData({ ...formData, leaveTo: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isStudent && workflowType && (
            <FormSubmissionPanel
              type={workflowType}
              user={user}
              formData={formData}
              setFormData={setFormData}
              extras={extras}
              setExtras={setExtras}
              availability={availability}
              submitting={submitting}
              error={submitError}
              result={submitResult}
              isResubmit={Boolean(resubmitProcess)}
              onSubmit={handleSubmit}
              onTrack={() => onNavigate?.('track_applications')}
            />
          )}

          {/* Official Printable Preview Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }} className="no-print">
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              2. Official Document Preview (Formatted for Standard A4 Paper)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click "Print / Save as PDF" above to generate signed official copy
            </span>
          </div>

          {/* Live Rendered University Document */}
          {renderPrintableDocument()}
        </div>
      )}
    </div>
  );
}

