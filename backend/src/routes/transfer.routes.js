const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createTransfer,
  validateTransfer,
  listTransfers,
  getTransfer,
} = require("../controllers/transfer.controller");

// Reading transfers — any authenticated user
router.get("/", protect, listTransfers);
router.get("/:id", protect, getTransfer);

// Creating and validating transfers — MANAGER or ADMIN only
router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createTransfer);
router.post("/:id/validate", protect, allowRoles("MANAGER", "ADMIN"), validateTransfer);

module.exports = router;
