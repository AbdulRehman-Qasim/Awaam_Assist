const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { authorizeRoles } = require('../../../middleware/roleAuth');
const {
    getAdmins,
    getPendingAdmins,
    approveAdminById,
    rejectAdminById,
    suspendAdminById,
    getPendingDataByType,
    approveDataByType,
    rejectDataByType,
    getDashboardSummary,
    getAllData,
    getAnalytics,
} = require('../controllers/superAdminController');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('super_admin'));

router.get('/dashboard', getDashboardSummary);
router.get('/analytics', getAnalytics);
router.get('/all-data', getAllData);
router.get('/admins', getAdmins);
router.get('/admins/pending', getPendingAdmins);
router.put('/admins/:id/approve', approveAdminById);
router.delete('/admins/:id/reject', rejectAdminById);
router.put('/admins/:id/suspend', suspendAdminById);

router.get('/pending/:type', getPendingDataByType);
router.put('/:type/:id/approve', approveDataByType);
router.put('/:type/:id/reject', rejectDataByType);

module.exports = router;