import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, QrCode, DollarSign, Loader2, CheckCircle } from 'lucide-react';

interface StripePaymentProcessorProps {
  orderId: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const StripePaymentProcessor: React.FC<StripePaymentProcessorProps> = ({
  orderId,
  totalAmount,
  onPaymentSuccess,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe_card');
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
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success' | 'pix_waiting'>('method');
  const [pixCode, setPixCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  
  const { toast } = useToast();

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId,
          paymentMethod: paymentData.method,
          amount: totalAmount,
          cardData: paymentData.method === 'stripe_card' ? cardData : null,
          pixData: paymentData.method === 'pix' ? pixData : null
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.status === 'approved') {
        setPaymentStep('success');
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pedido foi confirmado com sucesso.",
        });
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else if (data.status === 'pending' && paymentMethod === 'pix') {
        setPixCode(data.pixCode);
        setQrCode(data.qrCode);
        setPaymentStep('pix_waiting');
        // Iniciar polling para verificar status do PIX
        startPixStatusPolling();
      } else if (data.status === 'pending' && paymentMethod === 'stripe_card') {
        // Integrar com Stripe Elements para capturar cartão
        processStripePayment(data.clientSecret);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente ou escolha outro método.",
        variant: "destructive",
      });
      setPaymentStep('method');
    }
  });

  const processStripePayment = async (clientSecret: string) => {
    // Em uma implementação real, usaria Stripe Elements
    // Por agora, simular sucesso após delay
    setPaymentStep('processing');
    
    setTimeout(() => {
      setPaymentStep('success');
      toast({
        title: "Pagamento aprovado!",
        description: "Seu cartão foi processado com sucesso.",
      });
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    }, 3000);
  };

  const startPixStatusPolling = () => {
    // Verificar status do PIX a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (data?.status === 'confirmado') {
          clearInterval(interval);
          setPaymentStep('success');
          toast({
            title: "PIX confirmado!",
            description: "Pagamento recebido com sucesso.",
          });
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar status do PIX:', error);
      }
    }, 5000);

    // Parar polling após 10 minutos
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStep === 'pix_waiting') {
        toast({
          title: "Tempo esgotado",
          description: "O pagamento PIX não foi confirmado. Tente novamente.",
          variant: "destructive",
        });
        setPaymentStep('method');
      }
    }, 10 * 60 * 1000);
  };

  const handlePayment = () => {
    if (paymentMethod === 'stripe_card' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os dados do cartão.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'pix' && (!pixData.cpf || !pixData.name)) {
      toast({
        title: "Dados incompletos", 
        description: "Preencha CPF e nome para o PIX.",
        variant: "destructive",
      });
      return;
    }

    setPaymentStep('processing');
    processPaymentMutation.mutate({ method: paymentMethod });
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

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-600 mb-2">Pagamento Aprovado!</h3>
          <p className="text-gray-600">Seu pedido foi confirmado e está sendo preparado.</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Processando Pagamento...</h3>
          <p className="text-gray-600">Aguarde enquanto processamos seu pagamento.</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'pix_waiting') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">PIX - Escaneie o QR Code</CardTitle>
          <p className="text-center text-2xl font-bold text-green-600">
            R$ {totalAmount.toFixed(2)}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <img 
              src={qrCode} 
              alt="QR Code PIX" 
              className="h-48 w-48 mx-auto mb-4 border-2 border-gray-200 rounded"
            />
            <p className="text-sm text-blue-600 mb-2">
              Escaneie com o app do seu banco
            </p>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Código PIX:</strong><br/>
              <code className="text-xs break-all">{pixCode}</code>
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Aguardando confirmação do pagamento...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

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
              <RadioGroupItem value="stripe_card" id="stripe_card" />
              <Label htmlFor="stripe_card" className="flex items-center cursor-pointer">
                <CreditCard className="h-5 w-5 mr-2" />
                Cartão de Crédito/Débito
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

        {paymentMethod === 'stripe_card' && (
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

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={processPaymentMutation.isPending}
            className="flex-1"
          >
            {processPaymentMutation.isPending ? 'Processando...' : 
             paymentMethod === 'money' ? 'Confirmar Pedido' : 'Pagar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};