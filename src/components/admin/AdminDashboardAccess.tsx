
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Truck, User, Shield } from 'lucide-react';

interface AdminDashboardAccessProps {
  onAccessDashboard: (type: 'restaurant' | 'delivery' | 'client') => void;
}

export const AdminDashboardAccess = ({ onAccessDashboard }: AdminDashboardAccessProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Acessar Dashboards</h2>
        <p className="text-gray-600">
          Como administrador, você pode acessar qualquer tipo de dashboard para visualização e manutenção.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <CardTitle>Dashboard Restaurante</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Gerencie produtos, pedidos, funcionários e configurações do restaurante.
            </p>
            <Button 
              onClick={() => onAccessDashboard('restaurant')}
              className="w-full"
            >
              Acessar Restaurante
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Dashboard Entregador</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Visualize pedidos disponíveis, ganhos e histórico de entregas.
            </p>
            <Button 
              onClick={() => onAccessDashboard('delivery')}
              className="w-full"
            >
              Acessar Entregador
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <CardTitle>Dashboard Cliente</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Explore a experiência do cliente, pedidos e favoritos.
            </p>
            <Button 
              onClick={() => onAccessDashboard('client')}
              className="w-full"
            >
              Acessar Cliente
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Shield className="h-5 w-5" />
            Informação Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            O acesso aos dashboards permite visualizar e interagir com as funcionalidades de cada tipo de usuário.
            Todas as ações realizadas serão registradas nos logs de auditoria.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
