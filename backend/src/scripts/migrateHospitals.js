/**
 * migrateHospitals.js
 *
 * Safe, idempotent migration of existing Hospital documents to the new
 * enriched schema. Can be run multiple times without data corruption.
 *
 * Usage:
 *   node src/scripts/migrateHospitals.js
 *
 * What it does:
 *  1. Finds all Hospital documents that have NOT yet been migrated
 *     (i.e., do not have contactNumber field set to non-null or are missing
 *     the 'treatments' array).
 *  2. For each record:
 *     a. Back-fills new fields with safe defaults.
 *     b. If the legacy flat `treatmentCost > 0` and `treatments[]` is empty,
 *        seeds an initial Treatment sub-document from the flat data so the
 *        recommendation engine can use it immediately.
 *  3. Adds DB indexes for performance.
 *  4. Reports a full summary.
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Hospital = require('../models/HospitalSchema');

async function migrate() {
  console.log('🏥  Hospital Dataset Migration — starting …');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected');

  // ── Fetch all documents ───────────────────────────────────────────────────
  const all = await Hospital.find({}).lean();
  console.log(`📊  Total hospital records found: ${all.length}`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const doc of all) {
    try {
      // Already migrated if `treatments` array exists as an actual array
      // AND contactNumber field is explicitly defined
      const alreadyMigrated =
        Array.isArray(doc.treatments) &&
        doc.contactNumber !== undefined;

      if (alreadyMigrated) {
        skipped++;
        continue;
      }

      const updates = {};

      // Back-fill contact & web fields
      if (!doc.contactNumber) updates.contactNumber = '';
      if (!doc.email)         updates.email         = '';
      if (!doc.address)       updates.address       = '';
      if (!doc.description)   updates.description   = '';
      if (!doc.hospitalImage) updates.hospitalImage = '';

      // Back-fill quality fields
      if (doc.rating       === undefined) updates.rating       = 0;
      if (doc.totalReviews === undefined) updates.totalReviews = 0;
      if (doc.isVerified   === undefined) updates.isVerified   = false;
      if (doc.emergencyServices === undefined) updates.emergencyServices = false;
      if (doc.bedCapacity  === undefined) updates.bedCapacity  = 0;

      // Back-fill arrays
      if (!Array.isArray(doc.tags)) updates.tags = [];

      // Seed treatments[] from flat data (only if legacy cost > 0 and no treatments yet)
      if (!Array.isArray(doc.treatments) || doc.treatments.length === 0) {
        updates.treatments = [];

        if (doc.treatmentCost && doc.treatmentCost > 0) {
          // Extract a likely specialization from the hospital name (heuristic)
          const name = doc['Hospital Name'] || '';
          let specialization = '';
          const specKeywords = [
            'General', 'Eye', 'Cardiac', 'Heart', 'Children', 'Paediatric',
            'Maternity', 'Women', 'Cancer', 'Orthopedic', 'Dental', 'Mental',
            'Kidney', 'Neuro', 'Surgical', 'Medical',
          ];
          for (const kw of specKeywords) {
            if (name.toLowerCase().includes(kw.toLowerCase())) {
              specialization = kw;
              break;
            }
          }

          updates.treatments = [
            {
              treatmentName:    specialization ? `${specialization} Treatment` : 'General Treatment',
              specialization:   specialization || 'General',
              treatmentCost:    doc.treatmentCost,
              availability:     doc.availability || 'Available',
              requirements:     doc.info || '',
              estimatedWaitTime: '',
              isEmergency:      false,
            },
          ];

          // Auto-tag
          if (specialization) {
            updates.tags = [specialization.toLowerCase()];
          }
        }
      }

      // Also ensure recommendationScore field exists
      if (doc.recommendationScore === undefined) updates.recommendationScore = 0;

      await Hospital.updateOne({ _id: doc._id }, { $set: updates });
      migrated++;

      if (migrated % 100 === 0) {
        console.log(`  ↳ ${migrated} records migrated …`);
      }
    } catch (err) {
      console.error(`  ✗ Error migrating ${doc._id} (${doc['Hospital Name']}):`, err.message);
      errors++;
    }
  }

  // ── Ensure indexes ────────────────────────────────────────────────────────
  console.log('\n📌  Ensuring indexes …');
  try {
    await Hospital.collection.createIndex({ City: 1, Cateogry: 1 });
    await Hospital.collection.createIndex({ City: 1, status: 1 });
    await Hospital.collection.createIndex({ treatmentCost: 1 });
    await Hospital.collection.createIndex({ rating: -1 });
    await Hospital.collection.createIndex({ createdByHospitalAdmin: 1, status: 1 });
    await Hospital.collection.createIndex(
      { 'Hospital Name': 'text', City: 'text', Tehsil: 'text', tags: 'text' },
      { name: 'hospital_text_idx', weights: { 'Hospital Name': 10, City: 5, tags: 3, Tehsil: 2 } }
    );
    console.log('  ✅ Indexes ensured');
  } catch (idxErr) {
    console.warn('  ⚠️  Index creation warning (may already exist):', idxErr.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════╗
║      MIGRATION COMPLETE               ║
╠═══════════════════════════════════════╣
║  Total records : ${String(all.length).padEnd(18)} ║
║  Migrated      : ${String(migrated).padEnd(18)} ║
║  Skipped       : ${String(skipped).padEnd(18)} ║
║  Errors        : ${String(errors).padEnd(18)} ║
╚═══════════════════════════════════════╝
  `);

  await mongoose.disconnect();
  console.log('🔌  MongoDB disconnected. Done.');
  process.exit(errors > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
