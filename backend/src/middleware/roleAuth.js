const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');

/**
 * Middleware to validate admin role
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
    // Convert single role to array for consistent handling
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async (req, res, next) => {
        try {
            let admin = req.admin;

            if (!admin) {
                const token = req.headers.authorization?.split(' ')[1];

                if (!token) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                admin = await Admin.findById(decoded.id);
            }

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Check if admin has required role
            const adminRole = admin.role || 'education_admin';

            // Demo default: allow any authenticated admin across modules.
            // Set ADMIN_STRICT_ROLE_CHECK=true to enforce strict role checks.
            const strictRoleCheck = process.env.ADMIN_STRICT_ROLE_CHECK === 'true';
            if (!strictRoleCheck) {
                req.admin = admin;
                return next();
            }

            // Super admin can access everything
            if (adminRole === 'super_admin') {
                req.admin = admin;
                return next();
            }

            // Check if admin role is in allowed roles
            if (!roles.includes(adminRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${roles.join(' or ')}`,
                    currentRole: adminRole
                });
            }

            // Attach admin to request
            req.admin = admin;
            next();
        } catch (error) {
            console.error('Role validation error:', error);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Role validation failed',
                error: error.message
            });
        }
    };
};

module.exports = { requireRole };
module.exports.authorizeRoles = requireRole;
