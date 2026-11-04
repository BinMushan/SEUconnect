import React, { useState } from 'react';

export default function DeptMAAnnouncements({
  announcements,
  deptInfo,
  onAddAnnouncement,
  onShowToast,
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Urgent Notice',
    priority: 'High',
    target: 'All ICT Undergraduates',
    content: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;

    const newAnn = {
      id: `ANN-2026-${String(announcements.length + 1).padStart(2, '0')}`,
      title: form.title,
      date: new Date().toISOString().split('T')[0],
      category: form.category,
      priority: form.priority,
      author: `${deptInfo.assignedMA.name} (Dept MA)`,
      content: form.content,
      target: form.target,
    };

    onAddAnnouncement(newAnn);
    setShowModal(false);
    setForm({
      title: '',
      category: 'Urgent Notice',
      priority: 'High',
      target: 'All ICT Undergraduates',
      content: '',
    });
    onShowToast(`Announcement "${newAnn.title}" published to student portal.`, 'success');
  };

  return (
    <div className="dept-ma-announcements-section">
      <div className="dept-ma-toolbar">
        <div>
          <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: '800' }}>
            Department Announcements & Notices
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Official notices broadcast to undergraduates in the {deptInfo.departmentName}.
          </span>
        </div>

        <button
          type="button"
          className="dept-ma-btn-action primary"
          onClick={() => setShowModal(true)}
        >
          📢 Post Department Notice
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {announcements.map((ann) => (
          <div key={ann.id} className="dept-ma-panel-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`dept-ma-status-badge ${ann.priority === 'High' ? 'rejected' : 'active'}`}>
                    {ann.priority} Priority
                  </span>
                  <span className="dept-ma-status-badge under-review">{ann.category}</span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>📅 {ann.date}</span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  {ann.title}
                </h4>
              </div>

              <span style={{ fontSize: '0.74rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                Audience: {ann.target}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5', margin: '0.5rem 0 1rem 0' }}>
              {ann.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <span>Author: <strong>{ann.author}</strong></span>
              <span>Notice ID: {ann.id}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="dept-ma-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="dept-ma-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="dept-ma-modal-header">
              <h3 className="dept-ma-modal-title">Broadcast Department Announcement</h3>
              <button type="button" className="dept-ma-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dept-ma-modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    className="dept-ma-search-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Category
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Urgent Notice">Urgent Notice</option>
                      <option value="Academic Registration">Academic Registration</option>
                      <option value="Attendance Audit">Attendance Audit</option>
                      <option value="Examination Concessions">Examination Concessions</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Priority Level
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Target Student Group
                  </label>
                  <input
                    type="text"
                    className="dept-ma-search-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Detailed Announcement Text *
                  </label>
                  <textarea
                    rows="4"
                    className="dept-ma-search-input"
                    style={{ paddingLeft: '0.85rem', height: 'auto' }}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="dept-ma-modal-footer">
                <button type="button" className="dept-ma-btn-action secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dept-ma-btn-action primary">
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

