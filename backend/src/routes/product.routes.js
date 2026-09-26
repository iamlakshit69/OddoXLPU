const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/auth.middleware");
const {
  createProduct,
  updateProduct,
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
router.post("/", protect, allowRoles("MANAGER", "ADMIN"), createProduct);
router.put("/:id", protect, allowRoles("MANAGER", "ADMIN"), updateProduct);

module.exports = router;
