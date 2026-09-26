import axiosClient from './axiosClient';

export const authApi = {
  signup: async (payload) => {
    return await axiosClient.post('/auth/signup', payload);
  },

  login: async (payload) => {
    return await axiosClient.post('/auth/login', payload);
  },

  forgotPassword: async (payload) => {
    return await axiosClient.post('/auth/forgot-password', payload);
  },

  resetPassword: async (payload) => {
    return await axiosClient.post('/auth/reset-password', payload);
  },

  getMe: async () => {
    return await axiosClient.get('/auth/me');
  },
};
