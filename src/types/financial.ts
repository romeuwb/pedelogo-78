
export interface RouteCalculation {
  distance_km: number;
  estimated_time_minutes: number;
  traffic_factor: number;
  vehicle_type: 'moto' | 'carro' | 'bicicleta' | 'a_pe';
  weather_factor?: number;
  surge_multiplier?: number;
}

export interface DeliveryFeeCalculation {
  base_fee: number;
  distance_fee: number;
  service_fee: number;
  surge_fee?: number;
  weather_fee?: number;
  total_delivery_fee: number;
  calculation_method: 'distance_based' | 'zone_based' | 'fixed' | 'free';
}

export interface CommissionCalculation {
  order_subtotal: number;
  platform_commission_rate: number;
  platform_commission_amount: number;
  payment_processing_fee: number;
  restaurant_net_amount: number;
}

export interface DeliveryPayment {
  base_pay: number;
  distance_pay: number;
  time_pay?: number;
  minimum_guaranteed: number;
  weather_bonus?: number;
  surge_bonus?: number;
  tip_amount: number;
  incentive_bonus?: number;
  total_earnings: number;
}

export interface PlatformRevenue {
  total_collected: number;
  restaurant_payout: number;
  delivery_payout: number;
  platform_commission: number;
  service_fees: number;
  payment_processing_costs: number;
  net_platform_revenue: number;
}

export interface FinancialTransaction {
  id: string;
  order_id: string;
  type: 'order_payment' | 'restaurant_payout' | 'delivery_payment' | 'platform_revenue';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  processed_at?: string;
  details: Record<string, any>;
  created_at: string;
}
