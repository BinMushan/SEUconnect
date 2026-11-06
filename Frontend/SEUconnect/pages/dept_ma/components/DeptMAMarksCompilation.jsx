import React, { useState, useEffect, useMemo } from 'react';
import { resultsPipelineService, PIPELINE_STAGES, PIPELINE_LABELS, DEFAULT_COHORT } from '../../../src/services/resultsPipelineService.js';

export default function DeptMAMarksCompilation({ onShowToast }) {
  const [selectedSemester, setSelectedSemester] = useState('Year 2 Semester 2');
  const [pipeline, setPipeline] = useState(() => resultsPipelineService.getPipelineStatus(selectedSemester));
  const [activeTab, setActiveTab] = useState('MODULE_STATUS'); // 'MODULE_STATUS' | 'CONSOLIDATED_SHEET'
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPipeline(resultsPipelineService.getPipelineStatus(selectedSemester));
    };
    window.addEventListener('seu_pipeline_update', handleUpdate);
    return () => window.removeEventListener('seu_pipeline_update', handleUpdate);
  }, [selectedSemester]);

  // Semester Modules Roster
  const SEMESTER_MODULES = [
    { code: 'SWT 22012', title: 'Internet Application Development', lecturer: 'Mr. J Ahamed Adhil', credits: 2, status: 'Submitted' },
    { code: 'SWT 22022', title: 'Practical for Internet Application Development', lecturer: 'Dr. M. Kirushanth', credits: 2, status: 'Submitted' },
    { code: 'CIS 22012', title: 'Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', credits: 2, status: 'Submitted' },
    { code: 'CIS 22022', title: 'Information Assurance and Forensics', lecturer: 'Mr. MJ Ahamed Sabani', credits: 2, status: 'Submitted' },
    { code: 'CIS 22032', title: 'E-commerce Strategies and Architecture', lecturer: 'Ms. AF Masroofa', credits: 2, status: 'Submitted' },
    { code: 'UCT 22011', title: 'Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', credits: 1, status: 'Submitted' },
    { code: 'CMS 22012', title: 'Leadership & Communication Skills', lecturer: 'Ms. ARF Shafana', credits: 2, status: 'Submitted' },
    { code: 'CIS 22042', title: 'Practical for Distributed and Cloud Computing', lecturer: 'Mr. Janotheepan (VL)', credits: 2, status: 'Submitted' },
    { code: 'UCT 22022', title: 'Practical for Microcontroller System Programming', lecturer: 'Mr. SL Abdul Haleem', credits: 2, status: 'Submitted' }
  ];

  const handleForwardToHOD = () => {
    resultsPipelineService.dmaForwardToHOD(selectedSemester, 'Fathima (Dept MA)');
    setPipeline(resultsPipelineService.getPipelineStatus(selectedSemester));
    if (onShowToast) {
      onShowToast(`All module marks for ${selectedSemester} compiled and officially submitted to Head of Department (HOD) for academic moderation.`, 'success');
    }
  };

  const isForwarded = [
    PIPELINE_STAGES.SUBMITTED_TO_HOD,
    PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER,
    PIPELINE_STAGES.FORWARDED_TO_DEAN,
    PIPELINE_STAGES.DEAN_APPROVED,
    PIPELINE_STAGES.PUBLISHED
  ].includes(pipeline.stage);

  return (
    <div className="dept-ma-view-container">
      {/* 1. Page Header */}
      <div className="dept-ma-view-header-banner">
        <div className="dept-ma-header-banner-left">
          <span className="dept-ma-banner-tag">DEPARTMENT ACADEMIC QA & MARKS COMPILATION</span>
          <h1 className="dept-ma-view-title">Lecturer Marks Collection & Cohort Compilation</h1>
          <p className="dept-ma-view-subtitle">
            Collect Continuous Assessment (CA) & End Semester (ESA) marks from all assigned course lecturers, compile batch mark sheets, and submit to HOD.
          </p>
        </div>
        <div className="dept-ma-banner-actions">
          <button
            type="button"
            className="dept-ma-banner-btn primary"
            onClick={handleForwardToHOD}
            disabled={isForwarded}
            title={isForwarded ? 'Batch marks have already been forwarded to HOD' : 'Compile and forward complete batch marks to HOD'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isForwarded ? 'Forwarded to HOD' : 'Forward Compiled Batch to HOD'}
          </button>
        </div>
      </div>

      {/* 2. Official University Workflow Progress Bar */}
      <div className="dept-ma-card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #0f2b5c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>
              Results Moderation Stage
            </span>
            <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#0f2b5c', fontWeight: '800' }}>
              {PIPELINE_LABELS[pipeline.stage] || pipeline.stage}
            </h4>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: '700',
            background: pipeline.stage === PIPELINE_STAGES.PUBLISHED ? '#dcfce7' : '#eff6ff',
            color: pipeline.stage === PIPELINE_STAGES.PUBLISHED ? '#166534' : '#1e40af',
            border: `1px solid ${pipeline.stage === PIPELINE_STAGES.PUBLISHED ? '#86efac' : '#bfdbfe'}`
          }}>
            Cohort: {selectedSemester}
          </span>
        </div>

        {/* 6-Step Visual Workflow Stepper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '0.75rem' }}>
          {[
            { key: PIPELINE_STAGES.LECTURER_DRAFT, label: '1. Lecturer Marks' },
            { key: PIPELINE_STAGES.SUBMITTED_TO_DMA, label: '2. DMA Compilation' },
            { key: PIPELINE_STAGES.SUBMITTED_TO_HOD, label: '3. HOD Moderation' },
            { key: PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER, label: '4. Exam Officer' },
            { key: PIPELINE_STAGES.FORWARDED_TO_DEAN, label: '5. Dean Clearance' },
            { key: PIPELINE_STAGES.PUBLISHED, label: '6. Published to Students' }
          ].map((st, idx) => {
            const stagesOrder = [
              PIPELINE_STAGES.LECTURER_DRAFT,
              PIPELINE_STAGES.SUBMITTED_TO_DMA,
              PIPELINE_STAGES.SUBMITTED_TO_HOD,
              PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER,
              PIPELINE_STAGES.FORWARDED_TO_DEAN,
              PIPELINE_STAGES.DEAN_APPROVED,
              PIPELINE_STAGES.PUBLISHED
            ];
            const currentIdx = stagesOrder.indexOf(pipeline.stage);
            const thisIdx = stagesOrder.indexOf(st.key);
            const isDone = currentIdx >= thisIdx;
            const isCurrent = currentIdx === thisIdx;

            return (
              <div
                key={st.key}
                style={{
                  background: isDone ? '#f0fdf4' : isCurrent ? '#fefce8' : '#f8fafc',
                  border: `1px solid ${isDone ? '#bbf7d0' : isCurrent ? '#fde047' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '6px 8px',
                  fontSize: '0.74rem',
                  fontWeight: isCurrent ? '800' : '600',
                  color: isDone ? '#166534' : isCurrent ? '#854d0e' : '#64748b',
                  textAlign: 'center'
                }}
              >
                {isDone ? '✓ ' : ''}{st.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-tabs Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('MODULE_STATUS')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: activeTab === 'MODULE_STATUS' ? '#0f2b5c' : '#cbd5e1',
            background: activeTab === 'MODULE_STATUS' ? '#0f2b5c' : '#ffffff',
            color: activeTab === 'MODULE_STATUS' ? '#ffffff' : '#475569',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          Assigned Modules & Lecturer Status
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CONSOLIDATED_SHEET')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: activeTab === 'CONSOLIDATED_SHEET' ? '#0f2b5c' : '#cbd5e1',
            background: activeTab === 'CONSOLIDATED_SHEET' ? '#0f2b5c' : '#ffffff',
            color: activeTab === 'CONSOLIDATED_SHEET' ? '#ffffff' : '#475569',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          Consolidated Batch Marks Ledger ({DEFAULT_COHORT.length} Students)
        </button>
      </div>

      {/* TAB 1: Assigned Modules & Lecturer Submissions */}
      {activeTab === 'MODULE_STATUS' && (
        <div className="dept-ma-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f2b5c' }}>
              Subject Modules in {selectedSemester}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '700' }}>
              9 of 9 Lecturer Marks Received
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="dept-ma-table" style={{ width: '100%', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Module Title</th>
                  <th>Credits</th>
                  <th>Assigned Course Lecturer</th>
                  <th>Submission Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {SEMESTER_MODULES.map((m) => (
                  <tr key={m.code}>
                    <td><strong>{m.code}</strong></td>
                    <td>{m.title}</td>
                    <td>{m.credits}</td>
                    <td>{m.lecturer}</td>
                    <td>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        ✓ Submitted to DMA
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedModule(m)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Marks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Consolidated Batch Marks Ledger */}
      {activeTab === 'CONSOLIDATED_SHEET' && (
        <div className="dept-ma-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f2b5c' }}>
                Consolidated Batch Marks & SGPA Ledger
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Compiled across all 9 modules for Department of ICT cohort.
              </p>
            </div>
            <button
              type="button"
              className="dept-ma-banner-btn primary"
              onClick={handleForwardToHOD}
              disabled={isForwarded}
            >
              {isForwarded ? '✓ Batch Forwarded to HOD' : 'Submit to HOD'}
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="dept-ma-table" style={{ width: '100%', minWidth: '850px' }}>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Degree & Batch</th>
                  <th>Modules Cleared</th>
                  <th>Calculated SGPA</th>
                  <th>Standing Status</th>
                  <th>QA Audit</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_COHORT.map((st, i) => {
                  const sgpa = (3.60 + (i % 4) * 0.1).toFixed(2);
                  return (
                    <tr key={st.regNo}>
                      <td><strong>{st.regNo}</strong></td>
                      <td>{st.name}</td>
                      <td>{st.department} ({st.batch})</td>
                      <td><span style={{ color: '#16a34a', fontWeight: '700' }}>9 / 9 Passed</span></td>
                      <td><strong style={{ color: '#0f2b5c' }}>{sgpa}</strong></td>
                      <td>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {Number(sgpa) >= 3.7 ? 'First Class' : 'Second Upper'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#0284c7', fontSize: '0.78rem', fontWeight: '600' }}>
                          ✓ Attendance &gt; 80%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module Marks Modal */}
      {selectedModule && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 23, 50, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>
                  Lecturer Marks Sheet
                </span>
                <h3 style={{ margin: '2px 0 0', color: '#0f2b5c' }}>
                  {selectedModule.code}: {selectedModule.title}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Examiner: {selectedModule.lecturer} · Weight: 40% CA, 60% ESA
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <table className="dept-ma-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>CA (40)</th>
                  <th>ESA (60)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_COHORT.map((st, idx) => {
                  const ca = 32 + (idx % 6);
                  const esa = 44 + (idx % 12);
                  const total = ca + esa;
                  const grade = total >= 80 ? 'A' : total >= 75 ? 'A-' : 'B+';
                  return (
                    <tr key={st.regNo}>
                      <td><strong>{st.regNo}</strong></td>
                      <td>{st.name}</td>
                      <td>{ca}</td>
                      <td>{esa}</td>
                      <td><strong>{total}</strong></td>
                      <td><span style={{ fontWeight: '700', color: '#0f2b5c' }}>{grade}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                style={{
                  background: '#0f2b5c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close Marks Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
