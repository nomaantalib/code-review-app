const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateCodeReview(prompt) {
  // Try primary model: gemini-2.5-flash
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    return result.response.text();
  } catch (error) {
    console.error(
      "Gemini 2.5 Flash failed, trying gemini-2.5-pro backup:",
      error.message
    );

    // Fallback to gemini-2.5-pro
    try {
      const backupModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await backupModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return result.response.text();
    } catch (backupError) {
      console.error("All AI models failed:", backupError.message);
      throw new Error("AI Service Unavailable: " + backupError.message);
    }
  }
}

module.exports = { generateCodeReview };
