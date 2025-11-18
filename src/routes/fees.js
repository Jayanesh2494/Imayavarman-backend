const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(feeController.getAllFees).post(authorize('admin'), feeController.createFee);
router.get('/student/:studentId', feeController.getStudentFees);
router.post('/:id/payment', authorize('admin'), feeController.recordPayment);
router.route('/:id').put(authorize('admin'), feeController.updateFee).delete(authorize('admin'), feeController.deleteFee);

module.exports = router;