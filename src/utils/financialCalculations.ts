
import { RouteCalculation, DeliveryFeeCalculation, CommissionCalculation, DeliveryPayment, PlatformRevenue } from '@/types/financial';

// Configurações do sistema (normalmente viriam do banco de dados)
const SYSTEM_CONFIG = {
  // Taxas de comissão
  DEFAULT_COMMISSION_RATE: 0.20, // 20%
  MINIMUM_COMMISSION: 2.00,
  
  // Taxas de entrega
  BASE_DELIVERY_FEE: 3.99,
  DISTANCE_RATE_PER_KM: 1.50,
  SERVICE_FEE_RATE: 0.05, // 5%
  
  // Pagamento entregador
  BASE_PAY_PER_DELIVERY: 4.00,
  DISTANCE_PAY_PER_KM: 2.00,
  TIME_PAY_PER_MINUTE: 0.15,
  MINIMUM_DELIVERY_PAY: 8.00,
  
  // Multiplicadores
  SURGE_MULTIPLIER_MAX: 2.0,
  WEATHER_MULTIPLIER: 1.2,
  
  // Taxas de processamento
  PAYMENT_PROCESSING_RATE: 0.029, // 2.9%
  PAYMENT_PROCESSING_FIXED: 0.39, // R$ 0.39
};

export const calculateRoute = (
  restaurantCoords: [number, number],
  customerCoords: [number, number],
  vehicleType: RouteCalculation['vehicle_type'],
  trafficFactor: number = 1.0,
  weatherConditions?: 'normal' | 'rain' | 'heavy_rain'
): RouteCalculation => {
  // Cálculo básico de distância (Haversine formula)
  const distance = calculateDistance(restaurantCoords, customerCoords);
  
  // Velocidades médias por tipo de veículo (km/h)
  const avgSpeeds = {
    moto: 25,
    carro: 20,
    bicicleta: 12,
    a_pe: 5
  };
  
  // Tempo base sem trânsito
  const baseTime = (distance / avgSpeeds[vehicleType]) * 60; // em minutos
  
  // Aplicar fatores
  const weatherFactor = weatherConditions === 'heavy_rain' ? 1.5 : 
                       weatherConditions === 'rain' ? 1.2 : 1.0;
  
  const estimatedTime = baseTime * trafficFactor * weatherFactor;
  
  return {
    distance_km: Number(distance.toFixed(2)),
    estimated_time_minutes: Math.round(estimatedTime),
    traffic_factor: trafficFactor,
    vehicle_type: vehicleType,
    weather_factor: weatherFactor,
    surge_multiplier: trafficFactor > 1.3 ? Math.min(trafficFactor, SYSTEM_CONFIG.SURGE_MULTIPLIER_MAX) : undefined
  };
};

export const calculateDeliveryFee = (
  routeData: RouteCalculation,
  orderValue: number,
  zone?: string,
  promoCode?: string
): DeliveryFeeCalculation => {
  let baseFee = SYSTEM_CONFIG.BASE_DELIVERY_FEE;
  let distanceFee = routeData.distance_km * SYSTEM_CONFIG.DISTANCE_RATE_PER_KM;
  let serviceFee = orderValue * SYSTEM_CONFIG.SERVICE_FEE_RATE;
  
  // Aplicar surge pricing se houver
  if (routeData.surge_multiplier) {
    baseFee *= routeData.surge_multiplier;
    distanceFee *= routeData.surge_multiplier;
  }
  
  // Taxa adicional por condições climáticas
  let weatherFee = 0;
  if (routeData.weather_factor && routeData.weather_factor > 1.0) {
    weatherFee = (baseFee + distanceFee) * (routeData.weather_factor - 1);
  }
  
  const totalDeliveryFee = baseFee + distanceFee + serviceFee + weatherFee;
  
  // Aplicar promoções (simplificado)
  const finalFee = promoCode === 'FRETEGRATIS' ? 0 : totalDeliveryFee;
  
  return {
    base_fee: Number(baseFee.toFixed(2)),
    distance_fee: Number(distanceFee.toFixed(2)),
    service_fee: Number(serviceFee.toFixed(2)),
    surge_fee: routeData.surge_multiplier ? Number((finalFee - totalDeliveryFee + weatherFee).toFixed(2)) : undefined,
    weather_fee: weatherFee > 0 ? Number(weatherFee.toFixed(2)) : undefined,
    total_delivery_fee: Number(finalFee.toFixed(2)),
    calculation_method: 'distance_based'
  };
};

