const database = require("../database/database");
const { decryptWithPrivateKey } = require("../controllers/encryptionUtils");
const { sendVerificationCode } = require("./smsController");
const { user } = require("../database/config");
const jwt = require("jsonwebtoken");

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
      req.session.userExists = false;
      console.log("User does not exist:", email, req.session);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // Hvis brugeren findes, opdater session:
    req.session.userExists = true;
    console.log("User exists:", email, req.session);
    // Dekrypter adgangskoden fra databasen
    const decryptedPassword = decryptWithPrivateKey(decryptedUser.userPassword);

    // Valider adgangskoden
    if (decryptedPassword !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Wrong password." });
    }

    console.log("User authenticated successfully.");
    // Kontroller, om brugeren er masterbruger
    const isMasterUser =
      decryptWithPrivateKey(decryptedUser.userEmail) ===
      process.env.MASTER_USER_EMAIL;

    console.log("Is master user:", isMasterUser);

    // Opret brugerdataobjekt
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

    if (isMasterUser) {
      console.log(
        "Masterbruger logget ind - totrinsgodkendelse springes over.",
        userData
      );

      // Master user: skip verification
      const token = jwt.sign(
        { userId: userData.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600 * 1000, // 1 hour
      });

      req.session.user = userData;
      // console.log("Master user logged in:", userData);
      

      return res.status(200).json({
        success: true,
        message: "Login successful for master user.",
        skipVerification: true,
        user: userData,
      });
    }

    // Send verificeringskode via Twilio
    const phoneNumber = "+45" + userData.phone; // Sikrer, at nummeret altid starter med +45
    const verificationResponse = await sendVerificationCode(phoneNumber);

    if (!verificationResponse.success) {
      console.error(
        "Failed to send verification code after login:",
        verificationResponse.message
      );
      return res
        .status(500)
        .json({ success: false, message: "Failed to send verification code." });
    }
    // Returner succesrespons til klienten
    req.session.info = userData;
    req.session.user = userData;

    // const token = jwt.sign(req.session.user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: '1h', // Token udløber efter 1 time
    // });

    res.status(200).json({
      success: true,
      message: "Login successful. Verification code sent.",
      user: userData,
      // token: token // JWT-token inkluderes her
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { login };
