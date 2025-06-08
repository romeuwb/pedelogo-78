
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Package, 
  Settings, 
  MapPin, 
  MessageSquare,
  Calculator,
  Utensils,
  ClipboardList
} from 'lucide-react';
import { RestaurantMenuPanel } from './RestaurantMenuPanel';
import { DeliveryRouteOptimizer } from './DeliveryRouteOptimizer';
import { RestaurantSettings } from './RestaurantSettings';
import { CustomerCommunication } from './CustomerCommunication';
import { TableManagementPage } from './TableManagementPage';
import { POSSystemPage } from './POSSystemPage';

interface RestaurantDashboardProps {
  restaurantId: string;
}

const RestaurantDashboard = ({ restaurantId }: RestaurantDashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel do Restaurante</h1>
        <p className="text-gray-600">Gerencie seu restaurante de forma completa</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cardápio
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mesas
          </TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            POS
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Rotas
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">+12% desde ontem</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 3.847</div>
                <p className="text-xs text-muted-foreground">+8% desde ontem</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18/24</div>
                <p className="text-xs text-muted-foreground">75% ocupação</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">12 categorias</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: '#001', cliente: 'João Silva', valor: 'R$ 45,90', status: 'Preparando' },
                    { id: '#002', cliente: 'Maria Santos', valor: 'R$ 32,50', status: 'Pronto' },
                    { id: '#003', cliente: 'Pedro Costa', valor: 'R$ 78,20', status: 'Entregue' },
                  ].map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{pedido.id} - {pedido.cliente}</p>
                        <p className="text-sm text-gray-500">{pedido.valor}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        pedido.status === 'Preparando' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'Pronto' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pedido.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nome: 'Pizza Margherita', vendas: 24, receita: 'R$ 456,00' },
                    { nome: 'Hambúrguer Artesanal', vendas: 18, receita: 'R$ 324,00' },
                    { nome: 'Lasanha Bolonhesa', vendas: 15, receita: 'R$ 285,00' },
                  ].map((produto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-gray-500">{produto.vendas} vendas</p>
                      </div>
                      <span className="font-semibold">{produto.receita}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu">
          <RestaurantMenuPanel restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="tables">
          <TableManagementPage restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="pos">
          <POSSystemPage restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="routes">
          <DeliveryRouteOptimizer restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="communication">
          <CustomerCommunication restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="settings">
          <RestaurantSettings restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboard;
