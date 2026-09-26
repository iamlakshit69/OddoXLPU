import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const warehouseApi = {
  listWarehouses: async () => {
    try {
      return await axiosClient.get('/warehouses');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.warehouses };
    }
  },

  createWarehouse: async (payload) => {
    try {
      return await axiosClient.post('/warehouses', payload);
    } catch (err) {
      const db = getMockDB();
      const newWh = {
        id: db.warehouses.length + 1,
        name: payload.name,
        code: payload.code,
        address: payload.address || null,
        isActive: true,
        StockLocations: [
          {
            id: Date.now(),
            name: "Main Stock",
            code: `${payload.code}/STOCK`,
            warehouseId: db.warehouses.length + 1,
          },
        ],
      };
      db.warehouses.push(newWh);
      saveMockDB(db);
      return { success: true, data: newWh };
    }
  },

  listLocations: async (warehouseId) => {
    try {
      const params = warehouseId ? { warehouseId } : {};
      return await axiosClient.get('/warehouses/locations', { params });
    } catch (err) {
      const db = getMockDB();
      let locs = [];
      db.warehouses.forEach((wh) => {
        if (!warehouseId || String(wh.id) === String(warehouseId)) {
          wh.StockLocations?.forEach((loc) => {
            locs.push({ ...loc, Warehouse: wh });
          });
        }
      });
      return { success: true, data: locs };
    }
  },

  createLocation: async (payload) => {
    try {
      return await axiosClient.post('/warehouses/locations', payload);
    } catch (err) {
      const db = getMockDB();
      const wh = db.warehouses.find((w) => String(w.id) === String(payload.warehouseId));
      if (!wh) throw new Error("Warehouse not found");
      const newLoc = {
        id: Date.now(),
        name: payload.name,
        code: payload.code,
        warehouseId: Number(payload.warehouseId),
      };
      if (!wh.StockLocations) wh.StockLocations = [];
      wh.StockLocations.push(newLoc);
      saveMockDB(db);
      return { success: true, data: newLoc };
    }
  },

  getDashboardStats: async () => {
    try {
      return await axiosClient.get('/warehouses/dashboard-stats');
    } catch (err) {
      const db = getMockDB();
      const totalProducts = db.products.filter((p) => p.isActive).length;
      let totalStockUnits = 0;
      let lowStockCount = 0;

      db.products.forEach((p) => {
        const qty = (p.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);
        totalStockUnits += qty;
        if (qty <= (p.reorderLevel || 0)) {
          lowStockCount++;
        }
      });

      const pendingReceipts = db.receipts.filter((r) => r.status === 'DRAFT').length;
      const pendingDeliveries = db.deliveries.filter((d) => d.status !== 'VALIDATED' && d.status !== 'CANCELLED').length;
      const pendingTransfers = db.transfers.filter((t) => t.status === 'DRAFT').length;
      const pendingAdjustments = db.adjustments.filter((a) => a.status === 'DRAFT').length;

      return {
        success: true,
        data: {
          totalProducts,
          totalStockUnits,
          lowStockCount,
          pendingReceipts,
          pendingDeliveries,
          pendingTransfers,
          pendingAdjustments,
          recentLedgers: db.ledgers.slice(0, 8),
        },
      };
    }
  },

  getStockLedger: async () => {
    try {
      return await axiosClient.get('/warehouses/stock-ledger');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.ledgers };
    }
  },
};
