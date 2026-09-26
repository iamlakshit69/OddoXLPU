const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createProduct,
  updateProduct,
  adjustProductStock,
  listProducts,
  getProduct,
  listCategories,
  createCategory,
} = require("../controllers/product.controller");

// Categories (declared before /:id so "categories" isn't treated as an id)
router.get("/categories", protect, listCategories);
router.post("/categories", protect, allowRoles("MANAGER", "ADMIN"), createCategory);

router.get("/", protect, listProducts);
router.get("/:id", protect, getProduct);
router.post("/", protect, allowRoles("MANAGER", "ADMIN", "WAREHOUSE_STAFF"), createProduct);
router.put("/:id", protect, allowRoles("MANAGER", "ADMIN", "WAREHOUSE_STAFF"), updateProduct);
router.post("/:id/adjust-stock", protect, allowRoles("MANAGER", "ADMIN", "WAREHOUSE_STAFF"), adjustProductStock);

module.exports = router;
