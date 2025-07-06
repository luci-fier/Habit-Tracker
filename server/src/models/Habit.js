const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  reminderTime: {
    type: String,
    default: '21:00' // 9 PM default
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to update streak
habitSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompleted = this.lastCompletedDate ? new Date(this.lastCompletedDate) : null;
  if (lastCompleted) {
    lastCompleted.setHours(0, 0, 0, 0);
  }

  console.log('--- updateStreak Debug ---');
  console.log('Current Date (normalized): ', today.toISOString());
  console.log('Last Completed Date (normalized): ', lastCompleted ? lastCompleted.toISOString() : 'N/A');

  // If no previous completion, start streak at 1
  if (!lastCompleted) {
    this.streakCount = 1;
    console.log('No previous completion, streak set to 1.');
    return;
  }

  const diffDays = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
  console.log('Difference in days: ', diffDays);

  if (diffDays === 1) {
    // Consecutive day, increment streak
    this.streakCount += 1;
    console.log('Consecutive day, streak incremented to: ', this.streakCount);
  } else if (diffDays > 1) {
    // Streak broken, reset to 1
    this.streakCount = 1;
    console.log('Streak broken, reset to 1.');
  } else if (diffDays === 0) {
    console.log('Same day completion, streak unchanged.');
  }
  console.log('--------------------------');
};

// Method to check if habit is due for today
habitSchema.methods.isDueToday = function() {
  if (!this.lastCompletedDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompleted = new Date(this.lastCompletedDate);
  lastCompleted.setHours(0, 0, 0, 0);
  
  return today.getTime() !== lastCompleted.getTime();
};

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit; 