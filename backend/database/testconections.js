const sql = require("mssql");

const config = {
  user: "a-mahy23ab",
  password: "gWAxz$-Ge:&X6=8",
  server: "joe-and-the-juice-server.database.windows.net",
  database: "JoeAndTheJuice",
  port: 1433,
  options: {
    encrypt: true, // Necessary for Azure SQL
    trustServerCertificate: false,
  },
};

async function testConnection() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to the database successfully!");
    pool.close(); // Close the connection
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();