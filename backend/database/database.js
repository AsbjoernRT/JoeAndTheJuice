// backend/database/database.js
const sql = require('mssql');
const config = require('./config'); // Stien er rettet til './config'

class Database {
  constructor() {
    this.pool = null;
  }

  async connectToDatabase() {
    try {
      this.pool = await sql.connect(config);
      console.log('Connected to the database');
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }

  async getProducts() {
    try {
      if (!this.pool) {
        throw new Error('Database connection not established');
      }
      const result = await this.pool.request().query('SELECT * FROM products');
      return result.recordset;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      throw err;
    }
  }

  // Tilføj flere databasefunktioner efter behov
}

module.exports = new Database();