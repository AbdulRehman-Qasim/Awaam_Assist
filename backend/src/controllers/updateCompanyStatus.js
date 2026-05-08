const Company = require("../models/RegisterStudentSchema");

exports.updateCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    if (!companyId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "Company ID and status are required" 
      });
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { status },
      { new: true }
    ).select('-password'); // Exclude password from the returned data

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: "Company not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: `Company ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: company
    });

  } catch (error) {
    console.error("Error updating company status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating company status",
      error: error.message
    });
  }
};