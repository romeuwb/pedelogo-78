
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

export interface RestaurantData {
  id: string;
  user_id: string;
  nome_fantasia?: string;
  razao_social?: string;
  cnpj?: string;
  categoria: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  descricao?: string;
  logo_url?: string;
  aceita_delivery?: boolean;
  aceita_retirada?: boolean;
  capacidade_mesas?: number;
  tempo_entrega_min?: number;
  taxa_entrega?: number;
  horario_funcionamento?: any;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  ativo?: boolean;
  created_at: string;
  updated_at: string;
}

export const useRestaurantData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: restaurantData, isLoading, error } = useQuery({
    queryKey: ['restaurant-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as RestaurantData;
    },
    enabled: !!user?.id
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async (updates: Partial<RestaurantData>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Prepare update data ensuring categoria is provided
      const updateData = { ...updates };
      
      // Remove fields that don't exist in the database schema or are auto-generated
      delete (updateData as any).id;
      delete (updateData as any).created_at;
      delete (updateData as any).updated_at;
      
      // Ensure categoria exists for upsert - use existing data or default
      if (!updateData.categoria && restaurantData?.categoria) {
        updateData.categoria = restaurantData.categoria;
      } else if (!updateData.categoria) {
        updateData.categoria = 'restaurante'; // Default value
      }

      // Ensure status_aprovacao has a valid value
      if (updateData.status_aprovacao && !['pendente', 'aprovado', 'rejeitado'].includes(updateData.status_aprovacao)) {
        updateData.status_aprovacao = 'pendente';
      }
      
      const { error } = await supabase
        .from('restaurant_details')
        .upsert({
          user_id: user.id,
          categoria: updateData.categoria,
          status_aprovacao: updateData.status_aprovacao || 'pendente',
          ...updateData
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-data'] });
      toast.success('Dados atualizados com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    }
  });

  return {
    restaurantData,
    isLoading,
    error,
    updateRestaurant: updateRestaurantMutation.mutate,
    isUpdating: updateRestaurantMutation.isPending
  };
};
