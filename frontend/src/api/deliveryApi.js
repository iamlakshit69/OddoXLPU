import axiosClient from './axiosClient';

export const deliveryApi = {
  listDeliveries: async () => {
    return await axiosClient.get('/deliveries');
  },

  getDelivery: async (id) => {
    return await axiosClient.get(`/deliveries/${id}`);
  },

  createDelivery: async (payload) => {
    return await axiosClient.post('/deliveries', payload);
  },

  pickDelivery: async (id) => {
    return await axiosClient.post(`/deliveries/${id}/pick`);
  },

  packDelivery: async (id) => {
    return await axiosClient.post(`/deliveries/${id}/pack`);
  },

  validateDelivery: async (id) => {
    return await axiosClient.post(`/deliveries/${id}/validate`);
  },
};
