import { useState, useRef } from 'react';

export default function StudentManagement({
  batches = [],
  students = [],
  onAddBatch,
  onAddStudent,
  onBulkAddStudents,
  onUpdateStudentStatus,
  isAddModalOpen,
  setIsAddModalOpen
}) {
  // Navigation State: null = Batches Overview, object = Drill-down into that Batch
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Search & Filters for Batches Overview
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Search & Filters for Selected Batch Student Roster
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Student for Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // Register New Student Modal State (Individual Registration)
  const [newRegNo, setNewRegNo] = useState('');
  const [newIndexNo, setNewIndexNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newProgramme, setNewProgramme] = useState('BICT (Hons)');
  const [newDepartment, setNewDepartment] = useState('Department of Information & Communication Technology');
  const [newSemester, setNewSemester] = useState('Semester 1');
  const [newEmail, setNewEmail] = useState('');
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

  // Active Batch for Modal Operations
  const activeBatch = batches.find((b) => b.id === (targetBatchId || selectedBatch?.id)) || selectedBatch || batches[batches.length - 1] || {
    id: 'BATCH-05',
    code: 'B05',
    name: 'Batch 05 (2024/2025)',
    academicYear: '2024/2025',
    currentSemester: 'Semester 1 (Freshers)',
    regPrefix: '24'
  };

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
    const count = students.filter((s) => s.batchId === batch.id || (batch.regPrefix && s.regNo.startsWith(batch.regPrefix))).length;
    return count > 0 ? count : batch.totalStudents;
  };

  // Filter students for the currently selected batch
  const batchStudents = selectedBatch
    ? students.filter((s) => {
        const matchesBatch =
          s.batchId === selectedBatch.id ||
          (selectedBatch.regPrefix && s.regNo.startsWith(selectedBatch.regPrefix)) ||
          (s.batchCode && s.batchCode.includes(selectedBatch.code));

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
    const csvHeader = 'Registration No,Index No,Full Name,Degree Programme,Department,Starting Semester,University Email,Mobile\n';
    const sampleRows = [
      'SEU/IS/24/ICT/001,SEU/IS/24/ICT/001,A.B. Perera,BICT (Hons),Department of Information & Communication Technology,Semester 1,seu24ict001@seu.ac.lk,+94771234567',
      'SEU/IS/24/ICT/002,SEU/IS/24/ICT/002,K.L. Fernando,BICT (Hons),Department of Information & Communication Technology,Semester 1,seu24ict002@seu.ac.lk,+94772345678',
      'SEU/IS/24/BST/001,SEU/IS/24/BST/001,M.N. Silva,BST (Hons),Department of Bio Systems Technology,Semester 1,seu24bst001@seu.ac.lk,+94713456789',
      'SEU/IS/24/BST/002,SEU/IS/24/BST/002,S.K. Mohamed,BST (Hons),Department of Bio Systems Technology,Semester 1,seu24bst002@seu.ac.lk,+94774567890'
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

    // 120 BICT Students (SEU/IS/YY/ICT/001 to 120)
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
        cgpa: 3.50,
        sgpa: 3.50,
        credits: 0,
        attendance: 100,
        email: `seu${prefix}ict${numStr}@seu.ac.lk`,
        phone: `+94 77 ${Math.floor(1000000 + (i * 71329) % 9000000)}`,
        status: 'Active',
        welfare: 'Pending Verification',
        specialization: 'Software Technology',
        repeatModules: []
      });
    }

    // 120 BST Students (SEU/IS/YY/BST/001 to 120)
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
        cgpa: 3.50,
        sgpa: 3.50,
        credits: 0,
        attendance: 100,
        email: `seu${prefix}bst${numStr}@seu.ac.lk`,
        phone: `+94 71 ${Math.floor(1000000 + (i * 84913) % 9000000)}`,
        status: 'Active',
        welfare: 'Pending Verification',
        specialization: 'Agricultural Biotechnology',
        repeatModules: []
      });
    }

    setBulkParsedStudents(roster);
    setBulkError('');
    setBulkSuccessMsg(`Generated official intake roster: 240 undergraduates (120 BICT + 120 BST) for ${currentBatch.name}.`);
  };

  // Process File Upload (CSV, TXT, Excel Comma Separated)
  const handleFileUpload = (file) => {
    if (!file) return;
    setBulkFile(file);
    setBulkError('');
    setBulkSuccessMsg('');

    const currentBatch = activeBatch;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setBulkError('Spreadsheet file is empty or contains no data rows.');
          return;
        }

        const headerLine = lines[0];
        const separator = headerLine.includes('\t') ? '\t' : headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(separator).map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

        const getIdx = (keys) => headers.findIndex((h) => keys.some((k) => h.includes(k)));

        const regIdx = getIdx(['reg', 'registration', 'student id', 'id']);
        const nameIdx = getIdx(['name', 'full name', 'student name']);
        const indexIdx = getIdx(['index']);
        const progIdx = getIdx(['prog', 'degree']);
        const deptIdx = getIdx(['dept', 'department']);
        const semIdx = getIdx(['sem', 'semester']);
        const emailIdx = getIdx(['email', 'mail']);
        const phoneIdx = getIdx(['phone', 'mobile', 'contact']);

        if (regIdx === -1 && nameIdx === -1) {
          setBulkError('Could not identify required columns ("Registration No" or "Full Name") in the uploaded spreadsheet.');
          return;
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const rowText = lines[i];
          if (!rowText.trim()) continue;

          const cols = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < rowText.length; c++) {
            const char = rowText[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === separator && !inQuotes) {
              cols.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim().replace(/^["']|["']$/g, ''));

          const reg = (cols[regIdx] || '').trim();
          const name = (cols[nameIdx] || '').trim();
          if (!reg && !name) continue;

          const isBST = reg.toUpperCase().includes('/BST/') || (cols[progIdx] && cols[progIdx].toUpperCase().includes('BST')) || (cols[deptIdx] && cols[deptIdx].toUpperCase().includes('BIO'));
          const programme = cols[progIdx] || (isBST ? 'BST (Hons)' : 'BICT (Hons)');
          const department = cols[deptIdx] || (isBST ? 'Department of Bio Systems Technology' : 'Department of Information & Communication Technology');
          const email = cols[emailIdx] || `${reg.toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`;
          const phone = cols[phoneIdx] || '+94 77 000 0000';
          const semester = cols[semIdx] || currentBatch.currentSemester?.split(' ')[0] || 'Semester 1';
          const indexNo = cols[indexIdx] || reg;

          parsed.push({
            id: `BULK-FILE-${Date.now()}-${i}`,
            batchId: currentBatch.id,
            batchCode: currentBatch.name,
            regNo: reg.toUpperCase(),
            indexNo: indexNo.toUpperCase(),
            name,
            programme,
            department,
            semester,
            cgpa: 3.50,
            sgpa: 3.50,
            credits: 0,
            attendance: 100,
            email: email.toLowerCase(),
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

    reader.readAsText(file);
  };

  // Confirm and Bulk Enroll all parsed records
  const handleBulkSubmit = () => {
    if (bulkParsedStudents.length === 0) {
      setBulkError('No student records loaded. Upload a spreadsheet or generate a sample intake roster.');
      return;
    }

    setIsProcessingBulk(true);
    const currentBatch = activeBatch;

    setTimeout(() => {
      const finalized = bulkParsedStudents.map((s) => ({
        ...s,
        batchId: currentBatch.id,
        batchCode: currentBatch.name
      }));

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

    onAddStudent({
      id: `STU-${Date.now()}`,
      batchId: currentBatch.id,
      batchCode: currentBatch.name,
      regNo: newRegNo.trim().toUpperCase(),
      indexNo: newIndexNo.trim() || newRegNo.trim().toUpperCase(),
      name: newName.trim(),
      programme: newProgramme,
      department: newDepartment,
      semester: newSemester,
      cgpa: 3.50,
      sgpa: 3.50,
      credits: 0,
      attendance: 100,
      email: newEmail.trim().toLowerCase(),
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
    setNewPhone('');
    setFormError('');
    setIsAddModalOpen(false);
  };

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
                <div className="adm-stat-value">1,200</div>
                <div className="adm-stat-sub">BICT & BST Undergraduates (5 Batches)</div>
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
                <div className="adm-stat-value">91.4%</div>
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
                <div className="adm-stat-value">3.36 CGPA</div>
                <div className="adm-stat-sub">Second Class Upper Avg</div>
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
                        batch.status.includes('Graduating')
                          ? 'badge-submitted'
                          : batch.status.includes('Freshers')
                          ? 'badge-pending'
                          : 'badge-active'
                      }`}
                    >
                      {batch.status}
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

                  <div className="adm-batch-dept-tags">
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Departments:</span>
                    {batch.departments.map((dept) => (
                      <span key={dept} className="adm-batch-dept-pill">
                        {dept}
                      </span>
                    ))}
                  </div>

                  <div className="adm-batch-metrics">
                    <div className="adm-batch-metric-box">
                      <span className="adm-batch-metric-val">{enrolledCount}</span>
                      <span className="adm-batch-metric-lbl">Students</span>
                    </div>
                    <div className="adm-batch-metric-box">
                      <span className="adm-batch-metric-val">{batch.avgCgpa > 0 ? batch.avgCgpa.toFixed(2) : '3.35'}</span>
                      <span className="adm-batch-metric-lbl">Avg CGPA</span>
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

                  <button
                    type="button"
                    className="adm-batch-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBatch(batch);
                      setCurrentPage(1);
                      setSearchTerm('');
                    }}
                  >
                    <span>View Batch Students & Details</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
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
              </div>
            </div>

            <div className="adm-batch-hero-stats">
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">{getBatchStudentCount(selectedBatch)}</div>
                <div className="adm-batch-hero-stat-lbl">Enrolled</div>
              </div>
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">
                  {selectedBatch.avgCgpa > 0 ? selectedBatch.avgCgpa.toFixed(2) : '3.35'}
                </div>
                <div className="adm-batch-hero-stat-lbl">Avg CGPA</div>
              </div>
              <div className="adm-batch-hero-stat-box">
                <div className="adm-batch-hero-stat-val">{selectedBatch.attendanceRate}%</div>
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
              </select>
            </div>
          </div>

          {/* Students Table for Selected Batch */}
          <div className="adm-table-card">
            <div className="adm-table-wrap">
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
                          <div style={{ fontWeight: 700, color: student.cgpa < 2.5 ? '#b91c1c' : '#0f172a' }}>
                            {student.cgpa.toFixed(2)} CGPA
                          </div>
                          <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                            SGPA: {student.sgpa.toFixed(2)}
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
                              student.status === 'Active'
                                ? 'badge-active'
                                : student.status === 'Academic Warning'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="adm-btn-xs-secondary"
                              onClick={() => setSelectedStudent(student)}
                              title="View Full Academic Dossier"
                            >
                              View Dossier
                            </button>
                            <button
                              type="button"
                              className={`adm-btn-xs-secondary ${student.status === 'Active' ? '' : 'text-emerald'}`}
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
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, batchStudents.length)} of {batchStudents.length} students
                </span>
                <div className="adm-page-nav">
                  <button
                    type="button"
                    className="adm-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
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
                    {selectedStudent.cgpa.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Current Semester GPA</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b5c' }}>
                    {selectedStudent.sgpa.toFixed(2)}
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

            <div className="adm-modal-footer">
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
                        value={targetBatchId || activeBatch.id}
                        onChange={(e) => setTargetBatchId(e.target.value)}
                      >
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.academicYear}) &bull; {b.currentSemester} &bull; Capacity: 240 Students
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
                        onChange={(e) => setNewRegNo(e.target.value)}
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

                    <div className="adm-form-group full-width">
                      <label className="adm-label">Contact Mobile Number</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="+94 77 123 4567"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
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
                {/* Target Batch Selector Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Target Intake Batch for Bulk Enrolment:
                    </label>
                    <select
                      className="adm-input"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', height: 'auto' }}
                      value={targetBatchId || activeBatch.id}
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
                          {b.name} ({b.academicYear}) &bull; {b.currentSemester}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#eff6ff',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>
                      Faculty Standard: 240 Students / Intake (120 BICT + 120 BST)
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons: Template Download + 1-Click 240 Student Generator */}
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
                    Download Excel / CSV Template (.csv)
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
                    Load 240 Students Roster (120 BICT + 120 BST)
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
                        Total Ready: {bulkParsedStudents.length} Students
                      </span>
                      <span className="adm-bulk-chip" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        BICT Department: {bulkParsedStudents.filter((s) => s.department.includes('Information') || s.programme.includes('BICT')).length} Undergraduates
                      </span>
                      <span className="adm-bulk-chip" style={{ background: '#f0fdf4', color: '#15803d' }}>
                        BST Department: {bulkParsedStudents.filter((s) => s.department.includes('Bio') || s.programme.includes('BST')).length} Undergraduates
                      </span>
                      <span className="adm-bulk-chip" style={{ background: '#fef3c7', color: '#92400e' }}>
                        Format: SEU/IS/YY/DEPT/XXX
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
                        Showing {bulkParsedStudents.filter((s) => {
                          if (!bulkSearchTerm) return true;
                          const q = bulkSearchTerm.toLowerCase();
                          return s.regNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
                        }).length} of {bulkParsedStudents.length} records
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
                            <th>Starting Sem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkParsedStudents
                            .filter((s) => {
                              if (!bulkSearchTerm) return true;
                              const q = bulkSearchTerm.toLowerCase();
                              return s.regNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
                            })
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
                                      background: stu.department.includes('Bio') ? '#ecfdf5' : '#eff6ff',
                                      color: stu.department.includes('Bio') ? '#047857' : '#1d4ed8'
                                    }}
                                  >
                                    {stu.department.includes('Bio') ? 'BST' : 'BICT'}
                                  </span>
                                </td>
                                <td style={{ color: '#64748b' }}>{stu.programme}</td>
                                <td style={{ color: '#64748b' }}>{stu.email}</td>
                                <td>{stu.semester}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {bulkParsedStudents.length > 50 && (
                      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', padding: '0.15rem' }}>
                        + {bulkParsedStudents.length - 50} more records ready to be enrolled into {activeBatch.name}.
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
                      opacity: bulkParsedStudents.length === 0 ? 0.6 : 1,
                      cursor: bulkParsedStudents.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                    disabled={bulkParsedStudents.length === 0 || isProcessingBulk}
                    onClick={handleBulkSubmit}
                  >
                    {isProcessingBulk ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Bulk Enrolling {bulkParsedStudents.length} Students...
                      </span>
                    ) : (
                      `Confirm & Bulk Enrol ${bulkParsedStudents.length > 0 ? `(${bulkParsedStudents.length} Students)` : ''}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
