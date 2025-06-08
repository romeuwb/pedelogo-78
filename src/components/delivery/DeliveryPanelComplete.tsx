
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Package,
  Truck,
  User,
  BarChart3,
  Settings,
  MessageSquare
} from 'lucide-react';
import DeliveryProfile from './DeliveryProfile';

const DeliveryPanelComplete = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - em produção, vir do banco de dados
  const deliveryStats = {
    todayEarnings: 125.50,
    todayDeliveries: 8,
    weeklyEarnings: 850.20,
    rating: 4.8,
    totalDeliveries: 342
  };

  const availableOrders = [
    {
      id: 1,
      restaurant: "Pizza Express",
      customer: "João Silva",
      address: "Rua das Flores, 123",
      distance: "2.5 km",
      payment: "R$ 45,80",
      fee: "R$ 8,50",
      estimatedTime: "25 min"
    },
    {
      id: 2,
      restaurant: "Burger House",
      customer: "Maria Santos",
      address: "Av. Central, 456",
      distance: "1.8 km",
      payment: "R$ 32,90",
      fee: "R$ 6,50",
      estimatedTime: "20 min"
    }
  ];

  const activeDeliveries = [
    {
      id: 101,
      restaurant: "Sushi Zen",
      customer: "Carlos Oliveira",
      address: "Rua do Porto, 789",
      status: "coletando",
      payment: "R$ 78,90",
      fee: "R$ 12,50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900">Painel do Entregador</h1>
            <p className="text-gray-600">Gerencie suas entregas e ganhos</p>
          </div>
          
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0 border-b">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <Package className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger 
              value="deliveries" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <Truck className="h-4 w-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Ganhos
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Suporte
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="p-6">
          <TabsContent value="dashboard" className="mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganhos Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {deliveryStats.todayEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {deliveryStats.todayDeliveries} entregas realizadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {deliveryStats.weeklyEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+15% em relação à semana passada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deliveryStats.rating}</div>
                  <p className="text-xs text-muted-foreground">
                    {deliveryStats.totalDeliveries} entregas totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Disponível para entregas</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Deliveries */}
            {activeDeliveries.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Entregas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery) => (
                      <div key={delivery.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{delivery.restaurant}</h4>
                            <p className="text-sm text-gray-600">Cliente: {delivery.customer}</p>
                          </div>
                          <Badge variant={delivery.status === 'coletando' ? 'default' : 'secondary'}>
                            {delivery.status === 'coletando' ? 'Coletando' : 'Entregando'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {delivery.address}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Taxa: <strong>{delivery.fee}</strong></span>
                          <Button size="sm">
                            {delivery.status === 'coletando' ? 'Confirmar Coleta' : 'Confirmar Entrega'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Disponíveis</CardTitle>
                <p className="text-sm text-gray-600">
                  {availableOrders.length} pedidos aguardando entregador
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{order.restaurant}</h4>
                          <p className="text-sm text-gray-600">Cliente: {order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Taxa</p>
                          <p className="font-semibold text-green-600">{order.fee}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.address}
                      </div>
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span>Distância: {order.distance}</span>
                        <span>Tempo estimado: {order.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Valor: {order.payment}</span>
                        <Button>Aceitar Pedido</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Entregas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Histórico de entregas será exibido aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Ganhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Relatório detalhado de ganhos será exibido aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <DeliveryProfile />
          </TabsContent>

          <TabsContent value="support" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Suporte ao Entregador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Sistema de suporte será exibido aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DeliveryPanelComplete;
