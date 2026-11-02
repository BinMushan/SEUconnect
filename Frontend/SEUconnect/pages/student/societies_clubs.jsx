import React, { useState, useMemo } from 'react';
import './societies_clubs.css';

export const SOCIETIES_DATA = [
  {
    id: 'soc_itsa',
    name: 'Information Technology Students Association (ITSA)',
    shortCode: 'ITSA',
    category: 'Technology',
    categoryTheme: 'technology',
    description: 'The premier student society of the Department of ICT, organizing hackathons, tech talks, and open-source bootcamps.',
    president: 'M.N.M. Afnan (22ICT085)',
    seniorTreasurer: 'Dr. R. Ketheeswaran',
    meetingSchedule: 'Every alternate Wednesday, 4:00 PM, Audi FT',
    defaultStatus: 'Active',
    membersCount: 184,
    annualEvents: ['HackX SEUSL', 'DevPulse Bootcamp', 'TechExhibition 2026']
  },
  {
    id: 'soc_sports',
    name: 'Technology Faculty Sports & Athletics Club',
    shortCode: 'TECH-SPORTS',
    category: 'Sports',
    categoryTheme: 'sports',
    description: 'Promoting university athletics, cricket, badminton, and inter-faculty tournament teams.',
    president: 'K. Kavishan',
    seniorTreasurer: 'Senior Faculty Member',
    meetingSchedule: 'Every Tuesday, 5:00 PM, University Sports Ground',
    defaultStatus: 'Active',
    membersCount: 142,
    annualEvents: ['Inter-Faculty Cricket Championship', 'Badminton Open', 'Annual Sports Meet']
  },
  {
    id: 'soc_robotics',
    name: 'Robotics & IoT Innovation Society',
    shortCode: 'RIOTS',
    category: 'Engineering & Innovation',
    categoryTheme: 'engineering',
    description: 'Hardware prototyping, microcontroller programming, robotics competitions, and annual university maker fairs.',
    president: 'A.S. Farhan',
    seniorTreasurer: 'Eng. Faculty Advisor',
    meetingSchedule: 'Thursdays, 3:30 PM, Hardware Lab',
    defaultStatus: 'Open',
    membersCount: 96,
    annualEvents: ['RoboClash Sri Lanka', 'IoT Hackathon', 'Autonomous Rover Showcase']
  },
  {
    id: 'soc_media',
    name: 'Technology Cultural & Media Unit',
    shortCode: 'TECH-MEDIA',
    category: 'Cultural & Media',
    categoryTheme: 'cultural',
    description: 'Campus journalism, university photography, video production, tech magazines, and faculty cultural celebrations.',
    president: 'R. Nilakshan',
    seniorTreasurer: 'Senior Lecturer Media Unit',
    meetingSchedule: 'Fridays, 4:30 PM, Media Studio',
    defaultStatus: 'Open',
    membersCount: 110,
    annualEvents: ['LensCraft Photo Expo', 'Faculty Annual Magazine', 'Cultural Nights']
  },
  {
    id: 'soc_ieee',
    name: 'IEEE Student Branch - SEUSL',
    shortCode: 'IEEE-SEUSL',
    category: 'Professional Body',
    categoryTheme: 'professional',
    description: 'International IEEE student branch fostering research publications, global coding challenges, and professional networking.',
    president: 'S. Abishek',
    seniorTreasurer: 'Prof. Academic Advisor',
    meetingSchedule: 'Monthly First Saturday, 10:00 AM, Seminar Room',
    defaultStatus: 'Open',
    membersCount: 165,
    annualEvents: ['IEEE Xtreme 24h Hackathon', 'Women in Engineering (WIE) Summit', 'Research Symposium']
  }
];

