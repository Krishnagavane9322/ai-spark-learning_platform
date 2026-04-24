require("dotenv").config();
// Trigger restart final
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const projectRoutes = require("./routes/projects");
const peerRoutes = require("./routes/peers");
const noteRoutes = require("./routes/notes");
const certificateRoutes = require("./routes/certificates");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");
const assessmentRoutes = require("./routes/assessment");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payment");
const messageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 5001;
console.log("Loading environment variables... PORT =", process.env.PORT);
console.log("Server starting on PORT =", PORT);

const allowedOrigins = [
  "http://localhost:8080", 
  "http://localhost:8081", 
  "http://localhost:5173", 
  "http://localhost:3000",
  "https://ai-spark-learning-platform.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));
// Specifically handle OPTIONS preflight requests to prevent 404s on preflights
app.options('*', cors(corsOptions));
app.use(express.json());

// Set security headers for Google OAuth compatibility
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Optional, may break some images if not configured properly
  next();
});

// Serve uploaded files (project screenshots, etc.)
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/peers", peerRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", require("./routes/chat"));
app.use("/api/stats", require("./routes/stats"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
