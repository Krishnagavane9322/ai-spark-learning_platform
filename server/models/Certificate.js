const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  certificateId: { type: String, required: true, unique: true }, // e.g., "NP-XXXX-XXXX"
  userName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  verificationUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
