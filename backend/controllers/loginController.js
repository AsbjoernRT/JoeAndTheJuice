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

        // Valider adgangskoden
        const passwordMatch = await bcrypt.compare(password, decryptedUser.userPassword);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Wrong password.' });
        }

         // Dekrypter brugerdata til returnering
         const userData = {
        console.log("Login successful"),
        // Brugeren er godkendt
        console.log("User details: ", decryptedUser.userID);
        
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

           // Gem brugerens session og omdiriger til hjemmesiden ved succesfuldt login
           console.log("User found - login success");
           req.session.loggedin = true;
           console.log("session saved:", req.session.loggedin)

           res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userData,
        });

        // Efterfølgende: Send verificeringskode via Twilio
        const phoneNumber = decryptWithPrivateKey(decryptedUser.userTelephone);
        const verificationResponse = await sendVerificationCode('+45' + phoneNumber);

       

        if (!verificationResponse.success) {
            console.error('Failed to send verification code after login:', verificationResponse.message);
        } else {
            console.log('Verification code sent successfully.');
        }
            houseNumber: decryptWithPrivateKey(decryptedUser.userHouseNumber)
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 

            
            user: {
                email: decryptWithPrivateKey(decryptedUser.userEmail),
                firstName: decryptWithPrivateKey(decryptedUser.userFirstName),
                lastName: decryptWithPrivateKey(decryptedUser.userLastName),
                phone: decryptWithPrivateKey(decryptedUser.userTelephone),
                country: decryptWithPrivateKey(decryptedUser.userCountry),
                postNumber: decryptWithPrivateKey(decryptedUser.userPostNumber),
                city: decryptWithPrivateKey(decryptedUser.userCity),
                street: decryptWithPrivateKey(decryptedUser.userStreet),
                houseNumber: decryptWithPrivateKey(decryptedUser.userHouseNumber)
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Funktion til at præsentere login-siden
const renderLogin = async (req, res) => {
    console.log("Session details: ", req.session && req.session.loggedin);
    if (req.session.loggedin) {
        // Hvis brugeren er logget ind, omdirigeres de til hjemmesiden
        console.log("login Success");
        res.redirect('../');
    } else {
        // Hvis brugeren ikke er logget ind, vises login-siden.
        console.log("not logged in");
        res.sendFile('login.html', { root: './views' });
    }
}


// Middleware til at sikre, at brugeren er godkendt
function authenticator(req, res, next) {
    if (!req.session || !req.session.loggedin) {
       // Omdiriger til login-siden, hvis ikke logget ind
        res.redirect('/login');
    } else {
        // Fortsæt til næste middleware eller rutehåndterer, hvis logget ind
        next();
    }
}


module.exports = {
    renderLogin,
    authenticator,
    login,
};