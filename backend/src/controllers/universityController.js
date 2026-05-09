const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get all universities with full backend-side filtering
const getAllUniversities = async (req, res) => {
    try {
        const { search, province, city, discipline, degree, marks, maxFee, minFee, sortBy } = req.query;
        console.log('[Backend] Fetching universities with search:', search);

        let query = {};

        // Full-text search across name, city, discipline, province
        if (search) {
            query.$or = [
                { title:      { $regex: search, $options: 'i' } },
                { city:       { $regex: search, $options: 'i' } },
                { province:   { $regex: search, $options: 'i' } },
                { discipline: { $regex: search, $options: 'i' } },
                { degree:     { $regex: search, $options: 'i' } }
            ];
        }

        // Exact / partial field filters
        if (province && province !== 'all') query.province = { $regex: province, $options: 'i' };
        if (city     && city     !== 'all') query.city     = { $regex: city,     $options: 'i' };
        if (discipline && discipline !== 'all') query.discipline = { $regex: discipline, $options: 'i' };
        if (degree   && degree   !== 'all') query.degree   = { $regex: degree,   $options: 'i' };

        // Merit: only show universities user is eligible for (merit <= user marks)
        if (marks) {
            const m = parseFloat(marks);
            if (!isNaN(m)) query.merit = { $lte: m };
        }

        // Fee range filter
        const feeField = {}; // fee or semesterFee
        if (minFee) feeField.$gte = parseFloat(minFee) || 0;
        if (maxFee) feeField.$lte = parseFloat(maxFee) || 99999999;
        if (Object.keys(feeField).length > 0) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { fee:         feeField },
                    { semesterFee: feeField }
                ]
            });
        }

        // Sort mapping
        const sortMap = {
            'ranking':    { ranking:  1 },
            'merit-low':  { merit:    1 },
            'merit-high': { merit:   -1 },
            'fee-low':    { fee:      1 },
            'fee-high':   { fee:     -1 },
            'name':       { title:    1 },
        };
        const sort = sortMap[sortBy] || { ranking: 1 };

        const universities = await University.find(buildPublicApprovalQuery('universities', query))
            .sort(sort)
            .lean();

        res.status(200).json({
            success: true,
            count: universities.length,
            data: universities
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

// Get live stats for hero section (no caching — always fresh from DB)
const getLiveStats = async (req, res) => {
    try {
        const [total, programAgg, cityAgg, provinceAgg] = await Promise.all([
            University.countDocuments(buildPublicApprovalQuery('universities')),
            University.distinct('discipline'),
            University.distinct('city'),
            University.distinct('province'),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUniversities: total,
                totalPrograms: programAgg.length,
                totalCities: cityAgg.length,
                totalProvinces: provinceAgg.length,
            },
            filters: {
                cities: cityAgg.filter(Boolean).sort(),
                disciplines: programAgg.filter(Boolean).sort(),
                provinces: provinceAgg.filter(Boolean).sort(),
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {
    getAllUniversities,
    getUniversityById,
    getUniversityStats,
    getUniversitiesByCity,
    getUniversitiesByProvince,
    getUniversitiesByDiscipline,
    getLiveStats,
};
