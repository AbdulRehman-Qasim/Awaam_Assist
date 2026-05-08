/**
 * AwamAssist — University Dataset Re-Seed Script (v2)
 * =====================================================
 * Replaces the entire university collection with the latest
 * standardized dataset from university_clean_v2.json.
 *
 * Usage:
 *   cd e:\Final_Year_Project
 *   node backend/src/scripts/reseedUniversities.js
 *
 * What this does:
 *   1. Connects to MongoDB
 *   2. Drops ALL existing university documents
 *   3. Maps university_clean_v2.json → UniversitySchema fields
 *   4. Inserts 233 clean, deduplicated records
 *   5. Rebuilds all indexes
 *   6. Prints a province/discipline distribution report
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ─── Model ────────────────────────────────────────────────────────────────────
// Import directly to avoid circular deps
const UniversitySchema = new mongoose.Schema({
    admissions: { type: String, default: "1.0" },
    city:       { type: String, required: true },
    contact:    { type: String },
    degree:     { type: String, required: true },
    discipline: { type: String, required: true },
    fee:        { type: Number },
    semesterFee:{ type: Number },
    id:         { type: String, required: true, default: "pk0" },
    info:       { type: String },
    key:        { type: Number },
    logo:       { type: String },
    merit:      { type: Number },
    province:   { type: String, required: true },
    ranking:    { type: Number },
    status:     { type: mongoose.Schema.Types.Mixed, default: 1 },
    title:      { type: String, required: true },
    url:        { type: String },
    web:        { type: String },
    deadline:   { type: String },
    admission:  { type: String },
    // v2 enriched fields
    feeType:    { type: String, enum: ["Annual Fee", "Semester Fee"], default: "Annual Fee" },
    description:{ type: String },
    map: {
        address:  String,
        lat:      Number,
        location: String,
        long:     Number
    }
}, { timestamps: true });

UniversitySchema.index({ city: 1 });
UniversitySchema.index({ province: 1 });
UniversitySchema.index({ discipline: 1 });
UniversitySchema.index({ degree: 1 });
UniversitySchema.index({ ranking: 1 });
UniversitySchema.index({ merit: -1 });
UniversitySchema.index({ ranking: 1, merit: -1 });
UniversitySchema.index({ discipline: 1, ranking: 1 });
UniversitySchema.index({ title: "text" });

const University = mongoose.model('University', UniversitySchema);

// ─── Config ───────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI
    || 'mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0';

const DATASET_PATH = path.join(__dirname, '../../scratch/university_clean_v2.json');

// ─── Fee mapper ───────────────────────────────────────────────────────────────
const mapFeeFields = (u) => {
    const feeType = (u.feeType || "Annual Fee").toLowerCase();
    const amount  = Number(u.annualFee) || 0;

    if (feeType.includes("semester")) {
        return { fee: null, semesterFee: amount };
    }
    return { fee: amount, semesterFee: null };
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function reseedUniversities() {
    console.log("=== AwamAssist University Re-Seed (v2 Dataset) ===\n");

    // 1. Connect
    await mongoose.connect(MONGODB_URI);
    console.log("✔ Connected to MongoDB\n");

    // 2. Load dataset
    if (!fs.existsSync(DATASET_PATH)) {
        console.error(`❌ Dataset not found at: ${DATASET_PATH}`);
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
    console.log(`✔ Loaded ${raw.length} records from university_clean_v2.json`);

    // 3. Drop existing collection
    const before = await University.countDocuments();
    await University.deleteMany({});
    console.log(`✔ Cleared ${before} stale documents from collection\n`);

    // 4. Transform to schema
    const docs = raw.map((u, idx) => {
        const { fee, semesterFee } = mapFeeFields(u);

        // Validate required fields — skip corrupt records
        if (!u.universityName || !u.city || !u.province) {
            console.warn(`⚠  Skipping record #${idx} — missing required fields`);
            return null;
        }

        return {
            // Core fields mapped from admin schema
            title:       u.universityName,
            city:        u.city,
            province:    u.province,
            discipline:  u.discipline || "General",
            degree:      u.degreeLevel || "Bachelor",
            fee:         fee,
            semesterFee: semesterFee,
            feeType:     u.feeType || "Annual Fee",
            merit:       Number(u.minimumMeritScore) || 0,
            ranking:     u.ranking || null,
            contact:     u.contactInfo || null,
            web:         u.websiteUrl || null,
            description: u.description || null,
            // Required schema fields with safe defaults
            id:          `pk${idx}`,
            key:         idx,
            admissions:  "1.0",
            status:      1,
            // Legacy fields (not in v2 dataset — safe defaults)
            logo:        null,
            url:         null,
            deadline:    null,
            admission:   null,
            info:        u.contactInfo || null,
            map: {
                address:  `${u.city}, ${u.province}`,
                location: u.city,
                lat:      0,
                long:     0
            }
        };
    }).filter(Boolean); // remove nulls

    console.log(`✔ Transformed ${docs.length} valid records`);

    // 5. Insert in batches of 50 for safety
    const BATCH_SIZE = 50;
    let inserted = 0;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        await University.insertMany(batch, { ordered: false });
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${docs.length}...`);
    }

    // 6. Rebuild indexes
    await University.syncIndexes();
    console.log("\n✔ Indexes rebuilt");

    // 7. Verify & report
    const total = await University.countDocuments();
    const provinces = await University.aggregate([
        { $group: { _id: "$province", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    const disciplines = await University.aggregate([
        { $group: { _id: "$discipline", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    console.log("\n=== SEED REPORT ===");
    console.log(`  Total documents: ${total}`);
    console.log("\n  Province Distribution:");
    provinces.forEach(p => console.log(`    ${(p._id || "Unknown").padEnd(22)}: ${p.count}`));
    console.log("\n  Top Disciplines:");
    disciplines.slice(0, 8).forEach(d => console.log(`    ${(d._id || "Unknown").padEnd(28)}: ${d.count}`));

    // 8. Sanity check — confirm stale generic web field is gone
    const staleWebCount = await University.countDocuments({ web: "http://www.uom.edu.pk/" });
    if (staleWebCount > 0) {
        console.log(`\n  ⚠  ${staleWebCount} records still have placeholder web URL — clearing...`);
        await University.updateMany({ web: "http://www.uom.edu.pk/" }, { $set: { web: null } });
        console.log("  ✔ Placeholder URLs cleared");
    }

    console.log("\n✅ Re-seed complete. University collection is now production-ready.");
}

reseedUniversities()
    .catch(err => { console.error("❌ Seed failed:", err.message); process.exit(1); })
    .finally(() => mongoose.disconnect().then(() => console.log("Disconnected.")));
