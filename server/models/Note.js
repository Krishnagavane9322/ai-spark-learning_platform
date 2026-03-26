const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled Note" },
  originalFilename: { type: String },
  extractedText: { type: String, default: "" },
  flashcards: [{
    front: { type: String },
    back: { type: String }
  }],
  mindmapData: {
    center: { type: String },
    branches: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
