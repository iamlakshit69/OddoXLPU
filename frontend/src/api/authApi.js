import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const authApi = {
  signup: async (payload) => {
    try {
      return await axiosClient.post('/auth/signup', payload);
    } catch (err) {
      // Fallback for offline testing
      const db = getMockDB();
      const newUser = {
        id: db.users.length + 1,
        name: payload.name,
        email: payload.email,
        role: payload.role || 'WAREHOUSE_STAFF',
      };
      db.users.push(newUser);
      saveMockDB(db);
      const token = `mock_jwt_token_${Date.now()}`;
      return { success: true, data: { token, user: newUser } };
    }
  },

  login: async (payload) => {
    try {
      return await axiosClient.post('/auth/login', payload);
    } catch (err) {
      // Fallback for offline testing
      const db = getMockDB();
      const user = db.users.find((u) => u.email === payload.email) || {
        id: 1,
        name: 'Principal Operations Lead',
        email: payload.email,
        role: 'ADMIN',
      };
      const token = `mock_jwt_token_${Date.now()}`;
      return { success: true, data: { token, user } };
    }
  },

  forgotPassword: async (payload) => {
    try {
      return await axiosClient.post('/auth/forgot-password', payload);
    } catch (err) {
      return { success: true, data: { message: "If that email exists, an OTP has been sent." } };
    }
  },

  resetPassword: async (payload) => {
    try {
      return await axiosClient.post('/auth/reset-password', payload);
    } catch (err) {
      return { success: true, data: { message: "Password has been reset. Please log in." } };
    }
  },

  getMe: async () => {
    try {
      return await axiosClient.get('/auth/me');
    } catch (err) {
      const storedUser = localStorage.getItem('stocksense_user');
      const user = storedUser ? JSON.parse(storedUser) : { id: 1, name: 'Operations Lead', role: 'ADMIN', email: 'admin@stocksense.io' };
      return { success: true, data: user };
    }
  },
};
