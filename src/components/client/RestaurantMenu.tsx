
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, Clock, Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import { OrderCheckout } from '@/components/client/OrderCheckout';

interface RestaurantMenuProps {
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  imagem_url?: string;
  calorias?: number;
  vegetariano?: boolean;
  product_categories?: {
    nome: string;
  };
}

export const RestaurantMenu = ({ restaurantId, restaurantName, onClose }: RestaurantMenuProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ['restaurant-menu', restaurantId, searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_products')
        .select(`
          *,
          product_categories (nome)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('disponivel', true)
        .order('nome');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Product[];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['restaurant-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products?.find(p => p.id === productId);
      return total + (product?.preco || 0) * quantity;
    }, 0);
  };

  const handleProceedToOrder = () => {
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de fazer o pedido.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    setShowCheckout(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowCheckout(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <OrderCheckout
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        cart={cart}
        products={products || []}
        onClose={() => {
          setShowCheckout(false);
          setCart({});
          onClose();
        }}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{restaurantName}</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Busca e Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas as Categorias</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Produtos */}
          <div className="grid gap-4 mb-6">
            {products?.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{product.nome}</h3>
                        {product.vegetariano && (
                          <Badge variant="outline" className="text-green-600">🌱</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.descricao}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-600 font-bold">
                            R$ {product.preco.toFixed(2)}
                          </span>
                          
                          {product.calorias && (
                            <span className="text-gray-500">
                              {product.calorias} cal
                            </span>
                          )}
                          
                          {product.product_categories && (
                            <Badge variant="outline">
                              {product.product_categories.nome}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {cart[product.id] > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(product.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {cart[product.id] > 0 && (
                            <span className="font-semibold">{cart[product.id]}</span>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => addToCart(product.id)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {product.imagem_url && (
                      <div className="ml-4">
                        <img
                          src={product.imagem_url}
                          alt={product.nome}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}

          {/* Carrinho */}
          {Object.keys(cart).length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Total: R$ {getCartTotal().toFixed(2)}
                </span>
                <Button
                  onClick={handleProceedToOrder}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Fazer Pedido
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};
