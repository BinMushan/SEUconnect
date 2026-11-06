import React, { useState } from 'react';
import { getCurriculumBySemester } from '../../src/services/curriculumData.js';
import './examination.css';

// Default examination registered modules matching the SEUConnect live production portal
const DEFAULT_EXAM_MODULES = [
  {
    code: 'ICT22011',
    title: 'Web Application Development',
    credits: 3,
    attendancePercentage: 87,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-04',
    examTime: '09:00 AM - 12:00 PM',
    venue: 'Exam Hall A'
  },
  {
    code: 'ICT22043',
    title: 'Mobile Application Development',
    credits: 3,
    attendancePercentage: 100,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-07',
    examTime: '09:00 AM - 12:00 PM',
    venue: 'Exam Hall A'
  },
  {
    code: 'ICT31013',
    title: 'Computer Networks & Security',
    credits: 3,
    attendancePercentage: 100,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-10',
    examTime: '01:30 PM - 04:30 PM',
    venue: 'Main Auditorium'
  },
  {
    code: 'ICT31023',
    title: 'Enterprise Architecture & Cloud Systems',
    credits: 3,
    attendancePercentage: 100,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-13',
    examTime: '09:00 AM - 12:00 PM',
    venue: 'Exam Hall B'
  },
  {
    code: 'ICT31032',
    title: 'Advanced Database Systems',
    credits: 3,
    attendancePercentage: 100,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-16',
    examTime: '01:30 PM - 03:30 PM',
    venue: 'Lab 03'
  },
  {
    code: 'ICT31043',
    title: 'Human Computer Interaction (HCI)',
    credits: 3,
    attendancePercentage: 100,
    eligibility: 'Eligible',
    attemptCategory: 'FIRST_ATTEMPT',
    examDate: '2026-11-19',
    examTime: '09:00 AM - 12:00 PM',
    venue: 'Exam Hall A'
  }
];

