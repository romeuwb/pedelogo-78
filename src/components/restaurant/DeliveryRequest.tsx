import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star,
  AlertCircle,
  CheckCircle,
  Users,
  Navigation
} from 'lucide-react';

interface DeliveryRequestProps {
  restaurantId: string;
  orderId?: string;
}

export const DeliveryRequest = ({ restaurantId, orderId }: DeliveryRequestProps) => {
  const [selectedRadius, setSelectedRadius] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [requestingDelivery, setRequestingDelivery] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar entregadores disponíveis na área
  const { data: availableDeliverers, isLoading } = useQuery({
    queryKey: ['available-deliverers', restaurantId, selectedRadius],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_details')
        .select(`
          *,
          profiles:user_id (nome, telefone),
          delivery_vehicles (tipo_veiculo, marca, modelo)
        `)
        .eq('status_online', true)
        .eq('disponivel_para_entregas', true)
        .eq('status_aprovacao', 'aprovado')
        .order('rating_medio', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  // Buscar pedidos aguardando entregador
  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-delivery-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (nome_item, quantidade, preco_unitario)
        `)
        .eq('restaurante_id', restaurantId)
        .eq('status', 'pronto')
        .is('entregador_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000
  });

  // Solicitar entregador para pedido específico
  const requestDeliveryMutation = useMutation({
    mutationFn: async ({ 
      targetOrderId, 
      radius, 
      fee, 
      priority 
    }: { 
      targetOrderId: string; 
      radius: number; 
      fee: number; 
      priority: string; 
    }) => {
      // Criar solicitação de entrega
      const { data: request, error: requestError } = await supabase
        .from('delivery_requests')
        .insert({
          restaurant_id: restaurantId,
          order_id: targetOrderId,
          radius_km: radius,
          delivery_fee: fee,
          priority_level: priority,
          status: 'open',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Notificar entregadores disponíveis na área
      await supabase.functions.invoke('notify-delivery-request', {
        body: {
          requestId: request.id,
          restaurantId,
          orderId: targetOrderId,
          radius,
          fee,
          priority
        }
      });

      return request;
    },
    onSuccess: () => {
      toast({
        title: 'Solicitação enviada',
        description: 'Entregadores disponíveis foram notificados'
      });
      queryClient.invalidateQueries({ queryKey: ['pending-delivery-orders'] });
      setRequestingDelivery(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Atribuir entregador diretamente a um pedido
  const assignDelivererMutation = useMutation({
    mutationFn: async ({ orderId, delivererId }: { orderId: string; delivererId: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          entregador_id: delivererId,
          status: 'saiu_entrega',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Notificar entregador específico
      await supabase.functions.invoke('notify-delivery-assignment', {
        body: {
          orderId,
          delivererId,
          restaurantId
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Entregador atribuído',
        description: 'O entregador foi notificado e receberá o pedido'
      });
      queryClient.invalidateQueries({ queryKey: ['pending-delivery-orders'] });
    }
  });

  const handleRequestDelivery = (targetOrderId: string) => {
    if (!deliveryFee) {
      toast({
        title: 'Taxa obrigatória',
        description: 'Informe a taxa de entrega',
        variant: 'destructive'
      });
      return;
    }

    requestDeliveryMutation.mutate({
      targetOrderId,
      radius: parseInt(selectedRadius),
      fee: parseFloat(deliveryFee),
      priority: urgency
    });
  };

  const getVehicleIcon = (type: string) => {
    const icons = {
      'bicicleta': '🚲',
      'motocicleta': '🏍️',
      'carro': '🚗'
    };
    return icons[type as keyof typeof icons] || '🚲';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Solicitação de Entregadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Raio de busca (km)</Label>
              <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="15">15 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Taxa de entrega (R$)</Label>
              <Input
                type="number"
                step="0.50"
                placeholder="0.00"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
              />
            </div>

            <div>
              <Label>Urgência</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos aguardando entregador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedidos Aguardando Entregador</span>
            <Badge variant="outline">
              {pendingOrders?.length || 0} pedidos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum pedido aguardando entregador</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders?.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">Pedido #{order.id.slice(-8)}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Pronto para entrega
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Itens:</p>
                    <div className="text-sm space-y-1">
                      {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantidade}x {item.nome_item}</span>
                          <span>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequestDelivery(order.id)}
                      disabled={requestDeliveryMutation.isPending}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Solicitar Entregadores
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entregadores disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Entregadores Disponíveis</span>
            <Badge variant="outline">
              {availableDeliverers?.length || 0} online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Buscando entregadores...</p>
            </div>
          ) : availableDeliverers?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum entregador disponível no momento</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {availableDeliverers?.map((deliverer) => (
                <div key={deliverer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">
                          {deliverer.profiles?.nome || 'Entregador'}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">
                            {deliverer.rating_medio?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>{getVehicleIcon(deliverer.delivery_vehicles?.[0]?.tipo_veiculo)}</span>
                          <span>
                            {deliverer.delivery_vehicles?.[0]?.tipo_veiculo || 'Veículo não informado'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-3 w-3" />
                          <span>{deliverer.total_entregas || 0} entregas realizadas</span>
                        </div>
                        {deliverer.raio_atuacao && (
                          <div className="flex items-center space-x-2">
                            <Navigation className="h-3 w-3" />
                            <span>Atua em raio de {deliverer.raio_atuacao}km</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Badge className="bg-green-100 text-green-800">
                        Online
                      </Badge>
                      {pendingOrders && pendingOrders.length > 0 && (
                        <Select
                          onValueChange={(orderId) => 
                            assignDelivererMutation.mutate({
                              orderId,
                              delivererId: deliverer.user_id
                            })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Atribuir pedido" />
                          </SelectTrigger>
                          <SelectContent>
                            {pendingOrders.map((order) => (
                              <SelectItem key={order.id} value={order.id}>
                                #{order.id.slice(-8)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryRequest;