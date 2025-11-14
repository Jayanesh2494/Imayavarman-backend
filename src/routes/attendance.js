const express = require('express');
const {
  markAttendanceByFace,
  markManualAttendance,
  getTodayBatch,
  getStudentAttendance,
  getTodayAttendance,
  getStats,
  getHistory,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { markAttendanceValidation } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/mark', authorize('admin'), markAttendanceValidation, markAttendanceByFace);
router.post('/mark-manual', authorize('admin'), markManualAttendance);
router.post('/today-batch', getTodayBatch);
router.get('/student/:id', getStudentAttendance);
router.get('/today', getTodayAttendance);
router.get('/stats', getStats);
router.get('/history', getHistory);

router
  .route('/:id')
  .patch(authorize('admin'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;
