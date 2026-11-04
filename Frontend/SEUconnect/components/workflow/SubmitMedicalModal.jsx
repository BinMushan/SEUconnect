import React, { useState } from 'react';
import './workflow.css';

export default function SubmitMedicalModal({ user, onClose, onSubmitSuccess }) {
  const [absenceDate, setAbsenceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [missedSessions, setMissedSessions] = useState('Full Day Lectures (08:30 AM - 04:30 PM)');
  const [selectedCourses, setSelectedCourses] = useState([
    'ICT 3112 - Web Application Development',
    'ICT 3122 - Computer Networks',
  ]);
  const [reason, setReason] = useState('High viral fever and physical exhaustion diagnosed by university clinic.');
  const [doctorName, setDoctorName] = useState('Dr. A.H.M. Nazeer (MBBS, DFM)');
  const [hospitalClinic, setHospitalClinic] = useState('University Health Centre, SEUSL Oluvil Campus');
  const [medicalCertNo, setMedicalCertNo] = useState(() => `SEU/HC/MED/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  const [fileName, setFileName] = useState('medical_slip_scan.pdf');
  const [notes, setNotes] = useState('Requesting excused attendance for 80% ESA eligibility calculation.');
  const [declared, setDeclared] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const courseOptions = [
    'ICT 3112 - Web Application Development',
    'ICT 3122 - Computer Networks',
    'ICT 3132 - Advanced Database Systems',
    'ICT 3142 - Enterprise Application Development',
    'ICT 3152 - Software Engineering & Quality Assurance',
  ];

  const handleToggleCourse = (course) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter(c => c !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!absenceDate) {
      setErrorMsg('Please specify the date of missed lecture(s).');
      return;
    }
    if (selectedCourses.length === 0) {
      setErrorMsg('Please select at least one affected course module.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please enter the reason for absence.');
      return;
    }
    if (!declared) {
      setErrorMsg('You must certify that the submitted medical details are authentic.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      type: 'medical_excuse',
      title: `Medical Excuse for 1-Day Missed Lecture (${selectedCourses[0].split(' - ')[0]})`,
      priority: 'Standard',
      student: {
        name: user?.name || 'M.N.M. Afnan',
        regNo: user?.regNo || '22ICT085',
        email: user?.email || 'student@gmail.com',
        department: user?.department || 'Department of Information and Communication Technology',
        faculty: user?.faculty || 'Faculty of Technology',
        programme: user?.programme || 'BICT (Hons)',
        semester: user?.semester || 'Semester 05',
      },
      details: {
        absenceDate,
        endDate: absenceDate,
        missedSessions,
        courseCodes: selectedCourses,
        reason,
        doctorName,
        hospitalClinic,
        medicalCertNo,
        issueDate: absenceDate,
        attachedDocumentName: fileName,
        notes,
      },
    };

    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit medical excuse');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div className="wf-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="wf-modal-header">
          <div className="wf-modal-header-left">
            <span className="wf-tracking-badge">NEW APPLICATION</span>
            <div>
              <h2 className="wf-modal-title">Apply for Lecture Medical Excuse</h2>
              <p className="wf-modal-subtitle">
                Official Multi-Stage Academic Absence Verification Form (Faculty of Technology)
              </p>
            </div>
          </div>
          <button className="wf-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wf-modal-body">
          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Student Info preview */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <div>
              <strong>Applicant:</strong> {user?.name || 'M.N.M. Afnan'} ({user?.regNo || '22ICT085'})
            </div>
            <div>
              <strong>Department:</strong> {user?.department || 'ICT'}
            </div>
            <div>
              <strong>Semester:</strong> {user?.semester || 'Semester 05'}
            </div>
          </div>

          {/* Absence specifics */}
          <div className="wf-form-grid-2">
            <div className="wf-form-group">
              <label className="wf-form-label">
                Absence Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="wf-form-input"
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                required
              />
            </div>

            <div className="wf-form-group">
              <label className="wf-form-label">Missed Lecture Session / Duration</label>
              <select
                className="wf-form-select"
                value={missedSessions}
                onChange={(e) => setMissedSessions(e.target.value)}
              >
                <option value="Full Day Lectures (08:30 AM - 04:30 PM)">Full Day Lectures (08:30 AM - 04:30 PM)</option>
                <option value="Morning Lectures (08:30 AM - 12:30 PM)">Morning Lectures (08:30 AM - 12:30 PM)</option>
                <option value="Afternoon Lectures (01:30 PM - 04:30 PM)">Afternoon Lectures (01:30 PM - 04:30 PM)</option>
                <option value="Continuous Assessment / Practical Session">Continuous Assessment / Practical Session</option>
              </select>
            </div>
          </div>

          {/* Modules affected */}
          <div className="wf-form-group">
            <label className="wf-form-label">
              Affected Course Modules <span className="required">* (Click to select/unselect)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {courseOptions.map((course) => {
                const isSelected = selectedCourses.includes(course);
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => handleToggleCourse(course)}
                    style={{
                      background: isSelected ? '#0ea5e9' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {course}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medical specifics */}
          <div className="wf-form-grid-2">
            <div className="wf-form-group">
              <label className="wf-form-label">Examining Medical Officer / Doctor Name</label>
              <input
                type="text"
                className="wf-form-input"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Name (MBBS / Specialist)"
              />
            </div>

            <div className="wf-form-group">
              <label className="wf-form-label">Hospital / Clinic / Health Centre</label>
              <input
                type="text"
                className="wf-form-input"
                value={hospitalClinic}
                onChange={(e) => setHospitalClinic(e.target.value)}
                placeholder="University Health Centre / General Hospital"
              />
            </div>
          </div>

          <div className="wf-form-grid-2">
            <div className="wf-form-group">
              <label className="wf-form-label">Medical Certificate / Slip No</label>
              <input
                type="text"
                className="wf-form-input"
                value={medicalCertNo}
                onChange={(e) => setMedicalCertNo(e.target.value)}
              />
            </div>

            <div className="wf-form-group">
              <label className="wf-form-label">Attached Supporting Document File</label>
              <input
                type="text"
                className="wf-form-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. medical_slip.pdf"
              />
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="wf-form-group">
            <label className="wf-form-label">
              Medical Reason / Symptoms <span className="required">*</span>
            </label>
            <textarea
              className="wf-form-textarea"
              rows="2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the clinical diagnosis or reason for absence..."
              required
            />
          </div>

          <div className="wf-form-group">
            <label className="wf-form-label">Additional Remarks / Justification</label>
            <textarea
              className="wf-form-textarea"
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details regarding attendance compensation or course coordinator note..."
            />
          </div>

          {/* Declaration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="decl"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="decl" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
              I hereby declare that I was genuinely absent from the above lectures due to verified medical reasons and have submitted authentic documentation in accordance with SEUSL examination regulations.
            </label>
          </div>

          <div className="wf-modal-footer" style={{ padding: '0.5rem 0 0', background: 'transparent' }}>
            <button type="button" className="wf-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="wf-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Routing to Lecturer...' : 'Submit Application & Start Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
