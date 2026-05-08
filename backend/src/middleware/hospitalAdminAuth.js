const jwt = require('jsonwebtoken');
const HospitalAdmin = require('../models/HospitalAdminSchema');

const hospitalAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'hospital_admin') {
      return res.status(403).json({ success: false, message: 'Invalid token type' });
    }

    const hospitalAdmin = await HospitalAdmin.findById(decoded.id);
    if (!hospitalAdmin) {
      return res.status(401).json({ success: false, message: 'Hospital admin not found' });
    }

    req.hospitalAdmin = hospitalAdmin;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = hospitalAdminAuth;
