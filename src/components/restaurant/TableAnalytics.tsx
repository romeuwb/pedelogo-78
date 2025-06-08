
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

interface TableAnalyticsProps {
  restaurantId: string;
}

export const TableAnalytics = ({ restaurantId }: TableAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios de Mesas</h2>
        <p className="text-gray-600">Análise de ocupação e performance das mesas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-green-600">+5% desde ontem</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">45min</p>
                <p className="text-xs text-gray-500">por mesa</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Hoje</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-gray-500">32 mesas ocupadas</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita/Mesa</p>
                <p className="text-2xl font-bold">R$ 85</p>
                <p className="text-xs text-green-600">+12% esta semana</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">12:00 - 14:00</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-sm font-medium">90%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">19:00 - 21:00</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">15:00 - 17:00</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mesas Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { mesa: 5, ocupacao: 95, receita: 450 },
                { mesa: 3, ocupacao: 88, receita: 420 },
                { mesa: 8, ocupacao: 82, receita: 380 },
                { mesa: 1, ocupacao: 75, receita: 350 }
              ].map((item) => (
                <div key={item.mesa} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Mesa {item.mesa}</p>
                    <p className="text-sm text-gray-600">{item.ocupacao}% ocupação</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {item.receita}</p>
                    <p className="text-sm text-gray-600">hoje</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
