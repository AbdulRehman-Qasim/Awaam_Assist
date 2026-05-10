/**
 * hospitalAdminController.js
 * Handles hospital portal actions for Hospital Admins (non-super-admin).
 * Fully backward compatible with legacy field names.
 */

'use strict';

const Hospital = require('../models/HospitalSchema');

// ── Serializer ────────────────────────────────────────────────────────────────

const mapHospital = (doc) => ({
  _id:          doc._id,
  SerialNum:    doc.SerialNum,
  City:         doc.City,
  Tehsil:       doc.Tehsil,
  hospitalName: doc['Hospital Name'],
  category:     doc.Cateogry,
  website:      doc.website       || '',
  contactNumber: doc.contactNumber || '',
  email:        doc.email         || '',
  address:      doc.address       || '',
  description:  doc.description   || '',
  hospitalImage: doc.hospitalImage || '',
  emergencyServices: doc.emergencyServices || false,
  bedCapacity:  doc.bedCapacity   || 0,
  // Flat treatment fields (legacy)
  treatmentCost: doc.treatmentCost || 0,
  availability:  doc.availability  || 'Available',
  info:          doc.info          || '',
  // Enriched intelligence fields (root)
  treatmentSpecialty: doc.treatmentSpecialty || doc.treatmentName || doc.specialization || doc.info || '',
  treatmentName: doc.treatmentName || '',
  description:   doc.description   || '',
  supportFeatures: doc.supportFeatures || [],
  waitingTime:   doc.waitingTime   || 'Immediate',
  severitySupport: doc.severitySupport || 'Basic',
  appointmentRequired: doc.appointmentRequired !== undefined ? doc.appointmentRequired : true,
  // Meta
  treatments:   doc.treatments    || [],
  tags:         doc.tags          || [],
  rating:       doc.rating        || 0,
  totalReviews: doc.totalReviews  || 0,
  isVerified:   doc.isVerified    || false,
  createdAt:    doc.createdAt,
  updatedAt:    doc.updatedAt,
});

// ── Query builder ─────────────────────────────────────────────────────────────

