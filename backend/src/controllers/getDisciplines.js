const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get all unique disciplines - optimized for performance
const getDisciplines = async (req, res) => {
    try {
        // Use aggregation to get unique disciplines efficiently
        const disciplines = await University.aggregate([
            {
                $match: buildPublicApprovalQuery('universities', {
                    discipline: { $exists: true, $nin: [null, ""] }
                })
            },
            {
                $group: {
                    _id: "$discipline",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1, _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    discipline: "$_id",
                    count: "$count"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: disciplines.length,
            data: disciplines.map(d => d.discipline)
        });
    } catch (error) {
        console.error('Error fetching disciplines:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getDisciplines
};
