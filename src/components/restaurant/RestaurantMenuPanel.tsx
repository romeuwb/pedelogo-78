import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EnhancedProductForm } from './EnhancedProductForm';
import { ProductCategoryManager } from './ProductCategoryManager';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  Eye,
  EyeOff,
  Utensils,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RestaurantMenuPanelProps {
  restaurantId: string;
}

// Add type for product with nutritional information
interface ProductWithNutritionalInfo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  favorito: boolean;
  calorias?: number;
  imagem_url?: string;
  informacoes_nutricionais?: any;
  vegetariano?: boolean;
  product_categories?: {
    nome: string;
  };
  [key: string]: any;
}

export const RestaurantMenuPanel = ({ restaurantId }: RestaurantMenuPanelProps) => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithNutritionalInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithNutritionalInfo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['restaurant-products', restaurantId, searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_products')
        .select(`
          *,
          product_categories (nome)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ProductWithNutritionalInfo[];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories', restaurantId],
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

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('restaurant_products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
      toast({
        title: "Produto excluído",
        description: "O produto foi removido do cardápio.",
      });
    }
  });

  const toggleProductVisibility = useMutation({
    mutationFn: async ({ productId, visible }: { productId: string; visible: boolean }) => {
      const { error } = await supabase
        .from('restaurant_products')
        .update({ disponivel: visible })
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
    }
  });

  const handleEditProduct = (product: ProductWithNutritionalInfo) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };

  const handleToggleVisibility = (productId: string, currentVisibility: boolean) => {
    toggleProductVisibility.mutate({ 
      productId, 
      visible: !currentVisibility 
    });
  };

  const handleViewDetails = (product: ProductWithNutritionalInfo) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const filteredProducts = products || [];

  if (isLoading) {
    return <div className="p-6">Carregando cardápio...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento do Cardápio</h2>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                   <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                     <div className="flex-1">
                       <div className="flex items-center space-x-2 mb-2">
                         <h3 className="font-semibold text-base lg:text-lg">{product.nome}</h3>
                        {!product.disponivel && (
                          <Badge variant="secondary">Indisponível</Badge>
                        )}
                        {product.favorito && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            ⭐ Favorito
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.descricao}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          R$ {product.preco.toFixed(2)}
                        </span>
                        
                        {product.product_categories && (
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {product.product_categories.nome}
                          </span>
                        )}
                        
                        {product.calorias && (
                          <span className="flex items-center">
                            <Utensils className="h-4 w-4 mr-1" />
                            {product.calorias} cal
                          </span>
                        )}
                      </div>

                      {/* Informações Nutricionais */}
                      {product.informacoes_nutricionais && Object.keys(product.informacoes_nutricionais).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium mb-1">Informações Nutricionais:</div>
                          <div className="text-gray-600">
                            {typeof product.informacoes_nutricionais === 'string' 
                              ? product.informacoes_nutricionais 
                              : JSON.stringify(product.informacoes_nutricionais)
                            }
                          </div>
                        </div>
                      )}
                    </div>

                     {product.imagem_url && (
                       <div className="w-20 h-20 lg:ml-4 flex-shrink-0">
                         <img
                           src={product.imagem_url}
                           alt={product.nome}
                           className="w-full h-full object-cover rounded-lg"
                         />
                       </div>
                     )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(product)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleVisibility(product.id, product.disponivel)}
                    >
                      {product.disponivel ? (
                        <EyeOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      {product.disponivel ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{product.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece adicionando produtos ao seu cardápio.'}
              </p>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <ProductCategoryManager restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>

      {/* Modal do Formulário de Produto */}
      {showProductForm && (
        <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <EnhancedProductForm
              restaurantId={restaurantId}
              productId={editingProduct?.id}
              onSave={(data) => {
                // Handle save logic here
                setShowProductForm(false);
                setEditingProduct(null);
                queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
              }}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
              isLoading={false}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Detalhes do Produto */}
      {showProductDetails && selectedProduct && (
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProduct.imagem_url && (
                <img
                  src={selectedProduct.imagem_url}
                  alt={selectedProduct.nome}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Descrição</h4>
                <p className="text-gray-600">{selectedProduct.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Preço</h4>
                  <p className="text-lg text-green-600 font-bold">
                    R$ {selectedProduct.preco.toFixed(2)}
                  </p>
                </div>
                
                {selectedProduct.calorias && (
                  <div>
                    <h4 className="font-semibold mb-1">Calorias</h4>
                    <p>{selectedProduct.calorias} cal</p>
                  </div>
                )}
              </div>

              {selectedProduct.informacoes_nutricionais && Object.keys(selectedProduct.informacoes_nutricionais).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Informações Nutricionais</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {typeof selectedProduct.informacoes_nutricionais === 'string' 
                      ? selectedProduct.informacoes_nutricionais 
                      : JSON.stringify(selectedProduct.informacoes_nutricionais, null, 2)
                    }
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <Badge variant={selectedProduct.disponivel ? "default" : "secondary"}>
                  {selectedProduct.disponivel ? 'Disponível' : 'Indisponível'}
                </Badge>
                
                {selectedProduct.favorito && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    ⭐ Produto em Destaque
                  </Badge>
                )}
                
                {selectedProduct.vegetariano && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    🌱 Vegetariano
                  </Badge>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
