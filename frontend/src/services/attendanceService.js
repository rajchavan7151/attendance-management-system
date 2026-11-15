import api from './api';

export const attendanceService = {
  markAttendance: async (payload) => {
    const res = await api.post('/attendance/mark', payload);
    return res.data;
  },

  getRecords: async (params = {}) => {
    const res = await api.get('/attendance', { params });
    return res.data;
  },

  updateRecord: async (id, data) => {
    const res = await api.put(`/attendance/${id}`, data);
    return res.data;
  },

  getStudentSummary: async (studentId = '') => {
    const endpoint = studentId ? `/attendance/student-summary/${studentId}` : '/attendance/student-summary';
    const res = await api.get(endpoint);
    return res.data;
  },

  getClassReport: async (classId, subjectId = '') => {
    const res = await api.get(`/attendance/class-report/${classId}`, {
      params: subjectId ? { subjectId } : {},
    });
    return res.data;
  },
};
