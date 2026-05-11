const University = require('../models/UniversitySchema');

/**
 * Admin endpoint to create a new University document.
 * Expects JSON body with required fields: title, city, province, degree, discipline.
 * Optional fields will be inserted as-is.
 */
const createUniversity = async (req, res) => {
  try {
    const data = req.body || {};
    console.log("📥 Incoming university payload:", JSON.stringify(data, null, 2));

    // Basic validation – province & degree are optional in UI
    const required = ['title', 'city', 'discipline'];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) {
      console.log("❌ Missing required fields:", missing);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // Fill optional fields that are required by schema
    if (!data.province || data.province === "") {
      data.province = "Unknown";
    }
    if (!data.degree || data.degree === "") {
      data.degree = "N/A";
    }

    // Map feeType to schema enum if necessary
    if (data.feeType === "annual") data.feeType = "Annual Fee";
    if (data.feeType === "semester") data.feeType = "Semester Fee";

    const hasAnnualFee = typeof data.fee === 'number' && data.fee > 0;
    const hasSemesterFee = typeof data.semesterFee === 'number' && data.semesterFee > 0;

    if (hasAnnualFee && hasSemesterFee) {
      return res.status(400).json({
        success: false,
        message: 'Provide either annual fee or semester fee, not both.',
      });
    }

    if (!hasAnnualFee && !hasSemesterFee) {
      return res.status(400).json({
        success: false,
        message: 'Either annual fee or semester fee is required.',
      });
    }

    // Find existing university by title and city
    let university = await University.findOne({
      title: { $regex: new RegExp(`^${data.title}$`, 'i') },
      city: { $regex: new RegExp(`^${data.city}$`, 'i') }
    });

    if (!university) {
      // Auto-approve if created by an authorized admin
      data.status = 'approved';

      // Ensure an id string (frontend may already send)
      if (!data.id) {
        data.id = `pk${Date.now()}`; // simple fallback id
      }

      // Set owner if created by an admin
      if (req.admin) {
        data.createdByHospitalAdmin = req.admin._id || req.admin.id;
      }

      university = await University.create(data);
      console.log("✅ Saved base university in MongoDB with _id:", university._id?.toString());
    } else {
      console.log("ℹ️ University already exists, attaching program instead of duplicating:", university._id?.toString());
    }

    // Now handle the discipline/program part
    if (data.discipline && data.discipline.toLowerCase() !== 'general' && data.discipline.trim() !== '') {
      const Program = require('../models/ProgramSchema');
      
      const programData = {
        universityId: university._id,
        discipline: data.discipline,
        degree: data.degree || 'N/A',
        merit: data.merit || 0,
        fee: data.fee || 0,
        semesterFee: data.semesterFee || 0,
        feeType: data.feeType || 'Annual Fee',
        description: data.description || '',
        deadline: data.deadline || '',
        status: 'active'
      };

      await Program.findOneAndUpdate(
        { universityId: university._id, discipline: data.discipline, degree: data.degree || 'N/A' },
        programData,
        { upsert: true, new: true }
      );
      console.log("✅ Saved program for university");
    }

    return res.status(201).json({ success: true, university });
  } catch (error) {
    console.error('Error creating university/program:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating university/program',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { createUniversity };
