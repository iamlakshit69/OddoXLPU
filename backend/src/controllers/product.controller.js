const { Op } = require("sequelize");
const { Product, Category, Stock, StockLocation, Warehouse } = require("../models");

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const { name, sku, categoryId, uom, reorderLevel, reorderQty } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ success: false, error: "name and sku are required" });
    }

    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      return res.status(409).json({ success: false, error: "A product with this SKU already exists" });
    }

    const product = await Product.create({
      name,
      sku,
      categoryId: categoryId || null,
      uom: uom || "PCS",
      reorderLevel: reorderLevel || 0,
      reorderQty: reorderQty || 0,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const { name, categoryId, uom, reorderLevel, reorderQty, isActive } = req.body;

    if (name !== undefined) product.name = name;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (uom !== undefined) product.uom = uom;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (reorderQty !== undefined) product.reorderQty = reorderQty;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// GET /api/products?search=&category=&warehouse=&lowStock=true
async function listProducts(req, res, next) {
  try {
    const { search, category, warehouse, lowStock } = req.query;

    const where = { isActive: true };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.categoryId = category;

    const stockInclude = {
      model: Stock,
      include: [
        {
          model: StockLocation,
          include: warehouse
            ? [{ model: Warehouse, where: { id: warehouse } }]
            : [{ model: Warehouse }],
        },
      ],
    };

    const products = await Product.findAll({
      where,
      include: [{ model: Category }, stockInclude],
      order: [["name", "ASC"]],
    });

    // Compute total stock per product and optionally filter to low-stock only
    let result = products.map((p) => {
      const totalStock = (p.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);
      return {
        ...p.toJSON(),
        totalStock,
        stockStatus:
          totalStock <= 0 ? "OUT_OF_STOCK" : totalStock <= p.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
      };
    });

    if (lowStock === "true") {
      result = result.filter((p) => p.stockStatus !== "IN_STOCK");
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Stock,
          include: [{ model: StockLocation, include: [{ model: Warehouse }] }],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/categories
async function listCategories(req, res, next) {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

// POST /api/products/categories
async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "name is required" });
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, error: "Category already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  listProducts,
  getProduct,
  listCategories,
  createCategory,
};
