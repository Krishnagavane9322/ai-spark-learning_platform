const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["achievement", "course", "system", "social", "streak", "xp"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String, default: "🔔" },
  read: { type: Boolean, default: false },
  link: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
