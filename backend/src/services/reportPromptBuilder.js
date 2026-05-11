const buildEducationPrompt = (profile, recommendations) => {
  return `
    You are an elite AI Education Counselor. Generate a premium, intelligent, and highly personalized educational compatibility report using the following REAL recommendation intelligence data.
    
    [USER PROFILE SUMMARY]
    - Degree Goal: ${profile.degree || 'Not specified'}
    - Current Marks: ${profile.marks || '0'}%
    - Target City: ${profile.city || 'Not specified'}
    - Preferred Program: ${profile.preferredProgram || 'All Programs'}
    - Specialization: ${profile.specialization || 'General'}
    - Budget: ${profile.budget || 'Flexible'}

    [REAL RECOMMENDATION LIST]
    ${recommendations.map(r => `
    - University: ${r.name}
      Match Score: ${r.score}%
      Location: ${r.location}
      Primary Reasons: ${r.reasons.join(', ')}
    `).join('\n')}

    [ANALYSIS INSTRUCTIONS & FORMATTING]
    Format your response strictly as an HTML fragment (no <html>, <head>, or <body> tags) using premium styling (inline CSS allowed). Use professional, analytical language.
    Structure the report EXACTLY as follows:

    <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px;">1. Executive Summary</h2>
      <p>...brief high-level summary of the compatibility analysis...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">2. User Profile Analysis</h2>
      <p>...analyze the student's marks, budget, and career goals...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">3. Compatibility Intelligence</h2>
      <p>...explain the matching logic based on the provided factors...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">4. Ranked Recommendation Breakdown</h2>
      ...For EACH recommendation, include:
      - Why it matched
      - Affordability analysis
      - Eligibility analysis
      - Location compatibility
      - Program alignment
      - Advantages
      - Possible limitations...

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">5. Comparative Analysis</h2>
      <p>...compare the top options against each other...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">6. AI Career Insights</h2>
      <p>...long term career implications based on these choices...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">7. Strategic Recommendation</h2>
      <p>...which specific choice is the absolute best and why...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">8. Final AI Conclusion</h2>
      <p>...closing professional statement...</p>
    </div>

    DO NOT include markdown block markers like \`\`\`html. Return ONLY the raw HTML string. Use bolding and lists for readability where appropriate.
  `;
};

const buildHealthcarePrompt = (profile, recommendations) => {
  return `
    You are an elite AI Healthcare Advisor. Generate a premium, intelligent, and highly personalized medical compatibility report using the following REAL recommendation intelligence data.
    
    [USER PROFILE SUMMARY]
    - Location: ${profile.city || 'Not specified'}
    - Treatment Type: ${profile.treatmentType || 'General Consultation'}
    - Max Budget: PKR ${profile.maxBudget || 'Flexible'}
    - Category: ${profile.hospitalCategory || 'General'}

    [REAL RECOMMENDATION LIST]
    ${recommendations.map(r => `
    - Hospital: ${r.name}
      Match Score: ${r.score}%
      Location: ${r.location}
      Primary Reasons: ${r.reasons.join(', ')}
    `).join('\n')}

    [ANALYSIS INSTRUCTIONS & FORMATTING]
    Format your response strictly as an HTML fragment (no <html>, <head>, or <body> tags) using premium styling (inline CSS allowed). Use professional, analytical language.
    Structure the report EXACTLY as follows:

    <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px;">1. Executive Summary</h2>
      <p>...brief high-level summary of the compatibility analysis...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">2. User Profile Analysis</h2>
      <p>...analyze the patient's treatment needs, budget, and urgency...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">3. Compatibility Intelligence</h2>
      <p>...explain the matching logic based on the provided factors...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">4. Ranked Recommendation Breakdown</h2>
      ...For EACH recommendation, include:
      - Why it matched
      - Affordability analysis
      - Eligibility analysis
      - Location compatibility
      - Treatment alignment
      - Advantages
      - Possible limitations...

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">5. Comparative Analysis</h2>
      <p>...compare the top options against each other...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">6. AI Healthcare Insights</h2>
      <p>...long term healthcare implications and immediate actions...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">7. Strategic Recommendation</h2>
      <p>...which specific choice is the absolute best and why...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">8. Final AI Conclusion</h2>
      <p>...closing professional statement...</p>
    </div>

    DO NOT include markdown block markers like \`\`\`html. Return ONLY the raw HTML string. Use bolding and lists for readability where appropriate.
  `;
};

const buildSchemesPrompt = (profile, recommendations) => {
  return `
    You are an elite AI Government Welfare Advisor. Generate a premium, intelligent, and highly personalized welfare compatibility report using the following REAL recommendation intelligence data.
    
    [USER PROFILE SUMMARY]
    - Age: ${profile.age || 'Not specified'}
    - Monthly Income: PKR ${profile.income || 'Not specified'}
    - Province: ${profile.province || 'Not specified'}
    - Employment: ${profile.employmentStatus || 'Not specified'}
    - Education: ${profile.educationLevel || 'Not specified'}
    - Assistance Needs: ${profile.financialNeedType?.join(', ') || 'General'}

    [REAL RECOMMENDATION LIST]
    ${recommendations.map(r => `
    - Scheme: ${r.name}
      Match Score: ${r.score}%
      Location: ${r.location}
      Primary Reasons: ${r.reasons.join(', ')}
    `).join('\n')}

    [ANALYSIS INSTRUCTIONS & FORMATTING]
    Format your response strictly as an HTML fragment (no <html>, <head>, or <body> tags) using premium styling (inline CSS allowed). Use professional, analytical language.
    Structure the report EXACTLY as follows:

    <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px;">1. Executive Summary</h2>
      <p>...brief high-level summary of the compatibility analysis...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">2. User Profile Analysis</h2>
      <p>...analyze the citizen's income, age, and welfare needs...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">3. Compatibility Intelligence</h2>
      <p>...explain the matching logic based on the provided factors...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">4. Ranked Recommendation Breakdown</h2>
      ...For EACH recommendation, include:
      - Why it matched
      - Affordability analysis (if applicable)
      - Eligibility analysis
      - Location compatibility
      - Scheme alignment
      - Advantages
      - Possible limitations...

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">5. Comparative Analysis</h2>
      <p>...compare the top options against each other...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">6. AI Welfare Insights</h2>
      <p>...long term welfare implications and application readiness...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">7. Strategic Recommendation</h2>
      <p>...which specific choice is the absolute best and why...</p>

      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; margin-top: 24px;">8. Final AI Conclusion</h2>
      <p>...closing professional statement...</p>
    </div>

    DO NOT include markdown block markers like \`\`\`html. Return ONLY the raw HTML string. Use bolding and lists for readability where appropriate.
  `;
};

const buildPrompt = (module, profile, recommendations) => {
  switch (module) {
    case 'education': return buildEducationPrompt(profile, recommendations);
    case 'healthcare': return buildHealthcarePrompt(profile, recommendations);
    case 'schemes': return buildSchemesPrompt(profile, recommendations);
    default: throw new Error("Invalid module");
  }
};

module.exports = { buildPrompt };
