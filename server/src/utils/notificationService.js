const nodemailer = require('nodemailer');
const User = require('../models/User');
const Habit = require('../models/Habit');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
const sendEmailNotification = async (user, habit) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: Complete your habit "${habit.name}"`,
      html: `
        <h1>Don't break your streak!</h1>
        <p>Hi ${user.name},</p>
        <p>You haven't logged your habit "${habit.name}" today. Your current streak is ${habit.streakCount} days.</p>
        <p>Don't let your hard work go to waste! Log your habit now to maintain your streak.</p>
        <p>Best regards,<br>Habit Tracker Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email notification error:', error);
  }
};

// Send in-app notification via WebSocket
const sendInAppNotification = (io, userId, habit) => {
  io.to(userId.toString()).emit('notification', {
    type: 'habit_reminder',
    message: `Don't forget to complete "${habit.name}" today!`,
    habitId: habit._id,
    streakCount: habit.streakCount
  });
};

// Check and send notifications for due habits
const checkAndSendNotifications = async (io) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find all active habits that are due for notification
    const habits = await Habit.find({
      isActive: true,
      reminderTime: {
        $regex: `^${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      }
    }).populate('userId');

    for (const habit of habits) {
      if (habit.isDueToday()) {
        const user = habit.userId;

        // Send in-app notification if enabled
        if (user.notificationPreferences.inApp) {
          sendInAppNotification(io, user._id, habit);
        }

        // Send email notification if enabled
        if (user.notificationPreferences.email) {
          await sendEmailNotification(user, habit);
        }
      }
    }
  } catch (error) {
    console.error('Notification check error:', error);
  }
};

module.exports = {
  checkAndSendNotifications,
  sendInAppNotification
}; 