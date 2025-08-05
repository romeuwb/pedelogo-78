import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentData {
  orderId: string;
  paymentMethod: string;
  amount: number;
  cardData?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  pixData?: {
    cpf: string;
    name: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  pixCode?: string;
  qrCode?: string;
  mercadoPagoId?: string;
  status: 'pending' | 'approved' | 'failed';
  error?: string;
}

export const usePaymentProcessor = () => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentData): Promise<PaymentResult> => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentData
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      return data;
    },
    onMutate: () => {
      setPaymentStatus('processing');
    },
    onSuccess: (data) => {
      if (data.status === 'approved') {
        setPaymentStatus('success');
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pedido foi confirmado com sucesso.",
        });
      } else if (data.status === 'pending') {
        // Para PIX e cartão que requer confirmação
        setPaymentStatus('processing');
      }
    },
    onError: (error: Error) => {
      setPaymentStatus('error');
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Verificar status do pedido (para PIX)
  const checkOrderStatus = useCallback(async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, payment_confirmed_at')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return {
        status: data?.status,
        isConfirmed: data?.status === 'confirmado',
        confirmedAt: data?.payment_confirmed_at
      };
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      return null;
    }
  }, []);

  // Hook para polling do status do PIX
  const { data: orderStatus, refetch: refetchOrderStatus } = useQuery({
    queryKey: ['order-status'],
    queryFn: () => null, // Será chamado manualmente
    enabled: false,
    refetchInterval: false
  });

  // Iniciar polling para verificar status do PIX
  const startPixStatusPolling = useCallback((orderId: string, onSuccess: () => void) => {
    const interval = setInterval(async () => {
      const status = await checkOrderStatus(orderId);
      
      if (status?.isConfirmed) {
        clearInterval(interval);
        setPaymentStatus('success');
        toast({
          title: "PIX confirmado!",
          description: "Pagamento recebido com sucesso.",
        });
        onSuccess();
      }
    }, 5000);

    // Parar polling após 10 minutos
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('error');
        toast({
          title: "Tempo esgotado",
          description: "O pagamento PIX não foi confirmado. Tente novamente.",
          variant: "destructive",
        });
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [paymentStatus, checkOrderStatus, toast]);

  // Calcular valores financeiros do pedido
  const calculateOrderFinancials = useCallback(async (orderId: string) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, restaurant_products(*))
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const subtotal = order.order_items.reduce((sum: number, item: any) => {
        return sum + (item.quantidade * item.preco_unitario);
      }, 0);

      const deliveryFee = order.taxa_entrega || 0;
      const total = subtotal + deliveryFee;

      return {
        subtotal,
        deliveryFee,
        total,
        itemsCount: order.order_items.length
      };
    } catch (error) {
      console.error('Erro ao calcular valores do pedido:', error);
      return null;
    }
  }, []);

  // Reset do status de pagamento
  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus('idle');
  }, []);

  return {
    // Estados
    paymentStatus,
    isProcessing: processPaymentMutation.isPending || paymentStatus === 'processing',
    isSuccess: paymentStatus === 'success',
    isError: paymentStatus === 'error',

    // Funções
    processPayment: processPaymentMutation.mutate,
    checkOrderStatus,
    startPixStatusPolling,
    calculateOrderFinancials,
    resetPaymentStatus,

    // Dados
    paymentResult: processPaymentMutation.data,
    paymentError: processPaymentMutation.error
  };
};