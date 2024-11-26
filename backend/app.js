// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
// Configure Express to serve static files from the 'assets' directory
app.use(session({
  secret: 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // Set to true in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
  },
  name: 'joeAndTheJuice.sid'
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Eksporter app uden at starte serveren
module.exports = app;