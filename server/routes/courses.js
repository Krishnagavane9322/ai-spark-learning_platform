const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

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
        ? `Payment of $${course.price} confirmed. You earned +100 XP!`
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

module.exports = router;
