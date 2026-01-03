const express = require("express");
const airoutes = require("./routes/airoutes");
const cors = require("cors");
const connectDB = require("./config/db");

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === "production") {
      callback(null, true);
    } else {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/ai", airoutes);

// Import auth routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Import payment routes
const paymentRoutes = require("./routes/payment.routes");
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
