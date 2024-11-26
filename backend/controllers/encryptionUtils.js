const crypto = require('crypto');
const { publicKey, privateKey } = require('./keysController'); // Importér dine nøgler

// Funktion til kryptering med public key
function encryptWithPublicKey(data) {
    return crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(data)
    ).toString('base64'); // Base64 for at gemme krypteret data nemt
}

// Funktion til dekryptering med private key
function decryptWithPrivateKey(encryptedData) {
    return crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(encryptedData, 'base64')
    ).toString('utf-8');
}

module.exports = { encryptWithPublicKey, decryptWithPrivateKey };