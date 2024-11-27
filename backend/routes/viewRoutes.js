// backend/routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const viewController = require('../controllers/viewController');

// Define view routes
router.get('/', viewController.getHomePage);
router.get('/menu', viewController.getMenuPage);
router.get('/order', viewController.getOrderPage);
router.get('/contact', viewController.getContactPage);
router.get('/checkout', viewController.getCheckoutPage);
router.get('/header', viewController.getHeader);
router.get('/footer', viewController.getFooter);
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/authentication', viewController.getAuthentication);

module.exports = router;