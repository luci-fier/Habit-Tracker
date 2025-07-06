const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Habit'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
logSchema.index({ habitId: 1, completedAt: 1 });
logSchema.index({ userId: 1, completedAt: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log; 