const express = require('express');
const Log = require('../models/Log');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();

// Log a habit completion
router.post('/', auth, async (req, res) => {
  try {
    const { habitId, notes } = req.body;

    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Create log entry
    const log = new Log({
      habitId,
      userId: req.user._id,
      notes
    });

    await log.save();

    // Update habit streak (based on existing lastCompletedDate)
    habit.updateStreak();

    // Now update last completed date
    habit.lastCompletedDate = new Date();
    await habit.save();

    res.status(201).json({
      log,
      habit: {
        streakCount: habit.streakCount,
        lastCompletedDate: habit.lastCompletedDate
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get logs for a specific habit
router.get('/habit/:habitId', auth, async (req, res) => {
  try {
    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const logs = await Log.find({ habitId: req.params.habitId })
      .sort({ completedAt: -1 })
      .limit(30); // Last 30 days

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all logs for user
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50); // Last 50 logs

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a log entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    // Get the habit to update streak
    const habit = await Habit.findOne({ _id: log.habitId, userId: req.user._id });
    if (habit) {
      // Recalculate streak based on remaining logs
      const lastLog = await Log.findOne({ habitId: log.habitId })
        .sort({ completedAt: -1 })
        .limit(1);

      habit.lastCompletedDate = lastLog ? lastLog.completedAt : null;
      habit.updateStreak();
      await habit.save();
    }

    await log.remove();
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 