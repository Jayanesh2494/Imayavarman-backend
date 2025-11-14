const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'parent']).withMessage('Invalid role'),
  validate,
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Student validations
const createStudentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 5, max: 100 }).withMessage('Age must be between 5 and 100'),
  body('phoneNumber').optional().matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  validate,
];

// Attendance validations
const markAttendanceValidation = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('status').optional().isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
  body('method').optional().isIn(['face_recognition', 'manual']).withMessage('Invalid method'),
  validate,
];

// Event validations
const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('category').optional().isIn(['competition', 'workshop', 'ceremony', 'practice', 'other']),
  validate,
];

// Fee validations
const createFeeValidation = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  createStudentValidation,
  markAttendanceValidation,
  createEventValidation,
  createFeeValidation,
};
