import React from 'react';
import { POSSystemPage as POSSystem } from '@/components/restaurant/POSSystemPage';
import { RestaurantProtectedRoute } from '@/components/auth/RestaurantProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const POSSystemPage = () => {
  const { profile } = useAuth();
  
  if (!profile?.id) {
    return <div>Carregando...</div>;
  }

  return (
    <RestaurantProtectedRoute>
      <POSSystem restaurantId={profile.id} />
    </RestaurantProtectedRoute>
  );
};

export default POSSystemPage;