
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Banknote,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface RestaurantFinancialPanelProps {
  restaurantId: string;
}

export const RestaurantFinancialPanel = ({ restaurantId }: RestaurantFinancialPanelProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['restaurant-financial', restaurantId, selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Buscar pedidos do período
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, taxa_entrega, created_at')
        .eq('restaurante_id', restaurantId)
        .eq('status', 'entregue')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Calcular métricas
      const totalOrders = orders?.length || 0;
      const grossRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const deliveryFees = orders?.reduce((sum, order) => sum + (order.taxa_entrega || 0), 0) || 0;
      
      // Assumindo comissão de 15% sobre o valor do pedido
      const platformCommission = grossRevenue * 0.15;
      const netRevenue = grossRevenue - platformCommission;

      return {
        totalOrders,
        grossRevenue,
        deliveryFees,
        platformCommission,
        netRevenue,
        orders: orders || []
      };
    }
  });

  const { data: payouts } = useQuery({
    queryKey: ['restaurant-payouts', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_payouts')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-500',
      'processando': 'bg-blue-500',
      'pago': 'bg-green-500',
      'erro': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const handleWithdrawRequest = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Digite um valor válido para retirada');
        return;
      }

      if (amount > (financialData?.netRevenue || 0)) {
        toast.error('Valor solicitado maior que o saldo disponível');
        return;
      }

      const { error } = await supabase
        .from('restaurant_withdrawal_requests')
        .insert({
          restaurant_id: restaurantId,
          valor_solicitado: amount,
          status: 'pendente'
        });

      if (error) throw error;

      toast.success('Solicitação de retirada enviada com sucesso!');
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Erro ao solicitar retirada:', error);
      toast.error('Erro ao solicitar retirada');
    }
  };

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'year', label: 'Este Ano' }
  ];

  if (isLoading) {
    return <div className="p-6">Carregando dados financeiros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financeiro</h2>
        <div className="flex gap-2 items-center">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Solicitar Retirada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Retirada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Valor para retirada</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Saldo disponível: R$ {financialData?.netRevenue?.toFixed(2) || '0,00'}
                  </p>
                </div>
                <Button onClick={handleWithdrawRequest} className="w-full">
                  Confirmar Solicitação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento Bruto</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {financialData?.grossRevenue?.toFixed(2) || '0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comissão Plataforma</p>
                <p className="text-2xl font-bold text-red-600">
                  - R$ {financialData?.platformCommission?.toFixed(2) || '0,00'}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {financialData?.netRevenue?.toFixed(2) || '0,00'}
                </p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">
                  {financialData?.totalOrders || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="payouts">Repasses</TabsTrigger>
          <TabsTrigger value="orders">Detalhamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Número de pedidos:</span>
                  <span className="font-semibold">{financialData?.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ticket médio:</span>
                  <span className="font-semibold">
                    R$ {financialData?.totalOrders ? 
                      (financialData.grossRevenue / financialData.totalOrders).toFixed(2) : 
                      '0,00'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxa de entrega total:</span>
                  <span className="font-semibold">
                    R$ {financialData?.deliveryFees?.toFixed(2) || '0,00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Comissão da plataforma (15%):</span>
                  <span className="font-semibold text-red-600">
                    - R$ {financialData?.platformCommission?.toFixed(2) || '0,00'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Valor a receber:</span>
                  <span className="font-bold text-green-600">
                    R$ {financialData?.netRevenue?.toFixed(2) || '0,00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Repasses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts?.map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">
                        {new Date(payout.periodo_inicio).toLocaleDateString()} - {new Date(payout.periodo_fim).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Líquido: R$ {payout.valor_liquido.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(payout.status)} text-white mb-2`}>
                        {payout.status}
                      </Badge>
                      {payout.data_processamento && (
                        <p className="text-sm text-gray-600">
                          {new Date(payout.data_processamento).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {financialData?.orders?.map((order: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                      {order.taxa_entrega > 0 && (
                        <p className="text-xs text-gray-500">
                          + R$ {order.taxa_entrega.toFixed(2)} entrega
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
