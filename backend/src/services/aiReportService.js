const { generateAIContent } = require("./geminiService");
const { buildPrompt } = require("./reportPromptBuilder");

const generateIntelligentReport = async (module, profile, recommendations) => {
  try {
    const prompt = buildPrompt(module, profile, recommendations);
    
    // Check if recommendations exist
    if (!recommendations || recommendations.length === 0) {
      throw new Error("No recommendations provided to generate report.");
    }

    const aiHtmlContent = await generateAIContent(prompt);
    
    if (!aiHtmlContent) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean up potential markdown artifacts
    return aiHtmlContent.replace(/```html/gi, '').replace(/```/gi, '').trim();
  } catch (error) {
    console.error("--- AI Report Generation Failed ---");
    console.error(error);
    console.error("-----------------------------------");
    // Graceful fallback ONLY if actual failure
    return `
      <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404; font-family: sans-serif;">
        <strong>Notice:</strong> Unable to generate AI insights at the moment. Showing standard report data.
        <br/><small style="opacity:0.7">Error: ${error.message}</small>
      </div>
    `;
  }
};

module.exports = { generateIntelligentReport };
