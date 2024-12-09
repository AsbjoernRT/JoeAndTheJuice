// backend/controllers/viewController.js
const path = require('path');

exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/home.html'));
};

exports.getMenuPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/menu.html'));
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

  exports.getCartPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/cart.html'));
  };

  exports.getHeader = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/partials/header.html'));
  };

  exports.getFooter = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/partials/footer.html'));
  };

  exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/login.html'));
  };

  exports.getSignup = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/signup.html'));
  };

  exports.getAuthentication = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/authentication.html'));
  };