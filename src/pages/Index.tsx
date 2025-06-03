
import { useState } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import RestaurantList from '@/components/RestaurantList';
import UserTypeModal from '@/components/UserTypeModal';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  
  const { user, profile, signOut } = useAuth();

  const handleOpenUserModal = () => {
    if (user) {
      signOut();
    } else {
      setIsUserTypeModalOpen(true);
    }
  };

  const handleUserTypeSelect = (userType: string) => {
    setSelectedUserType(userType);
    setIsUserTypeModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    setSelectedUserType(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header onOpenUserModal={handleOpenUserModal} />
      
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-delivery bg-clip-text text-transparent">
              Sabor na porta
            </span>
            <br />
            <span className="text-gray-800">de casa! 🍕</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra os melhores restaurantes da sua região e peça sua comida favorita 
            com entrega rápida e segura.
          </p>
          
          {/* Search Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar restaurantes ou pratos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-0 focus:ring-2 focus:ring-delivery-orange"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Onde você está?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-12 text-lg border-0 focus:ring-2 focus:ring-delivery-orange"
                />
              </div>
              <Button className="h-12 px-8 gradient-delivery text-white hover:opacity-90 transition-opacity">
                Buscar
              </Button>
            </div>
          </div>

          {user && profile && (
            <div className="mb-8 p-4 bg-white/80 rounded-xl max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                Olá, <span className="font-semibold text-delivery-orange">{profile.nome}</span>!
              </p>
              <p className="text-xs text-gray-500">
                Tipo: {profile.tipo} • {profile.email}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Categorias Populares
          </h2>
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'Todos os Restaurantes' : 'Restaurantes Filtrados'}
            </h2>
            <p className="text-gray-500">
              Encontre o que você está procurando
            </p>
          </div>
          
          <RestaurantList selectedCategory={selectedCategory} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="text-3xl font-bold gradient-delivery bg-clip-text text-transparent mb-4">
            🍕 PedeLogo
          </div>
          <p className="text-gray-400 mb-8">
            Conectando você aos melhores sabores da sua cidade
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Para Clientes</h3>
              <ul className="space-y-1 text-gray-400">
                <li>Como funciona</li>
                <li>Entrega grátis</li>
                <li>Promoções</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Para Restaurantes</h3>
              <ul className="space-y-1 text-gray-400">
                <li>Seja parceiro</li>
                <li>Portal do restaurante</li>
                <li>Suporte</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Para Entregadores</h3>
              <ul className="space-y-1 text-gray-400">
                <li>Trabalhe conosco</li>
                <li>App do entregador</li>
                <li>Ganhos</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserTypeModal 
        isOpen={isUserTypeModalOpen} 
        onClose={() => setIsUserTypeModalOpen(false)}
        onSelectUserType={handleUserTypeSelect}
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleLoginModalClose}
        userType={selectedUserType}
      />
    </div>
  );
};

export default Index;
