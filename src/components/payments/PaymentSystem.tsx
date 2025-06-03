
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, DollarSign, QrCode } from 'lucide-react';

interface PaymentSystemProps {
  orderId: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
}

const PaymentSystem = ({ orderId, totalAmount, onPaymentSuccess }: PaymentSystemProps) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [pixData, setPixData] = useState({
    cpf: '',
    name: ''
  });
  const { toast } = useToast();

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar status do pedido para confirmado
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmado',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Pagamento aprovado!",
        description: "Seu pedido foi confirmado e está sendo preparado.",
      });
      onPaymentSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handlePayment = () => {
    const paymentData = {
      orderId,
      method: paymentMethod,
      amount: totalAmount,
      ...(paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? cardData : {}),
      ...(paymentMethod === 'pix' ? pixData : {})
    };

    processPaymentMutation.mutate(paymentData);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Finalizar Pagamento</CardTitle>
        <p className="text-center text-2xl font-bold text-green-600">
          R$ {totalAmount.toFixed(2)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Método de Pagamento</Label>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={setPaymentMethod}
            className="mt-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                <CreditCard className="h-5 w-5 mr-2" />
                Cartão de Crédito
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="debit_card" id="debit_card" />
              <Label htmlFor="debit_card" className="flex items-center cursor-pointer">
                <CreditCard className="h-5 w-5 mr-2" />
                Cartão de Débito
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center cursor-pointer">
                <QrCode className="h-5 w-5 mr-2" />
                PIX
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="money" id="money" />
              <Label htmlFor="money" className="flex items-center cursor-pointer">
                <DollarSign className="h-5 w-5 mr-2" />
                Dinheiro (na entrega)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({
                  ...cardData,
                  number: formatCardNumber(e.target.value)
                })}
                maxLength={19}
              />
            </div>
            
            <div>
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="João Silva"
                value={cardData.name}
                onChange={(e) => setCardData({
                  ...cardData,
                  name: e.target.value
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({
                    ...cardData,
                    expiry: formatExpiry(e.target.value)
                  })}
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({
                    ...cardData,
                    cvv: e.target.value.replace(/\D/g, '')
                  })}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'pix' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <QrCode className="h-16 w-16 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-600">
                Escaneie o QR Code com seu app do banco
              </p>
            </div>
            
            <div>
              <Label htmlFor="pixCpf">CPF do Pagador</Label>
              <Input
                id="pixCpf"
                placeholder="000.000.000-00"
                value={pixData.cpf}
                onChange={(e) => setPixData({
                  ...pixData,
                  cpf: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="pixName">Nome Completo</Label>
              <Input
                id="pixName"
                placeholder="João Silva"
                value={pixData.name}
                onChange={(e) => setPixData({
                  ...pixData,
                  name: e.target.value
                })}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'money' && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-16 w-16 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-green-600">
              Pagamento será realizado na entrega
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Tenha o valor exato ou próximo para facilitar o troco
            </p>
          </div>
        )}

        <Button 
          onClick={handlePayment}
          disabled={processPaymentMutation.isPending}
          className="w-full"
          size="lg"
        >
          {processPaymentMutation.isPending ? 'Processando...' : 
           paymentMethod === 'money' ? 'Confirmar Pedido' : 'Finalizar Pagamento'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentSystem;
