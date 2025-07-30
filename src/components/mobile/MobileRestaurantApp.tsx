import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, List, Package, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MobileRestaurantApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">PedeLogo Restaurante</h2>
            <p className="text-gray-600 mb-4">Faça login para continuar</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Ir para Login
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
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">🍕 PedeLogo Restaurante</h1>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Restaurante</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20 overflow-auto">
          <TabsContent value="home" className="m-0 p-4">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Resumo do Dia</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Pedidos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">R$ 0</div>
                      <div className="text-sm text-gray-600">Faturamento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Pedidos Recentes</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum pedido recente</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="menu" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Cardápio</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Gerencie seus pratos aqui</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="orders" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pedidos</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum pedido em andamento</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="profile" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Perfil</h2>
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Restaurante</p>
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
              <Home size={20} />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            <TabsTrigger 
              value="menu" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <List size={20} />
              <span className="text-xs">Cardápio</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Package size={20} />
              <span className="text-xs">Pedidos</span>
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

export default MobileRestaurantApp;
