import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Receipt, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentSystemProps {
  restaurantId: string;
}

export const PaymentSystem = ({ restaurantId }: PaymentSystemProps) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const queryClient = useQueryClient();

  // Buscar pedidos pendentes de pagamento
  const { data: pendingOrders, isLoading } = useQuery({
    queryKey: ['pending-payments', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            nome_item,
            quantidade,
            preco_unitario
          )
        `)
        .eq('restaurante_id', restaurantId)
        .in('status', ['preparando', 'pronto'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar histórico de pagamentos
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurante_id', restaurantId)
        .eq('status', 'entregue')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar status do pedido
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'entregue',
          observacoes: `${selectedOrder.observacoes || ''} | Pagamento processado: ${paymentData.method} - R$ ${paymentData.amount}`
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Pagamento processado com sucesso!');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentMethod('');
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao processar pagamento: ' + error.message);
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'preparando': 'bg-yellow-100 text-yellow-800',
      'pronto': 'bg-blue-100 text-blue-800',
      'entregue': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'preparando': 'Preparando',
      'pronto': 'Pronto',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'voucher': 'Voucher'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Pagamentos</h2>
          <p className="text-gray-600">Gerencie pagamentos e histórico financeiro</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pendingOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {(pendingOrders || []).map((order) => (
              <Card key={order.id} className="hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">Pedido #{order.id.slice(-8)}</h4>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        {order.endereco_entrega && typeof order.endereco_entrega === 'object' && (order.endereco_entrega as any).mesa && (
                          <Badge variant="outline">
                            Mesa {(order.endereco_entrega as any).mesa}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><Clock className="inline h-4 w-4 mr-1" />
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </p>
                        <p>Itens: {order.order_items?.length || 0}</p>
                        {order.observacoes && (
                          <p className="text-xs bg-gray-50 p-2 rounded">{order.observacoes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {order.total?.toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setPaymentAmount(order.total?.toString() || '');
                          setShowPaymentModal(true);
                        }}
                        className="mt-2"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Processar Pagamento
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(pendingOrders || []).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pagamento pendente
                </h3>
                <p className="text-gray-600">
                  Todos os pedidos foram processados
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {(paymentHistory || []).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Pedido #{order.id.slice(-8)}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                      {order.endereco_entrega && typeof order.endereco_entrega === 'object' && (order.endereco_entrega as any).mesa && (
                        <Badge variant="outline" className="mt-1">
                          Mesa {(order.endereco_entrega as any).mesa}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {order.total?.toFixed(2)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Faturamento Hoje</p>
                    <p className="text-2xl font-bold">
                      R$ {(paymentHistory || [])
                        .filter(order => 
                          new Date(order.created_at).toDateString() === new Date().toDateString()
                        )
                        .reduce((sum, order) => sum + (order.total || 0), 0)
                        .toFixed(2)
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Receipt className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                    <p className="text-2xl font-bold">
                      {(paymentHistory || [])
                        .filter(order => 
                          new Date(order.created_at).toDateString() === new Date().toDateString()
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold">
                      R$ {(() => {
                        const todayOrders = (paymentHistory || [])
                          .filter(order => 
                            new Date(order.created_at).toDateString() === new Date().toDateString()
                          );
                        const total = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                        return todayOrders.length > 0 ? (total / todayOrders.length).toFixed(2) : '0.00';
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Pagamento</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">Pedido #{selectedOrder.id.slice(-8)}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.endereco_entrega && typeof selectedOrder.endereco_entrega === 'object' && (selectedOrder.endereco_entrega as any).mesa && `Mesa ${(selectedOrder.endereco_entrega as any).mesa}`}
                </p>
                <p className="text-sm text-gray-600">
                  Itens: {selectedOrder.order_items?.length || 0}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  R$ {selectedOrder.total?.toFixed(2)}
                </p>
                <p className="text-gray-600">Total a pagar</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor Recebido</label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              {paymentMethod === 'dinheiro' && parseFloat(paymentAmount) > selectedOrder.total && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium text-blue-800">
                    Troco: R$ {(parseFloat(paymentAmount) - selectedOrder.total).toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    processPaymentMutation.mutate({
                      amount: parseFloat(paymentAmount),
                      method: paymentMethod,
                      orderId: selectedOrder.id
                    });
                  }}
                  disabled={!paymentMethod || !paymentAmount || processPaymentMutation.isPending}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processPaymentMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processPaymentMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};