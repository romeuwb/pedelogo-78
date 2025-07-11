import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Minus, ShoppingCart, X, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Table {
  id: string;
  numero_mesa: number;
  capacidade: number;
  status: string;
}

interface Product {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
}

interface OrderItem {
  id?: string;
  product_id: string;
  nome_item: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  observacoes?: string;
}

interface TableOrder {
  id: string;
  status: string;
  total: number;
}

interface TableOrderSystemProps {
  table: Table;
  restaurantId: string;
  onClose: () => void;
}

const TableOrderSystem = ({ table, restaurantId, onClose }: TableOrderSystemProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<TableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
    loadCurrentOrder();
  }, [table.id, restaurantId]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_products')
        .select('id, nome, preco, descricao')
        .eq('restaurant_id', restaurantId)
        .eq('ativo', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const loadCurrentOrder = async () => {
    try {
      setLoading(true);
      
      // Buscar pedido aberto usando any para contornar problemas de tipos
      const { data: orderData, error: orderError } = await (supabase as any)
        .from('table_orders')
        .select('*')
        .eq('table_id', table.id)
        .eq('status', 'aberto')
        .maybeSingle();

      if (orderError && orderError.code !== 'PGRST116') {
        console.error('Erro ao buscar pedido:', orderError);
        await createNewOrder();
        return;
      }

      if (orderData) {
        setCurrentOrder(orderData);
        await loadOrderItems(orderData.id);
      } else {
        await createNewOrder();
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast.error('Erro ao carregar pedido da mesa');
      await createNewOrder();
    } finally {
      setLoading(false);
    }
  };

  const createNewOrder = async () => {
    try {
      const orderInsert = {
        table_id: table.id,
        restaurant_id: restaurantId,
        status: 'aberto',
        total: 0
      };

      const { data: newOrder, error: createError } = await (supabase as any)
        .from('table_orders')
        .insert(orderInsert)
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar pedido:', createError);
        return;
      }

      setCurrentOrder(newOrder);
      setOrderItems([]);
      toast.success('Novo pedido criado para a mesa!');
    } catch (error) {
      console.error('Erro ao criar novo pedido:', error);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      const { data: itemsData, error: itemsError } = await (supabase as any)
        .from('table_order_items')
        .select('*')
        .eq('table_order_id', orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const addItem = async (product: Product) => {
    if (!currentOrder) return;

    try {
      // Verificar se item já existe no pedido
      const existingItem = orderItems.find(item => item.product_id === product.id);
      
      if (existingItem && existingItem.id) {
        // Atualizar quantidade
        const newQuantity = existingItem.quantidade + 1;
        const newSubtotal = newQuantity * product.preco;
        
        const { error } = await (supabase as any)
          .from('table_order_items')
          .update({
            quantidade: newQuantity,
            subtotal: newSubtotal
          })
          .eq('id', existingItem.id);

        if (error) throw error;

        setOrderItems(items => 
          items.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantidade: newQuantity, subtotal: newSubtotal }
              : item
          )
        );
      } else {
        // Adicionar novo item
        const newItemData = {
          table_order_id: currentOrder.id,
          product_id: product.id,
          nome_item: product.nome,
          quantidade: 1,
          preco_unitario: product.preco,
          subtotal: product.preco
        };

        const { data, error } = await (supabase as any)
          .from('table_order_items')
          .insert(newItemData)
          .select()
          .single();

        if (error) throw error;
        setOrderItems(items => [...items, data]);
      }

      toast.success(`${product.nome} adicionado ao pedido`);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const item = orderItems.find(i => i.id === itemId);
      if (!item) return;

      const newSubtotal = newQuantity * item.preco_unitario;

      const { error } = await (supabase as any)
        .from('table_order_items')
        .update({
          quantidade: newQuantity,
          subtotal: newSubtotal
        })
        .eq('id', itemId);

      if (error) throw error;

      setOrderItems(items => 
        items.map(item => 
          item.id === itemId 
            ? { ...item, quantidade: newQuantity, subtotal: newSubtotal }
            : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro ao atualizar quantidade');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('table_order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setOrderItems(items => items.filter(item => item.id !== itemId));
      toast.success('Item removido do pedido');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const closeOrder = async () => {
    if (!currentOrder || orderItems.length === 0) {
      toast.error('Adicione itens ao pedido antes de fechar');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('table_orders')
        .update({
          status: 'fechado',
          closed_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (error) throw error;

      toast.success('Pedido fechado! Mesa aguardando pagamento.');
      onClose();
    } catch (error) {
      console.error('Erro ao fechar pedido:', error);
      toast.error('Erro ao fechar pedido');
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2">Carregando sistema de pedidos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Mesa {table.numero_mesa} - Lançamento de Itens</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Clique nos produtos para adicionar ao pedido. Os itens são salvos automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Produtos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar produto</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do produto..."
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum produto encontrado</p>
                      <p className="text-sm">Verifique se há produtos cadastrados</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary hover:bg-primary/5">
                        <CardContent className="p-4" onClick={() => addItem(product)}>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{product.nome}</h4>
                              {product.descricao && (
                                <p className="text-sm text-gray-600 mt-1">{product.descricao}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-green-600 text-lg">R$ {product.preco.toFixed(2)}</p>
                              <Button size="sm" variant="outline" className="mt-2">
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pedido Atual */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Pedido Atual
                  </div>
                  <div className="text-sm font-normal text-gray-600">
                    {orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">Nenhum item no pedido</p>
                    <p className="text-sm">Clique nos produtos à esquerda para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.nome_item}</h4>
                          <p className="text-sm text-gray-600">
                            R$ {item.preco_unitario.toFixed(2)} cada
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id!, item.quantidade - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-bold text-lg">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id!, item.quantidade + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.id!)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-24 ml-4">
                          <p className="font-bold text-lg">R$ {item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t-2">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total do Pedido:</span>
                        <span className="text-green-600">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button 
                onClick={closeOrder}
                disabled={orderItems.length === 0}
                className="flex-1"
                size="lg"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Fechar Mesa (Aguardar Pagamento)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableOrderSystem;