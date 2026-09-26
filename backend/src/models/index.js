const sequelize = require("../config/database");

const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Warehouse = require("./Warehouse");
const StockLocation = require("./StockLocation");
const Stock = require("./Stock");
const StockLedger = require("./StockLedger");
const Receipt = require("./Receipt");
const ReceiptItem = require("./ReceiptItem");
const Delivery = require("./Delivery");
const DeliveryItem = require("./DeliveryItem");
const Transfer = require("./Transfer");
const TransferItem = require("./TransferItem");
const Adjustment = require("./Adjustment");
const AdjustmentItem = require("./AdjustmentItem");

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

// ---- Receipt relations ----
Warehouse.hasMany(Receipt, { foreignKey: "warehouseId" });
Receipt.belongsTo(Warehouse, { foreignKey: "warehouseId" });

StockLocation.hasMany(Receipt, { foreignKey: "locationId" });
Receipt.belongsTo(StockLocation, { foreignKey: "locationId" });

User.hasMany(Receipt, { foreignKey: "createdBy" });
Receipt.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ---- ReceiptItem relations ----
Receipt.hasMany(ReceiptItem, { foreignKey: "receiptId", as: "items" });
ReceiptItem.belongsTo(Receipt, { foreignKey: "receiptId" });

Product.hasMany(ReceiptItem, { foreignKey: "productId" });
ReceiptItem.belongsTo(Product, { foreignKey: "productId" });

// ---- Delivery relations ----
Warehouse.hasMany(Delivery, { foreignKey: "warehouseId" });
Delivery.belongsTo(Warehouse, { foreignKey: "warehouseId" });

StockLocation.hasMany(Delivery, { foreignKey: "locationId" });
Delivery.belongsTo(StockLocation, { foreignKey: "locationId" });

User.hasMany(Delivery, { foreignKey: "createdBy" });
Delivery.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ---- DeliveryItem relations ----
Delivery.hasMany(DeliveryItem, { foreignKey: "deliveryId", as: "items" });
DeliveryItem.belongsTo(Delivery, { foreignKey: "deliveryId" });

Product.hasMany(DeliveryItem, { foreignKey: "productId" });
DeliveryItem.belongsTo(Product, { foreignKey: "productId" });

// ---- Transfer relations ----
Warehouse.hasMany(Transfer, { foreignKey: "sourceWarehouseId", as: "sourceTransfers" });
Transfer.belongsTo(Warehouse, { foreignKey: "sourceWarehouseId", as: "sourceWarehouse" });

Warehouse.hasMany(Transfer, { foreignKey: "destinationWarehouseId", as: "destinationTransfers" });
Transfer.belongsTo(Warehouse, { foreignKey: "destinationWarehouseId", as: "destinationWarehouse" });

StockLocation.hasMany(Transfer, { foreignKey: "sourceLocationId", as: "sourceTransfers" });
Transfer.belongsTo(StockLocation, { foreignKey: "sourceLocationId", as: "sourceLocation" });

StockLocation.hasMany(Transfer, { foreignKey: "destinationLocationId", as: "destinationTransfers" });
Transfer.belongsTo(StockLocation, { foreignKey: "destinationLocationId", as: "destinationLocation" });

User.hasMany(Transfer, { foreignKey: "createdBy", as: "createdTransfers" });
Transfer.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ---- TransferItem relations ----
Transfer.hasMany(TransferItem, { foreignKey: "transferId", as: "items" });
TransferItem.belongsTo(Transfer, { foreignKey: "transferId" });

Product.hasMany(TransferItem, { foreignKey: "productId" });
TransferItem.belongsTo(Product, { foreignKey: "productId" });

// ---- Adjustment relations ----
Warehouse.hasMany(Adjustment, { foreignKey: "warehouseId" });
Adjustment.belongsTo(Warehouse, { foreignKey: "warehouseId" });

StockLocation.hasMany(Adjustment, { foreignKey: "locationId" });
Adjustment.belongsTo(StockLocation, { foreignKey: "locationId" });

User.hasMany(Adjustment, { foreignKey: "createdBy" });
Adjustment.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ---- AdjustmentItem relations ----
Adjustment.hasMany(AdjustmentItem, { foreignKey: "adjustmentId", as: "items" });
AdjustmentItem.belongsTo(Adjustment, { foreignKey: "adjustmentId" });

Product.hasMany(AdjustmentItem, { foreignKey: "productId" });
AdjustmentItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Warehouse,
  StockLocation,
  Stock,
  StockLedger,
  Receipt,
  ReceiptItem,
  Delivery,
  DeliveryItem,
  Transfer,
  TransferItem,
  Adjustment,
  AdjustmentItem,
};
