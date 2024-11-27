// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Konfigurer Redis-klienten

// Configure Redis client
const redisClient = createClient({
    socket: {
        host: '127.0.0.1', // Redis server address
        port: 6379,        // Default Redis port
    }
});

redisClient.connect().catch(console.error); // Tilføj fejl-håndtering

// Brug Redis som session-store
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'joeandthechatbot', // Din hemmelighed
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Sæt til true, hvis du bruger HTTPS
}));
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

// app.get('/', (req, res) => {
//     if(req.session.views) {
//         req.session.views++;
//         console.log(`You have visited this page ${req.session.views} times`);
//     } else {
//         req.session.views = 1;
//         console.log('Welcome the session has started. Refresh!');
//     } 
// }
// );

// Eksporter app uden at starte serveren
module.exports = app;