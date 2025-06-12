import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  User, 
  Package, 
  Printer, 
  MessageSquare,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { printerService } from '@/services/printerService';

interface RestaurantOrdersPanelProps {
  restaurantId: string;
}

export const RestaurantOrdersPanel = ({ restaurantId }: RestaurantOrdersPanelProps) => {
  const [selectedStatus, setSelectedStatus] = useState('pendente');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['restaurant-orders', restaurantId, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          cliente_profile:profiles!orders_cliente_id_fkey (nome, telefone)
        `)
        .eq('restaurante_id', restaurantId)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
      toast({
        title: "Pedido atualizado",
        description: "Status do pedido foi atualizado com sucesso.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-500',
      'confirmado': 'bg-blue-500',
      'preparando': 'bg-orange-500',
      'pronto': 'bg-green-500',
      'saiu_entrega': 'bg-purple-500',
      'entregue': 'bg-emerald-500',
      'cancelado': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getNextStatus = (currentStatus: string) => {
    const transitions = {
      'pendente': 'confirmado',
      'confirmado': 'preparando', 
      'preparando': 'pronto'
    };
    return transitions[currentStatus as keyof typeof transitions];
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderMutation.mutate({ orderId, status: 'confirmado' });
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderMutation.mutate({ orderId, status: 'cancelado' });
  };

  const printOrder = (order: any, type: 'kitchen' | 'receipt') => {
    const content = printerService.formatOrderForPrint(order, type);
    printerService.print({
      id: `${type}-${order.id}-${Date.now()}`,
      content,
      type,
      copies: 1,
      priority: 'normal'
    });
  };

  const statusTabs = [
    { value: 'pendente', label: 'Novos', color: 'text-yellow-600' },
    { value: 'confirmado', label: 'Confirmados', color: 'text-blue-600' },
    { value: 'preparando', label: 'Preparando', color: 'text-orange-600' },
    { value: 'pronto', label: 'Prontos', color: 'text-green-600' },
    { value: 'all', label: 'Todos', color: 'text-gray-600' }
  ];

  if (isLoading) {
    return <div className="p-6">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Pedidos</h2>
        <Badge variant="outline" className="px-3 py-1">
          {orders?.length || 0} pedidos
        </Badge>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          {statusTabs.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className={tab.color}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <div className="grid gap-4">
            {orders?.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>Pedido #{order.id.slice(-8)}</span>
                        {order.status === 'pendente' && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {order.cliente_profile && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {order.cliente_profile.nome}
                      </span>
                      {order.cliente_profile.telefone && (
                        <Button size="sm" variant="ghost" className="p-1">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Itens do Pedido
                    </h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantidade}x {item.nome_item}</span>
                          <span>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.observacoes && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm"><strong>Observações:</strong> {order.observacoes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-lg font-bold">
                      Total: R$ {order.total.toFixed(2)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printOrder(order, 'kitchen')}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Cozinha
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printOrder(order, 'receipt')}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Comprovante
                      </Button>

                      {order.status === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectOrder(order.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceitar
                          </Button>
                        </>
                      )}

                      {getNextStatus(order.status) && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({
                            orderId: order.id,
                            status: getNextStatus(order.status)!
                          })}
                          disabled={updateOrderMutation.isPending}
                        >
                          Marcar como {getNextStatus(order.status)?.replace('_', ' ')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {!orders?.length && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-500">
            {selectedStatus === 'all' ? 
             'Ainda não há pedidos para exibir.' : 
             `Não há pedidos com status "${selectedStatus}".`}
          </p>
        </div>
      )}
    </div>
  );
};
