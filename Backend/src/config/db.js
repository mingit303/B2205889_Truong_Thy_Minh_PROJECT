const mongoose = require("mongoose");

async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }
}

module.exports = connectDB;