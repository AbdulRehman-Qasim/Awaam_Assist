const mongoose = require('mongoose');
const Feedback = require('../models/FeedbackSchema');

/**
 * Submit Module Rating (Healthcare, Education, Schemes)
 * Unified submission handler — upserts to prevent duplicates
 */
exports.submitModuleRating = async (req, res) => {
  try {
    const { moduleName, rating, comment, itemId } = req.body;
    const userId = req.user._id;

    if (!moduleName || !rating) {
      return res.status(400).json({ success: false, message: 'moduleName and rating are required' });
    }

    // Build filter — only include itemId if provided (module-level ratings have no itemId)
    const filter = { userId, module: moduleName, type: 'rating' };
    if (itemId) filter.itemId = itemId;

    const feedback = await Feedback.findOneAndUpdate(
      filter,
      { 
        rating, 
        comment: comment || '', 
        createdAt: Date.now() 
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Recommendation Feedback (Helpful/Not Relevant)
 */
exports.submitRecommendationFeedback = async (req, res) => {
  try {
    const { recommendationId, moduleType, reaction, itemId } = req.body;
    const userId = req.user._id;

    const feedback = await Feedback.findOneAndUpdate(
      { userId, recommendationId, type: 'recommendation_feedback' },
      { 
        module: moduleType, 
        reaction: reaction === 'not_relevant' ? 'not_helpful' : reaction,
        itemId: itemId || null,
        createdAt: Date.now() 
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Platform Feedback
 */
exports.submitPlatformFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Platform feedback: always create new (users can submit multiple messages)
    const feedback = new Feedback({ 
      userId, 
      module: 'platform', 
      type: 'review', 
      comment: message 
    });
    await feedback.save();

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get ALL Feedback (Super Admin Only)
 * Supports searching and filtering
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const { module, type, rating, search, startDate, endDate } = req.query;
    
    let query = {};
    
    if (module) query.module = module;
    if (type) query.type = type;
    if (rating) query.rating = Number(rating);
    
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { userId: mongoose.Types.ObjectId.isValid(search) ? search : undefined }
      ].filter(f => f.userId !== undefined || f.comment !== undefined);
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedbacks = await Feedback.find(query)
      .populate('userId', 'student_name student_email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Feedback Analytics (Super Admin)
 */
exports.getFeedbackAnalytics = async (req, res) => {
  try {
    // 1. Average Ratings per Module
    const ratings = await Feedback.aggregate([
      { $match: { type: 'rating' } },
      {
        $group: {
          _id: "$module",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Recommendation Sentiments
    const reactions = await Feedback.aggregate([
      { $match: { type: 'recommendation_feedback' } },
      {
        $group: {
          _id: "$reaction",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Recommendation Breakdown by Module
    const moduleRecBreakdown = await Feedback.aggregate([
      { $match: { type: 'recommendation_feedback' } },
      {
        $group: {
          _id: { module: "$module", reaction: "$reaction" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        moduleRatings: ratings,
        recommendationReactions: reactions,
        moduleBreakdown: moduleRecBreakdown,
        platformCount: await Feedback.countDocuments({ module: 'platform' })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get User Feedback History
 */
exports.getUserFeedbackHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const feedback = await Feedback.find({ userId, type: 'recommendation_feedback' });
    // Map internal 'not_helpful' back to 'not_relevant' if needed by the engine
    const mapped = feedback.map(f => ({
      ...f.toObject(),
      reaction: f.reaction === 'not_helpful' ? 'not_relevant' : f.reaction
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
