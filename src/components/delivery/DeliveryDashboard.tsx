
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Package,
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryEarningsData } from '@/types/delivery';

const DeliveryDashboard = ({ 
  deliveryDetails, 
  isOnline, 
  currentOrder, 
  setCurrentOrder,
  availableOrders = [],
  onAcceptOrder
}) => {
  const [notifications, setNotifications] = useState([]);
  const [todayStats, setTodayStats] = useState({
    entregas: 0,
    ganhos: 0,
    rating: 0,
    distancia: 0
  });

  useEffect(() => {
    if (deliveryDetails) {
      loadNotifications();
      loadTodayStats();
    }
  }, [deliveryDetails]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_notifications')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .eq('lida', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('calculate_delivery_earnings', {
          delivery_detail_id: deliveryDetails.id,
          start_date: today,
          end_date: today
        });

      if (error) throw error;

      if (data && typeof data === 'object') {
        const earningsData = data as unknown as DeliveryEarningsData;
        setTodayStats({
          entregas: earningsData.total_entregas || 0,
          ganhos: earningsData.total_ganhos || 0,
          rating: deliveryDetails.rating_medio || 0,
          distancia: earningsData.distancia_total || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      toast.info('Pedido recusado');
    } catch (error) {
      console.error('Erro ao recusar pedido:', error);
    }
  };

  const completeDelivery = async () => {
    if (!currentOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'entregue' })
        .eq('id', currentOrder.id);

      if (error) throw error;

      // Registrar ganhos da entrega
      await supabase
        .from('delivery_earnings')
        .insert({
          delivery_detail_id: deliveryDetails.id,
          order_id: currentOrder.id,
          valor_base: 8.50, // Valor base da entrega
          gorjeta: 0,
          bonus: 0,
          desconto: 0,
          valor_total: 8.50,
          distancia_km: 2.5
        });

      setCurrentOrder(null);
      toast.success('Entrega concluída com sucesso!');
      loadTodayStats();
    } catch (error) {
      console.error('Erro ao finalizar entrega:', error);
      toast.error('Erro ao finalizar entrega');
    }
  };

  if (!isOnline) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Você está offline
            </h3>
            <p className="text-gray-600 mb-4">
              Ative o status online para começar a receber pedidos
            </p>
          </CardContent>
        </Card>

        {/* Estatísticas do Dia */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {todayStats.ganhos.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Ganhos Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todayStats.entregas}
              </div>
              <div className="text-sm text-gray-600">Entregas Hoje</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Entrega Atual */}
      {currentOrder && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Package className="h-5 w-5" />
              <span>Entrega em Andamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">{currentOrder.restaurant_details?.nome}</h4>
                <p className="text-sm text-gray-600">{currentOrder.restaurant_details?.endereco}</p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  R$ {currentOrder.total.toFixed(2)}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  2.5 km
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  15 min
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-1" />
                  Ligar
                </Button>
                <Button size="sm" variant="outline">
                  <Navigation className="h-4 w-4 mr-1" />
                  Navegar
                </Button>
                <Button 
                  size="sm" 
                  onClick={completeDelivery}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finalizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pedidos Disponíveis */}
      {!currentOrder && availableOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pedidos Disponíveis ({availableOrders.length})
          </h2>
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <Card key={order.id} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.restaurant_details?.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.restaurant_details?.endereco}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      R$ {order.total.toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>2.5 km</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>15 min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ 8.50</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onAcceptOrder(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                    <Button
                      onClick={() => rejectOrder(order.id)}
                      variant="outline"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resumo do Dia */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {todayStats.ganhos.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Ganhos Hoje</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {todayStats.entregas}
            </div>
            <div className="text-sm text-gray-600">Entregas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center space-x-1">
              <Star className="h-5 w-5 fill-current" />
              <span>{todayStats.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-gray-600">Avaliação</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {todayStats.distancia.toFixed(1)} km
            </div>
            <div className="text-sm text-gray-600">Distância</div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Notificações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.titulo}</h4>
                    <p className="text-sm text-gray-600">{notification.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {!currentOrder && availableOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aguardando pedidos
            </h3>
            <p className="text-gray-600">
              Você está online e pronto para receber pedidos!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryDashboard;
