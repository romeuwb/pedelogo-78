
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import DeliveryApp from '@/components/delivery/DeliveryApp';
import OrderManagement from '@/components/orders/OrderManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  const { data: restaurantDetails, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant-details', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.tipo !== 'restaurante') return null;
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && profile?.tipo === 'restaurante'
  });

  const { data: deliveryDetails, isLoading: deliveryLoading } = useQuery({
    queryKey: ['delivery-details', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.tipo !== 'entregador') return null;
      
      const { data, error } = await supabase
        .from('delivery_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && profile?.tipo === 'entregador'
  });

  if (loading || restaurantLoading || deliveryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para acessar o dashboard.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Ir para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.tipo) {
      case 'restaurante':
        if (!restaurantDetails) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Configuração Necessária</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Você precisa completar o cadastro do seu restaurante para acessar o dashboard.
                </p>
                <Button>Completar Cadastro</Button>
              </CardContent>
            </Card>
          );
        }
        return (
          <RestaurantDashboard 
            restaurantId={restaurantDetails.id} 
            userId={user.id} 
          />
        );

      case 'entregador':
        return <DeliveryApp />;

      case 'cliente':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Meus Pedidos</h1>
            <OrderManagement userType="customer" userId={user.id} />
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Funcionalidades administrativas serão implementadas em breve.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de usuário não reconhecido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Entre em contato com o suporte para resolver este problema.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
