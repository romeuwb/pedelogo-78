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
import { Plus, ShoppingCart, Users, Package, DollarSign, CreditCard, Import } from 'lucide-react';
import { toast } from 'sonner';
import PendingPaymentTables from './PendingPaymentTables';

interface POSSystemProps {
  restaurantId: string;
}

export const POSSystem = ({ restaurantId }: POSSystemProps) => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'mesa' | 'avulso'>('mesa');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

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
      // Buscar mesas aguardando pagamento
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'aguardando_pagamento')
        .order('numero_mesa', { ascending: true });

      if (tablesError) throw tablesError;

      // Buscar pedidos fechados para cada mesa
      const tablesWithOrders = await Promise.all(
        (tablesData || []).map(async (table) => {
          const { data: orderData, error: orderError } = await (supabase as any)
            .from('table_orders')
            .select('*, table_order_items(*)')
            .eq('table_id', table.id)
            .eq('status', 'fechado')
            .single();

          if (orderError && orderError.code !== 'PGRST116') {
            console.error('Error fetching order:', orderError);
            return {
              ...table,
              order: null,
              total_value: 0,
              items_count: 0
            };
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

  // Criar pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurante_id: restaurantId,
          cliente_id: null,
          status: 'preparando',
          total: orderData.total,
          endereco_entrega: { 
            tipo: orderType, 
            mesa: orderType === 'mesa' ? selectedTable?.mesa_numero : null 
          },
          observacoes: `Pedido POS - ${orderType === 'mesa' ? `Mesa ${selectedTable?.mesa_numero}` : 'Avulso'}`
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
              observacoes: 'Pedido POS'
            }))
          );

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      toast.success('Pedido criado com sucesso!');
      setOrderItems([]);
      setShowOrderModal(false);
      setShowPaymentModal(true);
    },
    onError: (error: any) => {
      toast.error('Erro ao criar pedido: ' + error.message);
    }
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Simular processamento de pagamento
      console.log('Processando pagamento:', paymentData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Pagamento processado com sucesso!');
      setShowPaymentModal(false);
      setPaymentMethod('');
      if (orderType === 'mesa' && selectedTable) {
      closeTableMutation.mutate(selectedTable.id);
      }
      setSelectedTable(null);
    },
    onError: (error: any) => {
      toast.error('Erro ao processar pagamento: ' + error.message);
    }
  });

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
  };

  const removeItemFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema POS</h2>
          <p className="text-gray-600">Gerencie mesas e pedidos em tempo real</p>
        </div>
        
        <Button onClick={() => {
          setOrderType('avulso');
          setSelectedTable(null);
          setShowOrderModal(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Venda Avulsa
        </Button>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendas">Vendas Avulsas</TabsTrigger>
          <TabsTrigger value="importar">Importar Pedidos</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Vendas Avulsas</h2>
              <p className="text-gray-600">Vendas diretas no balcão</p>
            </div>
            
            <Button onClick={() => {
              setOrderType('avulso');
              setSelectedTable(null);
              setShowOrderModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </div>

          {/* Resumo de vendas do dia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                    <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-600">R$ 0,00</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de produtos para venda rápida */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produtos em Destaque</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(products || []).slice(0, 12).map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium text-sm">{product.nome}</p>
                    <p className="text-sm text-green-600 font-bold">R$ {product.preco?.toFixed(2)}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        setOrderType('avulso');
                        setOrderItems([{ ...product, quantidade: 1 }]);
                        setShowOrderModal(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Vender
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="importar" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Import className="h-6 w-6 mr-2 text-orange-600" />
                  Importar Pedidos de Mesa
                </h2>
                <p className="text-gray-600">
                  Processe pagamentos de mesas fechadas aguardando finalização
                </p>
              </div>
            </div>

            {/* Alerta para mesas aguardando */}
            {(tables || []).filter(table => table.status === 'aguardando_pagamento').length > 0 ? (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      {(tables || []).filter(table => table.status === 'aguardando_pagamento').length} Mesa(s) Aguardando Pagamento
                    </h3>
                    <p className="text-orange-600">
                      Mesas com pedidos fechados prontos para processar pagamento
                    </p>
                  </div>
                  <Import className="h-12 w-12 text-orange-400 opacity-50" />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mesa aguardando pagamento</h3>
                <p className="text-gray-600">Quando uma mesa for fechada, ela aparecerá aqui para processamento</p>
              </div>
            )}

            <PendingPaymentTables restaurantId={restaurantId} />
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Pedidos Delivery</h2>
              <p className="text-gray-600">Gerenciar pedidos de entrega</p>
            </div>
            
            <Button onClick={() => {
              setOrderType('avulso');
              setSelectedTable(null);
              setShowOrderModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Delivery
            </Button>
          </div>

          {/* Estatísticas delivery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                  </div>
                  <Package className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Preparando</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saiu p/ Entrega</p>
                    <p className="text-2xl font-bold text-orange-600">0</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entregues</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Delivery</h3>
            <p className="text-gray-600">Funcionalidade de delivery será implementada aqui</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de pedido */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {orderType === 'mesa' 
                ? `Novo Pedido - Mesa ${selectedTable?.mesa_numero}`
                : 'Venda Avulsa'
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lista de produtos */}
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(products || []).map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.nome}</p>
                          <p className="text-sm text-gray-600">R$ {product.preco?.toFixed(2)}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addItemToOrder(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Carrinho */}
            <div>
              <h4 className="font-semibold mb-4">Itens do Pedido</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-gray-600">R$ {item.preco?.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(item.id, item.quantidade - 1)}
                      >
                        -
                      </Button>
                      <span>{item.quantidade}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(item.id, item.quantidade + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeItemFromOrder(item.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      createOrderMutation.mutate({
                        subtotal: calculateTotal(),
                        total: calculateTotal()
                      });
                    }}
                    disabled={orderItems.length === 0}
                    className="flex-1"
                  >
                    Finalizar Pedido
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOrderModal(false);
                      setOrderItems([]);
                      setSelectedTable(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processamento de Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold">R$ {calculateTotal().toFixed(2)}</p>
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
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  processPaymentMutation.mutate({
                    amount: calculateTotal(),
                    method: paymentMethod
                  });
                }}
                disabled={!paymentMethod}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Processar Pagamento
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};