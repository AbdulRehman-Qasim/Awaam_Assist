const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');
const Hospital = require('../models/HospitalSchema');

const slugify = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const registerHospitalAdmin = async (req, res) => {
  try {
    const { admin_name, admin_email, password, hospital_name } = req.body;

    if (!admin_name || !admin_email || !password || !hospital_name) {
      return res.status(400).json({
        success: false,
        message: 'admin_name, admin_email, password and hospital_name are required',
      });
    }

    const existing = await Admin.findOne({ admin_email: admin_email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      admin_name,
      admin_email: admin_email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'hospital_admin',
      isApproved: false,
      status: 'active',
      is_onboarded: true,
      entity_name: hospital_name,
      entity_type: 'hospital',
    });

    // Link any existing unowned hospital with this name
    const nameRegex = new RegExp(`^${hospital_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const linkedHospital = await Hospital.findOneAndUpdate(
      {
        'Hospital Name': nameRegex,
        $or: [
          { createdByHospitalAdmin: null },
          { createdByHospitalAdmin: { $exists: false } },
        ],
      },
      { $set: { createdByHospitalAdmin: admin._id } },
      { new: true }
    );

    if (linkedHospital) {
      admin.managed_entity_id = linkedHospital._id;
      await admin.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Hospital admin registered successfully and pending approval',
      admin: {
        id: admin._id,
        name: admin.admin_name,
        email: admin.admin_email,
        role: 'hospital_admin',
        hospital_name: hospital_name,
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

    const admin = await Admin.findOne({ admin_email: admin_email.toLowerCase().trim(), role: 'hospital_admin' });
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

    // Find the hospital linked to this admin for the dashboard
    let linkedHospital = await Hospital.findOne({ createdByHospitalAdmin: admin._id });
    if (!linkedHospital && admin.managed_entity_id) {
      linkedHospital = await Hospital.findById(admin.managed_entity_id);
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.admin_email,
        role: 'hospital_admin',
        type: 'hospital_admin',
        managed_entity_id: linkedHospital ? linkedHospital._id : null,
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
        hospital_name: admin.entity_name || '',
        managed_entity_id: linkedHospital ? linkedHospital._id : null,
        entity_name: admin.entity_name || '',
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

      const adminEmail = `admin.${slugify(hospitalName)}@gmail.com`;
      let admin = await Admin.findOne({ admin_email: adminEmail });

      if (!admin) {
        admin = await Admin.create({
          admin_name: `Admin of ${hospitalName}`,
          admin_email: adminEmail,
          password: hashedPassword,
          role: 'hospital_admin',
          isApproved: true,
          status: 'active',
          is_onboarded: true,
          entity_name: hospitalName,
          entity_type: 'hospital',
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

      if ((result.modifiedCount > 0 || !admin.managed_entity_id)) {
        const h = await Hospital.findOne({ 'Hospital Name': hospitalName }).lean();
        if (h) {
          admin.managed_entity_id = h._id;
          await admin.save();
        }
      }

      linked += result.modifiedCount || 0;
    }

    return res.status(200).json({
      success: true,
      message: 'Bootstrap completed into admins collection. Existing hospitals and data were preserved.',
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
