// backend/database/config.js
const dotenv = require('dotenv');
dotenv.config();

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER, // For eksempel 'localhost' eller serverens IP
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true, // Hvis du bruger Azure
    trustServerCertificate: true, // Sæt til true, hvis du har certifikatproblemer
  },
};

module.exports = config;