import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import OrderManagement from '@/components/orders/OrderManagement';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  const userType = user.user_metadata?.tipo || 'cliente';

  if (userType === 'admin') {
    return <div>Painel de Administrador</div>;
  }

  if (userType === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <OrderManagement userType="customer" userId={user.id} />
        </div>
      </div>
    );
  }

  if (userType === 'entregador') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <OrderManagement userType="delivery" userId={user.id} />
        </div>
      </div>
    );
  }

  // Para o caso do restaurante:
  if (userType === 'restaurante') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <RestaurantDashboard restaurantId={user.id} />
        </div>
      </div>
    );
  }

  return <div>Tipo de usuário não reconhecido.</div>;
};

export default Dashboard;
