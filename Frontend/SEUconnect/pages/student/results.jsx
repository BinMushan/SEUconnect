import React, { useState, useMemo } from 'react';
import './results.css';

// Master Academic Results matching the SEUConnect live production portal
const ALL_RESULTS_DATA = [
  // Semester 1
  {
    id: 'res-1',
    semester: 1,
    semLabel: 'Sem 1',
    code: 'ICT11012',
    title: 'Foundation of Information Technology',
    credits: 2,
    caMark: 36,
    esaMark: 48,
    finalMark: 84,
    grade: 'A',
    gradePoint: 4.00,
    qualityPoints: 8.00,
    status: 'Passed'
  },
  {
    id: 'res-2',
    semester: 1,
    semLabel: 'Sem 1',
    code: 'ICT11023',
    title: 'Structured Programming Fundamentals',
    credits: 3,
    caMark: 34,
    esaMark: 42,
    finalMark: 76,
    grade: 'A-',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'Passed'
  },

  // Semester 2
  {
    id: 'res-3',
    semester: 2,
    semLabel: 'Sem 2',
    code: 'ICT12013',
    title: 'Object Oriented Programming',
    credits: 3,
    caMark: 35,
    esaMark: 45,
    finalMark: 80,
    grade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    status: 'Passed'
  },
  {
    id: 'res-4',
    semester: 2,
    semLabel: 'Sem 2',
    code: 'ICT12023',
    title: 'Mathematics for Computing',
    credits: 3,
    caMark: 30,
    esaMark: 41,
    finalMark: 71,
    grade: 'B+',
    gradePoint: 3.30,
    qualityPoints: 9.90,
    status: 'Passed'
  },

  // Semester 3
  {
    id: 'res-5',
    semester: 3,
    semLabel: 'Sem 3',
    code: 'ICT21013',
    title: 'Data Structures and Algorithms',
    credits: 3,
    caMark: 36,
    esaMark: 46,
    finalMark: 82,
    grade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    status: 'Passed'
  },
  {
    id: 'res-6',
    semester: 3,
    semLabel: 'Sem 3',
    code: 'ICT21023',
    title: 'Database Management Systems',
    credits: 3,
    caMark: 33,
    esaMark: 43,
    finalMark: 76,
    grade: 'A-',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'Passed'
  },
  {
    id: 'res-7',
    semester: 3,
    semLabel: 'Sem 3',
    code: 'ICT21032',
    title: 'Computer Organization & Architecture',
    credits: 2,
    caMark: 28,
    esaMark: 39,
    finalMark: 67,
    grade: 'B',
    gradePoint: 3.00,
    qualityPoints: 6.00,
    status: 'Passed'
  },

  // Semester 4
  {
    id: 'res-8',
    semester: 4,
    semLabel: 'Sem 4',
    code: 'ICT22013',
    title: 'Software Engineering & Design',
    credits: 3,
    caMark: 34,
    esaMark: 44,
    finalMark: 78,
    grade: 'A-',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'Passed'
  },
  {
    id: 'res-9',
    semester: 4,
    semLabel: 'Sem 4',
    code: 'ICT22023',
    title: 'Operating Systems & System Admin',
    credits: 3,
    caMark: 32,
    esaMark: 40,
    finalMark: 72,
    grade: 'B+',
    gradePoint: 3.30,
    qualityPoints: 9.90,
    status: 'Passed'
  },

  // Semester 5 (Current)
  {
    id: 'res-10',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT22011',
    title: 'Web Application Development',
    credits: 3,
    caMark: 36,
    esaMark: '—',
    finalMark: 36,
    grade: 'Pending',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'In Progress'
  },
  {
    id: 'res-11',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT22043',
    title: 'Mobile Application Development',
    credits: 3,
    caMark: 34,
    esaMark: '—',
    finalMark: 34,
    grade: 'Pending',
    gradePoint: 3.30,
    qualityPoints: 9.90,
    status: 'In Progress'
  },
  {
    id: 'res-12',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT31013',
    title: 'Computer Networks & Security',
    credits: 3,
    caMark: 35,
    esaMark: '—',
    finalMark: 35,
    grade: 'Pending',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'In Progress'
  },
  {
    id: 'res-13',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT31023',
    title: 'Enterprise Architecture & Cloud Systems',
    credits: 3,
    caMark: 32,
    esaMark: '—',
    finalMark: 32,
    grade: 'Pending',
    gradePoint: 3.00,
    qualityPoints: 9.00,
    status: 'In Progress'
  },
  {
    id: 'res-14',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT31032',
    title: 'Advanced Database Systems',
    credits: 3,
    caMark: 37,
    esaMark: '—',
    finalMark: 37,
    grade: 'Pending',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    status: 'In Progress'
  },
  {
    id: 'res-15',
    semester: 5,
    semLabel: 'Sem 5',
    code: 'ICT31043',
    title: 'Human Computer Interaction (HCI)',
    credits: 3,
    caMark: 35,
    esaMark: '—',
    finalMark: 35,
    grade: 'Pending',
    gradePoint: 3.70,
    qualityPoints: 11.10,
    status: 'In Progress'
  }
];

// Precalculated GPAs matching the official SEUConnect records
const SEMESTER_GPA_MAP = {
  All: 3.58,
  '1': 3.82,
  '2': 3.65,
  '3': 3.64,
  '4': 3.50,
  '5': 3.50
};

const CUMULATIVE_CGPA = 3.58;

export default function StudentResults({ user }) {
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedRow, setSelectedRow] = useState(null);

  const candidateName = user?.name || 'M.N.M. Afnan';
  const regNo = user?.regNo || '22ICT085';
  const indexNo = user?.indexNo || 'ICT22085';
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';

  // Filter modules based on selected semester
  const filteredModules = useMemo(() => {
    if (selectedSemester === 'All') {
      return ALL_RESULTS_DATA;
    }
    return ALL_RESULTS_DATA.filter((m) => m.semester.toString() === selectedSemester);
  }, [selectedSemester]);

  const currentSgpa = SEMESTER_GPA_MAP[selectedSemester] || 3.58;

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
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5 (Current)</option>
          </select>
        </div>

        <div className="results-gpa-metrics-group">
          <div className="results-gpa-item">
            <span className="results-gpa-label">SEMESTER GPA: </span>
            <strong className="results-gpa-value val-sgpa">{currentSgpa.toFixed(2)}</strong>
          </div>
          <div className="results-gpa-item">
            <span className="results-gpa-label">CUMULATIVE CGPA: </span>
            <strong className="results-gpa-value val-cgpa">{CUMULATIVE_CGPA.toFixed(2)}</strong>
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
          <div><strong>Cumulative CGPA:</strong> {CUMULATIVE_CGPA.toFixed(2)}</div>
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
          <div><strong>Semester GPA:</strong> {currentSgpa.toFixed(2)}</div>
          <div><strong>Cumulative CGPA:</strong> {CUMULATIVE_CGPA.toFixed(2)}</div>
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
                  <strong className="results-modal-score-val">{selectedRow.caMark} / 40</strong>
                </div>
                <div className="results-modal-score-item">
                  <span className="results-modal-score-label">End Semester Exam (ESA)</span>
                  <strong className="results-modal-score-val">{selectedRow.esaMark} / 60</strong>
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
