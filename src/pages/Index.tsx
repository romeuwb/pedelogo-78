import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Star, Clock } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);

  const restaurants = [
    {
      id: 1,
      name: "Pizza Express",
      rating: 4.5,
      deliveryTime: "25-35 min",
      category: "Pizza",
      image: "/placeholder.svg",
      promo: "Frete Grátis"
    },
    {
      id: 2,
      name: "Burger House",
      rating: 4.2,
      deliveryTime: "30-40 min",
      category: "Hambúrguer",
      image: "/placeholder.svg",
      promo: "20% OFF"
    },
    {
      id: 3,
      name: "Sushi Master",
      rating: 4.8,
      deliveryTime: "40-50 min",
      category: "Japonês",
      image: "/placeholder.svg",
      promo: null
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            A melhor comida
            <br />
            <span className="text-yellow-300">de casa!</span> 🍕
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubra os melhores restaurantes da sua região e peça sua comida 
            favorita com entrega rápida e segura.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar restaurantes ou pratos..."
                  className="pl-10 h-12 text-gray-900"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="São Paulo, SP"
                  className="pl-10 h-12 text-gray-900"
                />
              </div>
              <Button className="h-12 px-8 bg-orange-500 hover:bg-orange-600">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Categorias Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {['Pizza', 'Hambúrguer', 'Japonês', 'Italiana', 'Mexicana', 'Brasileira'].map((category) => (
              <Card key={category} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍕</span>
                  </div>
                  <h3 className="font-semibold">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Restaurantes em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {restaurant.promo && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      {restaurant.promo}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 mb-3">{restaurant.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já descobriram a praticidade 
            de pedir comida pelo nosso app.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => setShowLogin(true)}
              className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3"
            >
              Criar Conta
            </Button>
            <Button 
              onClick={() => setShowLogin(true)}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500 px-8 py-3"
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
