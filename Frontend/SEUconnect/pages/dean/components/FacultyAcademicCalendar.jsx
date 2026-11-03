import React, { useState } from 'react';
import { ACADEMIC_CALENDAR_2025_2026 } from '../deanData.js';

export default function FacultyAcademicCalendar({ onNavigate }) {
  const [events, setEvents] = useState(ACADEMIC_CALENDAR_2025_2026);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startDate: '',
    endDate: '',
    scope: 'All Departments',
    category: 'Academic Milestone',
    description: '',
  });
  const [feedback, setFeedback] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      e.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.departmentScope.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.startDate) return;

    const eventObj = {
      id: `CAL-${String(events.length + 1).padStart(2, '0')}`,
      eventTitle: newEvent.title,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || newEvent.startDate,
      departmentScope: newEvent.scope,
      category: newEvent.category,
      status: 'Upcoming',
      description: newEvent.description,
    };

    setEvents([...events, eventObj]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      startDate: '',
      endDate: '',
      scope: 'All Departments',
      category: 'Academic Milestone',
      description: '',
    });
    setFeedback(`New academic calendar milestone "${eventObj.eventTitle}" ratified by Dean.`);
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">ACADEMIC SCHEDULE & RATIFIED TIMETABLE</span>
          <h1 className="dean-view-title">Faculty Academic Calendar (2025/2026)</h1>
          <p className="dean-view-subtitle">
            Senate-Approved Instructional Weeks, Examination Periods, Recesses & Submission Deadlines for Faculty of Technology
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => alert('Official Senate-Ratified Academic Calendar (PDF) downloaded.')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Calendar (PDF)
          </button>
          <button type="button" className="dean-banner-btn primary" onClick={() => setIsAddingEvent(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Calendar Milestone
          </button>
        </div>
      </div>

      {feedback && (
        <div className="dean-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Current Academic Term Pulse Strip */}
      <div className="dean-calendar-pulse-strip">
        <div className="dean-pulse-card">
          <span className="dean-pulse-lead">Current Academic Term:</span>
          <span className="dean-pulse-highlight">Semester 1 (2025/2026)</span>
        </div>
        <div className="dean-pulse-card">
          <span className="dean-pulse-lead">Instructional Progress:</span>
          <span className="dean-pulse-highlight" style={{ color: '#f59e0b' }}>Week 11 of 15 Weeks</span>
        </div>
        <div className="dean-pulse-card">
          <span className="dean-pulse-lead">Next Milestone:</span>
          <span className="dean-pulse-highlight" style={{ color: '#2563eb' }}>CA Marks Submission Cut-off (Nov 15)</span>
        </div>
        <div className="dean-pulse-card">
          <span className="dean-pulse-lead">ESA Examination Period:</span>
          <span className="dean-pulse-highlight" style={{ color: '#059669' }}>Dec 07 – Dec 28, 2026</span>
        </div>
      </div>

      {/* 3. Toolbar & Category Filters */}
      <div className="dean-toolbar-card">
        <div className="dean-filter-tabs">
          {['All', 'Academic Milestone', 'Assessment', 'Examination', 'Deadline', 'Recess', 'Study Leave', 'Governance'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`dean-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'All' ? `All Events (${events.length})` : cat}
            </button>
          ))}
        </div>

        <div className="dean-table-search-box" style={{ maxWidth: '300px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search milestone or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Calendar Timeline Cards */}
      <div className="dean-timeline-container">
        {filteredEvents.map((evt) => {
          const isCompleted = evt.status === 'Completed';
          const isActive = evt.status === 'Active';

          return (
            <div key={evt.id} className={`dean-timeline-item ${isActive ? 'active-milestone' : ''}`}>
              <div className="dean-timeline-marker">
                <div className={`dean-marker-dot ${isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'}`}>
                  {isCompleted ? '✓' : isActive ? '●' : '○'}
                </div>
                <div className="dean-marker-line"></div>
              </div>

              <div className="dean-timeline-card">
                <div className="dean-timeline-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className="dean-timeline-date">
                      📅 {evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} to ${evt.endDate}`}
                    </span>
                    <span className="dean-badge-blue">{evt.category}</span>
                    <span className="dean-badge-gray">{evt.departmentScope}</span>
                  </div>
                  <span className={`dean-status-pill status-${evt.status.toLowerCase()}`}>
                    {evt.status}
                  </span>
                </div>

                <h3 className="dean-timeline-title">{evt.eventTitle}</h3>
                <p className="dean-timeline-desc">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {isAddingEvent && (
        <div className="dean-modal-overlay" onClick={() => setIsAddingEvent(false)}>
          <div className="dean-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dean-modal-header">
              <div>
                <h3 className="dean-modal-title">Add Academic Calendar Milestone</h3>
                <p className="dean-modal-sub">Ratified Entry under Authority of Dean Prof. Rifai Kariapper</p>
              </div>
              <button type="button" className="dean-modal-close-btn" onClick={() => setIsAddingEvent(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="dean-modal-body">
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="dean-form-label">Milestone Title</label>
                  <input
                    type="text"
                    className="dean-input"
                    placeholder="e.g. Special Senate Result Moderation Sitting"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label className="dean-form-label">Start Date</label>
                    <input
                      type="date"
                      className="dean-input"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="dean-form-label">End Date (Optional)</label>
                    <input
                      type="date"
                      className="dean-input"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label className="dean-form-label">Department Scope</label>
                    <select
                      className="dean-input"
                      value={newEvent.scope}
                      onChange={(e) => setNewEvent({ ...newEvent, scope: e.target.value })}
                    >
                      <option value="All Departments">All Departments (ICT, BST)</option>
                      <option value="Department of ICT">Department of ICT</option>
                      <option value="Department of BST">Department of BST</option>
                      <option value="Faculty Examination Branch">Faculty Examination Branch</option>
                    </select>
                  </div>
                  <div>
                    <label className="dean-form-label">Event Category</label>
                    <select
                      className="dean-input"
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    >
                      <option value="Academic Milestone">Academic Milestone</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Examination">Examination</option>
                      <option value="Deadline">Deadline</option>
                      <option value="Recess">Recess</option>
                      <option value="Study Leave">Study Leave</option>
                      <option value="Governance">Governance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="dean-form-label">Administrative Description</label>
                  <textarea
                    className="dean-textarea"
                    rows="3"
                    placeholder="Provide details on procedural requirements and target audience..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="dean-modal-footer">
                <button type="button" className="dean-btn-outline" onClick={() => setIsAddingEvent(false)}>Cancel</button>
                <button type="submit" className="dean-btn-approve">Ratify & Add to Calendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

