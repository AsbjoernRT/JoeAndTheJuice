// backend/app.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const favicon = require('serve-favicon');
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })(req, res, next);
});

// Rate limiter
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

app.use('/api', apiRoutes);
app.use('/', viewRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

module.exports = app;
