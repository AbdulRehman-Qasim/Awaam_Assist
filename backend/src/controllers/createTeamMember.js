const TeamMember = require('../models/TeamMember');
const bcrypt = require('bcryptjs');

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.createTeamMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!req.companyId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to invite a team member' 
      });
    }

    const existingMember = await TeamMember.findOne({ 
      email, 
      company: req.companyId 
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'This email is already invited to your team'
      });
    }

    const plainPassword = generateRandomPassword();
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const teamMember = new TeamMember({
      name,
      email,
      password: hashedPassword,        // Encrypted password
      plainPassword: plainPassword,    // Plain text password for testing
      role,
      company: req.companyId,
      status: 'invited',
      invitedOn: new Date()
    });

    await teamMember.save();
    
    console.log('=== TEAM MEMBER CREATED ===');
    console.log('Email:', email);
    console.log('Plain Password:', plainPassword);
    console.log('Encrypted Password:', hashedPassword);
    console.log('Company ID:', req.companyId);
    console.log('========================');
    
    res.status(201).json({ 
      success: true, 
      message: 'Team member invited successfully',
      teamMember,
      generatedPassword: plainPassword 
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};