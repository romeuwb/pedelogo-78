import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Coffee, Calculator, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantQuickAccess = () => {
  const navigate = useNavigate();

  const quickAccessItems = [
    {
      title: 'Sistema PDV',
      description: 'Acesso rápido ao sistema de vendas',
      icon: <Monitor className="h-8 w-8" />,
      path: '/restaurante/pdv',
      color: 'text-blue-600'
    },
    {
      title: 'Gestão de Mesas',
      description: 'Gerenciar mesas e reservas',
      icon: <Coffee className="h-8 w-8" />,
      path: '/restaurante/mesas',
      color: 'text-green-600'
    },
    {
      title: 'Dashboard Completo',
      description: 'Acesso ao painel completo',
      icon: <BarChart3 className="h-8 w-8" />,
      path: '/restaurante/dashboard',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Acesso Rápido</h2>
        <p className="text-gray-600">Escolha o módulo que deseja acessar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessItems.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className={`mx-auto ${item.color} mb-4`}>
                {item.icon}
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">{item.description}</p>
              <Button 
                onClick={() => navigate(item.path)}
                className="w-full"
                variant="outline"
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Integração dos Sistemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <h4 className="font-semibold mb-2">Funcionalidades Integradas:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>PDV e Mesas compartilham o mesmo cardápio</li>
                <li>Relatórios unificados de vendas</li>
                <li>Gestão centralizada de estoque</li>
                <li>Sincronização em tempo real</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Você pode acessar qualquer módulo diretamente através dos links acima, 
                ou usar o dashboard completo para uma visão geral de todas as operações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantQuickAccess;