
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
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import DeliveryDashboard from './DeliveryDashboard';
import DeliveryOrders from './DeliveryOrders';
import DeliveryEarnings from './DeliveryEarnings';
import DeliveryProfile from './DeliveryProfile';
import DeliverySupport from './DeliverySupport';

const DeliveryApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDeliveryDetails();
      loadDailyStats();
    }
  }, [user]);

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
      if (!deliveryDetails?.id) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('calculate_delivery_earnings', {
          delivery_detail_id: deliveryDetails.id,
          start_date: today,
          end_date: today
        });

      if (error) throw error;

      if (data) {
        setDailyEarnings(data.total_ganhos || 0);
        setDeliveryCount(data.total_entregas || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas diárias:', error);
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
      await supabase
        .from('delivery_status_history')
        .insert({
          delivery_detail_id: deliveryDetails.id,
          status_anterior: isOnline,
          status_novo: newStatus
        });

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
      <div className="bg-white border-b border-gray-200 px-4 py-3">
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
                {deliveryDetails.nome || 'Entregador'}
              </h1>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Online - Disponível' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Ganhos do Dia */}
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">
                R$ {dailyEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {deliveryCount} entregas hoje
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
              <span className="font-medium">Entrega Ativa</span>
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
              value="dashboard" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <Power className="h-4 w-4" />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center space-y-1 py-3"
            >
              <Package className="h-4 w-4" />
              <span className="text-xs">Entregas</span>
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
            <TabsContent value="dashboard" className="mt-0">
              <DeliveryDashboard 
                deliveryDetails={deliveryDetails}
                isOnline={isOnline}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <DeliveryOrders 
                deliveryDetails={deliveryDetails}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
              />
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

export default DeliveryApp;
