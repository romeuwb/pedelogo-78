
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import OrderManagement from '@/components/orders/OrderManagement';
import { UserProfile } from '@/components/shared/UserProfile';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  const userType = user.user_metadata?.tipo || 'cliente';

  if (userType === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel de Administrador</h1>
            <UserProfile />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Funcionalidades administrativas em desenvolvimento.</p>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <UserProfile />
          </div>
          <OrderManagement userType="customer" />
        </div>
      </div>
    );
  }

  if (userType === 'entregador') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Entregador</h1>
            <UserProfile />
          </div>
          <OrderManagement userType="delivery" />
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
