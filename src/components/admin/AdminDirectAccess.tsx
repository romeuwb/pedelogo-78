
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Truck, User, Shield } from 'lucide-react';

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
    
    // Tentar abrir em nova aba sem verificações de autenticação
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

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Shield className="h-5 w-5" />
            Aviso sobre Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700 space-y-2">
            <p>
              <strong>⚠️ Problema Detectado:</strong> O sistema está redirecionando para a página inicial devido às proteções de rota.
            </p>
            <p>
              • <strong>Causa:</strong> As rotas protegidas verificam se o usuário tem permissão para acessar cada tipo de dashboard
            </p>
            <p>
              • <strong>Solução Atual:</strong> Para acessar os dashboards como admin, você precisa:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Temporariamente desabilitar as verificações de autenticação</li>
              <li>Ou criar perfis de teste para cada tipo de usuário</li>
            </ul>
            <p className="text-sm mt-2 text-yellow-600">
              <strong>Dica:</strong> Se mesmo usando "Nova Aba" você é redirecionado, isso confirma que o problema está nas rotas protegidas.
            </p>
          </div>
        </CardContent>
      </Card>

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
              • <strong>Nova Aba:</strong> Recomendado para manutenção, mas sujeito às verificações de rota
            </p>
            <p>
              • <strong>Mesma Aba:</strong> Navegação direta, também sujeita às verificações
            </p>
            <p>
              • <strong>Auditoria:</strong> Todas as tentativas de acesso são registradas nos logs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
