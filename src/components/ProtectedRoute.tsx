import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useData();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
