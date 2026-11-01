import React, { useState } from 'react';
import './semester_registration.css';

// Initial enrolled subjects matching the live SEUConnect system
const INITIAL_ENROLLED_SUBJECTS = [
  {
    id: 'sub-1',
    code: 'ICT22011',
    title: 'Web Application Development',
    credits: 3,
    theoryHours: 30,
    practicalHours: 30,
    status: 'REGISTERED',
    isGPA: true
  },
  {
    id: 'sub-2',
    code: 'ICT22043',
    title: 'Mobile Application Development',
    credits: 3,
    theoryHours: 30,
    practicalHours: 30,
    status: 'REGISTERED',
    isGPA: true
  },
  {
    id: 'sub-3',
    code: 'ICT31013',
    title: 'Computer Networks & Security',
    credits: 3,
    theoryHours: 30,
    practicalHours: 30,
    status: 'REGISTERED',
    isGPA: true
  },
  {
    id: 'sub-4',
    code: 'ICT31023',
    title: 'Enterprise Architecture & Cloud Systems',
    credits: 3,
    theoryHours: 30,
    practicalHours: 30,
    status: 'REGISTERED',
    isGPA: true
  },
  {
    id: 'sub-5',
    code: 'ICT31032',
    title: 'Advanced Database Systems',
    credits: 3,
    theoryHours: 30,
    practicalHours: 30,
    status: 'REGISTERED',
    isGPA: true
  },
  {
    id: 'sub-6',
    code: 'ICT31043',
    title: 'Human Computer Interaction (HCI)',
    credits: 3,
    theoryHours: 30,
    practicalHours: 15,
    status: 'REGISTERED',
    isGPA: true
  }
];

// Department catalog of available subjects
const ALL_DEPARTMENT_MODULES = [
  {
    id: 'sub-1',
    code: 'ICT22011',
    title: 'Web Application Development',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-6',
    code: 'ICT31043',
    title: 'Human Computer Interaction (HCI)',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-5',
    code: 'ICT31032',
    title: 'Advanced Database Systems',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-4',
    code: 'ICT31023',
    title: 'Enterprise Architecture & Cloud Systems',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-3',
    code: 'ICT31013',
    title: 'Computer Networks & Security',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-2',
    code: 'ICT22043',
    title: 'Mobile Application Development',
    credits: 3,
    isGPA: true
  },
  {
    id: 'sub-7',
    code: 'ICT31052',
    title: 'Machine Learning & Artificial Intelligence',
    credits: 2,
    isGPA: true
  },
  {
    id: 'sub-8',
    code: 'ICT31062',
    title: 'Internet of Things & Embedded Systems',
    credits: 2,
    isGPA: true
  },
  {
    id: 'sub-9',
    code: 'ICT31072',
    title: 'DevOps & Continuous Delivery Pipeline',
    credits: 2,
    isGPA: true
  },
  {
    id: 'sub-10',
    code: 'ICT31082',
    title: 'Digital Business & E-Commerce Strategy',
    credits: 2,
    isGPA: false
  }
];

