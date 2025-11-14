const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const axios = require('axios');
const logger = require('../utils/logger');

// @desc    Mark attendance by face recognition
// @route   POST /api/attendance/mark
// @access  Private (Admin)
exports.markAttendanceByFace = async (req, res, next) => {
  try {
    const { studentId, method, confidence } = req.body;

    // Check if already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: today },
    });

    if (existingAttendance) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance already marked for today',
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      studentId,
      status: 'present',
      method: method || 'face_recognition',
      confidence,
      checkInTime: new Date(),
      markedBy: req.user.id,
    });

    const populatedAttendance = await Attendance.findById(attendance._id).populate(
      'studentId',
      'name age belt'
    );

    logger.info(`Attendance marked for student: ${studentId} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      attendance: populatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark manual attendance
// @route   POST /api/attendance/mark-manual
// @access  Private (Admin)
exports.markManualAttendance = async (req, res, next) => {
  try {
    const { attendance } = req.body;

    if (!Array.isArray(attendance)) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance must be an array',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = [];

    for (const record of attendance) {
      const { studentId, status } = record;

      // Check if already exists
      let existingAttendance = await Attendance.findOne({
        studentId,
        date: { $gte: today },
      });

      if (existingAttendance) {
        // Update existing
        existingAttendance.status = status;
        existingAttendance.checkInTime = status === 'present' ? new Date() : undefined;
        existingAttendance.markedBy = req.user.id;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        // Create new
        const newAttendance = await Attendance.create({
          studentId,
          status,
          method: 'manual',
          checkInTime: status === 'present' ? new Date() : undefined,
          markedBy: req.user.id,
        });
        results.push(newAttendance);
      }
    }

    logger.info(`Manual attendance marked for ${results.length} students by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance for specific students
// @route   POST /api/attendance/today-batch
// @access  Private
exports.getTodayBatch = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: today },
    }).populate('studentId', 'name');

    res.status(200).json({
      status: 'success',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:id
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { studentId: req.params.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: { $gte: today },
    })
      .populate('studentId', 'name age belt')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      status: 'success',
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.find({
      date: { $gte: today },
    });

    const totalStudents = await Student.countDocuments({ status: 'active' });
    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const attendanceRate = totalStudents > 0 
      ? ((presentToday / totalStudents) * 100).toFixed(1)
      : '0';

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents,
        presentToday,
        absentToday: totalStudents - presentToday,
        attendanceRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const attendance = await Attendance.find()
      .populate('studentId', 'name age')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance status
// @route   PATCH /api/attendance/:id
// @access  Private (Admin)
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('studentId', 'name');

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Attendance deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
