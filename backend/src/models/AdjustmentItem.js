const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdjustmentItem = sequelize.define(
  "AdjustmentItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adjustmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recordedQuantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    physicalQuantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    quantityChange: {
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
    tableName: "adjustment_items",
    timestamps: true,
  }
);

module.exports = AdjustmentItem;
