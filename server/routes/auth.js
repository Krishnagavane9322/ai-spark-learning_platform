const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Google OAuth
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google
      user = new User({
        name,
        email,
        password: `google_${googleId}_${Date.now()}`, // placeholder password
        avatar: "👨‍💻",
        skills: [
          { name: "JavaScript", level: 0 },
          { name: "React", level: 0 },
          { name: "Python", level: 0 },
          { name: "Node.js", level: 0 },
          { name: "CSS/Tailwind", level: 0 },
          { name: "SQL", level: 0 }
        ],
        roadmapProgress: [
          { stageId: 1, status: "current" },
          { stageId: 2, status: "locked" },
          { stageId: 3, status: "locked" },
          { stageId: 4, status: "locked" },
          { stageId: 5, status: "locked" },
          { stageId: 6, status: "locked" },
          { stageId: 7, status: "locked" },
          { stageId: 8, status: "locked" }
        ],
        weeklyActivity: [
          { day: "Mon", hours: 0 },
          { day: "Tue", hours: 0 },
          { day: "Wed", hours: 0 },
          { day: "Thu", hours: 0 },
          { day: "Fri", hours: 0 },
          { day: "Sat", hours: 0 },
          { day: "Sun", hours: 0 }
        ]
      });
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      skills: [
        { name: "JavaScript", level: 0 },
        { name: "React", level: 0 },
        { name: "Python", level: 0 },
        { name: "Node.js", level: 0 },
        { name: "CSS/Tailwind", level: 0 },
        { name: "SQL", level: 0 }
      ],
      roadmapProgress: [
        { stageId: 1, status: "current" },
        { stageId: 2, status: "locked" },
        { stageId: 3, status: "locked" },
        { stageId: 4, status: "locked" },
        { stageId: 5, status: "locked" },
        { stageId: 6, status: "locked" },
        { stageId: 7, status: "locked" },
        { stageId: 8, status: "locked" }
      ],
      weeklyActivity: [
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 }
      ]
    });

    await user.save();

    // Create welcome notifications
    await Notification.insertMany([
      { userId: user._id, type: "system", title: "Welcome to NeuralPath! 🎉", message: "Your account is ready. Start your personalized learning journey today!", icon: "🚀", link: "/dashboard" },
      { userId: user._id, type: "course", title: "Take Your Assessment", message: "Complete the knowledge quiz to get a personalized learning path.", icon: "📝", link: "/dashboard" },
      { userId: user._id, type: "social", title: "Connect with Peers", message: "Find study partners and collaborate on projects together.", icon: "👥", link: "/peers" },
    ]);

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update streak (simple daily check)
    const today = new Date().toDateString();
    const lastLogin = user.updatedAt ? new Date(user.updatedAt).toDateString() : null;
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      user.streak = lastLogin === yesterday ? user.streak + 1 : 1;

      // Update weekly activity
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayDay = dayNames[new Date().getDay()];
      const dayEntry = user.weeklyActivity.find(d => d.day === todayDay);
      if (dayEntry) dayEntry.hours += 0.5;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    // In production, send reset email here
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("enrolledCourses")
      .populate("completedProjects");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile (portfolio data)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, socialLinks, customProjects, skills } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (customProjects) user.customProjects = customProjects;
    if (skills) user.skills = skills;

    await user.save();
    
    // Return populated user 
    const updatedUser = await User.findById(req.userId)
      .populate("enrolledCourses")
      .populate("completedProjects");
      
    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Server error during profile update" });
  }
});

module.exports = router;
