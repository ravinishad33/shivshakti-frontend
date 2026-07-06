import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/admin/pages/Dashboard";
import ManageLabour from "../features/admin/pages/ManageLabour";
import Attendance from "../features/admin/pages/Attendance";
import Cashbook from "../features/admin/pages/Cashbook";
import ManageSalary from "../features/admin/pages/ManageSalary";
import Settings from "../features/admin/pages/Settings";
import ManageSites from "../features/admin/pages/ManageSites";
import AdminProfile from "../features/admin/pages/AdminProfile";

// Labour Module Imports
import LabourLayout from "../layouts/LabourLayout";
import LabourDashboard from "../features/labour/pages/LabourDashboard";
import LabourSettings from "../features/labour/pages/LabourSettings";
import LabourProfile from "../features/labour/pages/LabourProfile";

// Public Imports
import Home from "../features/public/pages/Home";
import AuthPage from "../features/auth/pages/AuthPage";
import PageNotFound from "../features/public/pages/PageNotFound";

// 🚀 Security Gate Component Import
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC PATHS ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />

        {/* ================= PROTECTED ADMIN MODULE ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="labour" element={<ManageLabour />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="cashbook" element={<Cashbook />} />
            <Route path="salary" element={<ManageSalary />} />
            <Route path="sites" element={<ManageSites />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ================= PROTECTED LABOUR MODULE ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={['labour']} />}>
          <Route path="/labour" element={<LabourLayout />}>
            <Route path="dashboard" element={<LabourDashboard />} />
            <Route path="settings" element={<LabourSettings />} />
            <Route path="profile" element={<LabourProfile />} />
          </Route>
        </Route>

        {/* ================= WILDCARD CATCH-ALL (MUST BE AT BOTTOM) ================= */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}