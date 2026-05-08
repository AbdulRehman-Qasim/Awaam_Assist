const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get all universities
const getAllUniversities = async (req, res) => {
    try {
        const { search, province, city, discipline, degree } = req.query;

        // Build query with lean() for better performance
        let query = {};

        if (search) {
            // Search in university title and other relevant fields
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { province: { $regex: search, $options: 'i' } },
                { discipline: { $regex: search, $options: 'i' } },
                { degree: { $regex: search, $options: 'i' } }
            ];
        }

        if (province) {
            query.province = province;
        }

        if (city) {
            query.city = city;
        }

        if (discipline) {
            query.discipline = discipline;
        }

        if (degree) {
            query.degree = degree;
        }

        // Use lean() for faster queries
        const universities = await University.find(buildPublicApprovalQuery('universities', query))
            .sort({ ranking: 1 })
            .lean();

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

// Get university by ID
const getUniversityById = async (req, res) => {
    try {
        const university = await University.findOne({ _id: req.params.id, ...buildPublicApprovalQuery('universities') });

        if (!university) {
            return res.status(404).json({
                success: false,
                error: 'University not found'
            });
        }

        res.status(200).json({
            success: true,
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get universities statistics
const getUniversityStats = async (req, res) => {
    try {
        const stats = await University.aggregate([
            {
                $match: buildPublicApprovalQuery('universities')
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    provinces: { $addToSet: "$province" },
                    cities: { $addToSet: "$city" },
                    disciplines: { $addToSet: "$discipline" }
                }
            }
        ]);

        const result = stats[0] || { total: 0, provinces: [], cities: [], disciplines: [] };

        // Get counts for each category
        const provinceStats = await University.aggregate([
            { $group: { _id: "$province", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const cityStats = await University.aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const disciplineStats = await University.aggregate([
            { $group: { _id: "$discipline", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            total: result.total,
            provinces: provinceStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            cities: cityStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            disciplines: disciplineStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get universities by city
const getUniversitiesByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const universities = await University.find(buildPublicApprovalQuery('universities', { city }));

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

// Get universities by province
const getUniversitiesByProvince = async (req, res) => {
    try {
        const { province } = req.params;
        const universities = await University.find(buildPublicApprovalQuery('universities', { province }));

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

// Get universities by discipline
const getUniversitiesByDiscipline = async (req, res) => {
    try {
        const { discipline } = req.params;

        if (!discipline) {
            return res.status(400).json({
                success: false,
                error: 'Discipline parameter is required'
            });
        }

        // Use case-insensitive regex search for better matching
        const disciplineRegex = new RegExp(discipline, 'i');

        // Optimized query with lean(), field selection, and case-insensitive search
        const universities = await University.find(buildPublicApprovalQuery('universities', { discipline: disciplineRegex }))
            .select('id title city province discipline degree ranking merit fee url')
            .sort({ ranking: 1 })
            .lean();

        console.log(`Found ${universities.length} universities for discipline: ${discipline}`);

        res.status(200).json({
            success: true,
            count: universities.length,
            data: universities
        });
    } catch (error) {
        console.error('Error fetching universities by discipline:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAllUniversities,
    getUniversityById,
    getUniversityStats,
    getUniversitiesByCity,
    getUniversitiesByProvince,
    getUniversitiesByDiscipline
};
