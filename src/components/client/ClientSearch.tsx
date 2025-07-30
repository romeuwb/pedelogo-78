
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SearchResults {
  restaurants: any[];
  products: any[];
}

const ClientSearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState<SearchResults>({ restaurants: [], products: [] });
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
    <div className="bg-background min-h-screen">
      {/* Search Header - Fixed */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-3 lg:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar restaurantes, pratos ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-base lg:text-lg rounded-full bg-white shadow-sm border-0 ring-1 ring-border focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            />
            <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 lg:p-4 space-y-4 lg:space-y-6">
        {/* Search History */}
        {searchHistory.length > 0 && !searchResults.restaurants.length && !searchResults.products.length && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-lg">Pesquisas recentes</h3>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </Button>
            </div>
            
            <div className="grid gap-2">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
                  onClick={() => {
                    setSearchTerm(item.termo_pesquisa);
                    performSearch(item.termo_pesquisa);
                  }}
                >
                  <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                    <Clock size={16} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-foreground font-medium flex-1">{item.termo_pesquisa}</span>
                  {item.categoria && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.categoria}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchResults.restaurants.length > 0 || searchResults.products.length > 0) && (
          <div className="space-y-8">
            {/* Restaurants Results */}
            {searchResults.restaurants.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="font-bold text-foreground text-xl">Restaurantes</h3>
                  <Badge variant="secondary" className="text-sm">
                    {searchResults.restaurants.length}
                  </Badge>
                </div>
                <div className="grid gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.restaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white overflow-hidden">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.nome_fantasia}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm font-medium">Logo do Restaurante</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-foreground hover:bg-white">
                            {restaurant.categoria}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3 lg:p-4">
                        <h4 className="font-bold text-foreground text-lg mb-2 line-clamp-1">
                          {restaurant.nome_fantasia || restaurant.razao_social}
                        </h4>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {restaurant.descricao}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <span>⏱ 30-45 min</span>
                          <span>•</span>
                          <span>📍 2.5 km</span>
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
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="font-bold text-foreground text-xl">Pratos</h3>
                  <Badge variant="secondary" className="text-sm">
                    {searchResults.products.length}
                  </Badge>
                </div>
                <div className="grid gap-3 lg:gap-4">
                  {searchResults.products.map((product) => (
                    <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-0">
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-4">
                                <h4 className="font-bold text-foreground text-lg mb-2 line-clamp-1">
                                  {product.nome}
                                </h4>
                                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                                  {product.descricao}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <span className="font-bold text-foreground text-lg">
                                      R$ {product.preco.toFixed(2)}
                                    </span>
                                    <div className="text-sm text-muted-foreground">
                                      📍 {product.restaurant_details?.nome_fantasia}
                                    </div>
                                  </div>
                                  <Button size="sm" className="rounded-full">
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 m-3 lg:m-4">
                            {product.imagem_url ? (
                              <img
                                src={product.imagem_url}
                                alt={product.nome}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                <span className="text-muted-foreground text-xs text-center">Foto do Prato</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.restaurants.length === 0 && searchResults.products.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-xl mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-muted-foreground mb-1">
                    Não encontramos nada para "<span className="font-medium">{searchTerm}</span>"
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Tente usar termos diferentes ou verifique a ortografia
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults({ restaurants: [], products: [] });
                    }}
                  >
                    Limpar busca
                  </Button>
                </div>
              </div>
            )}
        </div>
      )}
      </div>
    </div>
  );
};

export default ClientSearch;
