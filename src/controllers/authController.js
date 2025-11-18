const User = require('../models/User');
const Student = require('../models/Student');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password',
      });
    }

    let user = await User.findOne({ username }).select('+password');
    let isStudent = false;

    if (!user) {
      user = await Student.findOne({ username }).select('+password');
      isStudent = true;
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    if (isStudent && user.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is inactive',
      });
    }

    const token = generateToken(user._id);

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: isStudent ? 'student' : user.role,
    };

    if (isStudent) {
      userData.studentId = user._id;
      userData.name = user.name;
      userData.belt = user.belt;
    }

    logger.info(`${isStudent ? 'Student' : 'User'} logged in: ${username}`);

    res.status(200).json({
      status: 'success',
      token,
      user: userData,
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id).select('-password');

    if (!user) {
      user = await Student.findById(req.user.id).select('-password');
      
      if (user) {
        return res.status(200).json({
          status: 'success',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: 'student',
            studentId: user._id,
            name: user.name,
            belt: user.belt,
          },
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};
