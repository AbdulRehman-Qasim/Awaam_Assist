/**
 * Quick smoke-test for RecommendationEngine v2
 * Run: node backend/src/utils/testEngine.js
 */
const { scoreUniversities } = require("./RecommendationEngine");

const mockUniversities = [
  {
    _id: "1",
    title: "LUMS - Lahore University of Management Sciences",
    discipline: "Computer Science",
    degree: "Bachelor",
    city: "Lahore",
    province: "Punjab",
    merit: 85,
    fee: 250000,
    feeType: "Semester Fee",
    ranking: 1,
  },
  {
    _id: "2",
    title: "FAST University",
    discipline: "Computer Science",
    degree: "Bachelor",
    city: "Islamabad",
    province: "Punjab",
    merit: 80,
    fee: 120000,
    feeType: "Semester Fee",
    ranking: 5,
  },
  {
    _id: "3",
    title: "Aga Khan University",
    discipline: "Medicine",
    degree: "MBBS",
    city: "Karachi",
    province: "Sindh",
    merit: 90,
    fee: 1500000,
    feeType: "Annual Fee",
    ranking: 2,
  },
  {
    _id: "4",
    title: "University of Peshawar",
    discipline: "Computer Science",
    degree: "BCS",
    city: "Peshawar",
    province: "KPK",
    merit: 55,
    fee: 25000,
    feeType: "Semester Fee",
    ranking: null,
  },
  {
    _id: "5",
    title: "UET Lahore",
    discipline: "Engineering",
    degree: "Bachelor",
    city: "Lahore",
    province: "Punjab",
    merit: 70,
    fee: 127000,
    feeType: "Semester Fee",
    ranking: 8,
  },
  {
    _id: "6",
    title: "Karachi University",
    discipline: "General",
    degree: "Bachelor",
    city: "Karachi",
    province: "Sindh",
    merit: 50,
    fee: 20000,
    feeType: "Semester Fee",
    ranking: 40,
  },
];

const mockProfile = {
  education: {
    marks: 88,
    discipline: "Computer Science",
    preferredProgram: "Computer Science",
    degree: "Bachelor",
    city: "Lahore",
    province: "Punjab",
    feeRange: "100k-200k",
  },
  schemes: {
    income: 80000,
  },
};

console.log("=== Recommendation Engine v2 — Smoke Test ===\n");
const results = scoreUniversities(mockUniversities, mockProfile, {});

results.forEach((r, i) => {
  console.log(`${i + 1}. [${r.score}%] ${r.name}`);
  console.log(`   📍 ${r.location} | ${r.feeType} | ${r.rank}`);
  console.log(`   🏷  ${r.tags.join("  ")}`);
  console.log(`   💬 ${r.reason.slice(0, 2).join(" | ")}`);
  console.log();
});

// Validation checks
const scores = results.map(r => r.score);
console.log("--- Validation ---");
console.log(`✔ All scores 0-100: ${scores.every(s => s >= 0 && s <= 100)}`);
console.log(`✔ Results sorted:   ${scores.every((s, i) => i === 0 || scores[i-1] >= s)}`);
console.log(`✔ Has whyMatched:   ${results.every(r => r.reason.length > 0)}`);
console.log(`✔ Has tags:         ${results.every(r => r.tags.length > 0)}`);

// City diversity check (top 5)
const top5Cities = results.slice(0, 5).map(r => r.location.split(",")[0].trim());
const cityOccurrences = top5Cities.reduce((acc, c) => { acc[c] = (acc[c]||0)+1; return acc; }, {});
const diversityOk = Object.values(cityOccurrences).every(count => count <= 2);
console.log(`✔ City diversity:   ${diversityOk} — ${JSON.stringify(cityOccurrences)}`);
