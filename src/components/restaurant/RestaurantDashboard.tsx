
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestaurantOrdersPanel } from './RestaurantOrdersPanel';
import { RestaurantMenuPanel } from './RestaurantMenuPanel';
import { RestaurantFinancialPanel } from './RestaurantFinancialPanel';
import { RestaurantSettings } from './RestaurantSettings';
import { 
  Package, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';

interface RestaurantDashboardProps {
  restaurantId: string;
  userId: string;
}

const RestaurantDashboard = ({ restaurantId, userId }: RestaurantDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isOnline, setIsOnline] = useState(true);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['restaurant-stats', restaurantId, selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurante_id', restaurantId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusCounts,
        pendingOrders: statusCounts.pendente || 0,
        completedOrders: statusCounts.entregue || 0
      };
    }
  });

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-details', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          created_at,
          cliente_profile:profiles!orders_cliente_id_fkey (nome)
        `)
        .eq('restaurante_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-500',
      'confirmado': 'bg-blue-500',
      'preparando': 'bg-orange-500',
      'pronto': 'bg-green-500',
      'saiu_entrega': 'bg-purple-500',
      'entregue': 'bg-emerald-500',
      'cancelado': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Restaurante</h1>
          <p className="text-gray-600">{restaurant?.nome_fantasia}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={isOnline ? "default" : "secondary"}
            onClick={() => setIsOnline(!isOnline)}
            className="flex items-center space-x-2"
          >
            {isOnline ? (
              <>
                <Eye className="h-4 w-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Offline</span>
              </>
            )}
          </Button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alertas importantes */}
      {stats?.pendingOrders > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                Você tem {stats.pendingOrders} pedido(s) pendente(s) aguardando confirmação!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.pendingOrders || 0} pendentes
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-2xl font-bold">R$ {stats?.totalRevenue?.toFixed(2) || '0,00'}</p>
                <p className="text-xs text-gray-500">
                  ~R$ {((stats?.totalRevenue || 0) * 0.85).toFixed(2)} líquido
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {stats?.averageOrderValue?.toFixed(2) || '0,00'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className={isOnline ? 'bg-green-500' : 'bg-gray-500'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {restaurant?.status_aprovacao}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Pedidos e Pedidos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.statusCounts && Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(status)} text-white border-0`}
                  >
                    {status.replace('_', ' ')}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{order.cliente_profile?.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                    <Badge 
                      className={`${getStatusColor(order.status)} text-white text-xs`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="menu">Cardápio</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <RestaurantOrdersPanel restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="menu">
          <RestaurantMenuPanel restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="financial">
          <RestaurantFinancialPanel restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="settings">
          <RestaurantSettings restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboard;
