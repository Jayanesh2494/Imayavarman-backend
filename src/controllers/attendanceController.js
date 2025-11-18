const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const logger = require('../utils/logger');

exports.markByFace = async (req, res, next) => {
  try {
    const { studentId, confidence } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ studentId, date: { $gte: today } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Attendance already marked for today' });
    }

    const attendance = await Attendance.create({
      studentId, status: 'present', method: 'face_recognition', confidence, checkInTime: new Date(), markedBy: req.user.id,
    });

    const populated = await Attendance.findById(attendance._id).populate('studentId', 'name age belt');
    logger.info(`Face attendance marked for student: ${studentId}`);

    res.status(201).json({ status: 'success', message: 'Attendance marked successfully', data: populated });
  } catch (error) {
    logger.error('Mark attendance error:', error);
    next(error);
  }
};

exports.markManualAttendance = async (req, res, next) => {
  try {
    const { attendanceData } = req.body;
    if (!Array.isArray(attendanceData)) {
      return res.status(400).json({ status: 'error', message: 'Attendance data must be an array' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results = [];

    for (const record of attendanceData) {
      const { studentId, status } = record;
      const existing = await Attendance.findOne({ studentId, date: { $gte: today } });

      if (existing) {
        existing.status = status;
        await existing.save();
        results.push(existing);
      } else {
        const attendance = await Attendance.create({ studentId, status, method: 'manual', markedBy: req.user.id });
        results.push(attendance);
      }
    }

    logger.info(`Manual attendance marked for ${results.length} students`);
    res.status(201).json({ status: 'success', message: 'Attendance marked successfully', data: results });
  } catch (error) {
    logger.error('Mark manual attendance error:', error);
    next(error);
  }
};

exports.getTodayBatch = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ studentId: { $in: studentIds }, date: { $gte: today } });
    res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    logger.error('Get today batch error:', error);
    next(error);
  }
};

exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;
    const query = { studentId: id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query).limit(parseInt(limit)).sort({ date: -1 });
    res.status(200).json({ status: 'success', results: attendance.length, data: attendance });
  } catch (error) {
    logger.error('Get student attendance error:', error);
    next(error);
  }
};

exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: { $gte: today } }).populate('studentId', 'name age belt');
    res.status(200).json({ status: 'success', results: attendance.length, data: attendance });
  } catch (error) {
    logger.error('Get today attendance error:', error);
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStudents = await Student.countDocuments({ status: 'active' });
    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today } });
    const present = await Attendance.countDocuments({ date: { $gte: today }, status: 'present' });
    const absent = await Attendance.countDocuments({ date: { $gte: today }, status: 'absent' });

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents, todayAttendance, present, absent,
        attendanceRate: totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, status, limit = 100 } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const attendance = await Attendance.find(query).populate('studentId', 'name age belt').limit(parseInt(limit)).sort({ date: -1 });
    res.status(200).json({ status: 'success', results: attendance.length, data: attendance });
  } catch (error) {
    logger.error('Get history error:', error);
    next(error);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const { status, checkInTime } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, { status, checkInTime }, { new: true, runValidators: true }).populate('studentId', 'name age belt');

    if (!attendance) {
      return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
    }

    logger.info(`Attendance updated: ${attendance._id}`);
    res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    logger.error('Update attendance error:', error);
    next(error);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
    }

    logger.info(`Attendance deleted: ${attendance._id}`);
    res.status(200).json({ status: 'success', message: 'Attendance deleted successfully' });
  } catch (error) {
    logger.error('Delete attendance error:', error);
    next(error);
  }
};
