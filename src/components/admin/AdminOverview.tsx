
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Store,
  Truck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [
        ordersResult,
        usersResult,
        restaurantsResult,
        deliveryResult,
        revenueResult,
        ticketsResult
      ] = await Promise.allSettled([
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('profiles').select('id, tipo, created_at'),
        supabase.from('restaurant_details').select('id, status_aprovacao'),
        supabase.from('delivery_details').select('id, status_aprovacao'),
        supabase.from('orders').select('total').eq('status', 'entregue'),
        supabase.from('support_tickets').select('id, status')
      ]);

      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const restaurants = restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.data || [] : [];
      const delivery = deliveryResult.status === 'fulfilled' ? deliveryResult.value.data || [] : [];
      const revenue = revenueResult.status === 'fulfilled' ? revenueResult.value.data || [] : [];
      const tickets = ticketsResult.status === 'fulfilled' ? ticketsResult.value.data || [] : [];

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      return {
        totalOrders: orders.length,
        todayOrders: orders.filter(o => new Date(o.created_at) >= todayStart).length,
        activeOrders: orders.filter(o => ['pendente', 'preparando', 'saiu_entrega'].includes(o.status)).length,
        totalUsers: users.length,
        newUsersToday: users.filter(u => new Date(u.created_at) >= todayStart).length,
        totalClients: users.filter(u => u.tipo === 'cliente').length,
        totalRestaurants: restaurants.length,
        pendingRestaurants: restaurants.filter(r => r.status_aprovacao === 'pendente').length,
        totalDelivery: delivery.length,
        pendingDelivery: delivery.filter(d => d.status_aprovacao === 'pendente').length,
        totalRevenue: revenue.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
        openTickets: tickets.filter(t => t.status === 'aberto').length,
        totalTickets: tickets.length
      };
    }
  });

  const cards = [
    {
      title: 'Pedidos Hoje',
      value: stats?.todayOrders || 0,
      total: stats?.totalOrders || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pedidos Ativos',
      value: stats?.activeOrders || 0,
      total: stats?.totalOrders || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Usuários',
      value: stats?.newUsersToday || 0,
      total: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Restaurantes',
      value: stats?.pendingRestaurants || 0,
      total: stats?.totalRestaurants || 0,
      icon: Store,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Entregadores',
      value: stats?.pendingDelivery || 0,
      total: stats?.totalDelivery || 0,
      icon: Truck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Faturamento',
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      total: null,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de delivery</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {card.total !== null && (
                  <p className="text-xs text-gray-500">
                    Total: {card.total}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas e notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Pendências</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.pendingRestaurants ? (
              <div className="flex items-center justify-between">
                <span>Restaurantes aguardando aprovação</span>
                <Badge variant="secondary">{stats.pendingRestaurants}</Badge>
              </div>
            ) : null}
            {stats?.pendingDelivery ? (
              <div className="flex items-center justify-between">
                <span>Entregadores aguardando aprovação</span>
                <Badge variant="secondary">{stats.pendingDelivery}</Badge>
              </div>
            ) : null}
            {stats?.openTickets ? (
              <div className="flex items-center justify-between">
                <span>Tickets de suporte em aberto</span>
                <Badge variant="destructive">{stats.openTickets}</Badge>
              </div>
            ) : null}
            {!stats?.pendingRestaurants && !stats?.pendingDelivery && !stats?.openTickets && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Nenhuma pendência no momento</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Novos usuários hoje</span>
                <span className="font-medium">{stats?.newUsersToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Pedidos hoje</span>
                <span className="font-medium">{stats?.todayOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tickets abertos</span>
                <span className="font-medium">{stats?.openTickets || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
