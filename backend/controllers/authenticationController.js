require('dotenv').config(); // Indlæs miljøvariabler fra .env-filen
const twilio = require('twilio');
const { decryptWithPrivateKey } = require('../controllers/encryptionUtils');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token
const verifyServiceSid = process.env.VERIFY_SERVICE_SID; // Twilio Verify Service SID

const client = twilio(accountSid, authToken);

const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith('+45')) {
        return `+45${phoneNumber}`;
    }
    return phoneNumber;
};

// Funktion til at sende en verifikationskode
const sendVerificationCode = async (phoneNumber) => {
    try {
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
        const verification = await client.verify.v2.services(verifyServiceSid)
            .verifications.create({ to: formattedPhoneNumber, channel: 'sms' });
        console.log(`Verification code sent to ´+45 + ${phoneNumber}´. Status: ${verification.status}`);
        return { success: true, message: 'Verification code sent successfully.' };
    } catch (error) {
        console.error('Error sending verification code:', error);
        return { success: false, message: 'Failed to send verification code.' };
    }
};

// Funktion til at verificere en kode
const checkVerificationCode = async (phoneNumber, code, context) => {
    try {
        // Tjek om telefonnummeret er krypteret (eksempel: længde > 20)
        let decryptedPhoneNumber = phoneNumber;
        if (phoneNumber.length > 20) {
            decryptedPhoneNumber = decryptWithPrivateKey(phoneNumber);
            console.log("Dekrypteret telefonnummer:", decryptedPhoneNumber);
        }
        const formattedPhoneNumber = formatPhoneNumber(decryptedPhoneNumber);

        console.log("Verificerer kode for telefonnummer:", formattedPhoneNumber);

        // Tjek verificeringskoden
        const verificationCheck = await client.verify.v2.services(verifyServiceSid)
            .verificationChecks.create({ to: formattedPhoneNumber, code });

        if (verificationCheck.status === 'approved') {
            console.log('Verification successful!');
            return { success: true, message: 'Verification successful!' };
        } else {
            console.log('Verification failed. Incorrect code.');
            return { success: false, message: 'Incorrect verification code.' };
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        return { success: false, message: 'Failed to verify code.' };
    }
};


// Eksporter funktionerne til brug i andre moduler eller en HTML-side
module.exports = { sendVerificationCode, checkVerificationCode };