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
import { PaymentProcessor } from '@/components/payments/PaymentProcessor';
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
  const [orderId, setOrderId] = useState<string | null>(null);
  
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

  const handlePaymentSubmit = async () => {
    if (!cart || !user) return;

    setLoading(true);
    try {
      // Create order first
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

      setOrderId(order.id);
      setStep(3);
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

  const handlePaymentSuccess = async (paymentId: string) => {
    await clearCart();
    toast({
      title: "Pagamento realizado!",
      description: `Pedido #${orderId?.slice(-8)} foi confirmado com sucesso`,
    });
    onClose();
    setStep(1);
    setOrderId(null);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Erro no pagamento",
      description: error,
      variant: "destructive",
    });
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setOrderId(null);
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
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão de Crédito</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="debit_card" id="debit_card" />
                <Label htmlFor="debit_card" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão de Débito</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="money" id="money" />
                <Label htmlFor="money" className="flex items-center space-x-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span>Dinheiro na Entrega</span>
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
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="flex-1"
                disabled={loading}
              >
                Voltar
              </Button>
              <Button 
                onClick={handlePaymentSubmit} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Criando pedido...' : 'Continuar para Pagamento'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Processing */}
        {step === 3 && orderId && (
          <div className="space-y-4">
            <PaymentProcessor
              orderId={orderId}
              totalAmount={total}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
            
            <Button 
              variant="outline" 
              onClick={() => setStep(2)} 
              className="w-full"
            >
              Voltar para Pagamento
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};