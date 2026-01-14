const API_BASE = '/api';

export const api = {
  auth: {
    register: async (email: string, name: string, masterCode: string) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, masterCode }),
      });
      return response.json();
    },

    login: async (email: string, masterCode: string) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, masterCode }),
      });
      return response.json();
    },

    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.json();
    },

    resetPassword: async (token: string, newMasterCode: string) => {
      const response = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newMasterCode }),
      });
      return response.json();
    },
  },

  users: {
    getMe: async () => {
      const response = await fetch(`${API_BASE}/users/me`);
      return response.json();
    },

    updateProfile: async (data: { name?: string; email?: string }) => {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      const response = await fetch(`${API_BASE}/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return response.json();
    },
  },

  devices: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/devices`);
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE}/devices/${id}`);
      return response.json();
    },

    create: async (device: any) => {
      const response = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
      });
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_BASE}/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE}/devices/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    sendAction: async (id: string, action: string, value?: any) => {
      const response = await fetch(`${API_BASE}/devices/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      return response.json();
    },
  },

  dashboard: {
    getSummary: async () => {
      const response = await fetch(`${API_BASE}/dashboard/summary`);
      return response.json();
    },

    getActivity: async () => {
      const response = await fetch(`${API_BASE}/dashboard/activity`);
      return response.json();
    },
  },

  household: {
    getMembers: async () => {
      const response = await fetch(`${API_BASE}/household/members`);
      return response.json();
    },

    inviteMember: async (email: string, role: string) => {
      const response = await fetch(`${API_BASE}/household/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      return response.json();
    },

    removeMember: async (userId: string) => {
      const response = await fetch(`${API_BASE}/household/members/${userId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },

  activity: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/profile/activity`);
      return response.json();
    },

    getSessions: async () => {
      const response = await fetch(`${API_BASE}/profile/sessions`);
      return response.json();
    },

    terminateSession: async (sessionId: string) => {
      const response = await fetch(`${API_BASE}/profile/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },

  cameras: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/cameras`);
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE}/cameras/${id}`);
      return response.json();
    },

    startRecording: async (id: string) => {
      const response = await fetch(`${API_BASE}/cameras/${id}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      return response.json();
    },

    stopRecording: async (id: string) => {
      const response = await fetch(`${API_BASE}/cameras/${id}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      return response.json();
    },
  },
};
