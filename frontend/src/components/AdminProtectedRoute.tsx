import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "education_admin" | "scheme_admin" | "hospital_admin" | "super_admin";
}

const clearAdminStorage = () => {
  localStorage.removeItem("admin");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminModule");
};

const AdminProtectedRoute = ({ children, requiredRole }: AdminProtectedRouteProps) => {
  const location = useLocation();

  // Check if admin is logged in
  const adminData = localStorage.getItem("admin");
  const adminToken = localStorage.getItem("adminToken");

  if (!adminData || !adminToken) {
    if (requiredRole === "super_admin" || location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Parse admin data
  let admin: { role?: string } = {};
  try {
    admin = JSON.parse(adminData);
  } catch {
    clearAdminStorage();
    if (requiredRole === "super_admin" || location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (!admin?.role) {
    clearAdminStorage();
    if (requiredRole === "super_admin" || location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check it strictly
  if (requiredRole && admin.role !== requiredRole) {
    if (requiredRole === "super_admin") {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;