const { Transaction } = require("sequelize");
const {
  sequelize,
  Delivery,
  DeliveryItem,
  Product,
  Warehouse,
  StockLocation,
} = require("../models");
const { moveStock } = require("../services/stock.service");

// ---------------------------------------------------------------------------
// POST /api/deliveries
// Create a delivery in DRAFT status with one or more product lines.
// Does NOT touch stock.
// ---------------------------------------------------------------------------
async function createDelivery(req, res, next) {
  try {
    const { customer, warehouseId, locationId, notes, items } = req.body;

    if (!customer || String(customer).trim() === "") {
      return res.status(400).json({ success: false, error: "customer is required" });
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

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      return res.status(404).json({ success: false, error: "Warehouse not found or inactive" });
    }

    const location = await StockLocation.findOne({
      where: { id: locationId, warehouseId },
    });
    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Location not found or does not belong to the specified warehouse",
      });
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
          error: `${lineLabel}: duplicate productId ${item.productId} — each product may appear only once per delivery`,
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

    const delivery = await sequelize.transaction(async (t) => {
      const newDelivery = await Delivery.create(
        {
          customer: String(customer).trim(),
          warehouseId,
          locationId,
          status: "DRAFT",
          notes: notes || null,
          createdBy: req.user.id,
        },
        { transaction: t }
      );

      await DeliveryItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, deliveryId: newDelivery.id })),
        { transaction: t }
      );

      return newDelivery;
    });

    const result = await Delivery.findByPk(delivery.id, {
      include: [
        { model: DeliveryItem, as: "items", include: [{ model: Product }] },
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
// POST /api/deliveries/:id/pick
// ---------------------------------------------------------------------------
async function pickDelivery(req, res, next) {
  try {
    const deliveryId = req.params.id;
    
    await sequelize.transaction(async (t) => {
      const delivery = await Delivery.findOne({
        where: { id: deliveryId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!delivery) {
        const err = new Error("Delivery not found");
        err.status = 404;
        throw err;
      }

      if (delivery.status !== "DRAFT") {
        const err = new Error(`Cannot pick delivery in ${delivery.status} status. Must be DRAFT.`);
        err.status = 400;
        throw err;
      }

      delivery.status = "PICKED";
      await delivery.save({ transaction: t });
      return delivery;
    }).then((delivery) => {
      res.json({ success: true, data: delivery, message: "Delivery picked." });
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/deliveries/:id/pack
// ---------------------------------------------------------------------------
async function packDelivery(req, res, next) {
  try {
    const deliveryId = req.params.id;
    
    await sequelize.transaction(async (t) => {
      const delivery = await Delivery.findOne({
        where: { id: deliveryId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!delivery) {
        const err = new Error("Delivery not found");
        err.status = 404;
        throw err;
      }

      if (delivery.status !== "PICKED") {
        const err = new Error(`Cannot pack delivery in ${delivery.status} status. Must be PICKED.`);
        err.status = 400;
        throw err;
      }

      delivery.status = "PACKED";
      await delivery.save({ transaction: t });
      return delivery;
    }).then((delivery) => {
      res.json({ success: true, data: delivery, message: "Delivery packed." });
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/deliveries/:id/validate
// Validate a PACKED delivery. This decreases stock using moveStock.
// ---------------------------------------------------------------------------
async function validateDelivery(req, res, next) {
  try {
    const deliveryId = req.params.id;

    await sequelize.transaction(async (t) => {
      const delivery = await Delivery.findOne({
        where: { id: deliveryId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      if (!delivery) {
        const err = new Error("Delivery not found");
        err.status = 404;
        throw err;
      }

      if (delivery.status === "VALIDATED") {
        const err = new Error("Delivery has already been validated — stock has already been updated");
        err.status = 409;
        throw err;
      }
      
      if (delivery.status === "CANCELLED") {
        const err = new Error("Delivery is cancelled and cannot be validated");
        err.status = 409;
        throw err;
      }

      if (delivery.status !== "PACKED") {
        const err = new Error(`Cannot validate delivery in ${delivery.status} status. Must be PACKED.`);
        err.status = 400;
        throw err;
      }

      const items = await DeliveryItem.findAll({
        where: { deliveryId: delivery.id },
        transaction: t,
      });

      if (items.length === 0) {
        const err = new Error("Delivery has no items and cannot be validated");
        err.status = 400;
        throw err;
      }

      const stockResults = [];

      for (const item of items) {
        const result = await moveStock({
          productId: item.productId,
          locationId: delivery.locationId,
          warehouseId: delivery.warehouseId,
          quantityChange: -Number(item.quantity),
          transactionType: "DELIVERY",
          referenceType: "DELIVERY",
          referenceId: delivery.id,
          notes: delivery.notes || null,
          createdBy: req.user.id,
          transaction: t,
        });

        stockResults.push(result);
      }

      delivery.status = "VALIDATED";
      await delivery.save({ transaction: t });

      return { delivery, stockResults };
    }).then(async ({ delivery }) => {
      const result = await Delivery.findByPk(delivery.id, {
        include: [
          { model: DeliveryItem, as: "items", include: [{ model: Product }] },
          { model: Warehouse },
          { model: StockLocation },
        ],
      });

      res.json({
        success: true,
        data: {
          delivery: result,
          message: `Delivery validated. Stock updated for ${result.items.length} product(s).`,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/deliveries
// ---------------------------------------------------------------------------
async function listDeliveries(req, res, next) {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        { model: DeliveryItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: deliveries });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/deliveries/:id
// ---------------------------------------------------------------------------
async function getDelivery(req, res, next) {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        { model: DeliveryItem, as: "items", include: [{ model: Product }] },
        { model: Warehouse },
        { model: StockLocation },
      ],
    });

    if (!delivery) {
      return res.status(404).json({ success: false, error: "Delivery not found" });
    }

    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

module.exports = { createDelivery, pickDelivery, packDelivery, validateDelivery, listDeliveries, getDelivery };
