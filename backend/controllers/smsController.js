require("dotenv").config(); // Indlæs miljøvariabler fra .env-filen
const database = require("../database/database");
const { decryptWithPrivateKey } = require('./encryptionUtils'); // Opdater stien hvis nødvendigt
const twilio = require("twilio");

// Twilio-legitimationsoplysninger indlæst fra miljøvariabler
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Twilio Auth Token
const verifyServiceSid = process.env.VERIFY_SERVICE_SID; // Twilio Verify Service SID


// Opret Twilio-klienten
const client = twilio(accountSid, authToken);

// Funktion til at sende en verifikationskode
async function sendVerificationCode(phone) {
  
  let phoneNumber;
  if(!phone.startsWith('+45')){
    phoneNumber = "+45" + phone;
  } else {
    phoneNumber = phone;
  }
  console.log("Telefonnummer to Verify:", phoneNumber);
  
  try {
      const verification = await client.verify.v2.services(verifyServiceSid)
          .verifications.create({ to: phoneNumber, channel: 'sms' });
      console.log(`Verification code sent to ${phoneNumber}. Status: ${verification.status}`);
      return { success: true, message: 'Verification code sent successfully.' };
  } catch (error) {
      console.error('Error sending verification code:', error);
      return { success: false, message: 'Failed to send verification code.' };
  }
}

// Function to verify a code
async function checkVerificationCode(req, res) {
  console.log("Request body:", req.body);
  const { phoneNumber, code } = req.body;

  let phone;
  if (!phoneNumber.startsWith('+45')) {
    phone = '+45' + phoneNumber;
  } else {
    phone = phoneNumber;
  }

  try {
    console.log("Verifying code for phone number:", phone);

    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === 'approved') {
      console.log('Verification successful!');
      res.status(200).json({ success: true, message: 'Verification successful!' });
    } else {
      console.log('Verification failed. Incorrect code.');
      res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ success: false, message: 'Failed to verify code.' });
  }
}


// Funktion til at formatere produkter til SMS

// Funktion til at sende en SMS baseret på status og telefonnummer
const sendSMS = (phoneNumber, status, orderID, formattedProducts,location) => {
  let messageBody;
  // Fjern anførselstegn fra `location` (hvis det er nødvendigt)
  const cleanLocation = location.replace(/"/g, '');

  // Bestem beskeden baseret på status
  if (status === "klar") {
    (messageBody = "Hej, det er JOE! 🌟")+
      `Ordre #${orderID} er klar til afhentning.`+
      "Vi glæder os til at se dig! 😊";
  } else if (status === "bekræftelse") {
    messageBody =[
        `Hej, det er JOE! 🌟`,
        `Ordre #${orderID} er modtaget:`,
        `${formattedProducts.productList}`, // Tjek for korrekt reference
        `Antal varer: ${formattedProducts.totalItems}`,
        `Total: ${formattedProducts.totalPrice} kr.`,
        `Du får besked, når ordren er klar hos os, på den valgte lokation ${cleanLocation} 🥤`,
      ].join('\n');
  } else if (status === "vent") {
    messageBody =
      "Hej, det er JOE. Din ordre er stadig under forberedelse. Du vil modtage en besked, når den er klar.";
  } else {
    messageBody =
      "Hej, det er JOE. Der opstod en fejl, kontakt os venligst for mere information.";
  }


    console.log(`Besked til ${phoneNumber}: ${messageBody}`);
  // Send beskeden via Twilio
  client.messages
    .create({
      body: messageBody, // Dynamisk besked
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio-telefonnummer fra .env
      to: phoneNumber, // Dynamisk telefonnummer
    })
    .then((message) => console.log(`Besked sendt med SID: ${message.sid}`))
    .catch((error) => console.error("Fejl ved afsendelse af besked:", error));
};

async function formatProductsForSMS(products, totalPrice) {
    try {
      // Get product details from database
      const productsWithNames = await Promise.all(
        products.map(async (product) => {
          const productDetails = await database.getProductById(product.productID);
          return {
            ...product,
            productName: productDetails.productName,
          };
        })
      );
  
      const productLines = productsWithNames.map(
        (product) => `${product.quantity}x ${product.productName}`
      );
  
      const formattedProducts = {
        productList: productLines.join(", "),
        totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
        totalPrice: totalPrice,
      };
  
      console.log("Product lines:", productLines);
      console.log("Formatted Products:", formattedProducts); // Debug her
      return formattedProducts;
    } catch (error) {
      console.error("Error formatting products:", error);
      throw error;
    }
  }
// Eksempel på at sende beskeder
//sendSMS('+4561281921', 'klar'); // Sender besked om, at ordren er klar
//sendSMS('+4561281921', 'vent'); // Sender besked om, at ordren er under forberedelse

// async function authSendVerificationCode (req, res) {
//   const { phoneNumber } = req.body;
//   console.log("Dekrypteret telefonnummer:", phoneNumber);
//   const result = await sendVerificationCode(phoneNumber);
//   if (result.success) {
//       res.status(200).json({ success: true, message: result.message });
//   } else {
//       res.status(500).json({ success: false, message: result.message });
//   }
// };

// async function authCheckVerificationCode (req, res) {
//   const { phoneNumber, code } = req.body;
//   const result = await checkVerificationCode(phoneNumber, code);
//   if (result.success) {
//       res.status(200).json({ success: true, message: result.message });
//   } else {
//       res.status(401).json({ success: false, message: result.message });
//   }
// };

module.exports = {
  sendSMS,
  formatProductsForSMS,
  sendVerificationCode,
  checkVerificationCode,
};