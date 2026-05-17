// src/components/layout/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
