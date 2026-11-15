import api from './api';

export const classService = {
  getAll: async () => {
    const res = await api.get('/classes');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/classes/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/classes', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/classes/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/classes/${id}`);
    return res.data;
  },
};
