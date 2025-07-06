const express = require('express');
const Habit = require('../models/Habit');
const Log = require('../models/Log');
const auth = require('../middleware/auth');

const router = express.Router();

// Get streak information for all habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    
    const streakInfo = await Promise.all(habits.map(async (habit) => {
      // Get the last 7 days of logs
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentLogs = await Log.find({
        habitId: habit._id,
        completedAt: { $gte: sevenDaysAgo }
      }).sort({ completedAt: 1 });

      // Calculate completion rate for the last 7 days
      const completionRate = (recentLogs.length / 7) * 100;

      return {
        habitId: habit._id,
        name: habit.name,
        currentStreak: habit.streakCount,
        lastCompletedDate: habit.lastCompletedDate,
        completionRate,
        isDueToday: habit.isDueToday()
      };
    }));

    res.json(streakInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streak information for a specific habit
router.get('/:habitId', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get the last 30 days of logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLogs = await Log.find({
      habitId: habit._id,
      completedAt: { $gte: thirtyDaysAgo }
    }).sort({ completedAt: 1 });

    // Calculate completion rate for the last 30 days
    const completionRate = (recentLogs.length / 30) * 100;

    // Calculate longest streak in the last 30 days
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    recentLogs.forEach(log => {
      const logDate = new Date(log.completedAt);
      logDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const diffDays = Math.floor((logDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = logDate;
    });

    res.json({
      habitId: habit._id,
      name: habit.name,
      currentStreak: habit.streakCount,
      longestStreak,
      lastCompletedDate: habit.lastCompletedDate,
      completionRate,
      isDueToday: habit.isDueToday(),
      recentLogs: recentLogs.map(log => ({
        date: log.completedAt,
        notes: log.notes
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 