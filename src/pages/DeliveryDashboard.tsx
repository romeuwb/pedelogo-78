
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DeliveryApp from '@/components/delivery/DeliveryApp';
import RegistrationCompletionModal from '@/components/registration/RegistrationCompletionModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DeliveryDashboard = () => {
  const { user, profile } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const { data: deliveryDetails, isLoading } = useQuery({
    queryKey: ['delivery-details', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.tipo !== 'entregador') return null;
      
      const { data, error } = await supabase
        .from('delivery_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar delivery_details:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id && profile?.tipo === 'entregador',
    retry: 1
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!deliveryDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Você precisa completar o cadastro de entregador para acessar o dashboard.
            </p>
            <Button 
              onClick={() => setShowRegistrationModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Completar Cadastro
            </Button>
          </CardContent>
        </Card>
        
        <RegistrationCompletionModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          userType="entregador"
        />
      </div>
    );
  }

  return <DeliveryApp />;
};

export default DeliveryDashboard;
