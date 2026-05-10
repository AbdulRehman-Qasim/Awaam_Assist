const Appointment = require("../models/AppointmentSchema");
const Hospital = require("../models/HospitalSchema");

/**
 * @desc    Book a new hospital appointment
 * @route   POST /api/healthcare/appointments
 * @access  Private (User)
 */
const bookAppointment = async (req, res) => {
  try {
    const {
      fullName,
      patientName,
      cnic,
      email,
      phone,
      hospitalId,
      hospitalName,
      treatmentSpecialty,
      city,
      appointmentDate,
      appointmentTime,
      appointmentType,
      symptoms,
      notes,
      estimatedCost
    } = req.body;

    const finalPatientName = patientName || fullName;

    // Simple validation for required fields
    if (!finalPatientName || !cnic || !email || !phone || !hospitalId || !appointmentDate || !appointmentTime || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields."
      });
    }

    // CNIC Validation (Format: 00000-0000000-0)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CNIC format. Please use 00000-0000000-0"
      });
    }

    // Phone Validation (Numeric, 10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format."
      });
    }

    // Date validation (cannot be in the past)
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past."
      });
    }

    const appointment = new Appointment({
      userId: req.user._id,
      fullName: finalPatientName, // Keep for backward compatibility
      patientName: finalPatientName,
      cnic,
      email,
      phone,
      hospitalId,
      hospitalName,
      treatmentSpecialty,
      city,
      appointmentDate: selectedDate,
      appointmentTime,
      appointmentType,
      symptoms,
      notes,
      estimatedCost: Number(estimatedCost) || 0,
      status: "pending"
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      data: savedAppointment,
      message: "Appointment booked successfully. Status: Pending"
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while booking appointment."
    });
  }
};

/**
 * @desc    Get user's appointments
 * @route   GET /api/healthcare/appointments/my
 * @access  Private (User)
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments."
    });
  }
};

/**
 * @desc    Get all appointments for a hospital (Admin)
 * @route   GET /api/healthcare/appointments/hospital/:hospitalId
 * @access  Private (Hospital Admin)
 */
const getHospitalAppointments = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const admin = req.admin;

    // 1. Fetch the requested hospital
    const targetHospital = await Hospital.findById(hospitalId);
    if (!targetHospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    // 2. Security Check: Is this admin authorized?
    // Authorized if: Super Admin OR manages this specific ID OR manages a hospital with the same name
    const isAuthorized = 
      admin.role === 'super_admin' || 
      admin.managed_entity_id?.toString() === hospitalId ||
      admin.entity_name?.toLowerCase() === targetHospital['Hospital Name']?.toLowerCase();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view appointments for this hospital."
      });
    }

    // 3. To handle duplicates/multiple branches, we find all hospital IDs with this name
    const hospitalsWithSameName = await Hospital.find({ 
      'Hospital Name': { $regex: new RegExp(`^${targetHospital['Hospital Name']}$`, 'i') },
      City: targetHospital.City
    }).select('_id');
    
    const hospitalIds = hospitalsWithSameName.map(h => h._id);

    // 4. Fetch appointments for all these IDs
    const appointments = await Appointment.find({ 
      hospitalId: { $in: hospitalIds } 
    }).sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error("Error fetching hospital appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments."
    });
  }
};

/**
 * @desc    Get specific appointment details
 * @route   GET /api/healthcare/appointments/:id
 * @access  Private (User or Admin)
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    // Security check
    if (req.admin) {
       if (req.admin.role !== 'super_admin' && req.admin.managed_entity_id?.toString() !== appointment.hospitalId.toString()) {
         return res.status(403).json({ success: false, message: "Unauthorized access." });
       }
    } else if (req.user) {
       if (appointment.userId.toString() !== req.user._id.toString()) {
         return res.status(403).json({ success: false, message: "Unauthorized access." });
       }
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/healthcare/appointments/:id/status
 * @access  Private (Hospital Admin)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason } = req.body;
    const admin = req.admin;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    // Broadened Security Check
    const isAuthorized = 
      admin.role === 'super_admin' || 
      (admin.managed_entity_id && appointment.hospitalId && admin.managed_entity_id.toString() === appointment.hospitalId.toString()) ||
      (admin.entity_name && appointment.hospitalName && admin.entity_name.toLowerCase() === appointment.hospitalName.toLowerCase());

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    // Validation for rejection reason
    if (status === 'rejected' && !adminReason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for rejection."
      });
    }

    appointment.status = status;
    if (adminReason) appointment.adminReason = adminReason;
    
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment ${status} successfully.`
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @desc    Reject appointment (POST /appointment/reject)
 * @access  Private (Hospital Admin)
 */
const rejectAppointment = async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;
    const admin = req.admin;

    if (!appointmentId || !reason) {
      return res.status(400).json({ success: false, message: "Appointment ID and reason are required." });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    // Broadened Security Check
    const isAuthorized = 
      admin.role === 'super_admin' || 
      (admin.managed_entity_id && appointment.hospitalId && admin.managed_entity_id.toString() === appointment.hospitalId.toString()) ||
      (admin.entity_name && appointment.hospitalName && admin.entity_name.toLowerCase() === appointment.hospitalName.toLowerCase());

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    appointment.status = 'rejected';
    appointment.adminReason = reason;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment rejected successfully."
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getHospitalAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rejectAppointment
};
