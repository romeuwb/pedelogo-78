
import { useState, useCallback } from 'react';
import { 
  RouteCalculation, 
  DeliveryFeeCalculation, 
  CommissionCalculation, 
  DeliveryPayment, 
  PlatformRevenue 
} from '@/types/financial';
import {
  calculateRoute,
  calculateDeliveryFee,
  calculateCommission,
  calculateDeliveryPayment,
  calculatePlatformRevenue
} from '@/utils/financialCalculations';

export const useFinancialCalculations = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const calculateOrderFinancials = useCallback(async (
    restaurantCoords: [number, number],
    customerCoords: [number, number],
    orderSubtotal: number,
    vehicleType: RouteCalculation['vehicle_type'],
    tipAmount: number = 0,
    promoCode?: string,
    customCommissionRate?: number
  ) => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      // 1. Calcular rota
      const routeData = calculateRoute(
        restaurantCoords,
        customerCoords,
        vehicleType,
        1.2 // Fator de trânsito padrão
      );

      // 2. Calcular taxa de entrega
      const deliveryFeeData = calculateDeliveryFee(
        routeData,
        orderSubtotal,
        undefined,
        promoCode
      );

      // 3. Calcular comissão do restaurante
      const commissionData = calculateCommission(
        orderSubtotal,
        deliveryFeeData.total_delivery_fee,
        customCommissionRate
      );

      // 4. Calcular pagamento do entregador
      const deliveryPaymentData = calculateDeliveryPayment(
        routeData,
        tipAmount,
        false, // Não é horário de pico por padrão
        0 // Entregas completadas
      );

      // 5. Calcular receita da plataforma
      const platformRevenueData = calculatePlatformRevenue(
        orderSubtotal,
        deliveryFeeData,
        commissionData,
        deliveryPaymentData
      );

      return {
        route: routeData,
        deliveryFee: deliveryFeeData,
        commission: commissionData,
        deliveryPayment: deliveryPaymentData,
        platformRevenue: platformRevenueData,
        totalOrderValue: orderSubtotal + deliveryFeeData.total_delivery_fee
      };
    } catch (error) {
      console.error('Erro ao calcular financeiros do pedido:', error);
      setCalculationError('Erro ao calcular valores do pedido');
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const calculateDeliveryEarnings = useCallback((
    routeData: RouteCalculation,
    tipAmount: number,
    isPeakHours: boolean = false,
    deliveriesCompleted: number = 0
  ) => {
    return calculateDeliveryPayment(routeData, tipAmount, isPeakHours, deliveriesCompleted);
  }, []);

  const calculateRestaurantPayout = useCallback((
    orderSubtotal: number,
    deliveryFee: number,
    customCommissionRate?: number
  ) => {
    return calculateCommission(orderSubtotal, deliveryFee, customCommissionRate);
  }, []);

  return {
    calculateOrderFinancials,
    calculateDeliveryEarnings,
    calculateRestaurantPayout,
    isCalculating,
    calculationError
  };
};
