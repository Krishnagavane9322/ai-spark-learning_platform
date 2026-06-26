const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { callNvidiaAI } = require("../utils/ai");

// ─── System Prompts per Tool ─────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  teacher: `You are an expert AI Teacher on the NeuralPath learning platform. 
You explain concepts clearly, use analogies, real-world examples, and encourage curiosity. 
You adapt your teaching style to the student's level. 
Format responses with markdown: use **bold** for key terms, bullet points for lists, 
and code blocks when showing code. Keep responses focused, engaging, and educational.`,

  quiz: `You are a Quiz Generator AI on the NeuralPath platform. 
When given a topic, generate exactly 5 multiple-choice quiz questions.
ALWAYS respond with ONLY valid JSON in this exact format (no extra text):
{
  "topic": "Topic Name",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why the answer is correct"
    }
  ]
}
The "correct" field is the 0-based index of the correct option. Generate clear, educational questions.`,

  explain: `You are a Concept Explainer AI on the NeuralPath platform.
Explain topics simply using the Feynman Technique — as if teaching a beginner.
Structure your response in exactly 3 layers:
**Layer 1 — Simple (5-year-old level):** Use a simple analogy or story.
**Layer 2 — Teen Level:** Explain the core mechanism with simple technical terms.
**Layer 3 — Full Detail:** Deep-dive with real examples, edge cases, and practical use.
Use emojis to make it engaging. Keep each layer concise but complete.`,

  homework: `You are a Homework Solver AI on the NeuralPath platform.
When given a question or problem, solve it step-by-step.
Format your response as:
**Understanding the Problem:** Briefly restate what's being asked.
**Step-by-Step Solution:**
Step 1: ...
Step 2: ...
(continue as needed)
**Final Answer:** State the clear answer.
**Key Concept:** Mention the underlying concept so the student learns, not just copies.
Show all working. For math, format equations clearly.`,

  code: `You are an expert Code Assistant AI on the NeuralPath platform.
You help with debugging, writing, explaining, and optimizing code.
Always:
1. Provide clean, well-commented code in proper markdown code blocks with the language specified.
2. Explain what the code does and why.
3. Point out potential issues or improvements.
4. If debugging, identify the bug, explain why it's a bug, then provide the fixed version.
5. Support all major languages: Python, JavaScript, TypeScript, Java, C++, Go, Rust, etc.`,

  resume: `You are a Career & Resume Guidance AI on the NeuralPath platform.
You help students and professionals build impressive resumes and plan their careers in tech.
When given information about a person (role, skills, experience level), provide:
1. **Resume Tips:** Specific improvements for their resume (ATS optimization, wording, structure).
2. **Skills to Add:** Top 3-5 skills to learn for their target role.
3. **Career Roadmap:** A clear 6-12 month plan to reach their goal.
4. **Interview Prep:** 3 key topics to master for their target role.
5. **Resources:** 2-3 specific free resources (courses, platforms) to accelerate growth.
Be specific, actionable, and motivating.`,

  attendance: `You are an Attendance & Academic Policy Q&A Bot on the NeuralPath platform.
You help students with questions about attendance policies, academic regulations, grade calculations, 
exam schedules, re-examination policies, and university/college administrative queries.
Provide clear, structured answers. When asked to calculate attendance percentage, 
use the formula: (Classes Attended / Total Classes) × 100.
The minimum attendance requirement is typically 75% (state this if relevant).
Be helpful, precise, and empathetic to student concerns.`,

  voiceTutor: `You are a Voice Tutor AI on the NeuralPath platform.
You receive transcribed speech from a student and respond conversationally, 
as if you are having a real-time spoken tutoring session.
Keep responses conversational, clear, and concise (2-4 sentences per point) 
since your response will be read aloud via text-to-speech.
Avoid markdown formatting, bullet points, or symbols in your response — 
use natural spoken language. Be warm, encouraging, and educational.`,

  learningPath: `You are a Personalized Learning Path Generator AI on the NeuralPath platform.
