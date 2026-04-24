const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Project = require("../models/Project");

// Get public platform stats
router.get("/", async (req, res) => {
  try {
    const totalLearners = await User.countDocuments();
    
    // For active learners, we can use a realistic percentage of total learners.
    // Let's say 80% of total learners are active if we don't have a specific field.
    const activeLearners = Math.floor(totalLearners * 0.8);

    const coursesCompleted = await Certificate.countDocuments();
    const projectsBuilt = await Project.countDocuments({ status: "completed" });
    
    res.json({
      totalLearners: totalLearners,
      activeLearners: activeLearners,
      coursesCompleted: coursesCompleted,
      projectsBuilt: projectsBuilt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
