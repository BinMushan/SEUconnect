import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SUBJECTS, ENROLLMENT_STUDENTS_LIST } from './lecturerMockData.js';

/**
 * StudentEnrollment Component
 * Subject-wise Enrollment Management for SEUConnect Lecturer Portal.
 * 
 * Complies with Section 7.2 (Subject Registration) of the
 * Faculty of Technology Undergraduate Handbook 2023/2024:
 * - Dynamic aggregation of registered student counts per assigned subject
 * - No deduplication (total = sum of registered students across allocated subjects)
 * - Subject-wise drilldown with registered students list
 * - Reactive search, multi-field filtering, pagination, and CSV/Excel exports
 */
export default function StudentEnrollment({
  subjects = INITIAL_SUBJECTS,
  initialSubjectCode = 'ALL',
  onShowToast,
}) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];

  // Navigation & View mode: 'overview' (Subject-wise Overview) or 'students' (Registered Students List)
  const [activeTab, setActiveTab] = useState(initialSubjectCode !== 'ALL' ? 'students' : 'overview');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(initialSubjectCode);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Synchronize when initialSubjectCode prop changes (e.g. navigation from MySubjects)
  useEffect(() => {
    if (initialSubjectCode && initialSubjectCode !== 'ALL') {
      setSelectedSubjectCode(initialSubjectCode);
      setActiveTab('students');
      setCurrentPage(1);
    }
  }, [initialSubjectCode]);

  // Calculate subject-level statistics dynamically from ENROLLMENT_STUDENTS_LIST
  const subjectStats = useMemo(() => {
    return availableSubjects.map((sub) => {
      const subjectStudents = ENROLLMENT_STUDENTS_LIST.filter((s) => s.subjectCode === sub.code);
      const registeredCount = subjectStudents.filter((s) => s.status === 'Registered').length;
      const pendingCount = subjectStudents.filter((s) => s.status === 'Pending').length;
      const droppedCount = subjectStudents.filter((s) => s.status === 'Dropped').length;
      return {
        ...sub,
        totalEnrolled: subjectStudents.length,
        registeredCount,
        pendingCount,
        droppedCount,
      };
    });
  }, [availableSubjects]);

  // Total students sum (no deduplication, matching Section 7.2 regulations)
  const totalStudentsEnrolled = useMemo(() => {
    return subjectStats.reduce((acc, curr) => acc + curr.totalEnrolled, 0);
  }, [subjectStats]);

  const totalRegisteredCount = useMemo(() => {
    return subjectStats.reduce((acc, curr) => acc + curr.registeredCount, 0);
  }, [subjectStats]);

  const totalPendingCount = useMemo(() => {
    return subjectStats.reduce((acc, curr) => acc + curr.pendingCount, 0);
  }, [subjectStats]);

  const totalDroppedCount = useMemo(() => {
    return subjectStats.reduce((acc, curr) => acc + curr.droppedCount, 0);
  }, [subjectStats]);

  // Handle drill-down into specific subject students
  const handleViewSubjectStudents = (subjectCode) => {
    setSelectedSubjectCode(subjectCode);
    setActiveTab('students');
    setCurrentPage(1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterBatch('ALL');
    setFilterYear('ALL');
    setFilterSemester('ALL');
    setFilterStatus('ALL');
    setSelectedSubjectCode('ALL');
    setCurrentPage(1);
    if (onShowToast) {
      onShowToast('Enrollment filters have been reset.', 'info');
    }
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    filterBatch !== 'ALL' ||
    filterYear !== 'ALL' ||
    filterSemester !== 'ALL' ||
    filterStatus !== 'ALL' ||
    selectedSubjectCode !== 'ALL';

  // Filter students reactively
  const filteredStudents = useMemo(() => {
    return ENROLLMENT_STUDENTS_LIST.filter((student) => {
      // 1. Subject filter
      if (selectedSubjectCode !== 'ALL' && student.subjectCode !== selectedSubjectCode) {
        return false;
      }

      // 2. Batch filter
      if (filterBatch !== 'ALL' && student.batch !== filterBatch) {
        return false;
      }

      // 3. Academic Year filter
      if (filterYear !== 'ALL' && student.academicYear !== filterYear) {
        return false;
      }

      // 4. Semester filter
      if (filterSemester !== 'ALL' && student.semester !== filterSemester) {
        return false;
      }

      // 5. Status filter
      if (filterStatus !== 'ALL' && student.status !== filterStatus) {
        return false;
      }

      // 6. Search query (Student ID or Name)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchId = student.regNo.toLowerCase().includes(query);
        const matchName = student.name.toLowerCase().includes(query);
        if (!matchId && !matchName) return false;
      }

      return true;
    });
  }, [selectedSubjectCode, filterBatch, filterYear, filterSemester, filterStatus, searchQuery]);

  // Pagination calculation
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    if (pageSize === -1) return filteredStudents;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // =========================================================================
  // EXPORT UTILITIES (CSV & EXCEL)
  // =========================================================================

  const getExportFilename = (format) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const subjectPrefix = selectedSubjectCode !== 'ALL' ? selectedSubjectCode : 'All_Assigned_Subjects';
    return `SEUSL_${subjectPrefix}_Enrollment_${dateStr}.${format}`;
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      if (onShowToast) onShowToast('No student records to export.', 'warning');
      return;
    }

    const subjectLabel = selectedSubjectCode !== 'ALL'
      ? `${selectedSubjectCode} (${availableSubjects.find((s) => s.code === selectedSubjectCode)?.name || ''})`
      : 'All Assigned Course Modules';

    const headerLines = [
      '# South Eastern University of Sri Lanka - Faculty of Technology',
      '# Department of ICT - Student Enrollment & Registration Ledger',
      `# Subject Context: ${subjectLabel}`,
      '# Regulation Compliance: Section 7.2 (Subject Registration)',
      `# Generated: ${new Date().toLocaleString()}`,
      `# Total Records: ${filteredStudents.length}`,
      '',
      '"#","Student ID (Reg No)","Student Full Name","Academic Batch","Degree Programme","Academic Year","Semester","Subject Code","Subject Name","Registration Status","Official University Email"',
    ];

    const dataRows = filteredStudents.map((st, idx) => {
      return [
        idx + 1,
        `"${st.regNo}"`,
        `"${st.name}"`,
        `"${st.batch}"`,
        `"${st.degreeProgramme}"`,
        `"${st.academicYear}"`,
        `"${st.semester}"`,
        `"${st.subjectCode}"`,
        `"${st.subjectName}"`,
        `"${st.status}"`,
        `"${st.email}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + headerLines.concat(dataRows).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getExportFilename('csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Exported ${filteredStudents.length} student enrollment records to CSV.`, 'success');
    }
  };

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      if (onShowToast) onShowToast('No student records to export.', 'warning');
      return;
    }

    const subjectLabel = selectedSubjectCode !== 'ALL'
      ? `${selectedSubjectCode} - ${availableSubjects.find((s) => s.code === selectedSubjectCode)?.name || ''}`
      : 'All Assigned Modules';

    // Generate SpreadsheetML XML (Excel 2003+ XML format supported natively by Excel with styling)
    const xmlRows = filteredStudents.map((st, idx) => {
      const statusColor = st.status === 'Registered' ? '#047857' : st.status === 'Pending' ? '#b45309' : '#b91c1c';
      return `
        <Row>
          <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
          <Cell><Data ss:Type="String">${st.regNo}</Data></Cell>
          <Cell><Data ss:Type="String">${st.name}</Data></Cell>
          <Cell><Data ss:Type="String">${st.batch}</Data></Cell>
          <Cell><Data ss:Type="String">${st.degreeProgramme}</Data></Cell>
          <Cell><Data ss:Type="String">${st.academicYear}</Data></Cell>
          <Cell><Data ss:Type="String">${st.semester}</Data></Cell>
          <Cell><Data ss:Type="String">${st.subjectCode}</Data></Cell>
          <Cell><Data ss:Type="String">${st.subjectName}</Data></Cell>
          <Cell ss:StyleID="Status_${st.status}"><Data ss:Type="String">${st.status}</Data></Cell>
          <Cell><Data ss:Type="String">${st.email}</Data></Cell>
        </Row>`;
    }).join('');

    const xmlWorkbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#ffffff" ss:FontName="Calibri" ss:Size="11"/>
      <Interior ss:Color="#0f2b5c" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:Bold="1" ss:Color="#0f2b5c" ss:FontName="Calibri" ss:Size="14"/>
    </Style>
    <Style ss:ID="SubTitle">
      <Font ss:Italic="1" ss:Color="#475569" ss:FontName="Calibri" ss:Size="10"/>
    </Style>
    <Style ss:ID="Status_Registered">
      <Font ss:Color="#047857" ss:Bold="1"/>
      <Interior ss:Color="#ecfdf5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Status_Pending">
      <Font ss:Color="#b45309" ss:Bold="1"/>
      <Interior ss:Color="#fffbeb" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Status_Dropped">
      <Font ss:Color="#b91c1c" ss:Bold="1"/>
      <Interior ss:Color="#fef2f2" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Enrollment_Ledger">
    <Table>
      <Column ss:Width="40"/>
      <Column ss:Width="90"/>
      <Column ss:Width="160"/>
      <Column ss:Width="90"/>
      <Column ss:Width="100"/>
      <Column ss:Width="80"/>
      <Column ss:Width="90"/>
      <Column ss:Width="90"/>
      <Column ss:Width="200"/>
      <Column ss:Width="100"/>
      <Column ss:Width="160"/>
      <Row>
        <Cell ss:StyleID="Title"><Data ss:Type="String">South Eastern University of Sri Lanka — Faculty of Technology</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="SubTitle"><Data ss:Type="String">Department of ICT • Student Enrollment &amp; Registration Ledger (Handbook Section 7.2)</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="SubTitle"><Data ss:Type="String">Context: ${subjectLabel} | Exported: ${new Date().toLocaleString()} | Total Records: ${filteredStudents.length}</Data></Cell>
      </Row>
      <Row></Row>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">#</Data></Cell>
        <Cell><Data ss:Type="String">Student ID</Data></Cell>
        <Cell><Data ss:Type="String">Student Full Name</Data></Cell>
        <Cell><Data ss:Type="String">Academic Batch</Data></Cell>
        <Cell><Data ss:Type="String">Degree Programme</Data></Cell>
        <Cell><Data ss:Type="String">Academic Year</Data></Cell>
        <Cell><Data ss:Type="String">Semester</Data></Cell>
        <Cell><Data ss:Type="String">Subject Code</Data></Cell>
        <Cell><Data ss:Type="String">Subject Name</Data></Cell>
        <Cell><Data ss:Type="String">Registration Status</Data></Cell>
        <Cell><Data ss:Type="String">University Email</Data></Cell>
      </Row>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlWorkbook], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getExportFilename('xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Exported ${filteredStudents.length} student enrollment records to Excel (.xlsx).`, 'success');
    }
  };

  const selectedSubjectObj = availableSubjects.find((s) => s.code === selectedSubjectCode);

  if (availableSubjects.length === 0) {
    return (
      <div className="lec-enrollment-container">
        <div className="lec-module-header-card">
          <div>
            <h2 className="lec-module-title">Student Enrollment &amp; Subject-wise Registration</h2>
            <p className="lec-module-sub">
              Faculty of Technology • Department of ICT • BICT (Hons) Programme • Handbook Section 7.2 Subject Registration
            </p>
          </div>
        </div>
        <div className="lec-empty-state-card" style={{ padding: '60px 24px', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1', textAlign: 'center', margin: '24px 0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No Enrolled Students</h4>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            You currently have no course modules assigned. When your Head of Department (HOD) assigns subjects to you, your registered student cohorts will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lec-enrollment-container">
      {/* 1. Module Header Card */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Student Enrollment &amp; Subject-wise Registration</h2>
          <p className="lec-module-sub">
            Faculty of Technology • Department of ICT • BICT (Hons) Programme • Handbook Section 7.2 Subject Registration
          </p>
        </div>

        <div className="lec-enrollment-header-actions">
          <div className="lec-handbook-pill" title="Subject Registration regulations under Faculty of Technology Handbook 2023/2024">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Section 7.2 By-Laws Compliant</span>
          </div>

          <button
            type="button"
            className="lec-btn-quick-export-all"
            onClick={handleExportExcel}
            title="Export all student enrollment details to Excel (.xlsx)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export All (.xlsx)
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Section 1: Total Students Overview) */}
      <div className="lec-enrollment-kpi-grid">
        {/* Card 1: Total Students Registered */}
        <div className="lec-enrollment-kpi-card kpi-total">
          <div className="kpi-header">
            <span className="kpi-icon-wrap icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="kpi-badge badge-blue">Total Enrolled</span>
          </div>
          <div className="kpi-value">{totalStudentsEnrolled}</div>
          <div className="kpi-label">Registered Student Seats</div>
          <div className="kpi-subtext">Sum across {availableSubjects.length} assigned subjects • No deduplication</div>
        </div>

        {/* Card 2: Assigned Subjects */}
        <div className="lec-enrollment-kpi-card kpi-subjects">
          <div className="kpi-header">
            <span className="kpi-icon-wrap icon-indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span className="kpi-badge badge-indigo">{availableSubjects.length} Allocated</span>
          </div>
          <div className="kpi-value">{availableSubjects.length}</div>
          <div className="kpi-label">Assigned Course Modules</div>
          <div className="kpi-subtext">Current Semester active curriculum modules</div>
        </div>

        {/* Card 3: Confirmed Registrations */}
        <div className="lec-enrollment-kpi-card kpi-confirmed">
          <div className="kpi-header">
            <span className="kpi-icon-wrap icon-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <span className="kpi-badge badge-emerald">Confirmed</span>
          </div>
          <div className="kpi-value">{totalRegisteredCount}</div>
          <div className="kpi-label">Confirmed Registrations</div>
          <div className="kpi-subtext">Validated by Academic Advisor &amp; Department</div>
        </div>

        {/* Card 4: Pending / Dropped */}
        <div className="lec-enrollment-kpi-card kpi-pending">
          <div className="kpi-header">
            <span className="kpi-icon-wrap icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span className="kpi-badge badge-amber">{totalPendingCount} Pending</span>
          </div>
          <div className="kpi-value">
            {totalPendingCount} <span className="kpi-value-sub">/ {totalDroppedCount} Dropped</span>
          </div>
          <div className="kpi-label">Pending Verification / Dropped</div>
          <div className="kpi-subtext">Within prescribed add/drop adjustment window</div>
        </div>
      </div>

      {/* 3. Navigation Mode Bar */}
      <div className="lec-enrollment-tabs-bar">
        <div className="lec-tabs-group">
          <button
            type="button"
            className={`lec-tab-pill-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setSelectedSubjectCode('ALL');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Subject-wise Enrollment Overview
          </button>

          <button
            type="button"
            className={`lec-tab-pill-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Registered Students Directory ({filteredStudents.length})
          </button>
        </div>

        {activeTab === 'students' && selectedSubjectCode !== 'ALL' && (
          <button
            type="button"
            className="lec-btn-back-overview"
            onClick={() => {
              setActiveTab('overview');
              setSelectedSubjectCode('ALL');
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Subject Overview
          </button>
        )}
      </div>

      {/* =====================================================================
          VIEW 1: SUBJECT-WISE ENROLLMENT OVERVIEW (Cards Layout)
          ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="lec-subject-enrollment-view">
          <div className="lec-section-intro-row">
            <div>
              <h3 className="lec-view-heading">Assigned Subject Cohort Allocations</h3>
              <p className="lec-view-sub">
                Official registration rosters per allocated course module. Click any subject or "View Students" to inspect and filter registered student details.
              </p>
            </div>
            <div className="lec-view-badge">
              <span>Semester 2025/2026 • Term II</span>
            </div>
          </div>

          <div className="lec-subject-enrollment-grid">
            {subjectStats.map((sub) => {
              const regPct = Math.round((sub.registeredCount / sub.totalEnrolled) * 100) || 0;
              return (
                <div key={sub.code} className="lec-subject-enroll-card">
                  <div className="sub-card-top-row">
                    <div className="sub-badges">
                      <span className="sub-code-badge">{sub.code}</span>
                      <span className="sub-batch-pill">Batch {sub.batch}</span>
                      <span className="sub-sem-pill">{sub.semester}</span>
                    </div>
                    <span className="sub-credits-badge">{sub.credits} Credits</span>
                  </div>

                  <h3 className="sub-title">{sub.name}</h3>

                  <div className="sub-meta-grid">
                    <div className="meta-item">
                      <span className="meta-lbl">Academic Year:</span>
                      <span className="meta-val">{sub.academicYear || 'Year 2'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Degree Programme:</span>
                      <span className="meta-val">BICT (Hons)</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Venue / Schedule:</span>
                      <span className="meta-val">{sub.schedule}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Total Registered:</span>
                      <span className="meta-val highlight-val">{sub.totalEnrolled} Students</span>
                    </div>
                  </div>

                  {/* Enrollment Status Breakdown */}
                  <div className="sub-breakdown-box">
                    <div className="breakdown-header">
                      <span>Registration Confirmation</span>
                      <span className="breakdown-pct">{regPct}% Confirmed</span>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{ width: `${regPct}%`, backgroundColor: '#10b981' }}
                      />
                    </div>
                    <div className="breakdown-pills">
                      <span className="pill-registered">{sub.registeredCount} Registered</span>
                      {sub.pendingCount > 0 && <span className="pill-pending">{sub.pendingCount} Pending</span>}
                      {sub.droppedCount > 0 && <span className="pill-dropped">{sub.droppedCount} Dropped</span>}
                    </div>
                  </div>

                  {/* Subject Card Actions */}
                  <div className="sub-card-actions">
                    <button
                      type="button"
                      className="lec-btn-view-students"
                      onClick={() => handleViewSubjectStudents(sub.code)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      View Registered Students ({sub.totalEnrolled})
                    </button>

                    <button
                      type="button"
                      className="lec-btn-export-subject-csv"
                      onClick={() => {
                        setSelectedSubjectCode(sub.code);
                        setTimeout(() => handleExportCSV(), 50);
                      }}
                      title={`Export CSV for ${sub.code}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      CSV
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Handbook Section 7.2 Guidance Banner */}
          <div className="lec-handbook-banner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Faculty Handbook Section 7.2 (Subject Registration Requirements):</strong> Students are admitted to continuous assessments (CA) and end-of-semester examinations (ESA) strictly on the basis of approved registration. Students who fail to confirm registration or maintain 80% attendance in lab/theory sessions are subject to repeat candidacy under faculty examination regulations.
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: REGISTERED STUDENTS LIST (Detailed Table & Search / Filter)
          ===================================================================== */}
      {activeTab === 'students' && (
        <div className="lec-students-directory-view">
          {/* Active Context Bar if a Subject is Selected */}
          {selectedSubjectCode !== 'ALL' && selectedSubjectObj && (
            <div className="lec-active-subject-bar">
              <div className="subject-meta-left">
                <span className="meta-code-tag">{selectedSubjectObj.code}</span>
                <span className="meta-name-tag">{selectedSubjectObj.name}</span>
                <span className="meta-batch-tag">Batch {selectedSubjectObj.batch}</span>
                <span className="meta-sem-tag">{selectedSubjectObj.semester}</span>
              </div>
              <div className="subject-meta-right">
                <span className="meta-count-pill">
                  {filteredStudents.length} Students Displayed
                </span>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="lec-enrollment-filter-bar">
            {/* Search Input */}
            <div className="lec-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by Student ID (e.g. 21ICT001) or Full Name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="lec-search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Selects */}
            <div className="lec-filter-selects-row">
              {/* Subject Filter */}
              <div className="filter-item">
                <label>Assigned Subject:</label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => {
                    setSelectedSubjectCode(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Assigned Subjects ({totalStudentsEnrolled})</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} — {sub.name} ({sub.studentsCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="filter-item">
                <label>Academic Batch:</label>
                <select
                  value={filterBatch}
                  onChange={(e) => {
                    setFilterBatch(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Batches</option>
                  <option value="2021/2022">Batch 2021/2022</option>
                  <option value="2022/2023">Batch 2022/2023</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div className="filter-item">
                <label>Semester:</label>
                <select
                  value={filterSemester}
                  onChange={(e) => {
                    setFilterSemester(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Semesters</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-item">
                <label>Registration Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Registered">Registered (Confirmed)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Dropped">Dropped (Add/Drop)</option>
                </select>
              </div>

              {/* Reset Filters Action */}
              {isFiltered && (
                <button
                  type="button"
                  className="lec-btn-reset-filters"
                  onClick={handleResetFilters}
                  title="Clear all search keywords and dropdown filters"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Export Actions Toolbar */}
            <div className="lec-export-btn-group">
              <button
                type="button"
                className="lec-btn-export-csv"
                onClick={handleExportCSV}
                title="Export active student records to CSV"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>

              <button
                type="button"
                className="lec-btn-export-excel"
                onClick={handleExportExcel}
                title="Export active student records to Excel (.xlsx)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Export Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Active Filter Counter */}
          <div className="lec-filter-summary-row">
            <span className="summary-text">
              Showing <strong>{filteredStudents.length}</strong> registered student records
              {selectedSubjectCode !== 'ALL' && ` for ${selectedSubjectCode}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            <span className="handbook-indicator">Section 7.2 Validated Roster</span>
          </div>

          {/* 4. Registered Students Ledger Table */}
          <div className="lec-enrollment-table-card">
            {filteredStudents.length === 0 ? (
              <div className="lec-empty-state-card">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <h4>No Registered Students Found</h4>
                <p>No student enrollment records match your search or active filter combination.</p>
                <button
                  type="button"
                  className="lec-btn-reset-filters"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="lec-table-scroll-container">
                <table className="lec-custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th style={{ width: '130px' }}>Student ID</th>
                      <th>Student Full Name</th>
                      <th>Academic Batch</th>
                      <th>Degree Programme</th>
                      <th>Semester</th>
                      <th>Assigned Subject</th>
                      <th style={{ width: '140px' }}>Registration Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, idx) => {
                      const absoluteIdx = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={student.id}>
                          <td className="text-muted">{absoluteIdx}</td>
                          <td>
                            <span className="lec-regno-pill">{student.regNo}</span>
                          </td>
                          <td>
                            <div className="student-name-cell">
                              <span className="lec-student-name">{student.name}</span>
                              <span className="student-email-sub">{student.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className="lec-batch-tag">{student.batch}</span>
                          </td>
                          <td>
                            <span className="lec-degree-tag">{student.degreeProgramme}</span>
                          </td>
                          <td>
                            <span className="lec-sem-tag">{student.semester}</span>
                          </td>
                          <td>
                            <span className="lec-subject-chip" title={student.subjectName}>
                              {student.subjectCode}
                            </span>
                          </td>
                          <td>
                            <span className={`lec-status-pill status-${student.status.toLowerCase()}`}>
                              {student.status === 'Registered' && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                              {student.status === 'Pending' && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                </svg>
                              )}
                              {student.status === 'Dropped' && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              )}
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="lec-pagination-bar">
                <div className="pagination-info">
                  Showing <strong>{Math.min(filteredStudents.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
                  <strong>{pageSize === -1 ? filteredStudents.length : Math.min(filteredStudents.length, currentPage * pageSize)}</strong> of{' '}
                  <strong>{filteredStudents.length}</strong> students
                </div>

                <div className="pagination-controls">
                  <div className="rows-per-page">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={-1}>All ({filteredStudents.length})</option>
                    </select>
                  </div>

                  {pageSize !== -1 && totalPages > 1 && (
                    <div className="page-nav-buttons">
                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        title="First Page"
                      >
                        «
                      </button>
                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        title="Previous Page"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        title="Next Page"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        title="Last Page"
                      >
                        »
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

