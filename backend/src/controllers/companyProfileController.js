const Student = require("../models/RegisterStudentSchema");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Update Student Name (kept as updateCompanyName for route compatibility)
exports.updateCompanyName = async (req, res) => {
  try {
    // Without JWT auth, get studentId directly from request
    const studentId = req.body.studentId || req.query.studentId;
    const { companyName: studentName } = req.body;

    // Debug logging
    console.log(" Update Student Name Debug:");
    console.log("- Student ID from middleware:", studentId);
    console.log("- Student ID type:", typeof studentId);
    console.log("- Student Name from request:", studentName);
    console.log("- Authorization header:", req.headers.authorization ? "Present" : "Missing");

    // Validation
    if (!studentId) {
      console.log("No student ID found in request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Student ID not found"
      });
    }

    if (!studentName || !studentName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student name is required"
      });
    }

    // Convert to ObjectId if it's a string
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(studentId);
      console.log("- ObjectId created:", objectId);
    } catch (error) {
      console.log("Invalid ObjectId format:", studentId);
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }

    // Check if student exists first
    const currentStudent = await Student.findById(objectId);
    console.log("- Current student found:", currentStudent ? "Yes" : "No");
    console.log("- Current student data:", currentStudent ? currentStudent.student_name : "N/A");

    if (!currentStudent) {
      console.log("Student not found in database with ID:", studentId);
      return res.status(404).json({
        success: false,
        message: "Student not found in database"
      });
    }

    // Check if student name already exists (excluding current student)
    const existingStudent = await Student.findOne({
      student_name: studentName.trim(),
      _id: { $ne: objectId }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student name already exists"
      });
    }

    // Update student name
    const updatedStudent = await Student.findByIdAndUpdate(
      objectId,
      { student_name: studentName.trim() },
      { new: true, select: '-password' }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log(`Student name updated successfully for ID: ${studentId}`);

    return res.status(200).json({
      success: true,
      message: "Student name updated successfully",
      data: {
        student: updatedStudent
      }
    });

  } catch (error) {
    console.error(" Error updating student name:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating student name",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Email Address (kept as updateCompanyEmail for route compatibility)
exports.updateCompanyEmail = async (req, res) => {
  try {
    // Without JWT auth, get studentId directly from request
    const studentId = req.body.studentId || req.query.studentId;
    const { email } = req.body;

    // Validation
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Student ID not found"
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Convert to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }

    // Check if email already exists (excluding current student)
    const existingStudent = await Student.findOne({
      student_email: email.trim(),
      _id: { $ne: objectId }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Email address already exists"
      });
    }

    // Update email
    const updatedStudent = await Student.findByIdAndUpdate(
      objectId,
      { student_email: email.trim() },
      { new: true, select: '-password' }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log(`Student email updated successfully for ID: ${studentId}`);

    return res.status(200).json({
      success: true,
      message: "Email address updated successfully",
      data: {
        student: updatedStudent
      }
    });

  } catch (error) {
    console.error("Error updating student email:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating email address",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Change Password (kept as changeCompanyPassword for route compatibility)
exports.changeCompanyPassword = async (req, res) => {
  try {
    // Without JWT auth, get studentId directly from request
    const studentId = req.body.studentId || req.query.studentId;
    const { currentPassword, newPassword } = req.body;

    // Debug logging
    console.log("Change Password Debug:");
    console.log("- Student ID from middleware:", studentId);

    // Validation
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Student ID not found"
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Convert to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }

    // Find student with password
    const student = await Student.findById(objectId);
    if (!student) {
      console.log(" Student not found in database with ID:", studentId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if student uses Google auth
    if (student.auth_provider === 'google') {
      return res.status(400).json({
        success: false,
        message: "Cannot change password for Google authenticated accounts"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Student.findByIdAndUpdate(
      objectId,
      { password: hashedNewPassword },
      { new: true }
    );

    console.log(`Password changed successfully for student ID: ${studentId}`);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error(" Error changing student password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Student Profile (kept as getCompanyProfile for route compatibility)
exports.getCompanyProfile = async (req, res) => {
  try {
    // Without JWT auth, get studentId from query
    const studentId = req.query.studentId || req.body.studentId;

    // Debug logging
    console.log("Get Student Profile Debug:");
    console.log("- Student ID from middleware:", studentId);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Student ID not found"
      });
    }

    // Convert to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }

    const student = await Student.findById(objectId, '-password');

    if (!student) {
      console.log("Student not found in database with ID:", studentId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        studentName: student.student_name,
        email: student.student_email,
        authProvider: student.auth_provider,
        isVerified: student.is_verified,
        status: student.status,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });

  } catch (error) {
    console.error("Error getting student profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting student profile",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};