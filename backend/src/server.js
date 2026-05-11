require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { OpenAI } = require('openai');
const axios = require('axios');

// Import university controllers
const {
  getAllUniversities,
  getUniversityById,
  getUniversityStats,
  getUniversitiesByCity,
  getUniversitiesByProvince,
  getUniversitiesByDiscipline,
  getLiveStats,
} = require("./controllers/universityController");

// Import university search controllers
const {
  searchUniversitiesByName,
  getUniversitiesByRanking,
  getTopUniversities
} = require("./controllers/universitySearchController");

// Import optimized top universities controller
const { getTopUniversities: getTopUniversitiesOptimized } = require("./controllers/getTopUniversities");

// Import optimized disciplines controller
const { getDisciplines } = require("./controllers/getDisciplines");

// Import hospital controller
const {
  getAllHospitals,
  getHospitalFilters,
  getHospitalWebsite,
  getAllHospitalsAdmin,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalDashboardStats,
  addTreatment,
  updateTreatment,
  deleteTreatment,
} = require("./controllers/hospitalController");

// Import company authentication controllers
const { googleRegisterCompany } = require("./controllers/googleRegisterCompany");
const { googleLoginCompany } = require("./controllers/googleLoginCompany");
const { registerCompany } = require("./controllers/RegisterStudent");
const { loginStudent } = require("./controllers/LoginStudent");

// Import middleware
const { requireFields } = require("./middleware/RegisterStudentFields");
const authMiddleware = require("./middleware/authMiddleware");
const adminAuthMiddleware = require("./middleware/adminAuthMiddleware");
const { requireRole } = require("./middleware/roleAuth");
const hospitalAdminAuth = require("./middleware/hospitalAdminAuth");

// Import password reset functions
const {
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require("./controllers/forgotPasswordController");

// Import contact page controllers
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} = require("./controllers/contactController");

// Import admin controllers
const { loginAdmin } = require("./controllers/LoginAdmin");
const { registerAdmin } = require("./controllers/RegisterAdmin");
const { getAdminDashboardData } = require("./controllers/getAdminDashboardData");
const { updateCompanyStatus } = require("./controllers/updateCompanyStatus");
const { getStudentAdmin } = require("./controllers/getStudentAdmin");
const { createUniversity } = require("./controllers/createUniversity");
const { updateUniversity } = require("./controllers/updateUniversity");
const { deleteUniversity } = require("./controllers/deleteUniversity");
const { updateOnboarding, getOnboardingStatus } = require("./controllers/OnboardingController");
const {
  getAdminSettingsProfile,
  updateAdminSettingsProfile,
  changeAdminPassword,
} = require("./controllers/adminSettingsController");
const upload = require("./utils/upload");

// Import team member controllers
const {
  getTeamMembers,
  getTeamMemberById,
} = require("./controllers/getTeamMembers");
const { createTeamMember } = require("./controllers/createTeamMember");
const { resendInvitation } = require("./controllers/resendInvitation");
const { cancelInvitation } = require("./controllers/cancelInvitation");

// Import company profile controllers
const {
  updateCompanyName,
  updateCompanyEmail,
  changeCompanyPassword,
  getCompanyProfile
} = require("./controllers/companyProfileController");

// Import candidate verification controller
const { verifyCandidateLogin } = require("./controllers/verifyCandidateLogin");

// Import onboarding controller
const { completeOnboarding, getProfile } = require("./controllers/userOnboardingController");
const { completeProfile, getUserProfile } = require("./controllers/userController");
const { getRecommendations } = require("./controllers/recommendationController");
const userAuth = require("./middleware/userAuth");

// Import feedback controllers
const {
  submitModuleRating,
  getMyRatings,
  submitRecommendationFeedback,
  submitPlatformFeedback,
  getFeedbackAnalytics,
  getUserFeedbackHistory,
  getAllFeedback
} = require("./controllers/feedbackController");

const {
  bookAppointment,
  getMyAppointments,
  getHospitalAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rejectAppointment
} = require("./controllers/appointmentController");

const superAdminRoutes = require('./modules/superAdmin/routes/superAdminRoutes');

