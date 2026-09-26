const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Current quantity snapshot. This table is ONLY ever written to by the
// stock service inside a transaction that also writes a StockLedger row.
// Never update this table directly from a controller.
const Stock = sequelize.define(
  "Stock",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "stock",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["productId", "locationId"],
      },
    ],
  }
);

module.exports = Stock;
