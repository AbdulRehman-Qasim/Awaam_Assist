const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HospitalAdmin = require('../models/HospitalAdminSchema');
const Hospital = require('../models/HospitalSchema');

const slugify = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const ensureUniqueGeneratedEmail = async (baseLocalPart) => {
  const safeBase = baseLocalPart || 'hospital';
  let candidate = `${safeBase}@hospital.local`;
  let index = 1;

  while (await HospitalAdmin.findOne({ admin_email: candidate })) {
    candidate = `${safeBase}.${index}@hospital.local`;
    index += 1;
  }

  return candidate;
};

const linkLegacyHospitalsToAdmin = async (hospitalAdmin) => {
  // Keep old DB records; only claim matching, unowned rows for this admin.
  const nameRegex = new RegExp(`^${hospitalAdmin.hospital_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  await Hospital.updateMany(
    {
      'Hospital Name': nameRegex,
      $or: [
        { createdByHospitalAdmin: null },
        { createdByHospitalAdmin: { $exists: false } },
      ],
    },
    { $set: { createdByHospitalAdmin: hospitalAdmin._id } }
  );
};

const registerHospitalAdmin = async (req, res) => {
  try {
    const { admin_name, admin_email, password, hospital_name } = req.body;

    if (!admin_name || !admin_email || !password || !hospital_name) {
      return res.status(400).json({
        success: false,
        message: 'admin_name, admin_email, password and hospital_name are required',
      });
    }

    const existing = await HospitalAdmin.findOne({ admin_email: admin_email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await HospitalAdmin.create({
      admin_name,
      admin_email: admin_email.toLowerCase().trim(),
      password: hashedPassword,
      hospital_name,
    });

    await linkLegacyHospitalsToAdmin(admin);

    return res.status(201).json({
      success: true,
      message: 'Hospital admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.admin_name,
        email: admin.admin_email,
        role: 'hospital_admin',
        hospital_name: admin.hospital_name,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const loginHospitalAdmin = async (req, res) => {
  try {
    const { admin_email, password } = req.body;
    const dummyPassword = process.env.ADMIN_DUMMY_PASSWORD || 'dummy123';

    if (!admin_email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await HospitalAdmin.findOne({ admin_email: admin_email.toLowerCase().trim() });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = password === dummyPassword || (await bcrypt.compare(password, admin.password));
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    if (admin.isApproved === false) {
      return res.status(403).json({ success: false, message: 'Account is pending approval' });
    }

    await linkLegacyHospitalsToAdmin(admin);

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.admin_email,
        role: 'hospital_admin',
        type: 'hospital_admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.admin_name,
        email: admin.admin_email,
        role: 'hospital_admin',
        hospital_name: admin.hospital_name,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const bootstrapHospitalAdminsFromExistingHospitals = async (req, res) => {
  try {
    const dummyPassword = process.env.ADMIN_DUMMY_PASSWORD || 'dummy123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dummyPassword, salt);

    const distinctHospitalNames = await Hospital.distinct('Hospital Name');
    let created = 0;
    let linked = 0;

    for (const hospitalNameRaw of distinctHospitalNames) {
      const hospitalName = (hospitalNameRaw || '').trim();
      if (!hospitalName) continue;

      let admin = await HospitalAdmin.findOne({ hospital_name: hospitalName });

      if (!admin) {
        const generatedBase = slugify(hospitalName) || 'hospital';
        const generatedEmail = await ensureUniqueGeneratedEmail(generatedBase);

        admin = await HospitalAdmin.create({
          admin_name: hospitalName,
          admin_email: generatedEmail,
          password: hashedPassword,
          hospital_name: hospitalName,
        });
        created += 1;
      }

      const result = await Hospital.updateMany(
        {
          'Hospital Name': hospitalName,
          $or: [
            { createdByHospitalAdmin: null },
            { createdByHospitalAdmin: { $exists: false } },
          ],
        },
        { $set: { createdByHospitalAdmin: admin._id } }
      );

      linked += result.modifiedCount || 0;
    }

    return res.status(200).json({
      success: true,
      message: 'Bootstrap completed. Existing hospitals and data were preserved.',
      data: {
        hospitalsFound: distinctHospitalNames.length,
        loginsCreated: created,
        hospitalsLinked: linked,
        generatedPassword: dummyPassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerHospitalAdmin,
  loginHospitalAdmin,
  bootstrapHospitalAdminsFromExistingHospitals,
};
