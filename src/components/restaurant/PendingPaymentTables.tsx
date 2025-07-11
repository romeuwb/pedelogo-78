import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, DollarSign, CreditCard, Import, X, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TableWithOrder {
  id: string;
  numero_mesa: number;
  capacidade: number;
  status: string;
  order: {
    id: string;
    total: number;
    created_at: string;
    closed_at: string;
    items_count: number;
    items: Array<{
      id: string;
      nome_item: string;
      quantidade: number;
      preco_unitario: number;
      subtotal: number;
    }>;
  };
}

interface PendingPaymentTablesProps {
  restaurantId: string;
}

const PendingPaymentTables = ({ restaurantId }: PendingPaymentTablesProps) => {
  const { user } = useAuth();
  const [pendingTables, setPendingTables] = useState<TableWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableWithOrder | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPendingTables();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadPendingTables, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const loadPendingTables = async () => {
    try {
      setLoading(true);
      
      // Buscar mesas com status aguardando_pagamento
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'aguardando_pagamento')
        .eq('ativo', true);

      if (tablesError) throw tablesError;

      if (!tablesData || tablesData.length === 0) {
        setPendingTables([]);
        return;
      }

      // Para cada mesa, buscar o pedido fechado
      const tablesWithOrders: TableWithOrder[] = [];
      
      for (const table of tablesData) {
        const { data: orderData, error: orderError } = await (supabase as any)
          .from('table_orders')
          .select('*')
          .eq('table_id', table.id)
          .eq('status', 'fechado')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (orderError) {
          console.error('Erro ao carregar pedido da mesa:', table.numero_mesa, orderError);
          continue;
        }

        if (orderData) {
          // Buscar itens do pedido
          const { data: itemsData, error: itemsError } = await (supabase as any)
            .from('table_order_items')
            .select('*')
            .eq('table_order_id', orderData.id);

          if (itemsError) {
            console.error('Erro ao carregar itens do pedido:', itemsError);
            continue;
          }

          tablesWithOrders.push({
            ...table,
            order: {
              id: orderData.id,
              total: orderData.total || 0,
              created_at: orderData.created_at,
              closed_at: orderData.closed_at,
              items_count: itemsData?.length || 0,
              items: itemsData || []
            }
          });
        }
      }

      setPendingTables(tablesWithOrders);
    } catch (error) {
      console.error('Erro ao carregar mesas aguardando pagamento:', error);
      toast.error('Erro ao carregar mesas aguardando pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTable = (table: TableWithOrder) => {
    setSelectedTable(table);
    setShowPaymentDialog(true);
  };

  const processPayment = async (paymentMethod: string) => {
    if (!selectedTable) return;

    setProcessingPayment(true);
    try {
      // Atualizar status do pedido para "pago"
      const { error: orderError } = await (supabase as any)
        .from('table_orders')
        .update({
          status: 'pago',
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod
        })
        .eq('id', selectedTable.order.id);

      if (orderError) throw orderError;

      // Atualizar status da mesa para "disponível"
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'disponivel' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      toast.success(`Pagamento processado! Mesa ${selectedTable.numero_mesa} liberada.`);
      setShowPaymentDialog(false);
      setSelectedTable(null);
      loadPendingTables();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Carregando mesas aguardando pagamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Import className="h-6 w-6 mr-2" />
            Mesas Aguardando Pagamento
          </h2>
          <p className="text-gray-600">
            Importe mesas para processar o pagamento ({pendingTables.length} mesa{pendingTables.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Button onClick={loadPendingTables} variant="outline">
          <Import className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {pendingTables.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mesa aguardando pagamento</h3>
          <p className="text-gray-600">Todas as mesas estão livres ou com pedidos em aberto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingTables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow border-2 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      Mesa {table.numero_mesa}
                      <Badge className="ml-2 bg-orange-500 text-white">
                        Aguardando Pagamento
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{table.capacidade} lugares</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(table.order.total)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    <span>{table.order.items_count} itens</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTime(table.order.closed_at)}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Itens do Pedido:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {table.order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantidade}x {item.nome_item}</span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleImportTable(table)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Processar Pagamento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Processar Pagamento - Mesa {selectedTable?.numero_mesa}
            </DialogTitle>
            <DialogDescription>
              Total: {selectedTable && formatCurrency(selectedTable.order.total)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => processPayment('dinheiro')}
                disabled={processingPayment}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <DollarSign className="h-6 w-6 mb-1" />
                Dinheiro
              </Button>
              
              <Button
                onClick={() => processPayment('cartao')}
                disabled={processingPayment}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <CreditCard className="h-6 w-6 mb-1" />
                Cartão
              </Button>
              
              <Button
                onClick={() => processPayment('pix')}
                disabled={processingPayment}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <ShoppingCart className="h-6 w-6 mb-1" />
                PIX
              </Button>
              
              <Button
                onClick={() => processPayment('vale')}
                disabled={processingPayment}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <Badge className="h-6 w-6 mb-1" />
                Vale Refeição
              </Button>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
                disabled={processingPayment}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingPaymentTables;