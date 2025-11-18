const Fee = require('../models/Fee');
const logger = require('../utils/logger');

exports.getAllFees = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const fees = await Fee.find(query).populate('studentId', 'name phoneNumber').limit(parseInt(limit)).sort({ dueDate: -1 });
    res.status(200).json({ status: 'success', results: fees.length, data: fees });
  } catch (error) {
    logger.error('Get fees error:', error);
    next(error);
  }
};

exports.getStudentFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId }).sort({ dueDate: -1 });
    res.status(200).json({ status: 'success', results: fees.length, data: fees });
  } catch (error) {
    logger.error('Get student fees error:', error);
    next(error);
  }
};

exports.createFee = async (req, res, next) => {
  try {
    const { studentId, amount, dueDate, type, description } = req.body;
    if (!studentId || !amount || !dueDate) {
      return res.status(400).json({ status: 'error', message: 'Please provide studentId, amount, and dueDate' });
    }

    const fee = await Fee.create({ studentId, amount, dueDate, type: type || 'monthly', description, status: 'pending' });
    logger.info(`Fee created for student: ${studentId}`);
    res.status(201).json({ status: 'success', message: 'Fee created successfully', data: fee });
  } catch (error) {
    logger.error('Create fee error:', error);
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee record not found' });
    }

    fee.amountPaid = (fee.amountPaid || 0) + amountPaid;
    fee.paymentDate = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.status = fee.amountPaid >= fee.amount ? 'paid' : 'partial';
    await fee.save();

    logger.info(`Payment recorded for fee: ${fee._id}`);
    res.status(200).json({ status: 'success', message: 'Payment recorded successfully', data: fee });
  } catch (error) {
    logger.error('Record payment error:', error);
    next(error);
  }
};

exports.updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee record not found' });
    }

    logger.info(`Fee updated: ${fee._id}`);
    res.status(200).json({ status: 'success', data: fee });
  } catch (error) {
    logger.error('Update fee error:', error);
    next(error);
  }
};

exports.deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee record not found' });
    }

    logger.info(`Fee deleted: ${fee._id}`);
    res.status(200).json({ status: 'success', message: 'Fee deleted successfully' });
  } catch (error) {
    logger.error('Delete fee error:', error);
    next(error);
  }
};