
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Star, Clock, Navigation, Loader2 } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import RestaurantList from '@/components/RestaurantList';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSearch } from '@/hooks/useSearch';

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  
  // Geolocalização (não busca automaticamente se já estiver salva)
  const { 
    latitude, 
    longitude, 
    city,
    isLoading: isLoadingLocation, 
    getCurrentLocation,
    hasLocation
  } = useGeolocation({ autoGetLocation: false });

  // Busca dinâmica
  const { 
    searchTerm, 
    setSearchTerm, 
    results, 
    isLoading: isSearching, 
    hasResults 
  } = useSearch({ debounceMs: 300, minLength: 2 });

  // Busca localização automaticamente apenas se não houver uma salva
  useEffect(() => {
    if (!hasLocation && !isLoadingLocation) {
      getCurrentLocation();
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    }
    
    // Adiciona coordenadas se disponíveis
    if (hasLocation) {
      params.set('lat', latitude!.toString());
      params.set('lng', longitude!.toString());
      if (city) {
        params.set('location', city);
      }
    }
    
    const queryString = params.toString();
    navigate(`/restaurantes${queryString ? '?' + queryString : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/restaurantes?categoria=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Simplified like iFood/Uber Eats */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Peça comida que você ama
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Descubra restaurantes próximos e receba suas refeições favoritas em casa
            </p>
          </div>
          
          {/* Search Bar - Modern Style */}
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar restaurantes, pratos ou categorias..."
                    className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus:ring-0 text-foreground placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                {/* Location indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 rounded-xl">
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Obtendo localização...</span>
                    </>
                  ) : hasLocation ? (
                    <>
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground font-medium truncate max-w-32">
                        {city || "Localização detectada"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Navigation 
                        className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                        onClick={getCurrentLocation}
                      />
                      <span 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={getCurrentLocation}
                      >
                        Ativar localização
                      </span>
                    </>
                  )}
                </div>
                
                <Button 
                  className="py-4 px-8 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {hasResults && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border z-50 max-h-80 overflow-y-auto">
                {results.restaurants.length > 0 && (
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">RESTAURANTES</h4>
                    {results.restaurants.slice(0, 3).map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSearchTerm(restaurant.nome_fantasia);
                          handleSearch();
                        }}
                      >
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {restaurant.logo_url ? (
                            <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-xl">🍽️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{restaurant.nome_fantasia}</p>
                          <p className="text-sm text-muted-foreground truncate">{restaurant.categoria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {results.products.length > 0 && (
                  <div className="p-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">PRATOS</h4>
                    {results.products.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSearchTerm(product.nome);
                          handleSearch();
                        }}
                      >
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.imagem_url ? (
                            <img src={product.imagem_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-xl">🍽️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{product.nome}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.restaurant_details?.nome_fantasia} • R$ {product.preco.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Explorar por categoria</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[
              { name: 'Pizza', emoji: '🍕' },
              { name: 'Hambúrguer', emoji: '🍔' },
              { name: 'Japonês', emoji: '🍱' },
              { name: 'Italiana', emoji: '🍝' },
              { name: 'Mexicana', emoji: '🌮' },
              { name: 'Brasileira', emoji: '🍖' },
              { name: 'Doces', emoji: '🍰' },
              { name: 'Bebidas', emoji: '🥤' }
            ].map((category) => (
              <div
                key={category.name} 
                className="flex flex-col items-center p-4 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors group"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="w-14 h-14 bg-muted/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <span className="text-2xl">{category.emoji}</span>
                </div>
                <span className="text-sm font-medium text-foreground text-center leading-tight">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Restaurantes próximos</h2>
          <RestaurantList selectedCategory={selectedCategory} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Seja nosso parceiro</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Conecte-se com milhares de clientes e faça crescer seu negócio 
            com nossa plataforma de delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Button 
              onClick={() => setShowLogin(true)}
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 px-8 py-4 font-semibold text-lg w-full sm:w-auto rounded-xl shadow-lg"
            >
              Criar Conta
            </Button>
            <Button 
              onClick={() => setShowLogin(true)}
              size="lg"
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-foreground px-8 py-4 font-semibold text-lg w-full sm:w-auto bg-transparent rounded-xl"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Index;