export default function StudentExamination({ user }) {
  const cur = getCurriculumBySemester(user?.semester);
  const examModulesList = (user?.examModules && user.examModules.length > 0)
    ? user.examModules
    : cur.examModules;

  const [activeModal, setActiveModal] = useState(null); // 'CA_REPEAT' | 'ESA_REPEAT' | null
  const [toastMessage, setToastMessage] = useState('');
  const [pivSlipNo, setPivSlipNo] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [voucherFile, setVoucherFile] = useState(null);

  // Student credentials matching the live SEUConnect portal
  const candidateName = user?.name || user?.fullName || 'Undergraduate Student';
  const regNo = user?.regNo || user?.studentId || '—';
  const indexNo = user?.indexNo || user?.regNo || '—';
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';
  const semester = user?.semester || cur.semester;
  const academicYear = user?.batch || '2025/2026';
  const overallAttendance = user?.attendance !== undefined && user?.attendance !== null ? Number(user.attendance) : (cur.isFreshers ? 100 : 85);
  const minThreshold = 80;
  const isOverallEligible = overallAttendance >= minThreshold;

  const handlePrintAdmissionCard = () => {
    window.print();
  };

  const handleOpenModal = (modalType) => {
    setActiveModal(modalType);
    setSelectedSubjects([]);
    setPivSlipNo('');
    setVoucherFile(null);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSubjectToggle = (code) => {
    if (selectedSubjects.includes(code)) {
      setSelectedSubjects(selectedSubjects.filter(c => c !== code));
    } else {
      setSelectedSubjects([...selectedSubjects, code]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      alert('Please select at least one module for resit / repeat application.');
      return;
    }
    if (!pivSlipNo.trim()) {
      alert("Please provide the People's Bank PIV voucher serial number.");
      return;
    }

    const formType = activeModal === 'CA_REPEAT' ? 'CA Repeat Form' : 'ESA Repeat Form';
    setToastMessage(`✓ ${formType} submitted successfully for ${selectedSubjects.length} subject(s)! Pending Examination Division validation.`);
    setActiveModal(null);
    setTimeout(() => {
      setToastMessage('');
    }, 5000);
  };

  return (
    <div className="examination-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="exam-toast-notification">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')} className="exam-toast-close">&times;</button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Examination Portal & Admission Card</h1>
        <p>End Semester Examination (ESA) entry validation, repeat tracking, and admission card status.</p>
      </div>

      {/* 2. Top 3 Metric Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Overall Attendance Standing */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">OVERALL ATTENDANCE STANDING</span>
              <span className="stat-badge stat-badge-subtle">
                {isOverallEligible ? 'Eligible' : 'Ineligible'}
              </span>
            </div>
            <div className="stat-value">{overallAttendance}%</div>
            <div className="stat-subtext">Threshold: {minThreshold}%</div>
          </div>
        </div>

        {/* Card 2: Admission Card Status */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-lightgreen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">ADMISSION CARD STATUS</span>
              <span className="stat-badge stat-badge-subtle">{semester}</span>
            </div>
            <div className="stat-value">Ready for Download</div>
            <div className="stat-subtext">Faculty Examination Division</div>
          </div>
        </div>

        {/* Card 3: Registered Exam Modules */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">REGISTERED EXAM MODULES</span>
              <span className="stat-badge stat-badge-subtle">Active</span>
            </div>
            <div className="stat-value">{examModulesList.length} Modules</div>
            <div className="stat-subtext">Regular First Attempts</div>
          </div>
        </div>
      </section>

      {/* 3. Repeat Candidates & Resit Registration Notice (Amber Banner) */}
      <section className="seu-card exam-repeat-notice-card">
        <div className="exam-repeat-notice-content">
          <div className="exam-repeat-notice-text">
            <div className="exam-repeat-notice-title">
              Repeat Candidates & Resit Registration Notice
            </div>
            <div className="exam-repeat-notice-desc">
              Students resitting Continuous Assessment (CA) or End Semester Examinations (ESA) must complete the official paper application form and attach the People's Bank PIV voucher before the closing date.
            </div>
          </div>
          <div className="exam-repeat-notice-actions">
            <button
              type="button"
              className="btn btn-sm btn-amber-solid"
              onClick={() => handleOpenModal('CA_REPEAT')}
            >
              CA Repeat Form
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-neutral"
              onClick={() => handleOpenModal('ESA_REPEAT')}
            >
              ESA Repeat Form
            </button>
          </div>
        </div>
      </section>

      {/* 4. Current Semester Examination Enrollment & Eligibility Table */}
      <section className="seu-card exam-table-card">
        <div className="seu-card-header">
          <h2 className="seu-card-title">{semester} Examination Enrollment & Eligibility</h2>
        </div>
        <div className="table-responsive">
          <table className="seu-table exam-modules-table">
            <thead>
              <tr>
                <th>COURSE CODE</th>
                <th>COURSE TITLE</th>
                <th>CREDITS</th>
                <th>ATTENDANCE %</th>
                <th>ELIGIBILITY STATUS</th>
                <th>ATTEMPT CATEGORY</th>
              </tr>
            </thead>
            <tbody>
              {examModulesList.map((module) => (
                <tr key={module.code}>
                  <td className="exam-cell-code">
                    <strong>{module.code}</strong>
                  </td>
                  <td className="exam-cell-title">{module.title}</td>
                  <td className="exam-cell-credits">{module.credits} Credits</td>
                  <td className="exam-cell-attendance">{module.attendancePct || module.attendancePercentage || 92}%</td>
                  <td className="exam-cell-status">
                    <span className="badge badge-success">
                      {module.eligibility || 'Eligible'}
                    </span>
                  </td>
                  <td className="exam-cell-attempt">
                    <span className="badge badge-neutral">
                      {module.attemptCategory || 'FIRST_ATTEMPT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Institutional Examination Admission Card */}
      <section className="seu-card exam-admission-card-section">
        <div className="seu-card-header">
          <h2 className="seu-card-title">Institutional Examination Admission Card</h2>
        </div>

        <div className="admission-card-frame">
          {/* University Header */}
          <div className="admission-header-block">
            <div className="admission-uni-name">
              SOUTH EASTERN UNIVERSITY OF SRI LANKA
            </div>
            <div className="admission-faculty-name">
              FACULTY OF TECHNOLOGY · EXAMINATION ADMISSION CARD
            </div>
            <div className="admission-term-name">
              Academic Year {academicYear} — Semester 1 Examination
            </div>
          </div>

          {/* Student Meta Details Grid */}
          <div className="admission-meta-grid">
            <div className="admission-meta-item">
              <span className="admission-meta-label">Candidate Name: </span>
              <strong>{candidateName}</strong>
            </div>
            <div className="admission-meta-item">
              <span className="admission-meta-label">Registration No: </span>
              <strong>{regNo}</strong>
            </div>
            <div className="admission-meta-item">
              <span className="admission-meta-label">Index No: </span>
              <strong>{indexNo}</strong>
            </div>
            <div className="admission-meta-item">
              <span className="admission-meta-label">Programme: </span>
              <strong>{programme}</strong>
            </div>
          </div>

          {/* Print Action Row */}
          <div className="admission-action-row">
            <button
              type="button"
              onClick={handlePrintAdmissionCard}
              className="btn btn-primary-dark btn-sm btn-print"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Admission Card
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PRINT-ONLY OFFICIAL ADMISSION SLIP (Visible strictly on window.print)
          ==================================================================== */}
      <div className="printable-admission-slip" aria-hidden="true">
        <div className="print-slip-header">
          <div className="print-slip-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
          <div className="print-slip-sub">FACULTY OF TECHNOLOGY · EXAMINATION DIVISION</div>
          <div className="print-slip-badge">EXAMINATION ADMISSION CARD — ACADEMIC YEAR {academicYear}</div>
        </div>

        <div className="print-meta-table">
          <div className="print-meta-row">
            <div><strong>Candidate Name:</strong> {candidateName}</div>
            <div><strong>Registration No:</strong> {regNo}</div>
          </div>
          <div className="print-meta-row">
            <div><strong>Index Number:</strong> {indexNo}</div>
            <div><strong>Degree Programme:</strong> {programme}</div>
          </div>
        </div>

        <table className="print-modules-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Hall</th>
              <th>Candidate Sign</th>
              <th>Supervisor Sign</th>
            </tr>
          </thead>
          <tbody>
            {examModulesList.map((mod, idx) => (
              <tr key={mod.code}>
                <td>{idx + 1}</td>
                <td><strong>{mod.code}</strong></td>
                <td>{mod.title}</td>
                <td>{mod.examDate}</td>
                <td>{mod.examTime}</td>
                <td>{mod.venue}</td>
                <td className="print-sign-col"></td>
                <td className="print-sign-col"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-signatures-row">
          <div className="print-signature-box">
            <div className="print-sign-line"></div>
            <div>Signature of Candidate</div>
          </div>
          <div className="print-signature-box">
            <div className="print-sign-line"></div>
            <div>Senior Assistant Registrar / Examinations</div>
            <div>Faculty of Technology · SEUSL</div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL: CA REPEAT / ESA REPEAT FORM
          ==================================================================== */}
      {activeModal && (
        <div className="exam-modal-overlay" onClick={handleCloseModal}>
          <div className="exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <div className="exam-modal-title">
                {activeModal === 'CA_REPEAT'
                  ? 'Continuous Assessment (CA) Repeat Registration'
                  : 'End Semester Examination (ESA) Resit Application'}
              </div>
              <button type="button" className="exam-modal-close-btn" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="exam-modal-body">
              <div className="exam-modal-alert">
                <span className="exam-modal-alert-icon">ℹ</span>
                <span>
                  Official form code: <strong>{activeModal === 'CA_REPEAT' ? 'SEU-EX-CA-REP' : 'SEU-EX-ESA-REP'}</strong>. Repeat fee is <strong>LKR 500.00</strong> per course unit to be deposited to People's Bank Acc. No. 228-1001-9000-1704.
                </span>
              </div>

              {/* Student Details Info */}
              <div className="exam-form-group-grid">
                <div>
                  <label className="exam-form-label">Candidate Name</label>
                  <input type="text" className="exam-form-input readonly-input" value={candidateName} readOnly />
                </div>
                <div>
                  <label className="exam-form-label">Registration No</label>
                  <input type="text" className="exam-form-input readonly-input" value={regNo} readOnly />
                </div>
              </div>

              {/* Course Selection */}
              <div className="exam-form-group">
                <label className="exam-form-label">Select Module(s) for Resit / Repeat</label>
                <div className="exam-subject-checkbox-list">
                  {examModulesList.map((mod) => (
                    <label key={mod.code} className="exam-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(mod.code)}
                        onChange={() => handleSubjectToggle(mod.code)}
                      />
                      <span className="exam-checkbox-code">{mod.code}</span>
                      <span className="exam-checkbox-title">{mod.title}</span>
                      <span className="exam-checkbox-fee">LKR 500</span>
                    </label>
                  ))}
                </div>
                <div className="exam-fee-total-row">
                  <span>Total Calculated Registration Fee:</span>
                  <strong>LKR {selectedSubjects.length * 500}.00</strong>
                </div>
              </div>

              {/* PIV Voucher */}
              <div className="exam-form-group-grid">
                <div>
                  <label className="exam-form-label">People's Bank PIV Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PIV-2026-88491"
                    className="exam-form-input"
                    value={pivSlipNo}
                    onChange={(e) => setPivSlipNo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="exam-form-label">Attach Scanned PIV Voucher (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="exam-form-input-file"
                    onChange={(e) => setVoucherFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="exam-modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-amber-solid"
                  disabled={selectedSubjects.length === 0}
                >
                  Submit {activeModal === 'CA_REPEAT' ? 'CA Repeat' : 'ESA Resit'} Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
