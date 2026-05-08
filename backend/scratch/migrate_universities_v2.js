const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../../frontend/campusfinder_cleaned.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// ─── NORMALIZERS ───────────────────────────────────────────────────────────────

const normalizeCity = (city) => {
    if (!city) return "Unknown";
    const lower = city.toLowerCase().trim();
    if (lower === 'lhr' || lower === 'lahore') return 'Lahore';
    if (lower === 'isb' || lower === 'islamabad') return 'Islamabad';
    if (lower === 'fsd' || lower === 'faisalabad') return 'Faisalabad';
    if (lower === 'sarghoda' || lower === 'sargodha') return 'Sargodha';
    if (lower === 'multan') return 'Multan';
    if (lower === 'karachi') return 'Karachi';
    if (lower === 'peshawar') return 'Peshawar';
    if (lower === 'quetta') return 'Quetta';
    if (lower === 'rawalpindi' || lower === 'rwp') return 'Rawalpindi';
    if (lower === 'hyderabad' || lower === 'hyd') return 'Hyderabad';
    return city.charAt(0).toUpperCase() + city.slice(1);
};

const normalizeProvince = (p) => {
    if (!p) return "Unknown";
    const lower = p.toLowerCase().trim();
    if (lower === 'punjab') return 'Punjab';
    if (lower === 'kpk' || lower === 'khyber pakhtunkhwa') return 'KPK';
    if (lower === 'sindh') return 'Sindh';
    if (lower === 'balochistan') return 'Balochistan';
    if (lower === 'ajk' || lower === 'azad kashmir') return 'AJK';
    if (lower === 'islamabad' || lower === 'ict') return 'Islamabad';
    if (lower === 'gilgit-baltistan' || lower === 'gb') return 'Gilgit-Baltistan';
    return p;
};

const normalizeDegree = (degree) => {
    if (!degree) return "Bachelor";
    const d = degree.toUpperCase();
    if (d.includes("MBBS")) return "MBBS";
    if (d.includes("BCS")) return "BCS";
    if (d.includes("BBA")) return "BBA";
    if (d.includes("BS") || d.includes("BACHELOR")) return "Bachelor";
    if (d.includes("MS") || d.includes("MASTER")) return "Master";
    if (d.includes("PHD")) return "PhD";
    return "Bachelor";
};

const normalizeDiscipline = (disc) => {
    if (!disc) return "General";
    const d = disc.toUpperCase().trim();
    if (d === "CS" || d.includes("COMPUTER SCIENCE") || d.includes("COMPUTER SCIEN")) return "Computer Science";
    if (d === "SE" || d.includes("SOFTWARE ENGINEER")) return "Software Engineering";
    if (d.includes("MEDICAL") || d.includes("MEDICINE") || d.includes("HEALTH")) return "Medicine";
    if (d.includes("BUSINESS") || d.includes("MANAGEMENT") || d === "BBA" || d === "MBA") return "Business Administration";
    if (d.includes("ENGINEER")) return "Engineering";
    if (d.includes("AGRICULTURE")) return "Agriculture";
    if (d.includes("ARTS") || d.includes("LANGUAGE") || d.includes("SOCIAL")) return "Arts & Social Sciences";
    return disc;
};

// ─── FEE TYPE DETECTION (CRITICAL FIX) ────────────────────────────────────────
const detectFeeType = (raw) => {
    // 1. Prioritize any existing field label in the raw record
    const label = (raw.feeType || raw.fee_type || raw.billing_cycle || "").toLowerCase();
    if (label.includes("semester")) return "Semester Fee";
    if (label.includes("annual")) return "Annual Fee";

    // 2. Check for semester_fee / annual_fee numeric fields
    if (raw.semester_fee && raw.semester_fee > 0) return "Semester Fee";
    if (raw.annual_fee && raw.annual_fee > 0) return "Annual Fee";

    // 3. Intelligent fallback based on fee amount
    // Semester fees in Pakistan are typically 30k–200k per semester
    // Annual fees > 300k are almost always annual billing
    const fee = Number(raw.fee) || 0;
    if (fee > 0 && fee <= 250000) return "Semester Fee";
    if (fee > 250000) return "Annual Fee";

    return "Annual Fee"; // safe final default
};

// ─── DESCRIPTION GENERATOR ────────────────────────────────────────────────────
const getDescription = (name, disc, city) => {
    const n = name.toLowerCase();
    const d = disc.toLowerCase();
    if (d.includes("medicine") || n.includes("medical") || n.includes("health")) {
        return `A premier healthcare education institution in ${city} dedicated to medical research, clinical excellence, and training the next generation of healthcare professionals.`;
    }
    if (d.includes("software engineering")) {
        return `Specialized software engineering institution in ${city} equipping students with modern development practices, systems design, and cutting-edge tech skills.`;
    }
    if (d.includes("computer science") || n.includes("technology") || n.includes("tech")) {
        return `Leading technology-focused university in ${city} offering rigorous Computer Science programs with strong industry and research linkages.`;
    }
    if (d.includes("engineering") || n.includes("engineering")) {
        return `Premier engineering institution in ${city} driving innovation through applied sciences, research, and industry collaboration.`;
    }
    if (d.includes("business") || n.includes("management") || n.includes("commerce") || n.includes("economics")) {
        return `Top-ranked business school in ${city} known for producing industry-ready graduates with strong leadership and entrepreneurial skills.`;
    }
    if (n.includes("women") || n.includes("female")) {
        return `Distinguished institution in ${city} committed to women's empowerment through quality higher education and community development programs.`;
    }
    if (d.includes("agriculture") || n.includes("agriculture")) {
        return `Specialized agricultural university in ${city} advancing food security, rural development, and sustainable farming research in Pakistan.`;
    }
    if (n.includes("law") || d.includes("law")) {
        return `Reputable institution in ${city} providing comprehensive legal education and training future jurists, lawyers, and legal scholars.`;
    }
    return `Accredited higher education institution in ${city} offering a broad range of programs across multiple disciplines with a commitment to academic excellence.`;
};

