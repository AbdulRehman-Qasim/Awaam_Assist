import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//protected route
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Landing Page
import LandingPage from "@/pages/LandingPage";

// Marketing pages
import HomePage from "@/pages/marketing/HomePage";
import PricingPage from "@/pages/marketing/PricingPage";
import HowItWorksPage from "@/pages/marketing/HowItWorksPage";
import ContactPage from "@/pages/marketing/ContactPage";
import AboutPage from "@/pages/AboutPage";
// Authentication pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/company/ForgotPasswordPage";
import ResetPasswordPage from '@/pages/company/ResetPasswordPage';
import CandidateLoginPage from "@/pages/auth/CandidateLoginPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import AdminRegisterPage from "@/pages/auth/AdminRegisterPage";
import AdminOnboardingPage from "@/pages/auth/AdminOnboardingPage";
import OnboardingPage from "@/pages/auth/OnboardingPage";

// Education Module (formerly Company pages)
import CompanyLayout from "@/layouts/CompanyLayout";
import CompanyDashboard from "@/pages/company/Dashboard";
import JobsListingPage from "@/pages/company/JobsListingPage";
import JobDetailsPage from "@/pages/company/JobDetailsPage";
import CreateJobPage from "@/pages/company/CreateJobPage";
import InterviewsListingPage from "@/pages/company/InterviewsListingPage";
import InterviewDetailsPage from "@/pages/company/InterviewDetailsPage";
import TeamManagementPage from "@/pages/company/TeamManagementPage";
import AccountSettingsPage from "./pages/company/AccountSettingsPage";
import HeroSection from "@/pages/company/HeroSection";
import PersonalizedDashboardPage from "@/pages/company/PersonalizedDashboardPage";
import FavoritesPage from "@/pages/company/FavoritesPanel";
import DisciplineSearch from "@/pages/company/DisciplineSearch";
import RankingSearch from "@/pages/company/RankingSearch";
import HospitalFavoritesPanel from "@/pages/company/HospitalFavoritesPanel";
import HospitalComparePanel from "@/pages/company/HospitalComparePanel";
import HospitalSearch from "@/pages/company/HospitalSearch";
import AIChatbot from "@/pages/company/AIChatbot";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import CompanyManagementPage from "@/pages/admin/CompanyManagementPage";
import ContactInformationPage from "@/pages/admin/ContactInformationPage";
import AdminSchemeManagement from "@/pages/admin/AdminSchemeManagement";
import EducationSettingsPage from "@/pages/admin/EducationSettingsPage";

// New Admin Components
import SchemeAdminLayout from "@/layouts/SchemeAdminLayout";
import SchemeAdminDashboard from "@/pages/admin/SchemeAdminDashboard";
import BeneficiariesPage from "@/pages/admin/BeneficiariesPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import HospitalAdminRegister from "@/pages/admin/HospitalAdminRegister";
import HospitalAdminLayout from "@/layouts/HospitalAdminLayout";
import HospitalAdminDashboard from "@/pages/admin/HospitalAdminDashboard";
import HospitalManagementPage from "@/pages/admin/HospitalManagementPage";

import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import SuperAdminDashboard from "@/pages/superAdmin/Dashboard";
import SuperAdminManageAdmins from "@/pages/superAdmin/ManageAdmins";
import SuperAdminPendingApprovals from "@/pages/superAdmin/PendingApprovals";
import SuperAdminDataOverview from "@/pages/superAdmin/DataOverview";
import SuperAdminAnalytics from "@/pages/superAdmin/Analytics";
import SuperAdminSettings from "@/pages/superAdmin/Settings";
import SuperAdminLogin from "@/pages/superAdmin/SuperAdminLogin";

// Government Scheme Module
import SchemeLayout from "@/layouts/SchemeLayout";
import SchemeDashboard from "@/pages/schemes/SchemeDashboard";
import SchemeComparePanel from "@/pages/schemes/SchemeComparePanel";
import SchemeFavoritesPanel from "@/pages/schemes/SchemeFavoritesPanel";
import SchemeApplicationTracker from "@/pages/schemes/SchemeApplicationTracker";
import SchemeSettings from "@/pages/schemes/SchemeSettings";


// Other
import NotFound from "@/pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";

const queryClient = new QueryClient();

