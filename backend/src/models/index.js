const sequelize = require("../config/database");

const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Warehouse = require("./Warehouse");
const StockLocation = require("./StockLocation");
const Stock = require("./Stock");
const StockLedger = require("./StockLedger");

// ---- Category <-> Product ----
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// ---- Warehouse <-> StockLocation ----
Warehouse.hasMany(StockLocation, { foreignKey: "warehouseId" });
StockLocation.belongsTo(Warehouse, { foreignKey: "warehouseId" });

// ---- Product/StockLocation <-> Stock ----
Product.hasMany(Stock, { foreignKey: "productId" });
Stock.belongsTo(Product, { foreignKey: "productId" });

StockLocation.hasMany(Stock, { foreignKey: "locationId" });
Stock.belongsTo(StockLocation, { foreignKey: "locationId" });

// ---- StockLedger relations ----
Product.hasMany(StockLedger, { foreignKey: "productId" });
StockLedger.belongsTo(Product, { foreignKey: "productId" });

StockLocation.hasMany(StockLedger, { foreignKey: "locationId" });
StockLedger.belongsTo(StockLocation, { foreignKey: "locationId" });

Warehouse.hasMany(StockLedger, { foreignKey: "warehouseId" });
StockLedger.belongsTo(Warehouse, { foreignKey: "warehouseId" });

User.hasMany(StockLedger, { foreignKey: "createdBy" });
StockLedger.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Warehouse,
  StockLocation,
  Stock,
  StockLedger,
};
