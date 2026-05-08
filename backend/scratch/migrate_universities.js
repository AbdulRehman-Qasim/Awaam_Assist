const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../../frontend/campusfinder_cleaned.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const normalizeCity = (city) => {
    if (!city) return "";
    const lower = city.toLowerCase().trim();
    if (lower === 'lhr' || lower === 'lahore') return 'Lahore';
    if (lower === 'isb' || lower === 'islamabad') return 'Islamabad';
    if (lower === 'fsd' || lower === 'faisalabad') return 'Faisalabad';
    if (lower === 'sarghoda' || lower === 'sargodha') return 'Sargodha';
    return city.charAt(0).toUpperCase() + city.slice(1);
};

const normalizeDegree = (degree) => {
    if (!degree) return "";
    return degree.replace(/\bBS\b/g, 'Bachelor').replace(/\bMS\b/g, 'Master');
};

const normalizeDiscipline = (discipline) => {
    if (!discipline) return "";
    return discipline.replace(/\bCS\b/g, 'Computer Science').replace(/\bSE\b/g, 'Software Engineering');
};

const batch1 = data.slice(0, 30).map(u => {
    let name = u.title || "";
    let fee = Number(u.fee) || 0;
    let ranking = Number(u.ranking) || 0;
    let description = "";

    const normalizedCityName = normalizeCity(u.city);
    
    // Data Refresh / Enrichment for specific Batch 1 institutions
    if (name.includes("Agha Khan") || name.includes("Aga Khan")) {
        name = "Aga Khan University";
        ranking = ranking || 1;
        description = "World-renowned medical university focused on excellence in healthcare and research.";
    } else if (name.includes("Dow University")) {
        name = "Dow University of Health Sciences";
        ranking = ranking || 4;
        description = "Leading public medical university in Karachi with multiple specialized hospitals.";
    } else if (name.includes("Air University")) {
        ranking = ranking || 15;
        description = "Public research university specializing in aerospace, engineering, and management.";
    } else if (name.includes("BUITEMS")) {
        ranking = ranking || 30;
        description = "Top-tier public research university in Quetta focused on engineering and management.";
    } else if (name.includes("Beaconhouse National")) {
        description = "Pakistan's first liberal arts university offering creative and diverse academic programs.";
    } else {
        description = `Recognized institution in ${normalizedCityName} providing quality education in ${normalizeDiscipline(u.discipline)}.`;
    }

    // Fix placeholder rankings (100000)
    if (ranking > 1000) ranking = 0;

    return {
        universityName: name,
        discipline: normalizeDiscipline(u.discipline),
        degreeLevel: normalizeDegree(u.degree),
        annualFee: fee,
        minimumMeritScore: Number(u.merit) || 0,
        city: normalizedCityName,
        province: u.province || "",
        description: description,
        contactInfo: u.contact || "",
        websiteUrl: u.web || "",
        ranking: ranking
    };
});

const outputPath = path.join(__dirname, 'university_migration_batch_1.json');
fs.writeFileSync(outputPath, JSON.stringify(batch1, null, 2), 'utf8');
console.log(`Successfully migrated ${batch1.length} records to ${outputPath}`);
