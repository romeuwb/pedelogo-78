
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
import { Plus, ShoppingCart, Users, Package, DollarSign, Search, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface POSSystemPageProps {
  restaurantId: string;
}

export const POSSystemPage = ({ restaurantId }: POSSystemPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<'mesa' | 'balcao'>('balcao');

  const queryClient = useQueryClient();

  // Buscar produtos do restaurante
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['restaurant-products-pos', restaurantId, searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_products')
        .select(`
          *,
          product_categories (nome)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('disponivel', true)
        .eq('ativo', true)
        .order('nome');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['product-categories', restaurantId],
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

  // Criar pedido POS
  const createPOSOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // Criar o pedido POS
      const { data: posOrder, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          restaurant_id: restaurantId,
          tipo_pedido: orderType,
          numero_mesa: tableNumber,
          cliente_nome: customerName || 'Cliente Balcão',
          subtotal: orderData.subtotal,
          total: orderData.total,
          metodo_pagamento: paymentMethod,
          status: 'finalizado'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Inserir itens do pedido
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('pos_order_items')
          .insert(
            orderItems.map(item => ({
              pos_order_id: posOrder.id,
              product_id: item.id,
              nome_produto: item.nome,
              quantidade: item.quantidade,
              preco_unitario: item.preco,
              preco_total: item.preco * item.quantidade
            }))
          );

        if (itemsError) throw itemsError;
      }

      return posOrder;
    },
    onSuccess: () => {
      toast.success('Venda realizada com sucesso!');
      setOrderItems([]);
      setCustomerName('');
      setTableNumber(null);
      setShowPaymentModal(false);
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao realizar venda: ' + error.message);
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
      setOrderItems([...orderItems, { 
        ...product, 
        quantidade: 1,
        categoria: product.product_categories?.nome || 'Sem categoria'
      }]);
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

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Por enquanto sem taxas adicionais
  };

  const handleFinalizeSale = () => {
    if (orderItems.length === 0) {
      toast.error('Adicione itens ao pedido primeiro');
      return;
    }

    if (orderType === 'mesa' && !tableNumber) {
      toast.error('Informe o número da mesa');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    createPOSOrderMutation.mutate({
      subtotal: calculateSubtotal(),
      total: calculateTotal()
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomerName('');
    setTableNumber(null);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Lado esquerdo - Produtos */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">Sistema POS</h2>
            
            {/* Filtros */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de produtos */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingProducts ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando produtos...</p>
                </div>
              ) : (
                products?.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addItemToOrder(product)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {product.imagem_url ? (
                          <img
                            src={product.imagem_url}
                            alt={product.nome}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {product.nome}
                      </h3>
                      
                      <p className="text-lg font-bold text-green-600">
                        R$ {product.preco.toFixed(2)}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        {product.product_categories?.nome || 'Sem categoria'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Carrinho e checkout */}
      <div className="w-96 bg-white border-l border-gray-200 p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Pedido Atual</h3>
          
          {/* Tipo de pedido */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tipo de Pedido</label>
            <div className="flex gap-2">
              <Button
                variant={orderType === 'balcao' ? 'default' : 'outline'}
                onClick={() => setOrderType('balcao')}
                className="flex-1"
              >
                Balcão
              </Button>
              <Button
                variant={orderType === 'mesa' ? 'default' : 'outline'}
                onClick={() => setOrderType('mesa')}
                className="flex-1"
              >
                Mesa
              </Button>
            </div>
          </div>

          {/* Mesa (se tipo mesa) */}
          {orderType === 'mesa' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Número da Mesa *</label>
              <Input
                type="number"
                placeholder="Ex: 5"
                value={tableNumber || ''}
                onChange={(e) => setTableNumber(parseInt(e.target.value) || null)}
              />
            </div>
          )}

          {/* Nome do cliente */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
            <Input
              placeholder="Nome (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto mb-4">
          {orderItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhum item no pedido</p>
              <p className="text-sm">Clique nos produtos para adicionar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.nome}</h4>
                    <p className="text-xs text-gray-500">{item.categoria}</p>
                    <p className="text-sm font-semibold text-green-600">
                      R$ {item.preco.toFixed(2)}
                    </p>
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
                      variant="outline"
                      onClick={() => removeItemFromOrder(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total e ações */}
        <div className="border-t pt-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearOrder}
              disabled={orderItems.length === 0}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              onClick={handleFinalizeSale}
              disabled={orderItems.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
              <div className="space-y-1 text-sm">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantidade}x {item.nome}</span>
                    <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
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
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={createPOSOrderMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createPOSOrderMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
