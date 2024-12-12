// backend/routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const viewController = require('../controllers/viewController');
// const { authenticateToken } = require("../controllers/jwtToken");

// Define view routes
router.get('/', viewController.getHomePage);
router.get('/order', viewController.getOrderPage);
router.get('/checkout', viewController.getCheckoutPage);
router.get('/cart', viewController.getCartPage);
router.get('/success', viewController.getSuccessPage);
router.get('/header', viewController.getHeader);
router.get('/footer', viewController.getFooter);
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/authentication', viewController.getAuthentication);

// Protected Pages
// router.use(authenticateToken);

module.exports = router;