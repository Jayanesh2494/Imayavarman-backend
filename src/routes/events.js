const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(eventController.getAllEvents).post(authorize('admin'), eventController.createEvent);
router.route('/:id').get(eventController.getEvent).put(authorize('admin'), eventController.updateEvent).delete(authorize('admin'), eventController.deleteEvent);

module.exports = router;