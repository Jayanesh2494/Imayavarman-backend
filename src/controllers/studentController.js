const Student = require('../models/Student');
const logger = require('../utils/logger');

exports.getAllStudents = async (req, res, next) => {
  try {
    const { status, search, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: students,
    });
  } catch (error) {
    logger.error('Get students error:', error);
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');

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
    logger.error('Get student error:', error);
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { name, age, gender, phoneNumber, email, address, parentName, parentPhone, emergencyContact, belt, medicalInfo, username, password } = req.body;

    if (!name || !age || !gender || !phoneNumber || !email || !username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    const existingUsername = await Student.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ status: 'error', message: 'Username already exists' });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    const existingPhone = await Student.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ status: 'error', message: 'Phone number already exists' });
    }

    const student = await Student.create({
      name, age, gender, phoneNumber, email, address, parentName, parentPhone, emergencyContact,
      belt: belt || 'beginner', medicalInfo, username, password,
    });

    const studentData = student.toObject();
    delete studentData.password;

    logger.info(`Student created: ${student.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: studentData,
    });
  } catch (error) {
    logger.error('Create student error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ status: 'error', message: `${field} already exists` });
    }
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    logger.info(`Student updated: ${student.name}`);

    res.status(200).json({
      status: 'success',
      data: student,
    });
  } catch (error) {
    logger.error('Update student error:', error);
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    logger.info(`Student deleted: ${student.name}`);

    res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully',
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    next(error);
  }
};

exports.searchStudents = async (req, res, next) => {
  try {
    const { q, status = 'active' } = req.query;

    if (!q) {
      return res.status(400).json({ status: 'error', message: 'Search query required' });
    }

    const students = await Student.find({
      status,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(20);

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: students,
    });
  } catch (error) {
    logger.error('Search students error:', error);
    next(error);
  }
};
