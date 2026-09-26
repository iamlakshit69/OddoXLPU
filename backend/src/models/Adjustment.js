const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Adjustment = sequelize.define(
  "Adjustment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "VALIDATED", "CANCELLED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "adjustments",
    timestamps: true,
  }
);

module.exports = Adjustment;
