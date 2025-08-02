const { GoogleGenAI } = require("@google/genai");

const dotenv = require("dotenv");
dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in the environment variables");
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function generateContent(params) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [params.prompt],
  });
  return response.text;
}

module.exports = { generateContent };
