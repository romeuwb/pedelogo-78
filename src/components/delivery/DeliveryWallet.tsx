import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryWalletProps {
  deliveryDetails: any;
}

const DeliveryWallet = ({ deliveryDetails }: DeliveryWalletProps) => {
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState(null);

  useEffect(() => {
    if (deliveryDetails) {
      loadWalletData();
      loadBankDetails();
    }
  }, [deliveryDetails]);

  const loadWalletData = async () => {
    try {
      // Carregar ganhos
      const { data: earningsData, error: earningsError } = await supabase
        .from('delivery_earnings')
        .select(`
          *,
          orders!inner (
            id,
            created_at,
            restaurant_details:restaurante_id (nome)
          )
        `)
        .eq('delivery_detail_id', deliveryDetails.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Calcular saldo (ganhos pendentes de pagamento)
      const pendingEarnings = earningsData?.filter(e => e.status_pagamento === 'pendente') || [];
      const totalBalance = pendingEarnings.reduce((sum, earning) => sum + earning.valor_total, 0);
      setBalance(totalBalance);

      // Carregar solicitações de saque
      const { data: requestsData, error: requestsError } = await supabase
        .from('delivery_withdrawal_requests')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setPaymentRequests(requestsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
      toast.error('Erro ao carregar dados da carteira');
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_bank_details')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBankDetails(data);
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Informe um valor válido para saque');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast.error('Valor solicitado maior que o saldo disponível');
      return;
    }

    if (!bankDetails) {
      toast.error('Configure seus dados bancários antes de solicitar saque');
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_withdrawal_requests')
        .insert({
          delivery_detail_id: deliveryDetails.id,
          valor_solicitado: parseFloat(withdrawAmount),
          status: 'pendente',
          observacoes: withdrawNotes || null,
          dados_bancarios: bankDetails
        });

      if (error) throw error;

      toast.success('Solicitação de saque enviada com sucesso!');
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setWithdrawNotes('');
      loadWalletData();
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      toast.error('Erro ao solicitar saque');
    }
  };

  const getEarningsStats = () => {
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const todayEarnings = earnings.filter(e => 
      new Date(e.created_at).toDateString() === today
    ).reduce((sum, e) => sum + e.valor_total, 0);

    const weekEarnings = earnings.filter(e => 
      new Date(e.created_at) >= thisWeek
    ).reduce((sum, e) => sum + e.valor_total, 0);

    const monthEarnings = earnings.filter(e => 
      new Date(e.created_at) >= thisMonth
    ).reduce((sum, e) => sum + e.valor_total, 0);

    return { todayEarnings, weekEarnings, monthEarnings };
  };

  const stats = getEarningsStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Saldo Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-xl font-bold text-blue-600">
                  R$ {stats.todayEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-xl font-bold text-purple-600">
                  R$ {stats.weekEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-xl font-bold text-orange-600">
                  R$ {stats.monthEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ação de Saque */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Solicitar Saque</h3>
              <p className="text-gray-600">Saldo disponível: R$ {balance.toFixed(2)}</p>
            </div>
            <Button 
              onClick={() => setShowWithdrawForm(true)}
              disabled={balance <= 0 || !bankDetails}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Solicitar Saque
            </Button>
          </div>
          
          {!bankDetails && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Configure seus dados bancários no perfil para poder solicitar saques.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Saque */}
      {showWithdrawForm && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Saque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor do Saque</label>
              <Input
                type="number"
                placeholder="0,00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                step="0.01"
                min="0"
                max={balance}
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor máximo: R$ {balance.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
              <Textarea
                placeholder="Adicione observações sobre a solicitação..."
                value={withdrawNotes}
                onChange={(e) => setWithdrawNotes(e.target.value)}
                rows={3}
              />
            </div>

            {bankDetails && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Dados Bancários:</p>
                <p className="text-sm text-blue-600">
                  {bankDetails.banco} - Ag: {bankDetails.agencia} - Conta: {bankDetails.conta}
                </p>
                <p className="text-sm text-blue-600">
                  {bankDetails.titular_conta}
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={handleWithdrawRequest}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmar Solicitação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowWithdrawForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Histórico */}
      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earnings">Histórico de Ganhos</TabsTrigger>
          <TabsTrigger value="withdrawals">Solicitações de Saque</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
                <span>Ganhos Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum ganho registrado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.slice(0, 10).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {earning.orders?.restaurant_details?.nome || 'Restaurante'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(earning.created_at).toLocaleDateString()} às{' '}
                          {new Date(earning.created_at).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          {earning.distancia_km && (
                            <span>{earning.distancia_km.toFixed(1)} km</span>
                          )}
                          {earning.tempo_entrega_minutos && (
                            <span>{earning.tempo_entrega_minutos} min</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          R$ {earning.valor_total.toFixed(2)}
                        </div>
                        <Badge 
                          variant={earning.status_pagamento === 'pendente' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {earning.status_pagamento === 'pendente' ? 'Pendente' : 'Pago'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowDownLeft className="h-5 w-5 text-blue-600" />
                <span>Solicitações de Saque</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma solicitação de saque ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Solicitação #{request.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.periodo_referencia}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          R$ {request.valor_solicitado.toFixed(2)}
                        </div>
                        <Badge 
                          variant={
                            request.status === 'aprovado' ? 'default' :
                            request.status === 'rejeitado' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {request.status === 'pendente' ? 'Pendente' :
                           request.status === 'aprovado' ? 'Aprovado' : 
                           request.status === 'rejeitado' ? 'Rejeitado' : request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryWallet;
