const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  duration: { type: String, required: true },
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  image: { type: String, default: "📚" },
  modules: { type: Number, default: 0 },
  tags: [{ type: String }],
  description: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
