const Hospital = require('../models/HospitalSchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

const DUCKDUCKGO_RESULT_REGEX = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/i;

const buildHospitalLink = (hospitalDoc) => {
    const preferredLink = hospitalDoc.website || hospitalDoc.hospitalWebsite || hospitalDoc.hospitalLink || hospitalDoc.link || hospitalDoc.url;

    if (preferredLink) {
        return preferredLink;
    }

    const searchTarget = [
        hospitalDoc['Hospital Name'],
        hospitalDoc.City,
        hospitalDoc.Tehsil,
        'official website',
        'Pakistan',
    ]
        .filter(Boolean)
        .join(' ');

    return `https://duckduckgo.com/?q=${encodeURIComponent(searchTarget)}&ia=web`;
};

const buildHospitalSearchQuery = (hospitalDoc) => (
    [
        hospitalDoc['Hospital Name'],
        hospitalDoc.City,
        hospitalDoc.Tehsil,
        'official website',
        'Pakistan',
    ]
        .filter(Boolean)
        .join(' ')
);

const extractDuckDuckGoResultUrl = (html) => {
    const match = html.match(DUCKDUCKGO_RESULT_REGEX);
    const decoded = match?.[1]?.replaceAll('&amp;', '&')?.trim();

    if (!decoded) {
        return null;
    }

    if (decoded.startsWith('//')) {
        return `https:${decoded}`;
    }

    return decoded;
};

const resolveHospitalWebsiteUrl = async (hospitalDoc) => {
    const preferredLink = hospitalDoc.website || hospitalDoc.hospitalWebsite || hospitalDoc.hospitalLink || hospitalDoc.link || hospitalDoc.url;
    if (preferredLink) {
        return preferredLink;
    }

    const searchQuery = buildHospitalSearchQuery(hospitalDoc);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
    });

    if (!response.ok) {
        throw new Error(`DuckDuckGo lookup failed with status ${response.status}`);
    }

    const html = await response.text();
    const resolvedUrl = extractDuckDuckGoResultUrl(html);

    if (!resolvedUrl) {
        throw new Error('No website result found');
    }

    return resolvedUrl;
};

const persistHospitalWebsiteIfMissing = async (hospitalId, website) => {
    if (!website) {
        return;
    }

    await Hospital.findByIdAndUpdate(hospitalId, {
        $set: { website },
    });
};

const toAdminHospital = (hospitalDoc) => ({
    _id: hospitalDoc._id,
    SerialNum: hospitalDoc.SerialNum,
    City: hospitalDoc.City,
    Tehsil: hospitalDoc.Tehsil,
    hospitalName: hospitalDoc['Hospital Name'],
    category: hospitalDoc.Cateogry,
    treatmentCost: hospitalDoc.treatmentCost || 0,
    availability: hospitalDoc.availability || 'Available',
    info: hospitalDoc.info || '',
    status: hospitalDoc.status || 1,
    website: hospitalDoc.website || '',
    hospitalLink: buildHospitalLink(hospitalDoc),
    createdAt: hospitalDoc.createdAt,
    updatedAt: hospitalDoc.updatedAt,
});

const parseHospitalPayload = (body) => ({
    SerialNum: body.SerialNum,
    City: body.City,
    Tehsil: body.Tehsil,
    hospitalName: body.hospitalName || body['Hospital Name'],
    category: body.category || body.Cateogry,
    treatmentCost: body.treatmentCost,
    availability: body.availability,
    info: body.info,
    website: body.website || body.hospitalWebsite || '',
    status: body.status
});

