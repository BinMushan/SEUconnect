import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { getCurriculumBySemester } from '../../../src/services/curriculumData.js';

const safeToFixed = (val, decimals = 2, fallback = '0.00') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

export const getStudentTempPassword = (student) => {
  if (student?.tempPassword) return student.tempPassword;
  if (!student?.regNo) return 'Seu@2024Pass';
  const parts = student.regNo.split('/');
  if (parts.length >= 4) {
    const yr = parts[2] || '24';
    const dept = parts[3] || 'ICT';
    const num = parts[4] || '001';
    return `Seu@${yr}${dept}${num}`;
  }
  return `Seu@${student.regNo.replace(/[^a-zA-Z0-9]/g, '')}`;
};

export const matchesBatchStudent = (s, batch) => {
  if (!s || !batch) return false;

  // 1. Exact or normalized batchId match (e.g. 'BATCH-01' === 'BATCH-01' or 'BATCH-1' === 'BATCH-01')
  if (s.batchId && batch.id) {
    if (s.batchId === batch.id) return true;
    const sNum = String(s.batchId).replace(/[^0-9]/g, '');
    const bNum = String(batch.id).replace(/[^0-9]/g, '');
    if (sNum && bNum && parseInt(sNum, 10) === parseInt(bNum, 10)) return true;
  }

  // 2. Batch code match (e.g. 'B01', 'B02', 'B05')
  if (batch.code) {
    const bCode = String(batch.code).toLowerCase().trim();
    if (s.batchId && String(s.batchId).toLowerCase().trim() === bCode) return true;
    if (s.batchCode && s.batchCode.toLowerCase().includes(bCode)) return true;
  }

  // 3. Batch name / title match (e.g. "Batch 01" in "Batch 01 (2020/2021)")
  if (batch.name) {
    const bName = batch.name.toLowerCase();
    const batchNoMatch = bName.match(/batch\s*0?(\d+)/i);
    const batchNum = batchNoMatch ? parseInt(batchNoMatch[1], 10) : null;

    if (s.batchCode) {
      const sBatchNoMatch = s.batchCode.toLowerCase().match(/batch\s*0?(\d+)/i);
      if (batchNum !== null && sBatchNoMatch && parseInt(sBatchNoMatch[1], 10) === batchNum) {
        return true;
      }
      if (s.batchCode.toLowerCase().includes(bName) || bName.includes(s.batchCode.toLowerCase())) {
        return true;
      }
    }
  }

  // 4. Academic year match (e.g. '2020/2021', '2023/2022', '2024/2025')
  if (batch.academicYear) {
    const bYear = batch.academicYear.trim().toLowerCase();
    if (s.batch && (s.batch.toLowerCase() === bYear || s.batch.toLowerCase().includes(bYear) || bYear.includes(s.batch.toLowerCase()))) {
      return true;
    }
    if (s.academicYear && (s.academicYear.toLowerCase() === bYear || s.academicYear.toLowerCase().includes(bYear) || bYear.includes(s.academicYear.toLowerCase()))) {
      return true;
    }
    if (s.batchCode && s.batchCode.toLowerCase().includes(bYear)) {
      return true;
    }
  }

  // 5. Registration number prefix / year token match
  // RegNo format: SEU/IS/20/ICT/019 or SEU/IS/22/ICT/085 or 20ICT019 or 22ICT085
  if (s.regNo) {
    const reg = s.regNo.toUpperCase();
    if (batch.regPrefix) {
      const prefix = String(batch.regPrefix).trim();
      if (reg.includes(`/${prefix}/`) || reg.startsWith(prefix) || reg.includes(prefix)) {
        return true;
      }
    }
    if (batch.academicYear) {
      const years = batch.academicYear.match(/\d{2,4}/g) || [];
      for (const yr of years) {
        const shortYr = yr.length === 4 ? yr.slice(-2) : yr;
        if (reg.includes(`/${shortYr}/`)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getNextBatchProgression = (batch) => {
  if (!batch) return { type: 'promote', nextSem: 'Semester 2', currentSem: 'Semester 1' };
  const term = String(batch.currentSemester || batch.currentTerm || batch.term || batch.status || '').toLowerCase();
  if (term.includes('graduated') || term.includes('passed out')) {
    return { type: 'passed_out', label: 'Passed Out (Graduated)' };
  }
  if (term.includes('semester 8') || term.includes('sem 8') || term.includes('4th year (sem 2)') || term.includes('4th year sem 2') || term.includes('final year')) {
    return { type: 'pass_out', label: 'Pass Out Batch' };
  }
  const match = term.match(/semester\s*(\d)/i) || term.match(/sem\s*(\d)/i);
  if (match) {
    const semNum = parseInt(match[1], 10);
    if (semNum >= 8) return { type: 'pass_out', label: 'Pass Out Batch' };
    const nextSemNum = semNum + 1;
    const yearNum = Math.ceil(nextSemNum / 2);
    const semInYear = nextSemNum % 2 === 1 ? 1 : 2;
    const suffix = yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th';
    return {
      type: 'promote',
      nextSem: `Semester ${nextSemNum}`,
      nextTerm: `${suffix} Year (Sem ${semInYear})`,
      currentSem: `Semester ${semNum}`
    };
  }
  if (term.includes('1st year') || term.includes('1st') || term.includes('freshers')) {
    return { type: 'promote', nextSem: 'Semester 2', nextTerm: '1st Year (Sem 2)' };
  }
  if (term.includes('2nd year') || term.includes('2nd')) {
    return { type: 'promote', nextSem: 'Semester 4', nextTerm: '2nd Year (Sem 2)' };
  }
  if (term.includes('3rd year') || term.includes('3rd')) {
    return { type: 'promote', nextSem: 'Semester 6', nextTerm: '3rd Year (Sem 2)' };
  }
  if (term.includes('4th year') || term.includes('4th')) {
    return { type: 'pass_out', label: 'Pass Out Batch' };
  }
  return { type: 'promote', nextSem: 'Next Semester', nextTerm: 'Next Term' };
};

export default function StudentManagement({
  batches = [],
  students = [],
  onAddBatch,
  onDeleteBatch,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkAddStudents,
  onUpdateStudentStatus,
  onPromoteBatch,
  onPassOutBatch,
  isAddModalOpen,
  setIsAddModalOpen
}) {
  // Navigation State: null = Batches Overview, object = Drill-down into that Batch
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Cohort Progression & Pass Out Modals
  const [promoteModalBatch, setPromoteModalBatch] = useState(null);
  const [passOutModalBatch, setPassOutModalBatch] = useState(null);

  const handleConfirmPromote = () => {
    if (!promoteModalBatch) return;
    const { batch, progression } = promoteModalBatch;
    if (onPromoteBatch) {
      onPromoteBatch(batch.id, progression.nextSem, null, 'BOTH');
    }
    if (selectedBatch && selectedBatch.id === batch.id) {
      setSelectedBatch((prev) => ({
        ...prev,
        currentSemester: progression.nextSem,
        status: progression.nextSem.includes('Semester 8')
          ? 'Graduating / Finalizing'
          : prev.status?.includes('Freshers')
          ? 'Active'
          : prev.status
      }));
    }
    setPromoteModalBatch(null);
  };

  const handleConfirmPassOut = () => {
    if (!passOutModalBatch) return;
    if (onPassOutBatch) {
      onPassOutBatch(passOutModalBatch.id);
    }
    if (selectedBatch && selectedBatch.id === passOutModalBatch.id) {
      setSelectedBatch((prev) => ({
        ...prev,
        status: 'Passed Out (Graduated)',
        currentSemester: 'Semester 8 (Passed Out)'
      }));
    }
    setPassOutModalBatch(null);
  };

  // Search & Filters for Batches Overview
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Search & Filters for Selected Batch Student Roster
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Student for Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Editing Student Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    regNo: '',
    indexNo: '',
    programme: 'BICT (Hons)',
    department: 'Department of Information & Communication Technology',
    semester: 'Semester 1',
    email: '',
    phone: '',
    tempPassword: '',
    status: 'Active',
    cgpa: 0,
    sgpa: 0,
    attendance: 90,
    welfare: 'Pending Verification',
    specialization: ''
  });

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      regNo: student.regNo || '',
      indexNo: student.indexNo || student.regNo || '',
      programme: student.programme || 'BICT (Hons)',
      department: student.department || 'Department of Information & Communication Technology',
      semester: student.semester || 'Semester 1',
      email: student.email || '',
      phone: student.phone || '',
      tempPassword: student.tempPassword || getStudentTempPassword(student),
      status: student.status || 'Active',
      cgpa: student.cgpa !== undefined ? student.cgpa : 0.00,
      sgpa: student.sgpa !== undefined ? student.sgpa : 0.00,
      attendance: student.attendance !== undefined ? student.attendance : 90,
      welfare: student.welfare || 'Pending Verification',
      specialization: student.specialization || ''
    });
  };

  const handleSaveEditedStudent = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    const updated = {
      ...editingStudent,
      ...editForm,
      cgpa: Number(editForm.cgpa) || 0,
      sgpa: Number(editForm.sgpa) || 0,
      attendance: Number(editForm.attendance) || 0
    };
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    if (selectedStudent && (selectedStudent.id === updated.id || selectedStudent.regNo === updated.regNo)) {
      setSelectedStudent(updated);
    }
    setEditingStudent(null);
  };

  const handleDeleteStudentPrompt = (student) => {
    if (!student) return;
    const confirmMsg = `Are you sure you want to permanently delete student ${student.name} (${student.regNo})?\n\nThis will remove their profile and login account.`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteStudent) {
        onDeleteStudent(student.id || student.regNo);
      }
      if (selectedStudent && (selectedStudent.id === student.id || selectedStudent.regNo === student.regNo)) {
        setSelectedStudent(null);
      }
    }
  };

  const handleDeleteBatchPrompt = (batch) => {
    if (!batch) return;
    const confirmMsg = `Are you sure you want to delete intake batch "${batch.name}"?\n\nThis will remove the batch card from the intake overview.`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteBatch) {
        onDeleteBatch(batch.id);
      }
      if (selectedBatch && selectedBatch.id === batch.id) {
        setSelectedBatch(null);
      }
    }
  };

  // Onboard New Intake Batch Modal State
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchYear, setNewBatchYear] = useState('');
  const [newBatchSemester, setNewBatchSemester] = useState('Semester 1 (Freshers)');
  const [newBatchCoordinator, setNewBatchCoordinator] = useState('');
  const [newBatchCapacity, setNewBatchCapacity] = useState('240');
  const [batchFormError, setBatchFormError] = useState('');

  // Enrolment Modal Tabs & Target Batch
  const [enrollMode, setEnrollMode] = useState('bulk'); // 'single' | 'bulk'
  const [targetBatchId, setTargetBatchId] = useState('');
  const [bulkDeptFilter, setBulkDeptFilter] = useState('ALL'); // 'ALL' | 'BICT' | 'BST'

  // Register New Student Modal State (Individual Registration)
  const [newRegNo, setNewRegNo] = useState('');
  const [newIndexNo, setNewIndexNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newProgramme, setNewProgramme] = useState('BICT (Hons)');
  const [newDepartment, setNewDepartment] = useState('Department of Information & Communication Technology');
  const [newSemester, setNewSemester] = useState('Semester 1');
  const [newEmail, setNewEmail] = useState('');
  const [newTempPassword, setNewTempPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Bulk Enrolment State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedStudents, setBulkParsedStudents] = useState([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');
  const [bulkSearchTerm, setBulkSearchTerm] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Active Target Batch for Modal Operations (default to Freshers intake e.g. Batch 05)
  const defaultBatch = selectedBatch || batches.find((b) => b.status?.includes('Freshers')) || batches[batches.length - 1] || batches[0];
  const activeTargetBatchId = targetBatchId || defaultBatch?.id || 'BATCH-05';
  const activeBatch = batches.find((b) => b.id === activeTargetBatchId) || defaultBatch || {
    id: 'BATCH-05',
    code: 'B05',
    name: 'Batch 05 (2024/2025)',
    academicYear: '2024/2025',
    currentSemester: 'Semester 1 (Freshers)',
    regPrefix: '24'
  };

  const drillProgression = getNextBatchProgression(selectedBatch || activeBatch);

  // Pagination State for Student Roster
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter Batches in Overview
  const filteredBatches = batches.filter((b) => {
    const q = batchSearchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.academicYear.toLowerCase().includes(q) ||
      b.coordinator.toLowerCase().includes(q)
    );
  });

  // Calculate real student counts per batch
  const getBatchStudentCount = (batch) => {
    if (!batch) return 0;
    const matching = students.filter((s) => matchesBatchStudent(s, batch));
    return matching.length;
  };

  // Filter students for the currently selected batch
  const batchStudents = selectedBatch
    ? students.filter((s) => {
        const matchesBatch = matchesBatchStudent(s, selectedBatch);

        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.indexNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === 'ALL' || s.department.includes(deptFilter) || s.programme.includes(deptFilter);
        const matchesSemester = semesterFilter === 'ALL' || s.semester === semesterFilter;
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

        return matchesBatch && matchesSearch && matchesDept && matchesSemester && matchesStatus;
      })
    : [];

  const totalPages = Math.ceil(batchStudents.length / pageSize) || 1;
  const paginatedStudents = batchStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle Onboarding a New Intake Batch
  const handleBatchSubmit = (e) => {
    e.preventDefault();
    if (!newBatchName.trim() || !newBatchCode.trim() || !newBatchYear.trim()) {
      setBatchFormError('Please fill in Batch Name, Intake Code, and Academic Year.');
      return;
    }

    const createdBatch = {
      id: `BATCH-${Date.now()}`,
      code: newBatchCode.trim().toUpperCase(),
      name: newBatchName.trim(),
      academicYear: newBatchYear.trim(),
      currentSemester: newBatchSemester,
      status: 'Active (Freshers)',
      totalStudents: parseInt(newBatchCapacity, 10) || 240,
      coordinator: newBatchCoordinator.trim() || 'Assigned by Faculty Board',
      departments: ['BICT', 'BST'],
      avgCgpa: 0.0,
      attendanceRate: 100,
      enrollmentDate: new Date().toISOString().split('T')[0],
      regPrefix: newBatchCode.trim().slice(-2)
    };

    onAddBatch(createdBatch);

    // Reset Form
    setNewBatchName('');
    setNewBatchCode('');
    setNewBatchYear('');
    setNewBatchCoordinator('');
    setBatchFormError('');
    setIsAddBatchModalOpen(false);
  };

  // Synchronize department when degree programme is toggled
  const handleProgrammeChange = (prog) => {
    setNewProgramme(prog);
    if (prog.includes('BICT')) {
      setNewDepartment('Department of Information & Communication Technology');
    } else if (prog.includes('BST')) {
      setNewDepartment('Department of Bio Systems Technology');
    }
  };

  const handleDepartmentChange = (dept) => {
    setNewDepartment(dept);
    if (dept.includes('Information')) {
      setNewProgramme('BICT (Hons)');
    } else if (dept.includes('Bio')) {
      setNewProgramme('BST (Hons)');
    }
  };

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const csvHeader = 'Registration No,Index No,Full Name,Degree Programme,Department,Starting Semester,University Email,Temporary Password,Mobile\n';
    const sampleRows = [
      'SEU/IS/24/ICT/001,SEU/IS/24/ICT/001,A.B. Perera,BICT (Hons),Department of Information & Communication Technology,Semester 1,seu24ict001@seu.ac.lk,Seu@24ICT001,+94771234567',
      'SEU/IS/24/ICT/002,SEU/IS/24/ICT/002,K.L. Fernando,BICT (Hons),Department of Information & Communication Technology,Semester 1,seu24ict002@seu.ac.lk,Seu@24ICT002,+94772345678',
      'SEU/IS/24/BST/001,SEU/IS/24/BST/001,M.N. Silva,BST (Hons),Department of Bio Systems Technology,Semester 1,seu24bst001@seu.ac.lk,Seu@24BST001,+94713456789',
      'SEU/IS/24/BST/002,SEU/IS/24/BST/002,S.K. Mohamed,BST (Hons),Department of Bio Systems Technology,Semester 1,seu24bst002@seu.ac.lk,Seu@24BST002,+94774567890'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SEU_Faculty_Batch_Enrolment_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1-Click Generator: 240 Students (120 BICT + 120 BST)
  const handleGenerateSampleBatch = () => {
    const currentBatch = activeBatch;
    const prefix = currentBatch.regPrefix || (currentBatch.code ? currentBatch.code.replace(/\D/g, '') : '24');
    const startingSem = currentBatch.currentSemester?.split(' ')[0] || 'Semester 1';

    const ictSurnames = [
      'Perera', 'Silva', 'Fernando', 'Mohamed', 'Bandara', 'Jayawardena', 'Dissanayake', 'Farook',
      'Gunawardena', 'Wickramasinghe', 'Rishad', 'Weerasinghe', 'Herath', 'Seneviratne', 'Karunaratne',
      'Pathirana', 'Fonseka', 'Rajapaksha', 'Cooray', 'Abeysekara', 'Mendis', 'Alahakoon', 'Samarasinghe',
      'Rathnayake', 'Wijesinghe', 'Tennakoon', 'Kumara', 'Hettiarachchi', 'Lokuge', 'Kulasekara'
    ];

    const bstSurnames = [
      'Gamage', 'Amarasinghe', 'Gunathilaka', 'Navaratne', 'Liyanage', 'Senanayake', 'Nawaz', 'Priyantha',
      'De Silva', 'Peiris', 'Ibrahim', 'Ekanayake', 'Chandrasiri', 'Basnayake', 'Samaraweera', 'Dias',
      'Balasuriya', 'Subasinghe', 'Wickramaratne', 'Goonetilleke', 'Rizwan', 'Jiffry', 'Marikkar',
      'Kariyawasam', 'Jayasinghe', 'Aponso', 'Kulatunga', 'Mithraratne', 'Madushanka', 'Thushara'
    ];

    const initialsList = ['A.B.', 'K.L.', 'M.N.', 'S.K.', 'T.R.', 'H.M.', 'R.P.', 'P.S.', 'D.M.', 'W.A.', 'G.V.', 'N.D.'];

    const roster = [];
    const shouldAddBICT = bulkDeptFilter === 'ALL' || bulkDeptFilter === 'BICT';
    const shouldAddBST = bulkDeptFilter === 'ALL' || bulkDeptFilter === 'BST';

    // 120 BICT Students (SEU/IS/YY/ICT/001 to 120)
    if (shouldAddBICT) {
      for (let i = 1; i <= 120; i++) {
        const numStr = String(i).padStart(3, '0');
        const regNo = `SEU/IS/${prefix}/ICT/${numStr}`;
        const name = `${initialsList[i % initialsList.length]} ${ictSurnames[i % ictSurnames.length]}`;
        roster.push({
          id: `BULK-STU-ICT-${prefix}-${numStr}`,
          batchId: currentBatch.id,
          batchCode: currentBatch.name,
          regNo,
          indexNo: regNo,
          name,
          programme: 'BICT (Hons)',
          department: 'Department of Information & Communication Technology',
          semester: startingSem,
          cgpa: 0.00,
          sgpa: 0.00,
          credits: 0,
          attendance: 0,
          email: `seu${prefix}ict${numStr}@seu.ac.lk`,
          tempPassword: `Seu@${prefix}ICT${numStr}`,
          phone: `+94 77 ${Math.floor(1000000 + (i * 71329) % 9000000)}`,
          status: 'Active',
          welfare: 'Pending Verification',
          specialization: 'Software Technology',
          repeatModules: []
        });
      }
    }

    // 120 BST Students (SEU/IS/YY/BST/001 to 120)
    if (shouldAddBST) {
      for (let i = 1; i <= 120; i++) {
        const numStr = String(i).padStart(3, '0');
        const regNo = `SEU/IS/${prefix}/BST/${numStr}`;
        const name = `${initialsList[(i + 3) % initialsList.length]} ${bstSurnames[i % bstSurnames.length]}`;
        roster.push({
          id: `BULK-STU-BST-${prefix}-${numStr}`,
          batchId: currentBatch.id,
          batchCode: currentBatch.name,
          regNo,
          indexNo: regNo,
          name,
          programme: 'BST (Hons)',
          department: 'Department of Bio Systems Technology',
          semester: startingSem,
          cgpa: 0.00,
          sgpa: 0.00,
          credits: 0,
          attendance: 0,
          email: `seu${prefix}bst${numStr}@seu.ac.lk`,
          tempPassword: `Seu@${prefix}BST${numStr}`,
          phone: `+94 71 ${Math.floor(1000000 + (i * 84913) % 9000000)}`,
          status: 'Active',
          welfare: 'Pending Verification',
          specialization: 'Agricultural Biotechnology',
          repeatModules: []
        });
      }
    }

    setBulkParsedStudents(roster);
    setBulkError('');
    const label = bulkDeptFilter === 'BICT' ? '120 BICT students' : bulkDeptFilter === 'BST' ? '120 BST students' : '240 students (120 BICT + 120 BST)';
    setBulkSuccessMsg(`Loaded roster: ${label} for ${currentBatch.name} (GPA 0.00).`);
  };

  // Process File Upload (Excel .xlsx, .xls, CSV, TSV)
  const handleFileUpload = (file) => {
    if (!file) return;
    setBulkFile(file);
    setBulkError('');
    setBulkSuccessMsg('');

    const currentBatch = activeBatch;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        let rawRows = [];

        // Parse workbook using SheetJS (supports .xlsx, .xls, .csv, .tsv seamlessly)
        const workbook = XLSX.read(buffer, { type: 'array' });
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          setBulkError('Spreadsheet file contains no readable worksheets.');
          return;
        }

        // Prioritize worksheet containing "enrol" or "student", otherwise first sheet
        let targetSheet = workbook.SheetNames[0];
        const matchSheet = workbook.SheetNames.find((n) => {
          const lower = n.toLowerCase();
          return lower.includes('enrol') || lower.includes('batch') || lower.includes('student');
        });
        if (matchSheet) targetSheet = matchSheet;

        const worksheet = workbook.Sheets[targetSheet];
        rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          setBulkError('Spreadsheet file contains no data rows.');
          return;
        }

        // Flexible key finder helper
        const getVal = (row, keys) => {
          for (const [k, v] of Object.entries(row)) {
            const lk = k.toLowerCase().trim();
            if (keys.some((key) => lk.includes(key))) {
              return String(v).trim();
            }
          }
          return '';
        };

        // Check required column presence across rows
        const hasReg = rawRows.some((r) => getVal(r, ['reg', 'student id', 'id']) !== '');
        const hasName = rawRows.some((r) => getVal(r, ['name', 'full name', 'student name']) !== '');

        if (!hasReg && !hasName) {
          setBulkError('Could not identify required columns ("Registration No" or "Full Name") in the uploaded spreadsheet.');
          return;
        }

        const parsed = [];
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          const reg = getVal(row, ['reg', 'student id', 'id']);
          const name = getVal(row, ['name', 'full name', 'student name']);
          if (!reg && !name) continue;

          const indexNo = getVal(row, ['index']) || reg;
          const prog = getVal(row, ['prog', 'degree']);
          const dept = getVal(row, ['dept', 'department']);
          const sem = getVal(row, ['sem', 'semester']) || currentBatch.currentSemester?.split(' ')[0] || 'Semester 1';
          const emailRaw = getVal(row, ['email', 'mail']);
          const passRaw = getVal(row, ['pass', 'temp', 'credential']);
          const phone = getVal(row, ['phone', 'mobile', 'contact']) || '+94 77 000 0000';

          const isBST = reg.toUpperCase().includes('/BST/') || prog.toUpperCase().includes('BST') || dept.toUpperCase().includes('BIO');
          const programme = prog || (isBST ? 'BST (Hons)' : 'BICT (Hons)');
          const department = dept || (isBST ? 'Department of Bio Systems Technology' : 'Department of Information & Communication Technology');
          const email = emailRaw || `${reg.toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`;
          const tempPassword = passRaw || getStudentTempPassword({ regNo: reg });

          parsed.push({
            id: `BULK-FILE-${Date.now()}-${i}`,
            batchId: currentBatch.id,
            batchCode: currentBatch.name,
            regNo: reg.toUpperCase(),
            indexNo: indexNo.toUpperCase(),
            name,
            programme,
            department,
            semester: sem,
            cgpa: 0.00,
            sgpa: 0.00,
            credits: 0,
            attendance: null,
            email: email.toLowerCase(),
            tempPassword,
            phone,
            status: 'Active',
            welfare: 'Pending Verification',
            specialization: isBST ? 'Bio-Processing Technology' : 'Software Technology',
            repeatModules: []
          });
        }

        if (parsed.length === 0) {
          setBulkError('No valid student records could be parsed from the uploaded spreadsheet.');
          return;
        }

        setBulkParsedStudents(parsed);
        const bictCount = parsed.filter((s) => s.department.includes('Information') || s.programme.includes('BICT')).length;
        const bstCount = parsed.filter((s) => s.department.includes('Bio') || s.programme.includes('BST')).length;
        setBulkSuccessMsg(`Parsed ${parsed.length} student records from "${file.name}" (${bictCount} BICT, ${bstCount} BST). Ready to enrol into ${currentBatch.name}.`);
      } catch (err) {
        setBulkError(`Error processing spreadsheet: ${err.message}`);
      }
    };

    reader.onerror = () => {
      setBulkError('Failed to read the uploaded spreadsheet file.');
    };

    reader.readAsArrayBuffer(file);
  };

  // Confirm and Bulk Enroll all parsed records
  const handleBulkSubmit = () => {
    if (targetStudentsForEnrol.length === 0) {
      setBulkError('No student records loaded for the selected department. Please upload a file or generate sample roster.');
      return;
    }

    setIsProcessingBulk(true);
    const currentBatch = activeBatch;

    setTimeout(() => {
      const finalized = targetStudentsForEnrol.map((s) => {
        const cur = getCurriculumBySemester(s.semester || currentBatch.currentSemester);
        const isFresh = cur?.isFreshers || (cur?.semester?.includes('1') && !cur?.semester?.includes('2'));
        return {
          ...s,
          batchId: currentBatch.id,
          batchCode: currentBatch.name,
          batch: currentBatch.academicYear,
          academicYear: currentBatch.academicYear,
          semester: cur.semester,
          cgpa: isFresh ? null : (s.cgpa || cur.defaultCgpa),
          sgpa: isFresh ? null : (s.sgpa || cur.defaultSgpa),
          credits: isFresh ? 0 : (s.credits || cur.totalCredits),
          attendance: isFresh ? null : (s.attendance || 100),
          enrolledCourses: cur.subjects,
          timetable: cur.timetableSlots,
          examModules: cur.examModules,
          progressionData: cur.progressionData
        };
      });

      if (onBulkAddStudents) {
        onBulkAddStudents(finalized, currentBatch.id);
      } else if (onAddStudent) {
        finalized.forEach((student) => onAddStudent(student));
      }

      setIsProcessingBulk(false);
      setBulkParsedStudents([]);
      setBulkFile(null);
      setBulkSuccessMsg('');
      setBulkError('');
      setIsAddModalOpen(false);
    }, 600);
  };

  const handleClearBulk = () => {
    setBulkParsedStudents([]);
    setBulkFile(null);
    setBulkError('');
    setBulkSuccessMsg('');
    setBulkSearchTerm('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Registering Individual Student inside a Batch
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!newRegNo.trim() || !newName.trim() || !newEmail.trim()) {
      setFormError('Please fill in Registration Number, Full Name, and University Email.');
      return;
    }

    const currentBatch = activeBatch;
    const effectiveTempPassword = newTempPassword.trim() || getStudentTempPassword({ regNo: newRegNo.trim().toUpperCase() });
    const cur = getCurriculumBySemester(newSemester);
    const isFresh = cur?.isFreshers || (cur?.semester?.includes('1') && !cur?.semester?.includes('2'));

    onAddStudent({
      id: `STU-${Date.now()}`,
      batchId: currentBatch.id,
      batchCode: currentBatch.name,
      batch: currentBatch.academicYear,
      academicYear: currentBatch.academicYear,
      regNo: newRegNo.trim().toUpperCase(),
      indexNo: newIndexNo.trim() || newRegNo.trim().toUpperCase(),
      name: newName.trim(),
      programme: newProgramme,
      department: newDepartment,
      semester: cur.semester,
      cgpa: isFresh ? null : cur.defaultCgpa,
      sgpa: isFresh ? null : cur.defaultSgpa,
      credits: isFresh ? 0 : cur.totalCredits,
      attendance: isFresh ? null : 100,
      enrolledCourses: cur.subjects,
      timetable: cur.timetableSlots,
      examModules: cur.examModules,
      progressionData: cur.progressionData,
      email: newEmail.trim().toLowerCase(),
      tempPassword: effectiveTempPassword,
      phone: newPhone.trim() || '+94 77 000 0000',
      status: 'Active',
      welfare: 'Pending Verification',
      specialization: newDepartment.includes('Bio') ? 'Bio-Processing Technology' : 'Software Technology',
      repeatModules: []
    });

    // Reset Form
    setNewRegNo('');
    setNewIndexNo('');
    setNewName('');
    setNewEmail('');
    setNewTempPassword('');
    setNewPhone('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Bulk Enrolment Filtered Students
  const targetStudentsForEnrol = bulkParsedStudents.filter((s) => {
    if (bulkDeptFilter === 'BICT') {
      return s.department.includes('Information') || s.programme.includes('BICT') || s.regNo.includes('/ICT/');
    }
    if (bulkDeptFilter === 'BST') {
      return s.department.includes('Bio') || s.programme.includes('BST') || s.regNo.includes('/BST/');
    }
    return true;
  });

  const displayedBulkStudents = targetStudentsForEnrol.filter((s) => {
    if (!bulkSearchTerm) return true;
    const q = bulkSearchTerm.toLowerCase();
    return (
      s.regNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.programme.toLowerCase().includes(q)
    );
  });

  return (
    <div className="adm-dashboard-container">
      {/* =========================================================
          VIEW 1: BATCHES OVERVIEW (DEFAULT VIEW)
          ========================================================= */}
      {!selectedBatch && (
        <>
          {/* Header */}
          <div className="adm-section-header">
            <div className="adm-section-title-wrap">
              <h2 className="adm-section-title">Intake Batches & Academic Management</h2>
              <p className="adm-section-subtitle">
                Faculty of Technology currently manages 5 active undergraduate intakes (with dynamic capacity to onboard future cohorts). Select any batch to inspect student rosters, attendance clearances, and GPA distributions.
              </p>
            </div>
            <div className="adm-section-actions" style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="adm-find-process-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#071732',
                  border: '1px solid #1e293b'
                }}
                onClick={() => {
                  setEnrollMode('bulk');
                  setIsAddModalOpen(true);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Bulk Enrol Batch (Excel/CSV)
              </button>
              <button
                type="button"
                className="adm-find-process-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsAddBatchModalOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Onboard New Intake Batch
              </button>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="adm-stats-grid">
            <div className="adm-stat-card">
              <div className="adm-stat-icon-wrap icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="adm-stat-body">
                <div className="adm-stat-top-row">
                  <span className="adm-stat-label">Active Batches</span>
                  <span className="adm-badge badge-active">{batches.length} Enrolled</span>
                </div>
                <div className="adm-stat-value">{batches.length} Batches</div>
                <div className="adm-stat-sub">From Batch 01 to Freshers</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-icon-wrap icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="adm-stat-body">
                <div className="adm-stat-top-row">
                  <span className="adm-stat-label">Total Undergraduates</span>
                  <span className="adm-badge badge-active">Faculty-Wide</span>
                </div>
                <div className="adm-stat-value">{students.length.toLocaleString()}</div>
                <div className="adm-stat-sub">BICT &amp; BST Undergraduates ({batches.length} Batches)</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-icon-wrap icon-emerald">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="adm-stat-body">
                <div className="adm-stat-top-row">
                  <span className="adm-stat-label">Avg Attendance Rate</span>
                  <span className="adm-badge badge-active">≥ 80% Threshold</span>
                </div>
                <div className="adm-stat-value">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + (Number(s.attendance) || 90), 0) / students.length).toFixed(1)
                    : '91.4'}%
                </div>
                <div className="adm-stat-sub">Qualified for ESA Exams</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-icon-wrap icon-amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="adm-stat-body">
                <div className="adm-stat-top-row">
                  <span className="adm-stat-label">Faculty GPA Mean</span>
                  <span className="adm-badge badge-submitted">Good Standing</span>
                </div>
                <div className="adm-stat-value">
                  {students.length > 0
                    ? (students.reduce((sum, s) => sum + (Number(s.cgpa) || 3.0), 0) / students.length).toFixed(2)
                    : '3.36'} CGPA
                </div>
                <div className="adm-stat-sub">Faculty Undergraduates Avg</div>
              </div>
            </div>
          </div>

          {/* Search toolbar for Batches */}
          <div className="adm-filter-toolbar">
            <div className="adm-search-input-box" style={{ maxWidth: '420px' }}>
              <svg className="adm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="adm-search-input"
                placeholder="Search batches by name, year, or coordinator..."
                value={batchSearchTerm}
                onChange={(e) => setBatchSearchTerm(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              Showing {filteredBatches.length} of {batches.length} intake batches
            </span>
          </div>

          {/* Batches Grid */}
          <div className="adm-batch-grid">
            {filteredBatches.map((batch) => {
              const enrolledCount = getBatchStudentCount(batch);
              const progression = getNextBatchProgression(batch);
              return (
                <div
                  key={batch.id}
                  className="adm-batch-card"
                  onClick={() => {
                    setSelectedBatch(batch);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="adm-batch-top">
                    <span className="adm-batch-code-badge">{batch.code}</span>
                    <span
                      className={`adm-badge ${
                        batch.status?.includes('Passed Out') || batch.status?.includes('Graduated')
                          ? 'badge-passed-out'
                          : batch.status?.includes('Graduating')
                          ? 'badge-submitted'
                          : batch.status?.includes('Freshers')
                          ? 'badge-pending'
                          : 'badge-active'
                      }`}
                      style={
                        batch.status?.includes('Passed Out') || batch.status?.includes('Graduated')
                          ? { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', fontWeight: 700 }
                          : {}
                      }
                    >
                      {batch.status?.includes('Passed Out') || batch.status?.includes('Graduated') ? '🎓 Passed Out' : batch.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="adm-batch-title">{batch.name}</h3>
                    <div className="adm-batch-sem">
                      Academic Year: <strong>{batch.academicYear}</strong> • {batch.currentSemester}
                    </div>
                  </div>

                  <div className="adm-batch-coordinator">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>
                      Coordinator: <strong>{batch.coordinator}</strong>
                    </span>
                  </div>

                  <div className="adm-batch-dept-tags" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>2 Departments:</span>
                    <span className="adm-batch-dept-pill" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      BICT ({batch.ictStudents || 120})
                    </span>
                    <span className="adm-batch-dept-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      BST ({batch.bstStudents || 120})
                    </span>
                  </div>

                  <div className="adm-batch-metrics">
                    <div className="adm-batch-metric-box">
                      <span className="adm-batch-metric-val">{enrolledCount}</span>
                      <span className="adm-batch-metric-lbl">Students</span>
                    </div>
                    <div className="adm-batch-metric-box">
                      <span className="adm-batch-metric-val">
                        {batch.currentSemester?.includes('Freshers') || batch.avgCgpa === 0
                          ? '0.00'
                          : safeToFixed(batch.avgCgpa, 2, '0.00')}
                      </span>
                      <span className="adm-batch-metric-lbl">
                        {batch.currentSemester?.includes('Freshers') ? 'Freshers GPA' : 'Avg CGPA'}
                      </span>
                    </div>
                    <div className="adm-batch-metric-box">
                      <span className="adm-batch-metric-val">{batch.attendanceRate}%</span>
                      <span className="adm-batch-metric-lbl">Attendance</span>
                    </div>
                  </div>

                  <div className="adm-batch-progress-wrap">
                    <div className="adm-batch-progress-labels">
                      <span>Attendance Health</span>
                      <strong>{batch.attendanceRate}%</strong>
                    </div>
                    <div className="adm-batch-progress-bar">
                      <div
                        className="adm-batch-progress-fill"
                        style={{
                          width: `${batch.attendanceRate}%`,
                          background:
                            batch.attendanceRate >= 90
                              ? '#16a34a'
                              : batch.attendanceRate >= 80
                              ? '#0284c7'
                              : '#d97706'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '1rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="adm-batch-card-btn"
                      style={{ flex: 1, marginTop: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatch(batch);
                        setCurrentPage(1);
                        setSearchTerm('');
                      }}
                    >
                      <span>View Batch Students</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>

                    {progression.type === 'passed_out' ? (
                      <span
                        style={{
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#f5f3ff',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                        title="Cohort has officially graduated and passed out"
                      >
                        🎓 Passed Out
                      </span>
                    ) : progression.type === 'pass_out' ? (
                      <button
                        type="button"
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPassOutModalBatch(batch);
                        }}
                        title="Pass Out Batch (Graduation of Semester 8 Cohort)"
                      >
                        <span>🎓 Pass Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={{
                          padding: '0.45rem 0.7rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromoteModalBatch({ batch, progression });
                        }}
                        title={`Promote Cohort to ${progression.nextSem}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span>Promote</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="adm-btn-xs-danger"
                      style={{ padding: '0.45rem 0.65rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBatchPrompt(batch);
                      }}
                      title="Delete Intake Batch"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* =========================================================
          VIEW 2: SELECTED BATCH DRILL-DOWN (STUDENT ROSTER)
          ========================================================= */}
      {selectedBatch && (
        <>
          {/* Breadcrumb Navigation Bar */}
          <div className="adm-breadcrumb-bar">
            <button
              type="button"
              className="adm-back-btn"
              onClick={() => {
                setSelectedBatch(null);
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to All Batches</span>
            </button>

            <div className="adm-breadcrumb-trail">
              <span>Intake Batches</span>
              <span>/</span>
              <strong>{selectedBatch.name}</strong>
              <span>/</span>
              <span>Student Roster</span>
            </div>
          </div>

          {/* Batch Hero Focus Header */}
          <div className="adm-batch-hero">
            <div className="adm-batch-hero-info">
              <h2 className="adm-batch-hero-title">
                {selectedBatch.name}
                <span className="adm-badge badge-submitted" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>
                  {selectedBatch.code}
                </span>
              </h2>
              <div className="adm-batch-hero-sub">
                <span>Academic Year: <strong>{selectedBatch.academicYear}</strong></span>
                <span>•</span>
                <span>Current Term: <strong>{selectedBatch.currentSemester}</strong></span>
                <span>•</span>
                <span>Coordinator: <strong>{selectedBatch.coordinator}</strong></span>
                <span>•</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>2 Departments: 120 BICT + 120 BST (240 Capacity)</span>
              </div>
            </div>

            <div className="adm-batch-hero-stats">
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">{batchStudents.length}</div>
                <div className="adm-batch-hero-stat-lbl">Enrolled</div>
              </div>
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">
                  {selectedBatch.currentSemester?.includes('Freshers') || selectedBatch.avgCgpa === 0 || selectedBatch.avgCgpa === null
                    ? 'N/A'
                    : safeToFixed(selectedBatch.avgCgpa, 2, '0.00')}
                </div>

                <div className="adm-batch-hero-stats">
                  <div className="adm-batch-hero-stat-box">
                    <div className="adm-batch-hero-stat-val">{getBatchStudentCount(activeBatch)}</div>
                    <div className="adm-batch-hero-stat-lbl">Enrolled</div>
                  </div>
                  <div className="adm-batch-hero-stat-box">
                    <div className="adm-batch-hero-stat-val">
                      {activeBatch.currentSemester?.includes('Freshers') || activeBatch.avgCgpa === 0
                        ? '0.00'
                        : (activeBatch.avgCgpa ? activeBatch.avgCgpa.toFixed(2) : '0.00')}
                    </div>
                    <div className="adm-batch-hero-stat-lbl">
                      {activeBatch.currentSemester?.includes('Freshers') ? 'Freshers GPA' : 'Avg CGPA'}
                    </div>
                  </div>
                  <div className="adm-batch-hero-stat-box">
                    <div className="adm-batch-hero-stat-val">{activeBatch.attendanceRate}%</div>
                    <div className="adm-batch-hero-stat-lbl">Attendance</div>
                  </div>

                  <button
                    type="button"
                    className="adm-find-process-btn"
                    style={{
                      background: '#f59e0b',
                      color: '#071732',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => {
                      setNewSemester(activeBatch.currentSemester?.split(' ')[0] || 'Semester 1');
                      setTargetBatchId(activeBatch.id);
                      setEnrollMode('bulk');
                      setIsAddModalOpen(true);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    + Enrol Students (Individual / Bulk)
                  </button>

                  {/* Batch Progression & Pass Out Button in Drill-Down */}
                  {drillProgression.type === 'passed_out' ? (
                    <span
                      style={{
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: '1px solid #ddd6fe',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Cohort has officially graduated and passed out"
                    >
                      🎓 Passed Out (Graduated)
                    </span>
                  ) : drillProgression.type === 'pass_out' ? (
                    <button
                      type="button"
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => setPassOutModalBatch(activeBatch)}
                      title="Pass Out Batch (Graduation of Semester 8 Cohort)"
                    >
                      <span>🎓 Pass Out Batch</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => setPromoteModalBatch({ batch: activeBatch, progression: drillProgression })}
                      title={`Promote Cohort to ${drillProgression.nextSem}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      <span>Promote to {drillProgression.nextSem}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="adm-btn-danger"
                    style={{
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => handleDeleteBatchPrompt(activeBatch)}
                    title="Delete this intake batch"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete Batch
                  </button>
                </div>
              </div>
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">{selectedBatch.currentSemester?.includes('Freshers') ? '—' : `${selectedBatch.attendanceRate}%`}</div>
                <div className="adm-batch-hero-stat-lbl">Attendance</div>
              </div>
              <button
                type="button"
                className="adm-find-process-btn"
                style={{
                  background: '#f59e0b',
                  color: '#071732',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  setNewSemester(selectedBatch.currentSemester?.split(' ')[0] || 'Semester 1');
                  setTargetBatchId(selectedBatch.id);
                  setEnrollMode('bulk');
                  setIsAddModalOpen(true);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                + Enrol Students (Individual / Bulk)
              </button>

              <button
                type="button"
                className="adm-btn-danger"
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => handleDeleteBatchPrompt(selectedBatch)}
                title="Delete this intake batch"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Batch
              </button>
            </div>
          </div>

          {/* Filter Toolbar for this Batch */}
          <div className="adm-filter-toolbar">
            <div className="adm-search-input-box" style={{ maxWidth: '380px' }}>
              <svg className="adm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="adm-search-input"
                placeholder={`Search ${selectedBatch.name} by Reg No, Name, or Email...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="adm-filter-group">
              {/* Dept Filter */}
              <select
                className="adm-filter-select"
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Departments (BICT & BST)</option>
                <option value="ICT">Department of ICT (BICT)</option>
                <option value="Biosystems">Department of Biosystems Technology (BST)</option>
              </select>

              {/* Semester Filter */}
              <select
                className="adm-filter-select"
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Terms</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>

              {/* Status Filter */}
              <select
                className="adm-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Standing Statuses</option>
                <option value="Active">Active Standing</option>
                <option value="Academic Warning">Academic Warning</option>
                <option value="Attendance Barred">Attendance Barred</option>
                <option value="Passed Out">Passed Out (Graduated)</option>
              </select>
            </div>
          </div>

          {/* Students Table for Selected Batch */}
          <div className="adm-table-card">
            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Registration & Index</th>
                    <th>Student Name & Contact</th>
                    <th>Department & Specialization</th>
                    <th>Term</th>
                    <th>CGPA / SGPA</th>
                    <th>Attendance</th>
                    <th>Welfare Status</th>
                    <th>Standing</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No student profiles found matching the current filters for {selectedBatch.name}.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f2b5c' }}>{student.regNo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{student.indexNo}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{student.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{student.email}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <span style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 500 }}>Pass:</span>
                            <code
                              style={{
                                fontSize: '0.68rem',
                                background: '#f8fafc',
                                color: '#0369a1',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                fontFamily: 'monospace',
                                border: '1px solid #e2e8f0'
                              }}
                              title="Temporary Initial Password"
                            >
                              {student.tempPassword || getStudentTempPassword(student)}
                            </code>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                            {student.programme}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {student.specialization || student.department}
                          </div>
                        </td>

                        <td>
                          <span className="adm-badge badge-pending" style={{ fontSize: '0.72rem' }}>
                            {student.semester}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: (student.cgpa !== null && student.cgpa < 2.5) ? '#b91c1c' : '#0f172a' }}>
                            {student.cgpa !== null && student.cgpa !== undefined ? Number(student.cgpa).toFixed(2) : 'N/A'} CGPA
                          </div>
                          <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                            SGPA: {student.sgpa !== null && student.sgpa !== undefined ? Number(student.sgpa).toFixed(2) : 'N/A'}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span
                              className={`adm-badge ${
                                student.attendance >= 80
                                  ? 'badge-active'
                                  : student.attendance >= 70
                                  ? 'badge-pending'
                                  : 'badge-rejected'
                              }`}
                            >
                              {student.attendance}%
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`adm-badge ${
                              student.welfare.includes('Mahapola')
                                ? 'badge-active'
                                : student.welfare.includes('Bursary')
                                ? 'badge-submitted'
                                : 'badge-neutral'
                            }`}
                          >
                            {student.welfare}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`adm-badge ${
                              student.status === 'Passed Out' || student.status === 'Graduated'
                                ? 'badge-passed-out'
                                : student.status === 'Active'
                                ? 'badge-active'
                                : student.status === 'Academic Warning'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                            style={
                              student.status === 'Passed Out' || student.status === 'Graduated'
                                ? { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', fontWeight: 600 }
                                : {}
                            }
                          >
                            {student.status === 'Passed Out' ? '🎓 Passed Out' : student.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="adm-btn-xs-view"
                              onClick={() => setSelectedStudent(student)}
                              title="View Full Academic Dossier"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                            <button
                              type="button"
                              className="adm-btn-xs-edit"
                              onClick={() => handleOpenEdit(student)}
                              title="Edit Student Profile"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`adm-btn-xs-toggle ${student.status === 'Active' ? '' : 'active-restore'}`}
                              onClick={() =>
                                onUpdateStudentStatus(
                                  student.id,
                                  student.status === 'Active' ? 'Attendance Barred' : 'Active'
                                )
                              }
                              title="Toggle Active/Barred Standing"
                            >
                              {student.status === 'Active' ? 'Bar' : 'Restore'}
                            </button>
                            <button
                              type="button"
                              className="adm-btn-xs-danger"
                              onClick={() => handleDeleteStudentPrompt(student)}
                              title="Delete Student Record"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="adm-pagination">
                <span className="adm-page-info">
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(currentPage * pageSize, batchStudents.length)}</strong> of <strong>{batchStudents.length}</strong> students
                </span>
                <div className="adm-page-nav">
                  <button
                    type="button"
                    className="adm-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Previous
                  </button>
                  <span className="adm-current-page">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="adm-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          MODAL: ONBOARD NEW INTAKE BATCH
          ========================================================= */}
      {isAddBatchModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddBatchModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Onboard New Intake Batch</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddBatchModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBatchSubmit}>
              <div className="adm-modal-body">
                {batchFormError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    {batchFormError}
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Batch Title (e.g. Batch 06 (2024/2025)) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Batch 06 (2024/2025)"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Intake Code (e.g. B06) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="B06"
                      value={newBatchCode}
                      onChange={(e) => setNewBatchCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Academic Intake Year *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="2024/2025"
                      value={newBatchYear}
                      onChange={(e) => setNewBatchYear(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Starting Academic Term</label>
                    <select
                      className="adm-input"
                      value={newBatchSemester}
                      onChange={(e) => setNewBatchSemester(e.target.value)}
                    >
                      <option value="Semester 1 (Freshers)">Semester 1 (Freshers)</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                    </select>
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Appointed Batch Coordinator (Senior Academic Staff)</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Dr. S. Sabraz Nawaz / Mrs. M.F. Asfa"
                      value={newBatchCoordinator}
                      onChange={(e) => setNewBatchCoordinator(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Estimated Student Intake Capacity</label>
                    <input
                      type="number"
                      className="adm-input"
                      placeholder="240 (120 ICT + 120 BST)"
                      value={newBatchCapacity}
                      onChange={(e) => setNewBatchCapacity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddBatchModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                  style={{ padding: '0.45rem 1.15rem' }}
                >
                  Onboard & Initialize Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: STUDENT ACADEMIC DOSSIER
          ========================================================= */}
      {selectedStudent && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">{selectedStudent.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {selectedStudent.regNo} • {selectedStudent.indexNo} • {selectedStudent.programme}
                </span>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Cumulative GPA</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b5c' }}>
                    {selectedStudent.cgpa !== null && selectedStudent.cgpa !== undefined ? Number(selectedStudent.cgpa).toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Current Semester GPA</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b5c' }}>
                    {selectedStudent.sgpa !== null && selectedStudent.sgpa !== undefined ? Number(selectedStudent.sgpa).toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Overall Attendance</div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: selectedStudent.attendance >= 80 ? '#15803d' : '#b91c1c'
                    }}
                  >
                    {selectedStudent.attendance}%
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Assigned Batch:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.batchCode || selectedBatch?.name || 'Faculty Intake'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Academic Advisor / Specialization:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.specialization || 'General Track'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Completed Academic Credits:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.credits} Credits</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Welfare / Financial Grant:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.welfare}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>University Email:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Temporary Password:</span>
                  <code style={{ fontWeight: 700, color: '#0369a1', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                    {selectedStudent.tempPassword || getStudentTempPassword(selectedStudent)}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Contact Phone:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStudent.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Repeat Modules Outstanding:</span>
                  <span style={{ fontWeight: 600, color: selectedStudent.repeatModules.length > 0 ? '#b91c1c' : '#15803d' }}>
                    {selectedStudent.repeatModules.length > 0 ? selectedStudent.repeatModules.join(', ') : 'None (All First Attempts Cleared)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="adm-btn-xs-danger"
                onClick={() => handleDeleteStudentPrompt(selectedStudent)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Student
              </button>
              <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="adm-btn-xs-primary"
                  onClick={() => {
                    handleOpenEdit(selectedStudent);
                  }}
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: STUDENT ENROLMENT (INDIVIDUAL & BULK EXCEL/CSV)
          ========================================================= */}
      {isAddModalOpen && (
        <div
          className="adm-modal-backdrop"
          onClick={() => {
            setIsAddModalOpen(false);
            setFormError('');
            handleClearBulk();
          }}
        >
          <div
            className="adm-modal-card"
            style={{
              maxWidth: enrollMode === 'bulk' ? '880px' : '620px',
              transition: 'max-width 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Mode Switcher */}
            <div className="adm-modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="adm-modal-title" style={{ fontSize: '1.1rem' }}>
                      Faculty Undergraduate Enrolment
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                      Faculty of Technology &bull; BICT &amp; BST Programmes &bull; Target: <strong style={{ color: '#0f172a' }}>{activeBatch.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="adm-modal-close-btn"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError('');
                    handleClearBulk();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Segmented Mode Selector */}
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '4px',
                  gap: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setEnrollMode('single')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: enrollMode === 'single' ? 700 : 500,
                    color: enrollMode === 'single' ? '#071732' : '#64748b',
                    background: enrollMode === 'single' ? '#ffffff' : 'transparent',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: enrollMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Individual Registration (Single Student)
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollMode('bulk')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: enrollMode === 'bulk' ? 700 : 500,
                    color: enrollMode === 'bulk' ? '#1d4ed8' : '#64748b',
                    background: enrollMode === 'bulk' ? '#ffffff' : 'transparent',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: enrollMode === 'bulk' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Bulk Excel / CSV Enrolment (200+ Cohort)
                  <span
                    style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    Recommended
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: INDIVIDUAL REGISTRATION */}
            {enrollMode === 'single' && (
              <form onSubmit={handleStudentSubmit}>
                <div className="adm-modal-body">
                  {formError && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                      {formError}
                    </div>
                  )}

                  <div className="adm-form-grid">
                    <div className="adm-form-group full-width">
                      <label className="adm-label">Target Intake Batch *</label>
                      <select
                        className="adm-input"
                        value={activeTargetBatchId}
                        onChange={(e) => setTargetBatchId(e.target.value)}
                      >
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Registration No (SEU/IS/YY/DEPT/XXX) *</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="SEU/IS/24/ICT/001"
                        value={newRegNo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewRegNo(val);
                          if (!newTempPassword || newTempPassword.startsWith('Seu@')) {
                            setNewTempPassword(getStudentTempPassword({ regNo: val }));
                          }
                          if (!newEmail || newEmail.endsWith('@seu.ac.lk')) {
                            const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (clean) setNewEmail(`${clean}@seu.ac.lk`);
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Index No (e.g. SEU/IS/24/ICT/001)</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="SEU/IS/24/ICT/001"
                        value={newIndexNo}
                        onChange={(e) => setNewIndexNo(e.target.value)}
                      />
                    </div>

                    <div className="adm-form-group full-width">
                      <label className="adm-label">Full Name with Initials *</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="A.B.C. Perera"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Degree Programme</label>
                      <select
                        className="adm-input"
                        value={newProgramme}
                        onChange={(e) => handleProgrammeChange(e.target.value)}
                      >
                        <option value="BICT (Hons)">BICT (Hons) - Bachelor of Information Communication Technology</option>
                        <option value="BST (Hons)">BST (Hons) - Bachelor of Bio System Technology</option>
                      </select>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Department</label>
                      <select
                        className="adm-input"
                        value={newDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                      >
                        <option value="Department of Information & Communication Technology">Department of Information & Communication Technology</option>
                        <option value="Department of Bio Systems Technology">Department of Bio Systems Technology</option>
                      </select>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Starting Semester</label>
                      <select
                        className="adm-input"
                        value={newSemester}
                        onChange={(e) => setNewSemester(e.target.value)}
                      >
                        <option value="Semester 1">Semester 1 (Freshman)</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 5">Semester 5</option>
                        <option value="Semester 6">Semester 6</option>
                        <option value="Semester 7">Semester 7</option>
                        <option value="Semester 8">Semester 8 (Final Year)</option>
                      </select>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Contact Mobile Number</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="+94 77 123 4567"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">University Email *</label>
                      <input
                        type="email"
                        className="adm-input"
                        placeholder="student@seu.ac.lk"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Temporary Password *</span>
                        <button
                          type="button"
                          onClick={() => setNewTempPassword(getStudentTempPassword({ regNo: newRegNo || '24/ICT/001' }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Auto Generate
                        </button>
                      </label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="e.g. Seu@24ICT001"
                        value={newTempPassword}
                        onChange={(e) => setNewTempPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn-xs-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="adm-find-process-btn"
                    style={{ padding: '0.45rem 1.15rem' }}
                  >
                    Save & Enroll Student
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: BULK EXCEL / CSV ENROLMENT */}
            {enrollMode === 'bulk' && (
              <div className="adm-modal-body" style={{ gap: '1rem' }}>
                {/* Clean Batch & Department Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Select Intake Batch *</label>
                    <select
                      className="adm-input"
                      value={activeTargetBatchId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setTargetBatchId(newId);
                        const nextB = batches.find((b) => b.id === newId);
                        if (nextB && bulkParsedStudents.length > 0) {
                          setBulkParsedStudents((prev) =>
                            prev.map((s) => ({ ...s, batchId: nextB.id, batchCode: nextB.name }))
                          );
                        }
                      }}
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Select Department *</label>
                    <select
                      className="adm-input"
                      value={bulkDeptFilter}
                      onChange={(e) => setBulkDeptFilter(e.target.value)}
                    >
                      <option value="ALL">Both Departments (BICT &amp; BST)</option>
                      <option value="BICT">ICT Department (BICT)</option>
                      <option value="BST">BST Department (BST)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Action Buttons: Template Download + 1-Click Student Generator */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                    onClick={handleDownloadTemplate}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download CSV Template (.csv)
                  </button>

                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#065f46'
                    }}
                    onClick={handleGenerateSampleBatch}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {bulkDeptFilter === 'BICT'
                      ? 'Load 120 BICT Students'
                      : bulkDeptFilter === 'BST'
                      ? 'Load 120 BST Students'
                      : 'Load 240 Students (BICT & BST)'}
                  </button>
                </div>

                {/* File Dropzone */}
                <div
                  className={`adm-bulk-dropzone ${isDragging ? 'active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".csv,.xlsx,.xls,.tsv,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="adm-bulk-dropzone-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                    {bulkFile ? bulkFile.name : 'Click to browse or drag & drop student spreadsheet'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Supports Excel &amp; CSV spreadsheets with columns: Registration No, Full Name, Department, Email, etc.
                  </div>
                </div>

                {/* Bulk Error Alert */}
                {bulkError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{bulkError}</span>
                  </div>
                )}

                {/* Bulk Success Alert */}
                {bulkSuccessMsg && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{bulkSuccessMsg}</span>
                  </div>
                )}

                {/* Parsed Students Inspection Table */}
                {bulkParsedStudents.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Summary Chips */}
                    <div className="adm-bulk-stats-strip">
                      <span className="adm-bulk-chip" style={{ background: '#dbeafe', color: '#1e40af' }}>
                        Total Ready: {targetStudentsForEnrol.length} Students
                      </span>
                      {bulkDeptFilter === 'ALL' ? (
                        <>
                          <span className="adm-bulk-chip" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            BICT: {bulkParsedStudents.filter((s) => s.department.includes('Information') || s.programme.includes('BICT') || s.regNo.includes('/ICT/')).length} Undergraduates
                          </span>
                          <span className="adm-bulk-chip" style={{ background: '#f0fdf4', color: '#15803d' }}>
                            BST: {bulkParsedStudents.filter((s) => s.department.includes('Bio') || s.programme.includes('BST') || s.regNo.includes('/BST/')).length} Undergraduates
                          </span>
                        </>
                      ) : (
                        <span
                          className="adm-bulk-chip"
                          style={{
                            background: bulkDeptFilter === 'BICT' ? '#eff6ff' : '#f0fdf4',
                            color: bulkDeptFilter === 'BICT' ? '#1d4ed8' : '#15803d'
                          }}
                        >
                          Target: {bulkDeptFilter === 'BICT' ? 'ICT Department (BICT Hons)' : 'BST Department (BST Hons)'}
                        </span>
                      )}
                      <span className="adm-bulk-chip" style={{ background: '#fef3c7', color: '#92400e' }}>
                        Freshers Metrics: GPA 0.00 &bull; Credits: 0
                      </span>
                    </div>

                    {/* Filter Inside Preview */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="Filter preview by name, reg no, or department..."
                        value={bulkSearchTerm}
                        onChange={(e) => setBulkSearchTerm(e.target.value)}
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        Showing {displayedBulkStudents.length} of {targetStudentsForEnrol.length} records
                      </span>
                    </div>

                    {/* Scrollable Preview Table */}
                    <div className="adm-bulk-table-container">
                      <table className="adm-bulk-table">
                        <thead>
                          <tr>
                            <th style={{ width: '35px' }}>#</th>
                            <th>Reg No</th>
                            <th>Full Name</th>
                            <th>Department</th>
                            <th>Programme</th>
                            <th>Email Address</th>
                            <th>Temp Password</th>
                            <th>Starting Sem</th>
                            <th>GPA</th>
                            <th>Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedBulkStudents
                            .slice(0, 50)
                            .map((stu, idx) => (
                              <tr key={stu.id || idx}>
                                <td style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{idx + 1}</td>
                                <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{stu.regNo}</td>
                                <td>{stu.name}</td>
                                <td>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: (stu.department.includes('Bio') || stu.regNo.includes('/BST/')) ? '#ecfdf5' : '#eff6ff',
                                      color: (stu.department.includes('Bio') || stu.regNo.includes('/BST/')) ? '#047857' : '#1d4ed8'
                                    }}
                                  >
                                    {stu.department.includes('Bio') || stu.regNo.includes('/BST/') ? 'BST' : 'BICT'}
                                  </span>
                                </td>
                                <td style={{ color: '#64748b' }}>{stu.programme}</td>
                                <td style={{ color: '#64748b' }}>{stu.email}</td>
                                <td>
                                  <code
                                    style={{
                                      fontSize: '0.68rem',
                                      background: '#f1f5f9',
                                      color: '#0369a1',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    {stu.tempPassword || getStudentTempPassword(stu)}
                                  </code>
                                </td>
                                <td>{stu.semester}</td>
                                <td>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                    {stu.cgpa !== null && stu.cgpa !== undefined ? Number(stu.cgpa).toFixed(2) : 'N/A'}
                                  </span>
                                </td>
                                <td style={{ color: '#64748b' }}>{stu.credits}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {targetStudentsForEnrol.length > 50 && (
                      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', padding: '0.15rem' }}>
                        + {targetStudentsForEnrol.length - 50} more records ready to be enrolled into {activeBatch.name}.
                      </div>
                    )}
                  </div>
                )}

                {/* Bulk Footer Actions */}
                <div className="adm-modal-footer" style={{ padding: '0.85rem 0 0 0', background: 'transparent' }}>
                  {bulkParsedStudents.length > 0 && (
                    <button
                      type="button"
                      className="adm-btn-xs-secondary"
                      style={{ marginRight: 'auto', color: '#b91c1c' }}
                      onClick={handleClearBulk}
                    >
                      Clear Roster
                    </button>
                  )}
                  <button
                    type="button"
                    className="adm-btn-xs-secondary"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      handleClearBulk();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="adm-find-process-btn"
                    style={{
                      padding: '0.45rem 1.25rem',
                      opacity: targetStudentsForEnrol.length === 0 ? 0.6 : 1,
                      cursor: targetStudentsForEnrol.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                    disabled={targetStudentsForEnrol.length === 0 || isProcessingBulk}
                    onClick={handleBulkSubmit}
                  >
                    {isProcessingBulk ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Bulk Enrolling {targetStudentsForEnrol.length} Students...
                      </span>
                    ) : (
                      `Confirm & Bulk Enrol ${targetStudentsForEnrol.length > 0 ? `(${targetStudentsForEnrol.length} Students)` : ''}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT STUDENT PROFILE
          ========================================================= */}
      {editingStudent && (
        <div className="adm-modal-backdrop" onClick={() => setEditingStudent(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Edit Student Profile</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Update academic registry and credentials for {editingStudent.regNo}
                </span>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setEditingStudent(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditedStudent}>
              <div className="adm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Full Name with Initials *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Registration Number</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.regNo}
                      onChange={(e) => setEditForm({ ...editForm, regNo: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Index Number</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.indexNo}
                      onChange={(e) => setEditForm({ ...editForm, indexNo: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Degree Programme</label>
                    <select
                      className="adm-form-select"
                      value={editForm.programme}
                      onChange={(e) => {
                        const prog = e.target.value;
                        const dept = prog.includes('BST')
                          ? 'Department of Bio Systems Technology'
                          : 'Department of Information & Communication Technology';
                        setEditForm({ ...editForm, programme: prog, department: dept });
                      }}
                    >
                      <option value="BICT (Hons)">BICT (Hons) - Information Technology</option>
                      <option value="BST (Hons)">BST (Hons) - Bio Systems Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Department</label>
                    <select
                      className="adm-form-select"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    >
                      <option value="Department of Information & Communication Technology">
                        Dept of Information & Communication Tech
                      </option>
                      <option value="Department of Bio Systems Technology">
                        Dept of Bio Systems Technology
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Academic Semester</label>
                    <select
                      className="adm-form-select"
                      value={editForm.semester}
                      onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Academic Standing</label>
                    <select
                      className="adm-form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active">Active (Good Standing)</option>
                      <option value="Attendance Barred">Attendance Barred</option>
                      <option value="Academic Warning">Academic Warning</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Passed Out">Passed Out (Graduated)</option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Cumulative GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.00"
                      className="adm-form-input"
                      value={editForm.cgpa}
                      onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Attendance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="adm-form-input"
                      value={editForm.attendance}
                      onChange={(e) => setEditForm({ ...editForm, attendance: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">University Email *</label>
                    <input
                      type="email"
                      className="adm-form-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value.toLowerCase() })}
                      required
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Login Password</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.tempPassword}
                      onChange={(e) => setEditForm({ ...editForm, tempPassword: e.target.value })}
                      placeholder="e.g. 123456 or Seu@Pass"
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="adm-form-label">Welfare Grant</label>
                    <select
                      className="adm-form-select"
                      value={editForm.welfare}
                      onChange={(e) => setEditForm({ ...editForm, welfare: e.target.value })}
                    >
                      <option value="Mahapola Merit">Mahapola Merit</option>
                      <option value="Mahapola Ordinary">Mahapola Ordinary</option>
                      <option value="Bursary Full">Bursary Full</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Specialization</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={editForm.specialization}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      placeholder="e.g. Software Technology"
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                  style={{ padding: '0.45rem 1.25rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PASS OUT BATCH (GRADUATION OF SEMESTER 8 COHORT)
          ========================================================= */}
      {passOutModalBatch && (
        <div className="adm-modal-backdrop" onClick={() => setPassOutModalBatch(null)}>
          <div
            className="adm-modal-card"
            style={{ maxWidth: '580px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header" style={{ borderBottom: '2px solid #059669' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACADEMIC GRADUATION & CONVOCATION CLEARANCE
                </span>
                <h3 className="adm-modal-title" style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎓 Pass Out & Graduate Cohort</span>
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setPassOutModalBatch(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body" style={{ padding: '1.25rem' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.92rem' }}>
                  <span>{passOutModalBatch.name}</span>
                  <span className="adm-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                    {passOutModalBatch.code}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '4px' }}>
                  Academic Intake: <strong>{passOutModalBatch.academicYear}</strong> • Current Term: <strong>{passOutModalBatch.currentSemester}</strong>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {getBatchStudentCount(passOutModalBatch)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Enrolled Students</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                    Semester 8
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Completed Term</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>
                    Alumni
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Future Standing</div>
                </div>
              </div>

              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  color: '#92400e',
                  lineHeight: '1.45'
                }}
              >
                <strong>Institutional Graduation Clearance:</strong> This cohort has completed all academic coursework through Semester 8 (Final Year).
                Confirming will officially mark this intake batch as <strong>Passed Out (Graduated)</strong> and transition all enrolled undergraduates to <strong>Passed Out</strong> alumni status.
              </div>
            </div>

            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.25rem' }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setPassOutModalBatch(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
                onClick={handleConfirmPassOut}
              >
                🎓 Confirm Pass Out & Graduate Cohort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PROMOTE BATCH (ADVANCE TO NEXT SEMESTER)
          ========================================================= */}
      {promoteModalBatch && (
        <div className="adm-modal-backdrop" onClick={() => setPromoteModalBatch(null)}>
          <div
            className="adm-modal-card"
            style={{ maxWidth: '580px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header" style={{ borderBottom: '2px solid #2563eb' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  COHORT SEMESTER ADVANCEMENT
                </span>
                <h3 className="adm-modal-title" style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚀 Promote Cohort to Next Semester</span>
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setPromoteModalBatch(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body" style={{ padding: '1.25rem' }}>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 700, fontSize: '0.92rem' }}>
                  <span>{promoteModalBatch.batch.name}</span>
                  <span className="adm-badge" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>
                    {promoteModalBatch.batch.code}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '4px' }}>
                  Academic Intake: <strong>{promoteModalBatch.batch.academicYear}</strong> • Coordinator: <strong>{promoteModalBatch.batch.coordinator}</strong>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>CURRENT TERM</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {promoteModalBatch.batch.currentSemester}
                  </div>
                </div>

                <div style={{ color: '#2563eb', padding: '0 1rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>TARGET PROMOTED TERM</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                    {promoteModalBatch.progression.nextSem}
                  </div>
                </div>
              </div>

              {promoteModalBatch.progression.nextSem.includes('Semester 8') ? (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#065f46',
                    lineHeight: '1.45'
                  }}
                >
                  <strong>🎓 Final Academic Year Transition:</strong> Promoting this cohort to <strong>Semester 8 (Final Year)</strong> advances students to their graduating semester. Upon reaching Semester 8, the next available option for this cohort will automatically become <strong>Pass Out</strong>.
                </div>
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#475569',
                    lineHeight: '1.45'
                  }}
                >
                  Promoting will advance all <strong>{getBatchStudentCount(promoteModalBatch.batch)}</strong> enrolled undergraduates in this cohort to <strong>{promoteModalBatch.progression.nextSem}</strong>.
                </div>
              )}
            </div>

            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.25rem' }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setPromoteModalBatch(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
                onClick={handleConfirmPromote}
              >
                🚀 Confirm Promotion to {promoteModalBatch.progression.nextSem}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
