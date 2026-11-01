import React from 'react';
import './examination.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';

export default function Examination({ user, onLogout }) {
  const email = user?.email || 'Examination@gmail.com';

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem="dashboard"></DashboardTemplate>
  );
}
