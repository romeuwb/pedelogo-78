
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route, Clock, Truck } from 'lucide-react';

interface DeliveryRouteOptimizerProps {
  restaurantId: string;
}

export const DeliveryRouteOptimizer = ({ restaurantId }: DeliveryRouteOptimizerProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Otimizador de Rotas</h2>
        <p className="text-gray-600">Gerencie e otimize as rotas de entrega</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregas Ativas</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-blue-600">3 entregadores</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">28min</p>
                <p className="text-xs text-gray-500">por entrega</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Área de Cobertura</p>
                <p className="text-2xl font-bold">5km</p>
                <p className="text-xs text-gray-500">raio máximo</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2" />
            Rotas em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { entregador: 'João Silva', pedidos: 3, tempo: '15min', distancia: '2.3km' },
              { entregador: 'Maria Santos', pedidos: 2, tempo: '22min', distancia: '4.1km' },
              { entregador: 'Pedro Costa', pedidos: 4, tempo: '8min', distancia: '1.7km' }
            ].map((rota, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{rota.entregador}</p>
                  <p className="text-sm text-gray-600">{rota.pedidos} pedidos</p>
                </div>
                <div className="text-right text-sm">
                  <p>{rota.tempo}</p>
                  <p className="text-gray-500">{rota.distancia}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
