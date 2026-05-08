const Student = require("../models/RegisterStudentSchema");
const { OAuth2Client } = require('google-auth-library');
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLoginCompany = async (req, res) => {
  try {
    const { google_token, email, sub } = req.body;

    // Verify the Google token
    try {
      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      // Verify that the email from token matches the one sent
      if (payload.email !== email || payload.sub !== sub) {
        return res.status(400).json({ message: "Invalid token data" });
      }
    } catch (tokenError) {
      console.error('Google token verification failed:', tokenError);
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Find student by Google ID or email
    const student = await Student.findOne({ 
      $or: [
        { google_id: sub },
        { company_email: email, auth_provider: 'google' }
      ]
    });

    if (!student) {
      return res.status(400).json({ 
        message: "No account found with this Google account. Please register first." 
      });
    }

    // Check student status
    if (student.status === 'inactive') {
      return res.status(403).json({ 
        message: "Account is deactivated. Please contact support." 
      });
    }

    // Update Google ID if not set (for backward compatibility)
    if (!student.google_id) {
      student.google_id = sub;
      await student.save();
    }

    const token = jwt.sign(
      { id: student._id, userType: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google login successful!",
      userType: "student",
      token,
      data: {
        _id: student._id,
        student_name: student.student_name,
        company_email: student.company_email,
        profile_picture: student.profile_picture,
        auth_provider: student.auth_provider,
        status: student.status,
        plan: student.plan,
        onboardingCompleted: student.onboardingCompleted,
        selectedModules: student.selectedModules
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ 
      message: "Server error during Google login", 
      error: error.message 
    });
  }
};