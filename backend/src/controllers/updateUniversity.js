const mongoose = require('mongoose');
const University = require('../models/UniversitySchema');

// Update existing university (used by admin dashboard edit)
const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params; // this is the custom id field, not _id
    const updates = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, message: 'University id is required' });
    }

    // Do not allow changing the primary id/key accidentally
    delete updates.id;
    delete updates.key;

    const hasAnnualFee = typeof updates.fee === 'number' && updates.fee > 0;
    const hasSemesterFee = typeof updates.semesterFee === 'number' && updates.semesterFee > 0;

    if (hasAnnualFee && hasSemesterFee) {
      return res.status(400).json({
        success: false,
        message: 'Provide either annual fee or semester fee, not both.',
      });
    }

    if ('fee' in updates || 'semesterFee' in updates) {
      if (!hasAnnualFee && !hasSemesterFee) {
        return res.status(400).json({
          success: false,
          message: 'Either annual fee or semester fee is required.',
        });
      }
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const updated = await University.findOneAndUpdate(query, { $set: updates }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    return res.status(200).json({ success: true, university: updated });
  } catch (error) {
    console.error('Error updating university:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating university',
      error: error.message,
    });
  }
};

module.exports = { updateUniversity };
