
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Package, Settings, MapPin, MessageSquare, Calculator, ClipboardList, User } from 'lucide-react';
import { RestaurantMenuPanel } from './RestaurantMenuPanel';
import { DeliveryRouteOptimizer } from './DeliveryRouteOptimizer';
import { RestaurantSettings } from './RestaurantSettings';
import { CustomerCommunication } from './CustomerCommunication';
import TableManagementPage from './TableManagementPage';
import { POSSystem } from './POSSystem';
import RestaurantProfile from './RestaurantProfile';

interface RestaurantDashboardProps {
  restaurantId: string;
}

const RestaurantDashboard = ({ restaurantId }: RestaurantDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Painel do Restaurante</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gerencie seu restaurante de forma completa</p>
        </div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Desktop Tabs */}
        <TabsList className="hidden lg:grid w-full grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs xl:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden xl:inline">Visão Geral</span>
            <span className="xl:hidden">Visão</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2 text-xs xl:text-sm">
            <Package className="h-4 w-4" />
            <span>Cardápio</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2 text-xs xl:text-sm">
            <Users className="h-4 w-4" />
            <span>Mesas</span>
          </TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2 text-xs xl:text-sm">
            <Calculator className="h-4 w-4" />
            <span>POS</span>
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2 text-xs xl:text-sm">
            <MapPin className="h-4 w-4" />
            <span>Rotas</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2 text-xs xl:text-sm">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden xl:inline">Comunicação</span>
            <span className="xl:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 text-xs xl:text-sm">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-xs xl:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden xl:inline">Configurações</span>
            <span className="xl:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile/Tablet Scrollable Tabs */}
        <div className="lg:hidden overflow-x-auto">
          <TabsList className="inline-flex h-auto min-w-full w-max">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <Package className="h-4 w-4" />
              <span>Cardápio</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <Users className="h-4 w-4" />
              <span>Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <Calculator className="h-4 w-4" />
              <span>POS</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <MapPin className="h-4 w-4" />
              <span>Rotas</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <MessageSquare className="h-4 w-4" />
              <span>Comunicação</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs whitespace-nowrap">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% em relação a ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 1.234,56</div>
                <p className="text-xs text-muted-foreground">+8% em relação a ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/12</div>
                <p className="text-xs text-muted-foreground">67% de ocupação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens no Cardápio</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">3 novos esta semana</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de vendas será exibido aqui
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <RestaurantMenuPanel restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Mesas</h2>
              <Button 
                onClick={() => window.open('/restaurante/mesas', '_blank')}
                variant="outline"
              >
                Abrir em Nova Aba
              </Button>
            </div>
            <TableManagementPage restaurantId={restaurantId} />
          </div>
        </TabsContent>

        <TabsContent value="pos" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sistema PDV</h2>
              <Button 
                onClick={() => window.open('/restaurante/pdv', '_blank')}
                variant="outline"
              >
                Abrir em Nova Aba
              </Button>
            </div>
            <POSSystem restaurantId={restaurantId} />
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <DeliveryRouteOptimizer restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CustomerCommunication restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <RestaurantProfile />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <RestaurantSettings restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
