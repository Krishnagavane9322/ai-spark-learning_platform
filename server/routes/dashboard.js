const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const Achievement = require("../models/Achievement");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("enrolledCourses")
      .populate("completedProjects");

    const achievements = await Achievement.find();

    // Update weekly activity - track today's login
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    const dayEntry = user.weeklyActivity.find(d => d.day === today);
    if (dayEntry && dayEntry.hours < 5) {
      dayEntry.hours = Math.min(5, dayEntry.hours + 0.5);
      await user.save();
    }

    // Use personalized path if available, otherwise provide a starter message
    let roadmap = [];
    if (user.personalizedPath && user.personalizedPath.length > 0) {
      roadmap = user.personalizedPath;
    }

    // Map achievements with unlock status — only show achievements the user has
    // explicitly earned through their actions, never auto-unlock on dashboard visit.
    const userAchievementIds = user.achievements.map(a => a.achievementId?.toString());
    const achievementList = achievements.map(a => ({
      ...a.toJSON(),
      unlocked: userAchievementIds.includes(a._id.toString())
    }));

    // Update streak - check if user logged in today
    const lastActivity = user.updatedAt;
    const now = new Date();
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity <= 1 && user.streak === 0) {
      user.streak = 1;
      await user.save();
    }

    // Calculate stats
    const stats = {
      streak: user.streak,
      xp: user.xp,
      level: Math.max(1, Math.floor(user.xp / 500) + 1),
      completed: (user.completedProjects?.length || 0) +
        (user.personalizedPath?.filter(p => p.status === "completed").length || 0),
      coursesEnrolled: user.enrolledCourses?.length || 0
    };

    // Update level if changed
    if (stats.level !== user.level) {
      user.level = stats.level;
      await user.save();
    }

    res.json({
      user: { name: user.name, avatar: user.avatar },
      stats,
      roadmap,
      weeklyActivity: user.weeklyActivity,
      achievements: achievementList
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
