const express = require('express');
const router = express.Router();

// Import ALL functions explicitly
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Apply auth to all routes
router.use(protect);

// Define routes explicitly
router.post('/mark-face', authorize('admin'), attendanceController.markByFace);
router.post('/mark-manual', authorize('admin'), attendanceController.markManualAttendance);
router.post('/today-batch', attendanceController.getTodayBatch);
router.get('/student/:id', attendanceController.getStudentAttendance);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/stats', attendanceController.getStats);
router.get('/history', attendanceController.getHistory);
router.patch('/:id', authorize('admin'), attendanceController.updateAttendance);
router.delete('/:id', authorize('admin'), attendanceController.deleteAttendance);

module.exports = router;
