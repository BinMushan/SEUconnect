import React from 'react';
import './dean.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';

export default function Dean({ user, onLogout }) {
  const email = user?.email || 'Dean@gmail.com';

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem="dashboard"></DashboardTemplate>
  );
}
