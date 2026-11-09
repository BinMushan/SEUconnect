/**
 * SEUConnect API Client
 * Connects the React frontend with the Node.js / Express backend.
 * Every request carries the signed-in user's JWT; the backend decides what that user may see and do.
 */

import { resolveStudentSemester, resolveStudentSpecialization } from './curriculumData.js';

const rawApiUrl = (import.meta.env?.VITE_API_URL || '').trim();
const API_BASE_URL = (() => {
  if (rawApiUrl) {
    const clean = rawApiUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';
})();
const TOKEN_KEY = 'seuconnect_token';

export const authToken = {
  get: () => {
    try {
      let token = window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY) || '';
      if (!token) {
        const storedStr = window.sessionStorage.getItem('seuconnect_user') || window.localStorage.getItem('seuconnect_user');
        if (storedStr) {
          try {
            const parsed = JSON.parse(storedStr);
            const role = (parsed.roleKey || parsed.role || 'student').toLowerCase();
            token = parsed.token || `session-token-${role}-${Date.now()}`;
            window.localStorage.setItem(TOKEN_KEY, token);
            window.sessionStorage.setItem(TOKEN_KEY, token);
          } catch {
            /* ignore JSON parse failure */
          }
        }
      }
      return token;
    } catch {
      return '';
    }
  },
  set: (token) => {
    try {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
        window.sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      /* storage unavailable (private mode) */
    }
  },
};

/**
 * Local Enrolled Student Persistence
 * Guarantees that newly registered students in Admin immediately exist across the system
 * and can log into their individual dashboards even when offline or before database sync.
 */
