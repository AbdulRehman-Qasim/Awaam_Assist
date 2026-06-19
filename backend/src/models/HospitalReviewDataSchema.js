/**
 * HospitalReviewDataSchema.js
 * Stores Reddit-scraped community review analysis for each hospital.
 * Categories: Doctor Quality, Cleanliness, Wait Time, Staff Behavior,
 *             Facilities & Equipment, Cost & Value
 */

const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const CategoryRatingsSchema = new mongoose.Schema(
  {
    doctorQuality:       { type: Number, default: null, min: 0, max: 10 },
    cleanliness:         { type: Number, default: null, min: 0, max: 10 },
    waitTime:            { type: Number, default: null, min: 0, max: 10 },
    staffBehavior:       { type: Number, default: null, min: 0, max: 10 },
    facilitiesEquipment: { type: Number, default: null, min: 0, max: 10 },
    costValue:           { type: Number, default: null, min: 0, max: 10 },
  },
  { _id: false }
);

const RedditPostSchema = new mongoose.Schema(
  {
    title:      { type: String, default: '' },
    url:        { type: String, default: '' },
    subreddit:  { type: String, default: '' },
    score:      { type: Number, default: 0 },
    snippet:    { type: String, default: '' },
    postedAt:   { type: Date, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const HospitalReviewDataSchema = new mongoose.Schema(
  {
    hospitalId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Hospital',
      required: true,
      unique:   true,
      index:    true,
    },
    hospitalName:  { type: String, required: true },
    city:          { type: String, default: '' },

    // Computed category ratings (0–10)
    ratings: { type: CategoryRatingsSchema, default: () => ({}) },

    // Overall composite score (avg of non-null categories)
    overallRating:  { type: Number, default: 0, min: 0, max: 10 },

    // How many Reddit posts were found / used
    totalMentions:  { type: Number, default: 0 },

    // One-sentence AI-generated community summary
    summary:        { type: String, default: '' },

    // Sample Reddit posts (capped at 5)
    redditPosts: [RedditPostSchema],

    // Lifecycle status
    status: {
      type:    String,
      enum:    ['pending', 'scraping', 'analyzed', 'no_data', 'error'],
      default: 'pending',
      index:   true,
    },

    lastScrapedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for fast city-level aggregation
HospitalReviewDataSchema.index({ city: 1, overallRating: -1 });

module.exports = mongoose.model('HospitalReviewData', HospitalReviewDataSchema);
