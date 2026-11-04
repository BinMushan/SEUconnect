import React, { useState, useEffect } from 'react';
import Login from '../pages/login/login.jsx';
import Student from '../pages/student/student.jsx';
import Lecturer from '../pages/Lecturer/lecturer.jsx';
import HOD from '../pages/hod/hod.jsx';
import Dean from '../pages/dean/dean.jsx';
import SAR from '../pages/sar/sar.jsx';
import Admin from '../pages/admin/admin.jsx';
import SuperAdmin from '../pages/superadmin/superadmin.jsx';
import Examination from '../pages/examination/examination.jsx';
import FMA from '../pages/fma/fma.jsx';
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
    name: 'Dr. K. Perera',
    email: 'lecturer@gmail.com',
    role: 'lecturer',
    roleKey: 'lecturer',
    staffId: 'LEC/ICT/024',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Senior Lecturer Gr. II & Course Coordinator',
    avatarInitial: 'KP',
  },
  hod: {
    name: 'M.J Ahamed Sabani',
    email: 'hod@gmail.com',
    role: 'hod',
    roleKey: 'hod',
    staffId: 'STAFF-ICT-001',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Head of the Department (ICT)',
    avatarInitial: 'AS',
  },
  sar: {
    name: 'Mr. K.L.M. Riyas',
    email: 'sar@gmail.com',
    role: 'sar',
    roleKey: 'sar',
    staffId: 'STAFF-SAR-001',
    department: 'Faculty Administrative Division / Office of the SAR',
    faculty: 'Faculty of Technology',
    designation: 'Senior Assistant Registrar (SAR)',
    avatarInitial: 'KR',
  },
  dean: {
    name: 'Prof. Rifai Kariapper',
    email: 'dean@gmail.com',
    role: 'dean',
    roleKey: 'dean',
    staffId: 'STAFF-FOT-001',
    department: 'Faculty Executive Office',
    faculty: 'Faculty of Technology',
    designation: 'Dean, Faculty of Technology',
    avatarInitial: 'RK',
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
  fma: {
    name: 'Mr. MMM. Kamil',
    email: 'fma@gmail.com',
    role: 'fma',
    roleKey: 'fma',
    staffId: 'STAFF-FMA-002',
    department: 'Office of the Dean',
    faculty: 'Faculty of Technology',
    designation: 'Management Assistant Gr. I',
    avatarInitial: 'MK',
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

function getInitialAuthState() {
  if (typeof window === 'undefined') return { page: 'login', user: null };
  const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '').trim() : '';
  const cleanPath = (rawHash || window.location.pathname).replace(/^\//, '').toLowerCase();
  const matchedRole = ['student', 'lecturer', 'hod', 'sar', 'dean', 'admin', 'superadmin', 'examination'].find(
    (role) => cleanPath === role || cleanPath.startsWith(`${role}/`)
  );
  if (matchedRole) {
    return { page: matchedRole, user: DEFAULT_USERS_BY_ROLE[matchedRole] };
  }
  return { page: 'login', user: null };
}

function App() {
  const [initialState] = useState(getInitialAuthState);
  const [currentUser, setCurrentUser] = useState(initialState.user);
  const [currentPage, setCurrentPage] = useState(initialState.page);

  // Sync state with URL hash or pathname
  useEffect(() => {
    const handleHashChange = () => {
      const cleanPath = (window.location.hash.replace('#', '') || window.location.pathname).replace(/^\//, '').toLowerCase();
      if (!cleanPath) {
        setCurrentPage('login');
      } else {

        const matchedRole = ['student', 'lecturer', 'hod', 'sar', 'dean', 'admin', 'superadmin', 'examination', 'fma'].find(



          (role) => cleanPath === role || cleanPath.startsWith(`${role}/`)
        );
        if (matchedRole) {
          setCurrentPage(matchedRole);
          setCurrentUser((prev) => prev || DEFAULT_USERS_BY_ROLE[matchedRole]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
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
      case 'sar':
        return <SAR user={currentUser || DEFAULT_USERS_BY_ROLE.sar} onLogout={handleLogout} />;
      case 'dean':
        return <Dean user={currentUser || DEFAULT_USERS_BY_ROLE.dean} onLogout={handleLogout} />;
      case 'admin':
        return <Admin user={currentUser || DEFAULT_USERS_BY_ROLE.admin} onLogout={handleLogout} />;
      case 'superadmin':
        return <SuperAdmin user={currentUser || DEFAULT_USERS_BY_ROLE.superadmin} onLogout={handleLogout} />;
      case 'fma':
        return <FMA user={currentUser || DEFAULT_USERS_BY_ROLE.fma} onLogout={handleLogout} />;
      case 'examination':
        return <Examination user={currentUser || DEFAULT_USERS_BY_ROLE.examination} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
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

