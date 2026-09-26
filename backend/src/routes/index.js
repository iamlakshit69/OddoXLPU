const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const receiptRoutes = require("./receipt.routes");
const deliveryRoutes = require("./delivery.routes");
const transferRoutes = require("./transfer.routes");
const adjustmentRoutes = require("./adjustment.routes");
const warehouseRoutes = require("./warehouse.routes");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/receipts", receiptRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/transfers", transferRoutes);
router.use("/adjustments", adjustmentRoutes);
router.use("/warehouses", warehouseRoutes);

module.exports = router;
