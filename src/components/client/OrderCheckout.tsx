
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, ArrowLeft, CreditCard } from 'lucide-react';

interface OrderCheckoutProps {
  restaurantId: string;
  restaurantName: string;
  cart: { [key: string]: number };
  products: Array<{
    id: string;
    nome: string;
    preco: number;
  }>;
  onClose: () => void;
  onBack: () => void;
}

interface DeliveryAddress {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export const OrderCheckout = ({ 
  restaurantId, 
  restaurantName, 
  cart, 
  products, 
  onClose, 
  onBack 
}: OrderCheckoutProps) => {
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: ''
  });
  const [observations, setObservations] = useState('');
  const [useUserAddress, setUseUserAddress] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar endereços salvos do usuário
  const { data: userAddresses } = useQuery({
    queryKey: ['user-addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Buscar detalhes do restaurante para taxa de entrega
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-details', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('taxa_entrega, tempo_entrega_min')
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          cliente_id: user.id,
          restaurante_id: restaurantId,
          status: 'pendente',
          total: orderData.total,
          taxa_entrega: restaurant?.taxa_entrega || 0,
          tempo_estimado: restaurant?.tempo_entrega_min || 30,
          endereco_entrega: deliveryAddress,
          observacoes: observations
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          order_id: order.id,
          nome_item: product?.nome || '',
          quantidade: quantity,
          preco_unitario: product?.preco || 0
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Salvar carrinho no banco para o usuário
      await supabase
        .from('client_cart')
        .upsert({
          user_id: user.id,
          restaurant_id: restaurantId,
          itens: Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return {
              product_id: productId,
              nome: product?.nome,
              preco: product?.preco,
              quantidade: quantity
            };
          }),
          observacoes: observations
        });

      return order;
    },
    onSuccess: (order) => {
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${order.id.slice(-8)} foi enviado para ${restaurantName}`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao realizar pedido",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const calculateSubtotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.preco || 0) * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (restaurant?.taxa_entrega || 0);
  };

  const handleSubmitOrder = () => {
    if (!deliveryAddress.logradouro || !deliveryAddress.numero || 
        !deliveryAddress.bairro || !deliveryAddress.cidade) {
      toast({
        title: "Endereço incompleto",
        description: "Por favor, preencha todos os campos do endereço.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      total: calculateTotal()
    });
  };

  const useAddress = (address: any) => {
    setDeliveryAddress({
      logradouro: address.logradouro,
      numero: address.numero,
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      cep: address.cep,
      complemento: address.complemento || ''
    });
    setUseUserAddress(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
        </div>

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido - {restaurantName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  return (
                    <div key={productId} className="flex justify-between">
                      <span>{quantity}x {product?.nome}</span>
                      <span>R$ {((product?.preco || 0) * quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {(restaurant?.taxa_entrega || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereços Salvos */}
          {userAddresses && userAddresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereços Salvos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userAddresses.map((address) => (
                    <div key={address.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{address.titulo}</p>
                        <p className="text-sm text-gray-600">
                          {address.logradouro}, {address.numero} - {address.bairro}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => useAddress(address)}>
                        Usar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Logradouro"
                  value={deliveryAddress.logradouro}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                />
                <Input
                  placeholder="Número"
                  value={deliveryAddress.numero}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, numero: e.target.value }))}
                />
                <Input
                  placeholder="Bairro"
                  value={deliveryAddress.bairro}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, bairro: e.target.value }))}
                />
                <Input
                  placeholder="Cidade"
                  value={deliveryAddress.cidade}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, cidade: e.target.value }))}
                />
                <Input
                  placeholder="Estado"
                  value={deliveryAddress.estado}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, estado: e.target.value }))}
                />
                <Input
                  placeholder="CEP"
                  value={deliveryAddress.cep}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, cep: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Complemento (opcional)"
                value={deliveryAddress.complemento}
                onChange={(e) => setDeliveryAddress(prev => ({ ...prev, complemento: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observações sobre o pedido (opcional)"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Tempo Estimado */}
          {restaurant?.tempo_entrega_min && (
            <div className="text-center text-gray-600">
              <p>Tempo estimado de entrega: {restaurant.tempo_entrega_min} minutos</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Voltar
            </Button>
            <Button 
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
