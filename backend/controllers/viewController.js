// backend/controllers/viewController.js
const path = require('path');

exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/home.html'));
};

exports.getMenuPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/menu.html'));
};

exports.getLocationsPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/locations.html'));
};

exports.getOrderPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/order.html'));
};

exports.getContactPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/contact.html'));
};

exports.getCheckoutPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/checkout.html'));
  };