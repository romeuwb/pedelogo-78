
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientOrders = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Fetch active orders (not completed/cancelled)
      const { data: active, error: activeError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          restaurant_details:restaurante_id(nome_fantasia, logo_url)
        `)
        .eq('cliente_id', user.id)
        .in('status', ['pendente', 'confirmado', 'preparando', 'a_caminho'])
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch order history (completed/cancelled)
      const { data: history, error: historyError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          restaurant_details:restaurante_id(nome_fantasia, logo_url)
        `)
        .eq('cliente_id', user.id)
        .in('status', ['entregue', 'cancelado'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      setActiveOrders(active || []);
      setOrderHistory(history || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' },
      confirmado: { label: 'Confirmado', variant: 'default' },
      preparando: { label: 'Preparando', variant: 'default' },
      a_caminho: { label: 'A caminho', variant: 'default' },
      entregue: { label: 'Entregue', variant: 'default' },
      cancelado: { label: 'Cancelado', variant: 'destructive' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const reorderItems = async (order) => {
    try {
      // Add items to cart
      const cartItems = order.order_items.map(item => ({
        nome: item.nome_item,
        preco: item.preco_unitario,
        quantidade: item.quantidade,
        observacoes: item.observacoes
      }));

      const { error } = await supabase
        .from('client_cart')
        .upsert({
          user_id: user.id,
          restaurant_id: order.restaurante_id,
          itens: cartItems
        });

      if (error) throw error;
      
      // Show success message
      alert('Itens adicionados ao carrinho!');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Erro ao repetir pedido. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">
            Ativos ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico ({orderHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Você não tem pedidos ativos</p>
                <p className="text-sm mt-2">Quando fizer um pedido, ele aparecerá aqui</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                        {order.restaurant_details?.logo_url ? (
                          <img
                            src={order.restaurant_details.logo_url}
                            alt={order.restaurant_details.nome_fantasia}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.restaurant_details?.nome_fantasia}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Pedido #{order.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div>
                      {order.order_items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-sm text-gray-600">
                          {item.quantidade}x {item.nome_item}
                        </p>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 2} itens
                        </p>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} />
                        <span>
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Delivery Address */}
                    {order.endereco_entrega && (
                      <div className="flex items-start gap-1 text-sm text-gray-500">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {typeof order.endereco_entrega === 'string' 
                            ? order.endereco_entrega 
                            : `${order.endereco_entrega.logradouro}, ${order.endereco_entrega.numero}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {orderHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Você ainda não fez nenhum pedido</p>
                <p className="text-sm mt-2">Quando finalizar um pedido, ele aparecerá aqui</p>
              </CardContent>
            </Card>
          ) : (
            orderHistory.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                        {order.restaurant_details?.logo_url ? (
                          <img
                            src={order.restaurant_details.logo_url}
                            alt={order.restaurant_details.nome_fantasia}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.restaurant_details?.nome_fantasia}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div>
                      {order.order_items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-sm text-gray-600">
                          {item.quantidade}x {item.nome_item}
                        </p>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 2} itens
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {order.status === 'entregue' && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => reorderItems(order)}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Pedir novamente
                        </Button>
                        <Button variant="outline" size="sm">
                          <Star size={14} className="mr-1" />
                          Avaliar
                        </Button>
                      </div>
                    )}
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

export default ClientOrders;
