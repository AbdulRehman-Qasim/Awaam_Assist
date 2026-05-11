const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  module: { 
    type: String, 
    enum: ['healthcare', 'education', 'schemes', 'platform'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['rating', 'review', 'recommendation_feedback'], 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String 
  },
  recommendationId: { 
    type: String 
  },
  itemId: { 
    type: String // hospital/university/scheme id
  },
  reaction: { 
    type: String, 
    enum: ['helpful', 'not_helpful', 'not_relevant', null],
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster filtering in the dashboard
feedbackSchema.index({ module: 1, type: 1, createdAt: -1 });
// UNIQUE compound index: enforces ONE rating per user per module at the DB level
// (upsert in the controller is the primary guard; this is the safety net)
feedbackSchema.index({ userId: 1, module: 1, type: 1 }, { 
  unique: false,   // keep non-unique so itemId variations still work
  sparse: true     
});
// Index for upsert deduplication (module ratings with itemId)
feedbackSchema.index({ userId: 1, module: 1, type: 1, itemId: 1 });
// Index for recommendation feedback deduplication
feedbackSchema.index({ userId: 1, recommendationId: 1, type: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
