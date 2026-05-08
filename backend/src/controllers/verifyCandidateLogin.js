const Candidate = require('../models/Candidate');

// Helper to remove sensitive fields from response
const sanitizeCandidate = (candidate) => {
  const { password, ...rest } = candidate.toObject();
  return rest;
};


// POST /candidate/verify
exports.verifyCandidateLogin = async (req, res) => {
  try {
    const { interview_id, email, password } = req.body;

    if (!interview_id || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID, email, and password are required'
      });
    }

    const candidate = await Candidate.findOne({ interview_id, email });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found with provided interview ID and email'
      });
    }

    if (candidate.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      candidate: sanitizeCandidate(candidate)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login verification'
    });
  }
};
