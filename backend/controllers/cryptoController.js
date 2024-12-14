// Import required modules
const crypto = require('crypto');

// Load keys from environment variables
const publicKey = Buffer.from(process.env.PUBLIC_KEY_BASE64, 'base64').toString('utf-8');
const privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf-8');

// Encryption with public key
function encryptWithPublicKey(data) {
    return crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(data)
    ).toString('base64');
}

// Decryption with private key
function decryptWithPrivateKey(encryptedData) {
    return crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(encryptedData, 'base64')
    ).toString('utf-8');
}

// JWT Token Authentication
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    let token;

    // Extract token from Authorization header or cookies
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
}

module.exports = {
    encryptWithPublicKey,
    decryptWithPrivateKey,
    authenticateToken,
};