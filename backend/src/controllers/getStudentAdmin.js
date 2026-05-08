const University = require('../models/UniversitySchema');

/**
 * Fetch all universities for the admin company-management page.
 * This endpoint is protected by the adminAuthMiddleware (see server.js).
 *
 * Response shape expected by the frontend (CompanyManagementPage.tsx):
 * {
 *   success: true,
 *   universities: [ { ...UniversityDocument } ]
 * }
 */
const getStudentAdmin = async (req, res) => {
  try {
    // Pagination and filtering support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Strict data isolation:
    // Super admins see everything.
    // Module admins (education, scheme, hospital) ONLY see their managed entity OR entities they created.
    if (req.admin && req.admin.role !== 'super_admin') {
      const adminId = req.admin.id || req.admin._id;
      
      query.$or = [
        { createdByHospitalAdmin: adminId }
      ];

      if (req.admin.managed_entity_id) {
        query.$or.push({ _id: req.admin.managed_entity_id });
        // For module admins, hide the base institution profile row from "Your Programs".
        // They should only see actual programs they add/manage.
        query._id = { $ne: req.admin.managed_entity_id };
      }

      // If they have neither, they should see nothing
      if (!req.admin.managed_entity_id && query.$or.length === 1 && !query.$or[0].createdByHospitalAdmin) {
        return res.status(200).json({
          success: true,
          universities: [],
          pagination: { page, limit, total: 0, pages: 0 }
        });
      }
    }

    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { discipline: { $regex: search, $options: 'i' } }
        ]
      };
      
      // Combine with existing isolation query if present
      if (Object.keys(query).length > 0) {
        query = { $and: [query, searchFilter] };
      } else {
        query = searchFilter;
      }
    }

    // Get total count for pagination
    const total = await University.countDocuments(query);

    // Get paginated results
    const universities = await University.find(query)
      .select('id title city province discipline degree ranking merit fee semesterFee url status info contact web')
      .sort({ ranking: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      universities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching universities (admin):', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching universities',
      error: error.message,
    });
  }
};

module.exports = { getStudentAdmin };
