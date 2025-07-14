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
          cliente_id: orderData.cliente_id, // Corrigido: deve ser passado um cliente_id válido
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

      <Tabs defaultValue="tables" className="w-full">
        <TabsList>
          <TabsTrigger value="tables">Controle de Mesas</TabsTrigger>
          <TabsTrigger value="pending">Importar Mesas</TabsTrigger>
          <TabsTrigger value="orders">Pedidos Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          {/* Mesas disponíveis */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mesas Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(tables || []).filter(table => table.status === 'disponivel' && table.ativo).map((table) => (
                <Card key={table.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-semibold">Mesa {table.numero_mesa}</p>
                    <p className="text-sm text-gray-600">{table.capacidade} pessoas</p>
                    <Badge className="bg-green-100 text-green-800">
                      Disponível
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Use o gerenciador de mesas para lançar itens
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mesas ocupadas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mesas Ocupadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tables || []).filter(table => table.status === 'ocupada' && table.ativo).map((table) => (
                <Card key={table.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Mesa {table.numero_mesa}</h4>
                        <p className="text-sm text-gray-600">{table.capacidade} pessoas</p>
                        <p className="text-sm text-gray-600">
                          Status: Em uso
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Ocupada</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      Mesa em uso. Os itens estão sendo lançados diretamente na mesa.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resumo rápido de mesas aguardando pagamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Import className="h-5 w-5 mr-2" />
              Mesas Aguardando Pagamento
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 mb-2">
                {(tables || []).filter(table => table.status === 'aguardando_pagamento').length} mesa(s) aguardando pagamento
              </p>
              <p className="text-sm text-orange-600 mb-3">
                Use a aba "Importar Mesas" para processar os pagamentos pendentes.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Programatically change to pending tab
                  const pendingTab = document.querySelector('[value="pending"]') as HTMLElement;
                  if (pendingTab) pendingTab.click();
                }}
              >
                <Import className="h-4 w-4 mr-2" />
                Ver Mesas Pendentes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingPaymentTables restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <p className="text-gray-600">Lista de pedidos ativos será implementada aqui</p>
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