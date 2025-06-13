
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, Heart, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientHome from './ClientHome';
import ClientOrders from './ClientOrders';
import ClientFavorites from './ClientFavorites';
import ClientProfile from './ClientProfile';
import ClientSearch from './ClientSearch';

const ClientApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  const goToPreviousTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Main Content */}
        <div className="pb-20 md:pb-6 md:ml-64">
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

        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:fixed md:top-0 md:left-0 md:h-full md:w-64 md:bg-white md:border-r md:border-gray-200 md:shadow-lg md:flex md:flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">WB Delivery</h1>
          </div>
          
          <TabsList className="flex-col h-auto bg-transparent p-0 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="w-full justify-start gap-3 py-3 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-r-2 data-[state=active]:border-blue-600"
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          {/* Mobile Tab Navigation */}
          <div className="flex items-center justify-between p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousTab}
              disabled={currentTabIndex === 0}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = tabs[currentTabIndex].icon;
                return <Icon className="h-5 w-5 text-blue-600" />;
              })()}
              <span className="font-medium text-sm">{tabs[currentTabIndex].label}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextTab}
              disabled={currentTabIndex === tabs.length - 1}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Indicators */}
          <div className="flex justify-center gap-2 pb-2">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentTabIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Traditional Bottom Tabs for larger mobile screens */}
          <TabsList className="sm:flex w-full h-16 bg-white rounded-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                >
                  <Icon size={20} />
                  <span className="text-xs hidden sm:block">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default ClientApp;
