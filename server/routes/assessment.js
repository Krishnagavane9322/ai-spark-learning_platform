const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const auth = require("../middleware/auth");

const router = express.Router();

// Learning path templates based on interests and skill levels
const pathDatabase = {
  "Web Development": [
    { title: "HTML & CSS Mastery", description: "Build responsive layouts with modern CSS (Grid, Flexbox)", category: "Frontend", duration: "1 week", xp: 300, resources: ["MDN Web Docs", "CSS-Tricks", "freeCodeCamp"] },
    { title: "JavaScript Fundamentals", description: "Variables, functions, DOM manipulation, and ES6+ features", category: "Frontend", duration: "2 weeks", xp: 500, resources: ["JavaScript.info", "Eloquent JavaScript", "30 Days of JS"] },
    { title: "React Core Concepts", description: "Components, JSX, state, props, hooks, and lifecycle", category: "Frontend", duration: "2 weeks", xp: 600, resources: ["React Docs", "React Tutorial", "Scrimba React"] },
    { title: "Backend with Node.js", description: "Express.js, REST APIs, middleware, and routing", category: "Backend", duration: "2 weeks", xp: 600, resources: ["Node.js Docs", "Express Guide", "The Odin Project"] },
    { title: "Database Design", description: "MongoDB/SQL, schemas, CRUD operations, and relationships", category: "Backend", duration: "1.5 weeks", xp: 500, resources: ["MongoDB University", "SQLBolt", "Prisma Guide"] },
    { title: "Authentication & Security", description: "JWT, OAuth, bcrypt, CORS, and HTTPS", category: "Security", duration: "1 week", xp: 400, resources: ["Auth0 Docs", "OWASP Guide", "JWT.io"] },
    { title: "Full-Stack Project", description: "Build a complete app: frontend + backend + database + auth", category: "Project", duration: "3 weeks", xp: 1500, resources: ["GitHub Projects", "Vercel Deploy", "Portfolio Showcase"] },
  ],
  "AI & Machine Learning": [
    { title: "Python for Data Science", description: "NumPy, Pandas, Matplotlib — data manipulation essentials", category: "Foundations", duration: "2 weeks", xp: 500, resources: ["Python.org", "Kaggle Learn", "DataCamp"] },
    { title: "Statistics & Probability", description: "Distributions, hypothesis testing, Bayesian thinking", category: "Math", duration: "1.5 weeks", xp: 400, resources: ["Khan Academy", "StatQuest", "Think Stats"] },
    { title: "Machine Learning Basics", description: "Regression, classification, decision trees, and SVMs", category: "ML", duration: "2 weeks", xp: 600, resources: ["Scikit-learn Docs", "Andrew Ng Course", "ML Crash Course"] },
    { title: "Deep Learning & Neural Networks", description: "Perceptrons, CNNs, RNNs, backpropagation", category: "ML", duration: "3 weeks", xp: 800, resources: ["TensorFlow Tutorials", "fast.ai", "3Blue1Brown"] },
    { title: "Natural Language Processing", description: "Text processing, transformers, sentiment analysis", category: "NLP", duration: "2 weeks", xp: 700, resources: ["Hugging Face", "spaCy Docs", "NLP with Python"] },
    { title: "AI Project: End-to-End", description: "Build, train, evaluate, and deploy an ML model", category: "Project", duration: "3 weeks", xp: 1500, resources: ["Kaggle Competitions", "Streamlit", "AWS SageMaker"] },
  ],
  "Mobile Development": [
    { title: "JavaScript/TypeScript Refresher", description: "Modern JS features, TypeScript basics, async patterns", category: "Foundations", duration: "1 week", xp: 300, resources: ["TypeScript Handbook", "JavaScript.info", "Exercism"] },
    { title: "React Native Fundamentals", description: "Components, navigation, styling, and native modules", category: "Mobile", duration: "2 weeks", xp: 600, resources: ["React Native Docs", "Expo Docs", "William Candillon"] },
    { title: "State Management & APIs", description: "Redux, Context API, REST/GraphQL integration", category: "Mobile", duration: "1.5 weeks", xp: 500, resources: ["Redux Toolkit Docs", "Apollo Client", "TanStack Query"] },
    { title: "Native Features & Permissions", description: "Camera, GPS, push notifications, storage", category: "Mobile", duration: "1.5 weeks", xp: 500, resources: ["Expo APIs", "React Native Camera", "Firebase FCM"] },
    { title: "App Store Deployment", description: "Build, test, sign, and publish to iOS/Android stores", category: "DevOps", duration: "1 week", xp: 400, resources: ["Apple Developer", "Google Play Console", "EAS Build"] },
    { title: "Mobile App Capstone", description: "Build a polished, store-ready mobile application", category: "Project", duration: "3 weeks", xp: 1500, resources: ["Dribbble Inspiration", "App Store Guidelines", "UX Principles"] },
  ],
  "UI/UX Design": [
    { title: "Design Thinking & Research", description: "User personas, journey maps, competitive analysis", category: "Research", duration: "1 week", xp: 300, resources: ["IDEO Design Kit", "Nielsen Norman", "UX Collective"] },
    { title: "Visual Design Principles", description: "Typography, color theory, layout, visual hierarchy", category: "Design", duration: "1.5 weeks", xp: 400, resources: ["Refactoring UI", "Material Design", "Apple HIG"] },
    { title: "Figma Mastery", description: "Components, auto-layout, prototyping, design systems", category: "Tools", duration: "2 weeks", xp: 500, resources: ["Figma Academy", "Figma Community", "Design+Code"] },
    { title: "Interaction Design", description: "Micro-animations, transitions, gesture-based UX", category: "Design", duration: "1.5 weeks", xp: 500, resources: ["Framer Motion", "LottieFiles", "Principle App"] },
    { title: "Usability Testing", description: "A/B testing, heatmaps, user interviews, accessibility", category: "Research", duration: "1 week", xp: 400, resources: ["Hotjar", "UserTesting", "WCAG Guidelines"] },
    { title: "Design Portfolio Project", description: "End-to-end case study: research → design → present", category: "Project", duration: "2 weeks", xp: 1200, resources: ["Behance", "Dribbble", "Case Study Club"] },
  ],
  "Cloud & DevOps": [
    { title: "Linux & Command Line", description: "Shell scripting, file systems, permissions, SSH", category: "Foundations", duration: "1 week", xp: 300, resources: ["Linux Academy", "The Linux Command Line", "OverTheWire"] },
    { title: "Containerization with Docker", description: "Images, containers, volumes, docker-compose", category: "DevOps", duration: "1.5 weeks", xp: 500, resources: ["Docker Docs", "Play with Docker", "Docker Hub"] },
    { title: "AWS/Cloud Essentials", description: "EC2, S3, Lambda, IAM, and cloud architecture", category: "Cloud", duration: "2 weeks", xp: 600, resources: ["AWS Free Tier", "Cloud Academy", "A Cloud Guru"] },
    { title: "CI/CD Pipelines", description: "GitHub Actions, Jenkins, automated testing & deployment", category: "DevOps", duration: "1.5 weeks", xp: 500, resources: ["GitHub Actions Docs", "CircleCI", "GitLab CI"] },
    { title: "Kubernetes Orchestration", description: "Pods, services, deployments, Helm charts", category: "DevOps", duration: "2 weeks", xp: 700, resources: ["Kubernetes Docs", "Minikube", "KodeKloud"] },
    { title: "Infrastructure Project", description: "Deploy a multi-service app with CI/CD on cloud", category: "Project", duration: "2 weeks", xp: 1500, resources: ["Terraform", "Vercel", "AWS CloudFormation"] },
  ],
  "Data Science": [
    { title: "Python & Data Wrangling", description: "Pandas, data cleaning, merging, feature engineering", category: "Foundations", duration: "1.5 weeks", xp: 400, resources: ["Pandas Docs", "Kaggle Learn", "Real Python"] },
    { title: "Statistics & Visualization", description: "Descriptive stats, distributions, Matplotlib, Seaborn", category: "Analysis", duration: "1.5 weeks", xp: 400, resources: ["StatQuest", "Seaborn Gallery", "Plotly Docs"] },
    { title: "SQL for Analytics", description: "Complex queries, window functions, data modeling", category: "Database", duration: "1 week", xp: 300, resources: ["Mode Analytics", "SQLZoo", "LeetCode SQL"] },
    { title: "Exploratory Data Analysis", description: "Hypothesis formation, correlation, pattern discovery", category: "Analysis", duration: "1.5 weeks", xp: 500, resources: ["Kaggle Notebooks", "Towards Data Science", "D3.js"] },
    { title: "Machine Learning for DS", description: "Predictive modeling, feature selection, model evaluation", category: "ML", duration: "2 weeks", xp: 600, resources: ["Scikit-learn", "XGBoost Docs", "MLflow"] },
    { title: "Data Science Capstone", description: "End-to-end analysis project with real-world data", category: "Project", duration: "3 weeks", xp: 1500, resources: ["Kaggle Competitions", "Streamlit Dashboard", "Jupyter"] },
  ],
  "Cybersecurity": [
    { title: "Networking Fundamentals", description: "TCP/IP, DNS, HTTP, firewalls, packet analysis", category: "Foundations", duration: "1.5 weeks", xp: 400, resources: ["CompTIA Network+", "Wireshark", "Cisco Academy"] },
    { title: "Operating System Security", description: "Linux hardening, Windows security, privilege escalation", category: "Security", duration: "1.5 weeks", xp: 500, resources: ["TryHackMe", "HackTheBox", "OverTheWire"] },
    { title: "Web Application Security", description: "OWASP Top 10, XSS, SQL injection, CSRF", category: "AppSec", duration: "2 weeks", xp: 600, resources: ["OWASP", "PortSwigger Academy", "Burp Suite"] },
    { title: "Cryptography Essentials", description: "Symmetric/asymmetric encryption, hashing, PKI, TLS", category: "Crypto", duration: "1 week", xp: 400, resources: ["Crypto101", "Khan Academy Crypto", "CyberChef"] },
    { title: "Penetration Testing", description: "Recon, exploitation, post-exploitation, reporting", category: "Offensive", duration: "2 weeks", xp: 700, resources: ["Metasploit", "Kali Linux", "eLearnSecurity"] },
    { title: "Security Capstone: CTF", description: "Compete in capture-the-flag challenges", category: "Project", duration: "2 weeks", xp: 1500, resources: ["PicoCTF", "CTFtime", "HackTheBox Challenges"] },
  ],
};

