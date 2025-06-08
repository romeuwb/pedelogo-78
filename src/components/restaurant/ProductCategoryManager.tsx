
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface ProductCategoryManagerProps {
  restaurantId: string;
}

interface Category {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  posicao?: number;
  ativo: boolean;
  restaurant_id: string;
}

export const ProductCategoryManager = ({ restaurantId }: ProductCategoryManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    icone: '',
    cor: '#6b7280'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['product-categories', restaurantId],
    queryFn: async () => {
      console.log('Buscando categorias para restaurant_id:', restaurantId);
      
      if (!restaurantId) {
        console.warn('RestaurantId não fornecido');
        return [];
      }

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('posicao', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }
      
      console.log('Categorias encontradas:', data);
      return data as Category[];
    },
    enabled: !!restaurantId
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      console.log('Salvando categoria:', categoryData);
      console.log('Restaurant ID:', restaurantId);
      
      if (editingCategory) {
        const { error } = await supabase
          .from('product_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) {
          console.error('Erro ao atualizar categoria:', error);
          throw error;
        }
      } else {
        // Garantir que o restaurant_id está sendo incluído
        const insertData = {
          ...categoryData,
          restaurant_id: restaurantId,
          posicao: categories?.length || 0,
          ativo: true
        };
        
        console.log('Dados para inserção:', insertData);
        
        const { data, error } = await supabase
          .from('product_categories')
          .insert([insertData])
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao criar categoria:', error);
          console.error('Detalhes do erro:', error.details);
          console.error('Código do erro:', error.code);
          throw error;
        }
        
        console.log('Categoria criada:', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: editingCategory ? "Categoria atualizada" : "Categoria criada",
        description: "Categoria salva com sucesso.",
      });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao salvar categoria",
        description: error.message || "Erro desconhecido ao salvar categoria",
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
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
        description: "A categoria foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      icone: '',
      cor: '#6b7280'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      descricao: category.descricao || '',
      icone: category.icone || '',
      cor: category.cor || '#6b7280'
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da categoria.",
        variant: "destructive"
      });
      return;
    }

    saveCategoryMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600">
        Erro ao carregar categorias: {error.message}
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['product-categories'] })}
          className="ml-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Categorias de Produtos</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Categoria *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Pratos Principais"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da categoria"
                />
              </div>
              
              <div>
                <Label htmlFor="icone">Ícone (Emoji)</Label>
                <Input
                  id="icone"
                  value={formData.icone}
                  onChange={(e) => setFormData(prev => ({ ...prev, icone: e.target.value }))}
                  placeholder="🍕"
                />
              </div>
              
              <div>
                <Label htmlFor="cor">Cor</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                    placeholder="#6b7280"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={saveCategoryMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveCategoryMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {saveCategoryMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {category.icone && (
                    <span className="text-2xl">{category.icone}</span>
                  )}
                  <div>
                    <h4 className="font-semibold">{category.nome}</h4>
                    {category.descricao && (
                      <p className="text-sm text-gray-600">{category.descricao}</p>
                    )}
                  </div>
                  {category.cor && (
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.cor }}
                    />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
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
                          Tem certeza que deseja excluir a categoria "{category.nome}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {categories?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando categorias para organizar seus produtos.
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
