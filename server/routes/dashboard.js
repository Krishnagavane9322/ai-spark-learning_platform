const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const Achievement = require("../models/Achievement");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const updateStreak = require("../utils/streak");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("enrolledCourses")
      .populate("completedProjects");

    const achievements = await Achievement.find();

    // Update streak and activity
    await updateStreak(user);

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

router.get("/leaderboard", auth, async (req, res) => {
  try {
    const sortBy = req.query.sortBy === "streak" ? "streak" : "xp";
    const sortObj = {};
    sortObj[sortBy] = -1;

    // Get top 10 users sorted by selected field
    const topUsers = await User.find({})
      .select("name avatar level xp streak")
      .sort(sortObj)
      .limit(10);

    const currentUser = await User.findById(req.userId).select("name avatar level xp streak");
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Calculate current user's rank for the selected field
    const query = {};
    query[sortBy] = { $gt: currentUser[sortBy] };
    const currentUserRank = await User.countDocuments(query) + 1;

    // Find the next user above the current user
    let nextUserVal = null;
    if (currentUserRank > 1) {
      const nextUserQuery = {};
      nextUserQuery[sortBy] = { $gt: currentUser[sortBy] };
      const nextSortObj = {};
      nextSortObj[sortBy] = 1; // Ascending to find the one closest to us (minimum value greater than ours)
      const nUser = await User.findOne(nextUserQuery).sort(nextSortObj).select("name xp streak");
      if (nUser) {
        nextUserVal = {
          name: nUser.name,
          value: nUser[sortBy]
        };
      }
    }

    res.json({
      leaderboard: topUsers,
      currentUserRank,
      currentUser: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        level: currentUser.level,
        xp: currentUser.xp,
        streak: currentUser.streak
      },
      gapToNext: nextUserVal ? (nextUserVal.value - currentUser[sortBy]) : 0,
      nextUser: nextUserVal ? nextUserVal.name : null
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
