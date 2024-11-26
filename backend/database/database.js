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
  async getUserByMail(email) {
    try {
      if (!this.pool) {
        await this.connectToDatabase();
      }
      const result = await this.pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM joeAndTheJuice.users WHERE userEmail = @email');

      return result.recordset[0]; // Returnér første bruger, hvis der er et match
    } catch (err) {
      console.error('Failed to fetch user by email:', err);
      throw err;
    }
  }

  async getUserByEncryptedEmail(encryptedEmail) {
    const result = await this.pool.request()
        .input('encryptedEmail', sql.NVarChar, encryptedEmail)
        .query('SELECT * FROM joeAndTheJuice.users WHERE userEmail = @encryptedEmail');
    return result.recordset[0];
}

async getAllUsers() {
  try {
      if (!this.pool) {
          await this.connectToDatabase();
      }
      const result = await this.pool.request().query('SELECT * FROM joeAndTheJuice.users');
      return result.recordset; // Returnér alle brugere
  } catch (err) {
      console.error('Failed to fetch all users:', err);
      throw err;
  }
}

  // Oprettelse af en ny bruger [joeAndTheJuice].[users]
  async createUser(user) {
    if (!this.pool) {
        await this.connectToDatabase();
    }

    try {
        const request = this.pool.request()
            .input('firstname', sql.NVarChar, user.firstName)
            .input('lastName', sql.NVarChar, user.lastName)
            .input('email', sql.NVarChar, user.email)
            .input('phone', sql.NVarChar, user.phone)
            .input('country', sql.NVarChar, user.country)
            .input('postNumber', sql.NVarChar, user.postNumber)
            .input('city', sql.NVarChar, user.city)
            .input('street', sql.NVarChar, user.street)
            .input('houseNumber', sql.NVarChar, user.houseNumber)
            .input('password', sql.NVarChar, user.password);

        const result = await request.query(`
            INSERT INTO joeAndTheJuice.users (
                userFirstName, userLastName, userEmail, userTelephone, userCountry, 
                userPostNumber, userCity, userStreet, userHouseNumber, userPassword
            ) 
            VALUES (
                @firstname, @lastName, @email, @phone, @country, 
                @postNumber, @city, @street, @houseNumber, @password
            )
        `);

        if (result.rowsAffected[0] > 0) {
            return { success: true };
        } else {
            return { success: false, message: 'No rows affected' };
        }
    } catch (err) {
        console.error('Failed to create user:', err);
        throw new Error('Database operation failed');
    }
}


  // Tilføj flere databasefunktioner efter behov
}

module.exports = new Database();