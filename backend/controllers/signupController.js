const database = require('../database/database');
const { decryptWithPrivateKey } = require('../controllers/encryptionUtils');
const { encryptWithPublicKey } = require('../controllers/encryptionUtils');
const { sendVerificationCode } = require('../controllers/authenticationController');
const jwt = require('jsonwebtoken');
// `register`-funktion
register = async (req, res) => {
    try {
        console.log("Req.body modtaget:", req.body);

        const { firstName, lastName, email, password, phone, country, postNumber, city, street, houseNumber } = req.body;


        // Valider nødvendige felter
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

         // Hent alle brugere fra databasen
         const allUsers = await database.getAllUsers();

         // Dekrypter og tjek, om e-mail allerede findes
         for (const user of allUsers) {
             const decryptedEmail = decryptWithPrivateKey(user.userEmail);
             if (decryptedEmail === email) {
                 return res.status(400).json({
                     success: false,
                     message: "User with this email already exists. Please use a different email.",
                 });
             }
         }

        // Krypter følsomme data med public key
        const encryptedFirstName = encryptWithPublicKey(firstName);
        const encryptedLastName = encryptWithPublicKey(lastName);
        const encryptedEmail = encryptWithPublicKey(email);
        const encryptedPhone = encryptWithPublicKey(phone);
        const encryptedCountry = encryptWithPublicKey(country);
        const encryptedPostNumber = encryptWithPublicKey(postNumber).toString();
        const encryptedCity = encryptWithPublicKey(city);
        const encryptedStreet = encryptWithPublicKey(street);
        const encryptedHouseNumber = encryptWithPublicKey(houseNumber);
        const encryptedPassword = encryptWithPublicKey(password); // Krypter adgangskoden

        // Opret bruger i databasen
        const result = await database.createUser({
            firstName: encryptedFirstName,
            lastName: encryptedLastName,
            email: encryptedEmail,
            phone: encryptedPhone,
            country: encryptedCountry,
            postNumber: encryptedPostNumber,
            city: encryptedCity,
            street: encryptedStreet,
            houseNumber: encryptedHouseNumber,
            password: encryptedPassword, // Gem krypteret adgangskode
        });

        if (!result.success) {
            console.error("Failed to create user in database.");
            return res.status(500).json({ success: false, message: "Failed to create user in database." });
        }
        console.log(encryptedEmail);
        
        

        const userRecord = await database.getUserByEncryptedEmail(encryptedEmail);

        if (!userRecord) {
        return res.status(404).json({ success: false, message: "User not found in database." });
        }

        console.log("User record found:", userRecord);
        

        const userData = {
            userId: userRecord.userID,
            firstName: decryptWithPrivateKey(userRecord.userFirstName),
            lastName: decryptWithPrivateKey(userRecord.userLastName),
            email: decryptWithPrivateKey(userRecord.userEmail),
            phone: decryptWithPrivateKey(userRecord.userTelephone),
            country: decryptWithPrivateKey(userRecord.userCountry),
            postNumber: decryptWithPrivateKey(userRecord.userPostNumber),
            city: decryptWithPrivateKey(userRecord.userCity),
            street: decryptWithPrivateKey(userRecord.userStreet),
            houseNumber: decryptWithPrivateKey(userRecord.userHouseNumber),
        };

        console.log("User data:", userData);
        

        const phoneNumber = '+45' + userData.phone;
        const verificationResponse = await sendVerificationCode(phoneNumber);

        if (!verificationResponse.success) {
            console.error('Failed to send verification code:', verificationResponse.message);
            return res.status(500).json({ success: false, message: 'Failed to send verification code.' });
        }

        // Set session data
        req.session.loggedin = true;
        req.session.user = userData;

        console.log('User created successfully:', userData.email);
        

        // Generate JWT token
        const token = jwt.sign(req.session.user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h', // Token expires after 1 hour
        });

        console.log('Sign-up successful:', userData.email);
        

        console.log(req.session.user);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Sign-up successful. Verification code sent.',
            user: userData,
            token: token,
        });

        console.log("Test");
        
    
    }   catch (err) {   
        console.error('Sign-up error:', err);
        res.status(500).json({ success: false, message: 'Failed to create user. Please try again.' });
    }};

module.exports = { register };