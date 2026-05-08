const {
    getAdminSummary,
    listAdmins,
    listPendingAdmins,
    approveAdmin,
    rejectAdmin,
    suspendAdmin,
    getPendingData,
    approveData,
    rejectData,
    listAllRecords,
    normalizeAdminRecord,
    getAnalyticsData,
} = require('../services/superAdminService');

const sendResult = (res, result) => res.status(result.status).json(result.body);

const getAdmins = async (_req, res) => {
    try {
        const admins = (await listAdmins()).map(normalizeAdminRecord);
        return res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getPendingAdmins = async (_req, res) => {
    try {
        const admins = (await listPendingAdmins()).map(normalizeAdminRecord);
        return res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const approveAdminById = async (req, res) => {
    try {
        return sendResult(res, await approveAdmin(req.params.id));
    } catch (error) {
        console.error('SuperAdmin Approval Error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const rejectAdminById = async (req, res) => {
    try {
        return sendResult(res, await rejectAdmin(req.params.id));
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const suspendAdminById = async (req, res) => {
    try {
        return sendResult(res, await suspendAdmin(req.params.id));
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getPendingDataByType = async (req, res) => {
    try {
        const records = await getPendingData(req.params.type);
        if (!records) {
            return res.status(404).json({ success: false, message: 'Unsupported data type' });
        }

        return res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const approveDataByType = async (req, res) => {
    try {
        return sendResult(res, await approveData(req.params.type, req.params.id));
    } catch (error) {
        console.error('SuperAdmin Data Approval Error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const rejectDataByType = async (req, res) => {
    try {
        return sendResult(res, await rejectData(req.params.type, req.params.id));
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getDashboardSummary = async (_req, res) => {
    try {
        const summary = await getAdminSummary();
        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getAllData = async (_req, res) => {
    try {
        const data = await listAllRecords();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getAnalytics = async (_req, res) => {
    try {
        const data = await getAnalyticsData();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


module.exports = {
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
};