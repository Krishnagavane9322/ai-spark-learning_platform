const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  courseTitle: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
