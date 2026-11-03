import React, { useState, useMemo } from 'react';
import './process_guidance.css';

export const PROCESS_GUIDES = [
  {
    id: 'proc_ca_repeat',
    code: 'SEU-EX-CA-REP',
    title: 'Continuous Assessment (CA) Repeat Registration',
    category: 'Examination',
    categoryTheme: 'examination',
    stepsCount: 4,
    description: 'Guide students on resitting continuous assessments for failed or incomplete subjects.',
    whoCanUse: 'Undergraduate students with pending or failed CA marks.',
    eligibility: 'Must be an enrolled student with an active registration.',
    submissionOffice: 'Examination Division / Faculty Academic Coordinator',
    deadline: 'Before the deadline announced by the Examination Division',
    deadlineUrgent: true,
    navigationTarget: 'examinations',
    navigationActionText: 'Go to Examination Services',
    steps: [
      {
        number: 1,
        title: 'Obtain Form',
        description: 'Download or print the "Application for Examination (Continuous Assessment) (Repeat Candidates only)" form (SEU-EX-CA-REP).'
      },
      {
        number: 2,
        title: 'Pay Repeat Fee',
        description: "Fill a People's Bank Pay In Voucher (PIV) (Account No: 228 1001 9000 1704, Addalaichenai) and pay the repeat fee (Rs. 100 per credit or as gazetted)."
      },
      {
        number: 3,
        title: 'Department Approval',
        description: 'Complete Section 10 with the subject codes and obtain the signature of the Head of Department.'
      },
      {
        number: 4,
        title: 'Submission',
        description: 'Submit the application along with the bank voucher to the Examination Division before the advertised closing date.'
      }
    ],
    requiredForms: [
      {
        code: 'SEU-EX-CA-REP',
        name: 'Application for Examination (Continuous Assessment) (Repeat Candidates only)',
        submissionTo: 'Examination Division / Office of the Assistant Registrar, SEUSL'
      },
      {
        code: 'SEU-PIV-VOUCHER',
        name: 'Pay In Voucher (PIV)',
        submissionTo: "Any branch of People's Bank (Credited to A/C No: 228 1001 9000 1704, Addalaichenai Branch)"
      }
    ],
    importantNotes: [
      'Late submissions will not be accepted after the deadline announced by the Assistant Registrar.',
      'Students resitting CA only can improve continuous assessment marks up to the grade maximum specified in the faculty handbook.',
      'Attach the student pink bank slip with official branch teller stamp.'
    ]
  },
  {
    id: 'proc_medical_excuse',
    code: 'SEU-MED-LEC',
    title: 'Medical Excuse Submission for Missed Lectures',
    category: 'Medical / Attendance',
    categoryTheme: 'medical',
    stepsCount: 4,
    description: 'Excuses absence from compulsory lectures and laboratories to protect exam eligibility.',
    whoCanUse: 'All students absent due to verified illness.',
    eligibility: 'Absence verified by a recognized government or university medical officer.',
    submissionOffice: 'Department of ICT Office / SEUConnect Online Medical Portal',
    deadline: 'Within 7 calendar days after medical leave expires',
    deadlineUrgent: true,
    navigationTarget: 'medical_requests',
    navigationActionText: 'Submit Medical Request Online',
    steps: [
      {
        number: 1,
        title: 'Acquire Medical Certificate',
        description: 'Obtain a valid medical certificate from the University Medical Center (UMC) or a Government Hospital DMO.'
      },
      {
        number: 2,
        title: 'Complete ICT Medical Form',
        description: 'Fill the "Medical Submission Form - Absent for Lectures (Dept of ICT)" or "Absent by Medical Form".'
      },
      {
        number: 3,
        title: 'Submit Online or in Person',
        description: 'Upload via SEUConnect Medical portal or hand in the physical copy to the Head of Department within 7 days.'
      },
      {
        number: 4,
        title: 'Attendance Credit',
        description: 'Once approved, your attendance standing will update to Excused_Medical on your student dashboard.'
      }
    ],
    requiredForms: [
      {
        code: 'SEU-MED-LEC',
        name: 'Medical Submission Form - Absent for Lectures (Dept of ICT)',
        submissionTo: 'Department of ICT Office / Faculty of Technology'
      },
      {
        code: 'SEU-MED-GEN',
        name: 'Absent by Medical Form',
        submissionTo: 'University Medical Center (UMC) & Department Office'
      }
    ],
    importantNotes: [
      'Submissions received later than 7 calendar days after the end of medical leave will be automatically marked as Invalid/Rejected.',
      'Private medical certificates must be endorsed by the Chief Medical Officer (CMO) of the South Eastern University of Sri Lanka.',
      'Approved medical excuses preserve your 80% mandatory attendance threshold for End Semester Examinations.'
    ]
  },
  {
    id: 'proc_semester_registration',
    code: 'SEU-ACAD-REG',
    title: 'Semester Subject Registration & Add/Drop Procedure',
    category: 'Academic',
    categoryTheme: 'academic',
    stepsCount: 4,
    description: 'Register for compulsory and elective modules each semester within academic credit load limits.',
    whoCanUse: 'All undergraduate students.',
    eligibility: 'Must not exceed the maximum limit of 22 credits per semester.',
    submissionOffice: 'SEUConnect Online Portal',
    deadline: 'Within 14 days of semester commencement',
    deadlineUrgent: false,
    navigationTarget: 'semester_registration',
    navigationActionText: 'Open Semester Registration',
    steps: [
      {
        number: 1,
        title: 'Access Registration',
        description: 'Go to Student Services -> Semester & Subject Registration on SEUConnect.'
      },
      {
        number: 2,
        title: 'Select Courses',
        description: 'Select your degree modules. The system automatically enforces the 22-credit ceiling.'
      },
      {
        number: 3,
        title: 'Confirm & Submit',
        description: 'Click "Confirm Registration" to record your enrollments.'
      },
      {
        number: 4,
        title: 'Add/Drop Period',
        description: 'Add or drop elective modules within the first two weeks of the semester.'
      }
    ],
    requiredForms: [
      {
        code: 'SEU-ACAD-REG',
        name: 'Course Registration Sheet / Online Registration Slip',
        submissionTo: 'SEUConnect Student Portal'
      }
    ],
    importantNotes: [
      'Minimum credit load per semester is 12 credits; maximum credit load is 22 credits unless approved by the Dean.',
      'No course registrations or add/drop changes will be permitted after the 14-day window without Faculty Board approval.',
      'Verify prerequisite clearances before registering for advanced 3000/4000 series modules.'
    ]
  },
  {
    id: 'proc_fee_payment_piv',
    code: 'SEU-PIV-VOUCHER',
    title: "University Fee Payment via People's Bank Pay In Voucher (PIV)",
    category: 'Finance & Fees',
    categoryTheme: 'finance',
    stepsCount: 4,
    description: 'Step-by-step instructions for depositing university examination, registration, and welfare fees.',
    whoCanUse: 'All students and staff of SEUSL.',
    eligibility: 'Any formal fee remittance.',
    submissionOffice: "Any branch of People's Bank",
    deadline: 'As stipulated per fee type',
    deadlineUrgent: false,
    navigationTarget: null,
    navigationActionText: null,
    steps: [
      {
        number: 1,
        title: 'Obtain PIV Voucher',
        description: "Download or print the SEUSL Pay In Voucher (PIV) or collect one at any People's Bank branch."
      },
      {
        number: 2,
        title: 'Verify Bank Account',
        description: 'Confirm payee is: South Eastern University of Sri Lanka, Account No. 228 1001 9000 1704, People\'s Bank Addalaichenai.'
      },
      {
        number: 3,
        title: 'Cash Deposit',
        description: "Deposit the required cash amount at any People's Bank branch counter across Sri Lanka."
      },
      {
        number: 4,
        title: 'Retain Customer Copy',
        description: 'Retain your stamped customer receipt and submit the university copy to the relevant office.'
      }
    ],
    requiredForms: [
      {
        code: 'SEU-PIV-VOUCHER',
        name: 'Pay In Voucher (PIV)',
        submissionTo: "Any branch of People's Bank / Bursar's Office, SEUSL"
      }
    ],
    importantNotes: [
      'Always clearly write your Student Registration Number (e.g. 2021/ICT/85) and Purpose of Payment on the voucher.',
      'Always retain the Student Copy with the official bank teller stamp as proof of transaction.',
      'The university code for People\'s Bank online/CDM deposits is SEUSL-TECH.'
    ]
  }
];

