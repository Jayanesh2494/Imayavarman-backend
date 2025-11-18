const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all controller and route files...\n');

// Create directories if they don't exist
const dirs = [
  'src/controllers',
  'src/routes'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Define all files
const files = {
  'src/controllers/feeController.js': `const Fee = require('../models/Fee');
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
    logger.info(\`Fee created for student: \${studentId}\`);
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

    logger.info(\`Payment recorded for fee: \${fee._id}\`);
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

    logger.info(\`Fee updated: \${fee._id}\`);
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

    logger.info(\`Fee deleted: \${fee._id}\`);
    res.status(200).json({ status: 'success', message: 'Fee deleted successfully' });
  } catch (error) {
    logger.error('Delete fee error:', error);
    next(error);
  }
};`,

  'src/routes/fees.js': `const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(feeController.getAllFees).post(authorize('admin'), feeController.createFee);
router.get('/student/:studentId', feeController.getStudentFees);
router.post('/:id/payment', authorize('admin'), feeController.recordPayment);
router.route('/:id').put(authorize('admin'), feeController.updateFee).delete(authorize('admin'), feeController.deleteFee);

module.exports = router;`,

  'src/controllers/eventController.js': `const Event = require('../models/Event');
const logger = require('../utils/logger');

exports.getAllEvents = async (req, res, next) => {
  try {
    const { type, upcoming, limit = 50 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const events = await Event.find(query).limit(parseInt(limit)).sort({ date: -1 });
    res.status(200).json({ status: 'success', results: events.length, data: events });
  } catch (error) {
    logger.error('Get events error:', error);
    next(error);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    logger.error('Get event error:', error);
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, location, type, participants } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ status: 'error', message: 'Please provide title, date, and location' });
    }

    const event = await Event.create({ title, description, date, time, location, type: type || 'training', participants: participants || [], createdBy: req.user.id });
    logger.info(\`Event created: \${event.title}\`);
    res.status(201).json({ status: 'success', message: 'Event created successfully', data: event });
  } catch (error) {
    logger.error('Create event error:', error);
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    logger.info(\`Event updated: \${event.title}\`);
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    logger.error('Update event error:', error);
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    logger.info(\`Event deleted: \${event.title}\`);
    res.status(200).json({ status: 'success', message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    next(error);
  }
};`,

  'src/routes/events.js': `const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(eventController.getAllEvents).post(authorize('admin'), eventController.createEvent);
router.route('/:id').get(eventController.getEvent).put(authorize('admin'), eventController.updateEvent).delete(authorize('admin'), eventController.deleteEvent);

module.exports = router;`
};

// Write all files
Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(__dirname, filepath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Created: ${filepath}`);
});

console.log('\n✅ All files created successfully!');
console.log('\nNow run: node server.js\n');
