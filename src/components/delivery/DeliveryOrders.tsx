
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Clock, 
  Phone,
  Navigation,
  Camera,
  CheckCircle,
  Package,
  Truck,
  User,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const DeliveryOrders = ({ deliveryDetails, currentOrder, setCurrentOrder }) => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    if (deliveryDetails) {
      loadActiveOrders();
      loadOrderHistory();
    }
  }, [deliveryDetails]);

  const loadActiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome, endereco, telefone),
          order_items (*),
          profiles:cliente_id (nome, telefone)
        `)
        .eq('entregador_id', deliveryDetails.user_id)
        .in('status', ['aceito_entregador', 'preparando', 'pronto_retirada', 'saiu_entrega'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveOrders(data || []);
      
      // Definir pedido atual se existir
      if (data && data.length > 0 && !currentOrder) {
        setCurrentOrder(data[0]);
        setOrderStatus(data[0].status);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome, endereco),
          delivery_earnings!inner (valor_total, gorjeta, tempo_entrega_minutos),
          delivery_ratings (nota, comentario)
        `)
        .eq('entregador_id', deliveryDetails.user_id)
        .eq('status', 'entregue')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOrderHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrderStatus(newStatus);
      
      // Recarregar dados
      loadActiveOrders();
      
      const statusMessages = {
        'caminho_restaurante': 'A caminho do restaurante',
        'chegou_restaurante': 'Chegou no restaurante',
        'pedido_retirado': 'Pedido retirado',
        'caminho_cliente': 'A caminho do cliente',
        'chegou_cliente': 'Chegou no cliente',
        'entregue': 'Pedido entregue!'
      };
      
      toast.success(statusMessages[newStatus] || 'Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'caminho_restaurante', label: 'A caminho do restaurante', icon: Truck },
      { key: 'chegou_restaurante', label: 'Chegou no restaurante', icon: MapPin },
      { key: 'pedido_retirado', label: 'Pedido retirado', icon: Package },
      { key: 'caminho_cliente', label: 'A caminho do cliente', icon: Truck },
      { key: 'chegou_cliente', label: 'Chegou no cliente', icon: MapPin },
      { key: 'entregue', label: 'Entregue', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
      next: index === currentIndex + 1
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Entregas Ativas ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico ({orderHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma entrega ativa
                </h3>
                <p className="text-gray-600">
                  Aceite um pedido para começar
                </p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">Pedido #{order.id.slice(-8)}</span>
                    <Badge variant={order.status === 'entregue' ? 'default' : 'secondary'}>
                      R$ {order.total.toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Informações do Restaurante */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Restaurante</h4>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Ligar
                      </Button>
                    </div>
                    <p className="font-medium">{order.restaurant_details?.nome}</p>
                    <p className="text-sm text-gray-600">{order.restaurant_details?.endereco}</p>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">Cliente</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Ligar
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                    <p className="font-medium">{order.profiles?.nome}</p>
                    <p className="text-sm text-gray-600">
                      {typeof order.endereco_entrega === 'object' 
                        ? `${order.endereco_entrega.rua}, ${order.endereco_entrega.numero}`
                        : order.endereco_entrega}
                    </p>
                    {order.observacoes && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        Obs: {order.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Progresso da Entrega</h4>
                    <div className="space-y-2">
                      {getStatusSteps(orderStatus || order.status).map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                          <div 
                            key={step.key}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                              step.completed 
                                ? 'bg-green-50 text-green-800' 
                                : step.current 
                                ? 'bg-orange-50 text-orange-800 border border-orange-200' 
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            <IconComponent className={`h-5 w-5 ${
                              step.completed ? 'text-green-600' : 
                              step.current ? 'text-orange-600' : 'text-gray-400'
                            }`} />
                            <span className="flex-1 font-medium">{step.label}</span>
                            {step.completed && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {step.next && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, step.key)}
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Confirmar
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Navigation className="h-4 w-4 mr-1" />
                      Navegar
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Camera className="h-4 w-4 mr-1" />
                      Foto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {orderHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma entrega no histórico
                </h3>
                <p className="text-gray-600">
                  Suas entregas aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            orderHistory.map((order) => (
              <Card key={order.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.restaurant_details?.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        R$ {order.delivery_earnings?.[0]?.valor_total.toFixed(2)}
                      </div>
                      {order.delivery_earnings?.[0]?.gorjeta > 0 && (
                        <div className="text-sm text-gray-600">
                          + R$ {order.delivery_earnings[0].gorjeta.toFixed(2)} gorjeta
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{order.delivery_earnings?.[0]?.tempo_entrega_minutos || 0} min</span>
                      </div>
                      {order.delivery_ratings?.[0] && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span>{order.delivery_ratings[0].nota}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">Entregue</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryOrders;
