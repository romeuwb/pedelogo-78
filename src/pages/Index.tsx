
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Star, Clock } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import RestaurantList from '@/components/RestaurantList';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/restaurantes?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
    } else {
      navigate('/restaurantes');
    }
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar restaurantes, pratos ou categorias..."
                    className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus:ring-0 text-foreground placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="md:border-l md:border-border md:pl-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Sua localização"
                      className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus:ring-0 text-foreground placeholder:text-muted-foreground"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="py-4 px-8 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>
            </div>
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
