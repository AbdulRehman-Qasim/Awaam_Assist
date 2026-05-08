const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Student = require('../models/RegisterStudentSchema');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for email:', email);

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Look up by student_email (schema field)
    let student = await Student.findOne({ student_email: email });
    
   
    console.log('Student found:', student ? 'Yes' : 'No');
    
    if (!student) {
    
      console.log('No student found with email:', email);
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    student.resetPasswordToken = hashedToken;
    student.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await student.save();

    
    const frontendBase = (req.headers && req.headers.origin) || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendBase.replace(/\/$/, '')}/reset-password/${resetToken}`;
    
    console.log('PASSWORD RESET LINK GENERATED:');
    console.log('Email:', student.student_email);
    console.log('Student:', student.student_name);
    console.log('Reset Link:', resetLink);
    console.log('Token expires in 10 minutes');
    console.log('=================================');
    // Return success with data needed for frontend to send email
    res.status(200).json({
      success: true,
      message: 'Reset token generated successfully',
      data: {
        email: student.student_email,
        name: student.student_name,
        resetToken: resetToken, 
        resetLink: resetLink
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    console.log('Reset password attempt with token:', token);

   
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
 // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    
    const student = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Student found for reset:', student ? 'Yes' : 'No');

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    student.password = hashedPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;

    await student.save();

    console.log('Password reset successful for:', student.student_email);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify reset token (for checking if token is valid before showing reset form)
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('Verifying reset token:', token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    
    const student = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Token verification result:', student ? 'Valid' : 'Invalid');

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        email: student.student_email,
        name: student.student_name
      }
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  verifyResetToken
};