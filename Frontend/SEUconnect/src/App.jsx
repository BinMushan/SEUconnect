import React, { useState, useEffect } from 'react';
import Login from '../pages/login/login.jsx';
import Student from '../pages/student/student.jsx';
import Lecturer from '../pages/Lecturer/lecturer.jsx';
import HOD from '../pages/hod/hod.jsx';
import Dean from '../pages/dean/dean.jsx';
import Admin from '../pages/admin/admin.jsx';
import SuperAdmin from '../pages/superadmin/superadmin.jsx';
import Examination from '../pages/examination/examination.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (!hash) {
        setCurrentPage('login');
      } else if (['student', 'lecturer', 'hod', 'dean', 'admin', 'superadmin', 'examination'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const roleKey = user.roleKey;
    setCurrentPage(roleKey);
    window.location.hash = `#${roleKey}`;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    window.location.hash = '';
  };

  // Render the appropriate page component
  switch (currentPage) {
    case 'student':
      return <Student user={currentUser} onLogout={handleLogout} />;
    case 'lecturer':
      return <Lecturer user={currentUser} onLogout={handleLogout} />;
    case 'hod':
      return <HOD user={currentUser} onLogout={handleLogout} />;
    case 'dean':
      return <Dean user={currentUser} onLogout={handleLogout} />;
    case 'admin':
      return <Admin user={currentUser} onLogout={handleLogout} />;
    case 'superadmin':
      return <SuperAdmin user={currentUser} onLogout={handleLogout} />;
    case 'examination':
      return <Examination user={currentUser} onLogout={handleLogout} />;
    default:
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }
}

export default App;
