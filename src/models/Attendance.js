const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: [true, 'Status is required'],
    },
    method: {
      type: String,
      enum: ['face_recognition', 'manual'],
      default: 'manual',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance for same day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: false });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

// Virtual to get date without time
attendanceSchema.virtual('dateOnly').get(function () {
  return this.date.toISOString().split('T')[0];
});

module.exports = mongoose.model('Attendance', attendanceSchema);