When given a student's interests, current skill level, and goals, generate a detailed learning roadmap.
ALWAYS respond with ONLY valid JSON in this exact format (no extra text):
{
  "title": "Your Personalized Learning Path",
  "summary": "Brief 1-2 sentence summary of this path",
  "totalDuration": "X weeks",
  "phases": [
    {
      "phase": 1,
      "title": "Phase Title",
      "duration": "X weeks",
      "color": "cyan",
      "icon": "🚀",
      "topics": [
        {
          "name": "Topic Name",
          "description": "What you will learn",
          "resources": ["Resource 1", "Resource 2"],
          "hours": 10
        }
      ]
    }
  ],
  "finalGoal": "What the student can build/achieve after completing this path"
}
Generate 3-4 phases. Use colors: cyan, violet, emerald, orange, rose, amber for variety.`
};

// callNvidiaAI is imported from utils/ai

// ─── Error handler wrapper ────────────────────────────────────────────────
function handleAIError(error, res) {
  console.error("NVIDIA AI Error:", {
    message: error.message,
    status: error.status,
    code: error.code,
  });

  if (error.status === 429 || error.message?.includes("rate limit") || error.message?.includes("quota")) {
    return res.status(429).json({
      error: "AI service rate limit reached. Please wait a moment and try again.",
    });
  }
  if (error.status === 401 || error.message?.includes("unauthorized") || error.message?.includes("API key")) {
    return res.status(401).json({
      error: "AI service authentication failed. Please contact support.",
    });
  }
  if (error.status === 503 || error.message?.includes("unavailable")) {
    return res.status(503).json({
      error: "AI service is temporarily unavailable. Please try again in a moment.",
    });
  }
  return res.status(500).json({ error: `AI Error: ${error.message}` });
}

// ─── Routes ───────────────────────────────────────────────────────────────

// POST /api/classroom/teacher — AI Teacher Chatbot (multi-turn)
router.post("/teacher", auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const response = await callNvidiaAI(SYSTEM_PROMPTS.teacher, message, history);
    res.json({ response, role: "assistant" });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/quiz — Auto Quiz Generator
router.post("/quiz", auth, async (req, res) => {
  try {
    const { topic, difficulty = "medium" } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const userMessage = `Generate a ${difficulty} difficulty quiz about: "${topic}"`;
    const response = await callNvidiaAI(SYSTEM_PROMPTS.quiz, userMessage);

    // Parse JSON response
    let quiz;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      quiz = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      return res.status(500).json({ error: "Failed to parse quiz. Please try again." });
    }

    res.json(quiz);
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/explain — Explain Topic Simply
router.post("/explain", auth, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const response = await callNvidiaAI(
      SYSTEM_PROMPTS.explain,
      `Explain this topic using the 3-layer method: "${topic}"`
    );
    res.json({ explanation: response });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/homework — Homework Solver
router.post("/homework", auth, async (req, res) => {
  try {
    const { question, subject = "General" } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const response = await callNvidiaAI(
      SYSTEM_PROMPTS.homework,
      `Subject: ${subject}\nQuestion: ${question}`
    );
    res.json({ solution: response });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/code — Code Assistant
router.post("/code", auth, async (req, res) => {
  try {
    const { code, question, language = "JavaScript" } = req.body;
    if (!question && !code) return res.status(400).json({ error: "Code or question is required" });

    let userMessage = `Language: ${language}\n`;
    if (question) userMessage += `Question/Task: ${question}\n`;
    if (code) userMessage += `Code:\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await callNvidiaAI(SYSTEM_PROMPTS.code, userMessage);
    res.json({ response });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/resume — Resume / Career Guidance
router.post("/resume", auth, async (req, res) => {
  try {
    const { targetRole, currentSkills, experienceLevel, goals } = req.body;
    if (!targetRole) return res.status(400).json({ error: "Target role is required" });

    const userMessage = `
Target Role: ${targetRole}
Experience Level: ${experienceLevel || "Beginner/Student"}
Current Skills: ${currentSkills || "Not specified"}
Goals: ${goals || "Get hired in tech"}
    `.trim();

    const response = await callNvidiaAI(SYSTEM_PROMPTS.resume, userMessage);
    res.json({ guidance: response });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/attendance — Attendance Q&A Bot
router.post("/attendance", auth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const response = await callNvidiaAI(SYSTEM_PROMPTS.attendance, question);
    res.json({ answer: response });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/voice-tutor — Voice Tutor
router.post("/voice-tutor", auth, async (req, res) => {
  try {
    const { transcript, history = [] } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript is required" });

    const response = await callNvidiaAI(
      SYSTEM_PROMPTS.voiceTutor,
      transcript,
      history
    );
    res.json({ response, role: "assistant" });
  } catch (error) {
    handleAIError(error, res);
  }
});

// POST /api/classroom/learning-path — Personalized Learning Path
router.post("/learning-path", auth, async (req, res) => {
  try {
    const { interests, skillLevel, goals, timeAvailable } = req.body;
    if (!interests || interests.length === 0) {
      return res.status(400).json({ error: "Please provide at least one interest" });
    }

    const userMessage = `
Student Profile:
Interests: ${Array.isArray(interests) ? interests.join(", ") : interests}
Current Skill Level: ${skillLevel || "Beginner"}
Goals: ${goals || "Get a job in tech"}
Time Available per Week: ${timeAvailable || "10 hours"}
    `.trim();

    const response = await callNvidiaAI(SYSTEM_PROMPTS.learningPath, userMessage);

    let path;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      path = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      return res.status(500).json({ error: "Failed to generate learning path. Please try again." });
    }

    res.json(path);
  } catch (error) {
    handleAIError(error, res);
  }
});

module.exports = router;
