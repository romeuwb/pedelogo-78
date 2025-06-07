
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Route, Users, MapPin, Clock } from 'lucide-react';
import { DeliveryAreaMap } from './DeliveryAreaMap';
import { RouteOptimization } from './RouteOptimization';
import { ClientOptimization } from './ClientOptimization';
import { OperatingHoursManager } from './OperatingHoursManager';

interface RestaurantSettingsProps {
  restaurantId: string;
}

export const RestaurantSettings = ({ restaurantId }: RestaurantSettingsProps) => {
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
          <Tabs defaultValue="delivery" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Área de Entrega
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Otimização de Rotas
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Otimização de Clientes
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário de Funcionamento
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações Gerais
              </TabsTrigger>
            </TabsList>

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

            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Configurações gerais do restaurante serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
