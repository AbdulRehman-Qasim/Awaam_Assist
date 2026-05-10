const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

/**
 * Get all dynamic options for Education Onboarding
 * (Programs, Specializations, Career Goals)
 */
const getEducationOptions = async (req, res) => {
  try {
    // 1. Get unique disciplines (Programs) from University model
    const disciplines = await University.distinct('discipline', buildPublicApprovalQuery('universities'));
    
    // 2. Curated list of specializations (as per user requirements)
    const specializations = [
      "Artificial Intelligence",
      "Cybersecurity",
      "Data Science",
      "Network Engineering",
      "Cloud Computing",
      "Software Engineering",
      "Mobile App Development",
      "Web Technologies",
      "Blockchain",
      "Internet of Things (IoT)"
    ];

    // 3. Curated list of career goals
    const careerGoals = [
      "Software Engineer",
      "Data Scientist",
      "Medical Doctor",
      "Civil Engineer",
      "Entrepreneur",
      "Researcher",
      "Financial Analyst",
      "Marketing Manager",
      "Educationist",
      "Public Servant"
    ];

    res.status(200).json({
      success: true,
      data: {
        programs: disciplines.filter(Boolean).sort(),
        specializations: specializations.sort(),
        careerGoals: careerGoals.sort()
      }
    });
  } catch (error) {
    console.error('Error fetching education options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education options',
      error: error.message
    });
  }
};

module.exports = {
  getEducationOptions
};
