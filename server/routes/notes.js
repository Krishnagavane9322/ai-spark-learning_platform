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
  if (!text || text.trim().length < 20) {
    return [{ front: "Not enough text extracted", back: "Please upload a clearer document with more readable text." }];
  }

  const cards = [];
  const cleanText = text.replace(/\r/g, "").replace(/\n{2,}/g, "\n");
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.split(" ").length >= 5);

  for (const s of sentences) {
    const truncated = s.length > 250 ? s.substring(0, 250) + "..." : s;

    // Pattern 1: "X is Y" → "What is X?" / "Y"
    if (/ is /i.test(truncated)) {
      const idx = truncated.search(/ is /i);
      const subject = truncated.substring(0, idx).replace(/^(a|an|the)\s+/i, "").trim();
      const definition = truncated.substring(idx + 4).trim();
      if (subject.length > 2 && definition.length > 5) {
        cards.push({ front: `What is ${subject}?`, back: definition });
        continue;
      }
    }

    // Pattern 2: "X are Y" → "What are X?" / "Y"
    if (/ are /i.test(truncated)) {
      const idx = truncated.search(/ are /i);
      const subject = truncated.substring(0, idx).replace(/^(a|an|the)\s+/i, "").trim();
      const definition = truncated.substring(idx + 5).trim();
      if (subject.length > 2 && definition.length > 5) {
        cards.push({ front: `What are ${subject}?`, back: definition });
        continue;
      }
    }

    // Pattern 3: "Term: Description" → "Define Term" / "Description"
    if (/:\s/.test(truncated)) {
      const colonIdx = truncated.indexOf(": ");
      const term = truncated.substring(0, colonIdx).trim();
      const desc = truncated.substring(colonIdx + 2).trim();
      if (term.length > 2 && term.split(" ").length <= 6 && desc.length > 10) {
        cards.push({ front: `Define: ${term}`, back: desc });
        continue;
      }
    }

    // Pattern 4: Turn any long declarative sentence into a fill-in-the-blank or question
    const words = truncated.split(" ");
    if (words.length >= 8) {
      // Find the most meaningful noun-ish word to blank out (not first/last, not stopwords)
      const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "has", "have", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "that", "this", "these", "those", "and", "but", "or", "so", "if", "in", "on", "at", "to", "for", "of", "with", "by", "from", "about", "as", "into", "through", "during", "before", "after", "above", "below", "between", "out", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "how", "all", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "than", "too", "very", "just", "can"]);
      let blankIdx = -1;
      for (let i = 2; i < words.length - 2; i++) {
        const w = words[i].replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (w.length >= 4 && !stopWords.has(w)) { blankIdx = i; break; }
      }
      if (blankIdx !== -1) {
        const blanked = [...words];
        const answer = blanked[blankIdx].replace(/[.,!?;]$/, "");
        blanked[blankIdx] = "_______";
        cards.push({ front: `Fill in the blank:\n"${blanked.join(" ")}"`, back: `Answer: ${answer}` });
        continue;
      }
      // Fallback: ask about the full sentence
      cards.push({ front: `Explain this concept:\n"${words.slice(0, 10).join(" ")}..."`, back: truncated });
    }

    if (cards.length >= 12) break;
  }

  // Always guarantee at least 3 cards
  if (cards.length === 0) {
    const chunks = [];
    const allSentences = text.replace(/\r/g, "").split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    for (let i = 0; i < Math.min(3, allSentences.length); i++) {
      chunks.push({ front: `Key Point ${i + 1}`, back: allSentences[i] });
    }
    if (chunks.length === 0) chunks.push({ front: "Main Topic", back: text.trim().substring(0, 150) });
    return chunks;
  }

  return cards;
}

// Helper to generate mindmap from text
function generateMindmap(text) {
  if (!text || text.trim().length < 20) {
    return { center: "Document", branches: ["Upload a clearer file", "More text needed"] };
  }

  const lines = text.replace(/\r/g, "").split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const sentences = text.replace(/\r/g, "").split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 20);

  // Extract meaningful 2-4 word phrases (noun-like phrases)
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "has", "have", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "that", "this", "these", "those", "and", "but", "or", "so", "if", "in", "on", "at", "to", "for", "of", "with", "by", "from", "about", "as", "into", "also", "through", "during", "before", "after", "above", "below", "between", "out", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "how", "all", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "than", "too", "very", "just", "can", "its", "it", "we", "they", "you", "he", "she", "our", "their", "your", "which", "what", "who"]);

  // 1. Try to find key phrases from headings/short lines
  const headingPhrases = lines
    .filter(l => l.length >= 4 && l.length <= 60 && !l.endsWith(".") && l.split(" ").length <= 6)
    .map(l => l.replace(/^[\d.\-*•]+\s*/, "").trim())
    .filter(l => l.length > 3);

  // 2. Extract high-frequency meaningful single words for fallback
  const allWords = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq = {};
  for (const w of allWords) {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .filter(([w]) => !stopWords.has(w))
    .slice(0, 20)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  // 3. Extract 2-word collocations from sentences
  const bigrams = {};
  for (const sent of sentences) {
    const words = sent.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigrams[bigram] = (bigrams[bigram] || 0) + 1;
    }
  }
  const topBigrams = Object.entries(bigrams)
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([bg]) => bg.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

  // Build branches: prefer headings, then bigrams, then single words
  const branchSet = new Set();
  for (const h of headingPhrases) { if (branchSet.size < 8) branchSet.add(h); }
  for (const b of topBigrams) { if (branchSet.size < 8) branchSet.add(b); }
  for (const w of topWords) { if (branchSet.size < 8) branchSet.add(w); }

  let branches = Array.from(branchSet);
  if (branches.length < 2) branches = [...topWords.slice(0, 6), "Key Concept", "Main Idea"];

  // Center = most dominant topic word or first heading
  const center = headingPhrases[0] || topWords[0] || "Main Topic";
  // Remove center from branches
  const finalBranches = branches.filter(b => b.toLowerCase() !== center.toLowerCase()).slice(0, 8);

  return { center, branches: finalBranches };
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
    const noteId = req.params.id;
    const userId = req.userId;
    
    console.log(`Attempting to delete note ${noteId} for user ${userId}`);
    
    const note = await Note.findById(noteId);
    
    if (!note) {
      console.log(`Note ${noteId} not found in database`);
      return res.status(404).json({ error: "Note not found" });
    }
    
    // Check ownership
    if (note.userId.toString() !== userId.toString()) {
      console.log(`Ownership mismatch: Note belongs to ${note.userId}, but request from ${userId}`);
      return res.status(403).json({ error: "You are not authorized to delete this note" });
    }
    
    await Note.findByIdAndDelete(noteId);
    console.log(`Note ${noteId} deleted successfully`);
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Server error during deletion" });
  }
});

module.exports = router;
