const express = require("express");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const crypto = require("crypto");

const router = express.Router();

// Publicly verify a certificate
router.get("/verify/:id", async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate("userId", "name avatar bio");
    
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found or invalid" });
    }
    
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's own certificates
router.get("/my-certificates", auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.userId }).sort({ issuedAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
