import { useState } from 'react';

export default function StudentManagement({
  batches = [],
  students = [],
  onAddBatch,
  onAddStudent,
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

  // Register New Student Modal State
  const [newRegNo, setNewRegNo] = useState('');
  const [newIndexNo, setNewIndexNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newProgramme, setNewProgramme] = useState('BICT (Hons)');
  const [newDepartment, setNewDepartment] = useState('Information & Communication Technology');
  const [newSemester, setNewSemester] = useState('Semester 1');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState('');

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

  // Handle Registering Student inside a Batch
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!newRegNo.trim() || !newName.trim() || !newEmail.trim()) {
      setFormError('Please fill in Registration Number, Full Name, and University Email.');
      return;
    }

    const assignedBatchId = selectedBatch ? selectedBatch.id : 'BATCH-05';
    const assignedBatchCode = selectedBatch ? selectedBatch.name : 'Batch 05 (2023/2024)';

    onAddStudent({
      id: `STU-${Date.now()}`,
      batchId: assignedBatchId,
      batchCode: assignedBatchCode,
      regNo: newRegNo.trim().toUpperCase(),
      indexNo: newIndexNo.trim() || `SEU/IS/24/${newRegNo.trim().toUpperCase()}`,
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
      specialization: 'General',
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
            <div className="adm-section-actions">
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
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onClick={() => {
                  setNewSemester(selectedBatch.currentSemester.split(' ')[0] || 'Semester 1');
                  setIsAddModalOpen(true);
                }}
              >
                + Register Student to this Batch
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
          MODAL: REGISTER STUDENT TO BATCH
          ========================================================= */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                Register New Student Profile {selectedBatch ? `(${selectedBatch.name})` : ''}
              </h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <div className="adm-modal-body">
                {formError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    {formError}
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Registration No (e.g. SEU/IS/22/ICT/091) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="SEU/IS/22/ICT/091"
                      value={newRegNo}
                      onChange={(e) => setNewRegNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Index No (e.g. SEU/IS/22/ICT/091)</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="SEU/IS/22/ICT/091"
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
                      onChange={(e) => setNewProgramme(e.target.value)}
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
                      onChange={(e) => setNewDepartment(e.target.value)}
                    >
                      <option value="Information & Communication Technology">Department of Information & Communication Technology</option>
                      <option value="Biosystems Technology">Department of Bio Systems Technology</option>
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
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 7">Semester 7</option>
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
          </div>
        </div>
      )}
    </div>
  );
}
