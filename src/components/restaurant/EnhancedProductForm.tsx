
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedProductFormProps {
  restaurantId: string;
  productId?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const EnhancedProductForm = ({ 
  restaurantId, 
  productId, 
  onSave, 
  onCancel, 
  isLoading 
}: EnhancedProductFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    category_id: '',
    ingredientes: [] as string[],
    calorias: '',
    informacoes_nutricionais: {} as any,
    vegetariano: false,
    vegano: false,
    livre_gluten: false,
    livre_lactose: false,
    disponivel: true,
    favorito: false,
    tempo_preparo: '',
    imagem_url: '',
    ativo: true
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['product-categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('nome');
      
      if (error) {
        console.error('Erro ao carregar categorias:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!restaurantId
  });

  const { data: existingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        nome: existingProduct.nome || '',
        descricao: existingProduct.descricao || '',
        preco: existingProduct.preco?.toString() || '',
        category_id: existingProduct.category_id || '',
        ingredientes: existingProduct.ingredientes || [],
        calorias: existingProduct.calorias?.toString() || '',
        informacoes_nutricionais: existingProduct.informacoes_nutricionais || {},
        vegetariano: existingProduct.vegetariano || false,
        vegano: existingProduct.vegano || false,
        livre_gluten: existingProduct.livre_gluten || false,
        livre_lactose: existingProduct.livre_lactose || false,
        disponivel: existingProduct.disponivel !== false,
        favorito: existingProduct.favorito || false,
        tempo_preparo: existingProduct.tempo_preparo?.toString() || '',
        imagem_url: existingProduct.imagem_url || '',
        ativo: existingProduct.ativo !== false
      });
    }
  }, [existingProduct]);

  const saveProductMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!restaurantId) {
        throw new Error('Restaurant ID é obrigatório');
      }

      const productData = {
        ...data,
        restaurant_id: restaurantId,
        preco: parseFloat(data.preco),
        calorias: data.calorias ? parseInt(data.calorias) : null,
        tempo_preparo: data.tempo_preparo ? parseInt(data.tempo_preparo) : null
      };

      console.log('Dados do produto a serem salvos:', productData);

      if (productId) {
        const { error } = await supabase
          .from('restaurant_products')
          .update(productData)
          .eq('id', productId);
        if (error) {
          console.error('Erro ao atualizar produto:', error);
          throw error;
        }
      } else {
        const { data: newProduct, error } = await supabase
          .from('restaurant_products')
          .insert(productData)
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao criar produto:', error);
          throw error;
        }
        console.log('Produto criado:', newProduct);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
      toast({
        title: productId ? "Produto atualizado" : "Produto criado",
        description: "Produto salvo com sucesso.",
      });
      onSave(formData);
    },
    onError: (error: any) => {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const generateDescription = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do produto antes de gerar a descrição.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      console.log('Gerando descrição para:', formData.nome);
      
      const { data, error } = await supabase.functions.invoke('generate-product-description', {
        body: {
          productName: formData.nome,
          ingredients: formData.ingredientes,
          category: categories?.find(cat => cat.id === formData.category_id)?.nome || '',
          nutritionalInfo: formData.informacoes_nutricionais,
          calories: formData.calorias ? parseInt(formData.calorias) : 0,
          isVegetarian: formData.vegetariano,
          isVegan: formData.vegano,
          isGlutenFree: formData.livre_gluten,
          isLactoseFree: formData.livre_lactose
        }
      });

      console.log('Resposta da function:', data);

      if (error) {
        console.error('Erro da function:', error);
        throw new Error(error.message || 'Erro ao chamar a função');
      }

      if (data?.success && data?.description) {
        setFormData(prev => ({
          ...prev,
          descricao: data.description
        }));
        
        toast({
          title: "Descrição gerada!",
          description: "A descrição foi gerada com sucesso usando IA.",
        });
      } else {
        throw new Error(data?.error || 'Resposta inválida da IA');
      }
    } catch (error: any) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        title: "Erro ao gerar descrição",
        description: error.message || "Não foi possível gerar a descrição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredientes.includes(newIngredient.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredientes: [...prev.ingredientes, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter(ing => ing !== ingredient)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.preco || !formData.category_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço e categoria.",
        variant: "destructive",
      });
      return;
    }

    if (!restaurantId) {
      toast({
        title: "Erro de configuração",
        description: "ID do restaurante não encontrado.",
        variant: "destructive",
      });
      return;
    }

    saveProductMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Pizza Margherita"
              required
            />
          </div>

          <div>
            <Label htmlFor="category_id">Categoria *</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icone} {category.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preco">Preço *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="tempo_preparo">Tempo de Preparo (min)</Label>
            <Input
              id="tempo_preparo"
              type="number"
              min="0"
              value={formData.tempo_preparo}
              onChange={(e) => setFormData(prev => ({ ...prev, tempo_preparo: e.target.value }))}
              placeholder="30"
            />
          </div>

          <div>
            <Label htmlFor="calorias">Calorias</Label>
            <Input
              id="calorias"
              type="number"
              min="0"
              value={formData.calorias}
              onChange={(e) => setFormData(prev => ({ ...prev, calorias: e.target.value }))}
              placeholder="250"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGeneratingDescription || !formData.nome.trim()}
              >
                {isGeneratingDescription ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Gerar com IA
              </Button>
            </div>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição apetitosa do produto..."
              rows={4}
            />
          </div>

          <div>
            <Label>Ingredientes</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Digite um ingrediente"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ingredientes.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="imagem_url">URL da Imagem</Label>
            <Input
              id="imagem_url"
              value={formData.imagem_url}
              onChange={(e) => setFormData(prev => ({ ...prev, imagem_url: e.target.value }))}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vegetariano"
            checked={formData.vegetariano}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vegetariano: !!checked }))}
          />
          <Label htmlFor="vegetariano">Vegetariano</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="vegano"
            checked={formData.vegano}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vegano: !!checked }))}
          />
          <Label htmlFor="vegano">Vegano</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="livre_gluten"
            checked={formData.livre_gluten}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, livre_gluten: !!checked }))}
          />
          <Label htmlFor="livre_gluten">Sem Glúten</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="livre_lactose"
            checked={formData.livre_lactose}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, livre_lactose: !!checked }))}
          />
          <Label htmlFor="livre_lactose">Sem Lactose</Label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="disponivel"
            checked={formData.disponivel}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disponivel: !!checked }))}
          />
          <Label htmlFor="disponivel">Disponível</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="favorito"
            checked={formData.favorito}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, favorito: !!checked }))}
          />
          <Label htmlFor="favorito">Produto em Destaque</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: !!checked }))}
          />
          <Label htmlFor="ativo">Produto Ativo</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={saveProductMutation.isPending || isLoading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {saveProductMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            productId ? 'Atualizar Produto' : 'Criar Produto'
          )}
        </Button>
      </div>
    </form>
  );
};
