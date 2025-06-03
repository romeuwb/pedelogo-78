
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientSearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    faixaPreco: '',
    tempoEntrega: '',
    avaliacao: ''
  });

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('client_search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const saveSearchTerm = async (term) => {
    if (!user || !term.trim()) return;

    try {
      await supabase.from('client_search_history').insert({
        user_id: user.id,
        termo_pesquisa: term,
        categoria: filters.categoria || null,
        filtros_aplicados: filters
      });
      fetchSearchHistory();
    } catch (error) {
      console.error('Error saving search term:', error);
    }
  };

  const performSearch = async (term = searchTerm) => {
    if (!term.trim()) return;

    setLoading(true);
    try {
      // Search in restaurants
      let restaurantQuery = supabase
        .from('restaurant_details')
        .select('*, restaurant_products(*)')
        .eq('status_aprovacao', 'aprovado')
        .or(`nome_fantasia.ilike.%${term}%,descricao.ilike.%${term}%,categoria.ilike.%${term}%`);

      if (filters.categoria) {
        restaurantQuery = restaurantQuery.eq('categoria', filters.categoria);
      }

      const { data: restaurants, error: restaurantError } = await restaurantQuery;
      if (restaurantError) throw restaurantError;

      // Search in products
      const { data: products, error: productError } = await supabase
        .from('restaurant_products')
        .select('*, restaurant_details(*)')
        .eq('ativo', true)
        .eq('disponivel', true)
        .or(`nome.ilike.%${term}%,descricao.ilike.%${term}%`);

      if (productError) throw productError;

      setSearchResults({
        restaurants: restaurants || [],
        products: products || []
      });

      await saveSearchTerm(term);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await supabase
        .from('client_search_history')
        .delete()
        .eq('user_id', user.id);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Buscar restaurantes ou pratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Button onClick={() => performSearch()} className="w-full" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !searchResults.restaurants && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pesquisas recentes</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <X size={16} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => {
                  setSearchTerm(item.termo_pesquisa);
                  performSearch(item.termo_pesquisa);
                }}
              >
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700">{item.termo_pesquisa}</span>
                {item.categoria && (
                  <Badge variant="outline" className="ml-auto">
                    {item.categoria}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.restaurants && (
        <div className="space-y-4">
          {/* Restaurants Results */}
          {searchResults.restaurants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Restaurantes ({searchResults.restaurants.length})
              </h3>
              <div className="space-y-3">
                {searchResults.restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {restaurant.logo_url ? (
                            <img
                              src={restaurant.logo_url}
                              alt={restaurant.nome_fantasia}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Logo</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {restaurant.nome_fantasia || restaurant.razao_social}
                          </h4>
                          <p className="text-sm text-gray-600">{restaurant.descricao}</p>
                          <Badge variant="outline" className="mt-2">
                            {restaurant.categoria}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {searchResults.products.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Pratos ({searchResults.products.length})
              </h3>
              <div className="space-y-3">
                {searchResults.products.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {product.imagem_url ? (
                            <img
                              src={product.imagem_url}
                              alt={product.nome}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Foto</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{product.nome}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.descricao}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-green-600">
                              R$ {product.preco.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {product.restaurant_details?.nome_fantasia}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.restaurants.length === 0 && searchResults.products.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum resultado encontrado para "{searchTerm}"</p>
                <p className="text-sm mt-2">Tente usar termos diferentes ou verifique a ortografia</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
