
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Route, Users, MapPin, Clock, Utensils, UserCheck, CreditCard, Bell, Database, Shield, Mail } from 'lucide-react';
import { DeliveryAreaMap } from './DeliveryAreaMap';
import { RouteOptimization } from './RouteOptimization';
import { ClientOptimization } from './ClientOptimization';
import { OperatingHoursManager } from './OperatingHoursManager';
import TableManager from './TableManager';
import { StaffManager } from './StaffManager';
import { TableConfiguration } from './TableConfiguration';

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
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
              <TabsTrigger value="delivery" className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span className="hidden sm:inline">Área de Entrega</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center gap-1 text-xs">
                <Route className="h-3 w-3" />
                <span className="hidden sm:inline">Rotas</span>
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span className="hidden sm:inline">Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Horários</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-1 text-xs">
                <Utensils className="h-3 w-3" />
                <span className="hidden sm:inline">Mesas</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-1 text-xs">
                <UserCheck className="h-3 w-3" />
                <span className="hidden sm:inline">Funcionários</span>
              </TabsTrigger>
              <TabsTrigger value="tableConfig" className="flex items-center gap-1 text-xs">
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline">Config. Mesa</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 text-xs">
                <CreditCard className="h-3 w-3" />
                <span className="hidden sm:inline">Pagamentos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
                <Bell className="h-3 w-3" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-1 text-xs">
                <Database className="h-3 w-3" />
                <span className="hidden sm:inline">Integrações</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-1 text-xs">
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline">Geral</span>
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

            <TabsContent value="tables" className="mt-6">
              <TableManager restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="staff" className="mt-6">
              <StaffManager restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="tableConfig" className="mt-6">
              <TableConfiguration restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Configurações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Métodos de Pagamento</h3>
                      <p className="text-sm text-gray-600 mb-4">Configure os métodos de pagamento aceitos</p>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Dinheiro</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Cartão de Crédito</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Cartão de Débito</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>PIX</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Integração de Pagamento</h3>
                      <p className="text-sm text-gray-600">Configure provedores de pagamento (Stripe, PayPal, etc.)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Configurações de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Notificações de Pedidos</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Novo pedido recebido</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Pedido cancelado</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Problema na entrega</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Notificações por Email</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Relatórios diários</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Alertas de estoque baixo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Integrações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Sistemas de Delivery</h3>
                      <p className="text-sm text-gray-600 mb-4">Conecte com iFood, Uber Eats, Rappi</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>iFood</span>
                          <button className="px-3 py-1 text-sm border rounded">Conectar</button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uber Eats</span>
                          <button className="px-3 py-1 text-sm border rounded">Conectar</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Sistemas de Pagamento</h3>
                      <p className="text-sm text-gray-600">Integração com gateways de pagamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Configurações de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Controle de Acesso</h3>
                      <p className="text-sm text-gray-600 mb-4">Gerencie permissões de funcionários</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Exigir login duplo fator</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span>Bloquear após tentativas incorretas</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Logs de Atividade</h3>
                      <p className="text-sm text-gray-600">Monitore atividades do sistema</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Informações do Restaurante</h3>
                      <p className="text-sm text-gray-600 mb-4">Dados básicos e contato</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nome do Restaurante</label>
                          <input type="text" className="w-full p-2 border rounded" placeholder="Nome do restaurante" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Telefone</label>
                          <input type="tel" className="w-full p-2 border rounded" placeholder="(11) 99999-9999" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Configurações de Sistema</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Modo escuro</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Notificações sonoras</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
