
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('client_favorites')
        .select(`
          *,
          restaurant_details(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('client_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Favoritos</h1>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Você ainda não tem restaurantes favoritos</p>
            <p className="text-sm mt-2">
              Toque no ❤️ nos restaurantes que você gosta para salvá-los aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => {
            const restaurant = favorite.restaurant_details;
            return (
              <Card key={favorite.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {restaurant.nome_fantasia || restaurant.razao_social}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {restaurant.descricao}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Heart size={20} className="fill-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientFavorites;
