
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  Search,
  Package,
  DollarSign,
  Settings
} from 'lucide-react';
import { ProductCategoryManager } from './ProductCategoryManager';
import { EnhancedProductForm } from './EnhancedProductForm';

interface RestaurantMenuPanelProps {
  restaurantId: string;
}

export const RestaurantMenuPanel = ({ restaurantId }: RestaurantMenuPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['restaurant-products', restaurantId, searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_products')
        .select(`
          *,
          category:product_categories(nome, cor)
        `)
        .eq('restaurant_id', restaurantId)
        .order('nome');

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('posicao');

      if (error) throw error;
      return data || [];
    }
  });

  const toggleProductAvailability = useMutation({
    mutationFn: async ({ productId, available }: { productId: string; available: boolean }) => {
      const { error } = await supabase
        .from('restaurant_products')
        .update({ disponivel: available })
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
      toast({
        title: "Produto atualizado",
        description: "Disponibilidade do produto foi atualizada.",
      });
    }
  });

  const saveProduct = useMutation({
    mutationFn: async (data: any) => {
      const productData = {
        ...data,
        restaurant_id: restaurantId,
        preco: parseFloat(data.preco)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('restaurant_products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurant_products')
          .insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: editingProduct ? "Produto atualizado" : "Produto criado",
        description: `Produto ${editingProduct ? 'atualizado' : 'criado'} com sucesso.`,
      });
      setIsAddingProduct(false);
      setEditingProduct(null);
    }
  });

  const ProductCard = ({ product }: { product: any }) => (
    <Card key={product.id}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{product.nome}</h3>
              {product.category && (
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: product.category.cor }}
                >
                  {product.category.nome}
                </Badge>
              )}
              {product.favorito && (
                <Badge variant="outline">⭐ Popular</Badge>
              )}
            </div>
            
            {product.descricao && (
              <p className="text-gray-600 mb-2">{product.descricao}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                R$ {product.preco?.toFixed(2)}
              </span>
              {product.tempo_preparo && (
                <span>{product.tempo_preparo} min</span>
              )}
              {product.peso_volume && (
                <span>{product.peso_volume}</span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm">
              {product.vegetariano && <Badge variant="outline">🌱 Vegetariano</Badge>}
              {product.vegano && <Badge variant="outline">🌿 Vegano</Badge>}
              {product.livre_gluten && <Badge variant="outline">🚫 Sem Glúten</Badge>}
              {product.livre_lactose && <Badge variant="outline">🥛 Sem Lactose</Badge>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={product.disponivel ? "default" : "secondary"}
              onClick={() => toggleProductAvailability.mutate({
                productId: product.id,
                available: !product.disponivel
              })}
            >
              {product.disponivel ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Disponível
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Indisponível
                </>
              )}
            </Button>

            <Dialog 
              open={editingProduct?.id === product.id} 
              onOpenChange={(open) => !open && setEditingProduct(null)}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Produto</DialogTitle>
                </DialogHeader>
                <EnhancedProductForm
                  productId={editingProduct?.id}
                  onSave={(data) => saveProduct.mutate(data)}
                  onCancel={() => setEditingProduct(null)}
                  isLoading={saveProduct.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="p-6">Carregando cardápio...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Cardápio</h2>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <EnhancedProductForm
              onSave={(data) => saveProduct.mutate(data)}
              onCancel={() => setIsAddingProduct(false)}
              isLoading={saveProduct.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  className="px-3 py-2 border rounded-md md:w-48"
                >
                  <option value="all">Todas as categorias</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de produtos */}
          <div className="grid gap-4">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!products?.length && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500">
                Comece adicionando produtos ao seu cardápio.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <ProductCategoryManager restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações do Cardápio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Funcionalidades Avançadas</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>Combos:</strong> Crie ofertas especiais combinando produtos</li>
                  <li>• <strong>Importação em massa:</strong> Importe produtos via planilha CSV</li>
                  <li>• <strong>Horários especiais:</strong> Configure disponibilidade por horário</li>
                  <li>• <strong>Preços dinâmicos:</strong> Ajuste preços automaticamente</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Importar Produtos
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  Configurar Combos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
