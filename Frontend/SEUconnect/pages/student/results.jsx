import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../src/services/api';
import './results.css';

const pct = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(1));

// Flatten the published transcript (GET /api/v1/transcripts/me) into one row per course.
function transcriptToRows(transcript) {
  const rows = [];
  (transcript?.semesters || []).forEach((sem) => {
    const number = sem.semester?.number ?? 0;
    sem.courses.forEach((c) => {
      const comps = c.componentMarks || [];
      const weighted = (field) => {
        const parts = comps.filter((m) => m[field] !== null && m[field] !== undefined);
        return parts.length ? parts.reduce((sum, m) => sum + (m[field] * (m.weightInCourse ?? 100)) / 100, 0) / (parts.reduce((sum, m) => sum + (m.weightInCourse ?? 100), 0) / 100) : null;
      };
      rows.push({
        id: `${c.code}-${number}-${c.attempt ?? 1}`,
        semester: number,
        semLabel: `Sem ${number}`,
        code: c.code,
        title: c.title,
        credits: c.credits,
        caMark: pct(weighted('caPercent')),
        esaMark: pct(weighted('esaPercent')),
        finalMark: c.finalMark ?? 0,
        grade: c.grade || 'Pending',
        gradePoint: c.gradePoint ?? 0,
        qualityPoints: (c.gradePoint ?? 0) * c.credits,
        status: c.passed ? 'Passed' : 'Failed',
      });
    });
  });
  return rows;
}

