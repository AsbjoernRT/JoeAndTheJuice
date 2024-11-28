// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');
const jwt = require('jsonwebtoken');
const RedisStore = require('connect-redis').default;
const redis = require('redis');


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

// Create Redis client
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client successfully connected.');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1); // Exit if Redis connection fails
  }
})();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'joeandthechatbot',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(express.urlencoded({ extended: true }));



// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Eksporter app uden at starte serveren
module.exports = app;