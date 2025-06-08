
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  CreditCard, 
  Users,
  X,
  ShoppingCart,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface POSSystemPageProps {
  restaurantId: string;
}

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  observacoes?: string;
}

interface TableOrder {
  id: string;
  numero_mesa: number;
  total: number;
  status: string;
  cliente_nome?: string;
  created_at: string;
  pos_order_items: Array<{
    id: string;
    nome_produto: string;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
    observacoes?: string;
  }>;
}

export const POSSystemPage = ({ restaurantId }: POSSystemPageProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'mesa' | 'balcao'>('mesa');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showTableOrders, setShowTableOrders] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar produtos do restaurante
  const { data: products } = useQuery({
    queryKey: ['restaurant-products-pos', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_products')
        .select(`
          *,
          product_categories (nome)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('ativo', true)
        .eq('disponivel', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['product-categories-pos', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('ativo', true)
        .order('posicao');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar pedidos de mesa fechados (aguardando pagamento)
  const { data: tableOrders, refetch: refetchTableOrders } = useQuery({
    queryKey: ['table-orders-closed', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items (*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'fechado')
        .eq('tipo_pedido', 'mesa')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as TableOrder[];
    },
    enabled: showTableOrders
  });

  // Mutation para criar pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data: order, error: orderError } = await supabase
        .from('pos_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Inserir itens do pedido
      const items = cart.map(item => ({
        pos_order_id: order.id,
        product_id: item.id,
        nome_produto: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        preco_total: item.preco * item.quantidade,
        observacoes: item.observacoes
      }));

      const { error: itemsError } = await supabase
        .from('pos_order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      toast({
        title: "Pedido criado com sucesso!",
        description: "O pedido foi registrado no sistema.",
      });
      setCart([]);
      setSelectedTable(null);
      setCustomerName('');
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para finalizar pagamento de mesa
  const finalizeTableOrderMutation = useMutation({
    mutationFn: async ({ orderId, metodo_pagamento }: { orderId: string; metodo_pagamento: string }) => {
      const { error } = await supabase
        .from('pos_orders')
        .update({
          status: 'pago',
          metodo_pagamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Pagamento processado!",
        description: "Mesa liberada com sucesso.",
      });
      refetchTableOrders();
      setShowTableOrders(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: 1
      }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantidade + change);
          return newQuantity === 0 ? null : { ...item, quantidade: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  };

  const getTotal = () => {
    return getSubtotal(); // Por enquanto sem taxas adicionais
  };

  const getChange = () => {
    const payment = parseFloat(paymentAmount) || 0;
    const total = getTotal();
    return payment > total ? payment - total : 0;
  };

  const handleFinishOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    if (orderType === 'mesa' && !selectedTable) {
      toast({
        title: "Mesa obrigatória",
        description: "Selecione o número da mesa para pedidos de mesa.",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      restaurant_id: restaurantId,
      tipo_pedido: orderType,
      numero_mesa: orderType === 'mesa' ? selectedTable : null,
      cliente_nome: customerName || null,
      subtotal: getSubtotal(),
      total: getTotal(),
      status: 'aberto'
    };

    createOrderMutation.mutate(orderData);
  };

  const handleImportTableOrder = (order: TableOrder) => {
    const importedItems: CartItem[] = order.pos_order_items.map(item => ({
      id: item.id,
      nome: item.nome_produto,
      preco: item.preco_unitario,
      quantidade: item.quantidade,
      observacoes: item.observacoes
    }));

    setCart(importedItems);
    setSelectedTable(order.numero_mesa);
    setCustomerName(order.cliente_nome || '');
    setOrderType('mesa');
    setShowTableOrders(false);

    toast({
      title: "Pedido importado!",
      description: `Pedido da mesa ${order.numero_mesa} foi carregado no POS.`,
    });
  };

  const handleFinalizeTablePayment = (orderId: string, metodo: string) => {
    finalizeTableOrderMutation.mutate({ orderId, metodo_pagamento: metodo });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Produtos */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sistema POS</h2>
          <Dialog open={showTableOrders} onOpenChange={setShowTableOrders}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Mesas Fechadas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pedidos de Mesa Aguardando Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {tableOrders?.map((order) => (
                  <Card key={order.id} className="border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Mesa {order.numero_mesa}</CardTitle>
                          {order.cliente_nome && (
                            <p className="text-sm text-gray-600">{order.cliente_nome}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            R$ {order.total.toFixed(2)}
                          </p>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium">Itens do Pedido:</h4>
                        {order.pos_order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantidade}x {item.nome_produto}</span>
                            <span>R$ {item.preco_total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImportTableOrder(order)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Importar para POS
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleFinalizeTablePayment(order.id, 'dinheiro')}
                          disabled={finalizeTableOrderMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Receber Dinheiro
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFinalizeTablePayment(order.id, 'cartao')}
                          disabled={finalizeTableOrderMutation.isPending}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Receber Cartão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {tableOrders?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido de mesa aguardando pagamento</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[500px]">
          {products?.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  {product.imagem_url && (
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-medium text-sm">{product.nome}</h3>
                  <p className="text-green-600 font-bold">
                    R$ {product.preco.toFixed(2)}
                  </p>
                  {product.product_categories && (
                    <p className="text-xs text-gray-500">
                      {product.product_categories.nome}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Carrinho e Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedido Atual</span>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Pedido */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Pedido</label>
              <div className="flex gap-2">
                <Button
                  variant={orderType === 'mesa' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderType('mesa')}
                >
                  Mesa
                </Button>
                <Button
                  variant={orderType === 'balcao' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderType('balcao')}
                >
                  Balcão
                </Button>
              </div>
            </div>

            {/* Número da Mesa */}
            {orderType === 'mesa' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Número da Mesa</label>
                <Input
                  type="number"
                  value={selectedTable || ''}
                  onChange={(e) => setSelectedTable(parseInt(e.target.value) || null)}
                  placeholder="Ex: 1"
                />
              </div>
            )}

            {/* Nome do Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Cliente (Opcional)</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            {/* Itens do Carrinho */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.nome}</p>
                    <p className="text-xs text-gray-600">
                      R$ {item.preco.toFixed(2)} x {item.quantidade}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantidade}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            {cart.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>R$ {getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Campo de Pagamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Recebido</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Valor recebido"
                  />
                  {paymentAmount && parseFloat(paymentAmount) > getTotal() && (
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">
                        Troco: R$ {getChange().toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleFinishOrder}
                  disabled={createOrderMutation.isPending}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                </Button>
              </>
            )}

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Carrinho vazio</p>
                <p className="text-sm">Adicione produtos para iniciar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
