// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
import dotenv from 'dotenv';
dotenv.config();
import { config } from './config.js';
import Database from './database/database.js';



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