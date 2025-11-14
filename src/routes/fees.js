const express = require('express');
const {
  getFeesByStudent,
  createFee,
  recordPayment,
  getPaymentHistory,
  getPendingFees,
  getOverdueFees,
  updateFee,
  deleteFee,
  getFeeStats,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');
const { createFeeValidation } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', authorize('admin'), createFeeValidation, createFee);
router.get('/student/:id', getFeesByStudent);
router.get('/history/:studentId', getPaymentHistory);
router.get('/pending', authorize('admin'), getPendingFees);
router.get('/overdue', authorize('admin'), getOverdueFees);
router.get('/stats', authorize('admin'), getFeeStats);

router.post('/:id/payment', authorize('admin'), recordPayment);

router
  .route('/:id')
  .patch(authorize('admin'), updateFee)
  .delete(authorize('admin'), deleteFee);

module.exports = router;
