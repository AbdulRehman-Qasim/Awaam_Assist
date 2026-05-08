const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    selectedModules: [
      {
        type: String,
        enum: ["education", "schemes", "healthcare"],
      },
    ],
    profile: {
      education: {
        degree: String,
        preferredProgram: String,
        preferredSpecialization: String,
        careerGoal: String,
        city: String,
        marks: Number,
        feeRange: String,
        // Expanded & Legacy fields
        previousQualification: String,
        programInterest: String,
        discipline: String,
        fieldOfStudy: String,
        careerPath: String,
        universityType: String,
        hostelRequired: String,
        scholarshipRequired: String,
        studyMode: String,
        skills: String,
        technicalBackground: String,
        entranceTestStatus: String
      },
      schemes: {
        income: Number,
        age: Number,
        employmentStatus: String,
        province: String,
        educationLevel: String,
        // Expanded fields
        familySize: Number,
        parentOccupation: String,
        disabilityStatus: String,
        bispStatus: String,
        houseOwnership: String,
        utilityBillBurden: String,
        studentStatus: String,
        loanRequirement: String,
        internetAccess: String,
        deviceAccess: String,
        cnicAvailable: String,
        transportDifficulties: String,
        existingSupport: String
      },
      healthcare: {
        city: String,
        tehsil: String,
        hospitalCategory: String,
        // Expanded fields
        nearbyPreference: String,
        emergencyRequirement: String,
        disabilitySupport: String,
        chronicIllness: String,
        genderPreference: String,
        treatmentCity: String,
        transportAvailability: String,
        areaType: String,
        bloodGroup: String,
        familyMedicalSupport: String,
        medicalInsurance: String,
        emergencyContact: String
      },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
