import React from 'react';
import './workflow.css';

export default function RoleSwitcherBar({ currentUser, onSwitchRole }) {
  const roles = [
    { key: 'student', label: '🎓 Student (Afnan)', email: 'student@gmail.com' },
    { key: 'lecturer', label: '👨‍🏫 Lecturer (Dr. Kirushanth)', email: 'lecturer@gmail.com' },
    { key: 'hod', label: '🏛️ HOD (Dr. Rifky)', email: 'hod@gmail.com' },
    { key: 'dept_ma', label: '🏢 Dept MA (Fathima)', email: 'deptma@gmail.com' },
    { key: 'sar', label: '📋 SAR (Mr. Riyas)', email: 'sar@gmail.com' },
    { key: 'dean', label: '📜 Dean (Prof. Majeed)', email: 'dean@gmail.com' },
    { key: 'examination', label: '📝 Exam/Medical Officer', email: 'examination@gmail.com' },
    { key: 'fma', label: '📋 Management Assistant (Kamil)', email: 'fma@gmail.com' },
    { key: 'admin', label: '⚙️ System Admin', email: 'admin@gmail.com' },
  ];

  const currentRole = currentUser?.roleKey || currentUser?.role || 'student';

  return (
    <div className="seu-demo-bar">
      <div className="seu-demo-bar-left">
        <span className="seu-demo-tag">LIVE MERN DEMO</span>
        <span style={{ color: '#94a3b8' }}>
          Logged in: <strong style={{ color: '#38bdf8' }}>{currentUser?.name || 'User'}</strong> ({currentUser?.roleKey?.toUpperCase() || 'STU'})
        </span>
      </div>

      <div className="seu-demo-bar-roles">
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: '0.2rem' }}>
          Quick Switch Persona:
        </span>
        {roles.map((r) => {
          const isActive = currentRole.toLowerCase() === r.key.toLowerCase();
          return (
            <button
              key={r.key}
              type="button"
              className={`seu-demo-role-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSwitchRole(r)}
              title={`Switch to ${r.label}`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
