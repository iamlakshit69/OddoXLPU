const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Append-only. Every stock-affecting operation (Receipt, Delivery, Transfer,
// Adjustment) writes exactly one row per product/location it touches.
// This table should never be updated or deleted from - it's the audit trail.
const StockLedger = sequelize.define(
  "StockLedger",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionType: {
      type: DataTypes.ENUM(
        "RECEIPT",
        "DELIVERY",
        "TRANSFER_IN",
        "TRANSFER_OUT",
        "ADJUSTMENT"
      ),
      allowNull: false,
    },
    quantityChange: {
      // positive for increases, negative for decreases
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    resultingQuantity: {
      // stock at this location right after this entry was applied
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    referenceType: {
      // e.g. "RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"
      type: DataTypes.STRING,
      allowNull: false,
    },
    referenceId: {
      // id of the header row (Receipt.id, Delivery.id, etc.) once those modules exist
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "stock_ledger",
    timestamps: true,
    updatedAt: false, // append-only, no need to track updates
  }
);

module.exports = StockLedger;
