const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in environment variables");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(
      "Failed to connect to MongoDB. Please check your MONGODB_URI environment variable."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
