
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation, Package, DollarSign, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MobileDeliveryApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Redirecionar direto para login se não autenticado
    if (!user) {
      window.location.href = '/auth';
    }
    
    // Verificar se Capacitor está disponível
    if (typeof window !== 'undefined' && 'Capacitor' in window) {
      console.log('App de entregador rodando em dispositivo móvel');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">PedeLogo Entregador</h2>
            <p className="text-gray-600 mb-4">Redirecionando para login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-orange-500">🍕 PedeLogo Entregador</h1>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{location || 'Localização não definida'}</span>
            </div>
            
            <Button
              size="sm"
              onClick={() => setIsOnline(!isOnline)}
              variant={isOnline ? "destructive" : "default"}
            >
              {isOnline ? 'Ficar Offline' : 'Ficar Online'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20 overflow-auto">
          <TabsContent value="home" className="m-0 p-4">
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Status do Dia</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Entregas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">R$ 0</div>
                      <div className="text-sm text-gray-600">Ganhos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pedidos Disponíveis */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Pedidos Disponíveis</h2>
                {!isOnline ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Fique online para receber pedidos</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aguardando pedidos...</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Minhas Entregas</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma entrega realizada ainda</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="earnings" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Ganhos</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Hoje</span>
                      <span className="font-semibold">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esta semana</span>
                      <span className="font-semibold">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Este mês</span>
                      <span className="font-semibold">R$ 0,00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Perfil</h2>
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Entregador</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <TabsList className="w-full h-16 bg-white rounded-none grid grid-cols-4">
            <TabsTrigger 
              value="home" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Navigation size={20} />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Package size={20} />
              <span className="text-xs">Entregas</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="earnings" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <DollarSign size={20} />
              <span className="text-xs">Ganhos</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="profile" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <User size={20} />
              <span className="text-xs">Perfil</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileDeliveryApp;
