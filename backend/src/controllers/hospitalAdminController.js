const Hospital = require('../models/HospitalSchema');

const mapHospital = (hospitalDoc) => ({
  _id: hospitalDoc._id,
  SerialNum: hospitalDoc.SerialNum,
  City: hospitalDoc.City,
  Tehsil: hospitalDoc.Tehsil,
  hospitalName: hospitalDoc['Hospital Name'],
  category: hospitalDoc.Cateogry,
  website: hospitalDoc.website || '',
  createdAt: hospitalDoc.createdAt,
  updatedAt: hospitalDoc.updatedAt,
});

const buildOwnedHospitalsQuery = (hospitalAdmin) => ({
  $or: [
    { createdByHospitalAdmin: hospitalAdmin._id },
    {
      'Hospital Name': hospitalAdmin.hospital_name,
      $or: [
        { createdByHospitalAdmin: null },
        { createdByHospitalAdmin: { $exists: false } },
      ],
    },
  ],
});

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
          ],
        },
      ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: hospitals.map(mapHospital) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createOwnHospital = async (req, res) => {
  try {
    const { SerialNum, City, Tehsil, hospitalName, category } = req.body;

    const existingHospitals = await Hospital.countDocuments(buildOwnedHospitalsQuery(req.hospitalAdmin));
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
      SerialNum: serial,
      City,
      Tehsil,
      'Hospital Name': hospitalName,
      Cateogry: category,
      website: req.body.website || '',
      createdByHospitalAdmin: req.hospitalAdmin._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital added successfully',
      data: mapHospital(created),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOwnHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { SerialNum, City, Tehsil, hospitalName, category } = req.body;

    const existing = await Hospital.findOne({
      _id: id,
      ...buildOwnedHospitalsQuery(req.hospitalAdmin),
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (!existing.createdByHospitalAdmin) {
      existing.createdByHospitalAdmin = req.hospitalAdmin._id;
    }

    if (SerialNum !== undefined) existing.SerialNum = SerialNum;
    if (City !== undefined) existing.City = City;
    if (Tehsil !== undefined) existing.Tehsil = Tehsil;
    if (hospitalName !== undefined) existing['Hospital Name'] = hospitalName;
    if (category !== undefined) existing.Cateogry = category;
    if (req.body.website !== undefined) existing.website = req.body.website;

    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: mapHospital(existing),
    });
  } catch (error) {
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
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOwnHospitalDashboardStats = async (req, res) => {
  try {
    const hospitals = await Hospital.find(buildOwnedHospitalsQuery(req.hospitalAdmin));
    const citySet = new Set(hospitals.map((h) => h.City));
    const categorySet = new Set(hospitals.map((h) => h.Cateogry));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalHospitals: hospitals.length,
          totalCities: citySet.size,
          totalCategories: categorySet.size,
        },
        recentHospitals: hospitals.slice(0, 8).map(mapHospital),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getOwnHospitals,
  createOwnHospital,
  updateOwnHospital,
  deleteOwnHospital,
  getOwnHospitalDashboardStats,
};
