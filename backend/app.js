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

const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
  });
  
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'joeandthechatbot',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // True hvis du bruger HTTPS
        httpOnly: true,
      },
    })
  );

// app.use(session({
//     secret: 'joeandthechatbot',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Sæt til true, hvis du bruger HTTPS
//   name: 'joeAndTheJuice.sid'  
//   }));

app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Eksporter app uden at starte serveren
module.exports = app;