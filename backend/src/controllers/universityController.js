const University = require('../models/UniversitySchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// Get all universities with full backend-side filtering
const getAllUniversities = async (req, res) => {
    try {
        const { search, province, city, discipline, degree, marks, maxFee, minFee, sortBy } = req.query;
        console.log('[Backend] Fetching universities with search:', search);

        // 1. Initial Match (University level filters)
        let initialMatch = buildPublicApprovalQuery('universities');
        if (province && province !== 'all') initialMatch.province = { $regex: province, $options: 'i' };
        if (city && city !== 'all') initialMatch.city = { $regex: city, $options: 'i' };
        
        // 2. Post-Lookup Match (Program level filters & cross-filters)
        let postMatch = { "programs.status": "active" };

        if (search) {
            postMatch.$or = [
                { title: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { province: { $regex: search, $options: 'i' } },
                { "programs.discipline": { $regex: search, $options: 'i' } },
                { "programs.degree": { $regex: search, $options: 'i' } }
            ];
        }

        if (discipline && discipline !== 'all') postMatch["programs.discipline"] = { $regex: discipline, $options: 'i' };
        if (degree && degree !== 'all') postMatch["programs.degree"] = { $regex: degree, $options: 'i' };
        
        if (marks) {
            const m = parseFloat(marks);
            if (!isNaN(m)) postMatch["programs.merit"] = { $lte: m };
        }

        const feeField = {};
        if (minFee) feeField.$gte = parseFloat(minFee) || 0;
        if (maxFee) feeField.$lte = parseFloat(maxFee) || 99999999;
        if (Object.keys(feeField).length > 0) {
            postMatch.$and = postMatch.$and || [];
            postMatch.$and.push({
                $or: [
                    { "programs.fee": feeField },
                    { "programs.semesterFee": feeField }
                ]
            });
        }

        const sortMap = {
            'ranking':    { ranking:  1 },
            'name':       { title:    1 },
        };
        const sort = sortMap[sortBy] || { ranking: 1 };

        const universities = await University.aggregate([
            { $match: initialMatch },
            {
                $lookup: {
                    from: 'programs',
                    localField: '_id',
                    foreignField: 'universityId',
                    as: 'programs'
                }
            },
            { $match: postMatch },
            { $sort: sort }
        ]);

        universities.forEach(u => {
            if (!u.map) u.map = {};
            const generatedAddress = `${u.city || ''}, ${u.province || ''}`.replace(/^, |, $/g, '') || "Location not specified";
            u.address = u.address || u.map.address || generatedAddress;
            u.map.address = u.address;

            // Populate top-level fields from programs for legacy UI compatibility
            if (u.programs && u.programs.length > 0) {
                const activePrograms = u.programs.filter(p => p.status === 'active');
                if (activePrograms.length > 0) {
                    // Find minimum merit among active programs
                    const validMerits = activePrograms.map(p => p.merit).filter(m => m > 0);
                    if (validMerits.length > 0) {
                        u.merit = Math.min(...validMerits);
                    }

                    // Pick a representative fee
                    const annualFees = activePrograms.map(p => p.fee).filter(f => f > 0);
                    const semesterFees = activePrograms.map(p => p.semesterFee).filter(f => f > 0);
                    
                    if (annualFees.length > 0) {
                        u.fee = Math.min(...annualFees);
                        u.feeType = "Annual Fee";
                    } else if (semesterFees.length > 0) {
                        u.semesterFee = Math.min(...semesterFees);
                        u.fee = u.semesterFee; // Map to .fee for simple cards
                        u.feeType = "Semester Fee";
                    }

                    // Pick representative metadata
                    if (!u.discipline) u.discipline = activePrograms[0].discipline;
                    if (!u.degree) u.degree = activePrograms[0].degree;
                    if (!u.deadline) u.deadline = activePrograms[0].deadline;
                }
            }
        });

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
        const university = await University.findOne({ _id: req.params.id, ...buildPublicApprovalQuery('universities') }).lean();

        if (!university) {
            return res.status(404).json({
                success: false,
                error: 'University not found'
            });
        }

        // Fetch associated programs
        const Program = require('../models/ProgramSchema');
        const programs = await Program.find({ universityId: university._id, status: 'active' }).lean();
        university.programs = programs;

        if (!university.map) university.map = {};
        const generatedAddress = `${university.city || ''}, ${university.province || ''}`.replace(/^, |, $/g, '') || "Location not specified";
        university.address = university.address || university.map.address || generatedAddress;
        university.map.address = university.address;

        // Populate top-level fields for compatibility
        if (programs.length > 0) {
            const validMerits = programs.map(p => p.merit).filter(m => m > 0);
            if (validMerits.length > 0) university.merit = Math.min(...validMerits);

            const annualFees = programs.map(p => p.fee).filter(f => f > 0);
            const semesterFees = programs.map(p => p.semesterFee).filter(f => f > 0);
            
            if (annualFees.length > 0) {
                university.fee = Math.min(...annualFees);
                university.feeType = "Annual Fee";
            } else if (semesterFees.length > 0) {
                university.semesterFee = Math.min(...semesterFees);
                university.fee = university.semesterFee;
                university.feeType = "Semester Fee";
            }

            if (!university.discipline) university.discipline = programs[0].discipline;
            if (!university.degree) university.degree = programs[0].degree;
            if (!university.deadline) university.deadline = programs[0].deadline;
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

const STANDARD_DISCIPLINES = [
    "Medical", "Medicine (MBBS)", "Dentistry (BDS)", "Pharmacy", "Nursing",
    "Engineering", "Software Engineering", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Mechatronics",
    "Computer Science", "Data Science", "Artificial Intelligence", "Cyber Security", "Information Technology",
    "Business", "Business Administration (BBA)", "Accounting and Finance", "Economics",
    "Law", "Law (LLB)", "Arts", "Fine Arts", "Media Studies", "Psychology", "English Literature",
    "Sciences", "Social Sciences", "Agriculture", "Architecture", "Education", "Environmental Science",
    "Mathematics", "Physics", "Chemistry", "Biotechnology"
];

// Get live stats for hero section (no caching — always fresh from DB)
const getLiveStats = async (req, res) => {
    try {
        const Program = require('../models/ProgramSchema');
        const [total, programAgg, cityAgg, provinceAgg, totalPrograms] = await Promise.all([
            University.countDocuments(buildPublicApprovalQuery('universities')),
            Program.distinct('discipline'),
            University.distinct('city'),
            University.distinct('province'),
            Program.countDocuments({ status: 'active' })
        ]);

        // Merge standard disciplines with what's in DB
        const allDisciplines = Array.from(new Set([...STANDARD_DISCIPLINES, ...programAgg]))
            .filter(Boolean)
            .sort();

        res.status(200).json({
            success: true,
            stats: {
                totalUniversities: total,
                totalPrograms: totalPrograms,
                totalCities: cityAgg.length,
                totalProvinces: provinceAgg.length,
            },
            filters: {
                cities: cityAgg.filter(Boolean).sort(),
                disciplines: allDisciplines,
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