export default function StudentResults({ user }) {
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedRow, setSelectedRow] = useState(null);

  const [transcript, setTranscript] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let live = true;
    api
      .getMyTranscript()
      .then((t) => live && setTranscript(t))
      .catch((e) => live && setLoadError(e.message || 'Could not load results.'));
    return () => {
      live = false;
    };
  }, []);

  const allRows = useMemo(() => transcriptToRows(transcript), [transcript]);
  const semesterNumbers = useMemo(() => [...new Set(allRows.map((r) => r.semester))].sort((x, y) => x - y), [allRows]);
  const student = transcript?.student;
  const candidateName = student?.fullName || user?.name || '';
  const regNo = student?.registrationNo || user?.regNo || '';
  const indexNo = student?.studentId || user?.indexNo || '';
  const programme = student?.programmeRef?.name || student?.programmeRef?.code || user?.programme || '';

  const filteredModules = useMemo(() => (selectedSemester === 'All' ? allRows : allRows.filter((m) => m.semester.toString() === selectedSemester)), [allRows, selectedSemester]);

  const cumulativeGpa = transcript?.cumulative?.gpa ?? null;
  const semesterGpa = selectedSemester === 'All' ? cumulativeGpa : (transcript?.semesters || []).find((x) => String(x.semester?.number) === selectedSemester)?.sgpa ?? null;
  const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(2));

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadgeClass = (grade) => {
    if (grade.startsWith('A')) return 'grade-badge grade-a';
    if (grade.startsWith('B')) return 'grade-badge grade-b';
    if (grade.startsWith('C')) return 'grade-badge grade-c';
    return 'grade-badge grade-pending';
  };

  return (
    <div className="results-page-container">
      {/* 1. Header with Print Button */}
      <div className="page-header results-header-row">
        <div>
          <h1>Examination Results & Transcripts</h1>
          <p>Verified semester-wise course grades, continuous assessment breakdown, and grade points.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm btn-print-results"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Results Sheet
          </button>
        </div>
      </div>

      {/* 2. Filter & GPA Card */}
      <section className="seu-card results-filter-card">
        <div className="results-filter-left">
          <div className="results-filter-label-group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="results-filter-label">Filter by Semester:</span>
          </div>
          <select
            className="results-semester-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="All">All Semesters</option>
            {semesterNumbers.map((n) => (
              <option key={n} value={String(n)}>
                Semester {n}
              </option>
            ))}
          </select>
        </div>

        <div className="results-gpa-metrics-group">
          <div className="results-gpa-item">
            <span className="results-gpa-label">SEMESTER GPA: </span>
            <strong className="results-gpa-value val-sgpa">{fmt(semesterGpa)}</strong>
          </div>
          <div className="results-gpa-item">
            <span className="results-gpa-label">CUMULATIVE CGPA: </span>
            <strong className="results-gpa-value val-cgpa">{fmt(cumulativeGpa)}</strong>
          </div>
        </div>
      </section>

      {/* 3. Published Results Table Card */}
      <section className="seu-card results-table-card">
        <div className="seu-card-header">
          <h2 className="seu-card-title">
            Published Examination Results ({filteredModules.length} Modules)
          </h2>
        </div>

        <div className="table-responsive">
          <table className="seu-table results-table">
            <thead>
              <tr>
                <th>SEM</th>
                <th>COURSE CODE</th>
                <th>COURSE TITLE</th>
                <th>CREDITS</th>
                <th>CA MARK</th>
                <th>ESA MARK</th>
                <th>FINAL MARK</th>
                <th>GRADE</th>
                <th>GRADE POINT</th>
                <th>QUALITY POINTS</th>
              </tr>
            </thead>
            <tbody>
              {!filteredModules.length && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    {loadError || (transcript ? 'No published results yet. Results appear here once the examination branch publishes them.' : 'Loading results...')}
                  </td>
                </tr>
              )}
              {filteredModules.map((item) => (
                <tr
                  key={item.id}
                  className="results-row"
                  onClick={() => setSelectedRow(item)}
                  title="Click to view full course assessment details"
                >
                  <td className="res-cell-sem">{item.semLabel}</td>
                  <td className="res-cell-code">
                    <strong>{item.code}</strong>
                  </td>
                  <td className="res-cell-title">{item.title}</td>
                  <td className="res-cell-credits">{item.credits}</td>
                  <td className="res-cell-ca">{item.caMark}</td>
                  <td className="res-cell-esa">{item.esaMark}</td>
                  <td className="res-cell-final">
                    <strong>{item.finalMark}</strong>
                  </td>
                  <td className="res-cell-grade">
                    <span className={getGradeBadgeClass(item.grade)}>
                      {item.grade}
                    </span>
                  </td>
                  <td className="res-cell-gpoint">{item.gradePoint.toFixed(2)}</td>
                  <td className="res-cell-qpoints">{item.qualityPoints.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          PRINT-ONLY OFFICIAL RESULTS SHEET / TRANSCRIPT
          ==================================================================== */}
      <div className="printable-results-slip" aria-hidden="true">
        <div className="print-results-header">
          <div className="print-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
          <div className="print-uni-faculty">FACULTY OF TECHNOLOGY · EXAMINATION DIVISION</div>
          <div className="print-transcript-badge">OFFICIAL STATEMENT OF RESULTS / ACADEMIC TRANSCRIPT</div>
        </div>

        <div className="print-results-meta">
          <div><strong>Candidate Name:</strong> {candidateName}</div>
          <div><strong>Registration No:</strong> {regNo}</div>
          <div><strong>Index No:</strong> {indexNo}</div>
          <div><strong>Degree Programme:</strong> {programme}</div>
          <div><strong>Filter:</strong> {selectedSemester === 'All' ? 'All Semesters' : `Semester ${selectedSemester}`}</div>
          <div><strong>Cumulative CGPA:</strong> {fmt(cumulativeGpa)}</div>
        </div>

        <table className="print-results-table">
          <thead>
            <tr>
              <th>SEM</th>
              <th>COURSE CODE</th>
              <th>COURSE TITLE</th>
              <th>CR</th>
              <th>CA</th>
              <th>ESA</th>
              <th>FINAL</th>
              <th>GRADE</th>
              <th>GP</th>
              <th>QP</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.map((item) => (
              <tr key={item.id}>
                <td>{item.semLabel}</td>
                <td><strong>{item.code}</strong></td>
                <td>{item.title}</td>
                <td>{item.credits}</td>
                <td>{item.caMark}</td>
                <td>{item.esaMark}</td>
                <td>{item.finalMark}</td>
                <td><strong>{item.grade}</strong></td>
                <td>{item.gradePoint.toFixed(2)}</td>
                <td>{item.qualityPoints.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-results-footer">
          <div><strong>Semester GPA:</strong> {fmt(semesterGpa)}</div>
          <div><strong>Cumulative CGPA:</strong> {fmt(cumulativeGpa)}</div>
          <div><strong>Academic Standing:</strong> Second Class (Upper Division)</div>
        </div>

        <div className="print-signatures-row">
          <div className="print-signature-box">
            <div className="print-sign-line"></div>
            <div>Prepared by: Examination Division</div>
          </div>
          <div className="print-signature-box">
            <div className="print-sign-line"></div>
            <div>Senior Assistant Registrar / Examination Division</div>
            <div>South Eastern University of Sri Lanka</div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL: COURSE GRADE BREAKDOWN
          ==================================================================== */}
      {selectedRow && (
        <div className="exam-modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <div className="exam-modal-title">
                {selectedRow.code} — {selectedRow.title}
              </div>
              <button
                type="button"
                className="exam-modal-close-btn"
                onClick={() => setSelectedRow(null)}
              >
                &times;
              </button>
            </div>

            <div className="exam-modal-body">
              <div className="results-modal-score-card">
                <div className="results-modal-score-item">
                  <span className="results-modal-score-label">Continuous Assessment (CA)</span>
                  <strong className="results-modal-score-val">{selectedRow.caMark} %</strong>
                </div>
                <div className="results-modal-score-item">
                  <span className="results-modal-score-label">End Semester Exam (ESA)</span>
                  <strong className="results-modal-score-val">{selectedRow.esaMark} %</strong>
                </div>
                <div className="results-modal-score-item highlight-score">
                  <span className="results-modal-score-label">Final Weighted Mark</span>
                  <strong className="results-modal-score-val">{selectedRow.finalMark} / 100</strong>
                </div>
              </div>

              <div className="exam-form-group-grid">
                <div>
                  <label className="exam-form-label">Semester</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={selectedRow.semLabel}
                    readOnly
                  />
                </div>
                <div>
                  <label className="exam-form-label">Course Credits</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={`${selectedRow.credits} Credits`}
                    readOnly
                  />
                </div>
                <div>
                  <label className="exam-form-label">Assigned Grade</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={selectedRow.grade}
                    readOnly
                  />
                </div>
                <div>
                  <label className="exam-form-label">Grade Point (GP)</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={selectedRow.gradePoint.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>

              <div className="exam-modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
