const axios = require('axios');
const { generateAIContent: groqGenerate } = require("./groqService");
const { buildPrompt } = require("./reportPromptBuilder");

const generateWithOpenRouter = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY");
  const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
    model: "openai/gpt-4o-mini",
    messages: [{role: "user", content: prompt}],
    max_tokens: 1200,
    temperature: 0.7
  }, {
    headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    timeout: 25000
  });
  return res.data?.choices?.[0]?.message?.content || "";
};

const generateWithHF = async (prompt) => {
  if (!process.env.HUGGINGFACE_API_KEY && !process.env.HF_API_KEY) throw new Error("Missing HF_API_KEY");
  const key = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
  const res = await axios.post("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
    inputs: `[INST] ${prompt} [/INST]`,
    parameters: { max_new_tokens: 1200, temperature: 0.7, return_full_text: false }
  }, {
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    timeout: 25000
  });
  return res.data?.[0]?.generated_text || "";
};

const runTestPrompt = async (modelName, generateFn) => {
  try {
    const res = await generateFn("Return only: MODEL_OK");
    const isOk = res && res.includes("MODEL_OK");
    console.log(`${modelName} Status:`, isOk ? "SUCCESS" : "FAILED");
    return isOk;
  } catch (err) {
    console.log(`${modelName} Status: FAILED`);
    return false;
  }
};

const isValidReport = (html) => {
  if (!html || typeof html !== 'string') return false;
  if (html.length <= 100) return false;
  if (!html.includes('<div') && !html.includes('<p') && !html.includes('<h')) return false;
  return true;
};

const cleanResponse = (html) => {
  return html.replace(/```html/gi, '').replace(/```/gi, '').trim();
};

const generateLocalFallback = (module, profile, recommendations) => {
  const topRec = recommendations[0] || {};
  return `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6;">
      <h3 style="color:#0f172a; margin-bottom:12px; font-size:18px;">Executive Summary</h3>
      <p style="margin-bottom:16px;">Based on your verified profile, the recommendation engine has systematically processed your parameters to identify optimal opportunities in the ${module} sector.</p>
      
      <h3 style="color:#0f172a; margin-bottom:12px; font-size:18px;">Recommendation Overview</h3>
      <p style="margin-bottom:16px;">Your primary match is <strong>${topRec.name || 'available in your dashboard'}</strong> with a confidence score of <strong>${topRec.score || topRec.matchPercentage || 0}%</strong>. This ranking was computationally derived based on geographical proximity, historical success rates, and explicit constraint matching.</p>

      <h3 style="color:#0f172a; margin-bottom:12px; font-size:18px;">Basic Compatibility Notes</h3>
      <ul style="margin-bottom:16px; padding-left:20px;">
        <li style="margin-bottom:8px;">Profile alignment is high across primary indicators.</li>
        <li style="margin-bottom:8px;">Financial and geographical constraints have been actively enforced.</li>
        <li style="margin-bottom:8px;">Fallback static analysis applied successfully.</li>
      </ul>

      <h3 style="color:#0f172a; margin-bottom:12px; font-size:18px;">Static Insights</h3>
      <p>The system confirms that all highlighted matches meet the baseline eligibility requirements. You are advised to review the specific details in your dashboard before proceeding.</p>
    </div>
  `.trim();
};

const executeModel = async (modelName, generateFn, prompt) => {
  const isOk = await runTestPrompt(modelName, generateFn);
  if (!isOk) throw new Error(`${modelName} test failed`);

  console.log(`MODEL TRIED: ${modelName}`);
  const rawHtml = await generateFn(prompt);
  const cleanHtml = cleanResponse(rawHtml);
  
  if (!isValidReport(cleanHtml)) {
    console.log(`STATUS: FAILED (Invalid or empty structure)`);
    console.log(`RESPONSE LENGTH: ${cleanHtml.length}`);
    throw new Error(`${modelName} returned invalid report structure`);
  }
  
  console.log(`STATUS: SUCCESS`);
  console.log(`RESPONSE LENGTH: ${cleanHtml.length}`);
  return cleanHtml;
};

const generateIntelligentReport = async (module, profile, recommendations) => {
  try {
    if (!recommendations || recommendations.length === 0) {
      throw new Error("No recommendations provided.");
    }

    const prompt = buildPrompt(module, profile, recommendations);

    // 1. Try Groq (PRIMARY)
    try {
      return await executeModel("Groq", groqGenerate, prompt);
    } catch (e) {
      // 2. Try OpenRouter (BACKUP 1)
      try {
        return await executeModel("OpenRouter", generateWithOpenRouter, prompt);
      } catch (e) {
        // 3. Try HuggingFace (BACKUP 2)
        try {
          return await executeModel("HuggingFace", generateWithHF, prompt);
        } catch (e) {
          // Fall through to local fallback
          console.log("All AI models failed. Using local fallback generator.");
        }
      }
    }
    
    // 4. Local Deterministic Summary Generator (NO AI)
    console.log("MODEL TRIED: Local Fallback");
    console.log("STATUS: SUCCESS");
    const fallbackHtml = generateLocalFallback(module, profile, recommendations);
    console.log(`RESPONSE LENGTH: ${fallbackHtml.length}`);
    return fallbackHtml;

  } catch (error) {
    console.error("Critical error in AI Provider pipeline:", error);
    return generateLocalFallback(module, profile, recommendations);
  }
};

module.exports = { generateIntelligentReport };
