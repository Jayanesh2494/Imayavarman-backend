const Event = require('../models/Event');
const logger = require('../utils/logger');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'username')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('participants', 'name age belt');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin)
exports.createEvent = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const event = await Event.create(req.body);

    logger.info(`New event created: ${event.title} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    logger.info(`Event updated: ${event.title} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    logger.info(`Event deleted: ${event.title} by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get past events
// @route   GET /api/events/past
// @access  Private
exports.getPastEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      date: { $lt: new Date() },
    })
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Private
exports.getEventsByCategory = async (req, res, next) => {
  try {
    const events = await Event.find({ category: req.params.category }).sort({
      date: -1,
    });

    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload event image
// @route   POST /api/events/:id/upload-image
// @access  Private (Admin)
exports.uploadEventImage = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an image',
      });
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just store the base64 or URL
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    event.images.push(image);
    await event.save();

    res.status(200).json({
      status: 'success',
      imageUrl: image,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
