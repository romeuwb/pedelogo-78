
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DeliveryProtectedRouteProps {
  children: React.ReactNode;
}

export const DeliveryProtectedRoute = ({ children }: DeliveryProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('DeliveryProtectedRoute - User:', user?.id);
  console.log('DeliveryProtectedRoute - Profile:', profile);
  console.log('DeliveryProtectedRoute - Loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('DeliveryProtectedRoute - No user or profile, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Permitir acesso se for admin ou entregador
  if (profile.tipo !== 'entregador' && profile.tipo !== 'admin') {
    console.log('DeliveryProtectedRoute - Not delivery or admin, redirecting to home:', profile.tipo);
    return <Navigate to="/" replace />;
  }

  console.log('DeliveryProtectedRoute - Access granted');
  return <>{children}</>;
};
