require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Course = require("./models/Course");
const Project = require("./models/Project");
const Achievement = require("./models/Achievement");
const User = require("./models/User");

const courses = [
  { title: "Full-Stack Web Development", category: "Development", level: "Intermediate", duration: "12 weeks", students: 15420, rating: 4.8, price: 0, image: "🌐", modules: 24, tags: ["React", "Node.js", "MongoDB"] },
  { title: "AI & Machine Learning Mastery", category: "AI/ML", level: "Advanced", duration: "16 weeks", students: 8930, rating: 4.9, price: 49, image: "🤖", modules: 32, tags: ["Python", "TensorFlow", "PyTorch"] },
  { title: "UI/UX Design Fundamentals", category: "Design", level: "Beginner", duration: "8 weeks", students: 22100, rating: 4.7, price: 0, image: "🎨", modules: 16, tags: ["Figma", "Adobe XD", "Prototyping"] },
  { title: "Cloud Computing with AWS", category: "DevOps", level: "Intermediate", duration: "10 weeks", students: 6750, rating: 4.6, price: 39, image: "☁️", modules: 20, tags: ["AWS", "Docker", "Kubernetes"] },
  { title: "Mobile App Development", category: "Development", level: "Intermediate", duration: "14 weeks", students: 11200, rating: 4.8, price: 29, image: "📱", modules: 28, tags: ["React Native", "Flutter", "Firebase"] },
  { title: "Cybersecurity Essentials", category: "Security", level: "Beginner", duration: "6 weeks", students: 9800, rating: 4.5, price: 0, image: "🔒", modules: 12, tags: ["Networking", "Ethical Hacking", "Encryption"] },
];

const projects = [
  { title: "Personal Portfolio Website", difficulty: "Beginner", tech: ["HTML", "CSS", "JS"], description: "Build a responsive portfolio to showcase your work", submissions: 4200 },
  { title: "E-Commerce Dashboard", difficulty: "Intermediate", tech: ["React", "Tailwind", "Chart.js"], description: "Create a full-featured admin dashboard", submissions: 2800 },
  { title: "Real-Time Chat Application", difficulty: "Intermediate", tech: ["React", "Socket.io", "Node.js"], description: "Build a chat app with real-time messaging", submissions: 1900 },
  { title: "AI Image Generator", difficulty: "Advanced", tech: ["Python", "FastAPI", "Stable Diffusion"], description: "Create an AI-powered image generation tool", submissions: 890 },
  { title: "Task Management System", difficulty: "Beginner", tech: ["React", "LocalStorage", "CSS"], description: "Build a Kanban-style task manager", submissions: 5600 },
  { title: "Social Media Analytics", difficulty: "Advanced", tech: ["React", "D3.js", "Python"], description: "Analyze and visualize social media data", submissions: 720 },
];

const achievements = [
  { title: "First Steps", description: "Complete your first lesson", icon: "🏆" },
  { title: "Week Warrior", description: "7-day learning streak", icon: "🔥" },
  { title: "Code Master", description: "Complete 50 coding challenges", icon: "⚡" },
  { title: "Social Butterfly", description: "Connect with 10 peers", icon: "🦋" },
  { title: "Project Pro", description: "Submit 5 projects", icon: "🚀" },
  { title: "AI Explorer", description: "Complete an AI learning path", icon: "🤖" },
];

const samplePeers = [
  { name: "Sarah Chen", email: "sarah@example.com", password: "password123", avatar: "👩‍💻", level: 15, xp: 12000, skills: [{ name: "UI/UX", level: 85 }, { name: "Figma", level: 90 }, { name: "React", level: 75 }] },
  { name: "Marcus Johnson", email: "marcus@example.com", password: "password123", avatar: "🧑‍💻", level: 18, xp: 15600, skills: [{ name: "AWS", level: 88 }, { name: "Docker", level: 82 }, { name: "Go", level: 70 }] },
  { name: "Priya Sharma", email: "priya@example.com", password: "password123", avatar: "👩‍🔬", level: 10, xp: 6200, skills: [{ name: "Data Science", level: 80 }, { name: "Python", level: 85 }, { name: "SQL", level: 75 }] },
  { name: "James Park", email: "james@example.com", password: "password123", avatar: "👨‍🎓", level: 14, xp: 10800, skills: [{ name: "Java", level: 82 }, { name: "Spring", level: 78 }, { name: "Microservices", level: 70 }] },
  { name: "Luna Martinez", email: "luna@example.com", password: "password123", avatar: "👩‍🎨", level: 11, xp: 7400, skills: [{ name: "Design", level: 90 }, { name: "CSS", level: 85 }, { name: "Animation", level: 80 }] },
];

async function seed() {
  try {
    await connectDB();
    console.log("Clearing existing data...");
    await Course.deleteMany({});
    await Project.deleteMany({});
    await Achievement.deleteMany({});

    console.log("Seeding courses...");
    await Course.insertMany(courses);
    console.log(`  ✓ ${courses.length} courses inserted`);

    console.log("Seeding projects...");
    await Project.insertMany(projects);
    console.log(`  ✓ ${projects.length} projects inserted`);

    console.log("Seeding achievements...");
    await Achievement.insertMany(achievements);
    console.log(`  ✓ ${achievements.length} achievements inserted`);

    console.log("Seeding sample peers...");
    for (const peerData of samplePeers) {
      const existing = await User.findOne({ email: peerData.email });
      if (!existing) {
        const peer = new User({
          ...peerData,
          roadmapProgress: [
            { stageId: 1, status: "completed" },
            { stageId: 2, status: "completed" },
            { stageId: 3, status: "current" },
            { stageId: 4, status: "locked" },
            { stageId: 5, status: "locked" },
            { stageId: 6, status: "locked" },
            { stageId: 7, status: "locked" },
            { stageId: 8, status: "locked" }
          ],
          weeklyActivity: [
            { day: "Mon", hours: Math.round(Math.random() * 4 * 10) / 10 },
            { day: "Tue", hours: Math.round(Math.random() * 4 * 10) / 10 },
            { day: "Wed", hours: Math.round(Math.random() * 4 * 10) / 10 },
            { day: "Thu", hours: Math.round(Math.random() * 4 * 10) / 10 },
            { day: "Fri", hours: Math.round(Math.random() * 4 * 10) / 10 },
            { day: "Sat", hours: Math.round(Math.random() * 3 * 10) / 10 },
            { day: "Sun", hours: Math.round(Math.random() * 3 * 10) / 10 }
          ]
        });
        await peer.save();
      }
    }
    console.log(`  ✓ ${samplePeers.length} sample peers created`);

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
