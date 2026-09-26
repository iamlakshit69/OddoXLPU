const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Delivery = sequelize.define(
  "Delivery",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "PICKED", "PACKED", "VALIDATED", "CANCELLED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "deliveries",
    timestamps: true,
  }
);

module.exports = Delivery;
