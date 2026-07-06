import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Assumes you save 'admin' or 'labour' on login

  // 1. If no token context parameters are present, evict user to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If roles are restricted and user role doesn't match criteria, block access
  if (allowedRoles && !allowedRoles.includes(userRole?.toLowerCase())) {
    // If an admin tries to hit worker route or vice versa, safely redirect based on identity
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/labour/dashboard'} replace />;
  }

  // 3. Render sub-route layout structures safely
  return <Outlet />;
}