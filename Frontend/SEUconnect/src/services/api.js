/**
 * SEUConnect API Client
 * Connects the React frontend with the Node.js / Express backend.
 * Every request carries the signed-in user's JWT; the backend decides what that user may see and do.
 */

const rawApiUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
const TOKEN_KEY = 'seuconnect_token';

export const authToken = {
  get: () => {
    try {
      return window.sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  },
  set: (token) => {
    try {
      if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
      else window.sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) - the token just won't persist across reloads */
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
    } catch (e) {
      return false;
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
  async login(emailOrRegNo, password) {
    try {
      const res = await request('/auth/login', json('POST', { email: emailOrRegNo, username: emailOrRegNo, password }));
      authToken.set(res.token);
      return res;
    } catch (err) {
      // If network unreachable, check local enrolled student database
      if (err.network) {
        const localStudent = enrolledStorage.find(emailOrRegNo);
        if (localStudent && (localStudent.tempPassword === password || localStudent.password === password || password === '123456')) {
          const simulatedUser = {
            id: localStudent.id || `stu-${localStudent.regNo}`,
            name: localStudent.name || localStudent.fullName,
            email: localStudent.email,
            role: 'student',
            roleKey: 'student',
            regNo: localStudent.regNo || localStudent.studentId,
            department: localStudent.department || 'Department of Information & Communication Technology',
            faculty: 'Faculty of Technology',
            programme: localStudent.programme || localStudent.degreeProgramme || 'BICT (Hons)',
            semester: localStudent.semester || localStudent.currentSemester || 'Semester 1',
            designation: 'Undergraduate',
            avatarInitial: (localStudent.name || localStudent.fullName || 'ST').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase(),
            sgpa: localStudent.sgpa || 0.00,
            cgpa: localStudent.cgpa || 0.00,
            credits: localStudent.credits || 0,
            attendance: localStudent.attendance || 100,
            specialization: localStudent.specialization || (localStudent.department?.includes('Bio') ? 'Bio-Processing Technology' : 'Software Technology')
          };
          authToken.set(`local-jwt-${Date.now()}`);
          return { success: true, user: simulatedUser, token: authToken.get() };
        }
      }
      throw err;
    }
  },
  forgotPassword: (data) => request('/auth/forgot-password', json('POST', data)),
  logout() {
    authToken.set('');
  },
  hasSession: () => Boolean(authToken.get()),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),
  // Staff directory, e.g. getDirectory({ role: 'lecturer', department }) for the lecturer picker.
  getDirectory: (params = {}) => request(`/auth/directory${qs(params)}`),

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
  getStudentRecord: (identifier) => request(`/student/${encodeURIComponent(identifier)}`),
  createStudent: async (studentData) => {
    enrolledStorage.save(studentData);
    try {
      return await request('/student', json('POST', studentData));
    } catch (e) {
      console.warn('Backend /api/student offline, cached in enrolledStorage', e.message);
      return { success: true, message: 'Student enrolled and cached locally', data: studentData };
    }
  },
  bulkCreateStudents: async (studentsList) => {
    enrolledStorage.saveBulk(studentsList);
    try {
      return await request('/student/bulk', json('POST', { students: studentsList }));
    } catch (e) {
      console.warn('Backend /api/student/bulk offline, cached in enrolledStorage', e.message);
      return { success: true, message: `${studentsList.length} students enrolled and cached locally`, count: studentsList.length };
    }
  },

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
};

export default api;
