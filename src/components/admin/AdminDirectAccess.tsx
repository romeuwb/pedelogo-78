
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Truck, User, Shield } from 'lucide-react';

interface AdminDirectAccessProps {
  onAccessDashboard: (type: 'restaurant' | 'delivery' | 'client') => void;
}

export const AdminDirectAccess = ({ onAccessDashboard }: AdminDirectAccessProps) => {
  const handleDirectAccess = (type: 'restaurant' | 'delivery' | 'client') => {
    // Abrir em nova aba para evitar redirecionamento
    const routes = {
      restaurant: '/restaurante/dashboard',
      delivery: '/entregador/dashboard',
      client: '/cliente/dashboard'
    };
    
    window.open(routes[type], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Acesso Direto aos Dashboards</h2>
        <p className="text-gray-600">
          Como administrador, você pode acessar qualquer tipo de dashboard para visualização e manutenção.
          Os dashboards serão abertos em uma nova aba para facilitar a navegação.
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
            <div className="space-y-2">
              <Button 
                onClick={() => handleDirectAccess('restaurant')}
                className="w-full"
              >
                Abrir em Nova Aba
              </Button>
              <Button 
                onClick={() => onAccessDashboard('restaurant')}
                variant="outline"
                className="w-full"
              >
                Navegar Nesta Aba
              </Button>
            </div>
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
            <div className="space-y-2">
              <Button 
                onClick={() => handleDirectAccess('delivery')}
                className="w-full"
              >
                Abrir em Nova Aba
              </Button>
              <Button 
                onClick={() => onAccessDashboard('delivery')}
                variant="outline"
                className="w-full"
              >
                Navegar Nesta Aba
              </Button>
            </div>
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
            <div className="space-y-2">
              <Button 
                onClick={() => handleDirectAccess('client')}
                className="w-full"
              >
                Abrir em Nova Aba
              </Button>
              <Button 
                onClick={() => onAccessDashboard('client')}
                variant="outline"
                className="w-full"
              >
                Navegar Nesta Aba
              </Button>
            </div>
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
          <div className="text-blue-700 space-y-2">
            <p>
              • <strong>Nova Aba:</strong> Recomendado para manutenção, mantém o painel admin aberto
            </p>
            <p>
              • <strong>Mesma Aba:</strong> Navegação direta, mas você será redirecionado de volta ao admin após alguns segundos
            </p>
            <p>
              • <strong>Auditoria:</strong> Todas as ações realizadas serão registradas nos logs de auditoria
            </p>
            <p className="text-sm mt-2 text-blue-600">
              <strong>Dica:</strong> Use "Abrir em Nova Aba" para ter melhor controle durante a manutenção dos sistemas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
