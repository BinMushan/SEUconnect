import React, { useState, useMemo } from 'react';
import './welfare_scholarships.css';

export const WELFARE_SCHEMES = [
  {
    id: 'welf_hostel',
    category: 'Accommodation',
    categoryTheme: 'accommodation',
    title: 'Faculty Technology Hostel Accommodation',
    description: 'On-campus residential hostel facilities for Technology Faculty students with Wi-Fi and study halls.',
    eligibility: 'Registered full-time undergraduate students meeting residence distance requirements (> 40km).',
    benefits: 'Secure residential accommodation within campus perimeter.',
    contactOffice: 'Hostel Sub-warden Office, Faculty of Technology',
    contactEmail: '',
    applicationStatus: 'Open',
    formCode: 'SEU-WELF-HSTL'
  },
  {
    id: 'welf_counselling',
    category: 'Counselling',
    categoryTheme: 'counselling',
    title: 'Student Counselling & Mental Health Support',
    description: 'Confidential psychological, academic stress, and mental well-being guidance by trained faculty counsellors.',
    eligibility: 'Free and accessible to all registered students without appointment restrictions.',
    benefits: 'Confidential 1-on-1 counseling sessions and academic stress management.',
    contactOffice: 'Counselling Center, Student Health Complex',
    contactEmail: '',
    applicationStatus: 'Available Anytime',
    formCode: 'SEU-CNSL-APPT'
  },
  {
    id: 'welf_bursary',
    category: 'Financial Support',
    categoryTheme: 'financial',
    title: 'University Bursary Financial Assistance',
    description: 'University financial grant scheme for undergraduates who do not receive Mahapola scholarships.',
    eligibility: 'Parental annual income below UGC threshold and absence of disciplinary penalties.',
    benefits: 'Monthly financial assistance throughout the academic session.',
    contactOffice: 'Student Welfare Division, Administrative Complex',
    contactEmail: '',
    applicationStatus: 'Annual Renewal',
    formCode: 'SEU-BURS-APP'
  },
  {
    id: 'welf_mahapola',
    category: 'Scholarships',
    categoryTheme: 'scholarships',
    title: 'Mahapola Higher Education Scholarship',
    description: 'National merit and need-based scholarship disbursed monthly by the Mahapola Trust Fund.',
    eligibility: 'Enrolled internal undergraduates selected based on Z-score merit and parental income criteria.',
    benefits: 'Monthly stipend of Rs. 5,000 / Rs. 5,200 deposited into student bank accounts.',
    contactOffice: 'Student Welfare & Accommodation Division, SEUSL',
    contactEmail: 'welfare@seu.ac.lk',
    applicationStatus: 'Active Merit',
    formCode: 'SEU-MAHA-SCHOL'
  },
  {
    id: 'welf_emergency',
    category: 'Student Support',
    categoryTheme: 'support',
    title: 'Student Emergency Medical & Relief Fund',
    description: 'Immediate micro-grant and emergency medical assistance for students facing unexpected critical hardship.',
    eligibility: 'Active full-time enrolled students upon recommendation by Dean / Head of Department.',
    benefits: 'Up to Rs. 25,000 emergency medical cover and crisis financial relief.',
    contactOffice: 'Dean\'s Secretariat, Faculty of Technology',
    contactEmail: 'deantech@seu.ac.lk',
    applicationStatus: 'Emergency Request',
    formCode: 'SEU-EMERG-RELIEF'
  }
];

