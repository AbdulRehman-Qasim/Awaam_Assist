const Scheme = require('../models/SchemeSchema');

// Create a new scheme (Admin only)
const createScheme = async (req, res) => {
    try {
        const schemeData = req.body;
        // Auto-approve if created by an authorized admin
        schemeData.approvalStatus = 'approved';

        // Check if scheme with same schemeId already exists
        const existingScheme = await Scheme.findOne({ schemeId: schemeData.schemeId });
        if (existingScheme) {
            return res.status(400).json({
                success: false,
                error: 'Scheme with this ID already exists'
            });
        }

        if (req.admin) {
            schemeData.createdByHospitalAdmin = req.admin.id || req.admin._id;
        }

        const scheme = await Scheme.create(schemeData);

        res.status(201).json({
            success: true,
            message: 'Scheme created successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error creating scheme:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.errors
        });
    }
};

// Update a scheme (Admin only)
const updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Ownership check
        if (req.admin && req.admin.role !== 'super_admin') {
            const adminId = req.admin.id || req.admin._id;
            const existingScheme = await Scheme.findById(id);
            
            if (!existingScheme) {
                return res.status(404).json({ success: false, error: 'Scheme not found' });
            }

            const isOwner = existingScheme.createdByHospitalAdmin?.toString() === adminId.toString();
            const isManaged = req.admin.managed_entity_id?.toString() === id.toString();

            if (!isOwner && !isManaged) {
                return res.status(403).json({ success: false, error: 'Access denied. You do not own this scheme.' });
            }
        }

        // Update lastUpdated timestamp
        updateData.lastUpdated = new Date();

        const scheme = await Scheme.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheme updated successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error updating scheme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete a scheme (Admin only)
const deleteScheme = async (req, res) => {
    try {
        const { id } = req.params;

        // Ownership check
        if (req.admin && req.admin.role !== 'super_admin') {
            const adminId = req.admin.id || req.admin._id;
            const existingScheme = await Scheme.findById(id);
            
            if (!existingScheme) {
                return res.status(404).json({ success: false, error: 'Scheme not found' });
            }

            const isOwner = existingScheme.createdByHospitalAdmin?.toString() === adminId.toString();
            const isManaged = req.admin.managed_entity_id?.toString() === id.toString();

            if (!isOwner && !isManaged) {
                return res.status(403).json({ success: false, error: 'Access denied. You do not own this scheme.' });
            }
        }

        const scheme = await Scheme.findByIdAndDelete(id);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheme deleted successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update scheme status (Admin only)
const updateSchemeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Inactive', 'Suspended', 'Closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const scheme = await Scheme.findByIdAndUpdate(
            id,
            { status, lastUpdated: new Date() },
            { new: true }
        );

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheme status updated successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error updating scheme status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update scheme statistics (Admin only)
const updateSchemeStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { beneficiaries, budgetAllocated, applicationsReceived } = req.body;

        const updateData = { lastUpdated: new Date() };
        if (beneficiaries !== undefined) updateData['stats.beneficiaries'] = beneficiaries;
        if (budgetAllocated !== undefined) updateData['stats.budgetAllocated'] = budgetAllocated;
        if (applicationsReceived !== undefined) updateData['stats.applicationsReceived'] = applicationsReceived;

        const scheme = await Scheme.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheme statistics updated successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error updating scheme stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all schemes for admin (including inactive)
const getAllSchemesAdmin = async (req, res) => {
    try {
        const { search, category, province, status } = req.query;

        let query = {};

        // If not super_admin, only show their managed entity OR schemes they created
        if (req.admin && req.admin.role !== 'super_admin') {
            const adminId = req.admin.id || req.admin._id;
            query.$or = [
                { createdByHospitalAdmin: adminId }
            ];
            if (req.admin.managed_entity_id) {
                query.$or.push({ _id: req.admin.managed_entity_id });
            }
        }

        if (search) {
            query.$or = [
                { schemeName: { $regex: search, $options: 'i' } },
                { schemeId: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (province) query.province = province;
        if (status) query.status = status;

        const schemes = await Scheme.find(query)
            .sort({ lastUpdated: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: schemes.length,
            data: schemes
        });
    } catch (error) {
        console.error('Error fetching schemes for admin:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get admin dashboard statistics
const getAdminDashboardStats = async (req, res) => {
    try {
        let matchQuery = {};
        
        // If not super_admin, only show their managed entity OR schemes they created
        if (req.admin && req.admin.role !== 'super_admin') {
            const adminId = req.admin.id || req.admin._id;
            matchQuery.$or = [
                { createdByHospitalAdmin: adminId }
            ];
            if (req.admin.managed_entity_id) {
                matchQuery.$or.push({ _id: req.admin.managed_entity_id });
            }
        }

        const totalSchemes = await Scheme.countDocuments(matchQuery);
        const activeSchemes = await Scheme.countDocuments({ ...matchQuery, status: 'Active' });
        const inactiveSchemes = await Scheme.countDocuments({ ...matchQuery, status: 'Inactive' });
        const closedSchemes = await Scheme.countDocuments({ ...matchQuery, status: 'Closed' });

        const stats = await Scheme.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalBeneficiaries: { $sum: '$stats.beneficiaries' },
                    totalBudget: { $sum: '$stats.budgetAllocated' },
                    totalApplications: { $sum: '$stats.applicationsReceived' }
                }
            }
        ]);

        const result = stats[0] || {
            totalBeneficiaries: 0,
            totalBudget: 0,
            totalApplications: 0
        };

        // Category breakdown
        const categoryBreakdown = await Scheme.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Province breakdown
        const provinceBreakdown = await Scheme.aggregate([
            { $group: { _id: '$province', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent schemes
        const recentSchemes = await Scheme.find(matchQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('schemeId schemeName category status createdAt province')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total: totalSchemes,
                    active: activeSchemes,
                    inactive: inactiveSchemes,
                    closed: closedSchemes
                },
                impact: {
                    totalBeneficiaries: result.totalBeneficiaries,
                    totalBudget: result.totalBudget,
                    totalApplications: result.totalApplications
                },
                breakdown: {
                    categories: categoryBreakdown,
                    provinces: provinceBreakdown
                },
                recentSchemes
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Bulk import schemes (Admin only)
const bulkImportSchemes = async (req, res) => {
    try {
        const schemes = req.body.schemes;

        if (!Array.isArray(schemes) || schemes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid schemes data'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const schemeData of schemes) {
            try {
                const existingScheme = await Scheme.findOne({ schemeId: schemeData.schemeId });
                if (existingScheme) {
                    results.failed.push({
                        schemeId: schemeData.schemeId,
                        error: 'Scheme already exists'
                    });
                    continue;
                }

                const scheme = await Scheme.create(schemeData);
                results.success.push(scheme.schemeId);
            } catch (error) {
                results.failed.push({
                    schemeId: schemeData.schemeId,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Imported ${results.success.length} schemes, ${results.failed.length} failed`,
            data: results
        });
    } catch (error) {
        console.error('Error bulk importing schemes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createScheme,
    updateScheme,
    deleteScheme,
    updateSchemeStatus,
    updateSchemeStats,
    getAllSchemesAdmin,
    getAdminDashboardStats,
    bulkImportSchemes
};
