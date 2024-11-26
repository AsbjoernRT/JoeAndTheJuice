require('dotenv').config(); // Indlæs miljøvariabler fra .env-filen
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token
const verifyServiceSid = process.env.VERIFY_SERVICE_SID; // Twilio Verify Service SID

const client = twilio(accountSid, authToken);

// Funktion til at sende en verifikationskode
const sendVerificationCode = async (phoneNumber) => {
    try {
        const verification = await client.verify.v2.services(verifyServiceSid)
            .verifications.create({ to: phoneNumber, channel: 'sms' });
        console.log(`Verification code sent to ${phoneNumber}. Status: ${verification.status}`);
        return { success: true, message: 'Verification code sent successfully.' };
    } catch (error) {
        console.error('Error sending verification code:', error);
        return { success: false, message: 'Failed to send verification code.' };
    }
};

// Funktion til at verificere en kode
const checkVerificationCode = async (phoneNumber, code) => {
    try {
        const verificationCheck = await client.verify.v2.services(verifyServiceSid)
            .verificationChecks.create({ to: phoneNumber, code });
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