// Import scheme controllers
const {
  getAllSchemes,
  getSchemeById,
  getSchemeBySchemeId,
  checkEligibility,
  checkEligibilityBatch,
  getSchemeStats,
  getSchemesByCategory,
  getSchemesByProvince,
  getCategories,
  getProvinces
} = require("./controllers/schemeController");

// Import scheme admin controllers
const {
  createScheme,
  updateScheme,
  deleteScheme,
  updateSchemeStatus,
  updateSchemeStats,
  getAllSchemesAdmin,
  getAdminDashboardStats,
  bulkImportSchemes
} = require("./controllers/schemeAdminController");

const {
  registerHospitalAdmin,
  loginHospitalAdmin,
  bootstrapHospitalAdminsFromExistingHospitals,
} = require("./controllers/hospitalAdminAuthController");

// Fallback response function for when AI service is unavailable
function generateFallbackResponse(message) {
  const msg = message.toLowerCase().trim();

  // Handle greetings
  if (['hello', 'hi', 'assalam', 'salam', 'hey', 'good morning', 'good evening', 'good afternoon'].some(word => msg.includes(word))) {
    return "Hello! I'm your AI assistant for Awam Assist. I can help you find information about universities, government schemes, and hospitals in Pakistan. How can I assist you today?";
  }

  // Handle hospital queries
  if (['hospital', 'doctor', 'medical', 'health', 'treatment', 'nearest'].some(word => msg.includes(word))) {
    if (msg.includes('lahore') || msg.includes('lhore')) {
      return "Top hospitals in Lahore: Services Hospital (public, affordable), Mayo Hospital (public, established 1871), Shalamar Hospital (private, modern), and Lahore General Hospital (public). All provide comprehensive medical care with emergency services.";
    } else if (msg.includes('karachi')) {
      return "Top hospitals in Karachi: Aga Khan University Hospital (private, premium), Jinnah Postgraduate Medical Centre (public), Civil Hospital (public), and Liaquat National Hospital (private).";
    } else if (msg.includes('islamabad')) {
      return "Top hospitals in Islamabad: PIMS Hospital (public, affordable), Shifa International (private, premium), Polyclinic (public), and KRL Hospital (public). All offer emergency and specialist services.";
    } else {
      return "To find the nearest hospital, please tell me your city or area. I can then provide you with the best hospitals in your location with their specialties and contact information.";
    }
  }

  // Handle university queries
  if (['university', 'college', 'education', 'study', 'admission'].some(word => msg.includes(word))) {
    if (msg.includes('nust')) {
      return "NUST (National University of Sciences and Technology) is Pakistan's top-ranked university. Located in Islamabad, it offers engineering, medical, business, and computer science programs. Admission requires NUST entry test with minimum 60% marks in FSc.";
    } else if (msg.includes('engineering')) {
      return "Top engineering universities in Pakistan: NUST Islamabad, UET Lahore, GIKI Topi, NED Karachi, UET Taxila, and UET Peshawar. All require ECAT test with minimum 60% marks in FSc Pre-Engineering.";
    } else if (msg.includes('medical') || msg.includes('mbbs')) {
      return "Top medical universities: King Edward Medical University (Lahore), Aga Khan University (Karachi), Dow Medical College (Karachi), Allama Iqbal Medical College (Lahore), and AIMC (Lahore). All require MCAT with 65% minimum FSc Pre-Medical.";
    } else {
      return "I can help you find universities! Are you looking for engineering, medical, business, computer science, or arts programs? Also let me know your preferred city or province for more specific recommendations.";
    }
  }

  // Handle government scheme queries
  if (['scheme', 'government', 'program', 'benefit', 'loan', 'scholarship', 'ehsaas', 'laptop', 'kamyab', 'sehat', 'bisp', 'benazir'].some(word => msg.includes(word))) {
    if (msg.includes('ehsaas')) {
      return "Ehsaas Program is Pakistan's largest social protection initiative. Includes Ehsaas Emergency Cash, Ehsaas Scholarship Program, Ehsaas Kafalat, and Ehsaas Nashonuma. Eligibility based on income level and family composition.";
    } else if (msg.includes('laptop')) {
      return "Prime Minister's Laptop Scheme provides free laptops to talented students in public sector universities. Eligibility: 70% marks in previous semester, no disciplinary issues, and not a previous recipient.";
    } else if (msg.includes('education') || msg.includes('scholarship')) {
      return "Education schemes: Ehsaas Undergraduate Scholarship (covers tuition + stipend), Prime Minister's Laptop Scheme, HEC Need-based Scholarships, and Punjab Educational Endowment Fund.";
    } else {
      return "I can help with government schemes! Are you interested in education scholarships, business loans, healthcare programs, or social welfare benefits?";
    }
  }

  // Handle help requests
  if (['help', 'what can you do', 'how can you help', 'capabilities'].some(word => msg.includes(word))) {
    return "I can help you with: 1) Finding universities and colleges in Pakistan with specific admission requirements, 2) Information about government schemes and scholarships with eligibility criteria, 3) Locating hospitals and medical facilities with contact details, 4) Admission procedures and requirements. Just ask me anything about these topics!";
  }

  // Handle thanks
  if (['thank', 'thanks', 'shukria', 'appreciate'].some(word => msg.includes(word))) {
    return "You're welcome! I'm here to help. Feel free to ask any other questions about universities, schemes, or hospitals in Pakistan.";
  }

  // Default response
  return "I'm here to help with universities, government schemes, and hospitals in Pakistan. Could you please specify what information you're looking for? For example: 'Tell me about NUST', 'What is Ehsaas Program?', or 'Find hospitals in Lahore'.";
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Contact page routes
app.post("/contact", createContact);

// Company (Student) authentication routes
app.post("/login", loginStudent);
app.post(
  "/register",
  requireFields(["student_name", "student_email", "password"]),
  registerCompany
);
app.post("/google-register", googleRegisterCompany);
app.post("/google-login", googleLoginCompany);

// Password reset routes
app.post("/forgot-password", forgotPassword);
app.post("/reset-password", resetPassword);
app.get("/verify-reset-token/:token", verifyResetToken);

// Admin authentication routes
app.post("/admin/login", loginAdmin);
app.post(
  "/admin/register",
  requireFields(["admin_name", "admin_email", "password"]),
  registerAdmin
);

// Onboarding routes
app.put("/admin/onboarding/:adminId", upload.array('docs', 5), updateOnboarding);
app.get("/admin/onboarding-status/:adminId", getOnboardingStatus);

// Candidate verification route
app.post("/candidate/verify", verifyCandidateLogin);

// User onboarding and profile routes
app.post("/api/onboarding/complete", completeOnboarding);
app.get("/api/profile/:userId", getProfile);

// New structured onboarding route
app.post("/api/user/complete-profile", userAuth, completeProfile);
app.get("/api/user/profile", userAuth, getUserProfile);
app.get("/api/user/recommendations", userAuth, getRecommendations);

// Feedback routes
app.post("/api/feedback/module", userAuth, submitModuleRating);
app.get("/api/feedback/my-ratings", userAuth, getMyRatings);
app.post("/api/feedback/recommendation", userAuth, submitRecommendationFeedback);
app.post("/api/feedback/platform", userAuth, submitPlatformFeedback);
app.get("/api/feedback/user-history", userAuth, getUserFeedbackHistory);
app.get("/api/feedback/analytics", adminAuthMiddleware, getFeedbackAnalytics);
app.get("/api/feedback/all", adminAuthMiddleware, getAllFeedback);

// Report routes
const { generateReport, getReportHistory } = require("./controllers/reportController");
app.post("/api/reports/generate", userAuth, generateReport);
app.get("/api/reports/history", userAuth, getReportHistory);

// Hospital admin authentication routes
app.post("/hospital-admin/register", registerHospitalAdmin);
app.post("/hospital-admin/login", loginHospitalAdmin);
app.post("/hospital-admin/bootstrap-existing-logins", bootstrapHospitalAdminsFromExistingHospitals);

// University routes - specific named routes MUST come before /:id
app.get("/api/universities/search", searchUniversitiesByName);
app.get("/api/universities/ranking", getUniversitiesByRanking);
app.get("/api/universities/top", getTopUniversitiesOptimized);
app.get("/api/universities/stats", getUniversityStats);
app.get("/api/universities/live-stats", getLiveStats);       // live stats for hero section
app.get("/api/universities/city/:city", getUniversitiesByCity);
app.get("/api/universities/province/:province", getUniversitiesByProvince);
app.get("/api/universities/discipline/:discipline", getUniversitiesByDiscipline);
app.get("/api/universities", getAllUniversities);
app.get("/api/universities/:id", getUniversityById);

// Disciplines & Education Data
const { getEducationOptions } = require("./controllers/educationDataController");
app.get("/api/disciplines", getDisciplines);
app.get("/api/education/options", getEducationOptions);

// Hospital routes
const { getHealthcareOptions } = require("./controllers/healthcareDataController");
app.get("/api/hospitals", getAllHospitals);
app.get("/api/hospitals/filters", getHospitalFilters);
app.get("/api/hospitals/:id/website", getHospitalWebsite);
app.get("/api/healthcare/options", getHealthcareOptions);

// Hospital Appointment Routes
app.post("/api/healthcare/appointments", userAuth, bookAppointment);
app.get("/api/healthcare/appointments/my", userAuth, getMyAppointments);

// AI Chatbot route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });
    const pythonServiceUrl = process.env.PYTHON_AI_URL || "http://localhost:8001";
    const response = await axios.post(`${pythonServiceUrl}/chat`, { message, user_id: user_id || "anonymous" });
    res.json({ success: true, reply: response.data.reply, model: response.data.model });
  } catch (error) {
    const fallbackResponse = generateFallbackResponse(req.body?.message || "");
    res.json({ success: true, reply: fallbackResponse, model: "fallback" });
  }
});

