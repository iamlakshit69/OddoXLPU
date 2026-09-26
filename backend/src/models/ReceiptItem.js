const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// One line inside a Receipt. Each line is one product with a quantity.
// Duplicate productIds in the same receipt are prevented at the controller level.
const ReceiptItem = sequelize.define(
  "ReceiptItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    // uom is copied from the product at creation time so the ledger reflects
    // the unit at the moment of receipt, even if the product's uom changes later.
    uom: {
      type: DataTypes.ENUM("PCS", "KG", "LITRE", "BOX", "METRE"),
      allowNull: false,
      defaultValue: "PCS",
    },
  },
  {
    tableName: "receipt_items",
    timestamps: true,
  }
);

module.exports = ReceiptItem;
