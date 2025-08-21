const { generateContent } = require("../services/aiservices");
const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const code = req.body.code;
    const userId = req.user?.id; // Get user ID from authenticated request

    if (!code) {
      return res.status(400).send("Code is required");
    }

    if (!userId) {
      return res.status(401).send("Authentication required");
    }

    // Check user credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.credits < 1) {
      return res.status(402).json({
        error: "Insufficient credits",
        message:
          "You don't have enough credits to perform a code review. Please contact support or wait for credit refresh.",
      });
    }

    // Deduct 1 credit and save
    user.credits -= 1;
    await user.save();

    // Generate AI review
    const response = await generateContent({ prompt: code });

    res.json({
      review: response,
      creditsRemaining: user.credits,
    });
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).send("Internal Server Error");
  }
};
