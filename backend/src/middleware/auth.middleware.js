const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Check if JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ message: "Server configuration error" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = authMiddleware;
