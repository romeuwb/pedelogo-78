import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Star, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RestaurantMenu } from '@/components/client/RestaurantMenu';

const RestaurantsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Update search term when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('categoria') || '');
  }, [searchParams]);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants-page', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
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
          taxa_entrega,
          status_aprovacao,
          horario_funcionamento
        `)
        .eq('status_aprovacao', 'aprovado');

      // Search functionality
      if (searchTerm) {
        // Search in restaurants
        const restaurantResults = await supabase
          .from('restaurant_details')
          .select('id')
          .eq('status_aprovacao', 'aprovado')
          .or(`nome_fantasia.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);

        // Search in products
        const productResults = await supabase
          .from('restaurant_products')
          .select('restaurant_id')
          .eq('disponivel', true)
          .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);

        // Combine restaurant IDs from both searches with proper typing
        const restaurantIds = new Set<string>();
        restaurantResults.data?.forEach(r => restaurantIds.add(r.id));
        productResults.data?.forEach(p => restaurantIds.add(p.restaurant_id));

        if (restaurantIds.size > 0) {
          query = query.in('id', Array.from(restaurantIds));
        } else {
          // If no results found, return empty array
          return [];
        }
      }

      if (selectedCategory) {
        query = query.eq('categoria', selectedCategory);
      }

      const { data, error } = await query.order('nome_fantasia', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['restaurant-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('categoria')
        .eq('status_aprovacao', 'aprovado')
        .not('categoria', 'is', null);

      if (error) throw error;

      // Get unique categories
      const uniqueCategories = [...new Set(data.map(item => item.categoria))];
      return uniqueCategories.filter(Boolean);
    }
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('categoria', selectedCategory);
    navigate(`/restaurantes?${params.toString()}`);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
    setSelectedRestaurant(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando restaurantes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-orange-600">
              🍕 PedeLogo
            </Link>
            <nav className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-orange-600">Home</Link>
              <Link to="/restaurantes" className="text-orange-600 font-medium">Restaurantes</Link>
              <Link to="/promocoes" className="text-gray-600 hover:text-orange-600">Promoções</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurantes</h1>
          <p className="text-gray-600">Descubra os melhores restaurantes da sua região</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar restaurantes, pratos ou categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
              Buscar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? "default" : "outline"}
              onClick={() => setSelectedCategory('')}
              size="sm"
            >
              Todas as categorias
            </Button>
            {categories?.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants?.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                {restaurant.logo_url ? (
                  <img
                    src={restaurant.logo_url}
                    alt={restaurant.nome_fantasia}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{restaurant.nome_fantasia}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{restaurant.categoria}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {restaurant.descricao && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {restaurant.descricao}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {restaurant.cidade}, {restaurant.estado}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {restaurant.tempo_entrega_min || 30}-{(restaurant.tempo_entrega_min || 30) + 15} min
                      </span>
                    </div>
                    
                    {restaurant.taxa_entrega && (
                      <span className="text-sm font-medium text-green-600">
                        Taxa: R$ {restaurant.taxa_entrega.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                  Ver Cardápio
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {restaurants && restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum restaurante encontrado</h3>
            <p className="text-gray-600">
              {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Tente ajustar os filtros ou buscar por outros termos.'}
            </p>
          </div>
        )}
      </div>

      {/* Restaurant Menu Modal */}
      {showMenu && selectedRestaurant && (
        <RestaurantMenu
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.nome_fantasia}
          onClose={closeMenu}
        />
      )}
    </div>
  );
};

export default RestaurantsPage;
