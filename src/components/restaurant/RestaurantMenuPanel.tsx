
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Filter,
  Package,
  DollarSign
} from 'lucide-react';

interface RestaurantMenuPanelProps {
  restaurantId: string;
}

export const RestaurantMenuPanel = ({ restaurantId }: RestaurantMenuPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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

  const ProductForm = ({ product, onClose }: { product?: any; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      nome: product?.nome || '',
      descricao: product?.descricao || '',
      preco: product?.preco || '',
      category_id: product?.category_id || '',
      disponivel: product?.disponivel !== false,
      vegetariano: product?.vegetariano || false,
      vegano: product?.vegano || false,
      livre_gluten: product?.livre_gluten || false,
      livre_lactose: product?.livre_lactose || false
    });

    const saveProduct = useMutation({
      mutationFn: async (data: any) => {
        const productData = {
          ...data,
          restaurant_id: restaurantId,
          preco: parseFloat(data.preco)
        };

        if (product) {
          const { error } = await supabase
            .from('restaurant_products')
            .update(productData)
            .eq('id', product.id);
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
        toast({
          title: product ? "Produto atualizado" : "Produto criado",
          description: `Produto ${product ? 'atualizado' : 'criado'} com sucesso.`,
        });
        onClose();
      }
    });

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Nome do produto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição do produto"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço</label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({...formData, preco: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Selecione uma categoria</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.vegetariano}
              onChange={(e) => setFormData({...formData, vegetariano: e.target.checked})}
            />
            <span>Vegetariano</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.vegano}
              onChange={(e) => setFormData({...formData, vegano: e.target.checked})}
            />
            <span>Vegano</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.livre_gluten}
              onChange={(e) => setFormData({...formData, livre_gluten: e.target.checked})}
            />
            <span>Sem Glúten</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.livre_lactose}
              onChange={(e) => setFormData({...formData, livre_lactose: e.target.checked})}
            />
            <span>Sem Lactose</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={() => saveProduct.mutate(formData)}
            disabled={saveProduct.isPending}
          >
            {saveProduct.isPending ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </div>
    );
  };

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <ProductForm onClose={() => setIsAddingProduct(false)} />
          </DialogContent>
        </Dialog>
      </div>

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
                  </div>
                  
                  {product.descricao && (
                    <p className="text-gray-600 mb-2">{product.descricao}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      R$ {product.preco?.toFixed(2)}
                    </span>
                    {product.vegetariano && <Badge variant="outline">Vegetariano</Badge>}
                    {product.vegano && <Badge variant="outline">Vegano</Badge>}
                    {product.livre_gluten && <Badge variant="outline">Sem Glúten</Badge>}
                    {product.livre_lactose && <Badge variant="outline">Sem Lactose</Badge>}
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Produto</DialogTitle>
                      </DialogHeader>
                      <ProductForm 
                        product={editingProduct} 
                        onClose={() => setEditingProduct(null)} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};
