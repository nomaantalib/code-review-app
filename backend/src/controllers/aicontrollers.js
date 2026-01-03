const { generateCodeReview } = require("../services/aiservices");
const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { code } = req.body;

    // Check if this is the default example code - allow anonymous access
    const defaultCode = ` function sum() {
  return 1 + 1
}`;
    const isDefaultCode = code.trim() === defaultCode.trim();

    // Only require authentication for non-default code
    if (!isDefaultCode && !req.user) {
      console.error(
        "AI Controller: No user found in request for custom code review"
      );
      return res
        .status(401)
        .json({ message: "Authentication required for custom code reviews" });
    }

    // Check if user has enough credits for custom code
    if (!isDefaultCode && req.user && req.user.credits < 1) {
      console.error(
        "AI Controller: Insufficient credits for user",
        req.user._id
      );
      return res.status(402).json({
        message: "Insufficient credits. Please purchase more credits.",
      });
    }

    const prompt = `
You are an expert code reviewer with 7+ years experience.
Review the following code:

${code}
`;

    console.log(
      `[AI Controller] Generating review for ${
        req.user ? "user " + req.user._id : "anonymous user"
      }`
    );
    const review = await generateCodeReview(prompt);

    // Check if this is the default example code - don't deduct credits for demo
    // defaultCode and isDefaultCode are already declared above

    let creditsRemaining;
    if (!isDefaultCode && req.user) {
      // Update user credits in database only for non-default code with authenticated user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { credits: -1 } },
        { new: true }
      );
      creditsRemaining = updatedUser.credits;
    } else if (req.user) {
      // For default code with authenticated user, just get current credits
      const currentUser = await User.findById(req.user._id);
      creditsRemaining = currentUser.credits;
    } else {
      // Anonymous user - no credits to track
      creditsRemaining = null;
    }

    res.json({
      review,
      creditsRemaining,
    });
  } catch (error) {
    console.error("Error in AI controller:", error);

    let errorMessage = error.message || "Unknown error";
    let statusCode = 500;

    if (errorMessage.includes("GOOGLE_API_KEY")) {
      statusCode = 503;
      errorMessage = "AI service not configured";
    } else if (errorMessage.includes("401") || errorMessage.includes("authentication")) {
      statusCode = 503;
      errorMessage = "AI service authentication failed";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      statusCode = 503;
      errorMessage = "AI model not available";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      statusCode = 429;
      errorMessage = "AI service rate limit exceeded. Please try again later.";
    }

    res.status(statusCode).json({
      message: "Unable to generate review",
      error: errorMessage,
    });
  }
};
