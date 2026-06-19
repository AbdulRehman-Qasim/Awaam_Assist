/**
 * reviewAnalyzerService.js
 * Analyzes scraped Reddit posts and produces structured category ratings (0–10)
 * using OpenAI GPT-4o-mini with a keyword-based fallback.
 *
 * Categories:
 *  1. doctorQuality       – expertise, attitude, diagnosis quality
 *  2. cleanliness         – hygiene, ward cleanliness, sanitation
 *  3. waitTime            – speed of service (10 = very fast, 0 = extremely slow)
 *  4. staffBehavior       – nurses, reception, support staff friendliness
 *  5. facilitiesEquipment – infrastructure, wards, lab, medical equipment
 *  6. costValue           – affordability, billing transparency (10 = very affordable)
 */

'use strict';

const { OpenAI } = require('openai');

// Lazy-initialize so the module can be required before dotenv loads OPENAI_API_KEY
let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ── OpenAI-powered analysis ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert analyst for Pakistani hospital community reviews scraped from Reddit.
Your task: given Reddit posts about a hospital, produce a structured JSON rating object.
Always return valid JSON only — no markdown, no explanation.`;

async function analyzeWithOpenAI(hospitalName, city, posts) {
  if (!posts || posts.length === 0) return null;

  // Build a compact text block from the posts (keep tokens low)
  const postsText = posts
    .slice(0, 15)
    .map(
      (p, i) =>
        `[${i + 1}] r/${p.subreddit} | Score:${p.score}\nTitle: ${p.title}\n${
          p.snippet ? `Body: ${p.snippet.slice(0, 300)}` : ''
        }`
    )
    .join('\n---\n');

  const userPrompt = `Hospital: "${hospitalName}" (${city || 'Pakistan'})
Total posts found: ${posts.length}

Reddit discussions:
${postsText}

Rate this hospital on each category (0–10 scale). Use null if a category has no data.

Categories:
- doctorQuality: Doctor expertise, bedside manner, diagnosis quality
- cleanliness: Hospital hygiene, ward cleanliness, sanitation
- waitTime: Speed of service (10=very fast, 0=extremely slow)  
- staffBehavior: Nurses, reception, support staff attitude
- facilitiesEquipment: Medical equipment, infrastructure, wards
- costValue: Affordability, billing transparency (10=very affordable)

Return ONLY this JSON (fill in numbers or null):
{
  "doctorQuality": <0-10 or null>,
  "cleanliness": <0-10 or null>,
  "waitTime": <0-10 or null>,
  "staffBehavior": <0-10 or null>,
  "facilitiesEquipment": <0-10 or null>,
  "costValue": <0-10 or null>,
  "summary": "<one sentence community summary>",
  "totalMentions": <number>
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model:            'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      response_format:  { type: 'json_object' },
      temperature:      0.2,
      max_tokens:       400,
    });

    const raw    = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Compute overall from all non-null values
    const values = [
      parsed.doctorQuality,
      parsed.cleanliness,
      parsed.waitTime,
      parsed.staffBehavior,
      parsed.facilitiesEquipment,
      parsed.costValue,
    ].filter((v) => v !== null && v !== undefined && !Number.isNaN(v));

    const overallRating =
      values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;

    return {
      ratings: {
        doctorQuality:       parsed.doctorQuality       ?? null,
        cleanliness:         parsed.cleanliness         ?? null,
        waitTime:            parsed.waitTime            ?? null,
        staffBehavior:       parsed.staffBehavior       ?? null,
        facilitiesEquipment: parsed.facilitiesEquipment ?? null,
        costValue:           parsed.costValue           ?? null,
      },
      overallRating,
      summary:       parsed.summary       || '',
      totalMentions: parsed.totalMentions || posts.length,
    };
  } catch (err) {
    console.error('[ReviewAnalyzer] OpenAI call failed:', err.message);
    return null;
  }
}

// ── Keyword-based fallback ────────────────────────────────────────────────────

const KEYWORD_MAP = {
  doctorQuality: {
    positive: ['great doctor','excellent doctor','good doctor','professional','experienced','skilled doctor','caring doctor','knowledgeable','helpful doctor','amazing doctor'],
    negative:  ['bad doctor','rude doctor','incompetent','wrong diagnosis','ignored patient','careless doctor','unprofessional doctor'],
  },
  cleanliness: {
    positive: ['clean','hygienic','tidy','well maintained','sanitized','spotless','neat','fresh'],
    negative:  ['dirty','filthy','unhygienic','unclean','smelly','garbage','rats','cockroach'],
  },
  waitTime: {
    positive: ['quick','fast','no wait','immediate','prompt','efficient','speedy','same day'],
    negative:  ['long wait','hours waiting','slow','delayed','waiting forever','queue','3 hours','4 hours','all day'],
  },
  staffBehavior: {
    positive: ['friendly staff','helpful','kind','cooperative','polite','caring staff','supportive','responsive'],
    negative:  ['rude staff','unhelpful','arrogant','ignored','dismissive','mean','disrespectful'],
  },
  facilitiesEquipment: {
    positive: ['modern','well equipped','advanced','latest equipment','good facilities','new building','state of the art'],
    negative:  ['outdated','poor equipment','lack of equipment','broken','old facilities','no equipment'],
  },
  costValue: {
    positive: ['affordable','cheap','reasonable','value','free','low cost','budget friendly','government hospital'],
    negative:  ['expensive','overpriced','costly','charged too much','rip off','high bills'],
  },
};

function keywordFallback(posts) {
  const text = posts
    .map((p) => `${p.title} ${p.snippet}`)
    .join(' ')
    .toLowerCase();

  const ratings = {};

  for (const [cat, { positive, negative }] of Object.entries(KEYWORD_MAP)) {
    const pos = positive.filter((w) => text.includes(w)).length;
    const neg = negative.filter((w) => text.includes(w)).length;
    if (pos === 0 && neg === 0) {
      ratings[cat] = null;
    } else {
      const total = pos + neg;
      ratings[cat] = Math.round(((pos / total) * 10) * 10) / 10;
    }
  }

  const values = Object.values(ratings).filter((v) => v !== null);
  const overallRating =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0;

  return {
    ratings,
    overallRating,
    summary: `Keyword analysis of ${posts.length} Reddit community posts.`,
    totalMentions: posts.length,
  };
}

// ── Combined export ───────────────────────────────────────────────────────────

/**
 * Analyze posts using OpenAI first; fall back to keyword scoring.
 */
async function analyzeHospitalPosts(hospitalName, city, posts) {
  if (!posts || posts.length === 0) return null;

  // Try OpenAI
  const aiResult = await analyzeWithOpenAI(hospitalName, city, posts);
  if (aiResult) return aiResult;

  // Fallback
  console.warn(`[ReviewAnalyzer] Using keyword fallback for "${hospitalName}"`);
  return keywordFallback(posts);
}

module.exports = { analyzeHospitalPosts };
