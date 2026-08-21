import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Guards a route behind authentication and, optionally, a set of
 * permitted roles. Redirects unauthenticated users to /login and
 * unauthorized ones to /dashboard.
 */
const normalizeRole = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <LoadingSpinner label="Checking your session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const normalizedUserRole = normalizeRole(user.role);
    const allowedRoleSet = new Set(allowedRoles.map(normalizeRole));

    if (!allowedRoleSet.has(normalizedUserRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
