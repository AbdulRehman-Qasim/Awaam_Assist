const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  module: {
    type: String,
    enum: ['healthcare', 'education', 'schemes'],
    required: true
  },
  reportUrl: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reportSnapshot: {
    userProfile: Object,
    recommendations: Array,
    insights: String
  }
}, { timestamps: true });

// Index for fast retrieval of user report history
reportSchema.index({ userId: 1, generatedAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
