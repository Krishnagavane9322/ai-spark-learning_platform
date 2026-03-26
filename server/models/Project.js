const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  tech: [{ type: String }],
  description: { type: String, required: true },
  submissions: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
