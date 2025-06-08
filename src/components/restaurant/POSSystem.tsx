
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
import { Plus, ShoppingCart, Users, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface POSSystemProps {
  restaurantId: string;
}

export const POSSystem = ({ restaurantId }: POSSystemProps) => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'mesa' | 'avulso'>('mesa');

  const queryClient = useQueryClient();

  // Buscar mesas disponíveis - usando restaurant_tables se existir, senão criar mock
  const { data: tables } = useQuery({
    queryKey: ['restaurant-tables', restaurantId],
    queryFn: async () => {
      // Retornar dados mock por enquanto até as tabelas serem criadas
      return [
        { id: '1', numero_mesa: 1, capacidade: 4, status: 'disponivel', localizacao: 'Área interna' },
        { id: '2', numero_mesa: 2, capacidade: 2, status: 'ocupada', localizacao: 'Varanda' },
        { id: '3', numero_mesa: 3, capacidade: 6, status: 'disponivel', localizacao: 'Área externa' },
        { id: '4', numero_mesa: 4, capacidade: 4, status: 'disponivel', localizacao: 'Área interna' },
      ];
    },
  });

  // Buscar sessões ativas - mock por enquanto
  const { data: activeSessions } = useQuery({
    queryKey: ['active-sessions', restaurantId],
    queryFn: async () => {
      return [
        {
          id: '1',
          table: { numero_mesa: 2 },
          opened_at: new Date().toISOString(),
          pos_orders: []
        }
      ];
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

  // Abrir mesa - mock por enquanto
  const openTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      console.log('Abrindo mesa:', tableId);
      // Implementação mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: tableId };
    },
    onSuccess: () => {
      toast.success('Mesa aberta com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao abrir mesa: ' + error.message);
    }
  });

  // Fechar mesa - mock por enquanto
  const closeTableMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log('Fechando mesa:', sessionId);
      // Implementação mock
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success('Mesa fechada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao fechar mesa: ' + error.message);
    }
  });

  // Criar pedido - usar tabela orders existente
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const orderNumber = `POS-${Date.now()}`;
      
      // Por enquanto, criar um pedido simples na tabela orders
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurante_id: restaurantId,
          cliente_id: null, // Pedido POS não tem cliente específico
          status: 'preparando',
          total: orderData.total,
          endereco_entrega: { tipo: orderType, mesa: selectedTable?.numero_mesa },
          observacoes: `Pedido POS - ${orderType}`
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
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar pedido: ' + error.message);
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

  const getTableStatusColor = (status: string) => {
    const colors = {
      'disponivel': 'bg-green-100 text-green-800',
      'ocupada': 'bg-red-100 text-red-800',
      'reservada': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          setShowOrderModal(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Venda Avulsa
        </Button>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList>
          <TabsTrigger value="tables">Controle de Mesas</TabsTrigger>
          <TabsTrigger value="orders">Pedidos Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          {/* Mesas disponíveis */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mesas Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(tables || []).filter(table => table.status === 'disponivel').map((table) => (
                <Card key={table.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-semibold">Mesa {table.numero_mesa}</p>
                    <p className="text-sm text-gray-600">{table.capacidade} pessoas</p>
                    <Badge className={getTableStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => openTableMutation.mutate(table.id)}
                    >
                      Abrir Mesa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mesas ocupadas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mesas Ocupadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeSessions || []).map((session) => (
                <Card key={session.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Mesa {session.table?.numero_mesa}</h4>
                        <p className="text-sm text-gray-600">
                          Aberta em: {new Date(session.opened_at).toLocaleTimeString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pedidos: {session.pos_orders?.length || 0}
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Ocupada</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTable(session);
                          setOrderType('mesa');
                          setShowOrderModal(true);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Pedido
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => closeTableMutation.mutate(session.id)}
                      >
                        Fechar Mesa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
                ? `Novo Pedido - Mesa ${selectedTable?.table?.numero_mesa}`
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
    </div>
  );
};
