const Admin = require('../../../models/AdminSchema');
const University = require('../../../models/UniversitySchema');
const Scheme = require('../../../models/SchemeSchema');
const Hospital = require('../../../models/HospitalSchema');
const HospitalAdmin = require('../../../models/HospitalAdminSchema');

const approvalTargets = {
    universities: {
        model: University,
        statusField: 'status',
        buildLabel: (doc) => doc.title,
        buildLocation: (doc) => [doc.city, doc.province].filter(Boolean).join(', '),
    },
    schemes: {
        model: Scheme,
        statusField: 'approvalStatus',
        buildLabel: (doc) => doc.schemeName,
        buildLocation: (doc) => doc.province,
    },
    hospitals: {
        model: Hospital,
        statusField: 'status',
        buildLabel: (doc) => doc['Hospital Name'],
        buildLocation: (doc) => [doc.City, doc.Tehsil].filter(Boolean).join(', '),
    },
};

const buildPublicApprovalQuery = (type, baseQuery = {}) => {
    const target = approvalTargets[type];

    if (!target) {
        return baseQuery;
    }

    let approvalOr = [];
    if (type === 'schemes') {
        approvalOr = [
            { approvalStatus: 'approved' },
            { approvalStatus: { $exists: false }, status: 'Active' },
        ];
    } else {
        approvalOr = [
            { [target.statusField]: 'approved' },
            { [target.statusField]: { $exists: false } },
            { [target.statusField]: 1 },
            { [target.statusField]: '1' },
        ];
    }

    // Merge using $and to prevent overwriting baseQuery's own $or (e.g. from search)
    if (Object.keys(baseQuery).length === 0) {
        return { $or: approvalOr };
    }

    return {
        $and: [
            baseQuery,
            { $or: approvalOr }
        ]
    };
};

const getAdminSummary = async () => {
    const [
        totalStandard, suspendedStandard,
        totalHospital, suspendedHospital,
        universities, schemes, hospitals,
        pendingStandard, pendingHospitalAdminDocs
    ] = await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ status: 'suspended' }),
        HospitalAdmin.countDocuments(),
        HospitalAdmin.countDocuments({ status: 'suspended' }),
        University.countDocuments(buildPublicApprovalQuery('universities')),
        Scheme.countDocuments(buildPublicApprovalQuery('schemes')),
        Hospital.countDocuments(buildPublicApprovalQuery('hospitals')),
        Admin.find({ isApproved: false, is_onboarded: true }).lean(),
        HospitalAdmin.countDocuments({ isApproved: false }),
    ]);

    const pendingEducationAdmins = pendingStandard.filter(a => a.role === 'education_admin' || a.entity_type === 'university').length;
    const pendingSchemeAdmins = pendingStandard.filter(a => a.role === 'scheme_admin' || a.entity_type === 'scheme').length;
    const pendingHospitalAdmins = pendingStandard.filter(a => a.role === 'hospital_admin' || a.entity_type === 'hospital').length;

    const [pendingUniversities, pendingSchemes, pendingHospitals] = await Promise.all([
        University.countDocuments({ status: 'pending' }),
        Scheme.countDocuments({ approvalStatus: 'pending' }),
        Hospital.countDocuments({ status: 'pending' }),
    ]);

    return {
        totals: {
            admins: totalStandard + totalHospital,
            universities,
            schemes,
            hospitals,
        },
        pending: {
            admins: pendingStandard.length + pendingHospitalAdminDocs,
            universities: pendingUniversities + pendingEducationAdmins,
            schemes: pendingSchemes + pendingSchemeAdmins,
            hospitals: pendingHospitals + pendingHospitalAdmins + pendingHospitalAdminDocs,
        },
        suspendedAdmins: suspendedStandard + suspendedHospital,
    };
};

const normalizeAdminRecord = (admin) => ({
    ...admin,
    role: admin.role || 'education_admin',
    isApproved: Boolean(admin.isApproved),
    status: admin.status || 'active',
    entity_name: admin.entity_name || '',
    entity_type: admin.entity_type || '',
    entity_address: admin.entity_address || '',
    entity_contact: admin.entity_contact || '',
    entity_description: admin.entity_description || '',
    verification_docs: admin.verification_docs || [],
});

