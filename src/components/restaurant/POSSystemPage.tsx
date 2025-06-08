
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Calculator } from 'lucide-react';

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

export const POSSystemPage = ({ restaurantId }: POSSystemPageProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [observations, setObservations] = useState('');
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['restaurant-products', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      
      const { data, error } = await supabase
        .from('restaurant_products')
        .select(`
          *,
          product_categories(nome, icone)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('ativo', true)
        .eq('disponivel', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!restaurantId
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // Criar pedido POS
      const { data: order, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          restaurant_id: restaurantId,
          cliente_nome: customerName || 'Cliente Balcão',
          subtotal: orderData.subtotal,
          desconto: discount,
          total: orderData.total,
          observacoes: observations,
          tipo_pedido: 'balcao',
          status: 'concluido'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      if (cart.length > 0) {
        const orderItems = cart.map(item => ({
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
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      toast({
        title: "Venda realizada!",
        description: "Pedido criado com sucesso.",
      });
      // Limpar carrinho
      setCart([]);
      setCustomerName('');
      setObservations('');
      setDiscount(0);
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar venda",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: 1
      }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantidade: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const total = subtotal - discount;

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      subtotal,
      total
    });
  };

  if (loadingProducts) {
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
          <h2 className="text-2xl font-bold">Sistema POS</h2>
          <p className="text-gray-600">Vendas diretas e importação de produtos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {products?.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{product.nome}</h3>
                      <Badge variant="secondary">
                        {product.product_categories?.icone} {product.product_categories?.nome}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.descricao}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">R$ {product.preco?.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {products?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum produto disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrinho e Finalização */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho ({cart.length} itens)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nome}</p>
                      <p className="text-xs text-gray-600">R$ {item.preco.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Desconto (R$)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações do pedido..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto:</span>
                      <span>-R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleFinalizeSale}
                  disabled={cart.length === 0 || createOrderMutation.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Venda'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