// Get all hospitals with optional filtering
const getAllHospitals = async (req, res) => {
    try {
        const { city, category } = req.query;
        let query = {};

        if (city && city !== 'All Cities') {
            query.City = city;
        }

        if (category && category !== 'All Categories') {
            query.Cateogry = category;
        }

        const hospitals = await Hospital.find(buildPublicApprovalQuery('hospitals', query)).lean();
        const hospitalsWithLinks = hospitals.map((hospital) => ({
            ...hospital,
            hospitalLink: buildHospitalLink(hospital),
        }));

        res.status(200).json({ success: true, data: hospitalsWithLinks });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get filters for hospitals (unique cities and categories)
const getHospitalFilters = async (req, res) => {
    try {
        const approvedQuery = buildPublicApprovalQuery('hospitals');
        const cities = await Hospital.distinct('City', approvedQuery);
        const categories = await Hospital.distinct('Cateogry', approvedQuery);

        res.status(200).json({
            success: true,
            data: {
                cities: [...cities].sort((a, b) => a.localeCompare(b)),
                categories: [...categories].sort((a, b) => a.localeCompare(b))
            }
        });
    } catch (error) {
        console.error('Error fetching hospital filters:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getHospitalWebsite = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await Hospital.findOne({ _id: id, ...buildPublicApprovalQuery('hospitals') }).lean();

        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        const website = await resolveHospitalWebsiteUrl(hospital);

        if (!hospital.website && website) {
            await persistHospitalWebsiteIfMissing(hospital._id, website);
        }

        return res.status(200).json({
            success: true,
            data: {
                website,
            },
        });
    } catch (error) {
        console.error('Error resolving hospital website:', error);
        return res.status(500).json({ success: false, message: 'Unable to resolve hospital website' });
    }
};

// Admin: Get all hospitals with optional search/filter
const getAllHospitalsAdmin = async (req, res) => {
    try {
        const { city, category, q } = req.query;
        const query = {};

        // If not super_admin, only show their managed entity OR hospitals they created
        if (req.admin && req.admin.role !== 'super_admin') {
            query.$or = [
                { createdByHospitalAdmin: req.admin.id }
            ];
            
            if (req.admin.managed_entity_id) {
                query.$or.push({ _id: req.admin.managed_entity_id });
            }
        }

        if (city && city !== 'all') {
            query.City = city;
        }

        if (category && category !== 'all') {
            query.Cateogry = category;
        }

        if (q) {
            const regex = new RegExp(q, 'i');
            query.$or = [
                { 'Hospital Name': regex },
                { Tehsil: regex },
                { City: regex },
                { Cateogry: regex },
            ];
        }

        const hospitals = await Hospital.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: hospitals.map(toAdminHospital),
        });
    } catch (error) {
        console.error('Error fetching admin hospitals:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Admin: Create hospital
const createHospital = async (req, res) => {
    try {
        const payload = parseHospitalPayload(req.body);

        if (!payload.City || !payload.Tehsil || !payload.hospitalName || !payload.category) {
            return res.status(400).json({
                success: false,
                message: 'City, Tehsil, Hospital Name and Category are required',
            });
        }

        let serial = payload.SerialNum;
        if (!serial) {
            const count = await Hospital.countDocuments();
            serial = count + 1;
        }

        const created = await Hospital.create({
            SerialNum: serial,
            City: payload.City,
            Tehsil: payload.Tehsil,
            'Hospital Name': payload.hospitalName,
            Cateogry: payload.category,
            treatmentCost: payload.treatmentCost || 0,
            availability: payload.availability || 'Available',
            info: payload.info || '',
            website: payload.website,
            status: payload.status || 'approved', // Auto-approve for authorized admins
            createdByHospitalAdmin: req.admin?.id,
        });

        return res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: toAdminHospital(created),
        });
    } catch (error) {
        console.error('Error creating hospital:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Admin: Update hospital
const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = parseHospitalPayload(req.body);

        const updates = {};
        if (payload.SerialNum !== undefined) updates.SerialNum = payload.SerialNum;
        if (payload.City !== undefined) updates.City = payload.City;
        if (payload.Tehsil !== undefined) updates.Tehsil = payload.Tehsil;
        if (payload.hospitalName !== undefined) updates['Hospital Name'] = payload.hospitalName;
        if (payload.category !== undefined) updates.Cateogry = payload.category;
        if (payload.website !== undefined) updates.website = payload.website;
        if (payload.treatmentCost !== undefined) updates.treatmentCost = payload.treatmentCost;
        if (payload.availability !== undefined) updates.availability = payload.availability;
        if (payload.info !== undefined) updates.info = payload.info;
        if (payload.status !== undefined) updates.status = payload.status;

        // Security: Ensure admin owns the hospital or manages the entity
        const hospitalToUpdate = await Hospital.findById(id);
        if (!hospitalToUpdate) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        if (req.admin.role !== 'super_admin') {
            const isOwner = hospitalToUpdate.createdByHospitalAdmin?.toString() === req.admin.id;
            const isManager = hospitalToUpdate._id.toString() === req.admin.managed_entity_id?.toString();
            
            if (!isOwner && !isManager) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this hospital' });
            }
        }

        const updated = await Hospital.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Hospital updated successfully',
            data: toAdminHospital(updated),
        });
    } catch (error) {
        console.error('Error updating hospital:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Admin: Delete hospital
const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;
        // Security: Ensure admin owns the hospital or manages the entity
        const hospitalToDelete = await Hospital.findById(id);
        if (!hospitalToDelete) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        if (req.admin.role !== 'super_admin') {
            const isOwner = hospitalToDelete.createdByHospitalAdmin?.toString() === req.admin.id;
            const isManager = hospitalToDelete._id.toString() === req.admin.managed_entity_id?.toString();
            
            if (!isOwner && !isManager) {
                return res.status(403).json({ success: false, message: 'Not authorized to delete this hospital' });
            }
        }

        const deleted = await Hospital.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Hospital deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting hospital:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Admin: Dashboard stats for hospital portal
const getHospitalDashboardStats = async (req, res) => {
    try {
        let matchQuery = {};
        
        console.log('DEBUG: Hospital Dashboard Stats request from admin:', req.admin ? { id: req.admin._id, email: req.admin.admin_email, role: req.admin.role } : 'No admin');

        // If not super_admin, only show their managed entity OR hospitals they created
        if (req.admin && req.admin.role !== 'super_admin') {
            matchQuery.$or = [
                { createdByHospitalAdmin: req.admin._id }
            ];
            
            if (req.admin.managed_entity_id) {
                matchQuery.$or.push({ _id: req.admin.managed_entity_id });
            }
        }

        console.log('DEBUG: Hospital matchQuery:', JSON.stringify(matchQuery, null, 2));

        const [totalHospitals, cities, categories, recentHospitals] = await Promise.all([
            Hospital.countDocuments(matchQuery),
            Hospital.distinct('City', matchQuery),
            Hospital.distinct('Cateogry', matchQuery),
            Hospital.find(matchQuery).sort({ createdAt: -1 }).limit(8),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalHospitals,
                    totalCities: cities.length,
                    totalCategories: categories.length,
                },
                recentHospitals: recentHospitals.map(toAdminHospital),
            },
        });
    } catch (error) {
        console.error('Error fetching hospital dashboard stats:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllHospitals,
    getHospitalFilters,
    getHospitalWebsite,
    getAllHospitalsAdmin,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitalDashboardStats,
};
