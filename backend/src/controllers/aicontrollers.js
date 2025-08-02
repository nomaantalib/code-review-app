const { generateContent } = require("../services/aiservices");

module.exports = async (req, res) => {
  try {
    const code = req.body.code;
    if (!code) {
      return res.status(400).send("Prompt is required");
    }
    const response = await generateContent({ prompt: code });
    res.send(response);
  } catch (error) {
    console.error("Error in AI controller:", error);
    res.status(500).send("Internal Server Error");
  }
};
