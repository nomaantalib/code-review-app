const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/auth.controllers");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Register route with error handling
router.post("/register", (req, res, next) => {
  registerUser(req, res).catch(next);
});

// Login route with error handling
router.post("/login", (req, res, next) => {
  loginUser(req, res).catch(next);
});

// Get user profile (protected route) with error handling
router.get("/profile", authMiddleware, (req, res, next) => {
  getUserProfile(req, res).catch(next);
});

// Global error handler for auth routes
router.use((error, req, res, next) => {
  console.error("Auth route error:", error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Invalid input data" });
  }
  res.status(500).json({ message: "Server error, please try again later" });
});

module.exports = router;
