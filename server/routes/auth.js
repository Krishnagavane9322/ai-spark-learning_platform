const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Certificate = require("../models/Certificate");
const Achievement = require("../models/Achievement");
const auth = require("../middleware/auth");
const updateStreak = require("../utils/streak");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Google OAuth
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("Google Auth Attempt: Received credential length:", credential ? credential.length : 0);
    
    if (!credential) return res.status(400).json({ error: "Google credential required" });

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError.message);
      return res.status(401).json({ error: "Invalid Google token: " + verifyError.message });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }
    const { email, name, picture, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({ error: "Google account must have an email address" });
    }
    console.log("Google Auth Success for:", email);

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new Google user:", email);
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

    await updateStreak(user);

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    console.error("CRITICAL Google Auth error:", error);
    res.status(500).json({ 
      error: "Internal Server Error during Google Auth", 
      details: error.message,
      stack: error.stack
    });
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

    await updateStreak(user);

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

// Get a public user portfolio by username slug
router.get("/portfolio/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    // Map slug back to a potential name regex pattern (case-insensitive, allows space or hyphen for dashes)
    const escaped = slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const nameRegex = new RegExp("^" + escaped.replace(/\\-/g, "[\\s-]") + "$", "i");

    const user = await User.findOne({ name: nameRegex });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's certificates
    const certificates = await Certificate.find({ userId: user._id }).sort({ issuedAt: -1 });

    // Get all achievements to check lock/unlock status
    const achievements = await Achievement.find();
    const userAchievementIds = user.achievements.map(a => a.achievementId?.toString());
    const achievementList = achievements.map(a => ({
      ...a.toJSON(),
      unlocked: userAchievementIds.includes(a._id.toString())
    }));
    
    // Only return unlocked achievements for public view
    const unlockedAchievements = achievementList.filter(a => a.unlocked);

    // Build the public user object (privacy protection)
    const publicUser = {
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      bio: user.bio,
      socialLinks: user.socialLinks,
      skills: user.skills,
      customProjects: user.customProjects
    };

    res.json({
      user: publicUser,
      certificates,
      achievements: unlockedAchievements
    });
  } catch (error) {
    console.error("Public portfolio fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
