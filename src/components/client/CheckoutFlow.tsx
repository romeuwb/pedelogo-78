import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, CreditCard, Wallet, DollarSign } from 'lucide-react';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Address {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export const CheckoutFlow = ({ isOpen, onClose }: CheckoutFlowProps) => {
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [address, setAddress] = useState<Address>({
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [observacoes, setObservacoes] = useState('');

  const subtotal = getCartTotal();
  const taxaEntrega = 5.00;
  const total = subtotal + taxaEntrega;

  const handleAddressSubmit = () => {
    // Validate required fields
    if (!address.logradouro || !address.numero || !address.bairro || !address.cidade || !address.cep) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios do endereço",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = () => {
    setStep(3);
  };

  const handleOrderSubmit = async () => {
    if (!cart || !user) return;

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          cliente_id: user.id,
          restaurante_id: cart.restaurantId,
          status: 'pendente',
          total: subtotal,
          taxa_entrega: taxaEntrega,
          endereco_entrega: address as any,
          observacoes,
          metodo_pagamento: paymentMethod,
          tempo_estimado: 45
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        nome_item: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        observacoes: item.observacoes
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: "Pedido realizado!",
        description: `Pedido #${order.id.slice(-8)} foi criado com sucesso`,
      });

      onClose();
      setStep(1);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  if (!cart) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Finalizar Pedido - Passo {step} de 3
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" />
              <span>Endereço de Entrega</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="logradouro">Rua/Avenida *</Label>
                <Input
                  id="logradouro"
                  value={address.logradouro}
                  onChange={(e) => setAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                  placeholder="Nome da rua"
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={address.numero}
                  onChange={(e) => setAddress(prev => ({ ...prev, numero: e.target.value }))}
                  placeholder="123"
                />
              </div>
              
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={address.complemento}
                  onChange={(e) => setAddress(prev => ({ ...prev, complemento: e.target.value }))}
                  placeholder="Apt 45"
                />
              </div>
              
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={address.bairro}
                  onChange={(e) => setAddress(prev => ({ ...prev, bairro: e.target.value }))}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={address.cidade}
                  onChange={(e) => setAddress(prev => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>
              
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={address.estado}
                  onChange={(e) => setAddress(prev => ({ ...prev, estado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              
              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={address.cep}
                  onChange={(e) => setAddress(prev => ({ ...prev, cep: e.target.value }))}
                  placeholder="12345-678"
                />
              </div>
            </div>

            <Button onClick={handleAddressSubmit} className="w-full">
              Continuar para Pagamento
            </Button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <CreditCard className="h-5 w-5" />
              <span>Forma de Pagamento</span>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center space-x-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  <span>PIX (Instantâneo)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="dinheiro" id="dinheiro" />
                <Label htmlFor="dinheiro" className="flex items-center space-x-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span>Dinheiro na Entrega</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="cartao" id="cartao" />
                <Label htmlFor="cartao" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão na Entrega</span>
                </Label>
              </div>
            </RadioGroup>

            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre o pedido..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handlePaymentSubmit} className="flex-1">
                Revisar Pedido
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revisar Pedido</h3>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{cart.restaurantName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.quantidade}x {item.nome}</span>
                    <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {taxaEntrega.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Address Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {address.logradouro}, {address.numero}
                  {address.complemento && `, ${address.complemento}`}
                </p>
                <p className="text-sm">
                  {address.bairro}, {address.cidade} - {address.estado}
                </p>
                <p className="text-sm">CEP: {address.cep}</p>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm capitalize">{paymentMethod}</p>
              </CardContent>
            </Card>

            {observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{observacoes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handleOrderSubmit} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};