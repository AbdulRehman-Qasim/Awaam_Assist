const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Search universities by name with ranking
const searchUniversitiesByName = async (req, res) => {
    try {
        const { query, limit = 10 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        // Search universities with partial match in title and other fields
        const searchRegex = new RegExp(query, 'i');
        const universities = await University.find(buildPublicApprovalQuery('universities', {
            $or: [
                { title: searchRegex },
                { city: searchRegex },
                { province: searchRegex },
                { discipline: searchRegex },
                { degree: searchRegex }
            ]
        }))
            .sort({ ranking: 1 })
            .limit(Number.parseInt(limit, 10));

        console.log(`Search for "${query}" found ${universities.length} results`);

        res.status(200).json({
            success: true,
            count: universities.length,
            data: universities
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get universities by ranking range
const getUniversitiesByRanking = async (req, res) => {
    try {
        const { minRank, maxRank } = req.query;

        let query = {};

        if (minRank || maxRank) {
            query.ranking = {};
            if (minRank) query.ranking.$gte = Number.parseInt(minRank, 10);
            if (maxRank) query.ranking.$lte = Number.parseInt(maxRank, 10);
        }

        const universities = await University.find(buildPublicApprovalQuery('universities', query))
            .sort({ ranking: 1 });

        res.status(200).json({
            success: true,
            count: universities.length,
            data: universities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get top ranked universities
const getTopUniversities = async (req, res) => {
    try {
        const { limit = 20, discipline, province } = req.query;

        let query = {};

        if (discipline) query.discipline = discipline;
        if (province) query.province = province;

        const universities = await University.find(buildPublicApprovalQuery('universities', query))
            .sort({ ranking: 1 })
            .limit(Number.parseInt(limit, 10));

        res.status(200).json({
            success: true,
            count: universities.length,
            data: universities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    searchUniversitiesByName,
    getUniversitiesByRanking,
    getTopUniversities
};