export default function StudentProcessGuidance({ user, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [completedSteps, setCompletedSteps] = useState({});
  const [previewForm, setPreviewForm] = useState(null);

  // Active guide object when selected
  const activeGuide = useMemo(() => {
    return PROCESS_GUIDES.find(g => g.id === selectedProcessId) || null;
  }, [selectedProcessId]);

  // Filtered process list
  const filteredProcesses = useMemo(() => {
    return PROCESS_GUIDES.filter(proc => {
      // Category filter
      if (activeCategoryFilter !== 'ALL' && proc.categoryTheme !== activeCategoryFilter) {
        return false;
      }
      // Text query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        proc.title.toLowerCase().includes(q) ||
        proc.description.toLowerCase().includes(q) ||
        proc.category.toLowerCase().includes(q) ||
        proc.code.toLowerCase().includes(q) ||
        proc.submissionOffice.toLowerCase().includes(q) ||
        proc.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategoryFilter]);

  // Step toggle handler
  const toggleStepCompleted = (stepNumber) => {
    if (!selectedProcessId) return;
    const key = `${selectedProcessId}_step_${stepNumber}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrintForm = (form) => {
    setPreviewForm(form);
  };

  return (
    <div className="proc-guidance-container">
      {/* =========================================================
          VIEW 1: STEP-BY-STEP DETAIL VIEW
          ========================================================= */}
      {activeGuide ? (
        <div className="proc-detail-view animate-fade-in">
          {/* Back button */}
          <button
            type="button"
            className="proc-back-btn"
            onClick={() => setSelectedProcessId(null)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Process Guides</span>
          </button>

          {/* Process Header Banner Card */}
          <div className="proc-detail-header-card">
            <div className="proc-detail-top-row">
              <span className={`proc-category-badge badge-${activeGuide.categoryTheme}`}>
                {activeGuide.category}
              </span>
              <span className="proc-form-code-pill">
                Form: {activeGuide.code}
              </span>
            </div>

            <h1 className="proc-detail-title">{activeGuide.title}</h1>
            <p className="proc-detail-subtitle">{activeGuide.description}</p>

            <div className="proc-meta-grid">
              <div className="proc-meta-item">
                <span className="proc-meta-label">Who can use:</span>
                <span className="proc-meta-value">{activeGuide.whoCanUse}</span>
              </div>
              <div className="proc-meta-item">
                <span className="proc-meta-label">Eligibility:</span>
                <span className="proc-meta-value">{activeGuide.eligibility}</span>
              </div>
              <div className="proc-meta-item">
                <span className="proc-meta-label">Submission Office:</span>
                <span className="proc-meta-value">{activeGuide.submissionOffice}</span>
              </div>
              <div className="proc-meta-item">
                <span className="proc-meta-label">Deadline:</span>
                <span className={`proc-meta-value ${activeGuide.deadlineUrgent ? 'proc-meta-urgent' : ''}`}>
                  {activeGuide.deadline}
                </span>
              </div>
            </div>

            {/* Quick action button matching site theme */}
            {activeGuide.navigationTarget && (
              <div className="proc-quick-action-banner">
                <div className="proc-quick-action-text">
                  <strong>Online System Available:</strong> You can initiate this procedure directly through SEUConnect portal.
                </div>
                <button
                  type="button"
                  className="proc-btn-primary proc-banner-action-btn"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(activeGuide.navigationTarget);
                      if (typeof window !== 'undefined') {
                        window.location.hash = `#student/${activeGuide.navigationTarget}`;
                      }
                    }
                  }}
                >
                  <span>{activeGuide.navigationActionText}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Step-by-Step Procedure Section */}
          <div className="proc-section-card">
            <div className="proc-section-header">
              <div className="proc-section-title-wrap">
                <h2 className="proc-section-heading">Step-by-Step Procedure</h2>
                <span className="proc-steps-subtitle">Follow these instructions in sequential order</span>
              </div>
              <span className="proc-progress-counter">
                {activeGuide.steps.filter(s => completedSteps[`${activeGuide.id}_step_${s.number}`]).length} of {activeGuide.steps.length} Steps Completed
              </span>
            </div>

            <div className="proc-steps-list">
              {activeGuide.steps.map((step) => {
                const isDone = !!completedSteps[`${activeGuide.id}_step_${step.number}`];
                return (
                  <div
                    key={step.number}
                    className={`proc-step-row ${isDone ? 'step-completed' : ''}`}
                    onClick={() => toggleStepCompleted(step.number)}
                  >
                    <div className="proc-step-number-bubble">
                      {isDone ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="proc-step-content">
                      <div className="proc-step-title-row">
                        <h3 className="proc-step-title">{step.title}</h3>
                        <span className="proc-step-toggle-hint">
                          {isDone ? 'Mark as incomplete' : 'Click to mark complete'}
                        </span>
                      </div>
                      <p className="proc-step-desc">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Required Forms Section */}
          <div className="proc-section-card">
            <h2 className="proc-section-heading">Required Documents & University Forms</h2>
            <p className="proc-section-sub">Download or inspect the official forms mandated for this procedure:</p>
            <div className="proc-forms-grid">
              {activeGuide.requiredForms.map((form) => (
                <div key={form.code} className="proc-form-card">
                  <div className="proc-form-card-header">
                    <span className="proc-form-code-badge">{form.code}</span>
                    <span className="proc-form-type-tag">Official Form</span>
                  </div>
                  <h4 className="proc-form-title">{form.name}</h4>
                  <p className="proc-form-submission-info">
                    <strong>Submission Office:</strong> {form.submissionTo}
                  </p>
                  <div className="proc-form-actions">
                    <button
                      type="button"
                      className="proc-btn-secondary"
                      onClick={() => handlePrintForm(form)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      <span>Preview & Print</span>
                    </button>
                    <button
                      type="button"
                      className="proc-btn-primary"
                      onClick={() => handlePrintForm(form)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download Form (PDF)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Regulatory Guidelines */}
          <div className="proc-section-card proc-guideline-card">
            <div className="proc-guideline-header">
              <div className="proc-guideline-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="proc-guideline-title">Important Regulations & Verification</h3>
                <p className="proc-guideline-sub">Regulatory rules governing the Faculty of Technology, SEUSL</p>
              </div>
            </div>
            <ul className="proc-guidelines-list">
              {activeGuide.importantNotes.map((note, idx) => (
                <li key={idx}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f2b54" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* =========================================================
            VIEW 2: THE 4 PROCESS GUIDANCE CARDS OVERVIEW
            ========================================================= */
        <div className="proc-overview-view animate-fade-in">
          {/* Page Title & Subtitle */}
          <div className="proc-header">
            <h1 className="proc-main-title">University Process Guidance</h1>
            <p className="proc-main-subtitle">
              Step-by-step regulatory guidance: Tells you what to do, which form you need, where to submit, and what happens next.
            </p>
          </div>

          {/* Search Box */}
          <div className="proc-search-card">
            <div className="proc-search-input-wrapper">
              <svg className="proc-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="proc-search-input"
                placeholder="Search processes (e.g. repeat exam, medical excuse, fee deposit, add/drop)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="proc-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Filter Badges */}
            <div className="proc-filter-chips">
              <span className="proc-filter-label">Quick Filter:</span>
              <button
                type="button"
                className={`proc-chip ${activeCategoryFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('ALL')}
              >
                All Processes ({PROCESS_GUIDES.length})
              </button>
              <button
                type="button"
                className={`proc-chip ${activeCategoryFilter === 'examination' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('examination')}
              >
                Examinations
              </button>
              <button
                type="button"
                className={`proc-chip ${activeCategoryFilter === 'medical' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('medical')}
              >
                Medical / Attendance
              </button>
              <button
                type="button"
                className={`proc-chip ${activeCategoryFilter === 'academic' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('academic')}
              >
                Academic & Add/Drop
              </button>
              <button
                type="button"
                className={`proc-chip ${activeCategoryFilter === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('finance')}
              >
                Finance & Fees
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredProcesses.length === 0 ? (
            <div className="proc-no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3>No matching processes found</h3>
              <p>Try searching for terms like "repeat", "medical", "registration", or "voucher".</p>
              <button
                type="button"
                className="proc-btn-primary"
                onClick={() => { setSearchQuery(''); setActiveCategoryFilter('ALL'); }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="proc-cards-grid">
              {filteredProcesses.map((process) => (
                <div key={process.id} className="proc-card">
                  {/* Card Header */}
                  <div className="proc-card-top">
                    <span className={`proc-category-badge badge-${process.categoryTheme}`}>
                      {process.category}
                    </span>
                    <span className="proc-card-steps-count">
                      {process.stepsCount} Steps
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="proc-card-title">{process.title}</h3>
                  <p className="proc-card-desc">{process.description}</p>

                  {/* Meta Details */}
                  <div className="proc-card-meta">
                    <div className="proc-meta-row">
                      <div className="proc-meta-icon" title="Submission Office">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                          <path d="M10 6h4"/>
                          <path d="M10 10h4"/>
                          <path d="M10 14h4"/>
                          <path d="M10 18h4"/>
                        </svg>
                      </div>
                      <div className="proc-meta-text">
                        <span className="proc-meta-inline-label">Submission Office</span>
                        <span className="proc-meta-inline-value">{process.submissionOffice}</span>
                      </div>
                    </div>

                    <div className="proc-meta-row">
                      <div className="proc-meta-icon" title="Deadline">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <div className="proc-meta-text">
                        <span className="proc-meta-inline-label">Deadline</span>
                        <span className={`proc-meta-inline-value ${process.deadlineUrgent ? 'urgent' : ''}`}>
                          {process.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button with SEUConnect Brand Theme */}
                  <div className="proc-card-footer">
                    <button
                      type="button"
                      className="proc-btn-primary proc-card-btn"
                      onClick={() => setSelectedProcessId(process.id)}
                    >
                      <span>View Step-by-Step Guide</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL: OFFICIAL FORM PREVIEW & PRINT
          ========================================================= */}
      {previewForm && (
        <div className="proc-modal-overlay animate-fade-in" onClick={() => setPreviewForm(null)}>
          <div className="proc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="proc-modal-header">
              <div className="proc-modal-header-info">
                <span className="proc-modal-form-badge">{previewForm.code}</span>
                <h3 className="proc-modal-title">{previewForm.name}</h3>
              </div>
              <button
                type="button"
                className="proc-modal-close-btn"
                onClick={() => setPreviewForm(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="proc-modal-body">
              {/* Form Document Sheet Simulation */}
              <div className="proc-document-sheet">
                <div className="proc-doc-header">
                  <div className="proc-doc-crest">SEU</div>
                  <div className="proc-doc-heading">
                    <h4>SOUTH EASTERN UNIVERSITY OF SRI LANKA</h4>
                    <h5>FACULTY OF TECHNOLOGY</h5>
                    <p className="proc-doc-form-name">{previewForm.name}</p>
                    <span className="proc-doc-code">Form Ref: {previewForm.code} / 2026</span>
                  </div>
                </div>

                <div className="proc-doc-student-info">
                  <div className="proc-doc-row">
                    <span className="proc-doc-field">Full Name of Candidate:</span>
                    <span className="proc-doc-value">{user?.fullName || user?.name || 'M.N.M. Afnan'}</span>
                  </div>
                  <div className="proc-doc-row-split">
                    <div>
                      <span className="proc-doc-field">Registration No:</span>
                      <span className="proc-doc-value">{user?.studentId || user?.username || '2021/ICT/85'}</span>
                    </div>
                    <div>
                      <span className="proc-doc-field">Index No:</span>
                      <span className="proc-doc-value">ICT21085</span>
                    </div>
                  </div>
                  <div className="proc-doc-row">
                    <span className="proc-doc-field">Department:</span>
                    <span className="proc-doc-value">{user?.department || 'Department of Information and Communication Technology'}</span>
                  </div>
                </div>

                <div className="proc-doc-instruction-box">
                  <p><strong>Official Instructions:</strong></p>
                  <ol>
                    <li>This document must be completed in block capitals and signed by the candidate.</li>
                    <li>Submit directly to <em>{previewForm.submissionTo}</em>.</li>
                    <li>Retain a duplicate endorsed copy for candidate reference.</li>
                  </ol>
                </div>

                <div className="proc-doc-sign-grid">
                  <div className="proc-doc-sign-box">
                    <div className="proc-doc-sign-line"></div>
                    <span>Signature of Candidate</span>
                  </div>
                  <div className="proc-doc-sign-box">
                    <div className="proc-doc-sign-line"></div>
                    <span>Head of Department</span>
                  </div>
                  <div className="proc-doc-sign-box">
                    <div className="proc-doc-sign-line"></div>
                    <span>Assistant Registrar / Examination</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="proc-modal-footer">
              <button
                type="button"
                className="proc-btn-secondary"
                onClick={() => setPreviewForm(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="proc-btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Print Official Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
