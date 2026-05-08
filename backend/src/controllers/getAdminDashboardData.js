const University = require('../models/UniversitySchema');
const Company = require('../models/RegisterStudentSchema');
const Candidate = require('../models/Candidate');
const TeamMember = require('../models/TeamMember');

/**
 * Lightweight admin-side dashboard statistics.
 * You can extend this later, but this version prevents the server from
 * crashing due to an empty controller and gives the UI basic numbers.
 *
 * GET /admin/dashboard → server.js
 * Protected by adminAuthMiddleware.
 *
 * Response example:
 * {
 *   success: true,
 *   data: {
 *     totalUniversities: 123,
 *     totalCompanies: 45,
 *     totalCandidates: 789,
 *     totalTeamMembers: 67
 *   }
 * }
 */
const getAdminDashboardData = async (req, res) => {
  try {
    // Count documents in parallel to speed things up.
    const [universities, companies, candidates, teamMembers] = await Promise.all([
      University.countDocuments(),
      Company.countDocuments(),
      Candidate.countDocuments(),
      TeamMember.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUniversities: universities,
        totalCompanies: companies,
        totalCandidates: candidates,
        totalTeamMembers: teamMembers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching admin dashboard data',
      error: error.message,
    });
  }
};

module.exports = { getAdminDashboardData };
