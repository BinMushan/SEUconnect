import React from 'react';
import './hod.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';

export default function HOD({ user, onLogout }) {
  const email = user?.email || 'HOD@gmail.com';

  return (
    <DashboardTemplate user={user} onLogout={onLogout} activeItem="dashboard"></DashboardTemplate>
  );
}
