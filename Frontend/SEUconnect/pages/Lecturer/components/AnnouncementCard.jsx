import React, { useState } from 'react';

/**
 * AnnouncementCard component
 * Interactive card with Expand/Collapse toggle, inline edit, and delete triggers.
 */
export default function AnnouncementCard({
  announcement,
  onSaveEdit,
  onDeleteRequest,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(announcement.title);
  const [editMessage, setEditMessage] = useState(announcement.message);
  const [editPriority, setEditPriority] = useState(announcement.priority);
  const [editAudience, setEditAudience] = useState(announcement.targetAudience);

  const handleSave = () => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    onSaveEdit({
      ...announcement,
      title: editTitle,
      message: editMessage,
      priority: editPriority,
      targetAudience: editAudience,
      timestamp: 'Edited just now',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(announcement.title);
    setEditMessage(announcement.message);
    setEditPriority(announcement.priority);
    setEditAudience(announcement.targetAudience);
    setIsEditing(false);
  };

  const isLong = announcement.message.length > 140;

  return (
    <div className={`lec-announcement-card ${announcement.priority === 'High' ? 'priority-high' : ''}`}>
      <div className="lec-ann-top-row">
        <div className="lec-ann-badges">
          {announcement.isDraft && (
            <span className="lec-ann-draft-tag">DRAFT</span>
          )}
          <span className={`lec-ann-priority-tag ${announcement.priority === 'High' ? 'tag-high' : 'tag-normal'}`}>
            {announcement.priority} Priority
          </span>
          <span className="lec-ann-audience-tag">
            Audience: <strong>{announcement.targetAudience}</strong>
          </span>
        </div>

        <div className="lec-ann-controls">
          <span className="lec-ann-timestamp">{announcement.timestamp || announcement.date}</span>
          {!isEditing && (
            <>
              <button
                type="button"
                className="lec-ann-icon-btn"
                title="Edit Announcement"
                onClick={() => setIsEditing(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                className="lec-ann-icon-btn btn-danger"
                title="Delete Announcement"
                onClick={() => onDeleteRequest(announcement.id)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="lec-ann-inline-edit-form">
          <input
            type="text"
            className="lec-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Announcement Title"
          />
          <textarea
            className="lec-edit-textarea"
            rows="3"
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            placeholder="Announcement Content"
          />
          <div className="lec-edit-selectors-row">
            <select
              className="lec-edit-select"
              value={editAudience}
              onChange={(e) => setEditAudience(e.target.value)}
            >
              <option value="All Students">All Students</option>
              <option value="SWT22022">SWT22022 (Software Eng)</option>
              <option value="SWT21032">SWT21032 (Web Apps)</option>
              <option value="SWT21022">SWT21022 (Data Structures)</option>
            </select>
            <select
              className="lec-edit-select"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="Normal">Normal Priority</option>
              <option value="High">High Priority</option>
            </select>
            <div className="lec-edit-btn-group">
              <button type="button" className="lec-btn-save-edit" onClick={handleSave}>
                Save Changes
              </button>
              <button type="button" className="lec-btn-cancel-edit" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h4 className="lec-ann-title">{announcement.title}</h4>
          <div className="lec-ann-body">
            <p className="lec-ann-text">
              {isLong && !isExpanded
                ? `${announcement.message.slice(0, 140)}...`
                : announcement.message}
            </p>
            {isLong && (
              <button
                type="button"
                className="lec-ann-toggle-expand"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Read full announcement'}
              </button>
            )}
          </div>
          <div className="lec-ann-footer-meta">
            <span>Posted by: <strong>{announcement.author || 'Dr. K. Perera'}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

