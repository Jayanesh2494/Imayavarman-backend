const Student = require('../models/Student');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const students = await Student.find(query).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    logger.info(`New student created: ${student.name} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    logger.info(`Student updated: ${student.name} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    logger.info(`Student deleted: ${student.name} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search students
// @route   GET /api/students/search
// @access  Private
exports.searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;

    const students = await Student.find({
      $text: { $search: q },
    }).limit(10);

    res.status(200).json({
      status: 'success',
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
