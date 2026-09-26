const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// A rack/shelf/zone inside a warehouse
const StockLocation = sequelize.define(
  "StockLocation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "stock_locations",
    timestamps: true,
  }
);

module.exports = StockLocation;