export const calculateCommission = (
  orderSubtotal: number,
  deliveryFee: number,
  customCommissionRate?: number
): CommissionCalculation => {
  const commissionRate = customCommissionRate || SYSTEM_CONFIG.DEFAULT_COMMISSION_RATE;
  
  // Comissão apenas sobre o valor dos itens, não sobre a taxa de entrega
  let commissionAmount = orderSubtotal * commissionRate;
  
  // Aplicar comissão mínima
  commissionAmount = Math.max(commissionAmount, SYSTEM_CONFIG.MINIMUM_COMMISSION);
  
  // Taxa de processamento de pagamento
  const totalOrder = orderSubtotal + deliveryFee;
  const processingFee = (totalOrder * SYSTEM_CONFIG.PAYMENT_PROCESSING_RATE) + SYSTEM_CONFIG.PAYMENT_PROCESSING_FIXED;
  
  const restaurantNetAmount = orderSubtotal - commissionAmount - processingFee;
  
  return {
    order_subtotal: Number(orderSubtotal.toFixed(2)),
    platform_commission_rate: commissionRate,
    platform_commission_amount: Number(commissionAmount.toFixed(2)),
    payment_processing_fee: Number(processingFee.toFixed(2)),
    restaurant_net_amount: Number(restaurantNetAmount.toFixed(2))
  };
};

export const calculateDeliveryPayment = (
  routeData: RouteCalculation,
  tipAmount: number = 0,
  peakHours: boolean = false,
  deliveriesCompleted: number = 0
): DeliveryPayment => {
  let basePay = SYSTEM_CONFIG.BASE_PAY_PER_DELIVERY;
  let distancePay = routeData.distance_km * SYSTEM_CONFIG.DISTANCE_PAY_PER_KM;
  let timePay = routeData.estimated_time_minutes * SYSTEM_CONFIG.TIME_PAY_PER_MINUTE;
  
  // Bônus por condições adversas
  let weatherBonus = 0;
  if (routeData.weather_factor && routeData.weather_factor > 1.0) {
    weatherBonus = (basePay + distancePay) * 0.2; // 20% de bônus
  }
  
  // Bônus por horário de pico
  let surgeBonus = 0;
  if (peakHours || routeData.surge_multiplier) {
    surgeBonus = (basePay + distancePay) * 0.3; // 30% de bônus
  }
  
  // Bônus por incentivos (exemplo: completar X entregas)
  let incentiveBonus = 0;
  if (deliveriesCompleted >= 10) {
    incentiveBonus = 5.00; // R$ 5 por completar 10 entregas
  }
  
  const totalEarnings = basePay + distancePay + timePay + weatherBonus + surgeBonus + tipAmount + incentiveBonus;
  const guaranteedMinimum = Math.max(totalEarnings, SYSTEM_CONFIG.MINIMUM_DELIVERY_PAY + tipAmount);
  
  return {
    base_pay: Number(basePay.toFixed(2)),
    distance_pay: Number(distancePay.toFixed(2)),
    time_pay: Number(timePay.toFixed(2)),
    minimum_guaranteed: Number(SYSTEM_CONFIG.MINIMUM_DELIVERY_PAY.toFixed(2)),
    weather_bonus: weatherBonus > 0 ? Number(weatherBonus.toFixed(2)) : undefined,
    surge_bonus: surgeBonus > 0 ? Number(surgeBonus.toFixed(2)) : undefined,
    tip_amount: Number(tipAmount.toFixed(2)),
    incentive_bonus: incentiveBonus > 0 ? Number(incentiveBonus.toFixed(2)) : undefined,
    total_earnings: Number(guaranteedMinimum.toFixed(2))
  };
};

export const calculatePlatformRevenue = (
  orderSubtotal: number,
  deliveryFeeData: DeliveryFeeCalculation,
  commissionData: CommissionCalculation,
  deliveryPayment: DeliveryPayment
): PlatformRevenue => {
  const totalCollected = orderSubtotal + deliveryFeeData.total_delivery_fee;
  const restaurantPayout = commissionData.restaurant_net_amount;
  const deliveryPayout = deliveryPayment.total_earnings;
  
  // A plataforma fica com: comissão + taxa de serviço + parte da taxa de entrega
  const platformCommission = commissionData.platform_commission_amount;
  const serviceFees = deliveryFeeData.service_fee;
  
  // A plataforma paga parte da taxa de entrega ao entregador, fica com o resto
  const deliveryFeeRetained = deliveryFeeData.total_delivery_fee - (deliveryPayment.total_earnings - deliveryPayment.tip_amount);
  
  const netPlatformRevenue = platformCommission + serviceFees + Math.max(0, deliveryFeeRetained) - commissionData.payment_processing_fee;
  
  return {
    total_collected: Number(totalCollected.toFixed(2)),
    restaurant_payout: Number(restaurantPayout.toFixed(2)),
    delivery_payout: Number(deliveryPayout.toFixed(2)),
    platform_commission: Number(platformCommission.toFixed(2)),
    service_fees: Number(serviceFees.toFixed(2)),
    payment_processing_costs: Number(commissionData.payment_processing_fee.toFixed(2)),
    net_platform_revenue: Number(netPlatformRevenue.toFixed(2))
  };
};

// Função auxiliar para calcular distância entre coordenadas (Haversine)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degree: number): number {
  return degree * (Math.PI / 180);
}

// Função para obter configurações do sistema (normalmente do banco)
export const getSystemConfig = () => SYSTEM_CONFIG;

// Função para atualizar configurações do sistema
export const updateSystemConfig = (newConfig: Partial<typeof SYSTEM_CONFIG>) => {
  Object.assign(SYSTEM_CONFIG, newConfig);
};
