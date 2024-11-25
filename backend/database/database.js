const sql = require("mssql");
const { config } = require("./config.js"); // Henter din konfiguration

const pool = new sql.ConnectionPool(config);

const connectToDatabase = async () => {
  try {
    await pool.connect();
    console.log("Database connection established");
    return pool; // Returnerer pool-objektet til brug i forespørgsler
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err; // Stopper, hvis der opstår fejl
  }
};

connectToDatabase()

module.exports = { connectToDatabase };