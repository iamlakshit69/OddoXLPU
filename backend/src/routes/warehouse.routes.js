const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  listWarehouses,
  createWarehouse,
  listLocations,
  createLocation,
  getDashboardStats,
  getStockLedger,
} = require("../controllers/warehouse.controller");

// Dashboard & Ledger (must come before /:id to avoid param conflicts)
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/stock-ledger", protect, getStockLedger);

// Locations
router.get("/locations", protect, listLocations);
router.post("/locations", protect, allowRoles("MANAGER", "ADMIN"), createLocation);

// Warehouses
router.get("/", protect, listWarehouses);
router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createWarehouse);

module.exports = router;
