const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const backupClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY_BACKUP || "",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

console.log(
  "NVIDIA API Key loaded (shared):",
  process.env.NVIDIA_API_KEY
    ? `Starts with ${process.env.NVIDIA_API_KEY.substring(0, 8)}...`
    : "MISSING"
);

/**
 * Calls Nvidia NIM model with Gemini fallback and a tertiary backup key fallback
 * @param {string} systemPrompt System instruction
 * @param {string} userMessage User query / content
 * @param {Array} conversationHistory Array of chat messages
 */
async function callNvidiaAI(systemPrompt, userMessage, conversationHistory = []) {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-8), // keep last 8 messages for context
      { role: "user", content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.6,
      max_tokens: 4096,   // gpt-oss-120b is a reasoning model — needs extra tokens for CoT
      top_p: 0.95,
    });

    const choice = completion.choices[0];
    const text = choice?.message?.content || choice?.message?.reasoning_content || null;

    if (!text) throw new Error("Empty response from NVIDIA");
    return text;
  } catch (error) {
    console.warn(`NVIDIA API failed (${error.status || error.message}). Falling back to Gemini...`);
    
    // Fallback to Gemini 2.5 Flash
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt 
      });

      let historyToPass = [];
      let expectedRole = "user";
      const historicalMessages = conversationHistory.slice(-8);

      for (const m of historicalMessages) {
        const role = m.role === "user" ? "user" : "model";
        if (role === expectedRole) {
          historyToPass.push({
            role: role,
            parts: [{ text: m.content || "..." }]
          });
          expectedRole = expectedRole === "user" ? "model" : "user";
        }
      }

      if (historyToPass.length > 0 && historyToPass[historyToPass.length - 1].role === "user") {
        historyToPass.pop();
      }
      if (historyToPass.length > 0 && historyToPass[0].role === "model") {
        historyToPass.shift();
      }

      const chatSession = model.startChat({ history: historyToPass });
      const result = await chatSession.sendMessage(userMessage);
      return result.response.text();
    } catch (geminiError) {
      console.warn(`Gemini API also failed (${geminiError.status || geminiError.message}). Trying backup NVIDIA key...`);
      
      // Tertiary Fallback to Backup NVIDIA Key
      try {
        const backupCompletion = await backupClient.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-8),
            { role: "user", content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 4096,
          top_p: 0.95,
        });

        const backupChoice = backupCompletion.choices[0];
        const backupText = backupChoice?.message?.content || backupChoice?.message?.reasoning_content || null;

        if (!backupText) throw new Error("Empty response from backup NVIDIA API");
        return backupText;
      } catch (backupError) {
        console.error("All AI fallbacks failed.");
        throw backupError;
      }
    }
  }
}

async function transcribeImageAI(imageBuffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imageParts = [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType
        }
      }
    ];
    const prompt = "You are an expert handwriting transcriber. Transcribe all readable text from this image of handwritten notes with 100% accuracy. Do not include any of your own comments, warnings, or formatting tags. Just output the clean transcribed text.";
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
  } catch (error) {
    console.error("AI image transcription failed:", error);
    throw error;
  }
}

module.exports = {
  callNvidiaAI,
  transcribeImageAI,
};
