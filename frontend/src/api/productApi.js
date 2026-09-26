import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const productApi = {
  listProducts: async (params = {}) => {
    try {
      return await axiosClient.get('/products', { params });
    } catch (err) {
      const db = getMockDB();
      let list = [...db.products];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (params.category) {
        list = list.filter((p) => String(p.categoryId) === String(params.category));
      }
      if (params.lowStock === 'true') {
        list = list.filter((p) => p.stockStatus !== 'IN_STOCK');
      }
      return { success: true, data: list };
    }
  },

  getProduct: async (id) => {
    try {
      return await axiosClient.get(`/products/${id}`);
    } catch (err) {
      const db = getMockDB();
      const product = db.products.find((p) => String(p.id) === String(id));
      if (!product) throw new Error("Product not found");
      return { success: true, data: product };
    }
  },

  createProduct: async (payload) => {
    try {
      return await axiosClient.post('/products', payload);
    } catch (err) {
      const db = getMockDB();
      const cat = db.categories.find((c) => String(c.id) === String(payload.categoryId));
      const newProduct = {
        id: db.products.length + 1,
        name: payload.name,
        sku: payload.sku,
        categoryId: payload.categoryId ? Number(payload.categoryId) : null,
        uom: payload.uom || 'PCS',
        reorderLevel: Number(payload.reorderLevel) || 0,
        reorderQty: Number(payload.reorderQty) || 0,
        isActive: true,
        Category: cat || null,
        Stocks: [],
        totalStock: 0,
        stockStatus: "OUT_OF_STOCK",
      };
      db.products.push(newProduct);
      saveMockDB(db);
      return { success: true, data: newProduct };
    }
  },

  updateProduct: async (id, payload) => {
    try {
      return await axiosClient.put(`/products/${id}`, payload);
    } catch (err) {
      const db = getMockDB();
      const index = db.products.findIndex((p) => String(p.id) === String(id));
      if (index === -1) throw new Error("Product not found");
      const current = db.products[index];
      const cat = payload.categoryId ? db.categories.find((c) => String(c.id) === String(payload.categoryId)) : current.Category;
      const updated = {
        ...current,
        ...payload,
        Category: cat,
      };
      db.products[index] = updated;
      saveMockDB(db);
      return { success: true, data: updated };
    }
  },

  listCategories: async () => {
    try {
      return await axiosClient.get('/products/categories');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.categories };
    }
  },

  createCategory: async (payload) => {
    try {
      return await axiosClient.post('/products/categories', payload);
    } catch (err) {
      const db = getMockDB();
      const newCat = { id: db.categories.length + 1, name: payload.name };
      db.categories.push(newCat);
      saveMockDB(db);
      return { success: true, data: newCat };
    }
  },
};
