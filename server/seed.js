require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Course = require("./models/Course");
const Project = require("./models/Project");
const Achievement = require("./models/Achievement");
const User = require("./models/User");

const courses = [
  { 
    title: "Python Masterclass", 
    category: "Development", 
    level: "Beginner", 
    duration: "10 weeks", 
    students: 12000, 
    rating: 4.9, 
    price: 1500, 
    image: "🐍", 
    modules: 15, 
    tags: ["Python", "Programming", "Data"],
    topics: [
      {
        name: "1. Introduction to Python",
        videos: [
          { title: "What is Python?", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "10:00" },
          { title: "Setting up the Environment", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "15:00" }
        ]
      },
      {
        name: "2. Data Structures",
        videos: [
          { title: "Lists and Tuples", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "20:00" },
          { title: "Dictionaries", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "18:00" }
        ]
      }
    ]
  },
  { 
    title: "Full-Stack Web Development", category: "Development", level: "Intermediate", duration: "12 weeks", students: 15420, rating: 4.8, price: 0, image: "🌐", modules: 24, tags: ["React", "Node.js", "MongoDB"],
    topics: [
      {
        name: "1. Frontend Fundamentals",
        videos: [
          { title: "HTML Basics", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "15:00" },
          { title: "CSS Flexbox & Grid", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "25:00" }
        ]
      },
      {
        name: "2. Backend with Node.js",
        videos: [
          { title: "Intro to Express", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "30:00" }
        ]
      }
    ]
  },
  { 
    title: "AI & Machine Learning Mastery", category: "AI/ML", level: "Advanced", duration: "16 weeks", students: 8930, rating: 4.9, price: 3999, image: "🤖", modules: 32, tags: ["Python", "TensorFlow", "PyTorch"],
    topics: [
      {
        name: "1. Math for ML",
        videos: [
          { title: "Linear Algebra Refresher", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "45:00" }
        ]
      },
      {
        name: "2. Neural Networks",
        videos: [
          { title: "Backpropagation Explained", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "50:00" }
        ]
      }
    ]
  },
  { 
    title: "UI/UX Design Fundamentals", category: "Design", level: "Beginner", duration: "8 weeks", students: 22100, rating: 4.7, price: 0, image: "🎨", modules: 16, tags: ["Figma", "Adobe XD", "Prototyping"],
    topics: [
      {
        name: "1. Design Theory",
        videos: [
          { title: "Color Theory & Typography", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "20:00" }
        ]
      },
      {
        name: "2. Tools",
        videos: [
          { title: "Figma Masterclass", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "40:00" }
        ]
      }
    ]
  },
  { 
    title: "Cloud Computing with AWS", category: "DevOps", level: "Intermediate", duration: "10 weeks", students: 6750, rating: 4.6, price: 2999, image: "☁️", modules: 20, tags: ["AWS", "Docker", "Kubernetes"],
    topics: [
      {
        name: "1. Core AWS Services",
        videos: [
          { title: "EC2 & S3 Deep Dive", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "35:00" }
        ]
      },
      {
        name: "2. Containers",
        videos: [
          { title: "Dockerizing Applications", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "28:00" }
        ]
      }
    ]
  },
  { 
    title: "Mobile App Development", category: "Development", level: "Intermediate", duration: "14 weeks", students: 11200, rating: 4.8, price: 1999, image: "📱", modules: 28, tags: ["React Native", "Flutter", "Firebase"],
    topics: [
      {
        name: "1. React Native Basics",
        videos: [
          { title: "Components & State", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "22:00" }
        ]
      },
      {
        name: "2. Navigation",
        videos: [
          { title: "React Navigation v6", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "30:00" }
        ]
      }
    ]
  },
  { 
    title: "Cybersecurity Essentials", category: "Security", level: "Beginner", duration: "6 weeks", students: 9800, rating: 4.5, price: 0, image: "🔒", modules: 12, tags: ["Networking", "Ethical Hacking", "Encryption"],
    topics: [
      {
        name: "1. Network Security",
        videos: [
          { title: "TCP/IP & Firewalls", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "25:00" }
        ]
      },
      {
        name: "2. Offensive Security",
        videos: [
          { title: "Intro to Kali Linux", url: "https://www.youtube.com/embed/kqtD5dpn9C8", duration: "35:00" }
        ]
      }
    ]
  },
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
