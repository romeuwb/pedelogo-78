import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingCart, Users, Package, DollarSign, CreditCard, Import } from 'lucide-react';
import { toast } from 'sonner';
import PendingPaymentTables from './PendingPaymentTables';

interface POSSystemProps {
  restaurantId: string;
}

// Defina aqui o UUID do cliente padrão "Cliente Balcão" (substitua pelo valor real do seu banco)
const CLIENTE_BALCAO_ID = 'UUID_CLIENTE_BALCAO';

export const POSSystem = ({ restaurantId }: POSSystemProps) => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'mesa' | 'avulso' | 'delivery'>('avulso');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const queryClient = useQueryClient();

  // Buscar mesas do restaurante
  const { data: tables } = useQuery({
    queryKey: ['restaurant-tables', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('numero_mesa', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar mesas aguardando pagamento
  const { data: pendingPaymentTables } = useQuery({
    queryKey: ['pending-payment-tables', restaurantId],
    queryFn: async () => {
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'aguardando_pagamento')
        .order('numero_mesa', { ascending: true });
      if (tablesError) throw tablesError;
      const tablesWithOrders = await Promise.all(
        (tablesData || []).map(async (table) => {
          const { data: orderData, error: orderError } = await (supabase as any)
            .from('table_orders')
            .select('*, table_order_items(*)')
            .eq('table_id', table.id)
            .eq('status', 'fechado')
            .single();
          if (orderError && orderError.code !== 'PGRST116') {
            return { ...table, order: null, total_value: 0, items_count: 0 };
          }
          return {
            ...table,
            order: orderData,
            total_value: orderData?.total || 0,
            items_count: orderData?.table_order_items?.length || 0
          };
        })
      );
      return tablesWithOrders;
    },
  });

  // Buscar produtos do restaurante
  const { data: products } = useQuery({
    queryKey: ['restaurant-products-pos', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('disponivel', true)
        .order('nome');
      if (error) throw error;
      return data || [];
    },
  });

  // Abrir mesa
  const openTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status: 'ocupada' })
        .eq('id', tableId);
      if (error) throw error;
      return { tableId };
    },
    onSuccess: () => {
      toast.success('Mesa aberta com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao abrir mesa: ' + error.message);
    }
  });

  // Fechar mesa
  const closeTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status: 'livre' })
        .eq('id', tableId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesa fechada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao fechar mesa: ' + error.message);
    }
  });

  // Criar pedido POS (sempre define cliente_id)
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // Sempre define cliente_id: se não houver, usa o cliente padrão
      const clienteId = orderData.cliente_id || CLIENTE_BALCAO_ID;
      let enderecoEntrega: any = null;
      if (orderType === 'delivery') {
        enderecoEntrega = {
          tipo: 'delivery',
          endereco: deliveryAddress,
          cliente_nome: customerName,
          cliente_telefone: customerPhone
        };
      } else if (orderType === 'mesa') {
        enderecoEntrega = {
          tipo: 'mesa',
          mesa: selectedTable?.numero_mesa
        };
      } else {
        enderecoEntrega = {
          tipo: 'balcao',
          cliente_nome: customerName || 'Cliente Balcão'
        };
      }
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurante_id: restaurantId,
          cliente_id: clienteId,
          status: 'preparando',
          total: orderData.total,
          endereco_entrega: enderecoEntrega,
          observacoes: `Pedido POS - ${orderType === 'delivery' ? 'Delivery' : orderType === 'mesa' ? `Mesa ${selectedTable?.numero_mesa}` : 'Avulso'}`
        })
        .select()
        .single();
      if (orderError) throw orderError;
      // Inserir itens do pedido
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            orderItems.map(item => ({
              order_id: order.id,
              nome_item: item.nome,
              quantidade: item.quantidade,
              preco_unitario: item.preco,
              observacoes: `POS ${orderType}`
            }))
          );
        if (itemsError) throw itemsError;
      }
      return order;
    },
    onSuccess: (order) => {
      setCurrentOrder(order);
      toast.success('Pedido criado com sucesso!');
      setShowOrderModal(false);
      setShowPaymentModal(true);
    },
    onError: (error: any) => {
      toast.error('Erro ao criar pedido: ' + error.message);
    }
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setProcessingPayment(true);
      if (!currentOrder) {
        throw new Error('Nenhum pedido ativo para processar pagamento');
      }
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'pago',
          metodo_pagamento: paymentData.method,
          pago_em: new Date().toISOString()
        })
        .eq('id', currentOrder.id);
      if (orderError) throw orderError;
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, orderId: currentOrder.id, method: paymentData.method };
    },
    onSuccess: (result) => {
      toast.success(`Pagamento processado com sucesso! Método: ${result.method}`);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payment-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao processar pagamento: ' + error.message);
    },
    onSettled: () => {
      setProcessingPayment(false);
    }
  });

  // Função para resetar formulário
  const resetForm = () => {
    setShowPaymentModal(false);
    setShowOrderModal(false);
    setOrderItems([]);
    setCurrentOrder(null);
    setPaymentMethod('');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setSelectedTable(null);
  };

  const addItemToOrder = (product: any) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.id === product.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { ...product, quantidade: 1 }]);
    }
    toast.success(`${product.nome} adicionado ao pedido`);
  };

  const removeItemFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
    toast.success('Item removido do pedido');
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

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const startNewOrder = (type: 'avulso' | 'delivery') => {
    setOrderType(type);
    setSelectedTable(null);
    setOrderItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setShowOrderModal(true);
  };

  // ... (restante do componente: JSX do modal, tabs, etc. permanece igual)

  // O JSX do componente permanece igual ao anterior, apenas a lógica de cliente_id foi centralizada e corrigida.
};
