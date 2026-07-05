import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/admin/pages/Dashboard";
import ManageLabour from "../features/admin/pages/ManageLabour";
import Attendance from "../features/admin/pages/Attendance";
import Cashbook from "../features/admin/pages/Cashbook";
import ManageSalary from "../features/admin/pages/ManageSalary";
import Settings from "../features/admin/pages/Settings";

// Labour Module Imports
import LabourLayout from "../layouts/LabourLayout";
import LabourDashboard from "../features/labour/pages/LabourDashboard";
import Home from "../features/public/pages/Home";
import AuthPage from "../features/auth/pages/AuthPage";
import LabourSettings from "../features/labour/pages/LabourSettings";
import ManageSites from "../features/admin/pages/ManageSites";
import AdminProfile from "../features/admin/pages/AdminProfile";
import LabourProfile from "../features/labour/pages/LabourProfile";
// import AddLabour from "../features/admin/pages/AddLabour";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Redirect */}
        {/* <Route path="/" element={<Navigate to="/admin/dashboard" replace />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* 🛰️ Admin Protected Onboarding Link */}
        {/* <Route path="/admin/add-labour" element={<AddLabour />} /> */}

        {/* Fallback redirect if user enters a random URL */}
        {/* <Route path="*" element={<Navigate to="/admin/add-labour" replace />} /> */}

        {/* ADMIN MODULE ROUTES */}
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

        {/* LABOUR MODULE ROUTES */}
        <Route path="/labour" element={<LabourLayout />}>
          <Route path="dashboard" element={<LabourDashboard />} />
          <Route path="settings" element={<LabourSettings />} />
          <Route path="profile" element={<LabourProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
