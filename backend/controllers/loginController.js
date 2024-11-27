const bcrypt = require('bcrypt');
const database = require('../database/database');
const { decryptWithPrivateKey } = require('../controllers/encryptionUtils');
const { sendVerificationCode } = require('../controllers/authenticationController');
const { user } = require('../database/config');

// Login-funktion
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Hent alle brugere fra databasen
        const users = await database.getAllUsers();
        let decryptedUser = null;

        // Find brugeren baseret på dekrypteret e-mail
        for (const user of users) {
            const decryptedEmail = decryptWithPrivateKey(user.userEmail); // Dekrypter brugerens e-mail
            if (decryptedEmail === email) {
                decryptedUser = user; // Match fundet
                break;
            }
        }

        if (!decryptedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Dekrypter adgangskoden fra databasen
        const decryptedPassword = decryptWithPrivateKey(decryptedUser.userPassword);

        // Valider adgangskoden
        if (decryptedPassword !== password) {
            return res.status(401).json({ success: false, message: 'Wrong password.' });
        }

        console.log("User authenticated successfully.");
        // Kontroller, om brugeren er masterbruger
        const isMasterUser = decryptedUser.userEmail === process.env.MASTER_USER_EMAIL;

        if (isMasterUser) {
            console.log('Masterbruger logget ind - totrinsgodkendelse springes over.');

            // Gem session direkte
            req.session.loggedin = true;
            req.session.user = {
                userId: decryptedUser.userID,
                email: decryptWithPrivateKey(decryptedUser.userEmail),
                firstName: decryptWithPrivateKey(decryptedUser.userFirstName),
                lastName: decryptWithPrivateKey(decryptedUser.userLastName),
                phone: decryptWithPrivateKey(decryptedUser.userTelephone),
                country: decryptWithPrivateKey(decryptedUser.userCountry),
                postNumber: decryptWithPrivateKey(decryptedUser.userPostNumber),
                city: decryptWithPrivateKey(decryptedUser.userCity),
                street: decryptWithPrivateKey(decryptedUser.userStreet),
                houseNumber: decryptWithPrivateKey(decryptedUser.userHouseNumber),
            };

            return res.status(200).json({ success: true, message: 'Login successful for master user.', user: req.session.user });
        }

        // Dekrypter brugerdata til session og respons
        const userData = {
            userId: decryptedUser.userID,
            email: decryptWithPrivateKey(decryptedUser.userEmail),
            firstName: decryptWithPrivateKey(decryptedUser.userFirstName),
            lastName: decryptWithPrivateKey(decryptedUser.userLastName),
            phone: decryptWithPrivateKey(decryptedUser.userTelephone),
            country: decryptWithPrivateKey(decryptedUser.userCountry),
            postNumber: decryptWithPrivateKey(decryptedUser.userPostNumber),
            city: decryptWithPrivateKey(decryptedUser.userCity),
            street: decryptWithPrivateKey(decryptedUser.userStreet),
            houseNumber: decryptWithPrivateKey(decryptedUser.userHouseNumber),
        };

        // Gem sessionen

        console.log("User logged in successfully:", userData.email);

        // Send verificeringskode via Twilio
        const phoneNumber = '+45' + userData.phone; // Sikrer, at nummeret altid starter med +45
        const verificationResponse = await sendVerificationCode(phoneNumber);

        if (!verificationResponse.success) {
            console.error('Failed to send verification code after login:', verificationResponse.message);
            return res.status(500).json({ success: false, message: 'Failed to send verification code.' });
        }

        // Returner succesrespons til klienten
        req.session.loggedin = true;
        req.session.user = userData;

        res.status(200).json({
            success: true,
            message: 'Login successful. Verification code sent.',
            user: userData,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { login };