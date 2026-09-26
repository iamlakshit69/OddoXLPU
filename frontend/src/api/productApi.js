import axiosClient from './axiosClient';

export const productApi = {
  listProducts: async (params = {}) => {
    return await axiosClient.get('/products', { params });
  },

  getProduct: async (id) => {
    return await axiosClient.get(`/products/${id}`);
  },

  createProduct: async (payload) => {
    return await axiosClient.post('/products', payload);
  },

  updateProduct: async (id, payload) => {
    return await axiosClient.put(`/products/${id}`, payload);
  },

  listCategories: async () => {
    return await axiosClient.get('/products/categories');
  },

  createCategory: async (payload) => {
    return await axiosClient.post('/products/categories', payload);
  },

  adjustStock: async (id, payload) => {
    return await axiosClient.post(`/products/${id}/adjust-stock`, payload);
  },
};