export default function StudentWelfare({ user }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appliedSchemes, setAppliedSchemes] = useState({});
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  const filterTabs = [
    'All',
    'Scholarships',
    'Financial Support',
    'Accommodation',
    'Counselling',
    'Student Support'
  ];

  const filteredSchemes = useMemo(() => {
    return WELFARE_SCHEMES.filter(item => {
      // Filter tab
      if (activeFilter !== 'All' && item.category !== activeFilter) {
        return false;
      }
      // Search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.eligibility.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, searchQuery]);

  const handleApplyClick = (scheme) => {
    setSelectedScheme(scheme);
    setShowApplyModal(true);
  };

  const handleConfirmApply = (e) => {
    e.preventDefault();
    if (!selectedScheme) return;
    setAppliedSchemes(prev => ({
      ...prev,
      [selectedScheme.id]: {
        appliedDate: new Date().toLocaleDateString(),
        status: 'Under Review'
      }
    }));
    setShowApplyModal(false);
    setApplySuccessMsg(`Application for ${selectedScheme.title} submitted successfully! Your application reference has been logged with the Student Welfare Division.`);
    setTimeout(() => setApplySuccessMsg(''), 6000);
  };

  return (
    <div className="welfare-container animate-fade-in">
      {/* Header */}
      <div className="welfare-page-header">
        <h1 className="welfare-title">Student Welfare, Bursaries & Scholarships</h1>
        <p className="welfare-subtitle">
          Institutional assistance schemes, Mahapola bursaries, on-campus accommodation, and student counselling services.
        </p>
      </div>

      {/* Success Notification Alert */}
      {applySuccessMsg && (
        <div className="welfare-alert-success animate-fade-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="welfare-card welfare-filters-card">
        <div className="welfare-filter-group">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`welfare-tab-btn ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="welfare-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="welfare-search-input"
            placeholder="Search welfare schemes, bursaries, accommodation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="welfare-search-clear"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="welfare-grid">
        {filteredSchemes.map((scheme) => {
          const isApplied = !!appliedSchemes[scheme.id];
          return (
            <div key={scheme.id} className="welfare-scheme-card">
              <div className="welfare-card-body">
                {/* Badge Row */}
                <div className="welfare-badge-row">
                  <span className={`welfare-badge badge-${scheme.categoryTheme}`}>
                    {scheme.category}
                  </span>
                  <span className="welfare-status-pill">
                    {isApplied ? 'Application Under Review' : scheme.applicationStatus}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="welfare-scheme-title">{scheme.title}</h3>
                <p className="welfare-scheme-desc">{scheme.description}</p>

                {/* Eligibility & Benefits Box */}
                <div className="welfare-meta-box">
                  <div className="welfare-meta-item">
                    <strong>Eligibility:</strong>
                    <span>{scheme.eligibility}</span>
                  </div>
                  {scheme.benefits && (
                    <div className="welfare-meta-item">
                      <strong>Benefits:</strong>
                      <span>{scheme.benefits}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="welfare-card-footer">
                <div className="welfare-office-info">
                  <div>Office: <strong>{scheme.contactOffice}</strong></div>
                  {scheme.contactEmail && (
                    <div>Email: <a href={`mailto:${scheme.contactEmail}`}>{scheme.contactEmail}</a></div>
                  )}
                </div>

                <div className="welfare-card-action">
                  {isApplied ? (
                    <div className="welfare-applied-status">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Applied on {appliedSchemes[scheme.id].appliedDate}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="welfare-btn-primary"
                      onClick={() => handleApplyClick(scheme)}
                    >
                      <span>Apply / Request Scheme</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Application Submission */}
      {showApplyModal && selectedScheme && (
        <div className="welfare-modal-overlay animate-fade-in" onClick={() => setShowApplyModal(false)}>
          <div className="welfare-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="welfare-modal-header">
              <div>
                <span className="welfare-badge badge-white">{selectedScheme.category}</span>
                <h3 className="welfare-modal-title">Application: {selectedScheme.title}</h3>
              </div>
              <button
                type="button"
                className="welfare-modal-close"
                onClick={() => setShowApplyModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmApply}>
              <div className="welfare-modal-body">
                <div className="welfare-form-group">
                  <label>Applicant Full Name</label>
                  <input
                    type="text"
                    className="welfare-input"
                    defaultValue={user?.fullName || user?.name || 'M.N.M. Afnan'}
                    required
                  />
                </div>
                <div className="welfare-form-grid-2">
                  <div className="welfare-form-group">
                    <label>Registration Number</label>
                    <input
                      type="text"
                      className="welfare-input"
                      defaultValue={user?.studentId || user?.username || '2021/ICT/85'}
                      required
                    />
                  </div>
                  <div className="welfare-form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      className="welfare-input"
                      defaultValue={user?.phone || '+94 77 123 4567'}
                      required
                    />
                  </div>
                </div>

                <div className="welfare-form-group">
                  <label>Department / Programme</label>
                  <input
                    type="text"
                    className="welfare-input"
                    defaultValue={user?.department || 'Department of Information and Communication Technology'}
                    required
                  />
                </div>

                <div className="welfare-form-group">
                  <label>Statement of Reason / Purpose of Application</label>
                  <textarea
                    className="welfare-textarea"
                    rows="3"
                    placeholder="Provide details regarding your application request (e.g., residence distance, income eligibility, special circumstances)..."
                    required
                  ></textarea>
                </div>

                <div className="welfare-declaration-box">
                  <label className="welfare-checkbox-label">
                    <input type="checkbox" required />
                    <span>I declare that all information submitted is accurate and complies with the regulations of the Faculty of Technology, SEUSL.</span>
                  </label>
                </div>
              </div>

              <div className="welfare-modal-footer">
                <button
                  type="button"
                  className="welfare-btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="welfare-btn-primary"
                >
                  Submit Application to Welfare Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
