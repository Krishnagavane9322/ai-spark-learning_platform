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

    // Map achievements with unlock status
    const userAchievementIds = user.achievements.map(a => a.achievementId?.toString());
    const achievementList = achievements.map(a => ({
      ...a.toJSON(),
      unlocked: userAchievementIds.includes(a._id.toString())
    }));

    // Auto-unlock achievements based on user activity
    const achievementsToUnlock = [];

    // "First Steps" - completed assessment
    const firstSteps = achievements.find(a => a.title === "First Steps");
    if (firstSteps && user.assessmentCompleted && !userAchievementIds.includes(firstSteps._id.toString())) {
      achievementsToUnlock.push(firstSteps._id);
    }

    // "Social Butterfly" - has connections
    const socialButterfly = achievements.find(a => a.title === "Social Butterfly");
    if (socialButterfly && user.connections.length > 0 && !userAchievementIds.includes(socialButterfly._id.toString())) {
      achievementsToUnlock.push(socialButterfly._id);
    }

    // Unlock any pending achievements
    if (achievementsToUnlock.length > 0) {
      for (const achId of achievementsToUnlock) {
        user.achievements.push({ achievementId: achId, unlockedAt: new Date() });
        user.xp += 50;
        const ach = achievements.find(a => a._id.toString() === achId.toString());
        if (ach) {
          await Notification.create({
            userId: user._id,
            type: "achievement",
            title: `Achievement Unlocked: ${ach.title}!`,
            message: `You earned the "${ach.title}" badge! +50 XP`,
            icon: ach.icon || "🏆",
            link: "/dashboard"
          });
        }
      }
      await user.save();
      // Refresh achievement list
      const newAchievementIds = user.achievements.map(a => a.achievementId?.toString());
      achievementList.forEach(a => {
        if (newAchievementIds.includes(a._id.toString())) a.unlocked = true;
      });
    }

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
