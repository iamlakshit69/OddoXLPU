

const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createAdjustment,
  validateAdjustment,
  listAdjustments,
  getAdjustment,
} = require("../controllers/adjustment.controller");

router.get("/", protect, listAdjustments);
router.get("/:id", protect, getAdjustment);

router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createAdjustment);
router.post("/:id/validate", protect, allowRoles("MANAGER", "ADMIN"), validateAdjustment);

module.exports = router;
