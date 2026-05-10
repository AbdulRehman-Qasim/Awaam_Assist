/**
 * hospitalController.js — Hospital CRUD + Recommendation API
 *
 * All legacy field names (City, Tehsil, 'Hospital Name', Cateogry) are
 * preserved for backward compatibility. New fields are additive only.
 */

'use strict';

const Hospital = require('../models/HospitalSchema');
const { buildPublicApprovalQuery } = require('../modules/superAdmin/services/superAdminService');

// ── URL helpers ──────────────────────────────────────────────────────────────

const DUCKDUCKGO_RESULT_REGEX = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/i;

const buildHospitalLink = (doc) => {
  const preferred =
    doc.website || doc.hospitalWebsite || doc.hospitalLink || doc.link || doc.url;
  if (preferred) return preferred;

  const q = [doc['Hospital Name'], doc.City, doc.Tehsil, 'official website', 'Pakistan']
    .filter(Boolean)
    .join(' ');
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}&ia=web`;
};

const extractDuckDuckGoResultUrl = (html) => {
  const match = html.match(DUCKDUCKGO_RESULT_REGEX);
  const decoded = match?.[1]?.replaceAll('&amp;', '&')?.trim();
  if (!decoded) return null;
  return decoded.startsWith('//') ? `https:${decoded}` : decoded;
};

const resolveHospitalWebsiteUrl = async (doc) => {
  const preferred =
    doc.website || doc.hospitalWebsite || doc.hospitalLink || doc.link || doc.url;
  if (preferred) return preferred;

  const q = [doc['Hospital Name'], doc.City, doc.Tehsil, 'official website', 'Pakistan']
    .filter(Boolean)
    .join(' ');

  const response = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  if (!response.ok) throw new Error(`DuckDuckGo lookup failed: ${response.status}`);

  const html = await response.text();
  const resolved = extractDuckDuckGoResultUrl(html);
  if (!resolved) throw new Error('No website result found');
  return resolved;
};

const persistHospitalWebsiteIfMissing = async (id, website) => {
  if (!website) return;
  await Hospital.findByIdAndUpdate(id, { $set: { website } });
};

// ── Serializers ───────────────────────────────────────────────────────────────

/**
 * Full public-facing shape — includes all enriched fields.
 * The frontend HospitalCard already reads the legacy keys so we keep them.
 */
const toPublicHospital = (doc) => ({
  _id: doc._id,
  SerialNum: doc.SerialNum,
  // Legacy keys (frontend reads these)
  City:          doc.City,
  Tehsil:        doc.Tehsil,
  'Hospital Name': doc['Hospital Name'],
  Cateogry:      doc.Cateogry,
  // Normalized aliases (used by new components)
  hospitalName:  doc['Hospital Name'],
  category:      doc.Cateogry,
  // Contact & web
  website:       doc.website || '',
  contactNumber: doc.contactNumber || '',
  email:         doc.email || '',
  address:       doc.address || '',
  hospitalLink:  buildHospitalLink(doc),
  // Profile
  description:   doc.description || '',
  hospitalImage: doc.hospitalImage || '',
  emergencyServices: doc.emergencyServices || false,
  bedCapacity:   doc.bedCapacity || 0,
  // Quality
  rating:        doc.rating || 0,
  totalReviews:  doc.totalReviews || 0,
  isVerified:    doc.isVerified || false,
  // Treatment flat fields (backward compat)
  treatmentCost: doc.treatmentCost || 0,
  availability:  doc.availability || 'Available',
  info:          doc.info || '',
  // Enriched data
  treatmentSpecialty: doc.treatmentSpecialty || doc.treatmentName || doc.specialization || doc.info || '',
  treatmentName: doc.treatmentName || '',
  description:   doc.description   || '',
  supportFeatures: doc.supportFeatures || [],
  waitingTime:   doc.waitingTime   || 'Immediate',
  severitySupport: doc.severitySupport || 'Basic',
  appointmentRequired: doc.appointmentRequired !== undefined ? doc.appointmentRequired : true,
  treatments:    doc.treatments || [],
  tags:          doc.tags || [],
  status:        doc.status || 'approved',
  createdAt:     doc.createdAt,
  updatedAt:     doc.updatedAt,
});

/** Slim admin shape with all editable fields */
const toAdminHospital = (doc) => ({
  ...toPublicHospital(doc),
  recommendationScore: doc.recommendationScore || 0,
  createdByHospitalAdmin: doc.createdByHospitalAdmin,
});

/** Parse the shared body payload for create / update */
const parseHospitalPayload = (body) => ({
  SerialNum:     body.SerialNum,
  City:          body.City,
  Tehsil:        body.Tehsil,
  hospitalName:  body.hospitalName || body['Hospital Name'],
  category:      body.category    || body.Cateogry,
  // Flat treatment
  treatmentCost: body.treatmentCost !== undefined ? Number(body.treatmentCost) : undefined,
  availability:  body.availability,
  info:          body.info,
  // Contact & web
  website:       body.website || body.hospitalWebsite || '',
  contactNumber: body.contactNumber || '',
  email:         body.email || '',
  address:       body.address || '',
  // Profile
  description:   body.description || '',
  hospitalImage: body.hospitalImage || '',
  emergencyServices: body.emergencyServices !== undefined ? Boolean(body.emergencyServices) : undefined,
  bedCapacity:   body.bedCapacity !== undefined ? Number(body.bedCapacity) : undefined,
  // Quality
  rating:        body.rating !== undefined ? Number(body.rating) : undefined,
  isVerified:    body.isVerified !== undefined ? Boolean(body.isVerified) : undefined,
  // Enriched
  treatments:    Array.isArray(body.treatments) ? body.treatments : undefined,
  tags:          Array.isArray(body.tags) ? body.tags : undefined,
  status:        body.status,
  // Enriched intelligence metadata
  treatmentSpecialty: body.treatmentSpecialty || body.treatmentName,
  treatmentName:      body.treatmentName,
  supportFeatures:    body.supportFeatures,
  waitingTime:        body.waitingTime,
  severitySupport:    body.severitySupport,
  appointmentRequired: body.appointmentRequired,
});

// ── Public routes ─────────────────────────────────────────────────────────────

/** GET /hospitals — list with optional city / category / search filters */
const getAllHospitals = async (req, res) => {
  try {
    const { city, category, q, availability, maxCost, treatmentType } = req.query;
    let query = buildPublicApprovalQuery('hospitals', {});

    if (city && city !== 'All Cities') query.City = new RegExp(city, 'i');
    if (category && category !== 'All Categories') query.Cateogry = category;

    // Cost filter (flat field)
    if (maxCost && Number(maxCost) > 0) {
      query.$or = [
        { treatmentCost: { $lte: Number(maxCost) } },
        { 'treatments.treatmentCost': { $lte: Number(maxCost) } },
      ];
    }

    // Availability filter
    if (availability && availability !== 'all') {
      query.$or = query.$or || [];
      query.$or.push(
        { availability },
        { 'treatments.availability': availability }
      );
    }

    // Treatment type / specialization
    if (treatmentType) {
      const tr = new RegExp(treatmentType, 'i');
      query.$or = query.$or || [];
      query.$or.push(
        { tags: tr },
        { 'treatments.specialization': tr },
        { 'treatments.treatmentName': tr }
      );
    }

    // Full-text search
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { 'Hospital Name': regex },
        { hospitalName: regex },
        { City: regex },
        { Tehsil: regex },
        { Cateogry: regex },
        { category: regex },
        { description: regex },
        { treatmentSpecialty: regex },
        { treatmentName: regex },
        { tags: regex },
        { 'treatments.treatmentName': regex },
        { 'treatments.specialization': regex },
      ];
    }

    const hospitals = await Hospital.find(query)
      .sort({ rating: -1, recommendationScore: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: hospitals.map(toPublicHospital),
      total: hospitals.length,
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** GET /hospitals/filters — unique cities, categories, specializations */
const getHospitalFilters = async (req, res) => {
  try {
    const approvedQuery = buildPublicApprovalQuery('hospitals');
    const [cities, categories, specializations] = await Promise.all([
      Hospital.distinct('City', approvedQuery),
      Hospital.distinct('Cateogry', approvedQuery),
      Hospital.distinct('treatments.specialization', approvedQuery),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cities:          [...cities].filter(Boolean).sort((a, b) => a.localeCompare(b)),
        categories:      [...categories].filter(Boolean).sort((a, b) => a.localeCompare(b)),
        specializations: [...specializations].filter(Boolean).sort((a, b) => a.localeCompare(b)),
      },
    });
  } catch (error) {
    console.error('Error fetching hospital filters:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** GET /hospitals/:id/website */
const getHospitalWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({
      _id: id,
      ...buildPublicApprovalQuery('hospitals'),
    }).lean();

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const website = await resolveHospitalWebsiteUrl(hospital);
    if (!hospital.website && website) {
      await persistHospitalWebsiteIfMissing(hospital._id, website);
    }

    return res.status(200).json({ success: true, data: { website } });
  } catch (error) {
    console.error('Error resolving hospital website:', error);
    return res.status(500).json({ success: false, message: 'Unable to resolve hospital website' });
  }
};

// ── Admin routes ──────────────────────────────────────────────────────────────

/** GET /admin/hospitals */
const getAllHospitalsAdmin = async (req, res) => {
  try {
    const { city, category, q } = req.query;
    const query = {};

    if (req.admin && req.admin.role !== 'super_admin') {
      query.$or = [{ createdByHospitalAdmin: req.admin.id }];
      if (req.admin.managed_entity_id) {
        query.$or.push({ _id: req.admin.managed_entity_id });
      }
    }

    if (city && city !== 'all') query.City = city;
    if (category && category !== 'all') query.Cateogry = category;

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { 'Hospital Name': regex },
        { Tehsil: regex },
        { City: regex },
        { Cateogry: regex },
        { description: regex },
        { 'treatments.treatmentName': regex },
      ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: hospitals.map(toAdminHospital) });
  } catch (error) {
    console.error('Error fetching admin hospitals:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** POST /admin/hospitals */
const createHospital = async (req, res) => {
  try {
    console.log("DEBUG [createHospital] Payload received:", req.body);
    const payload = parseHospitalPayload(req.body);
    console.log("DEBUG [createHospital] Parsed payload:", payload);

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

    const doc = {
      SerialNum:        serial,
      City:             payload.City,
      Tehsil:           payload.Tehsil,
      'Hospital Name':  payload.hospitalName,
      Cateogry:         payload.category,
      website:          payload.website,
      contactNumber:    payload.contactNumber,
      email:            payload.email,
      address:          payload.address,
      description:      payload.description,
      hospitalImage:    payload.hospitalImage,
      treatmentCost:    payload.treatmentCost || 0,
      availability:     payload.availability || 'Available',
      info:             payload.info || '',
      status:           payload.status || 'approved',
      createdByHospitalAdmin: req.admin?.id || null,
      // Direct assignment for intelligence fields
      treatmentSpecialty: payload.treatmentSpecialty || '',
      treatmentName:      payload.treatmentName || '',
      supportFeatures:    payload.supportFeatures || [],
      waitingTime:        payload.waitingTime || 'Immediate',
      severitySupport:    payload.severitySupport || 'Basic',
      appointmentRequired: payload.appointmentRequired !== undefined ? payload.appointmentRequired : true,
      description:        payload.description || '',
    };

    if (payload.emergencyServices !== undefined) doc.emergencyServices = payload.emergencyServices;
    if (payload.bedCapacity !== undefined) doc.bedCapacity = payload.bedCapacity;
    if (payload.rating !== undefined) doc.rating = payload.rating;
    if (payload.isVerified !== undefined) doc.isVerified = payload.isVerified;
    if (payload.treatments) doc.treatments = payload.treatments;
    if (payload.tags) doc.tags = payload.tags;

    // Add intelligence metadata
    if (payload.treatmentSpecialty) doc.treatmentSpecialty = payload.treatmentSpecialty;
    if (payload.treatmentName)      doc.treatmentName      = payload.treatmentName;
    if (payload.supportFeatures)    doc.supportFeatures    = payload.supportFeatures;
    if (payload.waitingTime)        doc.waitingTime        = payload.waitingTime;
    if (payload.severitySupport)    doc.severitySupport    = payload.severitySupport;
    if (payload.appointmentRequired !== undefined) doc.appointmentRequired = payload.appointmentRequired;

    const created = await Hospital.create(doc);
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

/** PUT /admin/hospitals/:id */
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DEBUG [updateHospital] ID: ${id}, Payload:`, req.body);
    const payload = parseHospitalPayload(req.body);

    const hospitalToUpdate = await Hospital.findById(id);
    if (!hospitalToUpdate) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (req.admin.role !== 'super_admin') {
      const isOwner   = hospitalToUpdate.createdByHospitalAdmin?.toString() === req.admin.id;
      const isManager = hospitalToUpdate._id.toString() === req.admin.managed_entity_id?.toString();
      if (!isOwner && !isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this hospital' });
      }
    }

    const updates = {};
    // Legacy fields
    if (payload.SerialNum   !== undefined) updates.SerialNum          = payload.SerialNum;
    if (payload.City        !== undefined) updates.City               = payload.City;
    if (payload.Tehsil      !== undefined) updates.Tehsil             = payload.Tehsil;
    if (payload.hospitalName !== undefined) updates['Hospital Name']  = payload.hospitalName;
    if (payload.category    !== undefined) updates.Cateogry           = payload.category;
    if (payload.website     !== undefined) updates.website            = payload.website;
    if (payload.treatmentCost !== undefined) updates.treatmentCost    = payload.treatmentCost;
    if (payload.availability !== undefined) updates.availability      = payload.availability;
    if (payload.info        !== undefined) updates.info               = payload.info;
    if (payload.status      !== undefined) updates.status             = payload.status;
    // Extended fields
    if (payload.contactNumber  !== undefined) updates.contactNumber   = payload.contactNumber;
    if (payload.email          !== undefined) updates.email           = payload.email;
    if (payload.address        !== undefined) updates.address         = payload.address;
    if (payload.description    !== undefined) updates.description     = payload.description;
    if (payload.hospitalImage  !== undefined) updates.hospitalImage   = payload.hospitalImage;
    if (payload.emergencyServices !== undefined) updates.emergencyServices = payload.emergencyServices;
    if (payload.bedCapacity    !== undefined) updates.bedCapacity     = payload.bedCapacity;
    if (payload.rating         !== undefined) updates.rating          = payload.rating;
    if (payload.isVerified     !== undefined) updates.isVerified      = payload.isVerified;
    if (payload.treatments     !== undefined) updates.treatments      = payload.treatments;
    if (payload.tags           !== undefined) updates.tags            = payload.tags;

    // Intelligence metadata updates
    if (payload.treatmentSpecialty !== undefined) updates.treatmentSpecialty = payload.treatmentSpecialty;
    if (payload.treatmentName      !== undefined) updates.treatmentName      = payload.treatmentName;
    if (payload.supportFeatures    !== undefined) updates.supportFeatures    = payload.supportFeatures;
    if (payload.waitingTime        !== undefined) updates.waitingTime        = payload.waitingTime;
    if (payload.severitySupport    !== undefined) updates.severitySupport    = payload.severitySupport;
    if (payload.appointmentRequired !== undefined) updates.appointmentRequired = payload.appointmentRequired;

    const updated = await Hospital.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
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

