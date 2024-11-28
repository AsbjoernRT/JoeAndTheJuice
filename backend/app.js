// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');
const jwt = require('jsonwebtoken');


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session-middleware
app.use(session({
  secret: 'joeandthechatbot',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Sæt til true, hvis du bruger HTTPS
  name: 'joeAndTheJuice.sid'
}));

// Middleware for at generere JWT-token ved session-start
app.use((req, res, next) => {
  if (!req.session.token) { // Hvis der ikke allerede er en token
    const token = jwt.sign(
      { sessionId: req.sessionID }, // Payload: session-ID eller anden identifikation
      process.env.ACCESS_TOKEN_SECRET, // Din hemmelige nøgle fra .env
      { expiresIn: '1h' } // Token udløber om 1 time
    );

    req.session.token = token; // Gem tokenen i sessionen

    console.log('JWT generated and stored in session:', token);
  }
  next();
});


app.use(express.urlencoded({ extended: true }));



// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Eksporter app uden at starte serveren
module.exports = app;