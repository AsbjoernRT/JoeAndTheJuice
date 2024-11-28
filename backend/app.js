// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// Middleware
app.use(cors());
app.use(bodyParser.json());

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