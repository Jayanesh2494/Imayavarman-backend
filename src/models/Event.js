const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
    },
    location: {
      type: String,
    },
    category: {
      type: String,
      enum: ['competition', 'workshop', 'ceremony', 'practice', 'other'],
      default: 'other',
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],
    images: [{
      type: String,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ date: -1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
