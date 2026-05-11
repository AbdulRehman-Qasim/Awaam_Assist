const Groq = require("groq-sdk");

console.log("Groq Key Loaded:", !!process.env.GROQ_API_KEY);

const generateAIContent = async (prompt) => {
  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    throw new Error("GROQ_API_KEY is missing from environment variables.");
  }
  
  const groq = new Groq({ apiKey: API_KEY });

  // Timeout handling
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Groq API request timed out")), 25000);
  });

  const generatePromise = async () => {
    try {
      console.log("Sending prompt to Groq...");
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const aiText = completion?.choices?.[0]?.message?.content || "";
      if (!aiText) {
        throw new Error("Groq returned an empty response.");
      }
      
      console.log("Groq Response Received Successfully.");
      return aiText;
    } catch (err) {
      console.error("Groq Native Error:", err);
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
