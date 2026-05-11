const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

const generateAIContent = async (prompt) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // Timeout handling
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Gemini API request timed out")), 25000); // increased timeout
  });

  const generatePromise = async () => {
    try {
      console.log("Sending prompt to Gemini...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini Response Received Successfully.");
      return text;
    } catch (err) {
      console.error("Gemini Native Error:", err);
      throw err;
    }
  };

  const text = await Promise.race([
    generatePromise(),
    timeoutPromise
  ]);

  return text;
};

module.exports = { generateAIContent };
