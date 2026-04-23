const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const course = await Course.findOne({ title: "UI/UX Design Fundamentals" });
  console.log(JSON.stringify(course.topics, null, 2));
  process.exit(0);
}

check();
