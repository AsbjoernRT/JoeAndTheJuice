const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.session.token; // Træk token fra session

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified; // Gem verificeret token-data
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = { authenticateToken };