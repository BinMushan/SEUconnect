import { useState, useMemo } from 'react';
import api, { penaltyStorage, localNotificationStorage } from '../../../src/services/api.js';
import './penalties_management.css';

export default function PenaltiesManagement({
  penalties = [],
  batches = [],
  students = [],
  onClearPenalty,
  onAddPenalty,
  onDeletePenalty
}) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clearingPenalty, setClearingPenalty] = useState(null);
  const [clearancePivRef, setClearancePivRef] = useState('');
  const [clearanceNotes, setClearanceNotes] = useState('Official fine payment voucher verified by Faculty Administration & Bursar.');

  // Form states for new record
  const [newRegNo, setNewRegNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Department of Information & Communication Technology');
  const [newBatch, setNewBatch] = useState('Batch 03 (2022/2023)');
  const [newCategory, setNewCategory] = useState('Laboratory Equipment / Safety');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');

  // Autocomplete suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter student suggestions as the user types
  const studentSuggestions = useMemo(() => {
    if (!newRegNo.trim() || !Array.isArray(students) || students.length === 0) return [];
    const q = newRegNo.trim().toLowerCase();
    return students
      .filter((s) => {
        const reg = (s.regNo || '').toLowerCase();
        const name = (s.name || '').toLowerCase();
        return reg.includes(q) || name.includes(q);
      })
      .slice(0, 5);
  }, [newRegNo, students]);

  // Handle student autocomplete selection
  const handleSelectStudent = (stu) => {
    setNewRegNo(stu.regNo || '');
    setNewName(stu.name || '');

    // Auto-populate Department
    if (stu.department) {
      setNewDepartment(stu.department);
    } else if ((stu.regNo || '').includes('ICT') || (stu.programme || '').includes('BICT')) {
      setNewDepartment('Department of Information & Communication Technology');
    } else if ((stu.regNo || '').includes('BST') || (stu.programme || '').includes('BST')) {
      setNewDepartment('Department of Bio Systems Technology');
    }

    // Auto-populate Batch
    if (stu.batchName) {
      setNewBatch(stu.batchName);
    } else if (stu.batchCode) {
      const matchBatch = batches.find((b) => b.code === stu.batchCode || b.id === stu.batchId);
      if (matchBatch) setNewBatch(matchBatch.name);
    }

    setShowSuggestions(false);
  };

  // Auto-detect Department and Batch from standard SEU Reg No pattern (e.g. SEU/IS/22/ICT/091)
  const handleRegNoChange = (val) => {
    setNewRegNo(val);
    setShowSuggestions(true);
    const upper = val.toUpperCase();

    // Auto-detect department
    if (upper.includes('/ICT/') || upper.includes('ICT')) {
      setNewDepartment('Department of Information & Communication Technology');
    } else if (upper.includes('/BST/') || upper.includes('BST')) {
      setNewDepartment('Department of Bio Systems Technology');
    } else if (upper.includes('/DIS/') || upper.includes('DIS')) {
      setNewDepartment('Department of Interdisciplinary Studies');
    }

    // Auto-detect batch from 2-digit intake year
    if (upper.includes('/20/') || upper.includes('20ICT') || upper.includes('20BST')) {
      setNewBatch('Batch 01 (2020/2021)');
    } else if (upper.includes('/21/') || upper.includes('21ICT') || upper.includes('21BST')) {
      setNewBatch('Batch 02 (2021/2022)');
    } else if (upper.includes('/22/') || upper.includes('22ICT') || upper.includes('22BST')) {
      setNewBatch('Batch 03 (2022/2023)');
    } else if (upper.includes('/23/') || upper.includes('23ICT') || upper.includes('23BST')) {
      setNewBatch('Batch 04 (2023/2024)');
    } else if (upper.includes('/24/') || upper.includes('24ICT') || upper.includes('24BST')) {
      setNewBatch('Batch 05 (2024/2025)');
    }
  };

  // Submit new disciplinary entry
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRegNo.trim() || !newName.trim() || !newDesc.trim()) return;

    const penaltyId = `PEN-${Date.now()}`;
    const cleanRegNo = newRegNo.trim().toUpperCase();
    const cleanStudentName = newName.trim();
    const cleanAmount = newAmount.trim() || 'Warning Notice Issued';

    const newRecord = {
      id: penaltyId,
      regNo: cleanRegNo,
      studentName: cleanStudentName,
      department: newDepartment,
      batch: newBatch,
      category: newCategory,
      description: newDesc.trim(),
      penaltyAmount: cleanAmount,
      imposedDate: new Date().toISOString().split('T')[0],
      imposedBy: 'Faculty Administration Office',
      status: 'Pending Clearance',
      clearanceNotes: 'Pending official fine payment voucher verification.'
    };

    // 1. Save Disciplinary Record to state & local penalty persistence
    if (onAddPenalty) {
      onAddPenalty(newRecord);
    }
    penaltyStorage.save(newRecord);

    // 2. Identify particular Department Head (HOD) details
    const isBst = newDepartment.includes('Bio') || newDepartment.includes('BST');
    const hodRole = 'hod';
    const hodDept = isBst
      ? 'Department of Bio Systems Technology'
      : 'Department of Information & Communication Technology';
    const hodEmail = isBst ? 'hod_bst@seu.ac.lk' : 'HOD@gmail.com';
    const hodTitle = isBst ? 'HOD Bio Systems Technology' : 'HOD ICT';

    // 3. Construct Notification for the particular Department Head
    const hodNotification = {
      title: `Disciplinary Record Imposed: ${cleanRegNo} (${newCategory})`,
      message: `A formal disciplinary penalty (${cleanAmount}) has been placed on student ${cleanStudentName} (${cleanRegNo}, ${newBatch}) under "${newCategory}". Reason: ${newDesc.trim()}`,
      type: 'Disciplinary',
      priority: 'urgent',
      recipientRole: hodRole,
      recipientDepartment: hodDept,
      recipientEmail: hodEmail,
      targetTab: 'dashboard',
      relatedRequestId: penaltyId,
    };

    // 4. Construct Notification for the Student
    const studentNotification = {
      title: `Official Disciplinary & Penalty Notice: ${newCategory}`,
      message: `Dear ${cleanStudentName}, a disciplinary penalty of "${cleanAmount}" has been recorded under your student registration (${cleanRegNo}, ${newBatch}) regarding: ${newCategory}. Authority Notes: ${newDesc.trim()}. Please submit payment clearance or contact your Department Head / Proctor.`,
      type: 'Disciplinary',
      priority: 'urgent',
      recipientRole: 'student',
      recipientDepartment: newDepartment,
      recipientEmail: `${cleanRegNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`,
      targetTab: 'penalties_disciplinary',
      relatedRequestId: penaltyId,
    };

    // 5. Save notifications locally for immediate cross-portal updates
    localNotificationStorage.save(hodNotification);
    localNotificationStorage.save(studentNotification);

    // 6. Attempt background server notification dispatch
    try {
      await api.createNotification(hodNotification);
    } catch {
      /* fallback to local storage */
    }
    try {
      await api.createNotification(studentNotification);
    } catch {
      /* fallback to local storage */
    }

    setNotificationStatus(`✓ Recorded disciplinary action. Official notices dispatched to ${hodTitle} and student ${cleanRegNo}.`);
    setTimeout(() => setNotificationStatus(''), 7000);

    // Reset Form
    setNewRegNo('');
    setNewName('');
    setNewDesc('');
    setNewAmount('');
    setIsAddModalOpen(false);
  };

  // Open clearance modal
  const handleOpenClearModal = (pen) => {
    setClearingPenalty(pen);
    setClearancePivRef('');
    setClearanceNotes('Official fine payment voucher verified by Faculty Administration & Bursar.');
  };

  // Confirm clearance and notify student + HOD
  const handleConfirmClearance = async (e) => {
    e.preventDefault();
    if (!clearingPenalty) return;

    const finalNotes = clearancePivRef.trim()
      ? `${clearanceNotes.trim()} (Receipt / PIV Slip Ref: ${clearancePivRef.trim()})`
      : clearanceNotes.trim();

    if (onClearPenalty) {
      onClearPenalty(clearingPenalty.id, finalNotes);
    } else {
      penaltyStorage.updateStatus(clearingPenalty.id, 'Cleared', finalNotes);
    }

    // Dispatch Student Clearance Notification
    const studentClearNotification = {
      title: `Disciplinary Clearance Confirmed: ${clearingPenalty.category}`,
      message: `Dear ${clearingPenalty.studentName}, your disciplinary record (${clearingPenalty.penaltyAmount}) has been officially VERIFIED & CLEARED by Faculty Administration. Good standing has been restored. Remarks: ${finalNotes}`,
      type: 'Disciplinary',
      priority: 'normal',
      recipientRole: 'student',
      recipientDepartment: clearingPenalty.department,
      recipientEmail: `${(clearingPenalty.regNo || '').toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`,
      targetTab: 'penalties_disciplinary',
      relatedRequestId: clearingPenalty.id,
    };

    localNotificationStorage.save(studentClearNotification);
    try {
      await api.createNotification(studentClearNotification);
    } catch {
      /* local cache fallback */
    }

    // Trigger cross-portal reactive event
    window.dispatchEvent(new CustomEvent('seu_penalties_updated', { detail: { id: clearingPenalty.id, status: 'Cleared' } }));

    setNotificationStatus(`✓ Disciplinary record for ${clearingPenalty.regNo} officially cleared. Student notified.`);
    setTimeout(() => setNotificationStatus(''), 7000);

    setClearingPenalty(null);
  };

  // Handle delete record
  const handleDelete = (id, regNo) => {
    if (window.confirm(`Are you sure you want to permanently remove disciplinary record ${id} for ${regNo}?`)) {
      if (onDeletePenalty) {
        onDeletePenalty(id);
      } else {
        penaltyStorage.remove(id);
      }
      setNotificationStatus(`✓ Disciplinary record ${id} removed.`);
      setTimeout(() => setNotificationStatus(''), 5000);
    }
  };

  // Filtered penalties based on search & filters
  const filteredPenalties = useMemo(() => {
    return penalties.filter((pen) => {
      // Department filter
      if (deptFilter !== 'All') {
        const isBst = pen.department?.includes('Bio') || pen.department?.includes('BST') || pen.regNo?.includes('BST');
        const deptCode = isBst ? 'BST' : (pen.department?.includes('Interdisciplinary') || pen.regNo?.includes('DIS') ? 'DIS' : 'BICT');
        if (deptFilter !== deptCode) return false;
      }

      // Batch filter
      if (batchFilter !== 'All') {
        if (!pen.batch?.includes(batchFilter) && !pen.regNo?.includes(batchFilter)) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (pen.status !== statusFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchReg = (pen.regNo || '').toLowerCase().includes(q);
        const matchName = (pen.studentName || '').toLowerCase().includes(q);
        const matchCategory = (pen.category || '').toLowerCase().includes(q);
        const matchDesc = (pen.description || '').toLowerCase().includes(q);
        const matchAmount = (pen.penaltyAmount || '').toLowerCase().includes(q);
        if (!matchReg && !matchName && !matchCategory && !matchDesc && !matchAmount) return false;
      }

      return true;
    });
  }, [penalties, deptFilter, batchFilter, statusFilter, searchQuery]);

  // Derived KPI statistics
  const totalCount = penalties.length;
  const pendingCount = penalties.filter((p) => p.status === 'Pending Clearance').length;
  const probationCount = penalties.filter((p) => p.status === 'Active Probation' || p.status?.includes('Suspension')).length;
  const clearedCount = penalties.filter((p) => p.status === 'Cleared').length;

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Penalties, Disciplinary Records &amp; Clearances</h2>
          <p className="adm-section-subtitle">
            Track student disciplinary inquiries, monitor laboratory equipment damage fines, library overdues, and reconcile institutional clearance slips.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Record Disciplinary / Penalty Entry
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="adm-penalties-kpi-grid">
        <div className="adm-penalties-kpi-card">
          <div className="adm-penalties-kpi-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="adm-penalties-kpi-content">
            <span className="adm-penalties-kpi-label">Total Records</span>
            <span className="adm-penalties-kpi-val">{totalCount}</span>
          </div>
        </div>

        <div className="adm-penalties-kpi-card">
          <div className="adm-penalties-kpi-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="adm-penalties-kpi-content">
            <span className="adm-penalties-kpi-label">Pending Clearance</span>
            <span className="adm-penalties-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</span>
          </div>
        </div>

        <div className="adm-penalties-kpi-card">
          <div className="adm-penalties-kpi-icon rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="adm-penalties-kpi-content">
            <span className="adm-penalties-kpi-label">Active Probation</span>
            <span className="adm-penalties-kpi-val" style={{ color: '#dc2626' }}>{probationCount}</span>
          </div>
        </div>

        <div className="adm-penalties-kpi-card">
          <div className="adm-penalties-kpi-icon emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="adm-penalties-kpi-content">
            <span className="adm-penalties-kpi-label">Fully Cleared</span>
            <span className="adm-penalties-kpi-val" style={{ color: '#059669' }}>{clearedCount}</span>
          </div>
        </div>
      </div>

      {/* Notification Toast/Banner */}
      {notificationStatus && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Multi-Filter & Search Toolbar */}
      <div className="adm-penalties-toolbar">
        <div className="adm-penalties-search-box">
          <svg className="adm-penalties-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="adm-penalties-search-input"
            placeholder="Search candidate name, reg number, category, or fine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="adm-penalties-filters">
          <select
            className="adm-penalties-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="BICT">Department of ICT (BICT)</option>
            <option value="BST">Department of BST (BST)</option>
            <option value="DIS">Interdisciplinary (DIS)</option>
          </select>

          <select
            className="adm-penalties-select"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="All">All Batches</option>
            {batches && batches.length > 0 ? (
              batches.map((b) => (
                <option key={b.id || b.code || b.name} value={b.name || b.code}>
                  {b.name || b.code}
                </option>
              ))
            ) : (
              <>
                <option value="Batch 01">Batch 01 (2020/2021)</option>
                <option value="Batch 02">Batch 02 (2021/2022)</option>
                <option value="Batch 03">Batch 03 (2022/2023)</option>
                <option value="Batch 04">Batch 04 (2023/2024)</option>
                <option value="Batch 05">Batch 05 (2024/2025)</option>
              </>
            )}
          </select>

          <select
            className="adm-penalties-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending Clearance">Pending Clearance</option>
            <option value="Active Probation">Active Probation</option>
            <option value="Cleared">Cleared</option>
          </select>
        </div>
      </div>

      {/* Penalties Table Card */}
      <div className="adm-table-card">
        <div className="adm-penalties-table-wrap">
          <table className="adm-penalties-table">
            <thead>
              <tr>
                <th style={{ minWidth: '150px' }}>Student Reg No</th>
                <th style={{ minWidth: '170px' }}>Candidate Name</th>
                <th style={{ minWidth: '140px' }}>Department &amp; Batch</th>
                <th style={{ minWidth: '160px' }}>Category</th>
                <th style={{ minWidth: '220px' }}>Incident &amp; Nature</th>
                <th style={{ minWidth: '150px' }}>Imposed Penalty / Fine</th>
                <th style={{ minWidth: '105px' }}>Date Imposed</th>
                <th style={{ minWidth: '140px' }}>Clearance Status</th>
                <th style={{ minWidth: '130px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPenalties.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="adm-penalties-empty">
                      <div className="adm-penalties-empty-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                      <h4 className="adm-penalties-empty-title">
                        {penalties.length === 0 ? 'No Disciplinary Records On File' : 'No Matching Disciplinary Records'}
                      </h4>
                      <p className="adm-penalties-empty-sub">
                        {penalties.length === 0
                          ? 'All undergraduate student cohorts maintain good standing with zero active disciplinary fines or board sanctions.'
                          : 'Try modifying your search query, department, batch, or clearance status filters.'}
                      </p>
                      {penalties.length > 0 && (
                        <button
                          type="button"
                          className="adm-btn-xs-secondary"
                          onClick={() => {
                            setSearchQuery('');
                            setDeptFilter('All');
                            setBatchFilter('All');
                            setStatusFilter('All');
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPenalties.map((pen) => {
                  const isBst = pen.department?.includes('Bio') || pen.department?.includes('BST') || pen.regNo?.includes('BST');
                  const deptLabel = isBst ? 'BST' : (pen.department?.includes('Interdisciplinary') || pen.regNo?.includes('DIS') ? 'DIS' : 'BICT');
                  const isCleared = pen.status === 'Cleared';
                  const isPending = pen.status === 'Pending Clearance';

                  return (
                    <tr key={pen.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{pen.regNo}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{pen.studentName}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                          {deptLabel}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {pen.batch || 'Batch 03 (2022/2023)'}
                        </div>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-neutral">{pen.category}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#334155', maxWidth: '280px', lineHeight: 1.4 }}>
                          {pen.description}
                        </div>
                        {pen.clearanceNotes && isCleared && (
                          <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            ✓ {pen.clearanceNotes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: isCleared ? '#475569' : '#dc2626' }}>
                          {pen.penaltyAmount}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{pen.imposedDate}</span>
                      </td>
                      <td>
                        <span
                          className={`adm-pen-badge ${
                            isCleared ? 'cleared' : isPending ? 'pending' : 'probation'
                          }`}
                        >
                          {isCleared ? '✓ Cleared' : pen.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          {!isCleared ? (
                            <button
                              type="button"
                              className="adm-pen-action-btn verify"
                              onClick={() => handleOpenClearModal(pen)}
                              title="Verify fine payment and issue clearance"
                            >
                              Verify &amp; Clear
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                              Cleared ✓
                            </span>
                          )}

                          <button
                            type="button"
                            className="adm-pen-action-btn danger-icon"
                            onClick={() => handleDelete(pen.id, pen.regNo)}
                            title="Remove disciplinary entry"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Disciplinary / Penalty Entry Modal */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Record Disciplinary Penalty / Fine</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="adm-modal-body">
                {/* Registration Number & Student Name with Live Autocomplete */}
                <div className="adm-form-grid">
                  <div className="adm-form-group" style={{ position: 'relative' }}>
                    <label className="adm-label">Student Reg No (e.g. SEU/IS/22/ICT/091) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Type Reg No or select student..."
                      value={newRegNo}
                      onChange={(e) => handleRegNoChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      required
                    />

                    {/* Autocomplete suggestion popover */}
                    {showSuggestions && studentSuggestions.length > 0 && (
                      <div className="adm-reg-suggest-list">
                        {studentSuggestions.map((s) => (
                          <div
                            key={s.id || s.regNo}
                            className="adm-reg-suggest-item"
                            onClick={() => handleSelectStudent(s)}
                          >
                            <span style={{ fontWeight: 600 }}>{s.regNo}</span>
                            <span style={{ color: '#64748b', fontSize: '0.74rem' }}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Student Name *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Student full name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Department & Batch Selections */}
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Department *</label>
                    <select
                      className="adm-input"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      required
                    >
                      <option value="Department of Information & Communication Technology">
                        Department of Information &amp; Communication Technology (BICT)
                      </option>
                      <option value="Department of Bio Systems Technology">
                        Department of Bio Systems Technology (BST)
                      </option>
                      <option value="Department of Interdisciplinary Studies">
                        Department of Interdisciplinary Studies (DIS)
                      </option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Intake Batch *</label>
                    <select
                      className="adm-input"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      required
                    >
                      {batches && batches.length > 0 ? (
                        batches.map((b) => (
                          <option key={b.id || b.code || b.name} value={b.name}>
                            {b.name} ({b.academicYear || b.currentSemester || 'Active'})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Batch 01 (2020/2021)">Batch 01 (2020/2021)</option>
                          <option value="Batch 02 (2021/2022)">Batch 02 (2021/2022)</option>
                          <option value="Batch 03 (2022/2023)">Batch 03 (2022/2023)</option>
                          <option value="Batch 04 (2023/2024)">Batch 04 (2023/2024)</option>
                          <option value="Batch 05 (2024/2025)">Batch 05 (2024/2025)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 9 Category titles & Fine Amount */}
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Category *</label>
                    <select
                      className="adm-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      {/* Original 4 Categories */}
                      <option value="Laboratory Equipment / Safety">Laboratory Equipment / Safety</option>
                      <option value="Library Overdue / Lost Book">Library Overdue / Lost Book</option>
                      <option value="Examination Irregularity">Examination Irregularity</option>
                      <option value="General Student Conduct">General Student Conduct</option>

                      {/* 5 Additional Academic & Disciplinary Categories */}
                      <option value="Hostel & Residential Regulations / Damage">
                        Hostel &amp; Residential Regulations / Damage
                      </option>
                      <option value="Campus Property Damage / Vandalism">
                        Campus Property Damage / Vandalism
                      </option>
                      <option value="Academic Dishonesty & Plagiarism">
                        Academic Dishonesty &amp; Plagiarism
                      </option>
                      <option value="Anti-Ragging, Bullying & Harassment">
                        Anti-Ragging, Bullying &amp; Harassment
                      </option>
                      <option value="IT & Cyber Infrastructure Misuse">
                        IT &amp; Cyber Infrastructure Misuse
                      </option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Penalty / Fine Amount</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Rs. 2,000 Fine"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Incident Description &amp; Authority Notes *</label>
                  <textarea
                    className="adm-textarea"
                    placeholder="Describe the nature of the violation or overdue item..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Automated Notification Callout */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <strong>Automated Cross-Portal Notification:</strong> Saving this entry will automatically dispatch an official disciplinary notice to the respective Department Head (HOD) and the registered student portal account.
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Save Disciplinary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Clear Modal */}
      {clearingPenalty && (
        <div className="adm-modal-backdrop" onClick={() => setClearingPenalty(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Issue Disciplinary Clearance</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setClearingPenalty(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmClearance}>
              <div className="adm-modal-body">
                {/* Penalty Summary Card */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{clearingPenalty.regNo}</span>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>{clearingPenalty.penaltyAmount}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.2rem' }}>
                    {clearingPenalty.studentName} &bull; {clearingPenalty.category}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {clearingPenalty.description}
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Bank PIV Slip / Fine Voucher Reference No (Optional)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. PIV/2026/09/8412 or Receipt #1042"
                    value={clearancePivRef}
                    onChange={(e) => setClearancePivRef(e.target.value)}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Clearance Verification Remarks *</label>
                  <textarea
                    className="adm-textarea"
                    placeholder="Enter official clearance notes..."
                    value={clearanceNotes}
                    onChange={(e) => setClearanceNotes(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.78rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>
                    Confirming this clearance will remove the hold on the student&apos;s account, restore good standing, and notify the student.
                  </span>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setClearingPenalty(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                  style={{ background: '#16a34a', borderColor: '#15803d' }}
                >
                  Confirm &amp; Issue Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
