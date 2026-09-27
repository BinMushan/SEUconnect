import React from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import './student.css';

export default function Student({ user, onLogout }) {
  return (
    <DashboardTemplate user={user} onLogout={onLogout} />
  );
}
