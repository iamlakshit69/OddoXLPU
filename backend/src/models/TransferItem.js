const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TransferItem = sequelize.define(
  "TransferItem",
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
    uom: {
      type: DataTypes.ENUM("PCS", "KG", "LITRE", "BOX", "METRE"),
      allowNull: false,
      defaultValue: "PCS",
    },
  },
  {
    tableName: "transfer_items",
    timestamps: true,
  }
);

module.exports = TransferItem;
