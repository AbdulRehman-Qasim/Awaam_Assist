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
    
    // New fields for enhanced intelligence
    description:       { type: String, trim: true, default: '' },
    supportFeatures:   [{ type: String, trim: true }], // ['Wheelchair Support', 'Emergency Ward', etc.]
    waitingTime:       { type: String, trim: true, default: 'Immediate' },
    severitySupport:   { type: String, enum: ['Basic', 'Moderate', 'Critical', 'Emergency'], default: 'Basic' },
    appointmentRequired: { type: Boolean, default: true },
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
    
    // New fields at root for enhanced intelligence in flat records
    description:       { type: String, trim: true, default: '' },
    supportFeatures:   [{ type: String, trim: true }], // ['Wheelchair Support', 'Emergency Ward', etc.]
    waitingTime:       { type: String, trim: true, default: 'Immediate' },
    severitySupport:   { type: String, enum: ['Basic', 'Moderate', 'Critical', 'Emergency'], default: 'Basic' },
    appointmentRequired: { type: Boolean, default: true },
    treatmentName:     { type: String, trim: true, default: '' },
    treatmentSpecialty: { type: String, trim: true, default: '' },

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

  const city = profile.city || profile.treatmentCity;
  if (city) query.City = new RegExp(city, 'i');
  
  // Tehsil search: support flexible matches
  if (profile.tehsil) {
    query.Tehsil = new RegExp(profile.tehsil, 'i');
  }

  // Handle hospitalCategory selection: 'Public' / 'Government' / 'Private' / 'Both'
  if (profile.hospitalCategory && profile.hospitalCategory !== 'Both' && profile.hospitalCategory !== 'both') {
    if (profile.hospitalCategory === 'Public' || profile.hospitalCategory === 'Government' || profile.hospitalCategory === 'public' || profile.hospitalCategory === 'government') {
      query.Cateogry = 'Government';
    } else if (profile.hospitalCategory === 'Private' || profile.hospitalCategory === 'private') {
      query.Cateogry = 'Private';
    }
  }

  // Budget filter: match flat treatmentCost OR cheapest treatment inside treatments[]
  const maxBudget = Number(profile.budgetRange) || Number(profile.maxBudget) || 0;
  if (maxBudget > 0) {
    query.$or = [
      { Cateogry: 'Government' }, // Government care is free or highly subsidized, always match
      { treatmentCost: { $lte: maxBudget } },
      { 'treatments.treatmentCost': { $lte: maxBudget } },
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
