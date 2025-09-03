require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function loginUser() {
    const userId = '688f9bc4dd0a99fe313b03c6'; // Use the first user ID
    const user = await User.findById(userId);
    if (user) {
        console.log(`Logging in user: ${user.name}`);
        // Simulate login process here
    } else {
        console.log('User not found');
    }
}

async function testDatabase() {
    await loginUser();
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected successfully");
    
    // Get all users
    const users = await User.find();
    console.log("\nUsers in database:");
    console.log(users);
    
    if (users.length > 0) {
      console.log("\nFirst user ID:", users[0]._id.toString());
    } else {
      console.log("\nNo users found in database");
    }
    
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testDatabase();
