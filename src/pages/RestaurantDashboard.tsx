
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RestaurantDashboard from '@/components/restaurant/RestaurantDashboard';

const RestaurantDashboardPage = () => {
  const { user, profile } = useAuth();

  const { data: restaurantData, isLoading } = useQuery({
    queryKey: ['restaurant-details', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar detalhes do restaurante:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id && profile?.tipo === 'restaurante'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restaurante não encontrado
          </h2>
          <p className="text-gray-600">
            Não foi possível encontrar os dados do seu restaurante. 
            Verifique se o cadastro foi concluído corretamente.
          </p>
        </div>
      </div>
    );
  }

  return <RestaurantDashboard restaurantId={restaurantData.id} />;
};

export default RestaurantDashboardPage;
