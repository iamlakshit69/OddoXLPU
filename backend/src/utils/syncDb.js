// Run with: npm run db:sync
// Creates/updates all tables based on the Sequelize models.
// For a hackathon this is fine; for anything longer-lived, switch to
// proper Sequelize migrations instead of { alter: true }.
require("dotenv").config();
const { sequelize } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await sequelize.sync({ alter: true });
    console.log("All tables synced successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync database:", err);
    process.exit(1);
  }
})();
