const { Transaction } = require("sequelize");
const {
  sequelize,
  Adjustment,
  AdjustmentItem,
  Product,
  Warehouse,
  StockLocation,
  Stock,
  User,
} = require("../models");
const { moveStock } = require("../services/stock.service");

// POST /api/adjustments
async function createAdjustment(req, res, next) {
  try {
    const { warehouseId, locationId, notes, items } = req.body;

    if (!warehouseId || !locationId) {
      return res.status(400).json({ success: false, error: "warehouseId and locationId are required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "items must be a non-empty array" });
    }

    // Validate warehouse
    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ success: false, error: "Warehouse not found or inactive" });
    }

    // Validate location
    const location = await StockLocation.findOne({ where: { id: locationId, warehouseId } });
    if (!location) {
      return res.status(404).json({ success: false, error: "Location not found or does not belong to specified warehouse" });
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
          error: `${lineLabel}: duplicate productId ${item.productId} — each product may appear only once per adjustment`,
        });
      }
      seenProductIds.add(item.productId);

      if (item.physicalQuantity === undefined || item.physicalQuantity === null || isNaN(Number(item.physicalQuantity))) {
        return res.status(400).json({ success: false, error: `${lineLabel}: physicalQuantity must be a valid number` });
      }
      if (Number(item.physicalQuantity) < 0) {
        return res.status(400).json({ success: false, error: `${lineLabel}: physicalQuantity cannot be negative` });
      }

      const product = await Product.findOne({ where: { id: item.productId, isActive: true } });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `${lineLabel}: Product ${item.productId} not found or inactive`,
        });
      }
      
      const stock = await Stock.findOne({ where: { productId: item.productId, locationId: locationId } });
      const recordedQuantity = stock ? Number(stock.quantity) : 0;
      const quantityChange = Number(item.physicalQuantity) - recordedQuantity;

      resolvedItems.push({ 
        productId: item.productId, 
        recordedQuantity, 
        physicalQuantity: Number(item.physicalQuantity),
        quantityChange, 
        uom: product.uom 
      });
    }

    const adjustment = await sequelize.transaction(async (t) => {
      const newAdjustment = await Adjustment.create(
        {
          warehouseId,
          locationId,
          status: "DRAFT",
          notes: notes || null,
          createdBy: req.user.id,
        },
        { transaction: t }
      );

      await AdjustmentItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, adjustmentId: newAdjustment.id })),
        { transaction: t }
      );

      return newAdjustment;
    });

    const result = await Adjustment.findByPk(adjustment.id, {
      include: [
        { model: AdjustmentItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// POST /api/adjustments/:id/validate
async function validateAdjustment(req, res, next) {
  try {
    const adjustmentId = req.params.id;

    await sequelize.transaction(async (t) => {
      const adjustment = await Adjustment.findOne({
        where: { id: adjustmentId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!adjustment) {
        const err = new Error("Adjustment not found");
        err.status = 404;
        throw err;
      }

      if (adjustment.status === "VALIDATED") {
        const err = new Error("Adjustment has already been validated");
        err.status = 409;
        throw err;
      }
      
      if (adjustment.status === "CANCELLED") {
        const err = new Error("Adjustment is cancelled and cannot be validated");
        err.status = 400; 
        throw err;
      }

      if (adjustment.status !== "DRAFT") {
        const err = new Error(`Cannot validate adjustment in ${adjustment.status} status. Must be DRAFT.`);
        err.status = 400;
        throw err;
      }

      const items = await AdjustmentItem.findAll({
        where: { adjustmentId: adjustment.id },
        transaction: t,
      });

      if (items.length === 0) {
        const err = new Error("Adjustment has no items and cannot be validated");
        err.status = 400;
        throw err;
      }

      for (const item of items) {
        const qtyChange = Number(item.quantityChange);
        if (qtyChange !== 0) {
           await moveStock({
             productId: item.productId,
             locationId: adjustment.locationId,
             warehouseId: adjustment.warehouseId,
             quantityChange: qtyChange,
             transactionType: "ADJUSTMENT",
             referenceType: "ADJUSTMENT",
             referenceId: adjustment.id,
             notes: adjustment.notes || null,
             createdBy: req.user.id,
             transaction: t,
           });
        }
      }

      adjustment.status = "VALIDATED";
      await adjustment.save({ transaction: t });

      return adjustment;
    }).then(async (adjustment) => {
      const result = await Adjustment.findByPk(adjustment.id, {
        include: [
          { model: AdjustmentItem, as: "items", include: [{ model: Product }] },
          { model: Warehouse },
          { model: StockLocation },
        ],
      });

      res.json({
        success: true,
        data: {
          adjustment: result,
          message: `Adjustment validated.`,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/adjustments
async function listAdjustments(req, res, next) {
  try {
    const adjustments = await Adjustment.findAll({
      include: [
        { model: AdjustmentItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: adjustments });
  } catch (err) {
    next(err);
  }
}

// GET /api/adjustments/:id
async function getAdjustment(req, res, next) {
  try {
    const adjustment = await Adjustment.findByPk(req.params.id, {
      include: [
        { model: AdjustmentItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ],
    });

    if (!adjustment) {
      return res.status(404).json({ success: false, error: "Adjustment not found" });
    }

    res.json({ success: true, data: adjustment });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAdjustment, validateAdjustment, listAdjustments, getAdjustment };
