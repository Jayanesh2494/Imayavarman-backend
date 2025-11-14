const User = require('../models/User');
const Student = require('../models/Student');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

// @desc    Login user/student
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password',
      });
    }

    // Try to find in User model first (Admin)
    let user = await User.findOne({ username }).select('+password');
    let isStudent = false;

    // If not found in User, try Student model
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

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check if student account is active
    if (isStudent && user.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is inactive. Please contact administrator.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: isStudent ? 'student' : user.role,
    };

    // If student, add student-specific data
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

// @desc    Register user (Admin only, not for students)
// @route   POST /api/auth/register
// @access  Public (but should be removed in production)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    // Only allow admin registration through this endpoint
    if (role && role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Student registration is not allowed through this endpoint',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'admin',
    });

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Try User model first
    let user = await User.findById(req.user.id).select('-password');

    // If not found, try Student model
    if (!user) {
      user = await Student.findById(req.user.id).select('-password');
      
      if (user) {
        // Add student-specific data
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
            status: user.status,
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
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
