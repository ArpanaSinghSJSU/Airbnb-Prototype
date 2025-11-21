const jwt = require('jsonwebtoken');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
};

const requireOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Owners only.'
    });
  }
  next();
};

module.exports = { authenticateJWT, requireOwner };
