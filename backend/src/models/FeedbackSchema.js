const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
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
    enum: ['helpful', 'not_relevant', null],
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster filtering in the dashboard
feedbackSchema.index({ module: 1, type: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
