import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, MapPin, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RestaurantMenu } from '@/components/client/RestaurantMenu';

interface Restaurant {
  id: string;
  nome_fantasia: string;
  categoria: string;
  descricao: string;
  taxa_entrega: number;
  tempo_entrega_min: number;
  logo_url: string;
  endereco: string;
  cidade: string;
  aceita_delivery: boolean;
  aceita_retirada: boolean;
}

interface RestaurantListProps {
  selectedCategory: string;
}

const RestaurantList = ({ selectedCategory }: RestaurantListProps) => {
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants', selectedCategory],
    queryFn: async () => {
      console.log('Buscando restaurantes...');
      
      try {
        // Teste de conectividade básica
        console.log('Testando conectividade com Supabase...');
        
        // Primeiro, teste simples para verificar se a tabela existe
        console.log('Fazendo query simples para testar conectividade...');
        const testQuery = await supabase.from('restaurant_details').select('count', { count: 'exact' });
        console.log('Resultado do teste de conectividade:', testQuery);
        
        if (testQuery.error) {
          console.error('Erro na query de teste:', testQuery.error);
          throw new Error(`Problema de conectividade: ${testQuery.error.message}`);
        }
        
        console.log('Conectividade OK. Executando query principal...');
        
        let query = supabase
          .from('restaurant_details')
          .select('*');

        // Remover filtros temporariamente para debug
        // .eq('status_aprovacao', 'aprovado')
        // .eq('aceita_delivery', true);

        if (selectedCategory !== 'all') {
          query = query.eq('categoria', selectedCategory);
        }

        console.log('Executando query principal...');
        const { data, error } = await query;
        
        if (error) {
          console.error('Erro detalhado ao buscar restaurantes:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('Restaurantes encontrados:', data?.length || 0);
        console.log('Dados dos restaurantes:', data);
        return data as Restaurant[];
      } catch (err) {
        console.error('Erro capturado no try/catch:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'fast-food': '🍔',
      'pizza': '🍕',
      'japanese': '🍱',
      'coffee': '☕',
      'mexican': '🌮',
      'healthy': '🥗',
      'dessert': '🍰',
      'brazilian': '🇧🇷'
    };
    return emojiMap[category] || '🍽️';
  };

  const handleViewMenu = (restaurant: Restaurant) => {
    console.log(`Abrindo cardápio do restaurante: ${restaurant.nome_fantasia} (ID: ${restaurant.id})`);
    setSelectedRestaurant(restaurant);
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
    setSelectedRestaurant(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro no componente RestaurantList:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Erro ao carregar restaurantes</p>
        <p className="text-gray-500 text-sm mt-2">
          {error?.message || 'Verifique sua conexão e tente novamente'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-orange-500 hover:bg-orange-600"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Nenhum restaurante encontrado
        </h3>
        <p className="text-gray-500">
          Tente selecionar uma categoria diferente ou volte mais tarde.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              {restaurant.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.nome_fantasia}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-6xl">
                  {getCategoryEmoji(restaurant.categoria)}
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  {getCategoryEmoji(restaurant.categoria)} {restaurant.categoria}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg group-hover:text-delivery-orange transition-colors">
                  {restaurant.nome_fantasia}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.5</span>
                </div>
              </div>
              
              {restaurant.descricao && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {restaurant.descricao}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.tempo_entrega_min} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Taxa: R$ {restaurant.taxa_entrega?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              
              {restaurant.endereco && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{restaurant.endereco}, {restaurant.cidade}</span>
                </div>
              )}
              
              <div className="flex space-x-2 mb-4">
                {restaurant.aceita_delivery && (
                  <Badge variant="outline" className="text-xs">
                    🚚 Delivery
                  </Badge>
                )}
                {restaurant.aceita_retirada && (
                  <Badge variant="outline" className="text-xs">
                    🏪 Retirada
                  </Badge>
                )}
              </div>
              
              <Button 
                className="w-full gradient-delivery text-white hover:opacity-90"
                onClick={() => handleViewMenu(restaurant)}
              >
                Ver Cardápio
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal do Cardápio */}
      {showMenu && selectedRestaurant && (
        <RestaurantMenu
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.nome_fantasia}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default RestaurantList;
