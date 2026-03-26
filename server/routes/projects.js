const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Submit a project
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await User.findById(req.userId);
    if (user.completedProjects.includes(project._id)) {
      return res.status(400).json({ error: "Already submitted this project" });
    }

    user.completedProjects.push(project._id);
    user.xp += 200;
    await user.save();

    project.submissions += 1;
    await project.save();

    res.json({ message: "Project submitted!", user, project });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
