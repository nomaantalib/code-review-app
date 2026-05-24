const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const getApiKey = () => {
  return process.env.GOOGLE_API_KEY;
};

async function generateCodeReview(prompt, requestedModel = null) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  // List of fallback models in priority order
  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  // Build the list of models to try.
  // If a model is requested, try it first, then try the fallbacks.
  const modelsToTry = [];
  if (requestedModel) {
    modelsToTry.push(requestedModel);
  }
  for (const m of fallbackModels) {
    if (m !== requestedModel) {
      modelsToTry.push(m);
    }
  }

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI Service] Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });
      
      if (!result || !result.response) {
        throw new Error(`Invalid response from model ${modelName}`);
      }
      
      const text = result.response.text();
      if (!text) {
        throw new Error(`Empty response from model ${modelName}`);
      }
      
      console.log(`[AI Service] Successfully reviewed code using model: ${modelName}`);
      return { review: text, modelUsed: modelName };
    } catch (error) {
      console.error(`[AI Service] Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError ? lastError.message : "Unknown error"}`);
}

module.exports = { generateCodeReview };
