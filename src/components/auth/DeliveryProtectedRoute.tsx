
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DeliveryProtectedRouteProps {
  children: React.ReactNode;
}

export const DeliveryProtectedRoute = ({ children }: DeliveryProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (profile.tipo !== 'entregador') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
