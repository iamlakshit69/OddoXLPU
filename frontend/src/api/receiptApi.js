import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const receiptApi = {
  listReceipts: async () => {
    try {
      return await axiosClient.get('/receipts');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.receipts };
    }
  },

  getReceipt: async (id) => {
    try {
      return await axiosClient.get(`/receipts/${id}`);
    } catch (err) {
      const db = getMockDB();
      const receipt = db.receipts.find((r) => String(r.id) === String(id));
      if (!receipt) throw new Error("Receipt not found");
      return { success: true, data: receipt };
    }
  },

  createReceipt: async (payload) => {
    try {
      return await axiosClient.post('/receipts', payload);
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

      const newReceipt = {
        id: db.receipts.length + 1,
        supplier: payload.supplier,
        warehouseId: Number(payload.warehouseId),
        locationId: Number(payload.locationId),
        status: "DRAFT",
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
        Warehouse: warehouse,
        StockLocation: location,
        items,
      };

      db.receipts.unshift(newReceipt);
      saveMockDB(db);
      return { success: true, data: newReceipt };
    }
  },

  validateReceipt: async (id) => {
    try {
      return await axiosClient.post(`/receipts/${id}/validate`);
    } catch (err) {
      const db = getMockDB();
      const receipt = db.receipts.find((r) => String(r.id) === String(id));
      if (!receipt) throw new Error("Receipt not found");
      if (receipt.status === "VALIDATED") throw new Error("Receipt already validated");

      receipt.status = "VALIDATED";

      // Update product inventory & append stock ledger
      receipt.items.forEach((item) => {
        const product = db.products.find((p) => String(p.id) === String(item.productId));
        if (product) {
          product.totalStock = (product.totalStock || 0) + Number(item.quantity);
          product.stockStatus = product.totalStock <= 0 ? "OUT_OF_STOCK" : product.totalStock <= product.reorderLevel ? "LOW_STOCK" : "IN_STOCK";

          let stockEntry = product.Stocks.find((s) => String(s.locationId) === String(receipt.locationId));
          if (stockEntry) {
            stockEntry.quantity = Number(stockEntry.quantity) + Number(item.quantity);
          } else {
            product.Stocks.push({
              id: Date.now(),
              productId: product.id,
              locationId: receipt.locationId,
              quantity: Number(item.quantity),
              StockLocation: receipt.StockLocation,
            });
          }

          db.ledgers.unshift({
            id: Date.now() + Math.random(),
            transactionType: "RECEIPT",
            quantityChange: Number(item.quantity),
            resultingQuantity: product.totalStock,
            referenceType: "RECEIPT",
            referenceId: receipt.id,
            notes: `Receipt #${receipt.id} from ${receipt.supplier}`,
            createdAt: new Date().toISOString(),
            Product: product,
            Warehouse: receipt.Warehouse,
            StockLocation: receipt.StockLocation,
            creator: { name: "Operations Lead" },
          });
        }
      });

      saveMockDB(db);
      return { success: true, data: { receipt, message: "Receipt validated successfully. Stock updated." } };
    }
  },
};
