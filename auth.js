const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized. Please login first.' 
    });
  }
  next();
};

const isTraveler = (req, res, next) => {
  if (req.session.user.role !== 'traveler') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Travelers only.' 
    });
  }
  next();
};

const isOwner = (req, res, next) => {
  if (req.session.user.role !== 'owner') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Owners only.' 
    });
  }
  next();
};

module.exports = { auth, isTraveler, isOwner };
