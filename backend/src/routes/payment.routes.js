const express = require("express");
const {
  createOrder,
  verifyPayment,
  upiPayment,
  verifyManualPayment,
  getPricingPlans,
} = require("../controllers/payment.controllers");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Create order route
router.post("/create-order", authMiddleware, createOrder);

// Verify payment route
router.post("/verify-payment", authMiddleware, verifyPayment);

// UPI payment route
router.post("/upi-payment", authMiddleware, upiPayment);

// Manual payment verification route
router.post("/verify-manual-payment", authMiddleware, verifyManualPayment);

// Get pricing plans
router.get("/pricing", getPricingPlans);

// Get user payment history
router.get("/history/:userId", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.params.userId).select(
      "paymentHistory"
    );
    res.status(200).json(user.paymentHistory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment history", error });
  }
});

module.exports = router;
