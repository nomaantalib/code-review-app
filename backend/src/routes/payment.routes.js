const express = require("express");
const {
  createOrder,
  verifyPayment,
  upiPayment,
  verifyManualPayment,
  getPricingPlans,
  getPaymentHistory,
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
router.get("/history/:userId", authMiddleware, getPaymentHistory);

module.exports = router;
