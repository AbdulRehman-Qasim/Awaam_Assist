/**
 * Get all dynamic options for Healthcare Onboarding
 * (Treatment Types)
 */
const getHealthcareOptions = async (req, res) => {
  try {
    const treatments = [
      "Cardiology", "Neurology", "Orthopedics", "Maternity", "Surgery", "ENT", 
      "Pediatrics", "Oncology", "Dermatology", "Psychiatry", "Dental Care", 
      "Eye Care", "Physiotherapy", "Emergency Care", "ICU Services", "Dialysis", 
      "Gastroenterology", "Pulmonology", "Urology", "Gynecology", "General Medicine",
      "Endocrinology", "Nephrology", "Radiology", "Pathology", "Anesthesiology",
      "Hematology", "Infectious Diseases", "Rheumatology", "Plastic Surgery",
      "Neurosurgery", "Cardiac Surgery", "Vascular Surgery", "Pediatric Surgery",
      "Maxillofacial Surgery", "Organ Transplant", "Infertility Treatment",
      "Speech Therapy", "Occupational Therapy", "Audiology", "Nutrition & Dietetics",
      "Pain Management", "Palliative Care", "Geriatrics", "Sports Medicine",
      "Emergency Medicine", "Intensive Care", "Neonatology", "Veneer & Cosmetic Dentistry",
      "Orthodontics", "Ophthalmology", "Dermatopathology", "Immunology"
    ];

    res.status(200).json({
      success: true,
      data: {
        treatments: treatments.sort()
      }
    });
  } catch (error) {
    console.error('Error fetching healthcare options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch healthcare options',
      error: error.message
    });
  }
};

module.exports = {
  getHealthcareOptions
};
