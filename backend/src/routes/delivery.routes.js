const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createDelivery,
  pickDelivery,
  packDelivery,
  validateDelivery,
  listDeliveries,
  getDelivery,
} = require("../controllers/delivery.controller");

// Reading deliveries — any authenticated user
router.get("/", protect, listDeliveries);
router.get("/:id", protect, getDelivery);

// Creating and validating deliveries — MANAGER or ADMIN only
router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createDelivery);
router.post("/:id/pick", protect, allowRoles("MANAGER", "ADMIN"), pickDelivery);
router.post("/:id/pack", protect, allowRoles("MANAGER", "ADMIN"), packDelivery);
router.post("/:id/validate", protect, allowRoles("MANAGER", "ADMIN"), validateDelivery);

module.exports = router;
