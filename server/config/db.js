const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Do NOT exit — let the server still start so the frontend
    // gets proper API error responses instead of ERR_CONNECTION_REFUSED.
    // process.exit(1);
  }
};

module.exports = connectDB;
