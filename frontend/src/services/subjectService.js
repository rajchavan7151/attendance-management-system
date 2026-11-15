import api from './api';

export const subjectService = {
  getAll: async (params = {}) => {
    const res = await api.get('/subjects', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/subjects', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};
