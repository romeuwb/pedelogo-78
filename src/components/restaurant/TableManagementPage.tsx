
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Users, Settings, BarChart3 } from 'lucide-react';
import TableManager from './TableManager';
import { TableReservations } from './TableReservations';
import { TableAnalytics } from './TableAnalytics';
import { TableConfiguration } from './TableConfiguration';

interface TableManagementPageProps {
  restaurantId: string;
}

const TableManagementPage = ({ restaurantId }: TableManagementPageProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="h-5 w-5 mr-2" />
            Gerenciamento de Mesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mesas
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="mt-6">
              <TableManager restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="reservations" className="mt-6">
              <TableReservations restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <TableAnalytics restaurantId={restaurantId} />
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <TableConfiguration restaurantId={restaurantId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableManagementPage;
