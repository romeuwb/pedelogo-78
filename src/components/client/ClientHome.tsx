
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DailySuggestion } from './DailySuggestion';
import { RestaurantMenu } from './RestaurantMenu';

const ClientHome = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, [selectedCategory]);

  const fetchRestaurants = async () => {
    try {
      let query = supabase
        .from('restaurant_details')
        .select('*')
        .eq('status_aprovacao', 'aprovado')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('categoria', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('categoria')
        .eq('status_aprovacao', 'aprovado');

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(r => r.categoria) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    // Save search history
    if (user) {
      try {
        await supabase.from('client_search_history').insert({
          user_id: user.id,
          termo_pesquisa: searchTerm,
          categoria: selectedCategory || null
        });
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }

    // Enhanced search including products
    try {
      let restaurantQuery = supabase
        .from('restaurant_details')
        .select('*')
        .eq('status_aprovacao', 'aprovado');

      let productQuery = supabase
        .from('restaurant_products')
        .select(`
          *,
          restaurant_details!restaurant_id (*)
        `)
        .eq('disponivel', true);

      if (searchTerm) {
        restaurantQuery = restaurantQuery.or(
          `nome_fantasia.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
        productQuery = productQuery.or(
          `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
        );
      }

      const [restaurantResults, productResults] = await Promise.all([
        restaurantQuery,
        productQuery
      ]);

      if (restaurantResults.error) throw restaurantResults.error;
      if (productResults.error) throw productResults.error;

      // Combine results - restaurants that match directly or have matching products
      const matchingRestaurants = new Map();
      
      // Add directly matching restaurants
      restaurantResults.data?.forEach(restaurant => {
        matchingRestaurants.set(restaurant.id, restaurant);
      });

      // Add restaurants that have matching products
      productResults.data?.forEach(product => {
        if (product.restaurant_details) {
          matchingRestaurants.set(
            product.restaurant_details.id, 
            product.restaurant_details
          );
        }
      });

      setRestaurants(Array.from(matchingRestaurants.values()));
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMenu(true);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
          Olá! O que você gostaria de comer hoje?
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Buscar restaurantes ou pratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedCategory('')}
          >
            Todos
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Daily Suggestion */}
      {user && <DailySuggestion />}

      {/* Restaurants List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedCategory ? `Restaurantes - ${selectedCategory}` : 'Restaurantes próximos'}
        </h2>
        
        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Nenhum restaurante encontrado
            </CardContent>
          </Card>
        ) : (
          restaurants.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <CardContent className="p-4">
                 <div className="flex items-start gap-3 lg:gap-4">
                   <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-200 rounded-lg flex-shrink-0">
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
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {restaurant.nome_fantasia || restaurant.razao_social}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {restaurant.descricao}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs lg:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400" />
                        <span>4.5</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{restaurant.tempo_entrega_min || 30}-{(restaurant.tempo_entrega_min || 30) + 15} min</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>R$ {restaurant.taxa_entrega || 0} entrega</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Restaurant Menu Modal */}
      {showMenu && selectedRestaurant && (
        <RestaurantMenu
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.nome_fantasia || selectedRestaurant.razao_social}
          onClose={() => {
            setShowMenu(false);
            setSelectedRestaurant(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientHome;
