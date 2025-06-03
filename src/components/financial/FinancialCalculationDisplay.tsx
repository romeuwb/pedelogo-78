
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calculator, 
  Route, 
  Truck,
  Building2,
  User,
  TrendingUp
} from 'lucide-react';

interface FinancialBreakdownProps {
  route: {
    distance_km: number;
    estimated_time_minutes: number;
    surge_multiplier?: number;
  };
  deliveryFee: {
    base_fee: number;
    distance_fee: number;
    service_fee: number;
    total_delivery_fee: number;
  };
  commission: {
    order_subtotal: number;
    platform_commission_amount: number;
    restaurant_net_amount: number;
  };
  deliveryPayment: {
    total_earnings: number;
    base_pay: number;
    distance_pay: number;
    tip_amount: number;
  };
  platformRevenue: {
    net_platform_revenue: number;
    total_collected: number;
  };
}

export const FinancialCalculationDisplay: React.FC<FinancialBreakdownProps> = ({
  route,
  deliveryFee,
  commission,
  deliveryPayment,
  platformRevenue
}) => {
  return (
    <div className="space-y-6">
      {/* Resumo da Rota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Cálculo da Rota</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Distância</p>
              <p className="text-lg font-semibold">{route.distance_km} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tempo Estimado</p>
              <p className="text-lg font-semibold">{route.estimated_time_minutes} min</p>
            </div>
          </div>
          {route.surge_multiplier && (
            <Badge variant="secondary" className="mt-2">
              Surge {route.surge_multiplier}x
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cliente */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <User className="h-4 w-4" />
              <span className="text-sm">Cliente Paga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ {commission.order_subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa Entrega</span>
              <span>R$ {deliveryFee.total_delivery_fee.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {platformRevenue.total_collected.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Restaurante */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Restaurante Recebe</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ {commission.order_subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>Comissão</span>
              <span>- R$ {commission.platform_commission_amount.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Líquido</span>
              <span>R$ {commission.restaurant_net_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Entregador */}
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <Truck className="h-4 w-4" />
              <span className="text-sm">Entregador Ganha</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base + Distância</span>
              <span>R$ {(deliveryPayment.base_pay + deliveryPayment.distance_pay).toFixed(2)}</span>
            </div>
            {deliveryPayment.tip_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Gorjeta</span>
                <span>R$ {deliveryPayment.tip_amount.toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {deliveryPayment.total_earnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receita da Plataforma */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <TrendingUp className="h-5 w-5" />
            <span>Receita da Plataforma</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Coletado</p>
              <p className="text-lg font-semibold">R$ {platformRevenue.total_collected.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Líquida</p>
              <p className="text-lg font-semibold text-purple-600">
                R$ {platformRevenue.net_platform_revenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Margem: {((platformRevenue.net_platform_revenue / platformRevenue.total_collected) * 100).toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
