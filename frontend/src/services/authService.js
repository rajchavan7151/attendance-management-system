import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/auth/users/${userId}/toggle-status`);
    return response.data;
  },
};