const listAdmins = async () => {
    const [standardAdmins, hospitalAdmins] = await Promise.all([
        Admin.find().sort({ createdAt: -1 }).lean(),
        HospitalAdmin.find().sort({ createdAt: -1 }).lean(),
    ]);

    const normalizedStandard = standardAdmins.map(normalizeAdminRecord);
    const normalizedHospital = hospitalAdmins.map((admin) => ({
        ...admin,
        role: 'hospital_admin',
        isApproved: admin.isApproved !== false,
        status: admin.status || 'active',
    }));

    return [...normalizedStandard, ...normalizedHospital].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
};

const listPendingAdmins = async () => Admin.find({ isApproved: false, is_onboarded: true }).sort({ createdAt: -1 }).lean().then((admins) => admins.map(normalizeAdminRecord));

const approveAdmin = async (id) => {
    let admin = await Admin.findById(id);
    if (!admin) {
        admin = await HospitalAdmin.findById(id);
    }
    
    if (!admin) {
        return { status: 404, body: { success: false, message: 'Admin not found' } };
    }

    admin.isApproved = true;
    admin.status = 'active';

    // Create the entity based on onboarding data
    if (admin.entity_type && admin.entity_name) {
        let entity;
        if (admin.entity_type === 'university') {
            entity = await University.create({
                id: `UNI-${Date.now()}`, // Generate a temporary ID
                title: admin.entity_name,
                city: admin.entity_address?.split(',')[0]?.trim() || 'Unknown',
                province: admin.entity_address?.split(',')[1]?.trim() || 'Punjab',
                discipline: 'General',
                degree: 'Bachelor',
                // Approval flow creates a base university profile; keep valid default annual fee.
                fee: 1,
                contact: admin.entity_contact,
                info: admin.entity_description,
                web: admin.official_website,
                status: 'approved',
                map: {
                    address: admin.entity_address,
                    location: admin.entity_address
                }
            });
        } else if (admin.entity_type === 'scheme') {
            // Scheme admins are jurisdiction heads (province/city level).
            // They should create actual schemes later from dashboard, not during approval.
            entity = null;
        } else if (admin.entity_type === 'hospital') {
            entity = await Hospital.create({
                "Hospital Name": admin.entity_name,
                City: admin.entity_address?.split(',')[0]?.trim() || 'Unknown',
                Tehsil: admin.entity_address?.split(',')[0]?.trim() || 'Unknown',
                Cateogry: admin.scale || 'General',
                website: admin.official_website,
                status: 'approved',
                createdByHospitalAdmin: admin._id
            });
        }

        if (entity) {
            admin.managed_entity_id = entity._id;
            // Ensure owner link is established for display in overview
            if (admin.entity_type === 'university' || admin.entity_type === 'scheme') {
                entity.createdByHospitalAdmin = admin._id; 
                await entity.save();
            }
        }
    }

    await admin.save();

    return { status: 200, body: { success: true, message: 'Admin approved and entity created successfully' } };
};

const rejectAdmin = async (id) => {
    let deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
        deleted = await HospitalAdmin.findByIdAndDelete(id);
    }
    
    if (!deleted) {
        return { status: 404, body: { success: false, message: 'Admin not found' } };
    }

    return { status: 200, body: { success: true, message: 'Admin rejected successfully' } };
};

const suspendAdmin = async (id) => {
    let admin = await Admin.findById(id);
    if (!admin) {
        admin = await HospitalAdmin.findById(id);
    }
    
    if (!admin) {
        return { status: 404, body: { success: false, message: 'Admin not found' } };
    }

    admin.status = 'suspended';
    admin.isApproved = false;
    await admin.save();

    return { status: 200, body: { success: true, message: 'Admin suspended successfully' } };
};


const listPendingData = async (type) => {
    const target = approvalTargets[type];

    if (!target) {
        return null;
    }

    const query = type === 'schemes'
        ? { approvalStatus: 'pending' }
        : { [target.statusField]: 'pending' };

    const records = await target.model.find(query).sort({ createdAt: -1 }).lean();

    return records.map((record) => ({
        id: record._id,
        name: target.buildLabel(record),
        location: target.buildLocation(record),
        submittedAt: record.createdAt,
        status: record[target.statusField] || (type === 'schemes' ? record.approvalStatus : undefined),
        raw: record,
    }));
};

const updateDataStatus = async (type, id, nextStatus) => {
    const target = approvalTargets[type];

    if (!target) {
        return { status: 404, body: { success: false, message: 'Unsupported data type' } };
    }

    const update = { [target.statusField]: nextStatus };
    const updated = await target.model.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
        return { status: 404, body: { success: false, message: `${type.slice(0, -1)} not found` } };
    }

    return {
        status: 200,
        body: {
            success: true,
            message: `${type.slice(0, -1)} ${nextStatus} successfully`,
            data: updated,
        },
    };
};