// Scheme routes - Public
app.get("/api/schemes", getAllSchemes);
app.get("/api/schemes/stats", getSchemeStats);
app.get("/api/schemes/categories", getCategories);
app.get("/api/schemes/provinces", getProvinces);
app.get("/api/schemes/category/:category", getSchemesByCategory);
app.get("/api/schemes/province/:province", getSchemesByProvince);
app.post("/api/schemes/check-eligibility", checkEligibilityBatch);
app.post("/api/schemes/:schemeId/check-eligibility", checkEligibility);
app.get("/api/schemes/scheme/:schemeId", getSchemeBySchemeId);
app.get("/api/schemes/:id", getSchemeById);

app.use('/superadmin', superAdminRoutes);

// Admin contact routes
app.get("/admin/contacts", getAllContacts);
app.get("/admin/contacts/:id", getContactById);
app.put("/admin/contacts/:id/status", updateContactStatus);
app.delete("/admin/contacts/:id", deleteContact);

// Admin dashboard route
app.get("/admin/dashboard", getAdminDashboardData);

// Admin company management routes
app.get("/admin/companies", adminAuthMiddleware, getStudentAdmin);
app.post("/admin/companies", adminAuthMiddleware, createUniversity);
app.put("/admin/companies/:id", adminAuthMiddleware, updateUniversity);
app.delete("/admin/companies/:id", adminAuthMiddleware, deleteUniversity);
app.put("/admin/companies/:companyId/status", adminAuthMiddleware, updateCompanyStatus);

