import axiosClient from './axiosClient';

export const warehouseApi = {
  listWarehouses: async () => {
    return await axiosClient.get('/warehouses');
  },

  createWarehouse: async (payload) => {
    return await axiosClient.post('/warehouses', payload);
  },

  listLocations: async (warehouseId) => {
    const params = warehouseId ? { warehouseId } : {};
    return await axiosClient.get('/warehouses/locations', { params });
  },

  createLocation: async (payload) => {
    return await axiosClient.post('/warehouses/locations', payload);
  },

  getDashboardStats: async () => {
    return await axiosClient.get('/warehouses/dashboard-stats');
  },

  getStockLedger: async () => {
    return await axiosClient.get('/warehouses/stock-ledger');
  },
};
