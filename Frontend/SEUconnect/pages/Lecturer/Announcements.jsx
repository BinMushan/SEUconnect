import React, { useState, useEffect } from 'react';
import AnnouncementCard from './components/AnnouncementCard.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import { INITIAL_ANNOUNCEMENTS, INITIAL_SUBJECTS } from './lecturerMockData.js';

/**
 * Announcements component
 * Announcements feed & publisher allowing:
 * - Creating new announcements (Title, Message, Target Audience, Priority)
 * - Actions: "Publish Announcement" and "Save Draft"
 * - Interactive cards with Expand/Collapse, inline edit, delete with safety confirmation modal
 */
export default function Announcements({ subjects = INITIAL_SUBJECTS, onShowToast }) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const deleted = new Set(JSON.parse(localStorage.getItem('seu_deleted_announcement_ids') || '[]'));
      const saved = localStorage.getItem('seuconnect_lecturer_announcements');
      const base = saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
      return base.filter((a) => !deleted.has(String(a.id)));
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('seuconnect_lecturer_announcements', JSON.stringify(announcements));
    } catch (_) {}
  }, [announcements]);

  // New announcement form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Students');
  const [priority, setPriority] = useState('Normal');
  const [formError, setFormError] = useState('');

  // Filter tab state
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Published', 'Drafts', 'High Priority'

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);

  const handleCreateAnnouncement = (isDraft = false) => {
    setFormError('');
    if (!title.trim()) {
      setFormError('Please enter an announcement headline.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please enter the announcement body content.');
      return;
    }

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      targetAudience,
      priority,
      isDraft,
      author: 'Dr. K. Perera',
      date: new Date().toISOString().split('T')[0],
      timestamp: isDraft ? 'Draft saved just now' : 'Published just now',
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    // Reset form
    setTitle('');
    setMessage('');
    setTargetAudience('All Students');
    setPriority('Normal');

    if (onShowToast) {
      onShowToast(
        isDraft ? 'Announcement saved as Draft' : 'Announcement broadcasted to students',
        'success'
      );
    }
  };

  const handleSaveEdit = (updatedItem) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    if (onShowToast) {
      onShowToast('Announcement changes updated', 'success');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setAnnouncements((prev) => prev.filter((item) => item.id !== deleteId));
    try {
      const deleted = JSON.parse(localStorage.getItem('seu_deleted_announcement_ids') || '[]');
      if (!deleted.includes(String(deleteId))) {
        deleted.push(String(deleteId));
        localStorage.setItem('seu_deleted_announcement_ids', JSON.stringify(deleted));
      }
    } catch (_) {}
    setDeleteId(null);
    if (onShowToast) {
      onShowToast('Announcement removed', 'info');
    }
  };

  // Filtered announcements
  const filteredList = announcements.filter((item) => {
    if (filterTab === 'Published') return !item.isDraft;
    if (filterTab === 'Drafts') return item.isDraft;
    if (filterTab === 'High Priority') return item.priority === 'High';
    return true;
  });

  return (
    <div className="lec-announcements-container">
      {/* 1. Header Card */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Faculty Course Announcements & Circulars</h2>
          <p className="lec-module-sub">
            Broadcast urgent deadlines, timetable modifications, lab requirements, and academic instructions to student cohorts.
          </p>
        </div>
        <div className="lec-ann-counter-pill">
          <span>Active Circulars: <strong>{announcements.filter((a) => !a.isDraft).length}</strong></span>
          <span className="dot">•</span>
          <span>Drafts: <strong>{announcements.filter((a) => a.isDraft).length}</strong></span>
        </div>
      </div>

      <div className="lec-announcements-layout">
        {/* Left Column: Create Announcement Publisher Form */}
        <div className="lec-publisher-card">
          <div className="lec-card-header-bar">
            <div>
              <h3 className="lec-card-heading">Publish New Notice</h3>
              <p className="lec-card-subheading">Compose notice for cohorts or individual modules</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateAnnouncement(false);
            }}
            className="lec-publish-form"
          >
            {formError && (
              <div className="lec-form-alert error-alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <div className="lec-form-group">
              <label className="lec-form-label">Announcement Title / Headline</label>
              <input
                type="text"
                className="lec-input"
                placeholder="e.g. Mid-Semester Lab Assessment Guidelines"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formError) setFormError('');
                }}
              />
            </div>

            <div className="lec-form-group">
              <label className="lec-form-label">Target Audience</label>
              <div className="lec-select-wrapper">
                <select
                  className="lec-select"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="All Students">All Enrolled Students (Department-wide)</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </select>
                <span className="lec-select-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="lec-form-group">
              <label className="lec-form-label">Priority Level</label>
              <div className="lec-radio-group">
                <label className={`lec-radio-label ${priority === 'Normal' ? 'is-selected normal' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="Normal"
                    checked={priority === 'Normal'}
                    onChange={() => setPriority('Normal')}
                  />
                  <span className="lec-radio-indicator"></span>
                  <span className="lec-radio-text">Normal Priority</span>
                </label>
                <label className={`lec-radio-label ${priority === 'High' ? 'is-selected high' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="High"
                    checked={priority === 'High'}
                    onChange={() => setPriority('High')}
                  />
                  <span className="lec-radio-indicator high"></span>
                  <span className="lec-radio-text text-red">High / Urgent</span>
                </label>
              </div>
            </div>

            <div className="lec-form-group">
              <label className="lec-form-label">Notice Body / Message</label>
              <textarea
                className="lec-textarea"
                rows="5"
                placeholder="Type the full message, guidelines, or instructions here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (formError) setFormError('');
                }}
              />
            </div>

            <div className="lec-publish-buttons-row">
              <button type="submit" className="lec-btn-publish-action">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>Publish Announcement</span>
              </button>
              <button
                type="button"
                className="lec-btn-draft-action"
                onClick={() => handleCreateAnnouncement(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Draft</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Existing Announcements Feed */}
        <div className="lec-feed-area">
          <div className="lec-feed-filter-bar">
            <div className="lec-filter-tabs">
              {['All', 'Published', 'Drafts', 'High Priority'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`lec-filter-tab-btn ${filterTab === tab ? 'active' : ''}`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="lec-feed-count">{filteredList.length} Items</span>
          </div>

          <div className="lec-announcements-list">
            {filteredList.length === 0 ? (
              <div className="lec-empty-feed-card">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <h4>No announcements found</h4>
                <p>There are no circulars matching your current filter selection.</p>
              </div>
            ) : (
              filteredList.map((ann) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  onSaveEdit={handleSaveEdit}
                  onDeleteRequest={(id) => setDeleteId(id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Announcement?"
        message="Are you sure you want to remove this announcement? Once deleted, students will no longer see this broadcast in their student portal."
        confirmText="Delete Notice"
        cancelText="Cancel"
        confirmType="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
