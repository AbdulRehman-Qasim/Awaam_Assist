const buildEducationPrompt = (profile, recommendations) => {
  const topRecs = recommendations.slice(0, 5);
  const recText = topRecs.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.score}% Match | Location: ${r.location}${r.program ? ` | Program: ${r.program}` : ''} | Reasons: ${r.reasons.slice(0,3).join('; ')}`
  ).join('\n');

  return `You are a senior AI Education Consultant writing a personalized academic intelligence report for a Pakistani student. Your tone is professional, analytical, and personalized — like a premium consultancy.

[STUDENT PROFILE]
Degree Goal: ${profile.degree || 'N/A'}
Current Marks: ${profile.marks || '0'}%
Target City: ${profile.city || 'N/A'}
Preferred Program: ${profile.preferredProgram || 'Any'}
Specialization: ${profile.specialization || 'General'}
Budget: PKR ${profile.budget || 'Flexible'}

[MATCHED UNIVERSITIES — THESE SCORES ARE FINAL AND AUTHORITATIVE]
${recText}

[INSTRUCTIONS]
Write a detailed, multi-section academic analysis HTML fragment. Use these EXACT match percentages as stated — do NOT invent or alter scores. Do NOT include <html>, <body>, or markdown code fences.

Use inline CSS only. Typography: font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;

Required sections:
<h2 style="color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:0 0 10px;">1. Executive Summary</h2>
— 2-3 sentences personalizing the student's situation and overall match quality.

<h2 style="color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;">2. Academic Compatibility Assessment</h2>
— Analyze how the student's marks and program align with top matches. Discuss merit thresholds if relevant.

<h2 style="color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;">3. University-by-University Analysis</h2>
— For EACH university in the list: one paragraph explaining WHY it ranked at its exact score, what advantages it offers, and what the student should know.

<h2 style="color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;">4. Financial & Geographic Compatibility</h2>
— Address budget alignment and location match relative to the student's preferences.

<h2 style="color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;">5. Strategic Recommendation</h2>
— Which university to prioritize and why. What steps should the student take next.

STRICT RULES:
- Never invent percentages — use only the scores provided above.
- Never mention being an AI or include meta-commentary.
- Write naturally and intelligently — not robotic bullet points.
- Keep total length professional but thorough (500-800 words of actual content).`;
};

const buildHealthcarePrompt = (profile, recommendations) => {
  const topRecs = recommendations.slice(0, 5);
  const recText = topRecs.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.score}% Match | Location: ${r.location}${r.type ? ` | Type: ${r.type}` : ''} | Reasons: ${r.reasons.slice(0,3).join('; ')}`
  ).join('\n');

  return `You are a senior AI Healthcare Advisor writing a personalized healthcare facility intelligence report. Your tone is professional, empathetic, and data-driven.

[PATIENT PROFILE]
City: ${profile.city || 'N/A'}
Max Budget: PKR ${profile.maxBudget || 'Flexible'}
Hospital Category: ${profile.hospitalCategory || 'General'}
Treatment Type: ${profile.treatmentType || 'General'}

[MATCHED FACILITIES — THESE SCORES ARE FINAL AND AUTHORITATIVE]
${recText}

[INSTRUCTIONS]
Write a detailed, multi-section healthcare intelligence HTML fragment. Use EXACT match percentages as stated. Do NOT include <html>, <body>, or markdown fences.

Use inline CSS only. Typography: font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;

Required sections:
<h2>1. Executive Summary</h2> — Personalize the situation and overall quality of matches.
<h2>2. Needs vs. Availability Analysis</h2> — How well do these facilities serve the stated needs?
<h2>3. Facility-by-Facility Analysis</h2> — For EACH facility: explain its score, strengths, and suitability.
<h2>4. Budget & Location Assessment</h2> — Financial and geographic alignment discussion.
<h2>5. Recommended Action Plan</h2> — Which facility to contact first and suggested next steps.

Use h2 style: color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;
First h2: margin-top:0;
Paragraphs: font-size:13px;color:#334155;line-height:1.75;margin-bottom:10px;font-weight:500;

STRICT RULES: Never invent percentages. Never mention AI. Write naturally. 500-800 words.`;
};

const buildSchemesPrompt = (profile, recommendations) => {
  const topRecs = recommendations.slice(0, 5);
  const recText = topRecs.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.score}% Match | Province/Region: ${r.location} | Reasons: ${r.reasons.slice(0,3).join('; ')}`
  ).join('\n');

  return `You are a senior AI Government Welfare Analyst writing a personalized eligibility and opportunity intelligence report for a Pakistani citizen. Your tone is professional, supportive, and factual.

[CITIZEN PROFILE]
Age: ${profile.age || 'N/A'}
Monthly Income: PKR ${profile.income || 'N/A'}
Province: ${profile.province || 'N/A'}
Employment Status: ${profile.employmentStatus || 'N/A'}
Family Size: ${profile.familySize || 'N/A'}
Financial Needs: ${Array.isArray(profile.financialNeedType) ? profile.financialNeedType.join(', ') : 'General'}

[MATCHED GOVERNMENT SCHEMES — THESE SCORES ARE FINAL AND AUTHORITATIVE]
${recText}

[INSTRUCTIONS]
Write a detailed, multi-section welfare intelligence HTML fragment. Use EXACT match percentages as stated. Do NOT include <html>, <body>, or markdown fences.

Use inline CSS only. Typography: font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;

Required sections:
<h2>1. Executive Summary</h2> — Personalize the citizen's eligibility landscape.
<h2>2. Eligibility Intelligence</h2> — How does the profile align with each scheme's criteria?
<h2>3. Scheme-by-Scheme Analysis</h2> — For EACH scheme: explain its score, what it offers, and eligibility key points.
<h2>4. Financial Impact Assessment</h2> — Potential benefit if enrolled in top schemes.
<h2>5. Application Strategy</h2> — Which scheme to apply for first and how to proceed.

Use h2 style: color:#1e3a5f;font-size:15px;font-weight:800;border-bottom:1px solid rgba(59,130,246,.2);padding-bottom:6px;margin:20px 0 10px;
First h2: margin-top:0;
Paragraphs: font-size:13px;color:#334155;line-height:1.75;margin-bottom:10px;font-weight:500;

STRICT RULES: Never invent percentages. Never mention AI. Write naturally. 500-800 words.`;
};

const buildPrompt = (module, profile, recommendations) => {
  switch (module) {
    case 'education': return buildEducationPrompt(profile, recommendations);
    case 'healthcare': return buildHealthcarePrompt(profile, recommendations);
    case 'schemes': return buildSchemesPrompt(profile, recommendations);
    default: throw new Error('Invalid module');
  }
};

module.exports = { buildPrompt };
