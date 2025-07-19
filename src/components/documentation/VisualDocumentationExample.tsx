import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, Store, Truck } from 'lucide-react';

const VisualDocumentationExample = () => {
  const screens = [
    {
      id: 'auth',
      title: 'Tela de Autenticação',
      path: '/auth',
      description: 'Permite login/cadastro para diferentes tipos de usuário',
      functions: ['Login por email/senha', 'Seleção de tipo de usuário', 'Redirecionamento automático'],
      userTypes: ['Cliente', 'Restaurante', 'Entregador', 'Admin'],
      screenshot: '/screenshots/auth-screen.png', // Placeholder
      flows: [
        { to: 'cliente-dashboard', condition: 'Login como Cliente' },
        { to: 'restaurante-dashboard', condition: 'Login como Restaurante' },
        { to: 'entregador-dashboard', condition: 'Login como Entregador' }
      ]
    },
    {
      id: 'cliente-dashboard',
      title: 'Dashboard do Cliente',
      path: '/cliente/dashboard',
      description: 'Interface principal para clientes fazerem pedidos',
      functions: ['Buscar restaurantes', 'Ver cardápio', 'Fazer pedidos', 'Acompanhar entrega'],
      userTypes: ['Cliente'],
      screenshot: '/screenshots/client-dashboard.png', // Placeholder
      flows: [
        { to: 'restaurante-menu', condition: 'Clica em restaurante' },
        { to: 'pedidos-cliente', condition: 'Vai para "Meus Pedidos"' }
      ]
    },
    {
      id: 'restaurante-dashboard',
      title: 'Dashboard do Restaurante',
      path: '/restaurante/dashboard',
      description: 'Painel de controle para gestão do restaurante',
      functions: ['Gerenciar pedidos', 'Configurar cardápio', 'Sistema POS', 'Relatórios financeiros'],
      userTypes: ['Restaurante'],
      screenshot: '/screenshots/restaurant-dashboard.png', // Placeholder
      flows: [
        { to: 'pos-system', condition: 'Acessa aba POS' },
        { to: 'menu-management', condition: 'Gerencia cardápio' }
      ]
    }
  ];

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'Cliente': return <User className="w-4 h-4" />;
      case 'Restaurante': return <Store className="w-4 h-4" />;
      case 'Entregador': return <Truck className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Documentação Visual - Exemplo</h1>
        <p className="text-muted-foreground">Screenshots + Descrições + Fluxos de Navegação</p>
      </div>

      <div className="grid gap-6">
        {screens.map((screen, index) => (
          <Card key={screen.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {screen.title}
                  <Badge variant="outline">{screen.path}</Badge>
                </CardTitle>
                <div className="flex gap-1">
                  {screen.userTypes.map(type => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {getUserTypeIcon(type)}
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Screenshot Placeholder */}
              <div className="bg-muted rounded-lg p-8 text-center border-2 border-dashed border-border">
                <div className="text-muted-foreground text-sm">
                  📸 Screenshot: {screen.screenshot}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  (Seria capturado automaticamente)
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h4 className="font-semibold mb-2">Descrição Funcional</h4>
                <p className="text-muted-foreground">{screen.description}</p>
              </div>

              {/* Funcionalidades */}
              <div>
                <h4 className="font-semibold mb-2">Principais Funcionalidades</h4>
                <div className="flex flex-wrap gap-2">
                  {screen.functions.map((func, i) => (
                    <Badge key={i} variant="outline">{func}</Badge>
                  ))}
                </div>
              </div>

              {/* Fluxos de Navegação */}
              <div>
                <h4 className="font-semibold mb-2">Fluxos de Navegação</h4>
                <div className="space-y-2">
                  {screen.flows.map((flow, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{screen.id}</Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="secondary">{flow.to}</Badge>
                      <span className="text-muted-foreground">
                        quando: {flow.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fluxo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo Geral do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2">Autenticação</Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge variant="outline" className="px-4 py-2">Seleção de Perfil</Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge variant="outline" className="px-4 py-2">Dashboard Específico</Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge variant="outline" className="px-4 py-2">Funcionalidades</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualDocumentationExample;