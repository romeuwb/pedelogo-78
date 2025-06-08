
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, DollarSign, Package, Phone, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrdersGlobalProps {
  deliveryDetails: any;
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
}

const DeliveryOrdersGlobal = ({ deliveryDetails, currentOrder, setCurrentOrder }: DeliveryOrdersGlobalProps) => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    loadOrders();
    
    // Configurar real-time para pedidos
    const ordersSubscription = supabase
      .channel('delivery-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Carregar pedidos disponíveis (sem entregador)
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (
            nome_fantasia,
            endereco,
            telefone
          ),
          cliente_profile:profiles!orders_cliente_id_fkey (
            nome,
            telefone
          )
        `)
        .is('entregador_id', null)
        .in('status', ['confirmado', 'preparando', 'pronto'])
        .order('created_at', { ascending: true });

      if (availableError) throw availableError;

      // Carregar pedidos aceitos pelo entregador atual
      const { data: accepted, error: acceptedError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (
            nome_fantasia,
            endereco,
            telefone
          ),
          cliente_profile:profiles!orders_cliente_id_fkey (
            nome,
            telefone
          )
        `)
        .eq('entregador_id', deliveryDetails.user_id)
        .in('status', ['aceito_entregador', 'preparando', 'pronto_retirada', 'saiu_entrega', 'caminho_restaurante', 'chegou_restaurante', 'pedido_retirado', 'caminho_cliente', 'chegou_cliente'])
        .order('created_at', { ascending: true });

      if (acceptedError) throw acceptedError;

      // Carregar pedidos finalizados do entregador (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completed, error: completedError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (
            nome_fantasia,
            endereco,
            telefone
          ),
          cliente_profile:profiles!orders_cliente_id_fkey (
            nome,
            telefone
          )
        `)
        .eq('entregador_id', deliveryDetails.user_id)
        .in('status', ['entregue', 'cancelado'])
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      setAvailableOrders(available || []);
      setAcceptedOrders(accepted || []);
      setCompletedOrders(completed || []);

      // Atualizar pedido atual se necessário
      if (accepted && accepted.length > 0) {
        setCurrentOrder(accepted[0]);
      }

    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          entregador_id: deliveryDetails.user_id,
          status: 'aceito_entregador',
          data_aceite_entregador: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Pedido aceito com sucesso!');
      loadOrders();
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      toast.error('Erro ao aceitar pedido');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };

      // Adicionar timestamps específicos baseado no status
      switch (newStatus) {
        case 'caminho_restaurante':
          updates.data_saida_entregador = new Date().toISOString();
          break;
        case 'chegou_restaurante':
          updates.data_chegada_restaurante = new Date().toISOString();
          break;
        case 'pedido_retirado':
          updates.data_retirada_pedido = new Date().toISOString();
          break;
        case 'caminho_cliente':
          updates.data_saida_restaurante = new Date().toISOString();
          break;
        case 'chegou_cliente':
          updates.data_chegada_cliente = new Date().toISOString();
          break;
        case 'entregue':
          updates.data_entrega = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmado': 'bg-blue-500',
      'preparando': 'bg-orange-500',
      'pronto': 'bg-green-500',
      'aceito_entregador': 'bg-purple-500',
      'caminho_restaurante': 'bg-yellow-500',
      'chegou_restaurante': 'bg-blue-600',
      'pedido_retirado': 'bg-indigo-500',
      'caminho_cliente': 'bg-orange-600',
      'chegou_cliente': 'bg-green-600',
      'entregue': 'bg-emerald-500',
      'cancelado': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'pronto': 'Pronto para retirada',
      'aceito_entregador': 'Aceito',
      'caminho_restaurante': 'Indo para restaurante',
      'chegou_restaurante': 'No restaurante',
      'pedido_retirado': 'Pedido retirado',
      'caminho_cliente': 'Indo para cliente',
      'chegou_cliente': 'No local de entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      'aceito_entregador': ['caminho_restaurante'],
      'caminho_restaurante': ['chegou_restaurante'],
      'chegou_restaurante': ['pedido_retirado'],
      'pedido_retirado': ['caminho_cliente'],
      'caminho_cliente': ['chegou_cliente'],
      'chegou_cliente': ['entregue']
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const renderOrderCard = (order: any, showActions: boolean = false) => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">#{order.id.slice(-8)}</h3>
            <p className="text-sm text-gray-600">{order.restaurant_details?.nome_fantasia}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            {getStatusText(order.status)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{order.endereco_entrega}</span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-gray-500" />
            <span>Cliente: {order.cliente_profile?.nome}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-semibold">R$ {order.total.toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{new Date(order.created_at).toLocaleTimeString()}</span>
          </div>
        </div>

        {showActions && (
          <div className="mt-4 space-y-2">
            {order.status === 'pronto' || order.status === 'confirmado' || order.status === 'preparando' ? (
              <Button 
                onClick={() => acceptOrder(order.id)}
                className="w-full"
                size="sm"
              >
                Aceitar Pedido
              </Button>
            ) : (
              <div className="space-y-2">
                {getNextStatusOptions(order.status).map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    {getStatusText(nextStatus)}
                  </Button>
                ))}
                
                {order.cliente_profile?.telefone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`tel:${order.cliente_profile.telefone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar para Cliente
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.endereco_entrega)}`)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Abrir no Maps
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pedido Ativo (se houver) */}
      {currentOrder && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Entrega Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderOrderCard(currentOrder, true)}
          </CardContent>
        </Card>
      )}

      {/* Tabs de navegação */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Disponíveis ({availableOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'accepted'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Aceitos ({acceptedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Finalizados ({completedOrders.length})
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="space-y-4">
        {activeTab === 'available' && (
          <div>
            {availableOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido disponível no momento</p>
              </div>
            ) : (
              availableOrders.map(order => renderOrderCard(order, true))
            )}
          </div>
        )}

        {activeTab === 'accepted' && (
          <div>
            {acceptedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido aceito</p>
              </div>
            ) : (
              acceptedOrders.map(order => renderOrderCard(order, true))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            {completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma entrega finalizada nos últimos 30 dias</p>
              </div>
            ) : (
              completedOrders.map(order => renderOrderCard(order, false))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrdersGlobal;
