const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Definer stien til mappen
const keysDir = path.join(__dirname, '../keys');

// Kontroller, om mappen eksisterer, og opret den, hvis den ikke gør
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
}

// Generér RSA-nøgler
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Gem nøglerne i mappen
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);

console.log('RSA keys generated and saved to ./keys/ folder.');