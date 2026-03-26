const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// Get conversation with a specific peer
router.get("/:peerId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: req.params.peerId },
        { senderId: req.params.peerId, receiverId: req.userId },
      ],
    }).sort({ createdAt: 1 }); // Oldest to newest

    // Mark received messages as read
    await Message.updateMany(
      { senderId: req.params.peerId, receiverId: req.userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Send a message
router.post("/:peerId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

    const receiver = await User.findById(req.params.peerId);
    if (!receiver) return res.status(404).json({ error: "User not found" });

    const message = await Message.create({
      senderId: req.userId,
      receiverId: receiver._id,
      text: text.trim(),
    });

    // Create notification for receiver
    const sender = await User.findById(req.userId);
    await Notification.create({
      userId: receiver._id,
      type: "achievement", // Using achievement type for now as an icon placeholder
      title: `New message from ${sender.name}`,
      message: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      icon: "💬",
      link: "/peers",
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
