const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateCodeReview(prompt) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

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
