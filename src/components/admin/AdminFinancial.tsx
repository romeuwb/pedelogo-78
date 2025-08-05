
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Settings } from 'lucide-react';
import { AdminPaymentSettings } from './AdminPaymentSettings';

export const AdminFinancial = () => {
  const { data: financialData } = useQuery({
    queryKey: ['adminFinancial'],
    queryFn: async () => {
      const [ordersResult, revenueResult] = await Promise.allSettled([
        supabase.from('orders').select('total, taxa_entrega, status, created_at'),
        supabase.from('financial_transactions').select('*')
      ]);

      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
      const transactions = revenueResult.status === 'fulfilled' ? revenueResult.value.data || [] : [];

      const completedOrders = orders.filter(o => o.status === 'entregue');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalDeliveryFees = completedOrders.reduce((sum, order) => sum + Number(order.taxa_entrega || 0), 0);

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const thisMonthOrders = completedOrders.filter(o => new Date(o.created_at) >= startOfMonth);
      const lastMonthOrders = completedOrders.filter(o => {
        const date = new Date(o.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);

      return {
        totalRevenue,
        totalDeliveryFees,
        thisMonthRevenue,
        lastMonthRevenue,
        totalOrders: completedOrders.length,
        thisMonthOrders: thisMonthOrders.length,
        transactions
      };
    }
  });

  const revenueGrowth = financialData?.lastMonthRevenue ? 
    ((financialData.thisMonthRevenue - financialData.lastMonthRevenue) / financialData.lastMonthRevenue * 100) : 0;

  const cards = [
    {
      title: 'Faturamento Total',
      value: `R$ ${(financialData?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Faturamento deste Mês',
      value: `R$ ${(financialData?.thisMonthRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Taxa de Entrega',
      value: `R$ ${(financialData?.totalDeliveryFees || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Crescimento Mensal',
      value: `${revenueGrowth.toFixed(1)}%`,
      icon: revenueGrowth >= 0 ? TrendingUp : TrendingDown,
      color: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: revenueGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
        <p className="text-gray-600">Acompanhe receitas, transações e relatórios financeiros</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="payment-settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações de Pagamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Transações recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData?.transactions?.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        R$ {Number(transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.data_transacao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Concluída</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-settings">
          <AdminPaymentSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
