// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const database = require('./database/database');

database.connectToDatabase()
.then(() => console.log('Database connected successfully'))
.catch(e => console.error('Failed to connect to the database'));

const apiRoutes = require('./routes/apiRoutes');
const viewRoutes = require('./routes/viewRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

// Serve static files after defining routes
app.use(express.static(path.join(__dirname, '..', 'frontend')));

module.exports = app;