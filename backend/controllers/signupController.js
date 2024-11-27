const database = require('../database/database');
const { decryptWithPrivateKey } = require('../controllers/encryptionUtils');
const { encryptWithPublicKey } = require('../controllers/encryptionUtils');

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

        console.log("User successfully created:", email);
        return res.status(201).json({ 
            success: true, 
            message: "User created successfully!",
            user: {
                firstName: encryptedFirstName,
                lastName: encryptedLastName,
                email: encryptedEmail,
                phone: encryptedPhone,
                country: encryptedCountry,
                postNumber: encryptedPostNumber,
                city: encryptedCity,
                street: encryptedStreet,
                houseNumber: encryptedHouseNumber,
            }


         });
    } catch (error) {
        console.error("Error in register controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { register };