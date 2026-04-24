const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/Chat");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
console.log("Gemini API Key loaded:", process.env.GEMINI_API_KEY ? `Starts with ${process.env.GEMINI_API_KEY.substring(0, 5)}...` : "MISSING");

// Get chat history
router.get("/history", auth, async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) {
      chat = new Chat({ userId: req.userId, messages: [] });
      await chat.save();
    }
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to Gemini
router.post("/send", auth, async (req, res) => {
  try {
    const { message, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) {
      chat = new Chat({ userId: req.userId, messages: [] });
    }

    // Add user message to history
    chat.messages.push({ role: "user", content: message || "Image analysis request" });

    // Prepare Gemini request
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let result;
    if (image) {
      // Multimodal request
      const imageParts = [
        {
          inlineData: {
            data: image.split(",")[1], // Remove data:image/png;base64,
            mimeType: "image/png"
          }
        }
      ];
      result = await model.generateContent([message || "Explain this image", ...imageParts]);
    } else {
      // Text-only request with context
      let validHistory = [];
      let expectedRole = "user";
      
      // Exclude the current message we just pushed to chat.messages
      const historicalMessages = chat.messages.slice(0, -1);
      
      for (const m of historicalMessages) {
        const role = m.role === "user" ? "user" : "model";
        if (role === expectedRole) {
          validHistory.push({
            role: role,
            parts: [{ text: m.content || "..." }]
          });
          expectedRole = expectedRole === "user" ? "model" : "user";
        }
      }
      
      // History must end with 'model' so that the new sendMessage ('user') is valid
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === "user") {
        validHistory.pop();
      }
      
      let historyToPass = validHistory.slice(-10);
      // History must start with 'user'
      if (historyToPass.length > 0 && historyToPass[0].role === "model") {
        historyToPass.shift();
      }
      
      const chatSession = model.startChat({
        history: historyToPass,
      });
      
      result = await chatSession.sendMessage(message);
    }

    const response = await result.response;
    const text = response.text();

    // Add model response to history
    chat.messages.push({ role: "model", content: text });
    chat.updatedAt = Date.now();
    await chat.save();

    res.json({ role: "model", content: text });
  } catch (error) {
    console.error("Gemini Error Detail:", {
      message: error.message,
      status: error.status,
      errorDetails: error.errorDetails,
      response: error.response?.data
    });

    // Handle quota exhaustion gracefully
    if (error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("quota") || error.status === 429) {
      return res.status(429).json({
        error: "The AI assistant has reached its daily request limit. Please try again tomorrow or upgrade the Gemini API plan."
      });
    }

    // Handle service unavailable / high demand
    if (error.message?.includes("503") || error.status === 503 || error.message?.toLowerCase().includes("high demand")) {
      return res.status(503).json({
        error: "The AI model is currently experiencing high demand. Please wait a moment and try again."
      });
    }

    // Handle model not found
    if (error.message?.includes("not found") || error.status === 404) {
      return res.status(503).json({
        error: "AI model is currently unavailable. Please try again later."
      });
    }

    // Send the actual error message back so we can see what's going wrong
    res.status(500).json({ error: `AI Error: ${error.message}` });
  }
});

// Clear history
router.post("/clear", auth, async (req, res) => {
  try {
    await Chat.findOneAndUpdate({ userId: req.userId }, { messages: [] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
