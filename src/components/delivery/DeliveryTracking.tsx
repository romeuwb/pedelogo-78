
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Route, Phone, MessageSquare, Navigation, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '@/components/maps/MapComponent';

interface DeliveryTrackingProps {
  orderId: string;
  userType: 'customer' | 'restaurant' | 'delivery' | 'admin';
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ orderId, userType }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Get order details with delivery tracking
  const { data: orderData, isLoading, refetch } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          restaurant_details:restaurante_id (
            nome_fantasia,
            endereco,
            telefone
          ),
          delivery_details:entregador_id (
            user_id,
            localizacao_atual,
            status_online,
            profiles:user_id (
              nome,
              telefone
            )
          ),
          client_profile:cliente_id (
            nome,
            telefone
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: userType === 'customer' ? 30000 : 10000, // Refresh every 30s for customers, 10s for others
  });

  // Update delivery location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      if (userType !== 'delivery') {
        throw new Error('Only delivery personnel can update location');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('delivery_details')
        .update({
          localizacao_atual: { lat, lng },
          data_ultima_atividade: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Localização atualizada',
        description: 'Sua localização foi atualizada com sucesso'
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for status change
      await supabase.functions.invoke('send-notification', {
        body: {
          orderId,
          type: 'status_update',
          status: newStatus
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'Status do pedido foi atualizado'
      });
      refetch();
    }
  });

  // Get current location for delivery personnel
  const getCurrentLocation = () => {
    if (navigator.geolocation && userType === 'delivery') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationMutation.mutate({ lat: latitude, lng: longitude });
          setDeliveryLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização',
            variant: 'destructive'
          });
        }
      );
    }
  };

  useEffect(() => {
    if (userType === 'delivery') {
      // Auto-update location every 5 minutes
      const interval = setInterval(getCurrentLocation, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userType]);

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'preparando': 'bg-orange-100 text-orange-800',
      'saiu_para_entrega': 'bg-purple-100 text-purple-800',
      'entregue': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pendente': 'Aguardando confirmação',
      'confirmado': 'Pedido confirmado',
      'preparando': 'Preparando seu pedido',
      'saiu_para_entrega': 'Saiu para entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getMapMarkers = () => {
    if (!orderData) return [];

    const markers = [];

    // Restaurant marker
    if (orderData.restaurant_details) {
      markers.push({
        id: 'restaurant',
        position: { lat: -23.5505, lng: -46.6333 }, // Default position
        title: orderData.restaurant_details.nome_fantasia,
        type: 'restaurant' as const
      });
    }

    // Customer marker (delivery address)
    if (orderData.endereco_entrega) {
      markers.push({
        id: 'customer',
        position: { lat: -23.5505, lng: -46.6333 }, // Default position
        title: 'Endereço de entrega',
        type: 'customer' as const
      });
    }

    // Delivery person marker
    if (orderData.delivery_details?.localizacao_atual) {
      const loc = orderData.delivery_details.localizacao_atual;
      markers.push({
        id: 'delivery',
        position: { lat: loc.lat, lng: loc.lng },
        title: `Entregador: ${orderData.delivery_details.profiles?.nome || 'Sem nome'}`,
        type: 'delivery' as const
      });
    }

    return markers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">Pedido não encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedido #{orderData.id.slice(-8)}</span>
            <Badge className={getStatusColor(orderData.status)}>
              {getStatusText(orderData.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pedido feito</p>
                <p className="font-medium">
                  {new Date(orderData.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Restaurante</p>
                <p className="font-medium">
                  {orderData.restaurant_details?.nome_fantasia || 'Não informado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Entregador</p>
                <p className="font-medium">
                  {orderData.delivery_details?.profiles?.nome || 'Não atribuído'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Actions for Different User Types */}
      {userType === 'delivery' && orderData.status !== 'entregue' && orderData.status !== 'cancelado' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações do Entregador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                disabled={updateLocationMutation.isPending}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Atualizar Localização
              </Button>
              
              {orderData.status === 'preparando' && (
                <Button
                  onClick={() => updateOrderStatusMutation.mutate('saiu_para_entrega')}
                  size="sm"
                >
                  Marcar como Saiu para Entrega
                </Button>
              )}
              
              {orderData.status === 'saiu_para_entrega' && (
                <Button
                  onClick={() => updateOrderStatusMutation.mutate('entregue')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Marcar como Entregue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Actions */}
      {userType === 'restaurant' && orderData.status === 'confirmado' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações do Restaurante</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => updateOrderStatusMutation.mutate('preparando')}
              size="sm"
            >
              Iniciar Preparo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orderData.order_items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{item.nome_item}</p>
                  <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                </div>
                <p className="font-medium">
                  R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>R$ {orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Tracking */}
      <MapComponent
        markers={getMapMarkers()}
        showRouting={true}
        center={deliveryLocation || { lat: -23.5505, lng: -46.6333 }}
      />

      {/* Contact Information */}
      {(userType === 'customer' || userType === 'delivery') && (
        <Card>
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userType === 'customer' && orderData.delivery_details?.profiles && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Entregador</p>
                    <p className="text-sm text-gray-600">
                      {orderData.delivery_details.profiles.nome}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {userType === 'delivery' && orderData.client_profile && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Cliente</p>
                    <p className="text-sm text-gray-600">
                      {orderData.client_profile.nome}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryTracking;
