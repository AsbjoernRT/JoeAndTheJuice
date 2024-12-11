// backend/app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const RedisStore = require("connect-redis").default;
const redis = require("redis");
const rateLimit = require("express-rate-limit");
const { authenticateToken } = require("./controllers/jwtToken");
const favicon = require('serve-favicon');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve favicon (adjust path if needed)
app.use(favicon(path.join(__dirname, '..', 'frontend', 'favicon_io', 'favicon.ico')));
//session middleware configuration
app.use((req, res, next) => {
  const redisClient = req.app.locals.redisClient;
  if (!redisClient) {
    return next(new Error('Redis client not initialized'));
  }

  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })(req, res, next);
});

// Middleware to generate JWT token at session start
app.use((req, res, next) => {
  if (!req.session.token) {
    const token = jwt.sign(
      { sessionId: req.sessionID },
      process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    req.session.token = token;
  }
  next();
});


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

// Apply rate limiter to all /api routes
app.use("/api/", apiLimiter);


// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Import your routes
const apiRoutes = require('./routes/apiRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Add token authentication for API
app.use('/api', authenticateToken);



// Mount routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});



// Eksporter app uden at starte serveren
module.exports = app;
