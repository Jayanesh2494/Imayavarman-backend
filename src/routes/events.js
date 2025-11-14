const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getPastEvents,
  getEventsByCategory,
  uploadEventImage,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { createEventValidation } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getEvents)
  .post(authorize('admin'), createEventValidation, createEvent);

router.get('/upcoming', getUpcomingEvents);
router.get('/past', getPastEvents);
router.get('/category/:category', getEventsByCategory);

router
  .route('/:id')
  .get(getEvent)
  .put(authorize('admin'), updateEvent)
  .delete(authorize('admin'), deleteEvent);

router.post('/:id/upload-image', authorize('admin'), uploadEventImage);

module.exports = router;