export default function SemesterRegistration({ user }) {
  const maxCredits = 22;
  const [enrolledSubjects, setEnrolledSubjects] = useState(INITIAL_ENROLLED_SUBJECTS);
  const [alertMessage, setAlertMessage] = useState(null);

  // Dynamically calculate registered & remaining credit count
  const registeredCredits = enrolledSubjects.reduce((sum, item) => sum + item.credits, 0);
  const remainingCredits = Math.max(0, maxCredits - registeredCredits);

  // Notification helper with auto-dismiss
  const triggerAlert = (type, text) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // Add module action
  const handleAddModule = (moduleItem) => {
    if (registeredCredits + moduleItem.credits > maxCredits) {
      triggerAlert('error', `Cannot register: Exceeds the maximum regulatory ceiling of ${maxCredits} credits!`);
      return;
    }

    const newEnrolled = {
      ...moduleItem,
      theoryHours: 30,
      practicalHours: 15,
      status: 'REGISTERED'
    };

    setEnrolledSubjects((prev) => [...prev, newEnrolled]);
    triggerAlert('success', `Successfully registered for ${moduleItem.code} - ${moduleItem.title}!`);
  };

  // Drop module action
  const handleDropModule = (subjectId) => {
    const target = enrolledSubjects.find((s) => s.id === subjectId);
    if (!target) return;

    if (window.confirm(`Are you sure you want to drop this registered course?`)) {
      setEnrolledSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      triggerAlert('success', `Successfully dropped course ${target.code}.`);
    }
  };

  return (
    <div className="semester-reg-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Semester Subject Registration & Add/Drop</h1>
        <p>Enroll in compulsory and elective subjects for the current semester according to credit workload rules.</p>
      </div>

      {/* 2. Alert Notification Banner */}
      {alertMessage && (
        <div className={`reg-alert reg-alert-${alertMessage.type}`} role="alert">
          {alertMessage.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* 3. Top 3 Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Registered Credits */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Current Registered Credits</span>
              <span className="stat-badge">Workload</span>
            </div>
            <div className="stat-value">{registeredCredits} Credits</div>
            <div className="stat-subtext">Enrolled this semester</div>
          </div>
        </div>

        {/* Card 2: Maximum Allowed Credit Load */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Maximum Allowed Credit Load</span>
              <span className="stat-badge">Regulatory Limit</span>
            </div>
            <div className="stat-value">{maxCredits} Credits</div>
            <div className="stat-subtext">Faculty ceiling per handbook</div>
          </div>
        </div>

        {/* Card 3: Available Remaining Capacity */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Available Remaining Capacity</span>
              <span className="stat-badge">Capacity</span>
            </div>
            <div className="stat-value">{remainingCredits} Credits</div>
            <div className="stat-subtext">Remaining credit slots</div>
          </div>
        </div>
      </section>

      {/* 4. Active Registration Window Notice */}
      <section className="reg-notice-card">
        <div className="reg-notice-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <div className="reg-notice-title">
            Active Registration Window: Academic Year 2025/2026 - Semester 1
          </div>
          <p className="reg-notice-desc">
            Students are permitted to add or drop elective modules until October 31, 2026. Any credit overload beyond 22 credits requires written approval from the Dean.
          </p>
        </div>
      </section>

      {/* 5. Enrolled Subjects Table Card */}
      <section className="seu-card">
        <div className="seu-card-header">
          <h3 className="seu-card-title">Enrolled Subjects ({enrolledSubjects.length})</h3>
        </div>

        <div className="table-responsive">
          <table className="seu-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Title</th>
                <th>Credits</th>
                <th>Theory / Practical</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrolledSubjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-state">
                    No subjects enrolled yet for this semester.
                  </td>
                </tr>
              ) : (
                enrolledSubjects.map((sub) => (
                  <tr key={sub.id}>
                    <td className="course-code-cell">{sub.code}</td>
                    <td>{sub.title}</td>
                    <td>
                      <span className="badge badge-neutral">{sub.credits} Credits</span>
                    </td>
                    <td>{sub.theoryHours}h Lec / {sub.practicalHours}h Lab</td>
                    <td>
                      <span className="badge badge-success">{sub.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDropModule(sub.id)}
                        className="btn btn-drop btn-sm"
                        title={`Drop ${sub.code}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Drop
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Available Department Modules Card */}
      <section className="seu-card">
        <div className="seu-card-header">
          <h3 className="seu-card-title">Available Department Modules</h3>
        </div>

        <div className="table-responsive">
          <table className="seu-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Type</th>
                <th>Enrollment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ALL_DEPARTMENT_MODULES.map((mod) => {
                const isAlreadyEnrolled = enrolledSubjects.some((s) => s.code === mod.code);
                const cannotEnroll = remainingCredits < mod.credits;

                return (
                  <tr key={mod.id}>
                    <td className="course-code-cell">{mod.code}</td>
                    <td>{mod.title}</td>
                    <td>
                      <span className="badge badge-neutral">{mod.credits} Credits</span>
                    </td>
                    <td>{mod.isGPA ? 'GPA Course' : 'Non-GPA'}</td>
                    <td>
                      {isAlreadyEnrolled ? (
                        <span className="badge badge-success">Enrolled</span>
                      ) : (
                        <span className="badge badge-neutral">Available</span>
                      )}
                    </td>
                    <td>
                      {!isAlreadyEnrolled && (
                        <button
                          type="button"
                          onClick={() => handleAddModule(mod)}
                          className="btn btn-primary btn-sm"
                          disabled={cannotEnroll}
                          title={cannotEnroll ? 'Credit limit reached' : `Enroll in ${mod.code}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Subject
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