// Education admin settings routes
app.get("/admin/settings/profile", adminAuthMiddleware, getAdminSettingsProfile);
app.put("/admin/settings/profile", adminAuthMiddleware, updateAdminSettingsProfile);
app.put("/admin/settings/password", adminAuthMiddleware, changeAdminPassword);

// Admin scheme management routes
app.get("/admin/schemes", requireRole(['scheme_admin', 'super_admin']), getAllSchemesAdmin);
app.get("/admin/schemes/dashboard-stats", requireRole(['scheme_admin', 'super_admin']), getAdminDashboardStats);
app.post("/admin/schemes", requireRole(['scheme_admin', 'super_admin']), createScheme);
app.post("/admin/schemes/bulk-import", requireRole(['scheme_admin', 'super_admin']), bulkImportSchemes);
app.put("/admin/schemes/:id", requireRole(['scheme_admin', 'super_admin']), updateScheme);
app.put("/admin/schemes/:id/status", requireRole(['scheme_admin', 'super_admin']), updateSchemeStatus);
app.put("/admin/schemes/:id/stats", requireRole(['scheme_admin', 'super_admin']), updateSchemeStats);
app.delete("/admin/schemes/:id", requireRole(['scheme_admin', 'super_admin']), deleteScheme);

// Admin hospital management routes
app.get("/admin/hospitals", requireRole(['hospital_admin', 'super_admin']), getAllHospitalsAdmin);
app.get("/admin/hospitals/dashboard-stats", requireRole(['hospital_admin', 'super_admin']), getHospitalDashboardStats);
app.post("/admin/hospitals", requireRole(['hospital_admin', 'super_admin']), createHospital);
app.put("/admin/hospitals/:id", requireRole(['hospital_admin', 'super_admin']), updateHospital);
app.delete("/admin/hospitals/:id", requireRole(['hospital_admin', 'super_admin']), deleteHospital);
// Treatment sub-routes
app.post("/admin/hospitals/:id/treatments", requireRole(['hospital_admin', 'super_admin']), addTreatment);
app.put("/admin/hospitals/:id/treatments/:treatmentId", requireRole(['hospital_admin', 'super_admin']), updateTreatment);
app.delete("/admin/hospitals/:id/treatments/:treatmentId", requireRole(['hospital_admin', 'super_admin']), deleteTreatment);