// ─── CORE BATCH PROCESSOR ─────────────────────────────────────────────────────
const processRange = (startIndex, count, batchLabel) => {
    const batch = data.slice(startIndex, startIndex + count);
    const results = [];
    const duplicates = [];
    const seen = new Set();

    const finalPath = path.join(__dirname, 'university_clean_v2.json');
    let existingData = [];
    if (fs.existsSync(finalPath)) {
        existingData = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
        existingData.forEach(u => seen.add(`${u.universityName.toLowerCase()}_${u.city.toLowerCase()}`));
    }

    let annualCount = 0;
    let semesterCount = 0;

    batch.forEach(u => {
        const name = u.title || "Unnamed University";
        const city = normalizeCity(u.city);
        const key = `${name.toLowerCase()}_${city.toLowerCase()}`;

        if (seen.has(key)) { duplicates.push(name); return; }
        seen.add(key);

        let ranking = Number(u.ranking);
        if (isNaN(ranking) || ranking >= 1000 || ranking <= 0) ranking = null;

        const disc = normalizeDiscipline(u.discipline);
        const contact = u.contact && u.contact !== "nan" ? u.contact.trim() : null;
        const website = u.web && u.web !== "nan" && u.web.startsWith("http") ? u.web : null;
        const feeType = detectFeeType(u);

        if (feeType === "Annual Fee") annualCount++; else semesterCount++;

        results.push({
            universityName: name,
            discipline: disc,
            degreeLevel: normalizeDegree(u.degree),
            feeType: feeType,
            annualFee: Number(u.fee) || 0,
            minimumMeritScore: Number(u.merit) || 0,
            city: city,
            province: normalizeProvince(u.province),
            description: getDescription(name, disc, city),
            contactInfo: contact,
            websiteUrl: website,
            ranking: ranking
        });
    });

    const combined = [...existingData, ...results];
    fs.writeFileSync(finalPath, JSON.stringify(combined, null, 2), 'utf8');

    console.log(`\n── ${batchLabel} (${startIndex + 1}–${startIndex + count}) ──`);
    console.log(`  ✔ Processed : ${results.length} records`);
    console.log(`  ✖ Duplicates: ${duplicates.length}`);
    console.log(`  💰 Annual Fee  : ${annualCount}`);
    console.log(`  💰 Semester Fee: ${semesterCount}`);
    if (duplicates.length > 0) console.log(`  ⚠ Skipped: ${duplicates.join(", ")}`);

    return { count: results.length, duplicates: duplicates.length, annualCount, semesterCount };
};

// ─── RUN ALL REMAINING BATCHES ────────────────────────────────────────────────
console.log("=== AwamAssist University Migration v2 (Fee-Type Fixed) ===\n");

// Re-run Batches 1-3 cleanly from scratch to apply feeType fix
const finalPath = path.join(__dirname, 'university_clean_v2.json');
if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
console.log("♻  Cleared existing university_clean_v2.json for clean re-run\n");

const batchRanges = [
    [0,   30, "Batch 1"],
    [30,  30, "Batch 2"],
    [60,  30, "Batch 3"],
    [90,  30, "Batch 4"],
    [120, 30, "Batch 5"],
    [150, 30, "Batch 6"],
    [180, 30, "Batch 7"],
    [210, 27, "Batch 8 (final)"],
];

let totalProcessed = 0;
let totalDuplicates = 0;
let totalAnnual = 0;
let totalSemester = 0;

for (const [start, count, label] of batchRanges) {
    const r = processRange(start, count, label);
    totalProcessed += r.count;
    totalDuplicates += r.duplicates;
    totalAnnual += r.annualCount;
    totalSemester += r.semesterCount;
}

const finalData = JSON.parse(fs.readFileSync(finalPath, 'utf8'));

// Province distribution report
const byProvince = {};
finalData.forEach(u => {
    byProvince[u.province] = (byProvince[u.province] || 0) + 1;
});

console.log("\n=== FINAL MIGRATION SUMMARY ===");
console.log(`  Total Records Processed : ${totalProcessed}`);
console.log(`  Total Duplicates Removed: ${totalDuplicates}`);
console.log(`  Total in File           : ${finalData.length}`);
console.log(`\n  💰 Fee Type Distribution:`);
console.log(`     Annual Fee   : ${totalAnnual}`);
console.log(`     Semester Fee : ${totalSemester}`);
console.log(`\n  🗺  Province Distribution:`);
Object.entries(byProvince).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => {
    console.log(`     ${p.padEnd(20)}: ${c}`);
});
console.log("\n✅ university_clean_v2.json is ready for production.");
