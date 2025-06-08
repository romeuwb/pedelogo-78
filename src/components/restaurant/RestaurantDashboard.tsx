
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Package, Settings, MapPin, MessageSquare, Calculator, ClipboardList } from 'lucide-react';
import { RestaurantMenuPanel } from './RestaurantMenuPanel';
import { DeliveryRouteOptimizer } from './DeliveryRouteOptimizer';
import { RestaurantSettings } from './RestaurantSettings';
import { CustomerCommunication } from './CustomerCommunication';
import TableManagementPage from './TableManagementPage';
import { POSSystemPage } from './POSSystemPage';
import { UserProfile } from '@/components/shared/UserProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantDashboardProps {
  restaurantId?: string;
}

const RestaurantDashboard = ({ restaurantId: propRestaurantId }: RestaurantDashboardProps) => {
  const { user } = useAuth();

  // Buscar o restaurant_id do usuário logado se não foi fornecido via props
  const { data: restaurantDetails } = useQuery({
    queryKey: ['restaurant-details', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Buscando detalhes do restaurante para user_id:', user.id);
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('id, nome_fantasia, user_id')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar detalhes do restaurante:', error);
        throw error;
      }
      
      console.log('Detalhes do restaurante encontrados:', data);
      return data;
    },
    enabled: !!user?.id && !propRestaurantId
  });

  // Usar o restaurantId das props ou dos detalhes do restaurante
  const finalRestaurantId = propRestaurantId || restaurantDetails?.id;

  // Debug: Log the restaurant ID being used
  useEffect(() => {
    console.log('RestaurantDashboard - finalRestaurantId:', finalRestaurantId);
    console.log('RestaurantDashboard - propRestaurantId:', propRestaurantId);
    console.log('RestaurantDashboard - restaurantDetails?.id:', restaurantDetails?.id);
    console.log('RestaurantDashboard - user?.id:', user?.id);
  }, [finalRestaurantId, propRestaurantId, restaurantDetails?.id, user?.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando dados do usuário...</p>
      </div>
    );
  }

  if (!finalRestaurantId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Restaurante</h1>
            <p className="text-gray-600">Configurando seu restaurante...</p>
          </div>
          <UserProfile />
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum restaurante encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Você precisa ter um restaurante cadastrado para acessar este painel.
          </p>
          <p className="text-sm text-gray-400">
            User ID: {user.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Restaurante</h1>
          <p className="text-gray-600">Gerencie seu restaurante de forma completa</p>
          {restaurantDetails?.nome_fantasia && (
            <p className="text-sm text-gray-500">{restaurantDetails.nome_fantasia}</p>
          )}
        </div>
        <UserProfile />
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-blue-50 rounded text-sm border">
        <p><strong>Restaurant ID em uso:</strong> {finalRestaurantId}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Fonte do Restaurant ID:</strong> {propRestaurantId ? 'Props' : 'Banco de dados'}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cardápio
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mesas
          </TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            POS
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Rotas
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% em relação a ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 1.234,56</div>
                <p className="text-xs text-muted-foreground">+8% em relação a ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/12</div>
                <p className="text-xs text-muted-foreground">67% de ocupação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens no Cardápio</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foregreen">3 novos esta semana</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de vendas será exibido aqui
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <RestaurantMenuPanel restaurantId={finalRestaurantId} />
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <TableManagementPage restaurantId={finalRestaurantId} />
        </TabsContent>

        <TabsContent value="pos" className="mt-6">
          <POSSystemPage restaurantId={finalRestaurantId} />
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <DeliveryRouteOptimizer restaurantId={finalRestaurantId} />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CustomerCommunication restaurantId={finalRestaurantId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <RestaurantSettings restaurantId={finalRestaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboard;