/** DELETE /admin/hospitals/:id */
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalToDelete = await Hospital.findById(id);
    if (!hospitalToDelete) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (req.admin.role !== 'super_admin') {
      const isOwner   = hospitalToDelete.createdByHospitalAdmin?.toString() === req.admin.id;
      const isManager = hospitalToDelete._id.toString() === req.admin.managed_entity_id?.toString();
      if (!isOwner && !isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this hospital' });
      }
    }

    await Hospital.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** GET /admin/hospitals/dashboard */
const getHospitalDashboardStats = async (req, res) => {
  try {
    let matchQuery = {};
    console.log('DEBUG Hospital Dashboard — admin:', req.admin ? { id: req.admin._id, role: req.admin.role } : 'none');

    if (req.admin && req.admin.role !== 'super_admin') {
      matchQuery.$or = [{ createdByHospitalAdmin: req.admin._id }];
      if (req.admin.managed_entity_id) {
        matchQuery.$or.push({ _id: req.admin.managed_entity_id });
      }
    }

    const [totalHospitals, cities, categories, recentHospitals, treatmentCount] = await Promise.all([
      Hospital.countDocuments(matchQuery),
      Hospital.distinct('City', matchQuery),
      Hospital.distinct('Cateogry', matchQuery),
      Hospital.find(matchQuery).sort({ createdAt: -1 }).limit(8),
      Hospital.aggregate([
        { $match: matchQuery },
        { $project: { treatmentCount: { $size: { $ifNull: ['$treatments', []] } } } },
        { $group: { _id: null, total: { $sum: '$treatmentCount' } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalHospitals,
          totalCities:      cities.length,
          totalCategories:  categories.length,
          totalTreatments:  treatmentCount[0]?.total || 0,
        },
        recentHospitals: recentHospitals.map(toAdminHospital),
      },
    });
  } catch (error) {
    console.error('Error fetching hospital dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── Treatment CRUD endpoints ──────────────────────────────────────────────────

/** POST /admin/hospitals/:id/treatments — add a treatment to a hospital */
const addTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (req.admin?.role !== 'super_admin') {
      const isOwner   = hospital.createdByHospitalAdmin?.toString() === req.admin.id;
      const isManager = hospital._id.toString() === req.admin.managed_entity_id?.toString();
      if (!isOwner && !isManager) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const treatment = {
      treatmentName:    req.body.treatmentName   || '',
      specialization:   req.body.specialization  || '',
      treatmentCost:    Number(req.body.treatmentCost) || 0,
      costRange:        req.body.costRange        || { min: 0, max: 0 },
      availability:     req.body.availability    || 'Available',
      requirements:     req.body.requirements    || '',
      estimatedWaitTime: req.body.estimatedWaitTime || '',
      doctorCount:      Number(req.body.doctorCount) || 0,
      isEmergency:      Boolean(req.body.isEmergency),
    };

    hospital.treatments.push(treatment);

    // Sync flat treatmentCost to cheapest treatment for backward compat
    const cheapest = hospital.getCheapestTreatment();
    if (cheapest) hospital.treatmentCost = cheapest.treatmentCost;

    // Auto-tag from specialization
    if (treatment.specialization && !hospital.tags.includes(treatment.specialization.toLowerCase())) {
      hospital.tags.push(treatment.specialization.toLowerCase());
    }

    await hospital.save();

    return res.status(201).json({
      success: true,
      message: 'Treatment added successfully',
      data: toAdminHospital(hospital),
    });
  } catch (error) {
    console.error('Error adding treatment:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** PUT /admin/hospitals/:id/treatments/:treatmentId */
const updateTreatment = async (req, res) => {
  try {
    const { id, treatmentId } = req.params;
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const treatment = hospital.treatments.id(treatmentId);
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    // Apply updates
    const fields = ['treatmentName', 'specialization', 'treatmentCost', 'costRange',
                    'availability', 'requirements', 'estimatedWaitTime', 'doctorCount', 'isEmergency'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) treatment[f] = req.body[f];
    });

    // Re-sync flat field
    const cheapest = hospital.getCheapestTreatment();
    if (cheapest) hospital.treatmentCost = cheapest.treatmentCost;

    await hospital.save();
    return res.status(200).json({ success: true, message: 'Treatment updated', data: toAdminHospital(hospital) });
  } catch (error) {
    console.error('Error updating treatment:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/** DELETE /admin/hospitals/:id/treatments/:treatmentId */
const deleteTreatment = async (req, res) => {
  try {
    const { id, treatmentId } = req.params;
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital.treatments.pull({ _id: treatmentId });

    const cheapest = hospital.getCheapestTreatment();
    hospital.treatmentCost = cheapest ? cheapest.treatmentCost : 0;

    await hospital.save();
    return res.status(200).json({ success: true, message: 'Treatment deleted', data: toAdminHospital(hospital) });
  } catch (error) {
    console.error('Error deleting treatment:', error);
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
  addTreatment,
  updateTreatment,
  deleteTreatment,
};
