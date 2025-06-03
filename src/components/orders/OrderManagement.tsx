import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, MapPin, User, Package } from 'lucide-react';

interface EnderecoEntrega {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado?: string;
  cep?: string;
  complemento?: string;
}

interface Order {
  id: string;
  cliente_id: string;
  restaurante_id: string;
  entregador_id?: string;
  status: string;
  total: number;
  taxa_entrega: number;
  tempo_estimado?: number;
  endereco_entrega: EnderecoEntrega;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    nome_item: string;
    quantidade: number;
    preco_unitario: number;
    observacoes?: string;
  }>;
  cliente_profile?: {
    nome: string;
    telefone?: string;
  };
}

interface OrderManagementProps {
  userType: 'restaurant' | 'delivery' | 'customer';
  userId: string;
}

const OrderManagement = ({ userType, userId }: OrderManagementProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', userType, userId, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          cliente_profile:profiles!orders_cliente_id_fkey (nome, telefone)
        `)
        .order('created_at', { ascending: false });

      if (userType === 'restaurant') {
        query = query.eq('restaurante_id', userId);
      } else if (userType === 'delivery') {
        query = query.eq('entregador_id', userId);
      } else if (userType === 'customer') {
        query = query.eq('cliente_id', userId);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Pedido atualizado",
        description: "Status do pedido foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive",
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

  const getNextStatus = (currentStatus: string, userType: string) => {
    if (userType === 'restaurant') {
      const transitions = {
        'pendente': 'confirmado',
        'confirmado': 'preparando',
        'preparando': 'pronto'
      };
      return transitions[currentStatus as keyof typeof transitions];
    } else if (userType === 'delivery') {
      const transitions = {
        'pronto': 'saiu_entrega',
        'saiu_entrega': 'entregue'
      };
      return transitions[currentStatus as keyof typeof transitions];
    }
    return null;
  };

  const isValidEndereco = (endereco: any): endereco is EnderecoEntrega => {
    return endereco && 
           typeof endereco === 'object' && 
           endereco.logradouro && 
           endereco.numero && 
           endereco.bairro && 
           endereco.cidade;
  };

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'pronto', label: 'Pronto' },
    { value: 'saiu_entrega', label: 'Saiu para entrega' },
    { value: 'entregue', label: 'Entregue' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Pedidos</h2>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-500">
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
                    {order.cliente_profile.nome} {order.cliente_profile.telefone && `- ${order.cliente_profile.telefone}`}
                  </span>
                </div>
              )}

              {isValidEndereco(order.endereco_entrega) && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <p>{order.endereco_entrega.logradouro}, {order.endereco_entrega.numero}</p>
                    <p>{order.endereco_entrega.bairro}, {order.endereco_entrega.cidade}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Itens do Pedido
                </h4>
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
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
                  Total: R$ {(order.total + (order.taxa_entrega || 0)).toFixed(2)}
                  {order.taxa_entrega > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (+ R$ {order.taxa_entrega.toFixed(2)} entrega)
                    </span>
                  )}
                </div>
                
                {getNextStatus(order.status, userType) && (
                  <Button
                    onClick={() => updateOrderMutation.mutate({
                      orderId: order.id,
                      status: getNextStatus(order.status, userType)!
                    })}
                    disabled={updateOrderMutation.isPending}
                  >
                    {updateOrderMutation.isPending ? 'Atualizando...' : 
                     `Marcar como ${getNextStatus(order.status, userType)?.replace('_', ' ')}`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

export default OrderManagement;
