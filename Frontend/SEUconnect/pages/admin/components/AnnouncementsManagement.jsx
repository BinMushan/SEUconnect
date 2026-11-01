import { useState } from 'react';

export default function AnnouncementsManagement({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onTogglePinAnnouncement,
  isCreateModalOpen,
  setIsCreateModalOpen
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [newAudience, setNewAudience] = useState('All Technology Students');
  const [newPriority, setNewPriority] = useState('Normal');
  const [newContent, setNewContent] = useState('');
  const [newPinned, setNewPinned] = useState(false);
  const [error, setError] = useState('');

  const filtered = announcements.filter((a) => {
    return filterCategory === 'ALL' || a.category === filterCategory;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Please provide a title and announcement content.');
      return;
    }

    onAddAnnouncement({
      id: `ANN-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetAudience: newAudience,
      priority: newPriority,
      publishDate: new Date().toISOString().split('T')[0],
      publishedBy: 'Faculty Administration Office',
      pinned: newPinned,
      content: newContent.trim()
    });

    setNewTitle('');
    setNewContent('');
    setNewPinned(false);
    setError('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Notifications & Official Announcements</h2>
          <p className="adm-section-subtitle">
            Publish institutional notices, exam circulars, deadline alerts, and broadcast urgent academic advisories to student dashboards.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Broadcast Announcement
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="adm-filter-toolbar">
        <div className="adm-filter-group">
          <select
            className="adm-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Announcement Categories</option>
            <option value="Academic">Academic Notices</option>
            <option value="Examination">Examination Circulars</option>
            <option value="Welfare">Welfare & Scholarship Alerts</option>
            <option value="Societies">Societies & Club Events</option>
          </select>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          {filtered.length} notices published
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            className="adm-card"
            style={{
              borderLeft: item.pinned ? '4px solid #f59e0b' : '4px solid #0f2b5c',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="adm-badge adm-badge-neutral">{item.category}</span>
                {item.priority === 'Urgent' && (
                  <span className="adm-badge adm-badge-danger">URGENT</span>
                )}
                {item.pinned && (
                  <span className="adm-badge adm-badge-warning">Pinned Notice 📌</span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Audience: <strong style={{ color: '#0f172a' }}>{item.targetAudience}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.publishDate}</span>
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => onTogglePinAnnouncement(item.id)}
                  title="Toggle pin"
                >
                  {item.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => onDeleteAnnouncement(item.id)}
                  style={{ color: '#dc2626' }}
                  title="Delete announcement"
                >
                  Delete
                </button>
              </div>
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.08rem', color: '#0f172a' }}>
              {item.title}
            </h3>

            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>
              {item.content}
            </p>

            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Issued by:</span>
              <strong style={{ color: '#0f2b5c' }}>{item.publishedBy}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Broadcast Official Faculty Announcement</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-modal-body">
                {error && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    {error}
                  </div>
                )}

                <div className="adm-form-group">
                  <label className="adm-label">Announcement Title *</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. End Semester Examination (ESA) Entry Deadline Extended"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select
                      className="adm-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Academic">Academic Notices</option>
                      <option value="Examination">Examination Circular</option>
                      <option value="Welfare">Welfare & Scholarship</option>
                      <option value="Societies">Societies & Clubs</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Target Audience</label>
                    <select
                      className="adm-input"
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                    >
                      <option value="All Technology Students">All Technology Students</option>
                      <option value="BICT Undergraduates">BICT Undergraduates</option>
                      <option value="BST Undergraduates">BST Undergraduates</option>
                      <option value="ET Undergraduates">ET Undergraduates</option>
                      <option value="Final Year Students">Final Year Students</option>
                      <option value="Faculty Academic Staff">Faculty Academic Staff</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Urgency Priority</label>
                    <select
                      className="adm-input"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option value="Normal">Normal Institutional Notice</option>
                      <option value="Urgent">Urgent / High Priority Alert</option>
                    </select>
                  </div>

                  <div className="adm-form-group" style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '1.2rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={newPinned}
                        onChange={(e) => setNewPinned(e.target.checked)}
                      />
                      <span>Pin to Top of Portal</span>
                    </label>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Announcement Content / Instructions *</label>
                  <textarea
                    className="adm-textarea"
                    placeholder="Enter the full text of the announcement..."
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
