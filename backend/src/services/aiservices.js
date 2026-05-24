const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Default API Key provided by user
const DEFAULT_API_KEY = "AIzaSyAYy02CQ2z6nrwErxmTCG4QVnnRs0IYUS0";

const getApiKey = () => {
  const envKey = process.env.GOOGLE_API_KEY;
  // If envKey is not set, or is the old/invalid placeholder, use the new default key
  if (!envKey || envKey === "AIzaSyAxrgW4PckJzAs3B0ZfKleOVB1OlHBtpYM") {
    return DEFAULT_API_KEY;
  }
  return envKey;
};

async function generateCodeReview(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ["gemini-1.5-flash"];

  for (const modelName of models) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error("Invalid response from API");
      }
      
      const text = result.response.text();
      return text;
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error);
      throw error;
    }
  }

  throw new Error("AI service unavailable");
}

module.exports = { generateCodeReview };
