const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.session.token; // Træk token fra session

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified; // Gem verificeret token-data

     // Check if token is about to expire (e.g., within 5 minutes)
     const tokenExp = new Date(verified.exp * 1000);
     const now = new Date();
     const fiveMinutes = 5 * 60 * 1000;
 
     if (tokenExp - now < fiveMinutes) {
       // Generate new token
       const newToken = jwt.sign(
         { sessionId: req.sessionID },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: '1h' }
       );
       req.session.token = newToken;
     }
 

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Generate new token
      const newToken = jwt.sign(
        { sessionId: req.sessionID },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      req.session.token = newToken;
      next();
    } else {
      console.error("Token verification failed:", err.message);
      res.status(403).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
  }
};

module.exports = { authenticateToken };