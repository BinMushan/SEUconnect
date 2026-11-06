import React, { useState, useEffect } from 'react';
import { getCurriculumBySemester } from '../../src/services/curriculumData.js';
import './semester_registration.css';

export default function SemesterRegistration({ user }) {
  const maxCredits = 22;
  const cur = getCurriculumBySemester(user?.semester);

  const getInitialSubjects = () => {
    if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
      return user.enrolledCourses.map((c, i) => ({
        id: c.id || `sub-${i + 1}`,
        code: c.courseCode || c.code,
        title: c.courseName || c.title,
        credits: c.credits || 3,
        theoryHours: c.theoryHours || 30,
        practicalHours: c.practicalHours || 30,
        status: c.status || 'REGISTERED',
        isGPA: c.isGPA !== undefined ? c.isGPA : true
      }));
    }
    return cur.subjects || [];
  };

  const [enrolledSubjects, setEnrolledSubjects] = useState(getInitialSubjects);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    setEnrolledSubjects(getInitialSubjects());
  }, [user?.semester, user?.enrolledCourses]);

  // Dynamically calculate registered & remaining credit count
  const registeredCredits = enrolledSubjects.reduce((sum, item) => sum + item.credits, 0);
  const remainingCredits = Math.max(0, maxCredits - registeredCredits);

  return (
    <div className="semester-reg-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>{cur.semester} — Enrolled Subjects</h1>
        <p>Official registered course modules and credit workload allocation for {cur.semester}.</p>
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
            Active Registration Window: Academic Year 2025/2026 - {cur.semester}
          </div>
          <p className="reg-notice-desc">
            Official semester enrolled modules registered under Faculty of Technology regulations. Any credit overload beyond {maxCredits} credits requires written approval from the Dean.
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
              </tr>
            </thead>
            <tbody>
              {enrolledSubjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-state">
                    No subjects enrolled yet for this semester.
                  </td>
                </tr>
              ) : (
                enrolledSubjects.map((sub) => (
                  <tr key={sub.id || sub.code}>
                    <td className="course-code-cell">{sub.code}</td>
                    <td>{sub.title}</td>
                    <td>
                      <span className="badge badge-neutral">{sub.credits} Credits</span>
                    </td>
                    <td>{sub.theoryHours}h Lec / {sub.practicalHours}h Lab</td>
                    <td>
                      <span className="badge badge-success">{sub.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