const getPendingData = async (type) => listPendingData(type);

const approveData = async (type, id) => updateDataStatus(type, id, 'approved');

const rejectData = async (type, id) => updateDataStatus(type, id, 'rejected');

const listAllRecords = async () => {
    const [unis, schemes, hospitals] = await Promise.all([
        University.find().sort({ createdAt: -1 }).lean(),
        Scheme.find().sort({ createdAt: -1 }).lean(),
        Hospital.find().sort({ createdAt: -1 }).lean(),
    ]);

    const normalize = (items, type) => {
        const target = approvalTargets[type];
        return items.map((item) => ({
            id: item._id,
            name: target.buildLabel(item),
            location: target.buildLocation(item),
            owner: item.createdByHospitalAdmin || 'Admin System',
            status: item[target.statusField] || (type === 'schemes' ? item.approvalStatus : 'Active'),
            raw: item,
        }));
    };

    return {
        universities: normalize(unis, 'universities'),
        schemes: normalize(schemes, 'schemes'),
        hospitals: normalize(hospitals, 'hospitals'),
    };
};

const getAnalyticsData = async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
        totalUnis, totalSchemes, totalHospitals,
        newUnis, prevUnis,
        newSchemes, prevSchemes,
        newHospitals, prevHospitals,
        totalStandardAdmins, approvedStandardAdmins,
        totalHospitalAdmins, approvedHospitalAdmins
    ] = await Promise.all([
        University.countDocuments(),
        Scheme.countDocuments(),
        Hospital.countDocuments(),
        University.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        University.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
        Scheme.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Scheme.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
        Hospital.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Hospital.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
        Admin.countDocuments(),
        Admin.countDocuments({ isApproved: true }),
        HospitalAdmin.countDocuments(),
        HospitalAdmin.countDocuments({ isApproved: true })
    ]);

    const allAdmins = totalStandardAdmins + totalHospitalAdmins;
    const approvedAdmins = approvedStandardAdmins + approvedHospitalAdmins;

    // Volume Progression (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            start: new Date(now.getFullYear(), now.getMonth() - i, 1),
            end: new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        });
    }

    const volumeProgression = await Promise.all(months.map(async (m) => {
        const [u, s, h] = await Promise.all([
            University.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
            Scheme.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } }),
            Hospital.countDocuments({ createdAt: { $gte: m.start, $lte: m.end } })
        ]);
        return {
            label: m.label,
            value: u + s + h
        };
    }));

    // Calculate Global Growth percentage
    const currentNew = newUnis + newSchemes + newHospitals;
    const previousNew = prevUnis + prevSchemes + prevHospitals;
    let growth = 0;
    if (previousNew > 0) {
        growth = ((currentNew - previousNew) / previousNew) * 100;
    } else if (currentNew > 0) {
        growth = 100;
    }

    // System Distribution
    const totalRecords = totalUnis + totalSchemes + totalHospitals;
    const usageStats = [
        { label: "Academic Records", value: totalRecords > 0 ? `${Math.round((totalUnis / totalRecords) * 100)}%` : "0%", detail: `${totalUnis} verified institutions` },
        { label: "Welfare Schemes", value: totalRecords > 0 ? `${Math.round((totalSchemes / totalRecords) * 100)}%` : "0%", detail: `${totalSchemes} active programs` },
        { label: "Medical Centers", value: totalRecords > 0 ? `${Math.round((totalHospitals / totalRecords) * 100)}%` : "0%", detail: `${totalHospitals} mapped facilities` }
    ];

    // Platform Engagement (Approved Admins / Total Admins)
    const engagement = allAdmins > 0 ? Math.round((approvedAdmins / allAdmins) * 100) : 0;

    return {
        metrics: {
            growth: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
            engagement: `${engagement}%`,
            efficiency: "4.2h" // Hardcoded for now as we don't track approval timestamps precisely enough yet
        },
        volumeProgression,
        usageStats
    };
};

module.exports = {
    getAdminSummary,
    listAdmins,
    listPendingAdmins,
    approveAdmin,
    rejectAdmin,
    suspendAdmin,
    getPendingData,
    approveData,
    rejectData,
    listAllRecords,
    buildPublicApprovalQuery,
    normalizeAdminRecord,
    getAnalyticsData,
};