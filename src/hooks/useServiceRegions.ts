
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ServiceRegion {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'custom';
  country?: string;
  state?: string;
  city?: string;
  parent_region_id?: string;
  coordinates?: { lat: number; lng: number };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRegionData {
  name: string;
  type: 'country' | 'state' | 'city' | 'custom';
  country?: string;
  state?: string;
  city?: string;
  parent_region_id?: string;
  coordinates?: { lat: number; lng: number };
  active?: boolean;
}

export const useServiceRegions = () => {
  const queryClient = useQueryClient();

  // Buscar todas as regiões
  const { data: regions = [], isLoading, error } = useQuery({
    queryKey: ['service-regions'],
    queryFn: async (): Promise<ServiceRegion[]> => {
      const { data, error } = await supabase
        .from('service_regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Criar região
  const createRegion = useMutation({
    mutationFn: async (regionData: CreateRegionData): Promise<ServiceRegion> => {
      const { data, error } = await supabase
        .from('service_regions')
        .insert([regionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-regions'] });
      toast({
        title: 'Sucesso',
        description: 'Região criada com sucesso'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar região',
        variant: 'destructive'
      });
    }
  });

  // Atualizar região
  const updateRegion = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceRegion> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('service_regions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-regions'] });
      toast({
        title: 'Sucesso',
        description: 'Região atualizada com sucesso'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar região',
        variant: 'destructive'
      });
    }
  });

  // Excluir região
  const deleteRegion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_regions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-regions'] });
      toast({
        title: 'Sucesso',
        description: 'Região excluída com sucesso'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir região',
        variant: 'destructive'
      });
    }
  });

  // Alternar status da região
  const toggleRegionStatus = useMutation({
    mutationFn: async (id: string) => {
      const region = regions.find(r => r.id === id);
      if (!region) throw new Error('Região não encontrada');

      const { data, error } = await supabase
        .from('service_regions')
        .update({ active: !region.active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-regions'] });
      toast({
        title: 'Sucesso',
        description: 'Status da região atualizado'
      });
    }
  });

  return {
    regions,
    isLoading,
    error,
    createRegion,
    updateRegion,
    deleteRegion,
    toggleRegionStatus
  };
};
