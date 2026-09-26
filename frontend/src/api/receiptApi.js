import axiosClient from './axiosClient';

export const receiptApi = {
  listReceipts: async () => {
    return await axiosClient.get('/receipts');
  },

  getReceipt: async (id) => {
    return await axiosClient.get(`/receipts/${id}`);
  },

  createReceipt: async (payload) => {
    return await axiosClient.post('/receipts', payload);
  },

  validateReceipt: async (id) => {
    return await axiosClient.post(`/receipts/${id}/validate`);
  },
};
