const TeamMember = require('../models/TeamMember');

exports.cancelInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company ID exists from auth middleware
    if (!req.companyId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - you must be logged in to cancel invitations'
      });
    }

    // Find and delete the team member invitation
    const result = await TeamMember.findOneAndDelete({
      _id: id,
      company: req.companyId,
      // status: 'invited' // Only cancel if status is still 'invited'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Team member invitation not found or already accepted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};