const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get top 5 universities by ranking - optimized for performance
const getTopUniversities = async (req, res) => {
    try {
        // Optimized query for top 5 universities
        const topUniversities = await University.find(buildPublicApprovalQuery('universities', {
            ranking: { $gte: 1, $lte: 100 } // Only consider valid rankings
        }))
            .select('id title city province discipline degree ranking merit fee url')
            .sort({ ranking: 1, merit: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,
            count: topUniversities.length,
            data: topUniversities
        });
    } catch (error) {
        console.error('Error fetching top universities:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getTopUniversities
};
