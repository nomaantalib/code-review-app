const Razorpay = require("razorpay");
const User = require("../models/User");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
const createOrder = async (req, res) => {
  try {
    const { amount, credits } = req.body;
    const userId = req.user.id;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_rcpt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        credits: credits,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// Verify payment and update credits
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      credits,
      couponCode,
    } = req.body;
    const userId = req.user.id;

    // Simple verification - in production use Razorpay's crypto validation
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    // Apply coupon discount if provided
    let finalCredits = parseInt(credits);
    if (couponCode) {
      // Simple coupon validation
      if (couponCode === "WELCOME10") {
        finalCredits = Math.floor(finalCredits * 1.1); // 10% extra credits
      } else if (couponCode === "FIRST20") {
        finalCredits = Math.floor(finalCredits * 1.2); // 20% extra credits
      }
    }

    // Update user credits
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: finalCredits } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
      creditsAdded: finalCredits,
      totalCredits: user.credits,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// Get pricing plans
const getPricingPlans = (req, res) => {
  const plans = [
    {
      id: 1,
      credits: 200,
      price: 99,
      originalPrice: 149,
      discount: "33% OFF",
      popular: false,
    },
    {
      id: 2,
      credits: 500,
      price: 199,
      originalPrice: 299,
      discount: "33% OFF",
      popular: true,
    },
    {
      id: 3,
      credits: 2000,
      price: 999,
      originalPrice: 1499,
      discount: "33% OFF",
      popular: false,
    },
  ];

  res.json(plans);
};

module.exports = {
  createOrder,
  verifyPayment,
  getPricingPlans,
};
