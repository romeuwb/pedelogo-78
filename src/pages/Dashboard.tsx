
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import OrderManagement from '@/components/orders/OrderManagement';
import { UserProfile } from '@/components/shared/UserProfile';

const Dashboard = () => {
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

  // Redirecionar para o DashboardRouter no App.tsx
  return <Navigate to="/dashboard" replace />;
};

export default Dashboard;
