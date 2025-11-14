const Fee = require('../models/Fee');
const logger = require('../utils/logger');

// @desc    Get fees by student
// @route   GET /api/fees/student/:id
// @access  Private
exports.getFeesByStudent = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.id })
      .populate('studentId', 'name')
      .sort({ dueDate: -1 });

    res.status(200).json({
      status: 'success',
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee
// @route   POST /api/fees
// @access  Private (Admin)
exports.createFee = async (req, res, next) => {
  try {
    const fee = await Fee.create(req.body);

    logger.info(`New fee created for student: ${req.body.studentId} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment
// @route   POST /api/fees/:id/payment
// @access  Private (Admin)
exports.recordPayment = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId, paidDate } = req.body;

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee not found',
      });
    }

    fee.status = 'paid';
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.paidDate = paidDate || new Date();

    await fee.save();

    logger.info(`Payment recorded for fee: ${fee._id} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/fees/history/:studentId
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const fees = await Fee.find({
      studentId: req.params.studentId,
      status: 'paid',
    })
      .sort({ paidDate: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending fees
// @route   GET /api/fees/pending
// @access  Private (Admin)
exports.getPendingFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ status: 'pending' })
      .populate('studentId', 'name phoneNumber')
      .sort({ dueDate: 1 });

    res.status(200).json({
      status: 'success',
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue fees
// @route   GET /api/fees/overdue
// @access  Private (Admin)
exports.getOverdueFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() },
    })
      .populate('studentId', 'name phoneNumber parentPhone')
      .sort({ dueDate: 1 });

    res.status(200).json({
      status: 'success',
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee
// @route   PATCH /api/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee not found',
      });
    }

    logger.info(`Fee deleted: ${fee._id} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Fee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee statistics
// @route   GET /api/fees/stats
// @access  Private (Admin)
exports.getFeeStats = async (req, res, next) => {
  try {
    const pending = await Fee.countDocuments({ status: 'pending' });
    const overdue = await Fee.countDocuments({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() },
    });

    const paidFees = await Fee.find({ status: 'paid' });
    const totalCollected = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyFees = await Fee.find({
      status: 'paid',
      paidDate: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      },
    });
    const monthlyRevenue = monthlyFees.reduce((sum, fee) => sum + fee.amount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalPending: pending,
        totalOverdue: overdue,
        totalCollected,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
