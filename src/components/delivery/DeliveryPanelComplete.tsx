
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Package, 
  DollarSign, 
  User, 
  Clock,
  TrendingUp,
  Settings,
  Wallet,
  BarChart3
} from 'lucide-react';
import DeliveryOrders from './DeliveryOrders';
import DeliveryProfile from './DeliveryProfile';
import DeliverySupport from './DeliverySupport';
import DeliveryEarnings from './DeliveryEarnings';
import DeliveryWallet from './DeliveryWallet';
import DeliveryTracking from './DeliveryTracking';
import { toast } from 'sonner';

const DeliveryPanelComplete = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.tipo === 'entregador') {
      loadDeliveryDetails();
    }
  }, [user, profile]);

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
      toast.error('Erro ao carregar dados do entregador');
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!deliveryDetails) return;

    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from('delivery_details')
        .update({ 
          status_online: newStatus,
          data_ultima_atividade: new Date().toISOString()
        })
        .eq('id', deliveryDetails.id);

      if (error) throw error;

      setIsOnline(newStatus);
      toast.success(newStatus ? 'Você está online' : 'Você está offline');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || profile?.tipo !== 'entregador') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">Apenas entregadores podem acessar este painel</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-orange-500">🚚 PedeLogo Entregador</h1>
                <Badge variant={isOnline ? "default" : "secondary"} className="text-sm">
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{location || 'Localização não definida'}</span>
                </div>
                
                <Button
                  size="sm"
                  onClick={toggleOnlineStatus}
                  variant={isOnline ? "destructive" : "default"}
                  className="min-w-[100px]"
                >
                  {isOnline ? 'Ficar Offline' : 'Ficar Online'}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package size={16} />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <DollarSign size={16} />
                <span className="hidden sm:inline">Ganhos</span>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet size={16} />
                <span className="hidden sm:inline">Carteira</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="hidden sm:inline">Rastreamento</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User size={16} />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <Settings size={16} />
                <span className="hidden sm:inline">Suporte</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Entregas Hoje</p>
                      <p className="text-2xl font-bold">{deliveryDetails?.total_entregas || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Ganhos Hoje</p>
                      <p className="text-2xl font-bold">R$ 0,00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-2xl font-bold">{deliveryDetails?.rating_medio?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pedidos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                {!isOnline ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Fique online para receber pedidos</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aguardando novos pedidos...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <DeliveryOrders deliveryDetails={deliveryDetails} />
          </TabsContent>

          <TabsContent value="earnings">
            <DeliveryEarnings deliveryDetails={deliveryDetails} />
          </TabsContent>

          <TabsContent value="wallet">
            <DeliveryWallet deliveryDetails={deliveryDetails} />
          </TabsContent>

          <TabsContent value="tracking">
            <DeliveryTracking orderId="" userType="delivery" />
          </TabsContent>

          <TabsContent value="profile">
            <DeliveryProfile deliveryDetails={deliveryDetails} setDeliveryDetails={setDeliveryDetails} />
          </TabsContent>

          <TabsContent value="support">
            <DeliverySupport deliveryDetails={deliveryDetails} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DeliveryPanelComplete;
