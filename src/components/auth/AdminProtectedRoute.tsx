
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('AdminProtectedRoute - User:', user?.id);
  console.log('AdminProtectedRoute - Profile:', profile);
  console.log('AdminProtectedRoute - Loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('AdminProtectedRoute - Redirecting to auth (no user or profile)');
    return <Navigate to="/auth" replace />;
  }

  if (profile.tipo !== 'admin') {
    console.log('AdminProtectedRoute - Redirecting to home (not admin):', profile.tipo);
    return <Navigate to="/" replace />;
  }

  console.log('AdminProtectedRoute - Access granted to admin');
  return <>{children}</>;
};