const buildOwnedHospitalsQuery = (hospitalAdmin) => ({
  $or: [
    { createdByHospitalAdmin: hospitalAdmin._id },
    {
      'Hospital Name': new RegExp(
        `^${hospitalAdmin.hospital_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i'
      ),
      $or: [
        { createdByHospitalAdmin: null },
        { createdByHospitalAdmin: { $exists: false } },
      ],
    },
  ],
});

// ── Handlers ──────────────────────────────────────────────────────────────────

const getOwnHospitals = async (req, res) => {
  try {
    const { q } = req.query;
    const query = buildOwnedHospitalsQuery(req.hospitalAdmin);

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$and = [
        {
          $or: [
            { 'Hospital Name': regex },
            { City: regex },
            { Tehsil: regex },
            { Cateogry: regex },
            { description: regex },
            { 'treatments.treatmentName': regex },
            { 'treatments.specialization': regex },
          ],
        },
      ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: hospitals.map(mapHospital) });
  } catch (error) {
    console.error('getOwnHospitals error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createOwnHospital = async (req, res) => {
  try {
    const {
      SerialNum, City, Tehsil, hospitalName, category,
      website, contactNumber, email, address, description,
      hospitalImage, emergencyServices, bedCapacity,
      treatmentCost, availability, info,
      supportFeatures, waitingTime, severitySupport, appointmentRequired, treatmentName, treatmentSpecialty
    } = req.body;

    const existingHospitals = await Hospital.countDocuments(
      buildOwnedHospitalsQuery(req.hospitalAdmin)
    );
    if (existingHospitals > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hospital profile already exists for this hospital admin',
      });
    }

    if (!City || !Tehsil || !hospitalName || !category) {
      return res.status(400).json({
        success: false,
        message: 'City, Tehsil, hospitalName and category are required',
      });
    }

    let serial = SerialNum;
    if (!serial) {
      const count = await Hospital.countDocuments();
      serial = count + 1;
    }

    const created = await Hospital.create({
      SerialNum:             serial,
      City,
      Tehsil,
      'Hospital Name':       hospitalName,
      Cateogry:              category,
      website:               website               || '',
      contactNumber:         contactNumber         || '',
      email:                 email                 || '',
      address:               address               || '',
      description:           description           || '',
      hospitalImage:         hospitalImage         || '',
      emergencyServices:     Boolean(emergencyServices),
      bedCapacity:           Number(bedCapacity)   || 0,
      treatmentCost:         Number(treatmentCost) || 0,
      availability:          availability          || 'Available',
      info:                  info                  || '',
      description:           description           || '',
      supportFeatures:       supportFeatures       || [],
      waitingTime:           waitingTime           || 'Immediate',
      severitySupport:       severitySupport       || 'Basic',
      appointmentRequired:   appointmentRequired !== undefined ? Boolean(appointmentRequired) : true,
      treatmentName:         treatmentName         || '',
      treatmentSpecialty:    treatmentSpecialty    || treatmentName || '',
      createdByHospitalAdmin: req.hospitalAdmin._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital added successfully',
      data: mapHospital(created),
    });
  } catch (error) {
    console.error('createOwnHospital error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOwnHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Hospital.findOne({
      _id: id,
      ...buildOwnedHospitalsQuery(req.hospitalAdmin),
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Claim ownership for legacy records
    if (!existing.createdByHospitalAdmin) {
      existing.createdByHospitalAdmin = req.hospitalAdmin._id;
    }

    const body = req.body;
    const fields = {
      SerialNum:         'SerialNum',
      City:              'City',
      Tehsil:            'Tehsil',
      hospitalName:      'Hospital Name',
      category:          'Cateogry',
      website:           'website',
      contactNumber:     'contactNumber',
      email:             'email',
      address:           'address',
      description:       'description',
      hospitalImage:     'hospitalImage',
      treatmentCost:     'treatmentCost',
      availability:      'availability',
      info:              'info',
      description:       'description',
      supportFeatures:   'supportFeatures',
      waitingTime:       'waitingTime',
      severitySupport:   'severitySupport',
      appointmentRequired: 'appointmentRequired',
      treatmentName:     'treatmentName',
      treatmentSpecialty: 'treatmentSpecialty',
    };

    Object.entries(fields).forEach(([bodyKey, schemaKey]) => {
      if (body[bodyKey] !== undefined) existing[schemaKey] = body[bodyKey];
    });

    if (body.emergencyServices !== undefined) existing.emergencyServices = Boolean(body.emergencyServices);
    if (body.bedCapacity !== undefined) existing.bedCapacity = Number(body.bedCapacity);

    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: mapHospital(existing),
    });
  } catch (error) {
    console.error('updateOwnHospital error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteOwnHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Hospital.findOneAndDelete({
      _id: id,
      createdByHospitalAdmin: req.hospitalAdmin._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    return res.status(200).json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('deleteOwnHospital error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOwnHospitalDashboardStats = async (req, res) => {
  try {
    const query = buildOwnedHospitalsQuery(req.hospitalAdmin);
    const hospitals = await Hospital.find(query);

    const citySet     = new Set(hospitals.map((h) => h.City).filter(Boolean));
    const categorySet = new Set(hospitals.map((h) => h.Cateogry).filter(Boolean));
    const totalTreatments = hospitals.reduce((sum, h) => sum + (h.treatments?.length || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalHospitals:   hospitals.length,
          totalCities:      citySet.size,
          totalCategories:  categorySet.size,
          totalTreatments,
        },
        recentHospitals: hospitals.slice(0, 8).map(mapHospital),
      },
    });
  } catch (error) {
    console.error('getOwnHospitalDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Treatment management for hospital admins ──────────────────────────────────

const addOwnTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({
      _id: id,
      ...buildOwnedHospitalsQuery(req.hospitalAdmin),
    });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const treatment = {
      treatmentName:    req.body.treatmentName    || '',
      specialization:   req.body.specialization   || '',
      treatmentCost:    Number(req.body.treatmentCost) || 0,
      costRange:        req.body.costRange         || { min: 0, max: 0 },
      availability:     req.body.availability      || 'Available',
      requirements:     req.body.requirements      || '',
      estimatedWaitTime: req.body.estimatedWaitTime || '',
      doctorCount:      Number(req.body.doctorCount) || 0,
      isEmergency:      Boolean(req.body.isEmergency),
      // New fields
      description:      req.body.description       || '',
      supportFeatures:  req.body.supportFeatures    || [],
      waitingTime:      req.body.waitingTime       || 'Immediate',
      severitySupport:  req.body.severitySupport   || 'Basic',
      appointmentRequired: req.body.appointmentRequired !== undefined ? Boolean(req.body.appointmentRequired) : true,
    };

    hospital.treatments.push(treatment);

    // Keep flat treatmentCost in sync (cheapest treatment)
    const cheapest = hospital.getCheapestTreatment();
    if (cheapest) hospital.treatmentCost = cheapest.treatmentCost;

    // Auto-tag
    const spec = treatment.specialization?.toLowerCase();
    if (spec && !hospital.tags.includes(spec)) hospital.tags.push(spec);

    await hospital.save();

    return res.status(201).json({
      success: true,
      message: 'Treatment added successfully',
      data: mapHospital(hospital),
    });
  } catch (error) {
    console.error('addOwnTreatment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOwnTreatment = async (req, res) => {
  try {
    const { id, treatmentId } = req.params;
    const hospital = await Hospital.findOne({
      _id: id,
      ...buildOwnedHospitalsQuery(req.hospitalAdmin),
    });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const treatment = hospital.treatments.id(treatmentId);
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment not found' });
    }

    ['treatmentName', 'specialization', 'treatmentCost', 'costRange',
     'availability', 'requirements', 'estimatedWaitTime', 'doctorCount', 'isEmergency',
     'description', 'supportFeatures', 'waitingTime', 'severitySupport', 'appointmentRequired']
      .forEach((f) => { if (req.body[f] !== undefined) treatment[f] = req.body[f]; });

    const cheapest = hospital.getCheapestTreatment();
    if (cheapest) hospital.treatmentCost = cheapest.treatmentCost;

    await hospital.save();
    return res.status(200).json({ success: true, message: 'Treatment updated', data: mapHospital(hospital) });
  } catch (error) {
    console.error('updateOwnTreatment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteOwnTreatment = async (req, res) => {
  try {
    const { id, treatmentId } = req.params;
    const hospital = await Hospital.findOne({
      _id: id,
      ...buildOwnedHospitalsQuery(req.hospitalAdmin),
    });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital.treatments.pull({ _id: treatmentId });
    const cheapest = hospital.getCheapestTreatment();
    hospital.treatmentCost = cheapest ? cheapest.treatmentCost : 0;

    await hospital.save();
    return res.status(200).json({ success: true, message: 'Treatment deleted', data: mapHospital(hospital) });
  } catch (error) {
    console.error('deleteOwnTreatment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getOwnHospitals,
  createOwnHospital,
  updateOwnHospital,
  deleteOwnHospital,
  getOwnHospitalDashboardStats,
  addOwnTreatment,
  updateOwnTreatment,
  deleteOwnTreatment,
};
