
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, Clock, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';

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
  const { toast } = useToast();
  const { addToCart, cart, updateQuantity } = useCart();

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

  const handleAddToCart = async (product: Product) => {
    await addToCart(restaurantId, restaurantName, product);
  };

  const getProductQuantity = (productId: string) => {
    if (!cart || cart.restaurantId !== restaurantId) return 0;
    const item = cart.items.find(item => item.productId === productId);
    return item?.quantidade || 0;
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    await updateQuantity(productId, newQuantity);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{restaurantName}</h2>
          <Button variant="outline" onClick={onClose}>
            Fechar
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
                        {getProductQuantity(product.id) > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(product.id, getProductQuantity(product.id) - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {getProductQuantity(product.id) > 0 && (
                          <span className="font-semibold">{getProductQuantity(product.id)}</span>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
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

        {/* Note about cart */}
        {cart && cart.restaurantId === restaurantId && cart.items.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-center text-sm text-gray-600">
              <p>Itens foram adicionados ao seu carrinho</p>
              <p>Use o ícone do carrinho para finalizar o pedido</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
