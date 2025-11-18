const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const logger = require('../utils/logger');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find user in User model
      let user = await User.findById(decoded.id).select('-password');

      // If not found, try Student model
      if (!user) {
        user = await Student.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
      }

      req.user = {
        id: user._id,
        role: user.role || 'student',
      };

      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    logger.error('Protect middleware error:', error);
    next(error);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
