const { Op } = require("sequelize");
const { Product, Category, Stock, StockLocation, Warehouse } = require("../models");
const { moveStock } = require("../services/stock.service");

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const { name, sku, categoryId, uom, reorderLevel, reorderQty, initialStock, locationId } = req.body;

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

    // If initial stock was provided, record it via moveStock
    if (initialStock && Number(initialStock) > 0 && locationId) {
      const location = await StockLocation.findByPk(locationId);
      if (location) {
        await moveStock({
          productId: product.id,
          locationId: location.id,
          warehouseId: location.warehouseId,
          quantityChange: Number(initialStock),
          transactionType: "RECEIPT",
          referenceType: "RECEIPT",
          referenceId: product.id,
          notes: `Initial inventory on creation for ${product.name} (${product.sku})`,
          createdBy: req.user ? req.user.id : null,
        });
      }
    }

    // Re-fetch product with stock associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category },
        {
          model: Stock,
          include: [{ model: StockLocation, include: [{ model: Warehouse }] }],
        },
      ],
    });

    const totalStock = (createdProduct.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);
    const result = {
      ...createdProduct.toJSON(),
      totalStock,
      stockStatus:
        totalStock <= 0 ? "OUT_OF_STOCK" : totalStock <= createdProduct.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
    };

    res.status(201).json({ success: true, data: result });
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

    const { name, categoryId, uom, reorderLevel, reorderQty, isActive, stockUpdates } = req.body;

    if (name !== undefined) product.name = name;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (uom !== undefined) product.uom = uom;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (reorderQty !== undefined) product.reorderQty = reorderQty;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    // Process stock adjustments if stockUpdates array is provided
    // format: [{ locationId: 1, quantity: 50 }, ...]
    if (Array.isArray(stockUpdates)) {
      for (const update of stockUpdates) {
        const locId = Number(update.locationId);
        const targetQty = Number(update.quantity);
        if (!locId || isNaN(targetQty) || targetQty < 0) continue;

        const currentStock = await Stock.findOne({
          where: { productId: product.id, locationId: locId },
        });
        const currentQty = currentStock ? Number(currentStock.quantity) : 0;
        const diff = targetQty - currentQty;

        if (diff !== 0) {
          const location = await StockLocation.findByPk(locId);
          await moveStock({
            productId: product.id,
            locationId: locId,
            warehouseId: location ? location.warehouseId : null,
            quantityChange: diff,
            transactionType: "ADJUSTMENT",
            referenceType: "ADJUSTMENT",
            referenceId: product.id,
            notes: `Inventory adjustment for ${product.name} (${product.sku}) via Products Catalog`,
            createdBy: req.user ? req.user.id : null,
          });
        }
      }
    }

    // Re-fetch product with updated stock
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category },
        {
          model: Stock,
          include: [{ model: StockLocation, include: [{ model: Warehouse }] }],
        },
      ],
    });

    const totalStock = (updatedProduct.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);
    const result = {
      ...updatedProduct.toJSON(),
      totalStock,
      stockStatus:
        totalStock <= 0 ? "OUT_OF_STOCK" : totalStock <= updatedProduct.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
    };

    res.json({ success: true, data: result });
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

// POST /api/products/:id/adjust-stock
async function adjustProductStock(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const { locationId, quantityChange, targetQuantity, notes } = req.body;
    const locId = Number(locationId);

    if (!locId) {
      return res.status(400).json({ success: false, error: "locationId is required" });
    }

    const location = await StockLocation.findByPk(locId);
    if (!location) {
      return res.status(404).json({ success: false, error: "Stock location not found" });
    }

    let diff = 0;
    if (targetQuantity !== undefined && targetQuantity !== null && !isNaN(Number(targetQuantity))) {
      const currentStock = await Stock.findOne({
        where: { productId: product.id, locationId: locId },
      });
      const currentQty = currentStock ? Number(currentStock.quantity) : 0;
      diff = Number(targetQuantity) - currentQty;
    } else if (quantityChange !== undefined && quantityChange !== null && !isNaN(Number(quantityChange))) {
      diff = Number(quantityChange);
    } else {
      return res.status(400).json({
        success: false,
        error: "Either targetQuantity or quantityChange must be specified",
      });
    }

    if (diff === 0) {
      return res.json({ success: true, message: "No change in stock required", data: product });
    }

    const movement = await moveStock({
      productId: product.id,
      locationId: locId,
      warehouseId: location.warehouseId,
      quantityChange: diff,
      transactionType: "ADJUSTMENT",
      referenceType: "ADJUSTMENT",
      referenceId: product.id,
      notes: notes || `Direct stock adjustment for ${product.name} (${product.sku})`,
      createdBy: req.user ? req.user.id : null,
    });

    // Re-fetch product
    const refreshed = await Product.findByPk(product.id, {
      include: [
        { model: Category },
        {
          model: Stock,
          include: [{ model: StockLocation, include: [{ model: Warehouse }] }],
        },
      ],
    });

    const totalStock = (refreshed.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);

    res.json({
      success: true,
      data: {
        product: {
          ...refreshed.toJSON(),
          totalStock,
          stockStatus:
            totalStock <= 0 ? "OUT_OF_STOCK" : totalStock <= refreshed.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
        },
        movement,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  adjustProductStock,
  listProducts,
  getProduct,
  listCategories,
  createCategory,
};
