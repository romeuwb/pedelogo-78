
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ClientProtectedRouteProps {
  children: React.ReactNode;
}

export const ClientProtectedRoute = ({ children }: ClientProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('ClientProtectedRoute - User:', user?.id);
  console.log('ClientProtectedRoute - Profile:', profile);
  console.log('ClientProtectedRoute - Loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('ClientProtectedRoute - No user or profile, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Permitir acesso se for admin ou cliente
  if (profile.tipo !== 'cliente' && profile.tipo !== 'admin') {
    console.log('ClientProtectedRoute - Not client or admin, redirecting to home:', profile.tipo);
    return <Navigate to="/" replace />;
  }

  console.log('ClientProtectedRoute - Access granted');
  return <>{children}</>;
};
