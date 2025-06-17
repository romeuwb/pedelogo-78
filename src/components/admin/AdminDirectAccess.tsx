
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Truck, User, Shield, CheckCircle } from 'lucide-react';

interface AdminDirectAccessProps {
  onAccessDashboard: (type: 'restaurant' | 'delivery' | 'client') => void;
}

export const AdminDirectAccess = ({ onAccessDashboard }: AdminDirectAccessProps) => {
  const handleDirectAccess = (type: 'restaurant' | 'delivery' | 'client') => {
    console.log('Acessando dashboard:', type);
    
    const routes = {
      restaurant: '/restaurante/dashboard',
      delivery: '/entregador/dashboard',
      client: '/cliente/dashboard'
    };
    
    // Tentar abrir em nova aba
    const newWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.location.href = routes[type];
    } else {
      // Fallback se popup blocker impedir
      alert('Por favor, permita popups para este site e tente novamente.');
    }
  };

  const handleDirectNavigation = (type: 'restaurant' | 'delivery' | 'client') => {
    console.log('Navegando para dashboard:', type);
    
    const routes = {
      restaurant: '/restaurante/dashboard',
      delivery: '/entregador/dashboard',
      client: '/cliente/dashboard'
    };
    
    // Navegar na mesma aba
    window.location.href = routes[type];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Acesso Direto aos Dashboards</h2>
        <p className="text-gray-600">
          Como administrador, você pode acessar qualquer tipo de dashboard para visualização e manutenção.
          As rotas protegidas foram modificadas para permitir acesso de administradores.
        </p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Acesso de Administrador Habilitado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-green-700 space-y-2">
            <p>
              <strong>✅ Solução Implementada:</strong> As rotas protegidas agora permitem acesso de administradores
            </p>
            <p>
              • <strong>Administradores</strong> podem acessar todos os tipos de dashboard (cliente, restaurante, entregador)
            </p>
            <p>
              • <strong>Usuários normais</strong> continuam sendo direcionados apenas para seus respectivos painéis
            </p>
            <p>
              • <strong>Auditoria:</strong> Todas as tentativas de acesso são registradas nos logs
            </p>
          </div>
        </CardContent>
      </Card>

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
                onClick={() => handleDirectNavigation('restaurant')}
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
                onClick={() => handleDirectNavigation('delivery')}
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
                onClick={() => handleDirectNavigation('client')}
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
            Como Funciona Agora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 space-y-2">
            <p>
              • <strong>Nova Aba:</strong> Recomendado para manutenção, mantém o painel admin aberto
            </p>
            <p>
              • <strong>Mesma Aba:</strong> Navegação direta, você pode voltar usando o botão voltar do navegador
            </p>
            <p>
              • <strong>Segurança:</strong> Apenas usuários com perfil 'admin' podem acessar outros dashboards
            </p>
            <p>
              • <strong>Logs:</strong> Todos os acessos são registrados para auditoria
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
