const { generateCodeReview } = require("../services/aiservices");

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
    console.error("Error in AI controller (FULL):", error);

    // Check for specific Gemini errors (often 404 or 400 from Google API)
    let errorMessage = error.message;
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      errorMessage =
        "AI Model not available (404). Please check API configuration.";
    }

    res.status(500).json({
      message: "AI review failed",
      error: errorMessage,
    });
  }
};
