
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/shared/UserProfile';

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie toda a plataforma</p>
          </div>
          <UserProfile />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Administração do Sistema</h2>
          <p className="text-gray-600">Funcionalidades administrativas serão implementadas aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
