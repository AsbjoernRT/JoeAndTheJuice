// backend/controllers/apiController.js

exports.getMenuItems = (req, res) => {
    res.json({ message: 'Menu items fetched successfully' });
  };
  
  exports.getLocations = (req, res) => {
    res.json({ message: 'Locations fetched successfully' });
  };
  
  exports.startOrder = (req, res) => {
    res.json({ message: 'Order started successfully' });
  };