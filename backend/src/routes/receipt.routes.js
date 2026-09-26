const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createReceipt,
  validateReceipt,
  listReceipts,
  getReceipt,
} = require("../controllers/receipt.controller");

// Reading receipts — any authenticated user
router.get("/", protect, listReceipts);
router.get("/:id", protect, getReceipt);

// Creating and validating receipts — MANAGER or ADMIN only
// (same role restriction as creating products, matching existing project convention)
router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createReceipt);
router.post("/:id/validate", protect, allowRoles("MANAGER", "ADMIN"), validateReceipt);

module.exports = router;
