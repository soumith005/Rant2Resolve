
const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('r2r_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      this.handleNetworkError(error);
    }
  },

  async post(endpoint: string, body: any) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      this.handleNetworkError(error);
    }
  },

  async patch(endpoint: string, body: any) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      this.handleNetworkError(error);
    }
  },

  async handleResponse(response: Response) {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    return data;
  },

  async put(endpoint: string, body: any) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      this.handleNetworkError(error);
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      this.handleNetworkError(error);
    }
  },

  handleNetworkError(error: any) {
    console.error('API call failed:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please ensure the backend is running on http://localhost:5000');
    }
    throw error;
  }
};

// ==================== OPPORTUNITIES ====================
export const opportunityAPI = {
  async getAll() {
    const data = await api.get('/opportunities');
    // Map MongoDB _id to id for consistency
    return Array.isArray(data) ? data.map(opp => ({
      ...opp,
      id: opp._id || opp.id
    })) : data;
  },

  async getById(id: string) {
    const data = await api.get(`/opportunities/${id}`);
    return {
      ...data,
      id: data._id || data.id
    };
  },

  async create(opportunityData: any) {
    const data = await api.post('/opportunities', opportunityData);
    return {
      ...data,
      id: data._id || data.id
    };
  },

  async update(id: string, opportunityData: any) {
    const data = await api.put(`/opportunities/${id}`, opportunityData);
    return {
      ...data,
      id: data._id || data.id
    };
  },

  async delete(id: string) {
    return api.delete(`/opportunities/${id}`);
  },
};

// ==================== APPLICATIONS ====================
export const applicationAPI = {
  async apply(opportunityId: string, applicationData: any) {
    return api.post(`/applications/${opportunityId}/apply`, applicationData);
  },

  async getMyApplications() {
    return api.get('/applications/student/my-applications');
  },

  async checkApplicationStatus(opportunityId: string) {
    return api.get(`/applications/opportunity/${opportunityId}/status`);
  },

  async getAllApplications() {
    return api.get('/applications');
  },

  async updateApplicationStatus(id: string, status: string) {
    return api.patch(`/applications/${id}/status`, { status });
  },

  async deleteApplication(id: string) {
    return api.delete(`/applications/${id}`);
  },
};

// ==================== ANNOUNCEMENTS ====================
export const announcementAPI = {
  async getAll() {
    return api.get('/announcements');
  },

  async getById(id: string) {
    return api.get(`/announcements/${id}`);
  },

  async create(announcementData: any) {
    return api.post('/announcements', announcementData);
  },

  async update(id: string, announcementData: any) {
    return api.put(`/announcements/${id}`, announcementData);
  },

  async delete(id: string) {
    return api.delete(`/announcements/${id}`);
  },
};

// ==================== ISSUES ====================
export const issueAPI = {
  async getAll() {
    return api.get('/issues');
  },

  async getById(id: string) {
    return api.get(`/issues/${id}`);
  },

  async create(issueData: any) {
    return api.post('/issues', issueData);
  },

  async addReply(id: string, content: string) {
    return api.post(`/issues/${id}/replies`, { content });
  },

  async updateStatus(id: string, status: string) {
    return api.patch(`/issues/${id}/status`, { status });
  },
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  async getStats() {
    return api.get('/dashboard/stats');
  },
};

// ==================== NOTIFICATIONS ====================
export const notificationAPI = {
  async getAll() {
    const response = await api.get('/notifications');
    const data = response.data || response;
    return Array.isArray(data) ? data : [];
  },

  async getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  async markAsRead(notificationId: string) {
    return api.patch(`/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead() {
    return api.patch('/notifications/read-all', {});
  },

  async delete(notificationId: string) {
    return api.delete(`/notifications/${notificationId}`);
  }
};
