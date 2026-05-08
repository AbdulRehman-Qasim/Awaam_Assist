const Student = require("../models/RegisterStudentSchema");
const { OAuth2Client } = require('google-auth-library');
const jwt = require("jsonwebtoken");

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleRegisterCompany = async (req, res) => {
  try {
    const { google_token, email, name, picture, sub } = req.body;

    // Verify the Google token
    try {
      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      // Verify that the email from token matches the one sent
      if (payload.email !== email) {
        return res.status(400).json({ message: "Invalid token data" });
      }
    } catch (tokenError) {
      console.error('Google token verification failed:', tokenError);
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Check if student already exists with this email or Google ID
    const existingStudent = await Student.findOne({ 
      $or: [
        { student_email: email },
        { google_id: sub }
      ]
    });

    if (existingStudent) {
      // If student exists, log them in instead of showing error
      
      // Check student status
      if (existingStudent.status === 'inactive') {
        return res.status(403).json({ 
          message: "Account is deactivated. Please contact support." 
        });
      }

      // Update Google ID if not set (for backward compatibility)
      if (!existingStudent.google_id) {
        existingStudent.google_id = sub;
        await existingStudent.save();
      }

      // Update profile picture if it's from Google and different
      if (picture && existingStudent.profile_picture !== picture) {
        existingStudent.profile_picture = picture;
        await existingStudent.save();
      }

      const token = jwt.sign(
        { id: existingStudent._id, userType: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Welcome back! Logged in successfully.",
        userType: "student",
        token,
        isExistingUser: true, // Flag to indicate this was an existing user
        data: {
          _id: existingStudent._id,
          student_name: existingStudent.student_name,
          student_email: existingStudent.student_email,
          profile_picture: existingStudent.profile_picture,
          auth_provider: existingStudent.auth_provider || 'google',
          status: existingStudent.status,
          plan: existingStudent.plan,
          onboardingCompleted: existingStudent.onboardingCompleted,
          selectedModules: existingStudent.selectedModules
        }
      });
    }

    // If no existing student found, create new one
    const student = await Student.create({
      student_name: name, // Using Google name as student name
      student_email: email,
      google_id: sub, // Store Google user ID
      profile_picture: picture, // Store Google profile picture
      auth_provider: 'google', // Mark as Google authenticated
      password: null, // No password needed for Google auth
      is_verified: true, // Google accounts are pre-verified
      plan: 'free_trial', // Explicitly set to free_trial for new registrations
    });

    // Remove sensitive data from response
    const responseData = {
      _id: student._id,
      student_name: student.student_name,
      student_email: student.student_email,
      profile_picture: student.profile_picture,
      auth_provider: student.auth_provider,
      status: student.status,
      plan: student.plan,
      onboardingCompleted: student.onboardingCompleted,
      selectedModules: student.selectedModules,
      createdAt: student.createdAt,
    };

    const token = jwt.sign(
      { id: student._id, userType: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful!",
      userType: "student",
      token,
      isExistingUser: false, // Flag to indicate this was a new user
      data: responseData,
    });

  } catch (error) {
    console.error('Google registration error:', error);
    return res.status(500).json({ 
      message: "Server error during Google registration", 
      error: error.message 
    });
  }
};