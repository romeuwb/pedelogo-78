
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRestaurantApiKey = (restaurantId: string) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadApiKey = async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_restaurant_api_key', {
        p_restaurant_id: restaurantId
      });

      if (error) throw error;
      setApiKey(data || '');
    } catch (error) {
      console.error('Error loading API key:', error);
      toast.error('Erro ao carregar chave da API');
    } finally {
      setLoading(false);
    }
  };

  const generateNewApiKey = async () => {
    if (!restaurantId) return;
    
    try {
      setGenerating(true);
      const { data, error } = await supabase.rpc('generate_restaurant_api_key', {
        p_restaurant_id: restaurantId
      });

      if (error) throw error;
      
      setApiKey(data);
      toast.success('Nova chave da API gerada com sucesso');
      return data;
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Erro ao gerar nova chave da API');
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadApiKey();
  }, [restaurantId]);

  return {
    apiKey,
    loading,
    generating,
    generateNewApiKey,
    refreshApiKey: loadApiKey
  };
};
