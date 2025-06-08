
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Plus } from 'lucide-react';

interface TableManagementPageProps {
  restaurantId: string;
}

const TableManagementPage = ({ restaurantId }: TableManagementPageProps) => {
  const [tables] = useState([
    { id: 1, number: 1, capacity: 4, status: 'available', customers: 0 },
    { id: 2, number: 2, capacity: 2, status: 'occupied', customers: 2 },
    { id: 3, number: 3, capacity: 6, status: 'reserved', customers: 0 },
    { id: 4, number: 4, capacity: 4, status: 'available', customers: 0 },
    { id: 5, number: 5, capacity: 8, status: 'occupied', customers: 6 },
    { id: 6, number: 6, capacity: 2, status: 'cleaning', customers: 0 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'cleaning': return 'Limpeza';
      default: return 'Indefinido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Mesas</h2>
          <p className="text-gray-600">Gerencie as mesas do seu restaurante</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Mesa {table.number}</span>
                <Badge className={`${getStatusColor(table.status)} text-white`}>
                  {getStatusText(table.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {table.customers}/{table.capacity} pessoas
                </div>
                {table.status === 'occupied' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    45 min
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {table.status === 'available' && (
                    <Button size="sm" className="flex-1">
                      Ocupar
                    </Button>
                  )}
                  {table.status === 'occupied' && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        Ver Pedido
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        Finalizar
                      </Button>
                    </>
                  )}
                  {table.status === 'reserved' && (
                    <Button size="sm" className="flex-1">
                      Check-in
                    </Button>
                  )}
                  {table.status === 'cleaning' && (
                    <Button size="sm" className="flex-1">
                      Finalizar Limpeza
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Mesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mesas Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mesas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.status === 'available').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TableManagementPage;
