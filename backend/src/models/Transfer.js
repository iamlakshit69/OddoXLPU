const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transfer = sequelize.define(
  "Transfer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sourceWarehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sourceLocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destinationWarehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destinationLocationId: {
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
    tableName: "transfers",
    timestamps: true,
  }
);

module.exports = Transfer;
