import React from 'react';
import TableManagement from '@/components/restaurant/TableManagementPage';
import { RestaurantProtectedRoute } from '@/components/auth/RestaurantProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const TableManagementPage = () => {
  const { profile } = useAuth();
  
  if (!profile?.id) {
    return <div>Carregando...</div>;
  }

  return (
    <RestaurantProtectedRoute>
      <TableManagement restaurantId={profile.id} />
    </RestaurantProtectedRoute>
  );
};

export default TableManagementPage;