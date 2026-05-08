const Scheme = require('../models/SchemeSchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get all schemes with filtering
const getAllSchemes = async (req, res) => {
    try {
        const { search, category, province, status, sortBy } = req.query;

        // Build query
        let query = {};

        // Text search
        if (search) {
            query.$or = [
                { schemeName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { shortName: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Province filter
        if (province && province !== 'all') {
            query.$or = [
                { province: province },
                { province: 'Federal' }
            ];
        }

        // Status filter
        if (status) {
            query.status = status;
        } else {
            query.status = 'Active'; // Default to active schemes
        }

        query = buildPublicApprovalQuery('schemes', query);

        // Sorting
        let sort = {};
        switch (sortBy) {
            case 'name':
                sort = { schemeName: 1 };
                break;
            case 'benefit-high':
                sort = { 'benefits.financial.amount': -1 };
                break;
            case 'benefit-low':
                sort = { 'benefits.financial.amount': 1 };
                break;
            default:
                sort = { lastUpdated: -1 }; // Most recently updated first
        }

        const schemes = await Scheme.find(query)
            .sort(sort)
            .lean();

        res.status(200).json({
            success: true,
            count: schemes.length,
            data: schemes
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get scheme by ID
const getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findOne({ _id: req.params.id, ...buildPublicApprovalQuery('schemes') });

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            data: scheme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get scheme by schemeId (custom ID)
const getSchemeBySchemeId = async (req, res) => {
    try {
        const scheme = await Scheme.findOne({ schemeId: req.params.schemeId, ...buildPublicApprovalQuery('schemes') });

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            data: scheme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Check eligibility for a scheme
const checkEligibility = async (req, res) => {
    try {
        const { schemeId } = req.params;
        const userProfile = req.body;

        const scheme = await Scheme.findOne({ schemeId, ...buildPublicApprovalQuery('schemes') });

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        const eligibilityResult = scheme.checkEligibility(userProfile);

        res.status(200).json({
            success: true,
            scheme: {
                schemeId: scheme.schemeId,
                schemeName: scheme.schemeName,
                category: scheme.category
            },
            eligibility: eligibilityResult
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Check eligibility for multiple schemes
const checkEligibilityBatch = async (req, res) => {
    try {
        const userProfile = req.body;

        // Get all active schemes
        const schemes = await Scheme.find(buildPublicApprovalQuery('schemes', { status: 'Active' }));

        const results = schemes.map(scheme => {
            const eligibility = scheme.checkEligibility(userProfile);
            return {
                schemeId: scheme.schemeId,
                schemeName: scheme.schemeName,
                category: scheme.category,
                province: scheme.province,
                benefit: scheme.benefits.financial.amount,
                ...eligibility
            };
        });

        // Filter to only eligible schemes
        const eligibleSchemes = results.filter(r => r.isEligible);

        // Sort by eligibility percentage
        eligibleSchemes.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);

        res.status(200).json({
            success: true,
            total: schemes.length,
            eligible: eligibleSchemes.length,
            data: eligibleSchemes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get scheme statistics
const getSchemeStats = async (req, res) => {
    try {
        const stats = await Scheme.aggregate([
            { $match: buildPublicApprovalQuery('schemes', { status: 'Active' }) },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalBeneficiaries: { $sum: '$stats.beneficiaries' },
                    totalBudget: { $sum: '$stats.budgetAllocated' },
                    totalApplications: { $sum: '$stats.applicationsReceived' },
                    categories: { $addToSet: '$category' },
                    provinces: { $addToSet: '$province' }
                }
            }
        ]);

        const result = stats[0] || {
            total: 0,
            totalBeneficiaries: 0,
            totalBudget: 0,
            totalApplications: 0,
            categories: [],
            provinces: []
        };

        // Get category breakdown
        const categoryStats = await Scheme.aggregate([
            { $match: buildPublicApprovalQuery('schemes', { status: 'Active' }) },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get province breakdown
        const provinceStats = await Scheme.aggregate([
            { $match: buildPublicApprovalQuery('schemes', { status: 'Active' }) },
            { $group: { _id: '$province', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            total: result.total,
            totalBeneficiaries: result.totalBeneficiaries,
            totalBudget: result.totalBudget,
            totalApplications: result.totalApplications,
            categories: categoryStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            provinces: provinceStats.reduce((acc, item) => {
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

// Get schemes by category
const getSchemesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const schemes = await Scheme.find(buildPublicApprovalQuery('schemes', {
            category,
            status: 'Active'
        })).lean();

        res.status(200).json({
            success: true,
            count: schemes.length,
            data: schemes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get schemes by province
const getSchemesByProvince = async (req, res) => {
    try {
        const { province } = req.params;
        const schemes = await Scheme.find(buildPublicApprovalQuery('schemes', {
            $or: [
                { province: province },
                { province: 'Federal' }
            ],
            status: 'Active'
        })).lean();

        res.status(200).json({
            success: true,
            count: schemes.length,
            data: schemes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get unique categories
const getCategories = async (req, res) => {
    try {
        const categories = await Scheme.distinct('category', buildPublicApprovalQuery('schemes', { status: 'Active' }));
        const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));

        res.status(200).json({
            success: true,
            data: sortedCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get unique provinces
const getProvinces = async (req, res) => {
    try {
        const provinces = await Scheme.distinct('province', buildPublicApprovalQuery('schemes', { status: 'Active' }));
        const sortedProvinces = [...provinces].sort((a, b) => a.localeCompare(b));

        res.status(200).json({
            success: true,
            data: sortedProvinces
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAllSchemes,
    getSchemeById,
    getSchemeBySchemeId,
    checkEligibility,
    checkEligibilityBatch,
    getSchemeStats,
    getSchemesByCategory,
    getSchemesByProvince,
    getCategories,
    getProvinces
};
