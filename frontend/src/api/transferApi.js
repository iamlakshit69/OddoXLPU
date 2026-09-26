import axiosClient from './axiosClient';

export const transferApi = {
  listTransfers: async () => {
    return await axiosClient.get('/transfers');
  },

  getTransfer: async (id) => {
    return await axiosClient.get(`/transfers/${id}`);
  },

  createTransfer: async (payload) => {
    return await axiosClient.post('/transfers', payload);
  },

  validateTransfer: async (id) => {
    return await axiosClient.post(`/transfers/${id}/validate`);
  },
};
