import axiosClient from './axiosClient';

export const adjustmentApi = {
  listAdjustments: async () => {
    return await axiosClient.get('/adjustments');
  },

  getAdjustment: async (id) => {
    return await axiosClient.get(`/adjustments/${id}`);
  },

  createAdjustment: async (payload) => {
    return await axiosClient.post('/adjustments', payload);
  },

  validateAdjustment: async (id) => {
    return await axiosClient.post(`/adjustments/${id}/validate`);
  },
};
