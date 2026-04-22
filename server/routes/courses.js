const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Certificate = require("../models/Certificate");
const auth = require("../middleware/auth");
const crypto = require("crypto");

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Enroll in a course (handles both free and paid)
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await User.findById(req.userId);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // For paid courses, verify payment was confirmed
    if (course.price > 0) {
      const { paymentConfirmed, paymentMethod } = req.body;
      if (!paymentConfirmed) {
        return res.status(400).json({
          error: "Payment required",
          requiresPayment: true,
          price: course.price,
          title: course.title
        });
      }
    }

    user.enrolledCourses.push(course._id);
    user.xp += course.price > 0 ? 100 : 50; // More XP for paid courses
    await user.save();

    course.students += 1;
    await course.save();

    // Create enrollment notification
    await Notification.create({
      userId: user._id,
      type: "course",
      title: `Enrolled: ${course.title}`,
      message: course.price > 0
        ? `Payment of ₹${course.price} confirmed. You earned +100 XP!`
        : `You've enrolled in a free course. +50 XP earned!`,
      icon: "📚",
      link: "/courses"
    });

    res.json({
      message: "Enrolled successfully",
      user,
      course,
      xpEarned: course.price > 0 ? 100 : 50
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Toggle video progress (mark as watched/unwatched)
router.post("/:id/progress", auth, async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: "Video URL required" });

    const user = await User.findById(req.userId);
    const index = user.completedVideos.indexOf(videoUrl);

    if (index === -1) {
      // Mark as completed
      user.completedVideos.push(videoUrl);
      user.xp += 10; // Earn XP for watching a video
      await user.save();
      res.json({ message: "Video marked as completed", completed: true, xpEarned: 10 });
    } else {
      // Unmark (in case of accidental click)
      user.completedVideos.splice(index, 1);
      user.xp = Math.max(0, user.xp - 10);
      await user.save();
      res.json({ message: "Video marked as uncompleted", completed: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Complete a course and issue certificate
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await User.findById(req.userId);
    
    // Check if already completed
    if (user.certificates.some(c => c.courseId.toString() === course._id.toString())) {
      return res.status(400).json({ error: "Certificate already issued for this course" });
    }

    // Verify all videos in the course were watched
    const totalVideos = course.topics?.reduce((acc, t) => acc + (t.videos?.length || 0), 0) || 0;
    const watchedInCourseCount = course.topics?.reduce((acc, t) => {
      return acc + (t.videos?.filter(v => user.completedVideos.includes(v.url)).length || 0);
    }, 0) || 0;

    if (watchedInCourseCount < totalVideos && totalVideos > 0) {
      return res.status(400).json({ 
        error: "Course not yet complete", 
        progress: { watched: watchedInCourseCount, total: totalVideos } 
      });
    }

    // Generate unique certificate ID
    const certificateId = `NP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    
    // Create certificate record
    const certificate = await Certificate.create({
      userId: user._id,
      courseId: course._id,
      certificateId,
      userName: user.name,
      courseTitle: course.title,
      issuedAt: new Date()
    });

    // Update user
    user.certificates.push({
      courseId: course._id,
      certificateId,
      issuedAt: certificate.issuedAt
    });
    user.xp += 500; // Large XP reward for finishing a course
    await user.save();

    // Notification
    await Notification.create({
      userId: user._id,
      type: "system",
      title: "Course Completed! 🎓",
      message: `Congratulations! You've finished "${course.title}". You earned a certificate and +500 XP!`,
      icon: "🏆",
      link: `/portfolio`
    });

    res.json({
      message: "Course completed successfully!",
      certificate,
      xpEarned: 500
    });
  } catch (error) {
    console.error("Course completion error:", error);
    res.status(500).json({ error: "Server error during completion" });
  }
});

module.exports = router;