const getAdminEntryRedirect = () => {
  const token = localStorage.getItem("adminToken");
  const adminRaw = localStorage.getItem("admin");
  const adminModule = localStorage.getItem("adminModule");

  if (!token || !adminRaw) {
    if (window.location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  try {
    if (adminModule === "scheme") {
      return <Navigate to="/admin/scheme/dashboard" replace />;
    }

    if (adminModule === "hospital") {
      return <Navigate to="/admin/hospital/dashboard" replace />;
    }

    if (adminModule === "education") {
      return <Navigate to="/admin/education/dashboard" replace />;
    }

    const admin = JSON.parse(adminRaw);
    const role = admin?.role;

    if (role === "super_admin") {
      return <Navigate to="/super-admin/dashboard" replace />;
    }

    if (role === "scheme_admin") {
      return <Navigate to="/admin/scheme/dashboard" replace />;
    }

    if (role === "hospital_admin") {
      return <Navigate to="/admin/hospital/dashboard" replace />;
    }

    return <Navigate to="/admin/education/dashboard" replace />;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" expand={false} richColors />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Landing Page - Main Entry Point */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Marketing routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />


          {/* Public Authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:id/:token" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/candidate/login/:token" element={<CandidateLoginPage />} />
          {/* Admin Entry Route */}
          <Route path="/admin" element={getAdminEntryRedirect()} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/complete-profile" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<Navigate to="/company/dashboard" replace />} />

          {/* Education Admin Routes */}
          <Route path="/admin/education/login" element={<Navigate to="/admin/login?module=education" replace />} />
          <Route path="/admin/education/register" element={<AdminRegisterPage />} />

          {/* Unified Admin Login Routes */}
          <Route path="/admin/scheme/login" element={<Navigate to="/admin/login?module=scheme" replace />} />
          <Route path="/admin/hospital/login" element={<Navigate to="/admin/login?module=hospital" replace />} />
          <Route path="/admin/hospital/register" element={<HospitalAdminRegister />} />

          {/* Legacy Admin Routes - Redirect to Education Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/admin/onboarding" element={<AdminOnboardingPage />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin/education/dashboard" replace />}
          />

          {/* Legal Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Education Module Login/Register - Unified */}
          <Route path="/education/login" element={<Navigate to="/login" replace />} />
          <Route path="/education/register" element={<Navigate to="/register" replace />} />

          {/* Government Scheme Module Login/Register - Unified */}
          <Route path="/schemes/login" element={<Navigate to="/login" replace />} />
          <Route path="/schemes/register" element={<Navigate to="/register" replace />} />

          {/* Educational Module (Protected Routes) */}
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <CompanyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PersonalizedDashboardPage />} />
            <Route path="dashboard" element={<PersonalizedDashboardPage />} />
            <Route path="jobs" element={<JobsListingPage />} />
            <Route path="jobs/create" element={<CreateJobPage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route path="interviews" element={<InterviewsListingPage />} />
            <Route path="interviews/:id" element={<InterviewDetailsPage />} />
            <Route path="team" element={<TeamManagementPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="schemes" element={<SchemeDashboard />} />
            <Route path="ranking-search" element={<RankingSearch />} />
            <Route path="discipline-search" element={<DisciplineSearch />} />
            <Route path="hospital-search" element={<HospitalSearch />} />
            <Route path="hospital-favorites" element={<HospitalFavoritesPanel />} />
            <Route path="hospital-compare" element={<HospitalComparePanel />} />
            <Route path="ai-chatbot" element={<AIChatbot />} />

          </Route>

          {/* Legacy Company Routes - Redirect to Education */}
          <Route
            path="/company"
            element={
              <ProtectedRoute>
                <CompanyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PersonalizedDashboardPage />} />
            <Route path="dashboard" element={<PersonalizedDashboardPage />} />
            <Route path="jobs" element={<JobsListingPage />} />
            <Route path="jobs/create" element={<CreateJobPage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route path="interviews" element={<InterviewsListingPage />} />
            <Route path="interviews/:id" element={<InterviewDetailsPage />} />
            <Route path="team" element={<TeamManagementPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
            <Route path="hero-section" element={<HeroSection />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="compare" element={<Navigate to="/dashboard" replace />} />
            <Route path="schemes" element={<SchemeDashboard />} />
            <Route path="schemes/dashboard" element={<SchemeDashboard />} />
            <Route path="schemes/favorites" element={<SchemeFavoritesPanel />} />
            <Route path="schemes/compare" element={<SchemeComparePanel />} />
            <Route path="schemes/applications" element={<SchemeApplicationTracker />} />
            <Route path="schemes/settings" element={<SchemeSettings />} />
            <Route path="ranking-search" element={<RankingSearch />} />
            <Route path="discipline-search" element={<DisciplineSearch />} />
            <Route path="healthcare" element={<HospitalSearch />} />
            <Route path="healthcare-favorites" element={<HospitalFavoritesPanel />} />
            <Route path="healthcare-compare" element={<HospitalComparePanel />} />
            <Route path="ai-chatbot" element={<AIChatbot />} />

          </Route>

          {/* Protected Candidate routes */}

          {/* Government Scheme Module (Protected Routes) */}
          <Route
            path="/schemes"
            element={
              <ProtectedRoute>
                <SchemeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SchemeDashboard />} />
            <Route path="dashboard" element={<SchemeDashboard />} />
            <Route path="favorites" element={<SchemeFavoritesPanel />} />
            <Route path="compare" element={<SchemeComparePanel />} />
            <Route path="applications" element={<SchemeApplicationTracker />} />
            <Route path="settings" element={<SchemeSettings />} />
          </Route>

          {/* Companies route accessible at /companies */}
          <Route
            path="/companies"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Route index element={<CompanyManagementPage />} />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />

          {/* Protected Education Admin Routes */}
          <Route
            path="/admin/education"
            element={
              <AdminProtectedRoute requiredRole="education_admin">
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="companies" element={<CompanyManagementPage />} />
            <Route path="contact-information" element={<ContactInformationPage />} />
            <Route path="schemes" element={<AdminSchemeManagement />} />
            <Route path="settings" element={<EducationSettingsPage />} />
          </Route>

          {/* Protected Scheme Admin Routes */}
          <Route
            path="/admin/scheme"
            element={
              <AdminProtectedRoute requiredRole="scheme_admin">
                <SchemeAdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<SchemeAdminDashboard />} />
            <Route path="dashboard" element={<SchemeAdminDashboard />} />
            <Route path="schemes" element={<AdminSchemeManagement />} />
            <Route path="beneficiaries" element={<BeneficiariesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Protected Hospital Admin Routes */}
          <Route
            path="/admin/hospital"
            element={
              <AdminProtectedRoute requiredRole="hospital_admin">
                <HospitalAdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<HospitalAdminDashboard />} />
            <Route path="dashboard" element={<HospitalAdminDashboard />} />
            <Route path="hospitals" element={<HospitalManagementPage />} />
          </Route>

          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <AdminProtectedRoute requiredRole="super_admin">
                <SuperAdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="admins" element={<SuperAdminManageAdmins />} />
            <Route path="approvals" element={<SuperAdminPendingApprovals />} />
            <Route path="data" element={<SuperAdminDataOverview />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;