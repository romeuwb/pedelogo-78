
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, Settings, Users, Package, Bell } from "lucide-react";
import Header from "@/components/Header";
import RestaurantCard from "@/components/RestaurantCard";
import CategoryFilter from "@/components/CategoryFilter";
import UserTypeModal from "@/components/UserTypeModal";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);

  const mockRestaurants = [
    {
      id: 1,
      name: "Burger Palace",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop",
      rating: 4.8,
      deliveryTime: "20-30 min",
      deliveryFee: 3.50,
      category: "fast-food",
      cuisine: "Hambúrgueres",
      isPromoted: true
    },
    {
      id: 2,
      name: "Pizza Suprema",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop",
      rating: 4.6,
      deliveryTime: "25-35 min",
      deliveryFee: 4.00,
      category: "pizza",
      cuisine: "Italiana"
    },
    {
      id: 3,
      name: "Sushi Zen",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
      rating: 4.9,
      deliveryTime: "35-45 min",
      deliveryFee: 5.50,
      category: "japanese",
      cuisine: "Japonesa"
    },
    {
      id: 4,
      name: "Café Brasileiro",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
      rating: 4.7,
      deliveryTime: "15-25 min",
      deliveryFee: 2.50,
      category: "coffee",
      cuisine: "Cafeteria"
    },
    {
      id: 5,
      name: "Taco Loco",
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=300&h=200&fit=crop",
      rating: 4.5,
      deliveryTime: "20-30 min",
      deliveryFee: 3.00,
      category: "mexican",
      cuisine: "Mexicana"
    },
    {
      id: 6,
      name: "Veggie Garden",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
      rating: 4.4,
      deliveryTime: "25-35 min",
      deliveryFee: 4.50,
      category: "healthy",
      cuisine: "Saudável"
    }
  ];

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || restaurant.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header onOpenUserModal={() => setShowUserModal(true)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-float">
              PedeLogo
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              A melhor experiência de delivery da sua cidade.<br />
              <span className="text-delivery-orange font-semibold">Comida deliciosa</span> entregue com carinho na sua porta.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="flex items-center bg-white rounded-full shadow-delivery border-2 border-orange-100 overflow-hidden">
                <div className="pl-6">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <Input
                  placeholder="Busque por restaurantes ou tipos de comida..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent text-lg py-6 px-4 focus:ring-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-delivery-orange mb-2">1000+</div>
                <div className="text-gray-600">Restaurantes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-delivery-orange mb-2">24/7</div>
                <div className="text-gray-600">Disponível</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-delivery-orange mb-2">15min</div>
                <div className="text-gray-600">Entrega Média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-delivery-orange mb-2">50K+</div>
                <div className="text-gray-600">Clientes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedCategory === "all" ? "Todos os Restaurantes" : "Restaurantes Filtrados"}
            </h2>
            <Badge variant="secondary" className="text-sm">
              {filteredRestaurants.length} encontrados
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum restaurante encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar sua busca ou filtros
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Por que escolher o PedeLogo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos a melhor experiência de delivery com tecnologia avançada e atendimento excepcional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-delivery transition-all duration-300 border-2 hover:border-orange-200">
              <CardContent className="pt-6">
                <Clock className="h-16 w-16 text-delivery-orange mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Entrega Rápida</h3>
                <p className="text-gray-600">
                  Entregas em tempo recorde com rastreamento em tempo real
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-delivery transition-all duration-300 border-2 hover:border-orange-200">
              <CardContent className="pt-6">
                <Users className="h-16 w-16 text-delivery-orange mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Restaurantes Verificados</h3>
                <p className="text-gray-600">
                  Apenas restaurantes de qualidade comprovada em nossa plataforma
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-delivery transition-all duration-300 border-2 hover:border-orange-200">
              <CardContent className="pt-6">
                <Settings className="h-16 w-16 text-delivery-orange mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Suporte 24/7</h3>
                <p className="text-gray-600">
                  Atendimento sempre disponível para resolver qualquer problema
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <UserTypeModal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)} 
      />
    </div>
  );
};

export default Index;
