const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: "👨‍💻" },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  skills: [{
    name: { type: String },
    level: { type: Number, default: 0 }
  }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  completedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  achievements: [{
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
    unlockedAt: { type: Date, default: Date.now }
  }],
  assessmentCompleted: { type: Boolean, default: false },
  interests: [{ type: String }],
  personalizedPath: [{
    stepId: Number,
    title: String,
    description: String,
    category: String,
    duration: String,
    xp: Number,
    status: { type: String, enum: ["completed", "current", "locked"], default: "locked" },
    resources: [String]
  }],
  roadmapProgress: [{
    stageId: Number,
    status: { type: String, enum: ["completed", "current", "locked"], default: "locked" }
  }],
  weeklyActivity: [{
    day: String,
    hours: { type: Number, default: 0 }
  }],
  settings: {
    notifications: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true }
  },
  bio: { type: String, default: "Full-stack Developer passionate about AI and Web technologies." },
  socialLinks: {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" }
  },
  customProjects: [{
    title: { type: String },
    description: { type: String },
    tech: [{ type: String }],
    demoUrl: { type: String },
    githubUrl: { type: String }
  }]
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
