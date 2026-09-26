import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const deliveryApi = {
  listDeliveries: async () => {
    try {
      return await axiosClient.get('/deliveries');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.deliveries };
    }
  },

  getDelivery: async (id) => {
    try {
      return await axiosClient.get(`/deliveries/${id}`);
    } catch (err) {
      const db = getMockDB();
      const delivery = db.deliveries.find((d) => String(d.id) === String(id));
      if (!delivery) throw new Error("Delivery not found");
      return { success: true, data: delivery };
    }
  },

  createDelivery: async (payload) => {
    try {
      return await axiosClient.post('/deliveries', payload);
    } catch (err) {
      const db = getMockDB();
      const warehouse = db.warehouses.find((w) => String(w.id) === String(payload.warehouseId));
      let location = null;
      if (warehouse) {
        location = warehouse.StockLocations?.find((l) => String(l.id) === String(payload.locationId));
      }

      const items = payload.items.map((item, idx) => {
        const prod = db.products.find((p) => String(p.id) === String(item.productId));
        return {
          id: Date.now() + idx,
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          uom: prod?.uom || 'PCS',
          Product: prod,
        };
      });

      const newDelivery = {
        id: db.deliveries.length + 1,
        customer: payload.customer,
        warehouseId: Number(payload.warehouseId),
        locationId: Number(payload.locationId),
        status: "DRAFT",
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
        Warehouse: warehouse,
        StockLocation: location,
        items,
      };

      db.deliveries.unshift(newDelivery);
      saveMockDB(db);
      return { success: true, data: newDelivery };
    }
  },

  pickDelivery: async (id) => {
    try {
      return await axiosClient.post(`/deliveries/${id}/pick`);
    } catch (err) {
      const db = getMockDB();
      const delivery = db.deliveries.find((d) => String(d.id) === String(id));
      if (!delivery) throw new Error("Delivery not found");
      if (delivery.status !== "DRAFT") throw new Error("Delivery must be in DRAFT to pick");
      delivery.status = "PICKED";
      saveMockDB(db);
      return { success: true, data: delivery, message: "Delivery picked successfully." };
    }
  },

  packDelivery: async (id) => {
    try {
      return await axiosClient.post(`/deliveries/${id}/pack`);
    } catch (err) {
      const db = getMockDB();
      const delivery = db.deliveries.find((d) => String(d.id) === String(id));
      if (!delivery) throw new Error("Delivery not found");
      if (delivery.status !== "PICKED") throw new Error("Delivery must be PICKED to pack");
      delivery.status = "PACKED";
      saveMockDB(db);
      return { success: true, data: delivery, message: "Delivery packed successfully." };
    }
  },

  validateDelivery: async (id) => {
    try {
      return await axiosClient.post(`/deliveries/${id}/validate`);
    } catch (err) {
      const db = getMockDB();
      const delivery = db.deliveries.find((d) => String(d.id) === String(id));
      if (!delivery) throw new Error("Delivery not found");
      if (delivery.status === "VALIDATED") throw new Error("Delivery already validated");

      // Check stock sufficiency
      for (const item of delivery.items) {
        const prod = db.products.find((p) => String(p.id) === String(item.productId));
        const stockEntry = prod?.Stocks?.find((s) => String(s.locationId) === String(delivery.locationId));
        const available = stockEntry ? Number(stockEntry.quantity) : 0;
        if (available < Number(item.quantity)) {
          throw new Error(`Insufficient stock for ${prod?.name || 'Product'}. Available: ${available}, Requested: ${item.quantity}`);
        }
      }

      // Deduct stock
      delivery.status = "VALIDATED";
      delivery.items.forEach((item) => {
        const product = db.products.find((p) => String(p.id) === String(item.productId));
        if (product) {
          product.totalStock = Math.max(0, (product.totalStock || 0) - Number(item.quantity));
          product.stockStatus = product.totalStock <= 0 ? "OUT_OF_STOCK" : product.totalStock <= product.reorderLevel ? "LOW_STOCK" : "IN_STOCK";

          const stockEntry = product.Stocks.find((s) => String(s.locationId) === String(delivery.locationId));
          if (stockEntry) {
            stockEntry.quantity = Math.max(0, Number(stockEntry.quantity) - Number(item.quantity));
          }

          db.ledgers.unshift({
            id: Date.now() + Math.random(),
            transactionType: "DELIVERY",
            quantityChange: -Number(item.quantity),
            resultingQuantity: product.totalStock,
            referenceType: "DELIVERY",
            referenceId: delivery.id,
            notes: `Delivery #${delivery.id} to ${delivery.customer}`,
            createdAt: new Date().toISOString(),
            Product: product,
            Warehouse: delivery.Warehouse,
            StockLocation: delivery.StockLocation,
            creator: { name: "Operations Lead" },
          });
        }
      });

      saveMockDB(db);
      return { success: true, data: { delivery, message: "Delivery validated and dispatched." } };
    }
  },
};
