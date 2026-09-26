import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const adjustmentApi = {
  listAdjustments: async () => {
    try {
      return await axiosClient.get('/adjustments');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.adjustments };
    }
  },

  getAdjustment: async (id) => {
    try {
      return await axiosClient.get(`/adjustments/${id}`);
    } catch (err) {
      const db = getMockDB();
      const adj = db.adjustments.find((a) => String(a.id) === String(id));
      if (!adj) throw new Error("Adjustment not found");
      return { success: true, data: adj };
    }
  },

  createAdjustment: async (payload) => {
    try {
      return await axiosClient.post('/adjustments', payload);
    } catch (err) {
      const db = getMockDB();
      const warehouse = db.warehouses.find((w) => String(w.id) === String(payload.warehouseId));
      let location = null;
      if (warehouse) {
        location = warehouse.StockLocations?.find((l) => String(l.id) === String(payload.locationId));
      }

      const items = payload.items.map((item, idx) => {
        const prod = db.products.find((p) => String(p.id) === String(item.productId));
        const stockEntry = prod?.Stocks?.find((s) => String(s.locationId) === String(payload.locationId));
        const recordedQuantity = stockEntry ? Number(stockEntry.quantity) : 0;
        const physicalQuantity = Number(item.physicalQuantity);
        const quantityChange = physicalQuantity - recordedQuantity;

        return {
          id: Date.now() + idx,
          productId: Number(item.productId),
          recordedQuantity,
          physicalQuantity,
          quantityChange,
          uom: prod?.uom || 'PCS',
          Product: prod,
        };
      });

      const newAdjustment = {
        id: db.adjustments.length + 1,
        warehouseId: Number(payload.warehouseId),
        locationId: Number(payload.locationId),
        status: "DRAFT",
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
        Warehouse: warehouse,
        StockLocation: location,
        items,
      };

      db.adjustments.unshift(newAdjustment);
      saveMockDB(db);
      return { success: true, data: newAdjustment };
    }
  },

  validateAdjustment: async (id) => {
    try {
      return await axiosClient.post(`/adjustments/${id}/validate`);
    } catch (err) {
      const db = getMockDB();
      const adj = db.adjustments.find((a) => String(a.id) === String(id));
      if (!adj) throw new Error("Adjustment not found");
      if (adj.status === "VALIDATED") throw new Error("Adjustment already validated");

      adj.status = "VALIDATED";

      adj.items.forEach((item) => {
        const product = db.products.find((p) => String(p.id) === String(item.productId));
        if (product) {
          const qtyChange = Number(item.quantityChange);
          product.totalStock = Math.max(0, (product.totalStock || 0) + qtyChange);
          product.stockStatus = product.totalStock <= 0 ? "OUT_OF_STOCK" : product.totalStock <= product.reorderLevel ? "LOW_STOCK" : "IN_STOCK";

          let stockEntry = product.Stocks.find((s) => String(s.locationId) === String(adj.locationId));
          if (stockEntry) {
            stockEntry.quantity = Math.max(0, Number(stockEntry.quantity) + qtyChange);
          } else {
            product.Stocks.push({
              id: Date.now() + Math.random(),
              productId: product.id,
              locationId: adj.locationId,
              quantity: Math.max(0, qtyChange),
              StockLocation: adj.StockLocation,
            });
          }

          if (qtyChange !== 0) {
            db.ledgers.unshift({
              id: Date.now() + Math.random(),
              transactionType: "ADJUSTMENT",
              quantityChange: qtyChange,
              resultingQuantity: product.totalStock,
              referenceType: "ADJUSTMENT",
              referenceId: adj.id,
              notes: `Stock Variance Count: ${qtyChange > 0 ? '+' : ''}${qtyChange} ${item.uom}`,
              createdAt: new Date().toISOString(),
              Product: product,
              Warehouse: adj.Warehouse,
              StockLocation: adj.StockLocation,
              creator: { name: "Audit Inspector" },
            });
          }
        }
      });

      saveMockDB(db);
      return { success: true, data: { adjustment: adj, message: "Adjustment validated and stock ledger updated." } };
    }
  },
};
