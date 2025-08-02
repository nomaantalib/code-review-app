const { generateContent } = require("../services/aiservices");

module.exports = async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }
    const response = await generateContent({ prompt });
    res.send(response);
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).send("Internal Server Error");
  }
};