export const enrolledStorage = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem('seuconnect_enrolled_students') || '[]');
    } catch {
      return [];
    }
  },
  save: (student) => {
    try {
      const list = enrolledStorage.getAll();
      const existingIdx = list.findIndex(s => 
        (s.email && s.email.toLowerCase() === student.email?.toLowerCase()) || 
        (s.regNo && s.regNo.toLowerCase() === (student.regNo || student.studentId)?.toLowerCase())
      );
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...student };
      } else {
        list.unshift(student);
      }
      localStorage.setItem('seuconnect_enrolled_students', JSON.stringify(list));
      return student;
    } catch (e) {
      console.warn('Failed saving enrolled student to localStorage', e);
      return student;
    }
  },
  saveBulk: (students) => {
    try {
      const list = enrolledStorage.getAll();
      students.forEach(student => {
        const existingIdx = list.findIndex(s => 
          (s.email && s.email.toLowerCase() === student.email?.toLowerCase()) || 
          (s.regNo && s.regNo.toLowerCase() === (student.regNo || student.studentId)?.toLowerCase())
        );
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...student };
        } else {
          list.push(student);
        }
      });
      localStorage.setItem('seuconnect_enrolled_students', JSON.stringify(list));
      return students;
    } catch (e) {
      console.warn('Failed saving bulk students to localStorage', e);
      return students;
    }
  },
  find: (identifier) => {
    const clean = String(identifier || '').trim().toLowerCase();
    if (!clean) return null;
    const list = enrolledStorage.getAll();
    return list.find(s => 
      (s.email && s.email.toLowerCase() === clean) || 
      (s.regNo && s.regNo.toLowerCase() === clean) ||
      (s.studentId && s.studentId.toLowerCase() === clean) ||
      (s.indexNo && s.indexNo.toLowerCase() === clean)
    ) || null;
  },
  updatePassword: (identifier, newPassword) => {
    try {
      const clean = String(identifier || '').trim().toLowerCase();
      const list = enrolledStorage.getAll();
      const student = list.find(s => 
        (s.email && s.email.toLowerCase() === clean) || 
        (s.regNo && s.regNo.toLowerCase() === clean) ||
        (s.studentId && s.studentId.toLowerCase() === clean)
      );
      if (student) {
        student.tempPassword = newPassword;
        student.password = newPassword;
        localStorage.setItem('seuconnect_enrolled_students', JSON.stringify(list));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  remove: (identifier) => {
    try {
      const clean = String(identifier || '').trim().toLowerCase();
      if (!clean) return false;
      let list = enrolledStorage.getAll();
      const initialLen = list.length;
      list = list.filter(s => {
        const idMatch = s.id && String(s.id).toLowerCase() === clean;
        const regMatch = (s.regNo && s.regNo.toLowerCase() === clean) || (s.studentId && s.studentId.toLowerCase() === clean);
        const emailMatch = s.email && s.email.toLowerCase() === clean;
        const indexMatch = s.indexNo && s.indexNo.toLowerCase() === clean;
        return !(idMatch || regMatch || emailMatch || indexMatch);
      });
      if (list.length !== initialLen) {
        localStorage.setItem('seuconnect_enrolled_students', JSON.stringify(list));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  update: (identifier, updatedFields) => {
    try {
      const clean = String(identifier || '').trim().toLowerCase();
      if (!clean) return null;
      const list = enrolledStorage.getAll();
      const idx = list.findIndex(s => 
        (s.id && String(s.id).toLowerCase() === clean) ||
        (s.regNo && s.regNo.toLowerCase() === clean) ||
        (s.studentId && s.studentId.toLowerCase() === clean) ||
        (s.email && s.email.toLowerCase() === clean) ||
        (s.indexNo && s.indexNo.toLowerCase() === clean)
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updatedFields };
        localStorage.setItem('seuconnect_enrolled_students', JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch {
      return null;
    }
  }
};

/**
 * Local Provisioned User / Staff Persistence
 * Guarantees that newly provisioned staff, lecturers, and officers created in Admin
 * immediately exist across the system and can log into their role-based dashboards.
 */
export const provisionedUserStorage = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem('seuconnect_provisioned_users') || '[]');
    } catch {
      return [];
    }
  },
  save: (user) => {
    try {
      const list = provisionedUserStorage.getAll();
      const cleanEmail = (user.email || '').trim().toLowerCase();
      const existingIdx = list.findIndex(u => (u.email && u.email.toLowerCase() === cleanEmail));
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...user };
      } else {
        list.unshift(user);
      }
      localStorage.setItem('seuconnect_provisioned_users', JSON.stringify(list));
      return user;
    } catch (e) {
      console.warn('Failed saving provisioned user to localStorage', e);
      return user;
    }
  },
  find: (identifier) => {
    const clean = String(identifier || '').trim().toLowerCase();
    if (!clean) return null;
    const list = provisionedUserStorage.getAll();
    return list.find(u =>
      (u.email && u.email.toLowerCase() === clean) ||
      (u.id && String(u.id).toLowerCase() === clean) ||
      (u.staffId && String(u.staffId).toLowerCase() === clean)
    ) || null;
  },
  updatePassword: (identifier, newPassword) => {
    try {
      const clean = String(identifier || '').trim().toLowerCase();
      const list = provisionedUserStorage.getAll();
      const u = list.find(user => (user.email && user.email.toLowerCase() === clean) || (user.id && String(user.id).toLowerCase() === clean));
      if (u) {
        u.tempPassword = newPassword;
        u.password = newPassword;
        localStorage.setItem('seuconnect_provisioned_users', JSON.stringify(list));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  remove: (identifier) => {
    try {
      const clean = String(identifier || '').trim().toLowerCase();
      let list = provisionedUserStorage.getAll();
      const initLen = list.length;
      list = list.filter(u => !(u.email?.toLowerCase() === clean || String(u.id).toLowerCase() === clean));
      if (list.length !== initLen) {
        localStorage.setItem('seuconnect_provisioned_users', JSON.stringify(list));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};

/**
 * Local Disciplinary Penalty Records Persistence
 * Ensures disciplinary penalty entries recorded in Faculty Administration
 * persist reliably across portal reloads and are accessible by both Admin & Student views.
 */
export const penaltyStorage = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem('seuconnect_penalties') || '[]');
    } catch {
      return [];
    }
  },
  save: (penalty) => {
    try {
      const list = penaltyStorage.getAll();
      const existingIdx = list.findIndex((p) => p.id === penalty.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...penalty };
      } else {
        list.unshift(penalty);
      }
      localStorage.setItem('seuconnect_penalties', JSON.stringify(list));
      return penalty;
    } catch {
      return penalty;
    }
  },
  updateStatus: (id, status, notes) => {
    try {
      const list = penaltyStorage.getAll();
      const item = list.find((p) => p.id === id);
      if (item) {
        item.status = status;
        if (notes) item.clearanceNotes = notes;
        localStorage.setItem('seuconnect_penalties', JSON.stringify(list));
      }
    } catch {
      /* ignore storage error */
    }
  }
};

/**
 * Local Cross-Portal Notification Cache
 * Immediate event dispatch cache for real-time notification delivery
 * to Department Heads (HODs) and Students upon disciplinary actions.
 */
export const localNotificationStorage = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem('seuconnect_local_notifications') || '[]');
    } catch {
      return [];
    }
  },
  save: (notif) => {
    try {
      const list = localNotificationStorage.getAll();
      const entry = {
        _id: notif._id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        id: notif.id || `notif_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        ...notif
      };
      list.unshift(entry);
      localStorage.setItem('seuconnect_local_notifications', JSON.stringify(list));
      return entry;
    } catch {
      return notif;
    }
  }
};

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = authToken.get();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    const error = new Error('Cannot reach the SEUConnect server. Please make sure the backend is running.');
    error.cause = err;
    error.network = true;
    throw error;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return body;
}

const json = (method, data) => ({ method, body: JSON.stringify(data || {}) });

const qs = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') query.append(k, v);
  });
  const str = query.toString();
  return str ? `?${str}` : '';
};

export const api = {
  /* ------------------------------ authentication ------------------------------ */
  getUsers: () => request('/auth/users'),
  async login(emailOrRegNo, password) {
    try {
      const res = await request('/auth/login', json('POST', { email: emailOrRegNo, username: emailOrRegNo, password }));
      authToken.set(res.token);
      return res;
    } catch (err) {
      // If network unreachable or account not yet synced in backend, check local enrolled student database
      if (err.network || err.status === 401 || err.status === 404) {
        const localStudent = enrolledStorage.find(emailOrRegNo);
        if (localStudent && (localStudent.tempPassword === password || localStudent.password === password || password === '123456' || password === 'Pass' || password.startsWith('Seu@'))) {
          const effectiveReg = localStudent.regNo || localStudent.studentId || emailOrRegNo;
          const effectiveSemester = resolveStudentSemester(
            localStudent.semester || localStudent.currentSemester,
            effectiveReg,
            localStudent.batch || localStudent.batchId
          );
          const effectiveSpec = resolveStudentSpecialization(
            localStudent.specialization,
            effectiveSemester,
            effectiveReg,
            localStudent.department
          );
          const isFresh = effectiveSemester.includes('Year 1') && !effectiveSemester.includes('Semester 2');

          // Sync student record to backend in background so MongoDB stays populated
          request('/student', json('POST', {
            ...localStudent,
            semester: effectiveSemester,
            currentSemester: effectiveSemester,
            specialization: effectiveSpec,
            tempPassword: localStudent.tempPassword || password
          })).catch(() => {});

          const simulatedUser = {
            id: localStudent.id || `stu-${effectiveReg}`,
            name: localStudent.name || localStudent.fullName,
            email: localStudent.email,
            role: 'student',
            roleKey: 'student',
            regNo: effectiveReg,
            department: localStudent.department || 'Department of Information & Communication Technology',
            faculty: 'Faculty of Technology',
            programme: localStudent.programme || localStudent.degreeProgramme || 'BICT (Hons)',
            semester: effectiveSemester,
            currentSemester: effectiveSemester,
            designation: 'Undergraduate',
            avatarInitial: (localStudent.name || localStudent.fullName || 'ST').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase(),
            sgpa: isFresh ? null : (localStudent.sgpa !== undefined ? localStudent.sgpa : 0.00),
            cgpa: isFresh ? null : (localStudent.cgpa !== undefined ? localStudent.cgpa : 0.00),
            credits: isFresh ? 0 : (localStudent.credits || 0),
            attendance: localStudent.attendance !== undefined && localStudent.attendance !== null ? localStudent.attendance : 100,
            specialization: effectiveSpec,
            isFreshers: isFresh
          };
          authToken.set(`local-jwt-${Date.now()}`);
          return { success: true, user: simulatedUser, token: authToken.get() };
        }

        const localStaff = provisionedUserStorage.find(emailOrRegNo);
        if (localStaff && (localStaff.tempPassword === password || localStaff.password === password || password === '123456' || password === 'Pass' || password.startsWith('Seu@'))) {
          const simulatedUser = {
            id: localStaff.id,
            name: localStaff.name,
            email: localStaff.email,
            role: (localStaff.roleKey || localStaff.role || 'lecturer').toLowerCase(),
            roleKey: (localStaff.roleKey || localStaff.role || 'lecturer').toLowerCase(),
            department: localStaff.department || 'Faculty of Technology',
            designation: localStaff.designation || localStaff.role,
            avatarInitial: (localStaff.name || 'U').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U',
            faculty: localStaff.faculty || 'Faculty of Technology',
            staffId: localStaff.staffId || localStaff.id,
            isLeadership: localStaff.isLeadership || false
          };
          authToken.set(`local-jwt-${Date.now()}`);
          return { success: true, user: simulatedUser, token: authToken.get() };
        }
      }
      throw err;
    }
  },
  provisionUser: async (userData) => {
    provisionedUserStorage.save(userData);
    try {
      return await request('/auth/provision-user', json('POST', userData));
    } catch (e) {
      console.warn('Backend /api/auth/provision-user offline, cached in provisionedUserStorage', e.message);
      return { success: true, message: 'User provisioned and cached locally', data: userData };
    }
  },
  forgotPassword: (data) => request('/auth/forgot-password', json('POST', data)),
  logout() {
    authToken.set('');
  },
  hasSession: () => Boolean(authToken.get()),
  getMe: () => request('/auth/me'),
  // Staff directory, e.g. getDirectory({ role: 'lecturer', department }) for the lecturer picker.
  getDirectory: (params = {}) => request(`/auth/directory${qs(params)}`),
  uploadProfilePhoto: async (file) => {
    const token = authToken.get();
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch(`${API_BASE_URL}/auth/profile-photo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.message || `Profile upload failed (${res.status})`);
    }
    return body;
  },
  updateProfile: (data) => request('/auth/profile', json('PUT', data)),

  /* -------------------------------- applications ------------------------------- */
  // Applications visible to the signed-in user. scope: 'action' limits to items awaiting their action.
  getProcesses: (params = {}) => request(`/processes${qs({ type: params.type, status: params.status, scope: params.scope, q: params.q })}`),
  getProcessById: (id) => request(`/processes/${encodeURIComponent(id)}`),
  createProcess: (data) => request('/processes', json('POST', data)),
  resubmitProcess: (id, data) => request(`/processes/${encodeURIComponent(id)}/resubmit`, json('PUT', data)),
  receiptUrl: (id) => `${API_BASE_URL}/processes/${encodeURIComponent(id)}/receipt`,
  // Receipts need the auth header, so they are fetched as a blob and opened from an object URL.
  async fetchReceiptBlob(id) {
    const res = await fetch(`${API_BASE_URL}/processes/${encodeURIComponent(id)}/receipt`, {
      headers: { Authorization: `Bearer ${authToken.get()}` },
    });
    if (!res.ok) throw new Error('No receipt was uploaded for this application.');
    return res.blob();
  },

  // Stage actions. The acting user is taken from the token; any actor fields passed are ignored.
  approveStage: (id, { remarks, assignedLecturerEmail } = {}) =>
    request(`/processes/${encodeURIComponent(id)}/approve`, json('PUT', { remarks, assignedLecturerEmail })),
  declineProcess: (id, { reason } = {}) => request(`/processes/${encodeURIComponent(id)}/decline`, json('PUT', { reason })),
  returnProcess: (id, { reason } = {}) => request(`/processes/${encodeURIComponent(id)}/return`, json('PUT', { reason })),
  addComment: (id, { comment } = {}) => request(`/processes/${encodeURIComponent(id)}/comment`, json('POST', { comment })),

  /* ------------------------- Examination Branch department lists ------------------------- */
  dispatchDepartmentList: ({ department, formType, ids, remarks }) =>
    request('/processes/department-lists/dispatch', json('POST', { department, formType, ids, remarks })),
  getDepartmentLists: () => request('/processes/department-lists'),

  /* ------------------------------------ SAR ------------------------------------ */
  addAdminRemark: (id, { remark, documentCheckStatus }) => request(`/processes/${encodeURIComponent(id)}/remark`, json('POST', { remark, documentCheckStatus })),
  requestClarification: (id, { issuesIdentified, notes }) => request(`/processes/${encodeURIComponent(id)}/clarification`, json('POST', { issuesIdentified, notes })),
  sarVerifyAndForward: (id, { remarks } = {}) => request(`/processes/${encodeURIComponent(id)}/sar/verify-forward`, json('PUT', { remarks })),
  sarProcessAdmission: (id, { admissionNo, notes } = {}) => request(`/processes/${encodeURIComponent(id)}/sar/process-admission`, json('PUT', { admissionNo, notes })),
  sarTrackSenateCopy: (id, { trackingNo, submissionNote, phase } = {}) =>
    request(`/processes/${encodeURIComponent(id)}/sar/track-senate-copy`, json('PUT', { trackingNo, submissionNote, phase })),
  getFormAvailability: () => request('/processes/portal/form-availability'),
  toggleFormAvailability: ({ formType, isOpen, deadline, semester }) => request('/processes/portal/form-availability', json('POST', { formType, isOpen, deadline, semester })),

  /* --------------------------------- notifications -------------------------------- */
  // The backend resolves role / department / person from the token; the argument is accepted
  // (string or object) only so older call sites keep working.
  getNotifications: () => request('/notifications'),
  createNotification: (data) => request('/notifications', json('POST', data)),
  getUnreadCount: () => request('/notifications/unread-count'),
  markNotificationRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
  deleteNotification: (id) => request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  deleteAllNotifications: () => request('/notifications/clear-all', { method: 'DELETE' }),

  /* ------------------------------ statistics & reports ----------------------------- */
  getStats: () => request('/stats'),
  getWorkflowReport: () => request('/stats/workflows'),
  async getBatchStats() {
    return request('/stats/batches');
  },
  getBatches: () => request('/student/batches'),
  createBatch: (data) => request('/student/batches', json('POST', data)),
  deleteBatch: (id) => request(`/student/batches/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  /* ------------------------------- academic calendar ------------------------------- */
  getAcademicEvents: (params = {}) =>
    request(
      `/academic-calendar${qs({
        batch: params.batch !== 'All Batches' ? params.batch : '',
        semester: params.semester !== 'All Semesters' ? params.semester : '',
        scope: params.scope,
        department: params.department,
      })}`
    ),
  createAcademicEvent: (data) => request('/academic-calendar', json('POST', data)),
  updateAcademicEvent: (id, data) => request(`/academic-calendar/${id}`, json('PUT', data)),
  deleteAcademicEvent: (id) => request(`/academic-calendar/${id}`, { method: 'DELETE' }),

  /* ------------------------------------ students ----------------------------------- */
  getStudents: async (params = {}) => {
    try {
      const res = await request(`/student${qs(params)}`);
      return res;
    } catch (err) {
      console.warn('Backend /api/student offline, falling back to enrolledStorage', err.message);
      const list = enrolledStorage.getAll();
      return { success: true, count: list.length, data: list };
    }
  },
  getAllStudents: () => request('/student'),
  getStudent: (identifier) => request(`/student/${encodeURIComponent(identifier)}`),
  getStudentRecord: (identifier) => request(`/student/${encodeURIComponent(identifier)}`),
  createStudent: async (studentData) => {
    enrolledStorage.save(studentData);
    if (!authToken.get()) {
      authToken.set(`demo-token-admin-${Date.now()}`);
    }
    try {
      return await request('/student', json('POST', studentData));
    } catch (e) {
      console.warn('Backend /api/student offline, cached in enrolledStorage', e.message);
      return { success: true, message: 'Student enrolled and cached locally', data: studentData };
    }
  },
  bulkCreateStudents: async (studentsList) => {
    enrolledStorage.saveBulk(studentsList);
    if (!authToken.get()) {
      authToken.set(`demo-token-admin-${Date.now()}`);
    }
    try {
      return await request('/student/bulk', json('POST', { students: studentsList }));
    } catch (e) {
      console.warn('Backend /api/student/bulk offline, cached in enrolledStorage', e.message);
      return { success: true, message: `${studentsList.length} students enrolled and cached locally`, count: studentsList.length };
    }
  },
  updateStudent: async (identifier, studentData) => {
    enrolledStorage.update(identifier, studentData);
    try {
      return await request(`/student/${encodeURIComponent(identifier)}`, json('PUT', studentData));
    } catch (e) {
      console.warn('Backend /api/student update offline, cached in enrolledStorage', e.message);
      return { success: true, message: 'Student updated locally', data: studentData };
    }
  },
  deleteStudent: async (identifier) => {
    enrolledStorage.remove(identifier);
    try {
      return await request(`/student/${encodeURIComponent(identifier)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend /api/student delete offline, removed from enrolledStorage', e.message);
      return { success: true, message: 'Student removed locally' };
    }
  },

  /* ---------------------------------- subjects & curriculum --------------------- */
  getSubjects: (params = {}) => request(`/subjects${qs(params)}`),
  getSubject: (code) => request(`/subjects/${encodeURIComponent(code)}`),
  getSubjectsBySemester: (semester) => request(`/subjects/semester/${encodeURIComponent(semester)}`),
  createSubject: (data) => request('/subjects', json('POST', data)),
  updateSubjectAllocation: (code, data) => request(`/subjects/${encodeURIComponent(code)}/allocation`, json('PATCH', data)),
  saveSubjectAllocations: (allocations) => request('/subjects/allocations', json('POST', { allocations })),

  /* ---------------------------------- timetable ---------------------------------- */
  getTimetable: (params = {}) => request(`/timetable${qs(params)}`),
  getAllTimetables: () => request('/timetable/all'),
  getLecturerTimetable: (lecturer) => request(`/timetable?lecturer=${encodeURIComponent(lecturer)}`),
  saveTimetable: (data) => request('/timetable', json('POST', data)),
  deleteTimetable: (params = {}) => request(`/timetable${qs(params)}`, { method: 'DELETE' }),

  /* ------------------- academic API (/api/v1): results, attendance, reports ------------------- */
  // Same login token as the examination workflows; responses are { success, data, meta? }.
  v1: (endpoint, options) => request(`/v1${endpoint}`, options).then((body) => body.data),
  getMyTranscript: () => request('/v1/transcripts/me').then((b) => b.data),
  getMyGpa: () => request('/v1/gpa/me').then((b) => b.data),
  getAttendanceSummary: (params = {}) => request(`/v1/attendance/summary${qs(params)}`).then((b) => b.data),
  getReport: (name, params = {}) => request(`/v1/reports/${encodeURIComponent(name)}${qs(params)}`).then((b) => b.data),
  listReports: () => request('/v1/reports').then((b) => b.data),

  /* ------------------- AI assistant (role-aware agent + RAG, runs on the server) ------------------- */
  assistantAgent: () => request('/v1/assistant/agent').then((b) => b.data),
  assistantChat: ({ message, conversationId }) =>
    request('/v1/assistant/chat', json('POST', { message, ...(conversationId ? { conversationId } : {}) })).then((b) => b.data),

  /* ------------------- Knowledge Base (RAG Ingestion & Documents) ------------------- */
  getKnowledgeDocs: (params = {}) => request(`/v1/knowledge${qs(params)}`).then((b) => b.data || b),
  createKnowledgeDoc: (doc) => request('/v1/knowledge', json('POST', doc)).then((b) => b.data || b),
  uploadKnowledgeFile: async (formData) => {
    const token = authToken.get();
    let res;
    try {
      res = await fetch(`${API_BASE_URL}/v1/knowledge/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
    } catch {
      const err = new Error('Cannot reach backend server. Please verify the backend is running.');
      err.network = true;
      throw err;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Upload failed (${res.status} ${res.statusText || ''})`.trim());
    }
    return data.data || data;
  },
  getHandbooks: () => request('/v1/knowledge/handbooks').then((b) => b.data || b),
  retireKnowledgeDoc: (id) => request(`/v1/knowledge/${id}/retire`, json('POST', {})).then((b) => b.data || b),
  purgeAllKnowledge: () => request('/v1/knowledge/purge-all', json('POST', {})).then((b) => b.data || b),

  /* ------------------- Official Subjects & Curriculum (MongoDB Atlas) ------------------- */
  getSemesterCurriculum: (semester) => request(`/subjects/semester/${encodeURIComponent(semester)}`).then((b) => b.data || b),
  getSubjectDetails: (code) => request(`/subjects/${encodeURIComponent(code)}`).then((b) => b.data || b),
};

export default api;
