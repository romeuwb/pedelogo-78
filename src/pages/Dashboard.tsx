
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';
import { AdminOverview } from '@/components/admin/AdminOverview';
import OrderManagement from '@/components/orders/OrderManagement';
import RegistrationCompletionModal from '@/components/registration/RegistrationCompletionModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Verificar se o usuário é admin
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      console.log('Verificando se usuario é admin:', user.id);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role, ativo')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
      }

      console.log('Resultado da verificação admin:', data);
      return !!data;
    },
    enabled: !!user?.id && profile?.tipo === 'admin',
    retry: 1
  });

  const { data: restaurantDetails, isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant-details', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.tipo !== 'restaurante') return null;
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar restaurant_details:', error);
        throw error;
      }
      
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

  // Redirecionamento automático baseado no tipo de usuário
  useEffect(() => {
    if (!loading && user && profile) {
      const currentPath = window.location.pathname;
      
      // Se já está na rota correta, não redirecionar
      if (currentPath !== '/dashboard') return;
      
      switch (profile.tipo) {
        case 'entregador':
          if (deliveryDetails && currentPath === '/dashboard') {
            window.location.href = '/delivery-dashboard';
            return;
          }
          break;
        case 'cliente':
          if (currentPath === '/dashboard') {
            window.location.href = '/client-dashboard';
            return;
          }
          break;
        case 'admin':
          if (isAdmin && currentPath === '/dashboard') {
            window.location.href = '/admin';
            return;
          }
          break;
      }
    }
  }, [user, profile, loading, deliveryDetails, isAdmin]);

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

  if (loading || restaurantLoading || deliveryLoading || adminLoading) {
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
                  <Button 
                    onClick={() => setShowRegistrationModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Completar Cadastro
                  </Button>
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
          // Redirecionar para o painel específico do entregador
          if (deliveryDetails) {
            window.location.href = '/delivery-dashboard';
            return <div>Redirecionando...</div>;
          }
          
          return (
            <Card>
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
          );

        case 'cliente':
          // Redirecionar para o painel do cliente
          window.location.href = '/client-dashboard';
          return <div>Redirecionando...</div>;

        case 'admin':
          // Para admins, verificar se realmente tem permissão
          if (isAdmin) {
            window.location.href = '/admin';
            return <div>Redirecionando...</div>;
          } else {
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Acesso Negado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Você não tem permissões de administrador ativas.
                  </p>
                </CardContent>
              </Card>
            );
          }

        default:
          return (
            <Card>
              <CardHeader>
                <CardTitle>Tipo de usuário não reconhecido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tipo de usuário: {profile.tipo}
                </p>
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
            <pre className="text-xs text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </pre>
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
      
      {/* Modal de completar cadastro */}
      <RegistrationCompletionModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        userType={profile.tipo as 'restaurante' | 'entregador'}
      />
    </div>
  );
};

export default Dashboard;
