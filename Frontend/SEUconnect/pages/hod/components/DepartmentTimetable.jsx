import React, { useState, useMemo } from 'react';
import '../hod.css';

// 9 Official Subject Definitions from the User's PDF
export const INITIAL_SUBJECTS_LIST = [
  { code: 'SWT 22012', name: 'Internet Application Development', lecturer: 'Mr. J Ahamed Adhil', type: 'Theory', defaultVenue: 'LH5', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  { code: 'CIS 22012', name: 'Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', type: 'Theory', defaultVenue: 'LH10', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  { code: 'CIS 22022', name: 'Information Assurance and Forensics', lecturer: 'Mr. MJ Ahamed Sabani', type: 'Theory', defaultVenue: 'LH10', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { code: 'CIS 22032', name: 'E-commerce Strategis and Architecture', lecturer: 'Ms. AF Masroofa', type: 'Theory', defaultVenue: 'SWT', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { code: 'UCT 22011', name: 'Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', type: 'Theory', defaultVenue: 'LH5', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { code: 'CMS 22012', name: 'Leadership & Communication Skills', lecturer: 'Ms. ARF Shafana', type: 'Theory', defaultVenue: 'LH5', color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8' },
  { code: 'SWT 22022', name: 'Practical for Internet Application Development', lecturer: 'Mr. J Ahamed Adhil', type: 'Practical', defaultVenue: 'CIS', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { code: 'CIS 22042', name: 'Practical for Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', type: 'Practical', defaultVenue: 'MAC', color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  { code: 'UCT 22022', name: 'Practical for Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', type: 'Practical', defaultVenue: 'CIS', color: '#9d174d', bg: '#fdf2f8', border: '#fbcfe8' },
];

// Venue Codes & Descriptions as in official NOTE
export const VENUES_LIST = [
  { code: 'LH10', label: 'LH10 - Lecture Hall 10' },
  { code: 'LH5', label: 'LH5 - Lecture Hall 5' },
  { code: 'LH4', label: 'LH4 - Lecture Hall 4' },
  { code: 'SWT', label: 'SWT - Software Technologies Laboratory' },
  { code: 'NST', label: 'NST - Cisco Academy Laboratory' },
  { code: 'MAL', label: 'MAL - Mobile Application Laboratory' },
  { code: 'CIS', label: 'CIS - Computing Information System Laboratory' },
  { code: 'CS', label: 'CS - Cezeri Studio' },
  { code: 'WNT', label: 'WNT - Wireless Network Technologies Laboratory' },
  { code: 'MAC', label: 'MAC - Multimedia & Apple Center' },
];

export const TIME_SLOTS = [
  '8.30 - 9.30',
  '9.30 - 10.30',
  '10.30 - 11.30',
  '11.30 - 12.30',
  '12.30 - 1.30', // Lunch
  '1.30 - 2.30',
  '2.30 - 3.30',
  '3.30 - 4.30',
  '4.30 - 5.30',
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Five Batches as per SEUSL FOT Standard
export const BATCH_OPTIONS = [
  { key: '2022/2023', label: '2022/2023 (Yr 2 - Sem II)', year: '2nd Year', defaultSem: 'Semester II' },
  { key: '2025/2024', label: '2025/2024 (1st Year)', year: '1st Year', defaultSem: 'Semester I' },
  { key: '2024/2023', label: '2024/2023 (2nd Year)', year: '2nd Year', defaultSem: 'Semester I' },
  { key: '2023/2022', label: '2023/2022 (3rd Year)', year: '3rd Year', defaultSem: 'Semester II' },
  { key: '2021/2020', label: '2021/2020 (Final Year)', year: '4th Year', defaultSem: 'Semester II' },
];

// Initial Seed Slots exactly transcribed from user's attached document
const SEED_TIMETABLE_SLOTS = [
  // Monday
  { id: 'm-1', batch: '2022/2023', semester: 'Semester II', day: 'Monday', timeSlot: '10.30 - 11.30', code: 'CIS 22032', venue: 'SWT', type: 'Theory' },
  { id: 'm-2', batch: '2022/2023', semester: 'Semester II', day: 'Monday', timeSlot: '11.30 - 12.30', code: 'CIS 22032', venue: 'SWT', type: 'Theory' },
  { id: 'm-3', batch: '2022/2023', semester: 'Semester II', day: 'Monday', timeSlot: '1.30 - 2.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'm-4', batch: '2022/2023', semester: 'Semester II', day: 'Monday', timeSlot: '2.30 - 3.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'm-5', batch: '2022/2023', semester: 'Semester II', day: 'Monday', timeSlot: '3.30 - 4.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },

  // Tuesday
  { id: 't-1', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '8.30 - 9.30', code: 'UCT 22022', venue: 'CIS', type: 'Practical' },
  { id: 't-2', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '9.30 - 10.30', code: 'UCT 22022', venue: 'CIS', type: 'Practical' },
  { id: 't-3', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '10.30 - 11.30', code: 'CMS 22012', venue: 'LH5', type: 'Theory' },
  { id: 't-4', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '11.30 - 12.30', code: 'CMS 22012', venue: 'LH5', type: 'Theory' },
  { id: 't-5', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '2.30 - 3.30', code: 'CIS 22012', venue: 'LH10', type: 'Theory' },
  { id: 't-6', batch: '2022/2023', semester: 'Semester II', day: 'Tuesday', timeSlot: '3.30 - 4.30', code: 'CIS 22012', venue: 'LH10', type: 'Theory' },

  // Wednesday
  { id: 'w-1', batch: '2022/2023', semester: 'Semester II', day: 'Wednesday', timeSlot: '8.30 - 9.30', code: 'CIS 22022', venue: 'LH10', type: 'Theory' },
  { id: 'w-2', batch: '2022/2023', semester: 'Semester II', day: 'Wednesday', timeSlot: '9.30 - 10.30', code: 'CIS 22022', venue: 'LH10', type: 'Theory' },
  { id: 'w-3', batch: '2022/2023', semester: 'Semester II', day: 'Wednesday', timeSlot: '1.30 - 2.30', code: 'CIS 22042', venue: 'MAC', type: 'Practical' },
  { id: 'w-4', batch: '2022/2023', semester: 'Semester II', day: 'Wednesday', timeSlot: '2.30 - 3.30', code: 'CIS 22042', venue: 'MAC', type: 'Practical' },

  // Thursday
  { id: 'th-1', batch: '2022/2023', semester: 'Semester II', day: 'Thursday', timeSlot: '8.30 - 9.30', code: 'UCT 22011', venue: 'LH5', type: 'Theory' },
  { id: 'th-2', batch: '2022/2023', semester: 'Semester II', day: 'Thursday', timeSlot: '9.30 - 10.30', code: 'SWT 22012', venue: 'LH5', type: 'Theory' },
  { id: 'th-3', batch: '2022/2023', semester: 'Semester II', day: 'Thursday', timeSlot: '10.30 - 11.30', code: 'SWT 22012', venue: 'LH5', type: 'Theory' },

  // Friday
  { id: 'f-1', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '8.30 - 9.30', code: 'UCT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'f-2', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '9.30 - 10.30', code: 'UCT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'f-3', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '10.30 - 11.30', code: 'CIS 22042', venue: 'CIS', type: 'Practical' },
  { id: 'f-4', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '11.30 - 12.30', code: 'CIS 22042', venue: 'CIS', type: 'Practical' },
  { id: 'f-5', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '2.30 - 3.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'f-6', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '3.30 - 4.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },
  { id: 'f-7', batch: '2022/2023', semester: 'Semester II', day: 'Friday', timeSlot: '4.30 - 5.30', code: 'SWT 22022', venue: 'CIS', type: 'Practical' },
];

export default function DepartmentTimetable({ onNavigate }) {
  const [slots, setSlots] = useState(SEED_TIMETABLE_SLOTS);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS_LIST);
  const [selectedBatch, setSelectedBatch] = useState('2022/2023');
  const [selectedSemester, setSelectedSemester] = useState('Semester II');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Adding/Editing Timetable Slot
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [formData, setFormData] = useState({
    batch: '2022/2023',
    semester: 'Semester II',
    day: 'Monday',
    timeSlot: '8.30 - 9.30',
    code: 'SWT 22012',
    venue: 'LH5',
    type: 'Theory',
    customSubject: '',
    customLecturer: '',
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find slot mapping for easy lookup
  const activeSlots = useMemo(() => {
    return slots.filter(
      (s) => s.batch === selectedBatch && s.semester === selectedSemester
    );
  }, [slots, selectedBatch, selectedSemester]);

  // Lookup subject info by code
  const getSubjectByCode = (code) => {
    return subjects.find((s) => s.code.replace(/\s+/g, '') === code.replace(/\s+/g, '')) || {
      code,
      name: 'Department Course Unit',
      lecturer: 'Academic Staff',
      color: '#0f2b5c',
      bg: '#f1f5f9',
      border: '#cbd5e1',
    };
  };

  // Open Creation Modal
  const handleOpenAddModal = (presetDay = null, presetSlot = null) => {
    setEditingSlotId(null);
    setFormData({
      batch: selectedBatch,
      semester: selectedSemester,
      day: presetDay || 'Monday',
      timeSlot: presetSlot || '8.30 - 9.30',
      code: subjects[0]?.code || 'SWT 22012',
      venue: 'LH5',
      type: 'Theory',
      customSubject: '',
      customLecturer: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setFormData({
      batch: slot.batch,
      semester: slot.semester,
      day: slot.day,
      timeSlot: slot.timeSlot,
      code: slot.code,
      venue: slot.venue,
      type: slot.type || 'Theory',
      customSubject: '',
      customLecturer: '',
    });
    setIsModalOpen(true);
  };

  // Save Slot (Add or Update)
  const handleSaveSlot = (e) => {
    e.preventDefault();

    if (formData.timeSlot === '12.30 - 1.30') {
      alert('12.30 - 1.30 is reserved for official Faculty Lunch Break.');
      return;
    }

    if (editingSlotId) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === editingSlotId
            ? {
                ...s,
                batch: formData.batch,
                semester: formData.semester,
                day: formData.day,
                timeSlot: formData.timeSlot,
                code: formData.code,
                venue: formData.venue,
                type: formData.type,
              }
            : s
        )
      );
      showToast(`Updated slot ${formData.code} on ${formData.day} (${formData.timeSlot})`);
    } else {
      // Check for conflict
      const conflict = slots.find(
        (s) =>
          s.batch === formData.batch &&
          s.semester === formData.semester &&
          s.day === formData.day &&
          s.timeSlot === formData.timeSlot
      );

      if (conflict) {
        if (!window.confirm(`A class (${conflict.code} at ${conflict.venue}) already exists in this slot. Replace it?`)) {
          return;
        }
        setSlots((prev) => [
          ...prev.filter((s) => s.id !== conflict.id),
          {
            id: `slot-${Date.now()}`,
            batch: formData.batch,
            semester: formData.semester,
            day: formData.day,
            timeSlot: formData.timeSlot,
            code: formData.code,
            venue: formData.venue,
            type: formData.type,
          },
        ]);
        showToast(`Replaced slot with ${formData.code} (${formData.venue})`);
      } else {
        const newSlot = {
          id: `slot-${Date.now()}`,
          batch: formData.batch,
          semester: formData.semester,
          day: formData.day,
          timeSlot: formData.timeSlot,
          code: formData.code,
          venue: formData.venue,
          type: formData.type,
        };
        setSlots((prev) => [...prev, newSlot]);
        showToast(`Added ${formData.code} to ${formData.day} (${formData.timeSlot})`);
      }
    }

    setIsModalOpen(false);
  };

  // Delete Slot
  const handleDeleteSlot = (slotId) => {
    if (window.confirm('Are you sure you want to remove this timetable slot?')) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      showToast('Timetable slot removed successfully.');
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hod-dashboard-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            background: '#0f2b5c',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 100001,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderLeft: '4px solid #f59e0b',
            animation: 'hodPopupIn 0.2s ease-out',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. View Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">DEPARTMENT GOVERNANCE • ACADEMIC TIMETABLE</span>
          <h2 className="hod-view-title">Department Academic Timetable</h2>
          <p className="hod-view-subtitle">
            Department of Information and Communication Technology • Faculty of Technology, SEUSL
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              👤 Authority: <strong>M.J Ahamed Sabani (HOD/ICT)</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              📅 Schedule Matrix: <strong>Monday – Friday (8:30 AM – 5:30 PM)</strong>
            </span>
          </div>
        </div>

        <div className="hod-banner-actions">
          <button
            type="button"
            className="hod-banner-btn"
            onClick={handlePrint}
            title="Print or Export Timetable"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Timetable
          </button>
          <button
            type="button"
            className="hod-banner-btn primary"
            onClick={() => handleOpenAddModal()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Timetable Slot
          </button>
        </div>
      </div>

      {/* 2. Batch & Semester Selection Toolbar */}
      <div className="hod-toolbar-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
          {/* Batch Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2b5c' }}>Batch:</span>
            <div className="hod-filter-tabs">
              {BATCH_OPTIONS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className={`hod-tab-btn ${selectedBatch === b.key ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedBatch(b.key);
                    setSelectedSemester(b.defaultSem);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semester Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2b5c' }}>Semester:</span>
            <div className="hod-filter-tabs">
              {['Semester I', 'Semester II'].map((sem) => (
                <button
                  key={sem}
                  type="button"
                  className={`hod-tab-btn ${selectedSemester === sem ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(sem)}
                  style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Timetable Document Card */}
      <div className="hod-card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        {/* University Header matching the PDF */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2b5c', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f2b5c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Timetable
          </h3>
          <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#1e3a8a' }}>
            Department of Information and Communication Technology
          </h4>
          <div style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
            Academic Batch {selectedBatch} ({selectedBatch === '2022/2023' ? 'Yr 2- Sem II' : selectedSemester})
          </div>
        </div>

        {/* Timetable Table Grid */}
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '0.82rem',
              border: '2px solid #0f172a',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #0f172a' }}>
                <th style={{ padding: '0.75rem 0.5rem', width: '12%', borderRight: '1px solid #0f172a', fontWeight: 700, color: '#0f172a' }}>
                  Time
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} style={{ padding: '0.75rem 0.5rem', width: '17.6%', borderRight: day === 'Friday' ? 'none' : '1px solid #0f172a', fontWeight: 700, color: '#0f172a' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => {
                // Special Lunch Break Row
                if (slot === '12.30 - 1.30') {
                  return (
                    <tr key={slot} style={{ borderBottom: '1px solid #0f172a', background: '#f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.5rem', borderRight: '1px solid #0f172a', fontWeight: 700, color: '#475569' }}>
                        12.30 - 1.30
                      </td>
                      <td
                        colSpan={5}
                        style={{
                          padding: '0.65rem 1rem',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: '#0f2b5c',
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          background: '#f8fafc',
                        }}
                      >
                        LUNCH BREAK
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot} style={{ borderBottom: '1px solid #0f172a', minHeight: '62px' }}>
                    {/* Time Slot Column */}
                    <td
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRight: '1px solid #0f172a',
                        fontWeight: 700,
                        color: '#0f172a',
                        background: '#f8fafc',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slot}
                    </td>

                    {/* Monday - Friday Day Columns */}
                    {DAYS_OF_WEEK.map((day) => {
                      const session = activeSlots.find((s) => s.day === day && s.timeSlot === slot);
                      const subj = session ? getSubjectByCode(session.code) : null;

                      return (
                        <td
                          key={day}
                          style={{
                            padding: '0.45rem 0.35rem',
                            borderRight: day === 'Friday' ? 'none' : '1px solid #0f172a',
                            verticalAlign: 'middle',
                            height: '58px',
                            background: session ? subj.bg : '#ffffff',
                            position: 'relative',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {session ? (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.15rem',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleOpenEditModal(session)}
                              title={`Click to edit: ${subj.name} (${subj.lecturer})`}
                            >
                              <div style={{ fontWeight: 800, color: subj.color, fontSize: '0.85rem' }}>
                                {session.code}
                              </div>
                              <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>
                                ({session.venue})
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleOpenAddModal(day, slot)}
                              style={{
                                height: '100%',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#cbd5e1',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                              }}
                              title={`Click to schedule a class on ${day} (${slot})`}
                            >
                              <span style={{ opacity: 0.35 }}>+</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. NOTE Box for Lab & Lecture Hall Acronyms (From PDF) */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            border: '1px solid #0f172a',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#0f172a',
          }}
        >
          <strong style={{ color: '#0f2b5c' }}>NOTE: </strong>
          LH10 - Lecture Hall 10; LH5 - Lecture Hall 5; LH4 - Lecture Hall 4; SWT - Software Technologies Laboratory;
          NST - Cisco Academy Laboratory; MAL - Mobile Application Laboratory; CIS - Computing Information System Laboratory;
          CS - Cezeri Studio; WNT - Wireless Network Technologies Laboratory; MAC - Multimedia & Apple Center
        </div>

        {/* 5. Subject Code & Lecturer-in-Charge Table (From Bottom of PDF) */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2b5c' }}>
              Course Units & Lecturers In-Charge ({selectedBatch})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing all active semester modules with assigned academic faculty
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #0f172a' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                  <th style={{ padding: '0.6rem 0.75rem', width: '6%', borderRight: '1px solid #0f172a', textAlign: 'center', color: '#0f172a' }}>#</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '20%', borderRight: '1px solid #0f172a', textAlign: 'left', color: '#0f172a' }}>SUBJECT CODE</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '48%', borderRight: '1px solid #0f172a', textAlign: 'left', color: '#0f172a' }}>SUBJECT</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '26%', textAlign: 'left', color: '#0f172a' }}>LECTURER IN-CHARGE</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subj, idx) => (
                  <tr key={subj.code} style={{ borderBottom: idx === subjects.length - 1 ? 'none' : '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.55rem 0.75rem', borderRight: '1px solid #0f172a', textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', borderRight: '1px solid #0f172a', fontWeight: 700, color: subj.color }}>
                      {subj.code}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', borderRight: '1px solid #0f172a', color: '#1e293b' }}>
                      {subj.name}
                      {subj.type === 'Practical' && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          LAB
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                      {subj.lecturer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. CREATE / EDIT TIMETABLE SLOT MODAL (Front & Center Popup) */}
      {isModalOpen && (
        <div
          className="hod-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            className="hod-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              animation: 'hodPopupIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div
              className="hod-modal-header"
              style={{
                background: 'linear-gradient(135deg, #071733 0%, #0f2b5c 100%)',
                color: '#ffffff',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '3px solid #f59e0b',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingSlotId ? 'Edit Timetable Slot' : 'Create New Timetable Slot'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                  {formData.batch} • {formData.semester}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlot}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Batch & Semester */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Target Batch:
                    </label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      {BATCH_OPTIONS.map((b) => (
                        <option key={b.key} value={b.key}>{b.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Semester:
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      <option value="Semester I">Semester I</option>
                      <option value="Semester II">Semester II</option>
                    </select>
                  </div>
                </div>

                {/* Day of Week & Time Slot */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Day of Week:
                    </label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Time Slot:
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      {TIME_SLOTS.filter((ts) => ts !== '12.30 - 1.30').map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Course Unit / Subject:
                  </label>
                  <select
                    value={formData.code}
                    onChange={(e) => {
                      const selSubj = subjects.find((s) => s.code === e.target.value);
                      setFormData({
                        ...formData,
                        code: e.target.value,
                        venue: selSubj?.defaultVenue || formData.venue,
                        type: selSubj?.type || formData.type,
                      });
                    }}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                  >
                    {subjects.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.name} ({s.lecturer})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Venue / Lecture Hall / Lab & Class Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Venue / Facility:
                    </label>
                    <select
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      {VENUES_LIST.map((v) => (
                        <option key={v.code} value={v.code}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Session Type:
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                    >
                      <option value="Theory">Theory Lecture</option>
                      <option value="Practical">Practical Laboratory</option>
                      <option value="Tutorial">Tutorial / Seminar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {editingSlotId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(editingSlotId)}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete Slot
                  </button>
                ) : (
                  <div />
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="hod-btn-outline"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hod-btn-primary"
                    style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    {editingSlotId ? 'Save Changes' : 'Add to Timetable'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
