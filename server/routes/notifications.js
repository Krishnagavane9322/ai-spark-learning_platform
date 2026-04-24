const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// Helper to validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all notifications for user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark single notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  } catch (error) {
    console.error("Notification read error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark all as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a notification
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Notification delete error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
