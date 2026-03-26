const express = require("express");
const Note = require("../models/Note");
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const fs = require("fs-extra");
const path = require("path");

const router = express.Router();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "../uploads");
fs.ensureDirSync(uploadsDir);

const upload = multer({ dest: uploadsDir });

// Helper to generate flashcards from text
function generateFlashcards(text) {
  if (!text || text.trim().length < 10) {
    return [{ front: "Not enough text", back: "Please upload a clearer document." }];
  }

  // Clean up text format slightly for splitting
  const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ");
  // Split roughly by periods, newlines, or bullet points
  const candidateSentences = cleanText.split(/[.!?\n•-]+/g).filter(s => s.trim().length > 15);
  const cards = [];

  for (let s of candidateSentences) {
    s = s.trim();
    if (s.length > 200) s = s.substring(0, 200) + "..."; // prevent huge cards
    
    let front = s;
    let back = "Review this concept.";

    if (s.includes(" is ")) {
      const parts = s.split(" is ");
      front = "What is " + parts[0].trim() + "?";
      back = parts.slice(1).join(" is ").trim();
    } else if (s.includes(" are ")) {
      const parts = s.split(" are ");
      front = "What are " + parts[0].trim() + "?";
      back = parts.slice(1).join(" are ").trim();
    } else if (s.includes(":")) {
      const parts = s.split(":");
      front = "Define: " + parts[0].trim();
      back = parts.slice(1).join(":").trim();
    } else {
      // Just split in half to guarantee a card
      const words = s.split(" ");
      const mid = Math.floor(words.length / 2);
      front = words.slice(0, mid).join(" ") + "...";
      back = words.slice(mid).join(" ");
    }

    cards.push({ front, back });
    if (cards.length >= 10) break; // Limit to 10 cards
  }

  // Fallback if parsing completely failed
  if (cards.length === 0) {
    cards.push({ 
      front: "Main Topic", 
      back: cleanText.substring(0, 100) + "..." 
    });
  }

  return cards;
}

// Helper to generate mindmap from text
function generateMindmap(text) {
  if (!text || text.trim().length < 10) {
    return { center: "Document", branches: ["No text found"] };
  }

  // Find all words 4+ letters
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  
  if (words.length === 0) {
    return { center: "Concept", branches: ["Detail 1", "Detail 2"] };
  }

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  // Comprehensive stop words
  const stopWords = [
    "this", "that", "with", "from", "they", "have", "what", "which",
    "there", "their", "when", "will", "would", "could", "should", "your",
    "about", "these", "those", "some", "other", "into", "than", "only"
  ];
  
  const meaningful = sorted
    .filter(kv => !stopWords.includes(kv[0]))
    .map(kv => kv[0].charAt(0).toUpperCase() + kv[0].slice(1)); // Capitalize
  
  const center = meaningful[0] || "Main Idea";
  const branches = meaningful.slice(1, 9);
  
  // Guarantee branches exist
  if (branches.length === 0) {
    branches.push("Concept A", "Concept B");
  }

  return { center, branches };
}

// Get all notes for user
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a note with actual file upload and OCR/Parsing
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalFilename = file.originalname;
    let extractedText = "";

    // Process file based on mimetype
    try {
      if (file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else if (file.mimetype.startsWith("image/")) {
        const { data: { text } } = await tesseract.recognize(file.path, "eng");
        extractedText = text;
      } else {
        extractedText = "Unsupported file format. Please upload PDF or Images.";
      }
    } catch (parseError) {
      console.error("Extraction error:", parseError);
      extractedText = "Failed to extract text from the file.";
    }

    // Cleanup temp uploaded file
    await fs.remove(file.path);

    // Clean up extracted text a bit
    extractedText = (extractedText || "").trim().replace(/\n{3,}/g, '\n\n');
    if (!extractedText) extractedText = "No readable text found in document.";

    // Generate heuristics
    const flashcards = generateFlashcards(extractedText);
    const mindmapData = generateMindmap(extractedText);

    const note = new Note({
      userId: req.userId,
      title: title || originalFilename || "Untitled Note",
      originalFilename,
      extractedText,
      flashcards,
      mindmapData
    });

    await note.save();

    // Award XP
    const user = await User.findById(req.userId);
    user.xp += 30;
    await user.save();

    res.status(201).json(note);
  } catch (error) {
    console.error("Notes upload error:", error);
    res.status(500).json({ error: "Server error during file processing." });
  }
});

// Delete a note
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
