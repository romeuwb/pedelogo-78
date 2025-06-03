
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import { AdminOverview } from '@/components/admin/AdminOverview';
import OrderManagement from '@/components/orders/OrderManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: restaurantDetails, isLoading: restaurantLoading, error: restaurantError } = useQuery({
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
    enabled: !!user?.id && profile?.tipo === 'restaurante',
    retry: 1
  });

  const { data: deliveryDetails, isLoading: deliveryLoading, error: deliveryError } = useQuery({
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
    enabled: !!user?.id && profile?.tipo === 'entregador',
    retry: 1
  });

  useEffect(() => {
    if (restaurantError) {
      setError('Erro ao carregar dados do restaurante');
      console.error('Restaurant error:', restaurantError);
    }
    if (deliveryError) {
      setError('Erro ao carregar dados do entregador');
      console.error('Delivery error:', deliveryError);
    }
  }, [restaurantError, deliveryError]);

  if (loading || restaurantLoading || deliveryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    try {
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
          return (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Dashboard do Entregador</h1>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">
                    Painel do entregador será implementado em breve.
                  </p>
                  {deliveryDetails && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Status: {deliveryDetails.status_aprovacao}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );

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
              <AdminOverview />
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
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro no Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Ocorreu um erro ao carregar o dashboard. Tente recarregar a página.
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
