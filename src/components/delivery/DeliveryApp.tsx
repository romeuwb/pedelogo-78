
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import OrderManagement from '@/components/orders/OrderManagement';
import { MapPin, Clock, DollarSign, Navigation, Phone, Package } from 'lucide-react';

interface DeliveryAppProps {
  userId: string;
  deliveryDetails: any;
}

const DeliveryApp = ({ userId, deliveryDetails }: DeliveryAppProps) => {
  const [isOnline, setIsOnline] = useState(false);
  const [selectedTab, setSelectedTab] = useState('available');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableOrders, isLoading: availableLoading } = useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles:cliente_id (nome, telefone),
          restaurant_details:restaurante_id (nome_fantasia, endereco, telefone)
        `)
        .eq('status', 'pronto')
        .is('entregador_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: isOnline
  });

  const { data: myDeliveries } = useQuery({
    queryKey: ['my-deliveries', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles:cliente_id (nome, telefone),
          restaurant_details:restaurante_id (nome_fantasia, endereco, telefone)
        `)
        .eq('entregador_id', userId)
        .in('status', ['saiu_entrega'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          entregador_id: userId,
          status: 'saiu_entrega',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
      toast({
        title: "Entrega aceita!",
        description: "Você aceitou uma nova entrega. Dirija-se ao restaurante.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar entrega",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'entregue',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
      toast({
        title: "Entrega concluída!",
        description: "Entrega marcada como concluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao concluir entrega",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const calculateDistance = (address1: any, address2: any) => {
    // Simulação simples de cálculo de distância
    return (Math.random() * 10 + 1).toFixed(1);
  };

  const formatAddress = (endereco: any) => {
    if (typeof endereco === 'string') return endereco;
    if (endereco?.logradouro) {
      return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`;
    }
    return 'Endereço não informado';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">App do Entregador</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsOnline(!isOnline)}
            variant={isOnline ? "destructive" : "default"}
            className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-300' : 'bg-red-300'}`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </Button>
        </div>
      </div>

      {/* Status do entregador */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">
                  {deliveryDetails?.status_aprovacao || 'Pendente'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ganhos Hoje</p>
                <p className="font-semibold">R$ 0,00</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Entregas Hoje</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Você está offline
            </h3>
            <p className="text-orange-700 mb-4">
              Ative o modo online para receber pedidos de entrega
            </p>
            <Button onClick={() => setIsOnline(true)} className="bg-orange-600 hover:bg-orange-700">
              Ficar Online
            </Button>
          </CardContent>
        </Card>
      )}

      {isOnline && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('available')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'available' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entregas Disponíveis
            </button>
            <button
              onClick={() => setSelectedTab('active')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'active' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Minhas Entregas
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'history' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Entregas Disponíveis */}
          {selectedTab === 'available' && (
            <div className="space-y-4">
              {availableLoading ? (
                <div>Carregando entregas...</div>
              ) : availableOrders?.length ? (
                availableOrders.map((order: any) => (
                  <Card key={order.id} className="border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Entrega #{order.id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {order.restaurant_details?.nome_fantasia}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          R$ {(order.total * 0.1).toFixed(2)} comissão
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Retirar em:</p>
                          <p className="text-sm">{order.restaurant_details?.endereco}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Entregar em:</p>
                          <p className="text-sm">{formatAddress(order.endereco_entrega)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {calculateDistance(order.restaurant_details?.endereco, order.endereco_entrega)} km
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            ~15 min
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => acceptOrderMutation.mutate(order.id)}
                          disabled={acceptOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {acceptOrderMutation.isPending ? 'Aceitando...' : 'Aceitar Entrega'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhuma entrega disponível
                  </h3>
                  <p className="text-gray-500">
                    Aguarde novos pedidos aparecerem na sua região.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Minhas Entregas */}
          {selectedTab === 'active' && (
            <div className="space-y-4">
              {myDeliveries?.length ? (
                myDeliveries.map((order: any) => (
                  <Card key={order.id} className="border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Entrega #{order.id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-500">
                            Cliente: {order.profiles?.nome}
                          </p>
                        </div>
                        <Badge className="bg-blue-500 text-white">Em andamento</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Endereço de entrega:</span>
                          <Button variant="outline" size="sm">
                            <Navigation className="h-4 w-4 mr-1" />
                            Navegar
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatAddress(order.endereco_entrega)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{order.profiles?.telefone || 'Sem telefone'}</span>
                        </div>
                        
                        <Button
                          onClick={() => completeDeliveryMutation.mutate(order.id)}
                          disabled={completeDeliveryMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {completeDeliveryMutation.isPending ? 'Concluindo...' : 'Marcar como Entregue'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhuma entrega ativa
                  </h3>
                  <p className="text-gray-500">
                    Aceite uma entrega da lista de disponíveis para começar.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Histórico */}
          {selectedTab === 'history' && (
            <OrderManagement userType="delivery" userId={userId} />
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryApp;
