const crypto = require('crypto');

const publicKey = Buffer.from(process.env.PUBLIC_KEY_BASE64, 'base64').toString('utf-8');
const privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf-8');

module.exports = { publicKey, privateKey };