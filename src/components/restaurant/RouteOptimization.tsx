
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Route, Clock, DollarSign, MapPin, Play, Pause, CheckCircle } from 'lucide-react';

interface RouteOptimizationProps {
  restaurantId: string;
}

interface OptimizedRoute {
  id: string;
  route_name: string;
  route_data: any;
  optimization_type: string;
  total_distance: number;
  total_time: number;
  estimated_cost: number;
  orders_included: any[];
  status: string;
  created_at: string;
}

export const RouteOptimization = ({ restaurantId }: RouteOptimizationProps) => {
  const [routeName, setRouteName] = useState('');
  const [optimizationType, setOptimizationType] = useState<'time' | 'distance' | 'cost'>('time');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar rotas existentes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['optimized-routes', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('optimized_routes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OptimizedRoute[];
    }
  });

  // Buscar pedidos pendentes
  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          endereco_entrega
        `)
        .eq('restaurante_id', restaurantId)
        .in('status', ['confirmado', 'preparando'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Criar nova rota otimizada
  const createRouteMutation = useMutation({
    mutationFn: async (routeData: any) => {
      // Simulação de otimização de rota (aqui você integraria com Google Routes API)
      const optimizedData = await optimizeRoute(selectedOrders, optimizationType);
      
      const { data, error } = await supabase
        .from('optimized_routes')
        .insert({
          restaurant_id: restaurantId,
          route_name: routeName,
          route_data: optimizedData,
          optimization_type: optimizationType,
          total_distance: optimizedData.totalDistance,
          total_time: optimizedData.totalTime,
          estimated_cost: optimizedData.estimatedCost,
          orders_included: selectedOrders,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-routes'] });
      toast({
        title: "Rota criada",
        description: "Rota otimizada criada com sucesso!"
      });
      setRouteName('');
      setSelectedOrders([]);
    }
  });

  // Função de simulação de otimização (substitua pela integração real)
  const optimizeRoute = async (orderIds: string[], type: string) => {
    // Simulação - aqui você faria a chamada para Google Routes API
    const baseDistance = orderIds.length * 5; // 5km por entrega
    const baseTime = orderIds.length * 15; // 15 min por entrega
    const baseCost = orderIds.length * 8; // R$ 8 por entrega

    const multipliers = {
      time: { distance: 1.2, time: 0.8, cost: 1.0 },
      distance: { distance: 0.8, time: 1.1, cost: 0.9 },
      cost: { distance: 1.0, time: 1.0, cost: 0.7 }
    };

    const mult = multipliers[type as keyof typeof multipliers];

    return {
      totalDistance: Math.round(baseDistance * mult.distance * 100) / 100,
      totalTime: Math.round(baseTime * mult.time),
      estimatedCost: Math.round(baseCost * mult.cost * 100) / 100,
      waypoints: orderIds.map((id, index) => ({
        orderId: id,
        sequence: index + 1,
        estimatedArrival: new Date(Date.now() + (index + 1) * 15 * 60000).toISOString()
      }))
    };
  };

  // Ativar rota
  const activateRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from('optimized_routes')
        .update({ status: 'active' })
        .eq('id', routeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-routes'] });
      toast({
        title: "Rota ativada",
        description: "Rota foi ativada com sucesso!"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      active: 'default',
      completed: 'success'
    } as const;

    const labels = {
      pending: 'Pendente',
      active: 'Ativa',
      completed: 'Concluída'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'distance':
        return <Route className="h-4 w-4" />;
      case 'cost':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2" />
            Otimização de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Criar Rota</TabsTrigger>
              <TabsTrigger value="existing">Rotas Existentes</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome da Rota
                  </label>
                  <Input
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Ex: Rota Centro - Manhã"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Otimização
                  </label>
                  <Select value={optimizationType} onValueChange={(value: any) => setOptimizationType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Menor Tempo</SelectItem>
                      <SelectItem value="distance">Menor Distância</SelectItem>
                      <SelectItem value="cost">Menor Custo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pedidos Pendentes ({pendingOrders?.length || 0})
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingOrders?.map((order) => (
                    <div key={order.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Pedido #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.endereco_entrega?.rua || 'Endereço não informado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: R$ {order.total?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => createRouteMutation.mutate({})}
                disabled={!routeName || selectedOrders.length === 0 || createRouteMutation.isPending}
                className="w-full"
              >
                {createRouteMutation.isPending ? 'Criando...' : 'Criar Rota Otimizada'}
              </Button>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4">
              {routesLoading ? (
                <p>Carregando rotas...</p>
              ) : routes?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma rota criada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {routes?.map((route) => (
                    <Card key={route.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getOptimizationIcon(route.optimization_type)}
                            <h3 className="font-semibold">{route.route_name}</h3>
                          </div>
                          {getStatusBadge(route.status)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Distância</p>
                            <p className="font-medium">{route.total_distance} km</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tempo</p>
                            <p className="font-medium">{route.total_time} min</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Custo Est.</p>
                            <p className="font-medium">R$ {route.estimated_cost}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            {route.orders_included.length} pedidos incluídos
                          </p>
                        </div>

                        {route.status === 'pending' && (
                          <div className="mt-4 flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => activateRouteMutation.mutate(route.id)}
                              disabled={activateRouteMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Ativar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
