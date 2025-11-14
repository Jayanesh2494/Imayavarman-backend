const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [5, 'Age must be at least 5'],
      max: [100, 'Age must be less than 100'],
    },
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid phone number'],
    },
    parentPhone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    belt: {
      type: String,
      enum: ['Beginner', 'Yellow Belt', 'Green Belt', 'Brown Belt', 'Black Belt'],
      default: 'Beginner',
    },
    achievements: [{
      type: String,
    }],
    faceEmbedding: {
      type: [Number],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ name: 'text' });
studentSchema.index({ status: 1 });
studentSchema.index({ enrollmentDate: -1 });

module.exports = mongoose.model('Student', studentSchema);
