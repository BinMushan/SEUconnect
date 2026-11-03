import React, { useState } from 'react';
import SubjectCard from './components/SubjectCard.jsx';
import { INITIAL_SUBJECTS } from './lecturerMockData.js';

/**
 * MySubjects component
 * Manages lecturer's assigned academic subjects with real-time search,
 * semester filtering, course specs, and direct attendance access.
 */
export default function MySubjects({ onNavigateModule, onShowToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');

  const filteredSubjects = INITIAL_SUBJECTS.filter((sub) => {
    const matchesSearch =
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.batch && sub.batch.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSemester =
      selectedSemester === 'All' || sub.semester === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="lec-subjects-container">
      {/* 1. Header Banner */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">My Assigned Course Modules</h2>
          <p className="lec-module-sub">
            Review academic curricula, scheduled timetable allocations, student cohorts, and attendance rates for your allocated subjects.
          </p>
        </div>
        <div className="lec-module-meta-pill">
          <span>Assigned: <strong>{INITIAL_SUBJECTS.length} Subjects</strong></span>
          <span className="dot">•</span>
          <span>Semester: <strong>Term II 2026</strong></span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="lec-controls-bar">
        <div className="lec-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by subject code (e.g. SWT22022), module title, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="lec-search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="lec-filter-tabs">
          <span className="filter-label">Filter Semester:</span>
          {['All', 'Semester 3', 'Semester 4'].map((sem) => (
            <button
              key={sem}
              type="button"
              className={`lec-filter-tab-btn ${selectedSemester === sem ? 'active' : ''}`}
              onClick={() => setSelectedSemester(sem)}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Subjects Card Grid */}
      <div className="lec-subjects-grid">
        {filteredSubjects.length === 0 ? (
          <div className="lec-empty-state-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h4>No Subjects Found</h4>
            <p>No assigned course matches "{searchTerm}" under {selectedSemester}.</p>
            <button
              type="button"
              className="lec-btn-reset-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedSemester('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.code}
              subject={subject}
              onMarkAttendance={(code) => {
                if (onShowToast) onShowToast(`Opening attendance roster for ${code}`, 'info');
                onNavigateModule('attendance', { subjectCode: code });
              }}
              onViewAssessments={(code) => {
                onNavigateModule('ca-esa', { subjectCode: code });
              }}
              onViewStudentDetails={(code) => {
                if (onShowToast) onShowToast(`Opening registered student list for ${code}`, 'info');
                onNavigateModule('enrollment', { subjectCode: code });
              }}
            />
          ))
        )}
      </div>

      {/* 4. Subject Allocation Guidelines Alert */}
      <div className="lec-info-notice-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong>Department of ICT Module Allocation Policy:</strong> Course allocations and laboratory venue assignments are synchronized with the Faculty Curriculum Board. For syllabus modifications or timetable adjustments, consult the Head of Department (HOD).
        </div>
      </div>
    </div>
  );
}
