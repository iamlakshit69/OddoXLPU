const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const receiptRoutes = require("./receipt.routes");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/receipts", receiptRoutes);

// Future modules plug in here the same way:
// router.use("/deliveries", deliveryRoutes);
// router.use("/transfers", transferRoutes);
// router.use("/adjustments", adjustmentRoutes);
// router.use("/stock-ledger", stockLedgerRoutes);
// router.use("/warehouses", warehouseRoutes);
// router.use("/dashboard", dashboardRoutes);

module.exports = router;
