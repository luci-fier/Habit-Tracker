const express = require('express');
const Log = require('../models/Log');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();

// Get analytics data for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all habits for the user
    const habits = await Habit.find({ userId });

    // Fetch all logs for the user
    const logs = await Log.find({ userId }).sort({ completedAt: 1 }); // Sort by date ascending

    // --- Data Aggregation Logic ---
    // This is a simplified example. For more complex analytics,
    // you might consider pre-aggregating data in MongoDB or using a dedicated analytics service.

    const habitCompletionData = {}; // { habitId: [{ date, count }] }
    const overallProgressData = {}; // { date: count }
    const streakHistory = {}; // { habitId: [{ date, streakCount }] }

    // Initialize data structures
    habits.forEach(habit => {
      habitCompletionData[habit._id] = [];
      streakHistory[habit._id] = [];
    });

    let earliestDate = null;
    if (logs.length > 0) {
      earliestDate = new Date(logs[0].completedAt);
      earliestDate.setHours(0, 0, 0, 0);
    } else if (habits.length > 0) {
      // If no logs, but habits exist, start from habit creation date
      let earliestHabitCreation = new Date();
      habits.forEach(habit => {
        if (habit.createdAt && new Date(habit.createdAt) < earliestHabitCreation) {
          earliestHabitCreation = new Date(habit.createdAt);
        }
      });
      earliestDate = earliestHabitCreation;
      earliestDate.setHours(0, 0, 0, 0);
    } else {
      // No habits or logs, return empty data
      return res.json({
        overallProgress: [],
        habitCompletions: [],
        streakHistory: []
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Populate overall progress and habit completion data daily
    let currentDate = new Date(earliestDate);
    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      overallProgressData[dateString] = 0;
      habits.forEach(habit => {
        if (!habitCompletionData[habit._id]) {
          habitCompletionData[habit._id] = [];
        }
        habitCompletionData[habit._id].push({ date: dateString, count: 0 });
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process logs to populate data
    logs.forEach(log => {
      const dateString = new Date(log.completedAt).toISOString().split('T')[0];
      overallProgressData[dateString] = (overallProgressData[dateString] || 0) + 1;

      const habitData = habitCompletionData[log.habitId].find(d => d.date === dateString);
      if (habitData) {
        habitData.count += 1;
      }
    });

    // Format overall progress data
    const formattedOverallProgress = Object.keys(overallProgressData).sort().map(date => ({
      date,
      count: overallProgressData[date]
    }));

    // Format habit completions data
    const formattedHabitCompletions = habits.map(habit => ({
      habitId: habit._id,
      name: habit.name,
      data: habitCompletionData[habit._id].map(d => ({
        date: d.date,
        count: d.count,
      })).sort((a,b) => new Date(a.date) - new Date(b.date))
    }));

    // Recalculate streak history for each habit (this is CPU intensive, consider pre-calculation or simpler display for large data)
    for (const habit of habits) {
      const habitLogs = logs.filter(log => log.habitId.equals(habit._id)).sort((a, b) => a.completedAt - b.completedAt);
      let currentStreak = 0;
      let lastLogDate = null;

      for (const log of habitLogs) {
        const logDate = new Date(log.completedAt);
        logDate.setHours(0, 0, 0, 0);

        if (lastLogDate) {
          const diffDays = Math.floor((logDate - lastLogDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak += 1;
          } else if (diffDays > 1) {
            currentStreak = 1; // Streak broken, reset
          }
        } else {
          currentStreak = 1;
        }
        streakHistory[habit._id].push({
          date: logDate.toISOString().split('T')[0],
          streak: currentStreak
        });
        lastLogDate = logDate;
      }
    }

    const formattedStreakHistory = habits.map(habit => ({
      habitId: habit._id,
      name: habit.name,
      data: streakHistory[habit._id].sort((a,b) => new Date(a.date) - new Date(b.date))
    }));

    res.json({
      overallProgress: formattedOverallProgress,
      habitCompletions: formattedHabitCompletions,
      streakHistory: formattedStreakHistory
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 