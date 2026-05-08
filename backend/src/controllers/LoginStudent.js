const Student = require("../models/RegisterStudentSchema");
const TeamMember = require("../models/TeamMember");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginStudent = async (req, res) => {
  try {
    const { student_email, password } = req.body;

    if (!student_email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if it's a student login
    const student = await Student.findOne({ student_email });

    if (student) {
      // Check if this is a Google authenticated student trying to login with password
      if (student.auth_provider === 'google') {
        return res.status(400).json({ 
          message: "This account was created with Google. Please use 'Continue with Google' to sign in." 
        });
      }

      // Check student status
      if (student.status === 'inactive') {
        return res.status(403).json({ 
          message: "Account is deactivated. Please contact support." 
        });
      }

      const isMatch = await bcrypt.compare(password, student.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: student._id, userType: "student" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          message: "Login successful",
          userType: "student",
          token,
          data: {
            _id: student._id,
            student_name: student.student_name,
            student_email: student.student_email,
            profile_picture: student.profile_picture,
            auth_provider: student.auth_provider || 'email',
            status: student.status,
            plan: student.plan,
            onboardingCompleted: student.onboardingCompleted,
            selectedModules: student.selectedModules
          }
        });
      }
    }

    // Check if it's a team member login (uses same email field)
    const teamMember = await TeamMember.findOne({ email: student_email }).populate('company');

    if (teamMember) {
      const isMatch = await bcrypt.compare(password, teamMember.password);
      if (isMatch) {
        // Update team member status and last active
        teamMember.status = 'active';
        teamMember.lastActive = new Date();
        await teamMember.save();

        return res.status(200).json({
          message: "Login successful",
          userType: "team_member",
          memberRole: teamMember.role,
          data: {
            _id: teamMember._id,
            name: teamMember.name,
            email: teamMember.email,
            role: teamMember.role,
            company: {
              _id: teamMember.company._id,
              company_name: teamMember.company.company_name
            }
          }
        });
      }
    }

    return res.status(400).json({ message: "Invalid credentials" });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};