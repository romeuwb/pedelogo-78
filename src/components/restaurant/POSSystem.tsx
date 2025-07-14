import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingCart, Users, Package, DollarSign, CreditCard, Import } from 'lucide-react';
import { toast } from 'sonner';
import PendingPaymentTables from './PendingPaymentTables';

interface POSSystemProps {
  restaurantId: string;
}

// Defina aqui o UUID do cliente padrão "Cliente Balcão" (substitua pelo valor real do seu banco)
const CLIENTE_BALCAO_ID = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5'; // UUID real do cliente padrão cadastrado no Supabase

export const POSSystem = ({ restaurantId }: POSSystemProps) => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'mesa' | 'avulso' | 'delivery'>('avulso');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const queryClient = useQueryClient();

  // Buscar mesas do restaurante
  const { data: tables } = useQuery({
    queryKey: ['restaurant-tables', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('numero_mesa', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar mesas aguardando pagamento
  const { data: pendingPaymentTables } = useQuery({
    queryKey: ['pending-payment-tables', restaurantId],
    queryFn: async () => {
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'aguardando_pagamento')
        .order('numero_mesa', { ascending: true });
      if (tablesError) throw tablesError;
      const tablesWithOrders = await Promise.all(
        (tablesData || []).map(async (table) => {
          const { data: orderData, error: orderError } = await (supabase as any)
            .from('table_orders')
            .select('*, table_order_items(*)')
            .eq('table_id', table.id)
            .eq('status', 'fechado')
            .single();
          if (orderError && orderError.code !== 'PGRST116') {
            return { ...table, order: null, total_value: 0, items_count: 0 };
          }
          return {
            ...table,
            order: orderData,
            total_value: orderData?.total || 0,
            items_count: orderData?.table_order_items?.length || 0
          };
        })
      );
      return tablesWithOrders;
    },
  });

  // Buscar produtos do restaurante
  const { data: products } = useQuery({
    queryKey: ['restaurant-products-pos', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('disponivel', true)
        .order('nome');
      if (error) throw error;
      return data || [];
    },
  });

  // Abrir mesa
  const openTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status: 'ocupada' })
        .eq('id', tableId);
      if (error) throw error;
      return { tableId };
    },
    onSuccess: () => {
      toast.success('Mesa aberta com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao abrir mesa: ' + error.message);
    }
  });

  // Fechar mesa
  const closeTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status: 'livre' })
        .eq('id', tableId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesa fechada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao fechar mesa: ' + error.message);
    }
  });

  // Criar pedido POS (sempre define cliente_id)
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // Sempre define cliente_id: se não houver, usa o cliente padrão
      // Para delivery, use o cliente real; para mesa/balcão, use sempre o cliente anônimo
      const clienteId = orderType === 'delivery' && orderData.cliente_id ? orderData.cliente_id : CLIENTE_BALCAO_ID;
      
      console.log('🛒 Criando pedido POS:', { 
        total: orderData.total, 
        orderType, 
        clienteId, 
        CLIENTE_BALCAO_ID 
      });
      let enderecoEntrega: any = null;
      if (orderType === 'delivery') {
        enderecoEntrega = {
          tipo: 'delivery',
          endereco: deliveryAddress,
          cliente_nome: customerName,
          cliente_telefone: customerPhone
        };
      } else if (orderType === 'mesa') {
        enderecoEntrega = {
          tipo: 'mesa',
          mesa: selectedTable?.numero_mesa
        };
      } else {
        enderecoEntrega = {
          tipo: 'balcao',
          cliente_nome: customerName || 'Cliente Balcão'
        };
      }
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurante_id: restaurantId,
          cliente_id: clienteId,
          status: 'preparando',
          total: orderData.total,
          endereco_entrega: enderecoEntrega,
          observacoes: `Pedido POS - ${orderType === 'delivery' ? 'Delivery' : orderType === 'mesa' ? `Mesa ${selectedTable?.numero_mesa}` : 'Avulso'}`
        })
        .select()
        .single();
      if (orderError) throw orderError;
      // Inserir itens do pedido
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            orderItems.map(item => ({
              order_id: order.id,
              nome_item: item.nome,
              quantidade: item.quantidade,
              preco_unitario: item.preco,
              observacoes: `POS ${orderType}`
            }))
          );
        if (itemsError) throw itemsError;
      }
      return order;
    },
    onSuccess: (order) => {
      setCurrentOrder(order);
      toast.success('Pedido criado com sucesso!');
      setShowOrderModal(false);
      setShowPaymentModal(true);
    },
    onError: (error: any) => {
      console.log('❌ Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido: ' + error.message);
    }
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setProcessingPayment(true);
      if (!currentOrder) {
        throw new Error('Nenhum pedido ativo para processar pagamento');
      }
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'pago',
          metodo_pagamento: paymentData.method,
          pago_em: new Date().toISOString()
        })
        .eq('id', currentOrder.id);
      if (orderError) throw orderError;
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, orderId: currentOrder.id, method: paymentData.method };
    },
    onSuccess: (result) => {
      toast.success(`Pagamento processado com sucesso! Método: ${result.method}`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao processar pagamento: ' + error.message);
    },
    onSettled: () => {
      setProcessingPayment(false);
    }
  });

  // Função para resetar formulário
  const resetForm = () => {
    setShowPaymentModal(false);
    setShowOrderModal(false);
    setOrderItems([]);
    setCurrentOrder(null);
    setPaymentMethod('');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setSelectedTable(null);
  };

  const addItemToOrder = (product: any) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.id === product.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { ...product, quantidade: 1 }]);
    }
    toast.success(`${product.nome} adicionado ao pedido`);
  };

  const removeItemFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
    toast.success('Item removido do pedido');
  };

  const updateItemQuantity = (productId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItemFromOrder(productId);
      return;
    }
    setOrderItems(orderItems.map(item =>
      item.id === productId
        ? { ...item, quantidade }
        : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const startNewOrder = (type: 'avulso' | 'delivery') => {
    setOrderType(type);
    setSelectedTable(null);
    setOrderItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setShowOrderModal(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pos">Sistema POS</TabsTrigger>
          <TabsTrigger value="pending">Pagamentos Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-6">
          {/* Botões de Nova Venda */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Nova Venda</h3>
              <div className="flex gap-4">
                <Button 
                  onClick={() => startNewOrder('avulso')}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Venda Avulsa
                </Button>
                <Button 
                  onClick={() => startNewOrder('delivery')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Delivery
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Mesas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Mesas</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {tables?.map((table) => (
                  <Card 
                    key={table.id}
                    className={`cursor-pointer transition-colors ${
                      table.status === 'livre' ? 'bg-green-50 hover:bg-green-100' :
                      table.status === 'ocupada' ? 'bg-yellow-50 hover:bg-yellow-100' :
                      'bg-red-50 hover:bg-red-100'
                    }`}
                    onClick={() => {
                      if (table.status === 'livre') {
                        openTableMutation.mutate(table.id);
                      } else if (table.status === 'ocupada') {
                        setSelectedTable(table);
                        setOrderType('mesa');
                        setShowOrderModal(true);
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">Mesa {table.numero_mesa}</div>
                      <Badge 
                        variant={
                          table.status === 'livre' ? 'default' :
                          table.status === 'ocupada' ? 'secondary' :
                          'destructive'
                        }
                        className="mt-2"
                      >
                        {table.status === 'livre' ? 'Livre' :
                         table.status === 'ocupada' ? 'Ocupada' :
                         'Aguardando'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <PendingPaymentTables restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>

      {/* Modal de Pedido */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {orderType === 'mesa' ? `Mesa ${selectedTable?.numero_mesa}` :
               orderType === 'delivery' ? 'Delivery' : 'Venda Avulsa'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações do Cliente (apenas para delivery) */}
            {orderType === 'delivery' && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-medium">Dados do Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Telefone"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Endereço</label>
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-4">Produtos Disponíveis</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {products?.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addItemToOrder(product)}
                      >
                        <div>
                          <div className="font-medium">{product.nome}</div>
                          <div className="text-sm text-gray-600">R$ {product.preco?.toFixed(2)}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-4">Itens do Pedido</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-sm text-gray-600">R$ {item.preco?.toFixed(2)} cada</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantidade - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantidade + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItemFromOrder(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold text-lg">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => createOrderMutation.mutate({ total: calculateTotal() })}
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? 'Criando Pedido...' : 'Finalizar Pedido'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">R$ {currentOrder?.total?.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total do Pedido</div>
            </div>

            <div>
              <label className="text-sm font-medium">Método de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => processPaymentMutation.mutate({ method: paymentMethod })}
                disabled={!paymentMethod || processingPayment}
              >
                {processingPayment ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