export default function StudentSocieties({ user }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledMap, setEnrolledMap] = useState({
    soc_itsa: true,
    soc_sports: true
  });
  const [notificationMsg, setNotificationMsg] = useState('');
  const [selectedSocietyModal, setSelectedSocietyModal] = useState(null);

  const categories = [
    'All',
    'Technology',
    'Sports',
    'Engineering & Innovation',
    'Cultural & Media',
    'Professional Body'
  ];

  const filteredSocieties = useMemo(() => {
    return SOCIETIES_DATA.filter((soc) => {
      if (activeFilter !== 'All' && soc.category !== activeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        soc.name.toLowerCase().includes(q) ||
        soc.shortCode.toLowerCase().includes(q) ||
        soc.description.toLowerCase().includes(q) ||
        soc.category.toLowerCase().includes(q) ||
        soc.president.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, searchQuery]);

  const handleJoinSociety = (socId, socName) => {
    setEnrolledMap((prev) => ({
      ...prev,
      [socId]: true
    }));
    setNotificationMsg(`You have successfully enrolled in ${socName}! Welcome to the society.`);
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  const handleLeaveSociety = (socId, socName) => {
    setEnrolledMap((prev) => ({
      ...prev,
      [socId]: false
    }));
    setNotificationMsg(`You have left ${socName}.`);
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  return (
    <div className="societies-container animate-fade-in">
      {/* Page Header */}
      <div className="societies-page-header">
        <h1 className="societies-title">Faculty Societies & Student Clubs</h1>
        <p className="societies-subtitle">
          Explore co-curricular organizations, hackathons, open source clubs, and department associations.
        </p>
      </div>

      {/* Success Notification */}
      {notificationMsg && (
        <div className="societies-alert-success animate-fade-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="societies-card societies-filters-card">
        <div className="societies-filter-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`societies-tab-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="societies-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="societies-search-input"
            placeholder="Search societies, clubs, hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="societies-search-clear"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Societies Cards Grid */}
      <div className="societies-grid">
        {filteredSocieties.map((soc) => {
          const isEnrolled = !!enrolledMap[soc.id];
          return (
            <div key={soc.id} className="society-card">
              <div className="society-card-body">
                {/* Header Badge Row */}
                <div className="society-badge-row">
                  <span className={`society-category-badge badge-${soc.categoryTheme}`}>
                    {soc.category}
                  </span>
                  <span className={`society-status-badge ${isEnrolled ? 'status-active' : 'status-open'}`}>
                    {isEnrolled ? 'Active Member' : 'Open for Enrollment'}
                  </span>
                </div>

                {/* Society Name */}
                <h3 className="society-card-title">
                  {soc.name} ({soc.shortCode})
                </h3>

                {/* Description */}
                <p className="society-card-desc">{soc.description}</p>

                {/* Details Meta Box */}
                <div className="society-meta-box">
                  <div className="society-meta-row">
                    <span className="society-meta-label">President:</span>
                    <strong className="society-meta-val">{soc.president}</strong>
                  </div>
                  <div className="society-meta-row">
                    <span className="society-meta-label">Senior Treasurer:</span>
                    <strong className="society-meta-val">{soc.seniorTreasurer}</strong>
                  </div>
                  {soc.meetingSchedule && (
                    <div className="society-meta-row">
                      <span className="society-meta-label">Meetings:</span>
                      <strong className="society-meta-val">{soc.meetingSchedule}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="society-card-footer">
                <div className="society-footer-top">
                  <span className="society-members-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{soc.membersCount + (isEnrolled && soc.defaultStatus !== 'Active' ? 1 : 0)} Members</span>
                  </span>
                  <button
                    type="button"
                    className="society-view-info-btn"
                    onClick={() => setSelectedSocietyModal(soc)}
                  >
                    View Details
                  </button>
                </div>

                {isEnrolled ? (
                  <div className="society-enrolled-row">
                    <div className="society-active-member-banner">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Enrolled Active Member</span>
                    </div>
                    <button
                      type="button"
                      className="society-leave-btn"
                      onClick={() => handleLeaveSociety(soc.id, soc.name)}
                      title="Leave society"
                    >
                      Leave
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="societies-btn-primary"
                    onClick={() => handleJoinSociety(soc.id, soc.name)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    <span>Join Society</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Society Details Modal */}
      {selectedSocietyModal && (
        <div className="societies-modal-overlay animate-fade-in" onClick={() => setSelectedSocietyModal(null)}>
          <div className="societies-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="societies-modal-header">
              <div>
                <span className="society-category-badge badge-white">
                  {selectedSocietyModal.category}
                </span>
                <h3 className="societies-modal-title">
                  {selectedSocietyModal.name} ({selectedSocietyModal.shortCode})
                </h3>
              </div>
              <button
                type="button"
                className="societies-modal-close"
                onClick={() => setSelectedSocietyModal(null)}
              >
                &times;
              </button>
            </div>

            <div className="societies-modal-body">
              <p className="societies-modal-desc">{selectedSocietyModal.description}</p>

              <div className="societies-modal-section">
                <h4>Leadership & Coordination</h4>
                <div className="societies-modal-grid">
                  <div>
                    <span className="societies-label">President</span>
                    <strong>{selectedSocietyModal.president}</strong>
                  </div>
                  <div>
                    <span className="societies-label">Senior Treasurer</span>
                    <strong>{selectedSocietyModal.seniorTreasurer}</strong>
                  </div>
                  <div>
                    <span className="societies-label">Official Meeting Schedule</span>
                    <strong>{selectedSocietyModal.meetingSchedule}</strong>
                  </div>
                  <div>
                    <span className="societies-label">Active Membership Count</span>
                    <strong>{selectedSocietyModal.membersCount} Undergraduates</strong>
                  </div>
                </div>
              </div>

              <div className="societies-modal-section">
                <h4>Flagship Annual Activities & Hackathons</h4>
                <div className="societies-events-list">
                  {selectedSocietyModal.annualEvents.map((evt, idx) => (
                    <div key={idx} className="societies-event-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f2b54" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>{evt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="societies-modal-footer">
              <button
                type="button"
                className="societies-btn-secondary"
                onClick={() => setSelectedSocietyModal(null)}
              >
                Close
              </button>
              {!enrolledMap[selectedSocietyModal.id] ? (
                <button
                  type="button"
                  className="societies-btn-primary"
                  onClick={() => {
                    handleJoinSociety(selectedSocietyModal.id, selectedSocietyModal.name);
                    setSelectedSocietyModal(null);
                  }}
                >
                  Join This Society
                </button>
              ) : (
                <button
                  type="button"
                  className="societies-btn-secondary"
                  disabled
                >
                  ✓ Already Enrolled
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
