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
import DeptMA from '../pages/dept_ma/dept_ma.jsx';
import RoleSwitcherBar from '../components/workflow/RoleSwitcherBar.jsx';
import api, { authToken } from './services/api.js';

const USER_KEY = 'seuconnect_user';
const ROLE_KEYS = ['student', 'lecturer', 'hod', 'sar', 'dean', 'admin', 'superadmin', 'examination', 'fma', 'dept_ma', 'department_ma'];

const readStoredUser = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};
const storeUser = (user) => {
  try {
    if (user) window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
};

const canonicalRole = (role) => (role === 'department_ma' ? 'dept_ma' : role);

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
  dept_ma: {
    name: 'Mrs. K. N. Fathima',
    email: 'deptma@gmail.com',
    role: 'dept_ma',
    roleKey: 'dept_ma',
    staffId: 'STAFF-DMA-008',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Department Management Assistant (ICT)',
    avatarInitial: 'KF',
  },
  department_ma: {
    name: 'Mrs. K. N. Fathima',
    email: 'deptma@gmail.com',
    role: 'dept_ma',
    roleKey: 'dept_ma',
    staffId: 'STAFF-DMA-008',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology',
    designation: 'Department Management Assistant (ICT)',
    avatarInitial: 'KF',
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
  if (typeof window === 'undefined') return { page: 'login', user: null, needsSession: false };
  const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '').trim() : '';
  const cleanPath = (rawHash || window.location.pathname).replace(/^\//, '').toLowerCase();
  const matchedRole = ROLE_KEYS.find((role) => cleanPath === role || cleanPath.startsWith(`${role}/`));
  if (!matchedRole) return { page: 'login', user: null, needsSession: false };

  // Reload / deep link: reuse the stored session when it belongs to this role.
  const stored = readStoredUser();
  if (stored && api.hasSession() && canonicalRole(stored.roleKey || stored.role) === canonicalRole(matchedRole)) {
    return { page: matchedRole, user: stored, needsSession: false };
  }
  return { page: matchedRole, user: DEFAULT_USERS_BY_ROLE[matchedRole], needsSession: true };
}

function App() {
  const [initialState] = useState(getInitialAuthState);
  const [currentUser, setCurrentUser] = useState(initialState.user);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  // False while a demo persona is being signed in (deep link / reload without a valid token).
  const [sessionReady, setSessionReady] = useState(!initialState.needsSession);

  // Demo personas share the seeded password; signing in gives every API call a real token.
  const signInPersona = async (roleKey) => {
    const persona = DEFAULT_USERS_BY_ROLE[roleKey];
    try {
      const res = await api.login(persona.email, '123456');
      storeUser(res.user);
      return res.user;
    } catch (err) {
      console.warn(`Could not sign in demo persona ${roleKey}:`, err.message);
      authToken.set(`demo-token-${roleKey}-${Date.now()}`);
      storeUser(persona);
      return persona;
    }
  };

  useEffect(() => {
    if (sessionReady) return undefined;
    let cancelled = false;
    signInPersona(initialState.page).then((user) => {
      if (cancelled) return;
      setCurrentUser(user);
      setSessionReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state with URL hash or pathname
  useEffect(() => {
    const handleHashChange = () => {
      const cleanPath = (window.location.hash.replace('#', '') || window.location.pathname).replace(/^\//, '').toLowerCase();
      if (!cleanPath) {
        setCurrentPage('login');
      } else {
        const matchedRole = ['student', 'lecturer', 'hod', 'sar', 'dean', 'admin', 'superadmin', 'examination', 'fma', 'dept_ma', 'department_ma'].find(
          (role) => cleanPath === role || cleanPath.startsWith(`${role}/`)
        );
        if (matchedRole) {
          const canonical = canonicalRole(matchedRole);
          setCurrentPage(canonical);
          setCurrentUser((prev) => {
            const prevRole = canonicalRole(prev?.roleKey || prev?.role);
            if (prev && prevRole === canonical) {
              return prev;
            }
            const stored = readStoredUser();
            if (stored && canonicalRole(stored.roleKey || stored.role) === canonical) {
              return stored;
            }
            return DEFAULT_USERS_BY_ROLE[canonical] || DEFAULT_USERS_BY_ROLE[matchedRole];
          });
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
    if (!authToken.get()) {
      authToken.set(`session-token-${roleKey}-${Date.now()}`);
    }
    storeUser(user);
    setSessionReady(true);
    setCurrentUser(user);
    setCurrentPage(roleKey);
    window.location.hash = `#${roleKey}`;
  };

  const handleLogout = () => {
    api.logout();
    storeUser(null);
    setCurrentUser(null);
    setCurrentPage('login');
    window.location.hash = '';
  };

  const handleSwitchRole = async (roleObj) => {
    const targetKey = roleObj.key.toLowerCase();
    setSessionReady(false);
    authToken.set(`demo-token-${targetKey}-${Date.now()}`);
    const targetUser = await signInPersona(targetKey);
    setCurrentUser(targetUser);
    setCurrentPage(targetKey);
    setSessionReady(true);
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
      case 'dept_ma':
      case 'department_ma':
        return <DeptMA user={currentUser || DEFAULT_USERS_BY_ROLE.dept_ma} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {currentPage !== 'login' && (
        <RoleSwitcherBar
          currentUser={currentUser || DEFAULT_USERS_BY_ROLE[currentPage]}
          currentPage={currentPage}
          onSwitchRole={handleSwitchRole}
        />
      )}
      {currentPage !== 'login' && !sessionReady ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>Signing in…</div>
      ) : (
        <React.Fragment key={currentUser?.email || currentPage}>{renderPortal()}</React.Fragment>
      )}
    </div>
  );
}

export default App;

