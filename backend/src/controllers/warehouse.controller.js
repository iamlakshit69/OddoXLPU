const {
  Warehouse,
  StockLocation,
  Stock,
  StockLedger,
  Product,
  Receipt,
  Delivery,
  Transfer,
  Adjustment,
} = require("../models");

// GET /api/warehouses
async function listWarehouses(req, res, next) {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: StockLocation }],
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    next(err);
  }
}

// POST /api/warehouses
async function createWarehouse(req, res, next) {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: "name and code are required" });
    }

    const existing = await Warehouse.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({ success: false, error: "A warehouse with this code already exists" });
    }

    const warehouse = await Warehouse.create({ name, code, address: address || null });

    // Auto-create a default main stock location
    await StockLocation.create({
      name: "Main Stock",
      code: `${code}/STOCK`,
      warehouseId: warehouse.id,
    });

    const result = await Warehouse.findByPk(warehouse.id, {
      include: [{ model: StockLocation }],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/warehouses/locations?warehouseId=
async function listLocations(req, res, next) {
  try {
    const { warehouseId } = req.query;
    const where = warehouseId ? { warehouseId } : {};
    const locations = await StockLocation.findAll({
      where,
      include: [{ model: Warehouse }],
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
}

// POST /api/warehouses/locations
async function createLocation(req, res, next) {
  try {
    const { name, code, warehouseId } = req.body;
    if (!name || !code || !warehouseId) {
      return res.status(400).json({ success: false, error: "name, code, and warehouseId are required" });
    }

    const warehouse = await Warehouse.findByPk(warehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, error: "Warehouse not found" });
    }

    const location = await StockLocation.create({ name, code, warehouseId });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

// GET /api/warehouses/dashboard-stats
async function getDashboardStats(req, res, next) {
  try {
    const [
      totalProducts,
      allStocks,
      lowStockProducts,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
      pendingAdjustments,
      recentLedgers,
    ] = await Promise.all([
      Product.count({ where: { isActive: true } }),
      Stock.findAll(),
      Product.findAll({
        where: { isActive: true },
        include: [{ model: Stock }],
      }),
      Receipt.count({ where: { status: "DRAFT" } }),
      Delivery.count({ where: { status: ["DRAFT", "PICKED", "PACKED"] } }),
      Transfer.count({ where: { status: "DRAFT" } }),
      Adjustment.count({ where: { status: "DRAFT" } }),
      StockLedger.findAll({
        limit: 8,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Product },
          { model: Warehouse },
          { model: StockLocation },
        ],
      }),
    ]);

    const totalStockUnits = allStocks.reduce((sum, s) => sum + Number(s.quantity), 0);

    const lowStockCount = lowStockProducts.filter((p) => {
      const qty = (p.Stocks || []).reduce((sum, s) => sum + Number(s.quantity), 0);
      return qty <= p.reorderLevel;
    }).length;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStockUnits,
        lowStockCount,
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers,
        pendingAdjustments,
        recentLedgers,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/warehouses/stock-ledger
async function getStockLedger(req, res, next) {
  try {
    const ledgers = await StockLedger.findAll({
      order: [["createdAt", "DESC"]],
      limit: 200,
      include: [
        { model: Product },
        { model: Warehouse },
        { model: StockLocation },
      ],
    });
    res.json({ success: true, data: ledgers });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listWarehouses,
  createWarehouse,
  listLocations,
  createLocation,
  getDashboardStats,
  getStockLedger,
};
