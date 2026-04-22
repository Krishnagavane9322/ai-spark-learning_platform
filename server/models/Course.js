const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  duration: { type: String, required: true },
  quiz: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true } // Index of the correct option
  }],
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  image: { type: String, default: "📚" },
  modules: { type: Number, default: 0 },
  tags: [{ type: String }],
  description: { type: String, default: "" },
  topics: [{
    name: { type: String },
    videos: [{
      title: { type: String },
      url: { type: String },
      duration: { type: String }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
