// backend/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Define API endpoints
router.get('/menu', apiController.getMenuItems);
router.get('/locations', apiController.getLocations);
router.post('/order', apiController.startOrder);

module.exports = router;