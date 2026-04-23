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
    modules: 2, 
    tags: ["Python", "Programming", "Data"],
    quiz: [
      { question: "What is the correct file extension for Python files?", options: [".python", ".py", ".pyt", ".pt"], correctOption: 1 },
      { question: "Which keyword is used to create a function in Python?", options: ["function", "def", "func", "define"], correctOption: 1 },
      { question: "Which of these is an immutable data type in Python?", options: ["List", "Dictionary", "Set", "Tuple"], correctOption: 3 },
      { question: "What is the output of print(2 ** 3)?", options: ["5", "6", "8", "9"], correctOption: 2 }
    ],
    topics: [
      {
        name: "1. Introduction to Python",
        videos: [
          { title: "Python for Beginners", url: "https://www.youtube.com/embed/rfscVS0vtbw", duration: "10:00" },
          { title: "Variables & Data Types", url: "https://www.youtube.com/embed/khKv-8q7YmY", duration: "15:00" }
        ]
      },
      {
        name: "2. Data Structures",
        videos: [
          { title: "Lists, Tuples & Sets", url: "https://www.youtube.com/embed/aBr2kKAHN6M", duration: "20:00" },
          { title: "Python Dictionaries", url: "https://www.youtube.com/embed/daefaLgNkw0", duration: "18:00" }
        ]
      }
    ]
  },
  { 
    title: "Full-Stack Web Development", category: "Development", level: "Intermediate", duration: "12 weeks", students: 15420, rating: 4.8, price: 0, image: "🌐", modules: 2, tags: ["React", "Node.js", "MongoDB"],
    quiz: [
      { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Tabular Multi Language", "None of the above"], correctOption: 0 },
      { question: "Which React hook is used for managing state?", options: ["useEffect", "useContext", "useState", "useReducer"], correctOption: 2 },
      { question: "What is the default port for a MongoDB server?", options: ["3000", "5432", "8080", "27017"], correctOption: 3 },
      { question: "In CSS, what property is used to change the text color?", options: ["font-color", "text-color", "color", "background-color"], correctOption: 2 }
    ],
    topics: [
      {
        name: "1. Frontend Fundamentals",
        videos: [
          { title: "HTML & CSS Roadmap", url: "https://www.youtube.com/embed/pQN-pnXPaVg", duration: "15:00" },
          { title: "Modern CSS Flexbox", url: "https://www.youtube.com/embed/fYq5PXgSsbE", duration: "25:00" }
        ]
      },
      {
        name: "2. Backend with Node.js",
        videos: [
          { title: "Node.js Crash Course", url: "https://www.youtube.com/embed/Oe421EPjeBE", duration: "30:00" },
          { title: "Express.js & MongoDB", url: "https://www.youtube.com/embed/fgTGADljAeg", duration: "35:00" }
        ]
      }
    ]
  },
  { 
    title: "AI & Machine Learning Mastery", category: "AI/ML", level: "Advanced", duration: "16 weeks", students: 8930, rating: 4.9, price: 3999, image: "🤖", modules: 2, tags: ["Python", "TensorFlow", "PyTorch"],
    quiz: [
      { question: "Which of the following is a supervised learning algorithm?", options: ["K-Means", "PCA", "Linear Regression", "DBSCAN"], correctOption: 2 },
      { question: "What is the activation function typically used in the output layer for binary classification?", options: ["ReLU", "Sigmoid", "Tanh", "Softmax"], correctOption: 1 },
      { question: "In machine learning, what does 'Overfitting' mean?", options: ["The model performs well on training data but poorly on new data", "The model performs poorly on both training and new data", "The model is too simple to capture the underlying pattern", "The model training is taking too long"], correctOption: 0 },
      { question: "What is the purpose of a validation set?", options: ["To train the model parameters", "To test the final model performance", "To tune hyperparameters and prevent overfitting", "To increase the size of training data"], correctOption: 2 }
    ],
    topics: [
      {
        name: "1. Math for ML",
        videos: [
          { title: "Linear Algebra for ML", url: "https://www.youtube.com/embed/fNk_zzaMoSs", duration: "45:00" },
          { title: "Calculus in Machine Learning", url: "https://www.youtube.com/embed/Ilg3gGewQ5U", duration: "40:00" }
        ]
      },
      {
        name: "2. Neural Networks",
        videos: [
          { title: "But what is a Neural Network?", url: "https://www.youtube.com/embed/aircAruvnKk", duration: "50:00" },
          { title: "Deep Learning Specialization", url: "https://www.youtube.com/embed/vOppzHpvTiQ", duration: "55:00" }
        ]
      }
    ]
  },
  { 
    title: "UI/UX Design Fundamentals", category: "Design", level: "Beginner", duration: "8 weeks", students: 22100, rating: 4.7, price: 0, image: "🎨", modules: 2, tags: ["Figma", "Adobe XD", "Prototyping"],
    quiz: [
      { question: "What does UI stand for?", options: ["User Interface", "User Interaction", "Universal Interface", "Unit Interface"], correctOption: 0 },
      { question: "What is 'White Space' in design?", options: ["A space colored white", "The empty space between design elements", "A mistake in the layout", "The space used for text only"], correctOption: 1 },
      { question: "Which of these is a popular tool for UI/UX prototyping?", options: ["Photoshop", "Excel", "Figma", "Visual Studio"], correctOption: 2 },
      { question: "What is the primary goal of UX Design?", options: ["To make things look pretty", "To create a smooth and meaningful user experience", "To use as many colors as possible", "To increase the file size of the app"], correctOption: 1 }
    ],
    topics: [
      {
        name: "1. Design Theory",
        videos: [
          { title: "UI/UX Design Process", url: "https://www.youtube.com/embed/c9Wg6Cb_YlU", duration: "20:00" },
          { title: "Principles of Visual Design", url: "https://www.youtube.com/embed/yNDgFK2Jj1E", duration: "25:00" }
        ]
      },
      {
        name: "2. Tools",
        videos: [
          { title: "Figma Full Tutorial", url: "https://www.youtube.com/embed/FTFaQWZBqQ8", duration: "40:00" },
          { title: "Figma Advanced Tutorial", url: "https://www.youtube.com/embed/31wzhvz0vsw", duration: "35:00" }
        ]
      }
    ]
  },
  { 
    title: "Cloud Computing with AWS", category: "DevOps", level: "Intermediate", duration: "10 weeks", students: 6750, rating: 4.6, price: 2999, image: "☁️", modules: 2, tags: ["AWS", "Docker", "Kubernetes"],
    quiz: [
      { question: "What does AWS stand for?", options: ["Advanced Web Services", "Amazon Web Services", "Alpha Web Systems", "All Web Solutions"], correctOption: 1 },
      { question: "Which AWS service is used for scalable virtual servers?", options: ["S3", "Lambda", "EC2", "RDS"], correctOption: 2 },
      { question: "What is S3 primarily used for?", options: ["Running code", "Storing objects/files", "Managing databases", "Network security"], correctOption: 1 }
    ],
    topics: [
      {
        name: "1. Core AWS Services",
        videos: [
          { title: "AWS Certified Cloud Practitioner", url: "https://www.youtube.com/embed/Z3SYDTMP3ME", duration: "35:00" },
          { title: "EC2 Essentials", url: "https://www.youtube.com/embed/a9__D53WsUs", duration: "30:00" }
        ]
      },
      {
        name: "2. Containers",
        videos: [
          { title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/embed/fqMOX6JJhGo", duration: "28:00" },
          { title: "Kubernetes Explained", url: "https://www.youtube.com/embed/X48VuDVv0do", duration: "45:00" }
        ]
      }
    ]
  },
  { 
    title: "Mobile App Development", category: "Development", level: "Intermediate", duration: "14 weeks", students: 11200, rating: 4.8, price: 1999, image: "📱", modules: 2, tags: ["React Native", "Flutter", "Firebase"],
    quiz: [
      { question: "Which framework is developed by Google for mobile apps?", options: ["React Native", "Ionic", "Flutter", "Xamarin"], correctOption: 2 },
      { question: "In React Native, which component is used to display text?", options: ["<Paragraph>", "<div>", "<Text>", "<span>"], correctOption: 2 },
      { question: "What is the purpose of 'State' in React Native?", options: ["To store static data", "To manage data that changes over time within a component", "To navigate between screens", "To style the application"], correctOption: 1 }
    ],
    topics: [
      {
        name: "1. React Native Basics",
        videos: [
          { title: "React Native Crash Course", url: "https://www.youtube.com/embed/0-S5a0eXPoc", duration: "22:00" },
          { title: "Styling React Native", url: "https://www.youtube.com/embed/3nLTB_E6XAM", duration: "25:00" }
        ]
      },
      {
        name: "2. Navigation & APIs",
        videos: [
          { title: "React Navigation Tutorial", url: "https://www.youtube.com/embed/D2aZ9oYM_cI", duration: "30:00" },
          { title: "Fetching API Data", url: "https://www.youtube.com/embed/cuEtnrL9-H0", duration: "35:00" }
        ]
      }
    ]
  },
  { 
    title: "Cybersecurity Essentials", category: "Security", level: "Beginner", duration: "6 weeks", students: 9800, rating: 4.5, price: 0, image: "🔒", modules: 2, tags: ["Networking", "Ethical Hacking", "Encryption"],
    quiz: [
      { question: "What does HTTPS stand for?", options: ["Hyper Text Transfer Protocol Secure", "High Tech Transfer Process System", "Hyper Text Tutorial Program Source", "None of the above"], correctOption: 0 },
      { question: "What is a 'Phishing' attack?", options: ["A way to catch fish using computers", "Fraudulent attempts to obtain sensitive information by posing as a trustworthy entity", "A type of firewall", "A secure way to store passwords"], correctOption: 1 },
      { question: "Which of these is the strongest password?", options: ["password123", "123456", "admin", "C0mpl3x!P@ssw0rd"], correctOption: 3 }
    ],
    topics: [
      {
        name: "1. Network Security",
        videos: [
          { title: "Cyber Security Full Course", url: "https://www.youtube.com/embed/hXSFdwIOfnE", duration: "25:00" },
          { title: "Networking Basics", url: "https://www.youtube.com/embed/3b_TAYtzuho", duration: "30:00" }
        ]
      },
      {
        name: "2. Offensive Security",
        videos: [
          { title: "Ethical Hacking Full Course", url: "https://www.youtube.com/embed/3Kq1MIfTWCE", duration: "35:00" },
          { title: "Intro to Kali Linux", url: "https://www.youtube.com/embed/lZAoFs75_cs", duration: "40:00" }
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
