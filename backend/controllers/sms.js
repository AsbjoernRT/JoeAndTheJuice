require('dotenv').config(); // Indlæs miljøvariabler fra .env-filen
const twilio = require('twilio');


// Twilio-legitimationsoplysninger indlæst fra miljøvariabler
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token

// Opret Twilio-klienten
const client = twilio(accountSid, authToken);

// Funktion til at sende en SMS baseret på status og telefonnummer
const sendSMS = (phoneNumber, status) => {
    let messageBody;

    // Bestem beskeden baseret på status
    if (status === 'klar') {
        messageBody = 'Hej, det er JOE. Din ordre er nu klar til afhentning. Vi glæder os til at se dig!';
    } else if (status === 'vent') {
        messageBody = 'Hej, det er JOE. Din ordre er stadig under forberedelse. Du vil modtage en besked, når den er klar.';
    } else {
        messageBody = 'Hej, det er JOE. Der opstod en fejl, kontakt os venligst for mere information.';
    }

    // Send beskeden via Twilio
    client.messages
        .create({
            body: messageBody, // Dynamisk besked
            from: process.env.TWILIO_PHONE_NUMBER, // Twilio-telefonnummer fra .env
            to: phoneNumber, // Dynamisk telefonnummer
        })
        .then(message => console.log(`Besked sendt med SID: ${message.sid}`))
        .catch(error => console.error('Fejl ved afsendelse af besked:', error));
};

// Eksempel på at sende beskeder
//sendSMS('+4561281921', 'klar'); // Sender besked om, at ordren er klar
//sendSMS('+4561281921', 'vent'); // Sender besked om, at ordren er under forberedelse

module.exports = { sendSMS };