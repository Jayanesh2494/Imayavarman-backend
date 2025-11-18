const Event = require('../models/Event');
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
    logger.info(`Event created: ${event.title}`);
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

    logger.info(`Event updated: ${event.title}`);
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

    logger.info(`Event deleted: ${event.title}`);
    res.status(200).json({ status: 'success', message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    next(error);
  }
};