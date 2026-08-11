const mongoose = require("mongoose");
const config = require("./env");

/**
 * Connect to MongoDB using Mongoose.
 * Logs success or exits on failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
