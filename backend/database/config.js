const dotenv = require("dotenv");
dotenv.config();

const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;

const config = {
    server,
    database,
    user,
    password,
    options: {
        encrypt: true
    }
};

module.exports = { config };