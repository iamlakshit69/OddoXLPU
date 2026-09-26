const { Transaction } = require("sequelize");
const {
  sequelize,
  Receipt,
  ReceiptItem,
  Product,
  Warehouse,
  StockLocation,
} = require("../models");
const { moveStock } = require("../services/stock.service");

// ---------------------------------------------------------------------------
// POST /api/receipts
// Create a receipt in DRAFT status with one or more product lines.
// Does NOT touch stock. Stock is only changed when the receipt is validated.
// ---------------------------------------------------------------------------
async function createReceipt(req, res, next) {
  try {
    const { supplier, warehouseId, locationId, notes, items } = req.body;

    // ---- Basic field validation ----
    if (!supplier || String(supplier).trim() === "") {
      return res.status(400).json({ success: false, error: "supplier is required" });
    }
    if (!warehouseId) {
      return res.status(400).json({ success: false, error: "warehouseId is required" });
    }
    if (!locationId) {
      return res.status(400).json({ success: false, error: "locationId is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "items must be a non-empty array" });
    }

    // ---- Validate warehouse ----
    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ success: false, error: "Warehouse not found or inactive" });
    }

    // ---- Validate location ----
    const location = await StockLocation.findOne({
      where: { id: locationId, warehouseId },
    });
    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Location not found or does not belong to the specified warehouse",
      });
    }

    // ---- Validate each item ----
    const seenProductIds = new Set();
    const resolvedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const lineLabel = `items[${i}]`;

      if (!item.productId) {
        return res.status(400).json({ success: false, error: `${lineLabel}: productId is required` });
      }

      // Reject duplicate productId within the same receipt
      if (seenProductIds.has(item.productId)) {
        return res.status(400).json({
          success: false,
          error: `${lineLabel}: duplicate productId ${item.productId} — each product may appear only once per receipt`,
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

    // ---- Create receipt + items in a single transaction ----
    const receipt = await sequelize.transaction(async (t) => {
      const newReceipt = await Receipt.create(
        {
          supplier: String(supplier).trim(),
          warehouseId,
          locationId,
          status: "DRAFT",
          notes: notes || null,
          createdBy: req.user.id,
        },
        { transaction: t }
      );

      await ReceiptItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, receiptId: newReceipt.id })),
        { transaction: t }
      );

      return newReceipt;
    });

    // ---- Return the created receipt with its items ----
    const result = await Receipt.findByPk(receipt.id, {
      include: [
        { model: ReceiptItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/receipts/:id/validate
// Validate a DRAFT receipt. This is the ONLY place stock is increased
// for receipts. All stock movements use moveStock() from the stock service.
//
// Atomicity guarantee:
//   ONE Sequelize transaction wraps:
//     - Receipt status update
//     - Every moveStock() call (which writes Stock + StockLedger inside
//       the same transaction)
//   Either everything commits or everything rolls back.
// ---------------------------------------------------------------------------
async function validateReceipt(req, res, next) {
  try {
    const receiptId = req.params.id;

    await sequelize.transaction(async (t) => {
      // ---- Lock the receipt row to prevent concurrent double-validation ----
      // SELECT … FOR UPDATE ensures that if two requests try to validate the
      // same receipt simultaneously, one will wait for the other to finish.
      // After the first commits (status = VALIDATED) the second will read
      // the updated status and reject immediately.
      const receipt = await Receipt.findOne({
        where: { id: receiptId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!receipt) {
        const err = new Error("Receipt not found");
        err.status = 404;
        throw err;
      }

      if (receipt.status === "VALIDATED") {
        const err = new Error("Receipt has already been validated — stock has already been updated");
        err.status = 409;
        throw err;
      }

      if (receipt.status === "CANCELLED") {
        const err = new Error("Receipt is cancelled and cannot be validated");
        err.status = 409;
        throw err;
      }

      // ---- Load all receipt items ----
      const items = await ReceiptItem.findAll({
        where: { receiptId: receipt.id },
        transaction: t,
      });

      if (items.length === 0) {
        const err = new Error("Receipt has no items and cannot be validated");
        err.status = 400;
        throw err;
      }

      // ---- Call moveStock() for every item using the SAME transaction ----
      // If any single call throws, the transaction (and all prior calls) rolls
      // back automatically because we are inside sequelize.transaction().
      const stockResults = [];

      for (const item of items) {
        const result = await moveStock({
          productId: item.productId,
          locationId: receipt.locationId,
          warehouseId: receipt.warehouseId,
          quantityChange: Number(item.quantity), // always positive for a receipt
          transactionType: "RECEIPT",
          referenceType: "RECEIPT",
          referenceId: receipt.id,
          createdBy: req.user.id,
          transaction: t, // share this transaction — no commit inside moveStock
        });

        stockResults.push(result);
      }

      // ---- All stock movements succeeded; mark receipt as VALIDATED ----
      receipt.status = "VALIDATED";
      await receipt.save({ transaction: t });

      // sequelize.transaction() auto-commits here if no error was thrown.
      // Return value is accessible outside the transaction block.
      return { receipt, stockResults };
    }).then(async ({ receipt }) => {
      // ---- Build and send the response after commit ----
      const result = await Receipt.findByPk(receipt.id, {
        include: [
          { model: ReceiptItem, as: "items", include: [{ model: Product }] },
          { model: Warehouse },
          { model: StockLocation },
        ],
      });

      res.json({
        success: true,
        data: {
          receipt: result,
          message: `Receipt validated. Stock updated for ${result.items.length} product(s).`,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/receipts
// List all receipts. Newest first.
// ---------------------------------------------------------------------------
async function listReceipts(req, res, next) {
  try {
    const receipts = await Receipt.findAll({
      include: [
        { model: ReceiptItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: receipts });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/receipts/:id
// Get a single receipt by id.
// ---------------------------------------------------------------------------
async function getReceipt(req, res, next) {
  try {
    const receipt = await Receipt.findByPk(req.params.id, {
      include: [
        { model: ReceiptItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
    });

    if (!receipt) {
      return res.status(404).json({ success: false, error: "Receipt not found" });
    }

    res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReceipt, validateReceipt, listReceipts, getReceipt };