// Unified Hospital Admin Routes
app.get("/hospital-admin/hospitals", adminAuthMiddleware, getAllHospitalsAdmin);
app.get("/hospital-admin/dashboard-stats", adminAuthMiddleware, getHospitalDashboardStats);
app.post("/hospital-admin/hospitals", adminAuthMiddleware, createHospital);
app.put("/hospital-admin/hospitals/:id", adminAuthMiddleware, updateHospital);
app.delete("/hospital-admin/hospitals/:id", adminAuthMiddleware, deleteHospital);
// Treatment sub-routes for hospital admin portal
app.post("/hospital-admin/hospitals/:id/treatments", adminAuthMiddleware, addTreatment);
app.put("/hospital-admin/hospitals/:id/treatments/:treatmentId", adminAuthMiddleware, updateTreatment);
app.delete("/hospital-admin/hospitals/:id/treatments/:treatmentId", adminAuthMiddleware, deleteTreatment);

// Appointment Management for Hospital Admins
app.get("/hospital-admin/appointments/:hospitalId", adminAuthMiddleware, getHospitalAppointments);
app.get("/hospital-admin/appointments/details/:id", adminAuthMiddleware, getAppointmentById);
app.patch("/hospital-admin/appointments/:id/status", adminAuthMiddleware, updateAppointmentStatus);

// Production-grade Route Aliases (Requested by USER)
app.get("/appointments/hospital/:hospitalId", adminAuthMiddleware, getHospitalAppointments);
app.get("/appointment/:id", adminAuthMiddleware, getAppointmentById);
app.post("/appointment/update-status", adminAuthMiddleware, updateAppointmentStatus);
app.post("/appointment/reject", adminAuthMiddleware, rejectAppointment);

// Company profile management routes
app.get("/company/profile", getCompanyProfile);
app.put("/company/profile/update-name", updateCompanyName);
app.put("/company/profile/update-email", updateCompanyEmail);
app.put("/company/password/change", changeCompanyPassword);

// Team member routes
app.get("/company/team", getTeamMembers);
app.get("/company/team/member/:id", getTeamMemberById);
app.post("/company/team/invite", createTeamMember);
app.put("/company/team/resend/:id", resendInvitation);
app.delete("/company/team/cancel/:id", cancelInvitation);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const http = require('http');
    const { Server } = require("socket.io");
    const Chat = require('./models/Chat');
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

    io.on('connection', (socket) => {
      Chat.find().sort({ timestamp: 1 }).limit(50).then(messages => socket.emit('previousMessages', messages));
      socket.on('sendMessage', (data) => {
        new Chat({ sender: data.sender, content: data.content }).save().then(msg => io.emit('receiveMessage', msg));
      });
    });

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
    process.exit(1);
  });