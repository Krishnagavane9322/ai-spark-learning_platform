const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) return res.status(400).json({ error: "Email already in use" });
      user.email = email;
    }
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update notification settings
router.put("/notifications", auth, async (req, res) => {
  try {
    const { notifications, weeklyDigest } = req.body;
    const user = await User.findById(req.userId);

    if (notifications !== undefined) user.settings.notifications = notifications;
    if (weeklyDigest !== undefined) user.settings.weeklyDigest = weeklyDigest;

    await user.save();
    res.json({ message: "Settings updated", settings: user.settings });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Change password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
