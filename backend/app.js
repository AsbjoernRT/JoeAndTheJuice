// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const apiRoutes = require('./routes/apiRoutes');
const viewRoutes = require('./routes/viewRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// Routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

module.exports = app;