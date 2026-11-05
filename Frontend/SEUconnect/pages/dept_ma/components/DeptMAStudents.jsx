import React, { useState, useMemo } from 'react';

export default function DeptMAStudents({
  students,
  deptInfo,
  onUpdateStudent,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit form state for permitted student fields
  const [editForm, setEditForm] = useState({
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    status: 'Active',
    notes: '',
  });

  // Student Document Dossier State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Registration Slips');
  const [newDocSemester, setNewDocSemester] = useState('Semester 3');

  const defaultDossierDocs = [
    {
      id: 'DOC-STU-01',
      title: 'Course Registration Confirmation Slip (Signed)',
      category: 'Registration Slips',
      semester: 'Semester 3',
      uploadDate: '2026-10-14',
      size: '520 KB',
      type: 'PDF',
      uploadedBy: 'Mrs. K. N. Fathima (Dept MA)',
    },
    {
      id: 'DOC-STU-02',
      title: 'G.C.E. Advanced Level Official Certificate',
      category: 'Admission Credentials',
      semester: 'Enrollment',
      uploadDate: '2023-01-10',
      size: '1.4 MB',
      type: 'PDF',
      uploadedBy: 'AR Office (Academic Branch)',
    },
    {
      id: 'DOC-STU-03',
      title: 'National Identity Card (NIC) Copy & Photo Slip',
      category: 'Identity Verification',
      semester: 'Enrollment',
      uploadDate: '2023-01-10',
      size: '780 KB',
      type: 'PDF',
      uploadedBy: 'AR Office (Academic Branch)',
    },
    {
      id: 'DOC-STU-04',
      title: 'Continuous Assessment Medical Excuse Endorsement Dossier',
      category: 'Medical Concessions',
      semester: 'Semester 3',
      uploadDate: '2026-10-25',
      size: '890 KB',
      type: 'PDF',
      uploadedBy: 'Mrs. K. N. Fathima (Dept MA)',
    },
    {
      id: 'DOC-STU-05',
      title: 'Student Undertaking & Code of Conduct Agreement',
      category: 'Affidavits & Undertakings',
      semester: 'Enrollment',
      uploadDate: '2023-01-12',
      size: '430 KB',
      type: 'PDF',
      uploadedBy: 'Office of the Dean',
    },
  ];

  const handleDownloadStudentDoc = (doc) => {
    try {
      const blob = new Blob(
        [
          `SOUTH EASTERN UNIVERSITY OF SRI LANKA\nFACULTY OF TECHNOLOGY - DEPARTMENT OF ICT\n\nOFFICIAL STUDENT ACADEMIC DOSSIER RECORD\nDocument: ${doc.title}\nCategory: ${doc.category} (${doc.semester})\nStudent: ${selectedStudent?.name} (${selectedStudent?.regNo})\nAcademic Batch: ${selectedStudent?.batch} • Degree: ${selectedStudent?.programme}\nArchived by: ${doc.uploadedBy} on ${doc.uploadDate}\n\nVerified certified copy on record in ICT Department Archives.`
        ],
        { type: 'text/plain;charset=utf-8;' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedStudent?.regNo}_${doc.category.replace(/\s+/g, '_')}_${doc.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast(`Downloaded student document: ${doc.title}`, 'success');
    } catch {
      onShowToast(`Failed to download document.`, 'error');
    }
  };

  const handleUploadDossierDoc = (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      onShowToast('Please provide a document title.', 'error');
      return;
    }
    onShowToast(`Document "${newDocTitle}" successfully archived into ${selectedStudent?.regNo} dossier.`, 'success');
    setNewDocTitle('');
  };

  // Filter options
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);
  const semesters = useMemo(
    () => ['ALL', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    []
  );
  const statuses = ['ALL', 'Active', 'On Medical Leave', 'Probation'];

  // Filtered students dataset
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (q) {
        const matches =
          s.regNo.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterBatch !== 'ALL' && s.batch !== filterBatch) return false;
      if (filterSemester !== 'ALL' && s.semester !== filterSemester) return false;
      if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
      return true;
    });
  }, [students, searchQuery, filterBatch, filterSemester, filterStatus]);

  const handleOpenStudent = (student) => {
    setSelectedStudent(student);
    setEditForm({
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      address: student.address || '',
      status: student.status || 'Active',
      notes: student.notes || '',
    });
    setIsEditMode(false);
    setActiveTab('overview');
  };

  const handleSavePermittedUpdates = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updated = {
      ...selectedStudent,
      phone: editForm.phone,
      emergencyContact: editForm.emergencyContact,
      emergencyPhone: editForm.emergencyPhone,
      address: editForm.address,
      status: editForm.status,
      notes: editForm.notes,
    };

    onUpdateStudent(updated);
    setSelectedStudent(updated);
    setIsEditMode(false);
    onShowToast(`Student record for ${updated.regNo} updated successfully by Department MA.`, 'success');
  };

  return (
    <div className="dept-ma-students-section">
      {/* 1. Header Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <div className="dept-ma-search-input-wrap">
            <span className="dept-ma-search-icon">🔍</span>
            <input
              type="text"
              className="dept-ma-search-input"
              placeholder="Search by Reg No, Student Name, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="dept-ma-filter-select"
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b} value={b}>
                {b === 'ALL' ? 'All Batches' : `Batch: ${b}`}
              </option>
            ))}
          </select>

          <select
            className="dept-ma-filter-select"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Semesters' : s}
              </option>
            ))}
          </select>

          <select
            className="dept-ma-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Statuses' : st}
              </option>
            ))}
          </select>
        </div>

        <div className="dept-ma-toolbar-right">
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
          </span>
        </div>
      </div>

      {/* 2. Department Isolation Notice */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>🔒</span>
        <span>
          <strong>Role-Based Access Control:</strong> Department MA access is restricted to the{' '}
          <strong>{deptInfo.departmentName}</strong>. Grade records are strictly read-only and maintained by Lecturers and the Examination Branch.
        </span>
      </div>

      {/* 3. Students Table */}
      <div className="dept-ma-table-container">
        <div className="dept-ma-table-wrapper">
          <table className="dept-ma-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Student Full Name</th>
                <th>Academic Batch</th>
                <th>Semester</th>
                <th>Programme</th>
                <th>Attendance Rate</th>
                <th>Academic Standing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.regNo}>
                    <td>
                      <span className="dept-ma-tracking-pill" style={{ color: '#0284c7', background: '#f0f9ff' }}>
                        {student.regNo}
                      </span>
                    </td>
                    <td>
                      <strong>{student.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.email}</div>
                    </td>
                    <td>{student.batch}</td>
                    <td>{student.semester}</td>
                    <td>{student.programme}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: '700',
                          color: student.attendanceRate >= 80 ? '#059669' : student.attendanceRate >= 70 ? '#b45309' : '#dc2626',
                        }}
                      >
                        {student.attendanceRate}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                        CGPA: {student.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`dept-ma-status-badge ${
                          student.status === 'Active'
                            ? 'active'
                            : student.status === 'On Medical Leave'
                            ? 'under-review'
                            : 'rejected'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dept-ma-btn-action secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        onClick={() => handleOpenStudent(student)}
                      >
                        View / Edit Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No students found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Student Details & Permitted Edit Modal */}
      {selectedStudent && (
        <div className="dept-ma-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            {/* Modal Header */}
            <div className="dept-ma-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="dept-ma-tracking-pill">{selectedStudent.regNo}</span>
                  <span
                    className={`dept-ma-status-badge ${
                      selectedStudent.status === 'Active' ? 'active' : 'under-review'
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </div>
                <h3 className="dept-ma-modal-title">{selectedStudent.name}</h3>
                <p className="dept-ma-modal-subtitle">
                  {deptInfo.departmentName} • Batch {selectedStudent.batch}
                </p>
              </div>

              <button
                type="button"
                className="dept-ma-modal-close"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                className={`dept-ma-btn-action ${activeTab === 'overview' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setActiveTab('overview');
                  setIsEditMode(false);
                }}
              >
                👤 Student Overview
              </button>
              <button
                type="button"
                className={`dept-ma-btn-action ${activeTab === 'grades' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setActiveTab('grades');
                  setIsEditMode(false);
                }}
              >
                📊 Academic Standing & Grades (Read-Only)
              </button>
              <button
                type="button"
                className={`dept-ma-btn-action ${activeTab === 'edit' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setActiveTab('edit');
                  setIsEditMode(true);
                }}
              >
                Update Permitted Details
              </button>
              <button
                type="button"
                className={`dept-ma-btn-action ${activeTab === 'dossier' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setActiveTab('dossier');
                  setIsEditMode(false);
                }}
              >
                Student Documents Dossier
              </button>
            </div>

            {/* Modal Body */}
            <div className="dept-ma-modal-body">
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      background: '#f8fafc',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>REGISTRATION NUMBER</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{selectedStudent.regNo}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>STUDENT ID</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{selectedStudent.studentId}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>DEGREE PROGRAMME</span>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedStudent.programme}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>ACADEMIC BATCH</span>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedStudent.batch}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>CURRENT SEMESTER</span>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedStudent.semester}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>ACADEMIC ADVISOR</span>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedStudent.advisor}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: '#0f172a' }}>
                      📞 Contact & Emergency Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem' }}>
                      <div>
                        <strong>Primary Phone:</strong> {selectedStudent.phone || 'N/A'}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedStudent.email}
                      </div>
                      <div>
                        <strong>Emergency Contact:</strong> {selectedStudent.emergencyContact || 'N/A'}
                      </div>
                      <div>
                        <strong>Emergency Phone:</strong> {selectedStudent.emergencyPhone || 'N/A'}
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Residential Address:</strong> {selectedStudent.address || 'N/A'}
                      </div>
                      <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', color: '#64748b' }}>
                        <strong>Department Notes:</strong> {selectedStudent.notes || 'No specific notes recorded.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'grades' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Read-Only Banner */}
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      padding: '1rem',
                      fontSize: '0.84rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div>
                      <strong>Academic Authority Boundary:</strong> Grades, GPA, and Examination results are controlled strictly by Course Lecturers and the Faculty Examination Branch. The Department MA is authorized for <strong>view-only reference</strong>.
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>CUMULATIVE GPA</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                        {selectedStudent.cgpa.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>Good Standing</div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>ATTENDANCE RATE</div>
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '800',
                          color: selectedStudent.attendanceRate >= 80 ? '#059669' : '#b45309',
                        }}
                      >
                        {selectedStudent.attendanceRate}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {selectedStudent.attendanceRate >= 80 ? 'Statutory >= 80% Met' : 'Under 80% Threshold'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>REGISTERED CREDITS</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                        {selectedStudent.enrolledCredits}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Regular Load</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dossier' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Header Notice */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.85rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                        Authorized Student Academic Documents Dossier (Responsibility 6)
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Dossier for {selectedStudent.name} ({selectedStudent.regNo}) • Organized by document type, batch, and semester.
                      </div>
                    </div>
                    <span className="dept-ma-badge-pill" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                      5 Verified Documents On Record
                    </span>
                  </div>

                  {/* Documents List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {defaultDossierDocs.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📄</span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                              {doc.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {doc.category} • {doc.semester} • Uploaded by {doc.uploadedBy} on {doc.uploadDate} ({doc.size})
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="dept-ma-btn-action secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleDownloadStudentDoc(doc)}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload New Document Form */}
                  <form
                    onSubmit={handleUploadDossierDoc}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                      Archive New Document to Student Dossier
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                          DOCUMENT TITLE
                        </label>
                        <input
                          type="text"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.75rem', width: '100%' }}
                          placeholder="e.g. Semester 4 Add/Drop Slip..."
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                          DOCUMENT CATEGORY
                        </label>
                        <select
                          className="dept-ma-filter-select"
                          style={{ width: '100%', background: '#ffffff' }}
                          value={newDocCategory}
                          onChange={(e) => setNewDocCategory(e.target.value)}
                        >
                          <option value="Registration Slips">Registration Slips</option>
                          <option value="Admission Credentials">Admission Credentials</option>
                          <option value="Identity Verification">Identity Verification</option>
                          <option value="Medical Concessions">Medical Concessions</option>
                          <option value="Affidavits & Undertakings">Affidavits & Undertakings</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                          SEMESTER
                        </label>
                        <select
                          className="dept-ma-filter-select"
                          style={{ width: '100%', background: '#ffffff' }}
                          value={newDocSemester}
                          onChange={(e) => setNewDocSemester(e.target.value)}
                        >
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                          <option value="Semester 3">Semester 3</option>
                          <option value="Semester 4">Semester 4</option>
                          <option value="Semester 5">Semester 5</option>
                          <option value="Semester 6">Semester 6</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button type="submit" className="dept-ma-btn-action primary" style={{ fontSize: '0.78rem' }}>
                        Archive Document to Dossier
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'edit' && (
                <form onSubmit={handleSavePermittedUpdates}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      As Department MA, you are authorized to update permitted contact, emergency, and administrative notes for <strong>{selectedStudent.regNo}</strong>.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Primary Contact Phone *
                        </label>
                        <input
                          type="text"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.85rem' }}
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Academic Status *
                        </label>
                        <select
                          className="dept-ma-filter-select"
                          style={{ width: '100%' }}
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="On Medical Leave">On Medical Leave</option>
                          <option value="Probation">Probation</option>
                          <option value="Deferred">Deferred</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Emergency Contact Person & Relationship
                        </label>
                        <input
                          type="text"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.85rem' }}
                          value={editForm.emergencyContact}
                          onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Emergency Phone Number
                        </label>
                        <input
                          type="text"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.85rem' }}
                          value={editForm.emergencyPhone}
                          onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Residential Address
                        </label>
                        <input
                          type="text"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.85rem' }}
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Department MA Administrative Notes
                        </label>
                        <textarea
                          rows="3"
                          className="dept-ma-search-input"
                          style={{ paddingLeft: '0.85rem', height: 'auto' }}
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="dept-ma-btn-action secondary"
                        onClick={() => {
                          setIsEditMode(false);
                          setActiveTab('overview');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="dept-ma-btn-action primary">
                        💾 Save Permitted Updates
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="dept-ma-modal-footer">
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Officer: {deptInfo.assignedMA.name} ({deptInfo.assignedMA.staffId})
              </span>
              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={() => setSelectedStudent(null)}
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

