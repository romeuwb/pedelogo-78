
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, DollarSign, Package, CheckCircle, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DeliveryOrderDetails from './DeliveryOrderDetails';

interface DeliveryOrdersGlobalProps {
  deliveryDetails: any;
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
}

const DeliveryOrdersGlobal: React.FC<DeliveryOrdersGlobalProps> = ({
  deliveryDetails,
  currentOrder,
  setCurrentOrder
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Buscar pedidos disponíveis
  const { data: availableOrders, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-orders', deliveryDetails?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome_fantasia, endereco, telefone),
          order_items (*),
          profiles:cliente_id (nome, telefone)
        `)
        .is('entregador_id', null)
        .eq('status', 'confirmado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!deliveryDetails?.id && deliveryDetails?.status_online,
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  // Buscar pedidos aceitos
  const { data: acceptedOrders, isLoading: loadingAccepted } = useQuery({
    queryKey: ['accepted-orders', deliveryDetails?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome_fantasia, endereco, telefone),
          order_items (*),
          profiles:cliente_id (nome, telefone)
        `)
        .eq('entregador_id', deliveryDetails?.user_id)
        .in('status', ['aceito_entregador', 'caminho_restaurante', 'chegou_restaurante', 'pedido_retirado', 'caminho_cliente', 'chegou_cliente'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!deliveryDetails?.user_id,
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  // Buscar histórico de entregas
  const { data: deliveryHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['delivery-history', deliveryDetails?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome_fantasia),
          delivery_earnings!inner (valor_total, gorjeta, bonus)
        `)
        .eq('entregador_id', deliveryDetails?.user_id)
        .eq('status', 'entregue')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!deliveryDetails?.user_id
  });

  // Aceitar pedido
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          entregador_id: deliveryDetails.user_id,
          status: 'aceito_entregador',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .is('entregador_id', null); // Garantir que ainda não foi aceito

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pedido aceito com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['accepted-orders'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao aceitar pedido: ' + error.message);
    }
  });

  // Atualizar status do pedido
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado');
      queryClient.invalidateQueries({ queryKey: ['accepted-orders'] });
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'updated' });
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmado': 'bg-blue-100 text-blue-800',
      'aceito_entregador': 'bg-green-100 text-green-800',
      'caminho_restaurante': 'bg-yellow-100 text-yellow-800',
      'chegou_restaurante': 'bg-orange-100 text-orange-800',
      'pedido_retirado': 'bg-purple-100 text-purple-800',
      'caminho_cliente': 'bg-indigo-100 text-indigo-800',
      'chegou_cliente': 'bg-pink-100 text-pink-800',
      'entregue': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'confirmado': 'Disponível',
      'aceito_entregador': 'Aceito',
      'caminho_restaurante': 'Indo ao restaurante',
      'chegou_restaurante': 'No restaurante',
      'pedido_retirado': 'Pedido retirado',
      'caminho_cliente': 'Indo ao cliente',
      'chegou_cliente': 'No cliente',
      'entregue': 'Entregue'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const calculateDistance = (order: any) => {
    // Simular cálculo de distância - em produção usar API de mapas
    return (Math.random() * 10 + 1).toFixed(1);
  };

  const calculateDeliveryFee = (distance: number) => {
    // Cálculo simples da taxa - R$ 2,00 base + R$ 0,50 por km
    return (2 + (distance * 0.5)).toFixed(2);
  };

  if (showDetails && selectedOrder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Detalhes do Pedido</h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowDetails(false);
              setSelectedOrder(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <DeliveryOrderDetails
          order={selectedOrder}
          onStatusUpdate={(newStatus) => {
            updateOrderStatusMutation.mutate({
              orderId: selectedOrder.id,
              newStatus
            });
          }}
          onComplete={() => {
            setShowDetails(false);
            setSelectedOrder(null);
            queryClient.invalidateQueries({ queryKey: ['accepted-orders'] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Disponíveis ({availableOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos ({acceptedOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {!deliveryDetails?.status_online ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Você está offline</h3>
                <p className="text-gray-600">
                  Fique online para ver pedidos disponíveis
                </p>
              </CardContent>
            </Card>
          ) : loadingAvailable ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando pedidos...</p>
            </div>
          ) : availableOrders?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Nenhum pedido disponível</h3>
                <p className="text-gray-600">
                  Aguarde novos pedidos aparecerem
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order) => {
                const distance = parseFloat(calculateDistance(order));
                const deliveryFee = calculateDeliveryFee(distance);
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {order.restaurant_details?.nome_fantasia || 'Restaurante'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pedido #{order.id.slice(-8)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Valor do pedido</p>
                            <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Distância</p>
                            <p className="font-medium">{distance} km</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Há</p>
                            <p className="font-medium">
                              {Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60))} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Ganho estimado</p>
                            <p className="font-medium text-green-600">R$ {deliveryFee}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        
                        <Button
                          onClick={() => acceptOrderMutation.mutate(order.id)}
                          disabled={acceptOrderMutation.isPending}
                          size="sm"
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aceitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {loadingAccepted ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando pedidos ativos...</p>
            </div>
          ) : acceptedOrders?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Nenhum pedido ativo</h3>
                <p className="text-gray-600">
                  Aceite pedidos para começar a entregar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedOrders.map((order) => (
                <Card key={order.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {order.restaurant_details?.nome_fantasia || 'Restaurante'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pedido #{order.id.slice(-8)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Valor</p>
                          <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-600">Aceito há</p>
                          <p className="font-medium">
                            {Math.floor((Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60))} min
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Gerenciar Entrega
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando histórico...</p>
            </div>
          ) : deliveryHistory?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Nenhuma entrega realizada</h3>
                <p className="text-gray-600">
                  Suas entregas concluídas aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {deliveryHistory.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {order.restaurant_details?.nome_fantasia || 'Restaurante'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Entregue
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor do pedido</p>
                        <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Ganho</p>
                        <p className="font-medium text-green-600">
                          R$ {order.delivery_earnings?.[0]?.valor_total?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Gorjeta</p>
                        <p className="font-medium text-blue-600">
                          R$ {order.delivery_earnings?.[0]?.gorjeta?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryOrdersGlobal;
