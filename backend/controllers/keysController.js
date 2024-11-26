const fs = require('fs');
const path = require('path');

// Læs public og private key fra filer
const publicKey = fs.readFileSync(path.join(__dirname, '../keys/public.pem'), 'utf-8');
const privateKey = fs.readFileSync(path.join(__dirname, '../keys/private.pem'), 'utf-8');

module.exports = { publicKey, privateKey };