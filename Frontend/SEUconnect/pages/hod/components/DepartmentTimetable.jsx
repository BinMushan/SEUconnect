import React, { useState, useMemo, useEffect } from 'react';
import api from '../../../src/services/api.js';
import { getCurriculumBySemester, normalizeSemester } from '../../../src/services/curriculumData.js';
import '../hod.css';

// Venue Codes & Descriptions as in official SEUSL FOT Guidelines
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
  { code: 'BST-L1', label: 'BST-L1 - Bio-Systems Laboratory 1' },
  { code: 'BST-L2', label: 'BST-L2 - Bio-Systems Laboratory 2' },
];

export const TIME_SLOTS = [
  '8.30 - 9.30',
  '9.30 - 10.30',
  '10.30 - 11.30',
  '11.30 - 12.30',
  '12.30 - 1.30', // Official Lunch Break
  '1.30 - 2.30',
  '2.30 - 3.30',
  '3.30 - 4.30',
  '4.30 - 5.30',
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Official Intake Batches
export const BATCH_OPTIONS = [
  { key: '2025/2026', label: 'Batch 06 - 1st Year (2025/2026)', year: '1st Year', defaultSem: 'Year 1 Semester 1' },
  { key: '2024/2025', label: 'Batch 05 - 1st/2nd Year (2024/2025)', year: '1st/2nd Year', defaultSem: 'Year 1 Semester 2' },
  { key: '2023/2024', label: 'Batch 04 - 2nd Year (2023/2024)', year: '2nd Year', defaultSem: 'Year 2 Semester 1' },
  { key: '2022/2023', label: 'Batch 03 - 2nd Year (2022/2023)', year: '2nd Year', defaultSem: 'Year 2 Semester 2' },
  { key: '2021/2022', label: 'Batch 02 - 3rd Year (2021/2022)', year: '3rd Year', defaultSem: 'Year 3 Semester 1' },
  { key: '2020/2021', label: 'Batch 01 - 4th Year (2020/2021)', year: '4th Year', defaultSem: 'Year 4 Semester 1' },
];

export const ALL_SEMESTERS = [
  { id: 'Year 1 Semester 1', label: '1st Year - Sem 1 (Freshers)', year: 1, sem: 1 },
  { id: 'Year 1 Semester 2', label: '1st Year - Sem 2', year: 1, sem: 2 },
  { id: 'Year 2 Semester 1', label: '2nd Year - Sem 1', year: 2, sem: 1 },
  { id: 'Year 2 Semester 2', label: '2nd Year - Sem 2', year: 2, sem: 2 },
  { id: 'Year 3 Semester 1', label: '3rd Year - Sem 1', year: 3, sem: 1 },
  { id: 'Year 3 Semester 2', label: '3rd Year - Sem 2', year: 3, sem: 2 },
  { id: 'Year 4 Semester 1', label: '4th Year - Sem 1', year: 4, sem: 1 },
  { id: 'Year 4 Semester 2', label: '4th Year - Sem 2', year: 4, sem: 2 },
];

const SUBJECT_COLORS = [
  { color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8' },
  { color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  { color: '#9d174d', bg: '#fdf2f8', border: '#fbcfe8' },
  { color: '#c2410c', bg: '#fff7ed', border: '#ffedd5' },
];

export default function DepartmentTimetable({ onNavigate }) {
  const [selectedBatch, setSelectedBatch] = useState('2022/2023');
  const [selectedSemester, setSelectedSemester] = useState('Year 2 Semester 2');
  const [selectedDepartment, setSelectedDepartment] = useState('BICT'); // 'BICT' | 'BST'
  const [slots, setSlots] = useState([]);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [isSavedInDb, setIsSavedInDb] = useState(false);
  const [draggedSubject, setDraggedSubject] = useState(null);
  const [selectedSubjectForPlacement, setSelectedSubjectForPlacement] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Modal State for Manual Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    timeSlot: '8.30 - 9.30',
    code: '',
    name: '',
    lecturer: '',
    venue: 'LH5',
    type: 'Theory',
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Curriculum Data for currently selected semester
  const curData = useMemo(() => {
    return getCurriculumBySemester(selectedSemester);
  }, [selectedSemester]);

  // Available subjects for the chosen semester
  const availableSubjects = useMemo(() => {
    const rawList = curData?.subjects || [];
    // Filter by department if needed
    const filtered = rawList.filter((s) => {
      if (selectedDepartment === 'BST') return s.code?.startsWith('BST') || s.type?.includes('Bio');
      return !s.code?.startsWith('BST');
    });

    const list = filtered.length > 0 ? filtered : rawList;

    return list.map((s, idx) => {
      const palette = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
      const isPractical = s.type?.toLowerCase().includes('practical') || s.title?.toLowerCase().includes('practical') || s.code?.toLowerCase().includes('lab');
      return {
        id: s.id || `sub-${s.code}-${idx}`,
        code: s.code,
        name: s.title || s.name,
        lecturer: s.lecturer || 'Department Academic Staff',
        venue: s.venue || (isPractical ? 'CIS' : 'LH5'),
        type: isPractical ? 'Practical' : 'Theory',
        credits: s.credits || 2,
        ...palette,
      };
    });
  }, [curData, selectedDepartment]);

  // 2. Fetch Timetable from Backend / Database on mount & when batch/semester changes
  useEffect(() => {
    let cancelled = false;
    const fetchTimetable = async () => {
      setIsSavedInDb(false);
      try {
        const res = await api.getTimetable({
          semester: selectedSemester,
          batch: selectedBatch,
          department: selectedDepartment === 'BST' ? 'Department of Biosystems Technology' : 'Department of Information and Communication Technology',
          programme: selectedDepartment,
        });

        if (!cancelled && res && res.data && res.data.slots && res.data.slots.length > 0) {
          setSlots(res.data.slots);
          setIsSavedInDb(!res.data.isDefault);
          return;
        }
      } catch (err) {
        console.warn('Timetable API fetch notice:', err.message);
      }

      // Offline / Local storage fallback
      if (!cancelled) {
        try {
          const cacheKey = `seu_tt_${normalizeSemester(selectedSemester)}_${selectedBatch}_${selectedDepartment}`;
          const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
          if (cached && Array.isArray(cached) && cached.length > 0) {
            setSlots(cached);
            setIsSavedInDb(true);
            return;
          }
        } catch (_) {}

        // Fallback to default seeded curriculum slots
        const defaultSlots = (curData?.timetableSlots || []).map((s, idx) => ({
          id: s.id || `slot-seed-${idx}`,
          batch: selectedBatch,
          semester: selectedSemester,
          day: s.day,
          timeSlot: s.timeSlot,
          code: s.code,
          name: s.title || s.name || '',
          lecturer: s.lecturer || '',
          venue: s.venue || 'LH5',
          type: s.type || 'Theory',
          color: s.color || '#1e40af',
          bg: s.bg || '#eff6ff',
          border: s.border || '#bfdbfe',
        }));
        setSlots(defaultSlots);
      }
    };

    fetchTimetable();
    return () => {
      cancelled = true;
    };
  }, [selectedSemester, selectedBatch, selectedDepartment, curData]);

  // Active slots filtered for the selected batch and semester
  const activeSlots = useMemo(() => {
    return slots.filter((s) => {
      const semMatches = !s.semester || normalizeSemester(s.semester) === normalizeSemester(selectedSemester);
      const batchMatches = !s.batch || s.batch === selectedBatch;
      return semMatches && batchMatches;
    });
  }, [slots, selectedBatch, selectedSemester]);

  // Subject helper by code
  const getSubjectMeta = (code) => {
    const found = availableSubjects.find((s) => s.code.replace(/\s+/g, '') === String(code || '').replace(/\s+/g, ''));
    if (found) return found;
    return {
      code,
      name: 'Department Course Unit',
      lecturer: 'Academic Staff',
      color: '#0f2b5c',
      bg: '#f1f5f9',
      border: '#cbd5e1',
    };
  };

  // 3. Drag & Drop Handlers
  const handleDragStart = (e, subject) => {
    setDraggedSubject(subject);
    e.dataTransfer.setData('application/json', JSON.stringify(subject));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e, day, timeSlot) => {
    if (timeSlot === '12.30 - 1.30') return; // Cannot place in lunch break
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setHoveredCell(`${day}-${timeSlot}`);
  };

  const handleDragLeave = () => {
    setHoveredCell(null);
  };

  const handleDrop = (day, timeSlot, e) => {
    e.preventDefault();
    setHoveredCell(null);
    if (timeSlot === '12.30 - 1.30') {
      alert('12.30 - 1.30 is reserved for official Faculty Lunch Break.');
      return;
    }

    let dropped = draggedSubject;
    if (!dropped) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) dropped = JSON.parse(raw);
      } catch (_) {}
    }

    if (!dropped && selectedSubjectForPlacement) {
      dropped = selectedSubjectForPlacement;
    }

    if (!dropped) return;

    assignSubjectToSlot(day, timeSlot, dropped);
    setDraggedSubject(null);
  };

  const assignSubjectToSlot = (day, timeSlot, subject) => {
    const existing = activeSlots.find((s) => s.day === day && s.timeSlot === timeSlot);
    const newSlot = {
      id: existing ? existing.id : `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      batch: selectedBatch,
      semester: selectedSemester,
      day,
      timeSlot,
      code: subject.code,
      name: subject.name,
      lecturer: subject.lecturer,
      venue: subject.venue || (subject.type === 'Practical' ? 'CIS' : 'LH5'),
      type: subject.type || 'Theory',
      color: subject.color || '#1e40af',
      bg: subject.bg || '#eff6ff',
      border: subject.border || '#bfdbfe',
    };

    setSlots((prev) => {
      const filtered = prev.filter((s) => !(s.day === day && s.timeSlot === timeSlot && s.batch === selectedBatch && normalizeSemester(s.semester) === normalizeSemester(selectedSemester)));
      return [...filtered, newSlot];
    });

    setIsSavedInDb(false);
    showToast(`Assigned ${subject.code} to ${day} (${timeSlot})`);
  };

  // Click on an empty cell when a subject is selected
  const handleCellClick = (day, timeSlot) => {
    if (timeSlot === '12.30 - 1.30') return;
    if (selectedSubjectForPlacement) {
      assignSubjectToSlot(day, timeSlot, selectedSubjectForPlacement);
      setSelectedSubjectForPlacement(null);
    } else {
      handleOpenAddModal(day, timeSlot);
    }
  };

  // 4. Save Timetable to Database (MongoDB Atlas + Local Persistence)
  const handleSaveToDatabase = async () => {
    setIsSavingDb(true);
    const payload = {
      semester: normalizeSemester(selectedSemester),
      batch: selectedBatch,
      department: selectedDepartment === 'BST' ? 'Department of Biosystems Technology' : 'Department of Information and Communication Technology',
      programme: selectedDepartment,
      slots: activeSlots,
      status: 'Published',
    };

    try {
      const res = await api.saveTimetable(payload);
      setIsSavedInDb(true);
      showToast(`✓ Timetable for ${selectedSemester} (${selectedBatch}) permanently saved to database!`);

      // Cache locally
      const cacheKey = `seu_tt_${normalizeSemester(selectedSemester)}_${selectedBatch}_${selectedDepartment}`;
      localStorage.setItem(cacheKey, JSON.stringify(activeSlots));
    } catch (err) {
      console.warn('Backend save notice:', err.message);
      // Fallback cache
      const cacheKey = `seu_tt_${normalizeSemester(selectedSemester)}_${selectedBatch}_${selectedDepartment}`;
      localStorage.setItem(cacheKey, JSON.stringify(activeSlots));
      setIsSavedInDb(true);
      showToast(`✓ Timetable saved locally and synced (${activeSlots.length} slots).`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // 5. Reset to Curriculum Default
  const handleResetToDefaults = async () => {
    if (!window.confirm(`Reset timetable for ${selectedSemester} to standard faculty curriculum defaults?`)) {
      return;
    }

    try {
      await api.deleteTimetable({
        semester: selectedSemester,
        batch: selectedBatch,
        department: selectedDepartment === 'BST' ? 'Department of Biosystems Technology' : 'Department of Information and Communication Technology',
      });
    } catch (_) {}

    const defaultSlots = (curData?.timetableSlots || []).map((s, idx) => ({
      id: `slot-reset-${idx}`,
      batch: selectedBatch,
      semester: selectedSemester,
      day: s.day,
      timeSlot: s.timeSlot,
      code: s.code,
      name: s.title || s.name || '',
      lecturer: s.lecturer || '',
      venue: s.venue || 'LH5',
      type: s.type || 'Theory',
      color: s.color || '#1e40af',
      bg: s.bg || '#eff6ff',
      border: s.border || '#bfdbfe',
    }));

    setSlots(defaultSlots);
    setIsSavedInDb(false);
    const cacheKey = `seu_tt_${normalizeSemester(selectedSemester)}_${selectedBatch}_${selectedDepartment}`;
    localStorage.removeItem(cacheKey);
    showToast('Timetable reset to faculty curriculum standard.');
  };

  // Modal Handlers
  const handleOpenAddModal = (presetDay = 'Monday', presetSlot = '8.30 - 9.30') => {
    setEditingSlotId(null);
    const firstSub = availableSubjects[0];
    setFormData({
      day: presetDay,
      timeSlot: presetSlot,
      code: firstSub?.code || '',
      name: firstSub?.name || '',
      lecturer: firstSub?.lecturer || '',
      venue: firstSub?.venue || 'LH5',
      type: firstSub?.type || 'Theory',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setFormData({
      day: slot.day,
      timeSlot: slot.timeSlot,
      code: slot.code,
      name: slot.name || '',
      lecturer: slot.lecturer || '',
      venue: slot.venue || 'LH5',
      type: slot.type || 'Theory',
    });
    setIsModalOpen(true);
  };

  const handleSaveModalSlot = (e) => {
    e.preventDefault();
    if (formData.timeSlot === '12.30 - 1.30') {
      alert('12.30 - 1.30 is reserved for official Faculty Lunch Break.');
      return;
    }

    const subMeta = getSubjectMeta(formData.code);
    const slotPayload = {
      id: editingSlotId || `slot-${Date.now()}`,
      batch: selectedBatch,
      semester: selectedSemester,
      day: formData.day,
      timeSlot: formData.timeSlot,
      code: formData.code,
      name: formData.name || subMeta.name,
      lecturer: formData.lecturer || subMeta.lecturer,
      venue: formData.venue,
      type: formData.type,
      color: subMeta.color || '#1e40af',
      bg: subMeta.bg || '#eff6ff',
      border: subMeta.border || '#bfdbfe',
    };

    setSlots((prev) => {
      const filtered = prev.filter((s) => s.id !== editingSlotId && !(s.day === formData.day && s.timeSlot === formData.timeSlot && s.batch === selectedBatch && normalizeSemester(s.semester) === normalizeSemester(selectedSemester)));
      return [...filtered, slotPayload];
    });

    setIsSavedInDb(false);
    setIsModalOpen(false);
    showToast(`Configured ${formData.code} on ${formData.day} (${formData.timeSlot})`);
  };

  const handleDeleteSlot = (slotId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Remove this subject from the timetable slot?')) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setIsSavedInDb(false);
      showToast('Timetable slot removed.');
    }
  };

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
            borderLeft: '4px solid #10b981',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. View Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">DEPARTMENT GOVERNANCE • ACADEMIC TIMETABLE</span>
          <h2 className="hod-view-title">Department Academic Timetable Creator</h2>
          <p className="hod-view-subtitle">
            Configure, drag-and-drop, and store undergraduate lecture and practical timetables directly into the university database.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
              👤 Authority: <strong>HOD Department of ICT</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
              📅 Schedule Matrix: <strong>Monday – Friday (8:30 AM – 5:30 PM)</strong>
            </span>
            {isSavedInDb ? (
              <span className="hod-save-db-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Synchronized with Database
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                ● Unsaved Changes (Click Save to Database)
              </span>
            )}
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
            Print
          </button>
          <button
            type="button"
            className="hod-banner-btn"
            onClick={handleResetToDefaults}
            title="Reset to Faculty Standard Curriculum"
          >
            Reset
          </button>
          <button
            type="button"
            className="hod-banner-btn primary"
            style={{ background: '#10b981', borderColor: '#059669', color: '#ffffff', fontWeight: 700 }}
            onClick={handleSaveToDatabase}
            disabled={isSavingDb}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {isSavingDb ? 'Saving to Database...' : 'Save Timetable to Database'}
          </button>
        </div>
      </div>

      {/* 2. Batch & Semester Selection Toolbar */}
      <div className="hod-toolbar-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {/* Top row: Department + Batch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2b5c' }}>Programme:</span>
              <div className="hod-filter-tabs">
                <button
                  type="button"
                  className={`hod-tab-btn ${selectedDepartment === 'BICT' ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment('BICT')}
                >
                  BICT (Information Technology)
                </button>
                <button
                  type="button"
                  className={`hod-tab-btn ${selectedDepartment === 'BST' ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment('BST')}
                >
                  BST (Bio-Systems Technology)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2b5c' }}>Target Batch:</span>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  const matched = BATCH_OPTIONS.find((b) => b.key === e.target.value);
                  if (matched) setSelectedSemester(matched.defaultSem);
                }}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: '#0f2b5c',
                  background: '#ffffff',
                }}
              >
                {BATCH_OPTIONS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom row: All 8 Semesters Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2b5c' }}>Academic Semester:</span>
            <div className="hod-filter-tabs" style={{ flexWrap: 'wrap' }}>
              {ALL_SEMESTERS.map((sem) => (
                <button
                  key={sem.id}
                  type="button"
                  className={`hod-tab-btn ${normalizeSemester(selectedSemester) === sem.id ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(sem.id)}
                  style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}
                >
                  {sem.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Drag & Drop Subject Palette Tray */}
      <div className="hod-timetable-subject-tray">
        <div className="hod-tray-header">
          <div className="hod-tray-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Subject Palette for {selectedSemester} ({availableSubjects.length} Curriculum Units Available)</span>
          </div>
          <div className="hod-tray-instructions">
            <span>💡 Drag any subject below and drop it onto a grid slot, or click to select and place.</span>
            {selectedSubjectForPlacement && (
              <button
                type="button"
                onClick={() => setSelectedSubjectForPlacement(null)}
                style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancel Selection
              </button>
            )}
          </div>
        </div>

        {selectedSubjectForPlacement && (
          <div style={{ background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: '8px', padding: '0.5rem 0.8rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><strong>Ready to place:</strong> {selectedSubjectForPlacement.code} - {selectedSubjectForPlacement.name} ({selectedSubjectForPlacement.type}). Click any cell on the timetable to assign.</span>
          </div>
        )}

        <div className="hod-subject-palette">
          {availableSubjects.map((sub) => {
            const isSelected = selectedSubjectForPlacement?.code === sub.code;
            return (
              <div
                key={sub.code}
                className={`hod-draggable-subject-chip ${isSelected ? 'selected' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, sub)}
                onClick={() => setSelectedSubjectForPlacement(isSelected ? null : sub)}
                title={`Drag ${sub.code} to timetable slot, or click to select`}
                style={{ borderColor: sub.border, background: isSelected ? '#eff6ff' : sub.bg }}
              >
                <div className="hod-subject-chip-code" style={{ color: sub.color }}>
                  <span>{sub.code}</span>
                  <span style={{ fontSize: '0.65rem', background: '#ffffff', padding: '0.05rem 0.3rem', borderRadius: '3px', border: `1px solid ${sub.border}` }}>
                    {sub.credits} Cr
                  </span>
                </div>
                <div className="hod-subject-chip-name" title={sub.name}>
                  {sub.name}
                </div>
                <div className="hod-subject-chip-meta">
                  <span style={{ fontWeight: 600, color: sub.type === 'Practical' ? '#0f766e' : '#475569' }}>
                    {sub.type}
                  </span>
                  <span>{sub.venue}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Timetable Weekly Matrix Grid */}
      <div className="hod-card" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        {/* University Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2b5c', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f2b5c', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Official Weekly Academic Timetable
          </h3>
          <h4 style={{ margin: '0.2rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>
            Faculty of Technology • {selectedDepartment === 'BST' ? 'Department of Biosystems Technology' : 'Department of Information and Communication Technology'}
          </h4>
          <div style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
            {selectedSemester} • Academic Cohort {selectedBatch} ({selectedDepartment})
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
                  Time Slot
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} style={{ padding: '0.75rem 0.5rem', width: '17.6%', borderRight: day === 'Friday' ? 'none' : '1px solid #0f172a', fontWeight: 700, color: '#0f172a' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slotTime) => {
                // Lunch Break Row
                if (slotTime === '12.30 - 1.30') {
                  return (
                    <tr key={slotTime} style={{ borderBottom: '1px solid #0f172a', background: '#f1f5f9' }}>
                      <td style={{ padding: '0.55rem 0.5rem', borderRight: '1px solid #0f172a', fontWeight: 700, color: '#475569' }}>
                        12.30 - 1.30
                      </td>
                      <td
                        colSpan={5}
                        style={{
                          padding: '0.55rem 1rem',
                          fontWeight: 800,
                          fontSize: '0.85rem',
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
                  <tr key={slotTime} style={{ borderBottom: '1px solid #0f172a', minHeight: '68px' }}>
                    {/* Time Slot Header */}
                    <td
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRight: '1px solid #0f172a',
                        fontWeight: 700,
                        color: '#0f2b5c',
                        background: '#f8fafc',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slotTime}
                    </td>

                    {/* Day Cells */}
                    {DAYS_OF_WEEK.map((day) => {
                      const slotData = activeSlots.find((s) => s.day === day && s.timeSlot === slotTime);
                      const isHovered = hoveredCell === `${day}-${slotTime}`;

                      return (
                        <td
                          key={day}
                          className={`hod-tt-cell-droptarget ${isHovered ? 'drag-over' : ''}`}
                          style={{
                            borderRight: day === 'Friday' ? 'none' : '1px solid #0f172a',
                            background: isHovered ? '#eff6ff' : slotData ? slotData.bg || '#ffffff' : '#ffffff',
                          }}
                          onDragOver={(e) => handleDragOver(e, day, slotTime)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(day, slotTime, e)}
                        >
                          {slotData ? (
                            <div
                              className="hod-tt-slot-card"
                              style={{
                                background: slotData.bg || '#eff6ff',
                                borderColor: slotData.border || '#bfdbfe',
                              }}
                              onClick={() => handleOpenEditModal(slotData)}
                            >
                              <div className="hod-tt-slot-header">
                                <span className="hod-tt-slot-code" style={{ color: slotData.color || '#1e40af' }}>
                                  {slotData.code}
                                </span>
                                <div className="hod-tt-slot-actions">
                                  <button
                                    type="button"
                                    className="hod-tt-action-btn"
                                    title="Edit Slot"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditModal(slotData);
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className="hod-tt-action-btn delete"
                                    title="Remove Slot"
                                    onClick={(e) => handleDeleteSlot(slotData.id, e)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                              {slotData.name && (
                                <div className="hod-tt-slot-title" title={slotData.name}>
                                  {slotData.name}
                                </div>
                              )}
                              <div className="hod-tt-slot-badges">
                                <span className="hod-tt-venue-pill">📍 {slotData.venue || 'LH5'}</span>
                                <span
                                  className="hod-tt-type-pill"
                                  style={{
                                    background: slotData.type === 'Practical' ? '#ccfbf1' : '#e0e7ff',
                                    color: slotData.type === 'Practical' ? '#0f766e' : '#3730a3',
                                  }}
                                >
                                  {slotData.type || 'Theory'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="hod-tt-cell-empty-btn"
                              onClick={() => handleCellClick(day, slotTime)}
                              title={selectedSubjectForPlacement ? `Click to place ${selectedSubjectForPlacement.code}` : 'Drag subject here or click to configure'}
                            >
                              {selectedSubjectForPlacement ? '+ Place Here' : '+ Add Slot'}
                            </button>
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

        {/* Legend / Note */}
        <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.4rem' }}>
            FACULTY TIMETABLE DIRECTORY & VENUES:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#475569' }}>
            {VENUES_LIST.map((v) => (
              <span key={v.code} style={{ background: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <strong>{v.code}</strong>: {v.label.split(' - ')[1]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Add / Edit Slot Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            backdropFilter: 'blur(3px)',
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f2b5c' }}>
                {editingSlotId ? 'Edit Timetable Slot' : 'Configure Timetable Slot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalSlot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Select Course Unit:
                </label>
                <select
                  value={formData.code}
                  onChange={(e) => {
                    const sel = availableSubjects.find((s) => s.code === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value,
                      name: sel?.name || prev.name,
                      lecturer: sel?.lecturer || prev.lecturer,
                      venue: sel?.venue || prev.venue,
                      type: sel?.type || prev.type,
                    }));
                  }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                >
                  {availableSubjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Lecture Day:
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Time Slot:
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    {TIME_SLOTS.filter((t) => t !== '12.30 - 1.30').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Venue / Laboratory:
                  </label>
                  <select
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    {VENUES_LIST.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Class Type:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    <option value="Theory">Theory Lecture</option>
                    <option value="Practical">Laboratory Practical</option>
                    <option value="Tutorial">Tutorial Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Assigned Lecturer / Staff:
                </label>
                <input
                  type="text"
                  value={formData.lecturer}
                  onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                  placeholder="e.g. Dr. M. Kirushanth"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {editingSlotId ? 'Update Slot' : 'Add to Timetable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
