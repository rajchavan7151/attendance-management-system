import api from './api';

export const dashboardService = {
  getAdminStats: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },

  getTeacherStats: async () => {
    const res = await api.get('/dashboard/teacher');
    return res.data;
  },

  getStudentStats: async () => {
    const res = await api.get('/dashboard/student');
    return res.data;
  },
};
