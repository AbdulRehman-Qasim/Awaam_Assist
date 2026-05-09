const mongoose = require('mongoose');

// ── Treatment sub-document ───────────────────────────────────────────────────
const TreatmentSchema = new mongoose.Schema(
  {
    treatmentName:   { type: String, trim: true, default: '' },
    specialization:  { type: String, trim: true, default: '' },
    treatmentCost:   { type: Number, default: 0, min: 0 },
    costRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    availability:      { type: String, enum: ['Available', 'Limited', 'Unavailable', 'By Appointment'], default: 'Available' },
    requirements:      { type: String, trim: true, default: '' },
    estimatedWaitTime: { type: String, trim: true, default: '' },
    doctorCount:       { type: Number, default: 0 },
    isEmergency:       { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

// ── Main Hospital Schema ─────────────────────────────────────────────────────
const HospitalSchema = new mongoose.Schema(
  {
    // ── Legacy / backward-compatible fields (NEVER removed) ──────────────────
    SerialNum: { type: Number },
    City:      { type: String, required: true, trim: true, index: true },
    Tehsil:    { type: String, required: true, trim: true },
    'Hospital Name': { type: String, required: true, trim: true, index: true },
    Cateogry:  { type: String, required: true, trim: true, index: true }, // legacy typo preserved

    // ── Primary treatment fields (flat, for backward compatibility) ──────────
    treatmentCost: { type: Number, default: 0 },
    availability:  { type: String, default: 'Available' },
    info:          { type: String, default: '' },

    // ── Status & visibility ──────────────────────────────────────────────────
    status: {
      type: mongoose.Schema.Types.Mixed,
      default: 'approved',
      index: true,
    },

    // ── Contact & web presence ────────────────────────────────────────────────
    website:       { type: String, trim: true, default: '' },
    contactNumber: { type: String, trim: true, default: '' },
    email:         { type: String, trim: true, lowercase: true, default: '' },
    address:       { type: String, trim: true, default: '' },

    // ── Extended hospital profile ─────────────────────────────────────────────
    description:   { type: String, trim: true, default: '' },
    hospitalImage: { type: String, trim: true, default: '' },
    emergencyServices: { type: Boolean, default: false },
    bedCapacity:   { type: Number, default: 0 },

    // ── Geo-location (future: geospatial queries) ─────────────────────────────
    locationCoordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // ── Quality indicators ────────────────────────────────────────────────────
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVerified:   { type: Boolean, default: false },

    // ── Recommendation engine scoring hints ───────────────────────────────────
    recommendationScore: { type: Number, default: 0 }, // pre-computed composite score
    tags: [{ type: String, trim: true }],              // e.g. ['cardiology', 'pediatrics', 'emergency']

    // ── Treatment-level nested data ───────────────────────────────────────────
    // Each hospital can list multiple treatments/specializations
    treatments: [TreatmentSchema],

    // ── Admin ownership ───────────────────────────────────────────────────────
    createdByHospitalAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HospitalAdmin',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// ── Indexes for recommendation engine queries ────────────────────────────────
HospitalSchema.index({ City: 1, Cateogry: 1 });
HospitalSchema.index({ City: 1, status: 1 });
HospitalSchema.index({ 'Hospital Name': 'text', City: 'text', Tehsil: 'text', tags: 'text' });
HospitalSchema.index({ treatmentCost: 1 });
HospitalSchema.index({ rating: -1 });
HospitalSchema.index({ createdByHospitalAdmin: 1, status: 1 });
// Geo index for future proximity queries
HospitalSchema.index({ locationCoordinates: '2dsphere' }, { sparse: true });

// ── Virtual: normalized hospital name ───────────────────────────────────────
HospitalSchema.virtual('hospitalName').get(function () {
  return this['Hospital Name'];
});

// ── Virtual: normalized category ────────────────────────────────────────────
HospitalSchema.virtual('category').get(function () {
  return this.Cateogry;
});

// ── Instance helper: cheapest treatment ─────────────────────────────────────
HospitalSchema.methods.getCheapestTreatment = function () {
  if (!this.treatments || this.treatments.length === 0) return null;
  return this.treatments.reduce((cheapest, t) =>
    t.treatmentCost < cheapest.treatmentCost ? t : cheapest
  );
};

// ── Instance helper: treatments matching a specialization ───────────────────
HospitalSchema.methods.getTreatmentsBySpecialization = function (spec) {
  if (!spec) return this.treatments;
  const regex = new RegExp(spec, 'i');
  return this.treatments.filter(
    (t) => regex.test(t.specialization) || regex.test(t.treatmentName)
  );
};

// ── Static helper: build rich recommendation query ──────────────────────────
HospitalSchema.statics.buildRecommendationQuery = function (profile = {}) {
  const query = { status: 'approved' };

  const city = profile.treatmentCity || profile.city;
  if (city) query.City = new RegExp(city, 'i');
  if (profile.tehsil) query.Tehsil = new RegExp(profile.tehsil, 'i');
  if (profile.hospitalCategory) query.Cateogry = profile.hospitalCategory;

  // Budget filter: match flat treatmentCost OR cheapest treatment inside treatments[]
  if (profile.maxBudget && Number(profile.maxBudget) > 0) {
    query.$or = [
      { treatmentCost: { $lte: Number(profile.maxBudget) } },
      { 'treatments.treatmentCost': { $lte: Number(profile.maxBudget) } },
    ];
  }

  // Specialization / treatment type filter
  if (profile.treatmentType) {
    const tRegex = new RegExp(profile.treatmentType, 'i');
    query.$or = query.$or || [];
    query.$or.push(
      { tags: tRegex },
      { 'treatments.specialization': tRegex },
      { 'treatments.treatmentName': tRegex }
    );
  }

  return query;
};

module.exports = mongoose.model('Hospital', HospitalSchema);
