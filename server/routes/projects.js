const express = require("express");
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// Multer storage — save screenshots to uploads/projects/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/projects")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const liveProjects = await Promise.all(projects.map(async (project) => {
      const projectObj = project.toObject();
      projectObj.submissions = await User.countDocuments({ completedProjects: project._id });
      return projectObj;
    }));
    res.json(liveProjects);
  } catch (error) {
    console.error("Error in GET /projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit a project (with proof)
router.post("/:id/submit", auth, upload.single("screenshot"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await User.findById(req.userId);
    if (user.completedProjects.some(id => id.toString() === project._id.toString())) {
      return res.status(400).json({ error: "Already submitted this project" });
    }

    // Validate required fields
    const { githubUrl, demoUrl, description } = req.body;
    if (!githubUrl || !githubUrl.trim()) {
      return res.status(400).json({ error: "GitHub repository URL is required" });
    }
    if (!description || description.trim().length < 30) {
      return res.status(400).json({ error: "Description must be at least 30 characters" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "A project screenshot is required" });
    }

    // Save submission data on user
    user.completedProjects.push(project._id);
    user.xp += 200;

    // Store submission details if your User model has a submissions array (optional bonus)
    if (!user.projectSubmissions) user.projectSubmissions = [];
    user.projectSubmissions.push({
      projectId: project._id,
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl ? demoUrl.trim() : "",
      description: description.trim(),
      screenshotPath: req.file.filename,
      submittedAt: new Date(),
    });

    await user.save();

    project.submissions += 1;
    await project.save();

    // Send notification
    await Notification.create({
      userId: user._id,
      type: "system",
      title: `Project Submitted: ${project.title}`,
      message: `Great work! You submitted "${project.title}" and earned +200 XP.`,
      icon: "🚀",
      link: "/projects",
    });

    const submissionsCount = await User.countDocuments({ completedProjects: project._id });
    const projectObj = project.toObject();
    projectObj.submissions = submissionsCount;

    res.json({ message: "Project submitted successfully!", user, project: projectObj, xpEarned: 200 });
  } catch (error) {
    console.error("Project submit error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

module.exports = router;
