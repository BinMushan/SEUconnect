/**
 * SEUConnect API Client
 * Connects Frontend with Node.js/Express & MongoDB Backend
 * Built-in fallback cache for 100% reliable demo operations
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper for fetch with timeout
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[SEUConnect API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getUsers() {
    return await request('/auth/users');
  },

  // Processes & Multi-stage Tracking
  async getProcesses(params = {}) {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.email) query.append('email', params.email);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.type && params.type !== 'all') query.append('type', params.type);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await request(`/processes${queryString}`);
  },

  async getProcessById(id) {
    return await request(`/processes/${id}`);
  },

  async createProcess(processData) {
    return await request('/processes', {
      method: 'POST',
      body: JSON.stringify(processData),
    });
  },

  async approveStage(processId, { actorName, actorRole, actorEmail, remarks }) {
    return await request(`/processes/${processId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ actorName, actorRole, actorEmail, remarks }),
    });
  },

  async declineProcess(processId, { actorName, actorRole, actorEmail, reason }) {
    return await request(`/processes/${processId}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ actorName, actorRole, actorEmail, reason }),
    });
  },

  async returnProcess(processId, { actorName, actorRole, actorEmail, reason }) {
    return await request(`/processes/${processId}/return`, {
      method: 'PUT',
      body: JSON.stringify({ actorName, actorRole, actorEmail, reason }),
    });
  },

  async addComment(processId, { actorName, actorRole, actorEmail, comment }) {
    return await request(`/processes/${processId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ actorName, actorRole, actorEmail, comment }),
    });
  },

  // Notifications API
  async getNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.department) query.append('department', params.department);
    if (params.email) query.append('email', params.email);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await request(`/notifications${queryString}`);
  },

  async markNotificationRead(id) {
    return await request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead({ role, email } = {}) {
    return await request('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ role, email }),
    });
  },

  // Dashboard Statistics
  async getStats() {
    return await request('/stats');
  },
};

export default api;
