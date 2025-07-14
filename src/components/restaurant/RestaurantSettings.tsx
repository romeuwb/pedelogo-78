
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Route, Users, MapPin, Clock, Utensils, UserCheck, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryAreaMap } from './DeliveryAreaMap';
import { RouteOptimization } from './RouteOptimization';
import { ClientOptimization } from './ClientOptimization';
import { OperatingHoursManager } from './OperatingHoursManager';
import TableManager from './TableManager';
import { StaffManager } from './StaffManager';
import { PrinterConfiguration } from './PrinterConfiguration';
import RestaurantGeneralSettings from './RestaurantGeneralSettings';

interface RestaurantSettingsProps {
  restaurantId: string;
}

export const RestaurantSettings = ({ restaurantId }: RestaurantSettingsProps) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'delivery', label: 'Área de Entrega', icon: MapPin },
    { id: 'routes', label: 'Rotas', icon: Route },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'hours', label: 'Horários', icon: Clock },
    { id: 'staff', label: 'Funcionários', icon: UserCheck },
    { id: 'printers', label: 'Impressoras', icon: Printer }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações do Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop Tabs */}
            <div className="hidden lg:block">
              <TabsList className="grid w-full grid-cols-7">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Mobile/Tablet Navigation */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousTab}
                  disabled={currentTabIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = tabs[currentTabIndex].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  <span className="font-medium">{tabs[currentTabIndex].label}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextTab}
                  disabled={currentTabIndex === tabs.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Tab Indicators */}
              <div className="flex justify-center gap-2 mb-4">
                {tabs.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentTabIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <TabsContent value="general" className="mt-6">
              <RestaurantGeneralSettings />
            </TabsContent>

            <TabsContent value="delivery" className="mt-6">
              <DeliveryAreaMap restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="routes" className="mt-6">
              <RouteOptimization restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <ClientOptimization restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="hours" className="mt-6">
              <OperatingHoursManager restaurantId={restaurantId} />
            </TabsContent>


            <TabsContent value="staff" className="mt-6">
              <StaffManager restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="printers" className="mt-6">
              <PrinterConfiguration restaurantId={restaurantId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
