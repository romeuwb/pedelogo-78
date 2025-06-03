
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin,
  Calendar,
  BarChart3,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const DeliveryEarnings = ({ deliveryDetails }) => {
  const [earningsData, setEarningsData] = useState({
    today: null,
    week: null,
    month: null
  });
  const [detailedEarnings, setDetailedEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    if (deliveryDetails) {
      loadEarningsData();
      loadDetailedEarnings();
    }
  }, [deliveryDetails]);

  const loadEarningsData = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const monthStart = new Date(today);
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      // Ganhos de hoje
      const { data: todayData, error: todayError } = await supabase
        .rpc('calculate_delivery_earnings', {
          delivery_detail_id: deliveryDetails.id,
          start_date: todayStr,
          end_date: todayStr
        });

      if (todayError) throw todayError;

      // Ganhos da semana
      const { data: weekData, error: weekError } = await supabase
        .rpc('calculate_delivery_earnings', {
          delivery_detail_id: deliveryDetails.id,
          start_date: weekStartStr,
          end_date: todayStr
        });

      if (weekError) throw weekError;

      // Ganhos do mês
      const { data: monthData, error: monthError } = await supabase
        .rpc('calculate_delivery_earnings', {
          delivery_detail_id: deliveryDetails.id,
          start_date: monthStartStr,
          end_date: todayStr
        });

      if (monthError) throw monthError;

      setEarningsData({
        today: todayData,
        week: weekData,
        month: monthData
      });
    } catch (error) {
      console.error('Erro ao carregar dados de ganhos:', error);
      toast.error('Erro ao carregar dados de ganhos');
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_earnings')
        .select(`
          *,
          orders!inner (
            id,
            created_at,
            restaurant_details:restaurante_id (nome)
          )
        `)
        .eq('delivery_detail_id', deliveryDetails.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDetailedEarnings(data || []);
    } catch (error) {
      console.error('Erro ao carregar ganhos detalhados:', error);
    }
  };

  const getCurrentPeriodData = () => {
    return earningsData[selectedPeriod] || {
      total_ganhos: 0,
      total_entregas: 0,
      valor_base_total: 0,
      gorjetas_total: 0,
      bonus_total: 0,
      desconto_total: 0,
      distancia_total: 0
    };
  };

  const getPeriodLabel = () => {
    const labels = {
      today: 'Hoje',
      week: 'Últimos 7 dias',
      month: 'Este mês'
    };
    return labels[selectedPeriod];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentData = getCurrentPeriodData();

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="week">7 dias</TabsTrigger>
          <TabsTrigger value="month">Mês</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {currentData.total_ganhos.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Ganho</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentData.total_entregas}
            </div>
            <div className="text-sm text-gray-600">Entregas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              R$ {currentData.total_entregas > 0 
                ? (currentData.total_ganhos / currentData.total_entregas).toFixed(2) 
                : '0.00'}
            </div>
            <div className="text-sm text-gray-600">Média/Entrega</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentData.distancia_total.toFixed(1)} km
            </div>
            <div className="text-sm text-gray-600">Distância</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Detalhamento - {getPeriodLabel()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Valor Base</span>
              <span className="font-bold text-green-600">
                R$ {currentData.valor_base_total.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Gorjetas</span>
              <span className="font-bold text-blue-600">
                R$ {currentData.gorjetas_total.toFixed(2)}
              </span>
            </div>
            
            {currentData.bonus_total > 0 && (
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-800">Bônus</span>
                <span className="font-bold text-purple-600">
                  R$ {currentData.bonus_total.toFixed(2)}
                </span>
              </div>
            )}
            
            {currentData.desconto_total > 0 && (
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-800">Descontos</span>
                <span className="font-bold text-red-600">
                  - R$ {currentData.desconto_total.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Últimas Entregas</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detailedEarnings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum ganho registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {detailedEarnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {earning.orders?.restaurant_details?.nome || 'Restaurante'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(earning.created_at).toLocaleDateString()} às{' '}
                      {new Date(earning.created_at).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      {earning.distancia_km && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{earning.distancia_km.toFixed(1)} km</span>
                        </div>
                      )}
                      {earning.tempo_entrega_minutos && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{earning.tempo_entrega_minutos} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      R$ {earning.valor_total.toFixed(2)}
                    </div>
                    {earning.gorjeta > 0 && (
                      <div className="text-sm text-gray-600">
                        + R$ {earning.gorjeta.toFixed(2)} gorjeta
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryEarnings;
