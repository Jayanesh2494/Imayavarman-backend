const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi'],
    },
    transactionId: {
      type: String,
    },
    month: {
      type: String,
    },
    year: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
feeSchema.index({ studentId: 1, month: 1, year: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });

// Update status to overdue if past due date
feeSchema.pre('save', function (next) {
  if (this.status === 'pending' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
