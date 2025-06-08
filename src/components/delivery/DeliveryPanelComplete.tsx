
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Power, 
  Navigation, 
  Package, 
  DollarSign, 
  User, 
  HelpCircle,
  MapPin,
  Clock,
  Star,
  Phone,
  CheckCircle,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import DeliveryOrdersGlobal from './DeliveryOrdersGlobal';
import DeliveryWallet from './DeliveryWallet';
import DeliveryEarnings from './DeliveryEarnings';
import DeliveryProfile from './DeliveryProfile';
import DeliverySupport from './DeliverySupport';

const DeliveryPanelComplete = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [dailyStats, setDailyStats] = useState({
    earnings: 0,
    deliveries: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDeliveryDetails();
    }
  }, [user]);

  useEffect(() => {
    if (deliveryDetails) {
      loadDailyStats();
      checkCurrentOrder();
    }
  }, [deliveryDetails]);

  const loadDeliveryDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDeliveryDetails(data);
        setIsOnline(data.status_online || false);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do entregador:', error);
      toast.error('Erro ao carregar informações do perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Carregar ganhos do dia
      const { data: earningsData, error: earningsError } = await supabase
        .from('delivery_earnings')
        .select('valor_total')
        .eq('delivery_detail_id', deliveryDetails.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      if (earningsError) throw earningsError;

      const todayEarnings = earningsData?.reduce((sum, earning) => sum + earning.valor_total, 0) || 0;
      const todayDeliveries = earningsData?.length || 0;

      setDailyStats({
        earnings: todayEarnings,
        deliveries: todayDeliveries,
        rating: deliveryDetails.rating_medio || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas diárias:', error);
    }
  };

  const checkCurrentOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_details:restaurante_id (nome, endereco, telefone),
          order_items (*),
          profiles:cliente_id (nome, telefone)
        `)
        .eq('entregador_id', user.id)
        .in('status', ['aceito_entregador', 'preparando', 'pronto_retirada', 'saiu_entrega', 'caminho_restaurante', 'chegou_restaurante', 'pedido_retirado', 'caminho_cliente', 'chegou_cliente'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentOrder(data);
    } catch (error) {
      console.error('Erro ao verificar pedido atual:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      
      const { error } = await supabase
        .from('delivery_details')
        .update({ 
          status_online: newStatus,
          data_ultima_atividade: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Registrar histórico de status
      if (deliveryDetails?.id) {
        await supabase
          .from('delivery_status_history')
          .insert({
            delivery_detail_id: deliveryDetails.id,
            status_anterior: isOnline,
            status_novo: newStatus
          });
      }

      setIsOnline(newStatus);
      toast.success(newStatus ? 'Você está online!' : 'Você está offline');
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!deliveryDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Cadastro Necessário</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Você precisa completar seu cadastro como entregador para acessar o painel.
            </p>
            <Button onClick={() => setActiveTab('profile')} className="w-full">
              Completar Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Status Online */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Power className={`h-6 w-6 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
              {isOnline && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Olá, {deliveryDetails.nome || user.email?.split('@')[0] || 'Entregador'}!
              </h1>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Online - Disponível para entregas' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Stats do Dia */}
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">
                R$ {dailyStats.earnings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {dailyStats.deliveries} entregas hoje
              </p>
            </div>
            
            {/* Toggle Online/Offline */}
            <Switch
              checked={isOnline}
              onCheckedChange={toggleOnlineStatus}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* Alerta de Pedido Ativo */}
      {currentOrder && (
        <div className="bg-orange-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">
                Entrega Ativa - Pedido #{currentOrder.id.slice(-8)}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('orders')}
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-transparent">
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <Package className="h-4 w-4" />
              <span className="text-xs">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Carteira</span>
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Ganhos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Perfil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs">Ajuda</span>
            </TabsTrigger>
          </TabsList>

          <div className="px-4 py-6">
            <TabsContent value="orders" className="mt-0">
              <DeliveryOrdersGlobal 
                deliveryDetails={deliveryDetails}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
              />
            </TabsContent>

            <TabsContent value="wallet" className="mt-0">
              <DeliveryWallet deliveryDetails={deliveryDetails} />
            </TabsContent>

            <TabsContent value="earnings" className="mt-0">
              <DeliveryEarnings deliveryDetails={deliveryDetails} />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <DeliveryProfile 
                deliveryDetails={deliveryDetails}
                setDeliveryDetails={setDeliveryDetails}
              />
            </TabsContent>

            <TabsContent value="support" className="mt-0">
              <DeliverySupport deliveryDetails={deliveryDetails} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DeliveryPanelComplete;
