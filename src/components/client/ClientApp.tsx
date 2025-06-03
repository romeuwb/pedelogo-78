
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import ClientHome from './ClientHome';
import ClientOrders from './ClientOrders';
import ClientFavorites from './ClientFavorites';
import ClientProfile from './ClientProfile';
import ClientSearch from './ClientSearch';

const ClientApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth';
    }
  }, [user]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Main Content */}
        <div className="pb-20">
          <TabsContent value="home" className="m-0">
            <ClientHome />
          </TabsContent>
          
          <TabsContent value="search" className="m-0">
            <ClientSearch />
          </TabsContent>
          
          <TabsContent value="orders" className="m-0">
            <ClientOrders />
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0">
            <ClientFavorites />
          </TabsContent>
          
          <TabsContent value="profile" className="m-0">
            <ClientProfile />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <TabsList className="w-full h-16 bg-white rounded-none">
            <TabsTrigger 
              value="home" 
              className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Home size={20} />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="search" 
              className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Search size={20} />
              <span className="text-xs">Buscar</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="orders" 
              className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <ShoppingBag size={20} />
              <span className="text-xs">Pedidos</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="favorites" 
              className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Heart size={20} />
              <span className="text-xs">Favoritos</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="profile" 
              className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
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

export default ClientApp;
