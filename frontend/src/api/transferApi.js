import axiosClient from './axiosClient';
import { getMockDB, saveMockDB } from './mockStore';

export const transferApi = {
  listTransfers: async () => {
    try {
      return await axiosClient.get('/transfers');
    } catch (err) {
      const db = getMockDB();
      return { success: true, data: db.transfers };
    }
  },

  getTransfer: async (id) => {
    try {
      return await axiosClient.get(`/transfers/${id}`);
    } catch (err) {
      const db = getMockDB();
      const transfer = db.transfers.find((t) => String(t.id) === String(id));
      if (!transfer) throw new Error("Transfer not found");
      return { success: true, data: transfer };
    }
  },

  createTransfer: async (payload) => {
    try {
      return await axiosClient.post('/transfers', payload);
    } catch (err) {
      const db = getMockDB();
      const srcWh = db.warehouses.find((w) => String(w.id) === String(payload.sourceWarehouseId));
      const destWh = db.warehouses.find((w) => String(w.id) === String(payload.destinationWarehouseId));
      const srcLoc = srcWh?.StockLocations?.find((l) => String(l.id) === String(payload.sourceLocationId));
      const destLoc = destWh?.StockLocations?.find((l) => String(l.id) === String(payload.destinationLocationId));

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

      const newTransfer = {
        id: db.transfers.length + 1,
        sourceWarehouseId: Number(payload.sourceWarehouseId),
        sourceLocationId: Number(payload.sourceLocationId),
        destinationWarehouseId: Number(payload.destinationWarehouseId),
        destinationLocationId: Number(payload.destinationLocationId),
        status: "DRAFT",
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
        sourceWarehouse: srcWh,
        sourceLocation: srcLoc,
        destinationWarehouse: destWh,
        destinationLocation: destLoc,
        items,
      };

      db.transfers.unshift(newTransfer);
      saveMockDB(db);
      return { success: true, data: newTransfer };
    }
  },

  validateTransfer: async (id) => {
    try {
      return await axiosClient.post(`/transfers/${id}/validate`);
    } catch (err) {
      const db = getMockDB();
      const transfer = db.transfers.find((t) => String(t.id) === String(id));
      if (!transfer) throw new Error("Transfer not found");
      if (transfer.status === "VALIDATED") throw new Error("Transfer already validated");

      // Verify source stock
      for (const item of transfer.items) {
        const prod = db.products.find((p) => String(p.id) === String(item.productId));
        const srcStock = prod?.Stocks?.find((s) => String(s.locationId) === String(transfer.sourceLocationId));
        const avail = srcStock ? Number(srcStock.quantity) : 0;
        if (avail < Number(item.quantity)) {
          throw new Error(`Insufficient stock at source location for ${prod?.name || 'Item'}. Available: ${avail}`);
        }
      }

      transfer.status = "VALIDATED";

      transfer.items.forEach((item) => {
        const product = db.products.find((p) => String(p.id) === String(item.productId));
        if (product) {
          // Source deduction
          const srcStock = product.Stocks.find((s) => String(s.locationId) === String(transfer.sourceLocationId));
          if (srcStock) {
            srcStock.quantity = Math.max(0, Number(srcStock.quantity) - Number(item.quantity));
          }

          // Dest addition
          let destStock = product.Stocks.find((s) => String(s.locationId) === String(transfer.destinationLocationId));
          if (destStock) {
            destStock.quantity = Number(destStock.quantity) + Number(item.quantity);
          } else {
            product.Stocks.push({
              id: Date.now() + Math.random(),
              productId: product.id,
              locationId: transfer.destinationLocationId,
              quantity: Number(item.quantity),
              StockLocation: transfer.destinationLocation,
            });
          }

          // Add ledgers
          db.ledgers.unshift({
            id: Date.now() + Math.random(),
            transactionType: "TRANSFER_OUT",
            quantityChange: -Number(item.quantity),
            resultingQuantity: product.totalStock,
            referenceType: "TRANSFER",
            referenceId: transfer.id,
            notes: `Transfer #${transfer.id} (Outbound to ${transfer.destinationWarehouse?.name})`,
            createdAt: new Date().toISOString(),
            Product: product,
            Warehouse: transfer.sourceWarehouse,
            StockLocation: transfer.sourceLocation,
            creator: { name: "Operations Lead" },
          });

          db.ledgers.unshift({
            id: Date.now() + Math.random() + 1,
            transactionType: "TRANSFER_IN",
            quantityChange: Number(item.quantity),
            resultingQuantity: product.totalStock,
            referenceType: "TRANSFER",
            referenceId: transfer.id,
            notes: `Transfer #${transfer.id} (Inbound from ${transfer.sourceWarehouse?.name})`,
            createdAt: new Date().toISOString(),
            Product: product,
            Warehouse: transfer.destinationWarehouse,
            StockLocation: transfer.destinationLocation,
            creator: { name: "Operations Lead" },
          });
        }
      });

      saveMockDB(db);
      return { success: true, data: { transfer, message: "Transfer validated. Stock relocated." } };
    }
  },
};
