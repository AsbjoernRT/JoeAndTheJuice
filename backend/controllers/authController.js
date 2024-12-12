//auth controller

const database = require("../database/database");
const { decryptWithPrivateKey } = require("../controllers/encryptionUtils");
const { sendVerificationCode } = require("./smsController");
const jwt = require("jsonwebtoken");
const session = require("express-session");

async function checkUserExists(req, res) {
    console.log("Checking if user exists...", req.body);

    const { email } = req.body;
    console.log("email to find: ",email);
    
    // Hent alle brugere fra databasen
    const allUsers = await database.getAllUsers();

    // Dekrypter og tjek, om e-mail allerede findes
    for (const user of allUsers) {
        const decryptedEmail = decryptWithPrivateKey(user.userEmail);
        if (decryptedEmail === email) {
            console.log("User exists:", decryptedEmail);

            req.session.userExists = true;
            console.log("Opdateret",req.session);
            
            return res.status(200).json({ exists: true });
        }
    }
    console.log("User does not exist:", email);

    req.session.userExists = false;
    console.log("Opdateret",req.session);
    
    return res.status(200).json({ exists: false });
}


const logout = (req, res) => {
    console.log("Logging out user...");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('token'); // Clear JWT token cookie
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}
  
module.exports = { checkUserExists, logout };
