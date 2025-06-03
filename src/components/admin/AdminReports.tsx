
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Package,
  Store,
  Truck
} from 'lucide-react';

export const AdminReports = () => {
  const { data: reportData } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const [
        ordersResult,
        usersResult,
        restaurantsResult,
        deliveryResult,
        reviewsResult
      ] = await Promise.allSettled([
        supabase.from('orders').select('id, total, status, created_at, restaurante_id'),
        supabase.from('profiles').select('id, tipo, created_at'),
        supabase.from('restaurant_details').select('id, categoria, created_at'),
        supabase.from('delivery_details').select('id, created_at'),
        supabase.from('reviews').select('nota, tipo_avaliacao, created_at')
      ]);

      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const restaurants = restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.data || [] : [];
      const delivery = deliveryResult.status === 'fulfilled' ? deliveryResult.value.data || [] : [];
      const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value.data || [] : [];

      // Análise temporal (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const ordersByDay = last7Days.map(day => ({
        day,
        count: orders.filter(o => o.created_at.startsWith(day)).length,
        revenue: orders
          .filter(o => o.created_at.startsWith(day) && o.status === 'entregue')
          .reduce((sum, o) => sum + Number(o.total), 0)
      }));

      // Top restaurantes
      const restaurantStats = restaurants.map(restaurant => ({
        id: restaurant.id,
        categoria: restaurant.categoria,
        orders: orders.filter(o => o.restaurante_id === restaurant.id).length,
        revenue: orders
          .filter(o => o.restaurante_id === restaurant.id && o.status === 'entregue')
          .reduce((sum, o) => sum + Number(o.total), 0)
      })).sort((a, b) => b.revenue - a.revenue);

      // Estatísticas de usuários
      const userStats = {
        total: users.length,
        clientes: users.filter(u => u.tipo === 'cliente').length,
        restaurantes: users.filter(u => u.tipo === 'restaurante').length,
        entregadores: users.filter(u => u.tipo === 'entregador').length
      };

      // Avaliações médias
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.nota, 0) / reviews.length 
        : 0;

      return {
        ordersByDay,
        restaurantStats: restaurantStats.slice(0, 10),
        userStats,
        avgRating,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'entregue').length,
        totalRevenue: orders
          .filter(o => o.status === 'entregue')
          .reduce((sum, o) => sum + Number(o.total), 0)
      };
    }
  });

  const exportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório...');
  };

  const cards = [
    {
      title: 'Total de Pedidos',
      value: reportData?.totalOrders || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pedidos Concluídos',
      value: reportData?.completedOrders || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total de Usuários',
      value: reportData?.userStats?.total || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avaliação Média',
      value: reportData?.avgRating ? reportData.avgRating.toFixed(1) : '0.0',
      icon: BarChart3,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600">Análise de dados e relatórios de performance</p>
        </div>
        
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData?.ordersByDay?.map((day, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">
                    {new Date(day.day).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{day.count} pedidos</Badge>
                    <span className="text-sm font-medium">
                      R$ {day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Clientes</span>
                </div>
                <Badge variant="secondary">{reportData?.userStats?.clientes || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-green-600" />
                  <span>Restaurantes</span>
                </div>
                <Badge variant="secondary">{reportData?.userStats?.restaurantes || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-purple-600" />
                  <span>Entregadores</span>
                </div>
                <Badge variant="secondary">{reportData?.userStats?.entregadores || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top restaurantes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Restaurantes por Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.restaurantStats?.map((restaurant, index) => (
              <div key={restaurant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <span className="font-medium">Restaurante {restaurant.id.slice(0, 8)}</span>
                    <div className="text-sm text-gray-500">{restaurant.categoria}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    R$ {restaurant.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">{restaurant.orders} pedidos</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
