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

exports.resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.companyId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to resend invitations' 
      });
    }
    const teamMember = await TeamMember.findOne({ 
      _id: id,
      company: req.companyId,
      status: 'invited'
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member invitation not found or already accepted'
      });
    }

    const plainPassword = generateRandomPassword();
    
 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);


    teamMember.invitedOn = new Date();
    teamMember.password = hashedPassword;       
    teamMember.plainPassword = plainPassword;   
    await teamMember.save();
    
    console.log('=== INVITATION RESENT ===');
    console.log('Email:', teamMember.email);
    console.log('New Plain Password:', plainPassword);
    console.log('New Encrypted Password:', hashedPassword);
    console.log('Company ID:', req.companyId);
    console.log('========================');
    
    res.status(200).json({ 
      success: true, 
      message: 'Invitation resent successfully',
      teamMember,
      generatedPassword: plainPassword 
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};