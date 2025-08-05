import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, Truck, Calendar, Download, Play } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPayouts = () => {
  const [payoutPeriod, setPayoutPeriod] = useState('weekly');
  const queryClient = useQueryClient();

  // Buscar resumo de repasses
  const { data: payoutSummary } = useQuery({
    queryKey: ['admin-payout-summary'],
    queryFn: async () => {
      const [restaurantResult, deliveryResult] = await Promise.allSettled([
        supabase.from('restaurant_payouts').select('*'),
        supabase.from('delivery_earnings').select('*')
      ]);

      const restaurantPayouts = restaurantResult.status === 'fulfilled' ? restaurantResult.value.data || [] : [];
      const deliveryEarnings = deliveryResult.status === 'fulfilled' ? deliveryResult.value.data || [] : [];

      const pendingRestaurantPayouts = restaurantPayouts.filter(p => p.status === 'pendente');
      const pendingDeliveryPayouts = deliveryEarnings.filter(e => e.status_pagamento === 'pendente');

      const totalRestaurantPending = pendingRestaurantPayouts.reduce((sum, p) => sum + Number(p.valor_liquido), 0);
      const totalDeliveryPending = pendingDeliveryPayouts.reduce((sum, e) => sum + Number(e.valor_total), 0);

      return {
        totalRestaurantPending,
        totalDeliveryPending,
        pendingRestaurantCount: pendingRestaurantPayouts.length,
        pendingDeliveryCount: pendingDeliveryPayouts.length,
        restaurantPayouts,
        deliveryEarnings
      };
    }
  });

  // Buscar repasses de restaurantes
  const { data: restaurantPayouts } = useQuery({
    queryKey: ['admin-restaurant-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_payouts')
        .select(`
          *,
          restaurant_details!inner(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar ganhos de entregadores
  const { data: deliveryPayouts } = useQuery({
    queryKey: ['admin-delivery-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select(`
          *,
          delivery_details!inner(user_id),
          profiles!inner(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Processar repasses
  const processPayoutsMutation = useMutation({
    mutationFn: async (periodo: string) => {
      const { data, error } = await supabase.functions.invoke('process-payouts', {
        body: { periodo }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Repasses processados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-payout-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-payouts'] });
    },
    onError: (error) => {
      console.error('Erro ao processar repasses:', error);
      toast.error('Erro ao processar repasses');
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { variant: 'secondary', label: 'Pendente' },
      'processando': { variant: 'default', label: 'Processando' },
      'processado': { variant: 'default', label: 'Processado' },
      'pago': { variant: 'default', label: 'Pago' },
      'erro': { variant: 'destructive', label: 'Erro' }
    };

    const config = statusMap[status as keyof typeof statusMap] || { variant: 'secondary', label: status };
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Repasses</h1>
          <p className="text-gray-600">Gerencie os repasses para restaurantes e entregadores</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={payoutPeriod} onValueChange={setPayoutPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="bi-weekly">Quinzenal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => processPayoutsMutation.mutate(payoutPeriod)}
            disabled={processPayoutsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {processPayoutsMutation.isPending ? 'Processando...' : 'Processar Repasses'}
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes Pendentes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(payoutSummary?.totalRestaurantPending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {payoutSummary?.pendingRestaurantCount || 0} repasses pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadores Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(payoutSummary?.totalDeliveryPending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              {payoutSummary?.pendingDeliveryCount || 0} pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {((payoutSummary?.totalRestaurantPending || 0) + (payoutSummary?.totalDeliveryPending || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Repasse</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payoutPeriod === 'daily' ? 'Diário' : 
               payoutPeriod === 'weekly' ? 'Semanal' :
               payoutPeriod === 'bi-weekly' ? 'Quinzenal' : 'Mensal'}
            </div>
            <p className="text-xs text-muted-foreground">
              Frequência configurada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes tipos de repasse */}
      <Tabs defaultValue="restaurants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Restaurantes
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Entregadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants">
          <Card>
            <CardHeader>
              <CardTitle>Repasses de Restaurantes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Valor Líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurantPayouts?.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">
                        {payout.restaurant_details?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(payout.periodo_inicio).toLocaleDateString('pt-BR')} - {new Date(payout.periodo_fim).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>R$ {Number(payout.valor_bruto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {Number(payout.comissao_plataforma).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {Number(payout.valor_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>{new Date(payout.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos de Entregadores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entregador</TableHead>
                    <TableHead>Valor Base</TableHead>
                    <TableHead>Gorjetas</TableHead>
                    <TableHead>Bônus</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPayouts?.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell className="font-medium">
                        {earning.profiles?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>R$ {Number(earning.valor_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {Number(earning.gorjeta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {Number(earning.bonus || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {Number(earning.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{getStatusBadge(earning.status_pagamento)}</TableCell>
                      <TableCell>{new Date(earning.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};