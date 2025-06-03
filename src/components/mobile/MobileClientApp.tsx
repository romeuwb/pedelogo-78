
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, ShoppingBag, Heart, User, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const MobileClientApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Verificar se Capacitor está disponível e solicitar localização
    if (typeof window !== 'undefined' && 'Capacitor' in window) {
      // Aqui pode ser implementada a funcionalidade de geolocalização
      console.log('App rodando em dispositivo móvel');
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">PedeLogo</h2>
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
          <h1 className="text-xl font-bold text-orange-500">🍕 PedeLogo</h1>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{location || 'Definir localização'}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20 overflow-auto">
          <TabsContent value="home" className="m-0 p-4">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar restaurantes ou pratos..."
                  className="pl-10 h-12"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['Todos', 'Pizza', 'Hambúrguer', 'Japonês', 'Brasileira'].map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Restaurants */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Restaurantes próximos</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>Carregando restaurantes...</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Buscar</h2>
              <Input placeholder="Digite o que você procura..." />
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Meus Pedidos</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Você ainda não fez nenhum pedido</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Favoritos</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum favorito ainda</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Perfil</h2>
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Cliente</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <TabsList className="w-full h-16 bg-white rounded-none grid grid-cols-5">
            <TabsTrigger 
              value="home" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Home size={20} />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="search" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Search size={20} />
              <span className="text-xs">Buscar</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="orders" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <ShoppingBag size={20} />
              <span className="text-xs">Pedidos</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="favorites" 
              className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
            >
              <Heart size={20} />
              <span className="text-xs">Favoritos</span>
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

export default MobileClientApp;
