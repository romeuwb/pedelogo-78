
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

interface ProductCategoryManagerProps {
  restaurantId: string;
}

export const ProductCategoryManager = ({ restaurantId }: ProductCategoryManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
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

  const saveCategory = useMutation({
    mutationFn: async (categoryData: any) => {
      const data = {
        ...categoryData,
        restaurant_id: restaurantId
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('product_categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_categories')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: editingCategory ? "Categoria atualizada" : "Categoria criada",
        description: "Categoria salva com sucesso.",
      });
      setIsAdding(false);
      setEditingCategory(null);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: "Categoria excluída",
        description: "Categoria removida com sucesso.",
      });
    }
  });

  const CategoryForm = ({ category, onClose }: { category?: any; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      nome: category?.nome || '',
      descricao: category?.descricao || '',
      icone: category?.icone || '',
      cor: category?.cor || '#6b7280',
      posicao: category?.posicao || 0,
      ativo: category?.ativo !== false
    });

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Categoria</label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Ex: Entradas, Pratos Principais"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição da categoria (opcional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ícone (Emoji)</label>
            <Input
              value={formData.icone}
              onChange={(e) => setFormData({...formData, icone: e.target.value})}
              placeholder="🍕"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <Input
              type="color"
              value={formData.cor}
              onChange={(e) => setFormData({...formData, cor: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Posição</label>
          <Input
            type="number"
            value={formData.posicao}
            onChange={(e) => setFormData({...formData, posicao: parseInt(e.target.value)})}
            placeholder="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
          />
          <span>Categoria ativa</span>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={() => saveCategory.mutate(formData)}
            disabled={saveCategory.isPending}
          >
            {saveCategory.isPending ? 'Salvando...' : (category ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4">Carregando categorias...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Categorias</CardTitle>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Categoria</DialogTitle>
              </DialogHeader>
              <CategoryForm onClose={() => setIsAdding(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories?.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  {category.icone && <span className="text-lg">{category.icone}</span>}
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.cor }}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{category.nome}</h4>
                  {category.descricao && (
                    <p className="text-sm text-gray-600">{category.descricao}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  category.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.ativo ? 'Ativa' : 'Inativa'}
                </span>
                
                <Dialog 
                  open={editingCategory?.id === category.id} 
                  onOpenChange={(open) => !open && setEditingCategory(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Categoria</DialogTitle>
                    </DialogHeader>
                    <CategoryForm 
                      category={editingCategory} 
                      onClose={() => setEditingCategory(null)} 
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteCategory.mutate(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
