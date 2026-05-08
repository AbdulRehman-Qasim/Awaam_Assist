const TeamMember = require('../models/TeamMember');

exports.getTeamMembers = async (req, res) => {
  try {
    if (!req.companyId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to view team members' 
      });
    }

    const teamMembers = await TeamMember.find({ company: req.companyId })
      .sort({ invitedOn: -1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// New function to get individual team member details
exports.getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if company ID exists from auth middleware
    if (!req.companyId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to view team member details' 
      });
    }

    const teamMember = await TeamMember.findOne({ 
      _id: id, 
      company: req.companyId 
    }).select('name email role status invitedOn lastActive');

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      teamMember
    });
  } catch (error) {
    console.error('Error fetching team member details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};