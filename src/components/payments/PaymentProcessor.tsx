
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, DollarSign, QrCode, Loader2 } from 'lucide-react';

interface PaymentProcessorProps {
  orderId: string;
  totalAmount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentProcessor = ({ orderId, totalAmount, onPaymentSuccess, onPaymentError }: PaymentProcessorProps) => {
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
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Get system payment settings
  const { data: paymentSettings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('chave, valor')
        .in('chave', ['stripe_publishable_key', 'stripe_secret_key']);
      
      if (error) throw error;
      
      const settings: any = {};
      data.forEach(setting => {
        settings[setting.chave] = setting.valor;
      });
      
      return settings;
    }
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setProcessing(true);
      
      try {
        // Call payment processing edge function
        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: {
            orderId,
            paymentMethod,
            amount: totalAmount,
            currency: 'BRL',
            ...paymentData
          }
        });

        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
      } finally {
        setProcessing(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Pagamento processado!",
        description: "Seu pagamento foi aprovado com sucesso.",
      });
      onPaymentSuccess(data.paymentId);
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao processar pagamento';
      toast({
        title: "Erro no pagamento",
        description: message,
        variant: "destructive",
      });
      onPaymentError(message);
    }
  });

  const handlePayment = () => {
    if (!paymentSettings?.stripe_publishable_key && paymentMethod !== 'money') {
      toast({
        title: "Configuração necessária",
        description: "Configure as chaves do Stripe no painel administrativo",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
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
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Finalizar Pagamento
        </CardTitle>
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
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card" className="flex items-center cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Cartão de Crédito
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="debit_card" id="debit_card" />
              <Label htmlFor="debit_card" className="flex items-center cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Cartão de Débito
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center cursor-pointer flex-1">
                <QrCode className="h-5 w-5 mr-2 text-purple-600" />
                PIX
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="money" id="money" />
              <Label htmlFor="money" className="flex items-center cursor-pointer flex-1">
                <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
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
                  name: e.target.value.toUpperCase()
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
                  type="password"
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
            <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
              <QrCode className="h-20 w-20 mx-auto mb-3 text-purple-600" />
              <p className="text-sm text-purple-700 font-medium">
                QR Code será gerado após confirmação
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Escaneie com seu app do banco
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
                  cpf: formatCPF(e.target.value)
                })}
                maxLength={14}
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
                  name: e.target.value.toUpperCase()
                })}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'money' && (
          <div className="text-center p-6 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
            <DollarSign className="h-20 w-20 mx-auto mb-3 text-orange-600" />
            <p className="text-sm text-orange-700 font-medium">
              Pagamento será realizado na entrega
            </p>
            <p className="text-xs text-orange-600 mt-2">
              Tenha o valor exato ou próximo para facilitar o troco
            </p>
            <div className="mt-3 p-2 bg-orange-100 rounded">
              <p className="text-xs text-orange-800">
                💡 Dica: Pagamentos em dinheiro podem ter tempo de entrega maior
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={handlePayment}
          disabled={processing || processPaymentMutation.isPending}
          className="w-full"
          size="lg"
        >
          {processing || processPaymentMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            paymentMethod === 'money' ? 'Confirmar Pedido' : 'Finalizar Pagamento'
          )}
        </Button>

        {paymentMethod !== 'money' && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Seus dados estão protegidos com criptografia SSL
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;
