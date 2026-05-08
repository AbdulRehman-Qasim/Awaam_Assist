const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin token' });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Admin account suspended' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};

module.exports = adminAuthMiddleware;