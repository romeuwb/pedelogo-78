
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard - user type:', profile.tipo);

  // Para usuários do tipo restaurante, mostrar o RestaurantDashboard
  if (profile.tipo === 'restaurante') {
    return <RestaurantDashboard restaurantId={user.id} />;
  }

  // Para outros tipos de usuário
  if (profile.tipo === 'admin') {
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

  if (profile.tipo === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <UserProfile />
          </div>
          <OrderManagement userType="customer" userId={user.id} />
        </div>
      </div>
    );
  }

  if (profile.tipo === 'entregador') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Entregador</h1>
            <UserProfile />
          </div>
          <OrderManagement userType="delivery" userId={user.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Tipo de usuário não reconhecido</h2>
        <p className="text-gray-600">Tipo: {profile.tipo}</p>
      </div>
    </div>
  );
};

export default Dashboard;
