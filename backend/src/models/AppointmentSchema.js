const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    fullName: { type: String },
    patientName: { type: String },
    cnic: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    hospitalName: { type: String, required: true },
    treatmentSpecialty: { type: String, required: true },
    city: { type: String },
    
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    appointmentType: { 
      type: String, 
      enum: ["Routine", "Emergency", "Follow-up"],
      default: "Routine"
    },
    
    symptoms: { type: String, required: true },
    notes: { type: String },
    
    estimatedCost: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["pending", "accepted", "waiting", "rejected", "completed", "cancelled"], 
      default: "pending" 
    },
    adminReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema, "appointments");
