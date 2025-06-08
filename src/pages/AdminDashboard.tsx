import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // Verificar se o usuário é um administrador
  const isAdmin = user.app_metadata?.roles?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <RestaurantDashboard restaurantId={user.id} />
      </div>
    </div>
  );
};

export default AdminDashboard;
