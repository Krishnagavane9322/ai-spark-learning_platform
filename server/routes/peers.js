const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all peers (other users)
router.get("/", auth, async (req, res) => {
  try {
    const peers = await User.find({ _id: { $ne: req.userId } })
      .select("name avatar skills level xp")
      .limit(20);

    const peersWithStatus = peers.map(peer => ({
      ...peer.toJSON(),
      online: Math.random() > 0.4 // Simulated online status
    }));

    res.json(peersWithStatus);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Connect with a peer
router.post("/:id/connect", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const peer = await User.findById(req.params.id);
    if (!peer) return res.status(404).json({ error: "User not found" });

    if (user.connections.includes(peer._id)) {
      return res.status(400).json({ error: "Already connected" });
    }

    user.connections.push(peer._id);
    peer.connections.push(user._id);
    user.xp += 25;
    await user.save();
    await peer.save();

    res.json({ message: "Connected!", user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
