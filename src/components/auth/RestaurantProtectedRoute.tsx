
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantProtectedRouteProps {
  children: React.ReactNode;
}

export const RestaurantProtectedRoute = ({ children }: RestaurantProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('RestaurantProtectedRoute - User:', user?.id);
  console.log('RestaurantProtectedRoute - Profile:', profile);
  console.log('RestaurantProtectedRoute - Loading:', loading);

  // Se ainda está carregando ou se tem usuário mas não tem perfil ainda
  if (loading || (user && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('RestaurantProtectedRoute - No user or profile, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Permitir acesso se for admin ou restaurante
  if (profile.tipo !== 'restaurante' && profile.tipo !== 'admin') {
    console.log('RestaurantProtectedRoute - Not restaurant or admin, redirecting to home:', profile.tipo);
    return <Navigate to="/" replace />;
  }

  console.log('RestaurantProtectedRoute - Access granted');
  return <>{children}</>;
};
