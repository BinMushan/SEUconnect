import React, { useState, useEffect } from 'react';
import Login from '../pages/login/login.jsx';
import Student from '../pages/student/student.jsx';
import Lecturer from '../pages/Lecturer/lecturer.jsx';
import HOD from '../pages/hod/hod.jsx';
import Dean from '../pages/dean/dean.jsx';
import Admin from '../pages/admin/admin.jsx';
import SuperAdmin from '../pages/superadmin/superadmin.jsx';
import Examination from '../pages/examination/examination.jsx';
import RoleSwitcherBar from '../components/workflow/RoleSwitcherBar.jsx';

const DEFAULT_USERS_BY_ROLE = {
  student: {
    name: 'M.N.M. Afnan',
    email: 'student@gmail.com',
    role: 'student',
    roleKey: 'student',
    regNo: '22ICT085',
    programme: 'BICT (Hons)',
    semester: 'Semester 05',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Undergraduate',
    avatarInitial: 'M.',
  },
  lecturer: {
    name: 'Dr. S. Kirushanth',
    email: 'lecturer@gmail.com',
    role: 'lecturer',
    roleKey: 'lecturer',
    staffId: 'STAFF-ICT-104',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Senior Lecturer Gr. II & Course Coordinator',
    avatarInitial: 'SK',
  },
  hod: {
    name: 'Dr. M.A. Rifky',
    email: 'hod@gmail.com',
    role: 'hod',
    roleKey: 'hod',
    staffId: 'STAFF-ICT-001',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Head of the Department (ICT)',
    avatarInitial: 'MR',
  },
  dean: {
    name: 'Prof. U.L. Abdul Majeed',
    email: 'dean@gmail.com',
    role: 'dean',
    roleKey: 'dean',
    staffId: 'STAFF-FOT-001',
    department: 'Faculty Executive Office',
    faculty: 'Faculty of Technology',
    designation: 'Dean, Faculty of Technology',
    avatarInitial: 'AM',
  },
  examination: {
    name: 'Dr. (Mrs.) R. Fathima',
    email: 'examination@gmail.com',
    role: 'examination',
    roleKey: 'examination',
    staffId: 'STAFF-EXAM-012',
    department: 'Faculty Examination Branch & Medical Center',
    faculty: 'Faculty of Technology',
    designation: 'Senior Assistant Registrar (Examinations & Records)',
    avatarInitial: 'RF',
  },
  admin: {
    name: 'Eng. K. Thanushan',
    email: 'admin@gmail.com',
    role: 'admin',
    roleKey: 'admin',
    staffId: 'STAFF-SYS-005',
    department: 'Faculty Information Systems & IT Center',
    faculty: 'Faculty of Technology',
    designation: 'System Administrator',
    avatarInitial: 'KT',
  },
  superadmin: {
    name: 'Director Information Services',
    email: 'superadmin@gmail.com',
    role: 'superadmin',
    roleKey: 'superadmin',
    staffId: 'STAFF-ROOT-001',
    department: 'SEUSL Central IT Administration',
    faculty: 'South Eastern University of Sri Lanka',
    designation: 'Chief Information Officer',
    avatarInitial: 'SA',
  },
};

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
        // If user was not yet loaded into state, initialize default persona for that role
        setCurrentUser((prev) => prev || DEFAULT_USERS_BY_ROLE[hash]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (user) => {
    const roleKey = (user.roleKey || user.role || 'student').toLowerCase();
    setCurrentUser(user);
    setCurrentPage(roleKey);
    window.location.hash = `#${roleKey}`;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    window.location.hash = '';
  };

  const handleSwitchRole = (roleObj) => {
    const targetKey = roleObj.key.toLowerCase();
    const targetUser = DEFAULT_USERS_BY_ROLE[targetKey];
    setCurrentUser(targetUser);
    setCurrentPage(targetKey);
    window.location.hash = `#${targetKey}`;
  };

  // Render role page with demo persona switcher bar
  const renderPortal = () => {
    switch (currentPage) {
      case 'student':
        return <Student user={currentUser || DEFAULT_USERS_BY_ROLE.student} onLogout={handleLogout} />;
      case 'lecturer':
        return <Lecturer user={currentUser || DEFAULT_USERS_BY_ROLE.lecturer} onLogout={handleLogout} />;
      case 'hod':
        return <HOD user={currentUser || DEFAULT_USERS_BY_ROLE.hod} onLogout={handleLogout} />;
      case 'dean':
        return <Dean user={currentUser || DEFAULT_USERS_BY_ROLE.dean} onLogout={handleLogout} />;
      case 'admin':
        return <Admin user={currentUser || DEFAULT_USERS_BY_ROLE.admin} onLogout={handleLogout} />;
      case 'superadmin':
        return <SuperAdmin user={currentUser || DEFAULT_USERS_BY_ROLE.superadmin} onLogout={handleLogout} />;
      case 'examination':
        return <Examination user={currentUser || DEFAULT_USERS_BY_ROLE.examination} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentPage !== 'login' && (
        <RoleSwitcherBar
          currentUser={currentUser || DEFAULT_USERS_BY_ROLE[currentPage]}
          onSwitchRole={handleSwitchRole}
        />
      )}
      {renderPortal()}
    </div>
  );
}

export default App;
