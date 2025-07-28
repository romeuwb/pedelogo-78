import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  restaurants: any[];
  products: any[];
}

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const { debounceMs = 300, minLength = 2 } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult>({ restaurants: [], products: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (term: string, userLat?: number, userLng?: number) => {
    if (!term || term.length < minLength) {
      setResults({ restaurants: [], products: [] });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar restaurantes
      let restaurantQuery = supabase
        .from('restaurant_details')
        .select(`
          id,
          nome_fantasia,
          categoria,
          descricao,
          endereco,
          cidade,
          estado,
          logo_url,
          tempo_entrega_min,
          taxa_entrega
        `)
        .eq('status_aprovacao', 'aprovado')
        .or(`nome_fantasia.ilike.%${term}%,descricao.ilike.%${term}%,categoria.ilike.%${term}%`)
        .limit(10);

      // Buscar produtos
      const productQuery = supabase
        .from('restaurant_products')
        .select(`
          id,
          nome,
          descricao,
          preco,
          imagem_url,
          categoria,
          restaurant_details!inner(
            id,
            nome_fantasia,
            cidade,
            estado
          )
        `)
        .eq('ativo', true)
        .eq('disponivel', true)
        .or(`nome.ilike.%${term}%,descricao.ilike.%${term}%,categoria.ilike.%${term}%`)
        .limit(15);

      const [restaurantResponse, productResponse] = await Promise.all([
        restaurantQuery,
        productQuery
      ]);

      if (restaurantResponse.error) throw restaurantResponse.error;
      if (productResponse.error) throw productResponse.error;

      setResults({
        restaurants: restaurantResponse.data || [],
        products: productResponse.data || []
      });
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao realizar busca');
      setResults({ restaurants: [], products: [] });
    } finally {
      setIsLoading(false);
    }
  }, [minLength]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setResults({ restaurants: [], products: [] });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, performSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setResults({ restaurants: [], products: [] });
    setError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    performSearch,
    clearSearch,
    hasResults: results.restaurants.length > 0 || results.products.length > 0
  };
};