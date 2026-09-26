const { Transaction } = require("sequelize");
const {
  sequelize,
  Transfer,
  TransferItem,
  Product,
  Warehouse,
  StockLocation,
  User,
} = require("../models");
const { moveStock } = require("../services/stock.service");

// ---------------------------------------------------------------------------
// POST /api/transfers
// Create a transfer in DRAFT status. Does NOT touch stock.
// ---------------------------------------------------------------------------
async function createTransfer(req, res, next) {
  try {
    const { sourceWarehouseId, sourceLocationId, destinationWarehouseId, destinationLocationId, notes, items } = req.body;

    if (!sourceWarehouseId || !sourceLocationId || !destinationWarehouseId || !destinationLocationId) {
      return res.status(400).json({ success: false, error: "All source and destination warehouse and location IDs are required" });
    }

    if (sourceWarehouseId === destinationWarehouseId && sourceLocationId === destinationLocationId) {
      return res.status(400).json({ success: false, error: "Source and destination cannot be the exact same location" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "items must be a non-empty array" });
    }

    // Validate warehouses
    const srcWarehouse = await Warehouse.findOne({ where: { id: sourceWarehouseId, isActive: true } });
    const destWarehouse = await Warehouse.findOne({ where: { id: destinationWarehouseId, isActive: true } });
    if (!srcWarehouse || !destWarehouse) {
      return res.status(404).json({ success: false, error: "One or both warehouses not found or inactive" });
    }

    // Validate locations
    const srcLocation = await StockLocation.findOne({ where: { id: sourceLocationId, warehouseId: sourceWarehouseId } });
    const destLocation = await StockLocation.findOne({ where: { id: destinationLocationId, warehouseId: destinationWarehouseId } });
    if (!srcLocation || !destLocation) {
      return res.status(404).json({ success: false, error: "One or both locations not found or do not belong to specified warehouse" });
    }

    const seenProductIds = new Set();
    const resolvedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const lineLabel = `items[${i}]`;

      if (!item.productId) {
        return res.status(400).json({ success: false, error: `${lineLabel}: productId is required` });
      }

      if (seenProductIds.has(item.productId)) {
        return res.status(400).json({
          success: false,
          error: `${lineLabel}: duplicate productId ${item.productId} — each product may appear only once per transfer`,
        });
      }
      seenProductIds.add(item.productId);

      if (item.quantity === undefined || item.quantity === null || isNaN(Number(item.quantity))) {
        return res.status(400).json({ success: false, error: `${lineLabel}: quantity must be a valid number` });
      }
      if (Number(item.quantity) <= 0) {
        return res.status(400).json({ success: false, error: `${lineLabel}: quantity must be greater than zero` });
      }

      const product = await Product.findOne({ where: { id: item.productId, isActive: true } });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `${lineLabel}: Product ${item.productId} not found or inactive`,
        });
      }

      resolvedItems.push({ productId: item.productId, quantity: Number(item.quantity), uom: product.uom });
    }

    const transfer = await sequelize.transaction(async (t) => {
      const newTransfer = await Transfer.create(
        {
          sourceWarehouseId,
          sourceLocationId,
          destinationWarehouseId,
          destinationLocationId,
          status: "DRAFT",
          notes: notes || null,
          createdBy: req.user.id,
        },
        { transaction: t }
      );

      await TransferItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, transferId: newTransfer.id })),
        { transaction: t }
      );

      return newTransfer;
    });

    const result = await Transfer.findByPk(transfer.id, {
      include: [
        { model: TransferItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse, as: "sourceWarehouse" },
        { model: StockLocation, as: "sourceLocation" },
        { model: Warehouse, as: "destinationWarehouse" },
        { model: StockLocation, as: "destinationLocation" },
      ],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/transfers/:id/validate
// Validate a DRAFT transfer. This decreases source stock and increases dest stock.
// ---------------------------------------------------------------------------
async function validateTransfer(req, res, next) {
  try {
    const transferId = req.params.id;

    await sequelize.transaction(async (t) => {
      const transfer = await Transfer.findOne({
        where: { id: transferId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!transfer) {
        const err = new Error("Transfer not found");
        err.status = 404;
        throw err;
      }

      if (transfer.status === "VALIDATED") {
        const err = new Error("Transfer has already been validated");
        err.status = 409;
        throw err;
      }
      
      if (transfer.status === "CANCELLED") {
        const err = new Error("Transfer is cancelled and cannot be validated");
        err.status = 400; // Requirement mentions 400 or appropriate conflict for cancelled
        throw err;
      }

      if (transfer.status !== "DRAFT") {
        const err = new Error(`Cannot validate transfer in ${transfer.status} status. Must be DRAFT.`);
        err.status = 400;
        throw err;
      }

      const items = await TransferItem.findAll({
        where: { transferId: transfer.id },
        transaction: t,
      });

      if (items.length === 0) {
        const err = new Error("Transfer has no items and cannot be validated");
        err.status = 400;
        throw err;
      }

      for (const item of items) {
        // TRANSFER_OUT from Source
        await moveStock({
          productId: item.productId,
          locationId: transfer.sourceLocationId,
          warehouseId: transfer.sourceWarehouseId,
          quantityChange: -Number(item.quantity),
          transactionType: "TRANSFER_OUT",
          referenceType: "TRANSFER",
          referenceId: transfer.id,
          notes: transfer.notes || null,
          createdBy: req.user.id,
          transaction: t,
        });

        // TRANSFER_IN to Destination
        await moveStock({
          productId: item.productId,
          locationId: transfer.destinationLocationId,
          warehouseId: transfer.destinationWarehouseId,
          quantityChange: Number(item.quantity),
          transactionType: "TRANSFER_IN",
          referenceType: "TRANSFER",
          referenceId: transfer.id,
          notes: transfer.notes || null,
          createdBy: req.user.id,
          transaction: t,
        });
      }

      transfer.status = "VALIDATED";
      await transfer.save({ transaction: t });

      return transfer;
    }).then(async (transfer) => {
      const result = await Transfer.findByPk(transfer.id, {
        include: [
          { model: TransferItem, as: "items", include: [{ model: Product }] },
          { model: Warehouse, as: "sourceWarehouse" },
          { model: StockLocation, as: "sourceLocation" },
          { model: Warehouse, as: "destinationWarehouse" },
          { model: StockLocation, as: "destinationLocation" },
        ],
      });

      res.json({
        success: true,
        data: {
          transfer: result,
          message: `Transfer validated. Stock transferred for ${result.items.length} product(s).`,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/transfers
// ---------------------------------------------------------------------------
async function listTransfers(req, res, next) {
  try {
    const transfers = await Transfer.findAll({
      include: [
        { model: TransferItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse, as: "sourceWarehouse" },
        { model: StockLocation, as: "sourceLocation" },
        { model: Warehouse, as: "destinationWarehouse" },
        { model: StockLocation, as: "destinationLocation" },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: transfers });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/transfers/:id
// ---------------------------------------------------------------------------
async function getTransfer(req, res, next) {
  try {
    const transfer = await Transfer.findByPk(req.params.id, {
      include: [
        { model: TransferItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse, as: "sourceWarehouse" },
        { model: StockLocation, as: "sourceLocation" },
        { model: Warehouse, as: "destinationWarehouse" },
        { model: StockLocation, as: "destinationLocation" },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ],
    });

    if (!transfer) {
      return res.status(404).json({ success: false, error: "Transfer not found" });
    }

    res.json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTransfer, validateTransfer, listTransfers, getTransfer };
