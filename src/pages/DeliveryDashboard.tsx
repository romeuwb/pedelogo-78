
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DeliveryApp from '@/components/delivery/DeliveryApp';

const DeliveryDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para acessar o painel do entregador.
          </p>
        </div>
      </div>
    );
  }

  return <DeliveryApp />;
};

export default DeliveryDashboard;
