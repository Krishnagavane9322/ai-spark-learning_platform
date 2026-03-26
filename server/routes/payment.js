const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

// Initialize Razorpay (only if keys are configured)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create Razorpay Order
router.post("/create-order", auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env" });
    }
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await User.findById(req.userId);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    if (course.price === 0) {
      return res.status(400).json({ error: "This is a free course, no payment needed" });
    }

    // Convert USD to INR (approximate) — Razorpay works in paise (INR)
    const amountInPaise = Math.round(course.price * 83 * 100); // $1 ≈ ₹83

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `course_${course._id}_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        userId: req.userId,
        courseTitle: course.title,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Verify Payment & Enroll
router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Payment verified — enroll user
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await User.findById(req.userId);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    user.enrolledCourses.push(course._id);
    user.xp += 100; // Bonus XP for paid enrollment
    await user.save();

    course.students += 1;
    await course.save();

    // Create notification
    await Notification.create({
      userId: user._id,
      type: "course",
      title: `Enrolled: ${course.title}`,
      message: `Payment verified successfully! You earned +100 XP.`,
      icon: "📚",
      link: "/courses",
    });

    res.json({
      message: "Payment verified and enrolled successfully",
      user,
      course,
      xpEarned: 100,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