// Generate personalized path based on interests and skill level
function generatePath(interests, skillLevel) {
  let path = [];
  let stepId = 1;

  for (const interest of interests) {
    const template = pathDatabase[interest];
    if (!template) continue;

    // Adjust based on skill level
    let steps = template;
    if (skillLevel === "intermediate") {
      steps = template.slice(1); // Skip basic foundations
    } else if (skillLevel === "advanced") {
      steps = template.slice(Math.floor(template.length / 2)); // Skip to advanced topics
    }

    for (const step of steps) {
      path.push({
        stepId: stepId++,
        ...step,
        status: stepId === 2 ? "current" : "locked"
      });
    }
  }

  // Mark first step as current
  if (path.length > 0) path[0].status = "current";

  return path;
}

// Submit assessment and generate personalized path
router.post("/", auth, async (req, res) => {
  try {
    const { interests, skillLevel, goals } = req.body;

    if (!interests || interests.length === 0) {
      return res.status(400).json({ error: "Please select at least one interest" });
    }

    const user = await User.findById(req.userId);

    // Generate personalized learning path
    const personalizedPath = generatePath(interests, skillLevel || "beginner");

    // Update user skills based on interests
    const skillMap = {
      "Web Development": ["JavaScript", "React", "Node.js", "CSS/Tailwind"],
      "AI & Machine Learning": ["Python", "TensorFlow", "Data Science"],
      "Mobile Development": ["React Native", "TypeScript", "Mobile UI"],
      "UI/UX Design": ["Figma", "Design Systems", "Prototyping"],
      "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
      "Data Science": ["Python", "SQL", "Statistics", "Visualization"],
      "Cybersecurity": ["Networking", "Linux", "Ethical Hacking"],
    };

    const newSkills = [];
    for (const interest of interests) {
      const skills = skillMap[interest] || [];
      for (const s of skills) {
        if (!newSkills.find(ns => ns.name === s)) {
          const baseLevel = skillLevel === "beginner" ? 5 : skillLevel === "intermediate" ? 35 : 65;
          newSkills.push({ name: s, level: baseLevel + Math.floor(Math.random() * 10) });
        }
      }
    }

    user.assessmentCompleted = true;
    user.interests = interests;
    user.personalizedPath = personalizedPath;
    user.skills = newSkills;
    user.xp += 100; // Bonus XP for completing assessment

    await user.save();

    res.json({
      message: "Learning path generated!",
      personalizedPath,
      skills: newSkills,
      xpEarned: 100
    });
  } catch (error) {
    console.error("Assessment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get assessment status
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("assessmentCompleted interests personalizedPath");
    res.json({
      completed: user.assessmentCompleted,
      interests: user.interests,
      personalizedPath: user.personalizedPath
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Complete a learning path step
router.put("/step/:stepId/complete", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const stepId = parseInt(req.params.stepId);
    const step = user.personalizedPath.find(s => s.stepId === stepId);

    if (!step) return res.status(404).json({ error: "Step not found" });
    if (step.status === "completed") return res.status(400).json({ error: "Already completed" });
    if (step.status === "locked") return res.status(400).json({ error: "Step is locked" });

    // Mark step as completed
    step.status = "completed";
    user.xp += step.xp || 100;

    // Unlock next step
    const nextStep = user.personalizedPath.find(s => s.stepId === stepId + 1);
    if (nextStep && nextStep.status === "locked") {
      nextStep.status = "current";
    }

    // Track weekly activity - add study hours for today
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    const dayEntry = user.weeklyActivity.find(d => d.day === today);
    if (dayEntry) {
      dayEntry.hours = Math.min(5, dayEntry.hours + 1);
    }

    // Update streak
    user.streak = Math.max(1, user.streak);

    user.markModified("personalizedPath");
    user.markModified("weeklyActivity");
    await user.save();

    // Create notification
    const Notification = require("../models/Notification");
    await Notification.create({
      userId: user._id,
      type: "achievement",
      title: `Step Completed: ${step.title}! 🎉`,
      message: `You earned +${step.xp || 100} XP. ${nextStep ? `Next: ${nextStep.title}` : "You completed the entire path! 🏅"}`,
      icon: "✅",
      link: "/dashboard"
    });

    const completedCount = user.personalizedPath.filter(s => s.status === "completed").length;
    const totalCount = user.personalizedPath.length;

    res.json({
      message: "Step completed!",
      xpEarned: step.xp || 100,
      nextStep: nextStep ? { stepId: nextStep.stepId, title: nextStep.title } : null,
      completedCount,
      totalCount,
      totalXP: user.xp,
      personalizedPath: user.personalizedPath
    });
  } catch (error) {
    console.error("Step complete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Log study activity
router.post("/log-activity", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { hours } = req.body;
    const addHours = Math.min(hours || 0.5, 2);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    const dayEntry = user.weeklyActivity.find(d => d.day === today);
    if (dayEntry) {
      dayEntry.hours = Math.min(5, dayEntry.hours + addHours);
    }

    user.streak = Math.max(1, user.streak);
    user.markModified("weeklyActivity");
    await user.save();

    res.json({ weeklyActivity: user.weeklyActivity, streak: user.streak });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

