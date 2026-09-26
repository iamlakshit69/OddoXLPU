const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    // TiDB Cloud / PlanetScale and most hosted MySQL require SSL in production
    dialectOptions: isProduction
      ? {
          ssl: {
            rejectUnauthorized: true,
          },
        }
      : {},
  }
);

module.exports = sequelize;
