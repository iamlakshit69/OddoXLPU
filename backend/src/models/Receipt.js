const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// A Receipt represents an inbound stock event from a supplier.
// Status flow:  DRAFT → VALIDATED (or CANCELLED)
// Only VALIDATED receipts trigger stock movements; the actual stock changes
// are performed by the stock service, not here.
const Receipt = sequelize.define(
  "Receipt",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier: {
      type: DataTypes.STRING,
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
  },
  {
    tableName: "receipts",
    timestamps: true,
  }
);

module.exports = Receipt;
