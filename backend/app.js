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

app.use(session({
    secret: 'joeandthechatbot',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false 
  },
  name: 'joeAndTheJuice.sid// Sæt til true, hvis du bruger HTTPS
  }));

app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Eksporter app uden at starte serveren
module.exports = app;