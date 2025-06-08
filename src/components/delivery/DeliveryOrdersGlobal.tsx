
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
  Package,
  DollarSign,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrdersGlobalProps {
  deliveryDetails: any;
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
}

const DeliveryOrdersGlobal = ({ deliveryDetails, currentOrder, setCurrentOrder }: DeliveryOrdersGlobalProps) => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('available');

  useEffect(() => {
    if (deliveryDetails) {
      loadAvailableOrders();
      loadMyOrders();
    }
  }, [deliveryDetails]);

  const loadAvailableOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome, endereco, telefone),
          order_items (*),
          profiles:cliente_id (nome, telefone)
        `)
        .eq('status', 'pronto')
        .is('entregador_id', null)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;
      setAvailableOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos disponíveis:', error);
      toast.error('Erro ao carregar pedidos disponíveis');
    }
  };

  const loadMyOrders = async () => {
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
        .in('status', ['aceito_entregador', 'preparando', 'pronto_retirada', 'saiu_entrega', 'caminho_restaurante', 'chegou_restaurante', 'pedido_retirado', 'caminho_cliente', 'chegou_cliente'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar meus pedidos:', error);
      toast.error('Erro ao carregar meus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      // Atualizar o pedido para aceito pelo entregador
      const { error } = await supabase
        .from('orders')
        .update({ 
          entregador_id: deliveryDetails.user_id,
          status: 'aceito_entregador'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Recarregar listas
      loadAvailableOrders();
      loadMyOrders();
      
      toast.success('Pedido aceito com sucesso!');
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      toast.error('Erro ao aceitar pedido');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      loadMyOrders();
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const calculateDistance = (endereco: any) => {
    // Simulação de cálculo de distância - em produção, usar API de mapas
    return Math.floor(Math.random() * 10) + 1;
  };

  const formatAddress = (endereco: any) => {
    if (typeof endereco === 'string') return endereco;
    if (typeof endereco === 'object' && endereco) {
      return `${endereco.rua || endereco.logradouro || ''}, ${endereco.numero || ''} - ${endereco.bairro || ''}, ${endereco.cidade || ''}`;
    }
    return 'Endereço não informado';
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
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Pedidos Disponíveis ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="my-orders">
            Meus Pedidos ({myOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum pedido disponível
                </h3>
                <p className="text-gray-600">
                  Não há pedidos aguardando entregador no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} className="border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.restaurant_details?.nome}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {order.total.toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {calculateDistance(order.endereco_entrega)} km
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Endereços */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Retirar em:</p>
                        <p className="text-sm text-gray-600">{order.restaurant_details?.endereco}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Entregar em:</p>
                        <p className="text-sm text-gray-600">{formatAddress(order.endereco_entrega)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Cliente:</span>
                      <span className="text-sm">{order.profiles?.nome}</span>
                    </div>
                    {order.profiles?.telefone && (
                      <Button variant="outline" size="sm">
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Itens do pedido */}
                  <div className="border-t pt-2">
                    <p className="text-sm font-medium mb-1">Itens:</p>
                    <div className="text-sm text-gray-600">
                      {order.order_items?.map((item: any, index: number) => (
                        <span key={item.id}>
                          {item.quantidade}x {item.nome_item}
                          {index < order.order_items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      onClick={() => acceptOrder(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Pedido
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          {myOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum pedido ativo
                </h3>
                <p className="text-gray-600">
                  Aceite pedidos para começar suas entregas
                </p>
              </CardContent>
            </Card>
          ) : (
            myOrders.map((order) => (
              <Card key={order.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.restaurant_details?.nome}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Informações do pedido */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Valor</p>
                      <p className="text-lg font-bold text-green-600">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm">{order.profiles?.nome}</p>
                    </div>
                  </div>

                  {/* Endereço de entrega */}
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium mb-1">Entregar em:</p>
                    <p className="text-sm text-gray-600">{formatAddress(order.endereco_entrega)}</p>
                  </div>

                  {/* Ações baseadas no status */}
                  <div className="flex space-x-2">
                    {getNextActions(order.status).map((action) => (
                      <Button
                        key={action.status}
                        onClick={() => updateOrderStatus(order.id, action.status)}
                        className={action.primary ? 'flex-1' : ''}
                        variant={action.primary ? 'default' : 'outline'}
                      >
                        {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm">
                      <Navigation className="h-4 w-4" />
                    </Button>
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'aceito_entregador': 'bg-blue-500',
    'preparando': 'bg-orange-500',
    'pronto_retirada': 'bg-purple-500',
    'caminho_restaurante': 'bg-indigo-500',
    'chegou_restaurante': 'bg-yellow-500',
    'pedido_retirado': 'bg-cyan-500',
    'saiu_entrega': 'bg-teal-500',
    'caminho_cliente': 'bg-green-500',
    'chegou_cliente': 'bg-emerald-500',
  };
  return colors[status] || 'bg-gray-500';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'aceito_entregador': 'Aceito',
    'preparando': 'Preparando',
    'pronto_retirada': 'Pronto',
    'caminho_restaurante': 'Indo ao restaurante',
    'chegou_restaurante': 'No restaurante',
    'pedido_retirado': 'Pedido retirado',
    'saiu_entrega': 'Saiu para entrega',
    'caminho_cliente': 'Indo ao cliente',
    'chegou_cliente': 'No cliente',
  };
  return labels[status] || status;
};

const getNextActions = (status: string) => {
  const actions: Record<string, Array<{status: string, label: string, icon?: any, primary?: boolean}>> = {
    'aceito_entregador': [
      { status: 'caminho_restaurante', label: 'Saí para o restaurante', icon: Navigation, primary: true }
    ],
    'preparando': [
      { status: 'caminho_restaurante', label: 'Saí para o restaurante', icon: Navigation, primary: true }
    ],
    'pronto_retirada': [
      { status: 'caminho_restaurante', label: 'Saí para o restaurante', icon: Navigation, primary: true }
    ],
    'caminho_restaurante': [
      { status: 'chegou_restaurante', label: 'Cheguei no restaurante', icon: MapPin, primary: true }
    ],
    'chegou_restaurante': [
      { status: 'pedido_retirado', label: 'Pedido retirado', icon: Package, primary: true }
    ],
    'pedido_retirado': [
      { status: 'caminho_cliente', label: 'Saí para o cliente', icon: Navigation, primary: true }
    ],
    'saiu_entrega': [
      { status: 'caminho_cliente', label: 'A caminho do cliente', icon: Navigation, primary: true }
    ],
    'caminho_cliente': [
      { status: 'chegou_cliente', label: 'Cheguei no cliente', icon: MapPin, primary: true }
    ],
    'chegou_cliente': [
      { status: 'entregue', label: 'Pedido entregue', icon: CheckCircle, primary: true }
    ]
  };
  
  return actions[status] || [];
};

export default DeliveryOrdersGlobal;
