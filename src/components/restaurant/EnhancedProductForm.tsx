import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Save, Upload, Package, Sparkles, Search } from 'lucide-react';
import { GlobalProductSearch } from './GlobalProductSearch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnhancedProductFormProps {
  restaurantId: string;
  productId?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface ProductFormData {
  nome: string;
  descricao: string;
  preco: number;
  preco_custo: number;
  category_id: string;
  ingredientes: string[];
  imagem_url: string;
  codigo_barras: string;
  unidade: string;
  tempo_preparo: number;
  calorias: number;
  vegetariano: boolean;
  vegano: boolean;
  livre_gluten: boolean;
  livre_lactose: boolean;
  disponivel: boolean;
  ativo: boolean;
  favorito: boolean;
  informacoes_nutricionais: {
    proteinas?: number;
    carboidratos?: number;
    gorduras?: number;
    fibras?: number;
    sodio?: number;
  };
}

export const EnhancedProductForm = ({ restaurantId, productId, onSave, onCancel, isLoading }: EnhancedProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nome: '',
    descricao: '',
    preco: 0,
    preco_custo: 0,
    category_id: '',
    ingredientes: [],
    imagem_url: '',
    codigo_barras: '',
    unidade: 'Unidade',
    tempo_preparo: 0,
    calorias: 0,
    vegetariano: false,
    vegano: false,
    livre_gluten: false,
    livre_lactose: false,
    disponivel: true,
    ativo: true,
    favorito: false,
    informacoes_nutricionais: {}
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['product-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('ativo', true)
        .order('posicao');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar produto existente se editando
  const { data: existingProduct } = useQuery({
    queryKey: ['restaurant-product', productId],
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

  // Mutation para salvar produto
  const saveProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (productId) {
        const { data, error } = await supabase
          .from('restaurant_products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('restaurant_products')
          .insert({ ...productData, restaurant_id: restaurantId })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: productId ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['restaurant-products'] });
      onSave(data);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        nome: existingProduct.nome || '',
        descricao: existingProduct.descricao || '',
        preco: existingProduct.preco || 0,
        preco_custo: existingProduct.preco_custo || 0,
        category_id: existingProduct.category_id || '',
        ingredientes: existingProduct.ingredientes || [],
        imagem_url: existingProduct.imagem_url || '',
        codigo_barras: existingProduct.codigo_barras || '',
        unidade: existingProduct.unidade || 'Unidade',
        tempo_preparo: existingProduct.tempo_preparo || 0,
        calorias: existingProduct.calorias || 0,
        vegetariano: existingProduct.vegetariano || false,
        vegano: existingProduct.vegano || false,
        livre_gluten: existingProduct.livre_gluten || false,
        livre_lactose: existingProduct.livre_lactose || false,
        disponivel: existingProduct.disponivel !== false,
        ativo: existingProduct.ativo !== false,
        favorito: existingProduct.favorito || false,
        informacoes_nutricionais: (existingProduct as any).informacoes_nutricionais || {}
      });
      
      if (existingProduct.imagem_url) {
        setImagePreview(existingProduct.imagem_url);
      }
    }
  }, [existingProduct]);

  const handleGlobalProductSelect = (product: any) => {
    setFormData({
      ...formData,
      nome: product.nome,
      descricao: product.descricao || '',
      ingredientes: product.ingredientes || [],
      codigo_barras: product.codigo_barras || '',
      vegetariano: product.vegetariano || false,
      vegano: product.vegano || false,
      livre_gluten: product.livre_gluten || false,
      livre_lactose: product.livre_lactose || false,
      tempo_preparo: product.tempo_preparo || 0,
      calorias: product.calorias || 0,
      imagem_url: product.imagem_url || '',
      informacoes_nutricionais: product.informacoes_nutricionais || {}
    });
    
    if (product.imagem_url) {
      setImagePreview(product.imagem_url);
    }
    
    setShowGlobalSearch(false);
  };

  const generateDescriptionWithAI = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é necessário para gerar descrição.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      console.log('Iniciando geração de descrição para:', formData.nome);
      console.log('Dados do produto:', {
        nome: formData.nome,
        ingredientes: formData.ingredientes,
        categoria: categories?.find(c => c.id === formData.category_id)?.nome || '',
        informacoes_nutricionais: formData.informacoes_nutricionais
      });
      
      const { data, error } = await supabase.functions.invoke('generate-product-description', {
        body: {
          nome: formData.nome,
          ingredientes: formData.ingredientes,
          categoria: categories?.find(c => c.id === formData.category_id)?.nome || '',
          informacoes_nutricionais: formData.informacoes_nutricionais
        }
      });

      console.log('Resposta da função:', data, error);

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (data?.success && data?.description) {
        setFormData({
          ...formData,
          descricao: data.description
        });

        toast({
          title: "Sucesso!",
          description: `Descrição gerada com IA! (${data.metadata?.ingredientes_count || 0} ingredientes considerados)`,
        });
      } else {
        throw new Error(data?.error || 'Resposta inválida da função de geração');
      }
    } catch (error: any) {
      console.error('Erro ao gerar descrição:', error);
      
      let errorMessage = 'Erro desconhecido ao gerar descrição';
      
      if (error.message?.includes('OPENAI_API_KEY')) {
        errorMessage = 'Chave da API OpenAI não configurada. Contate o administrador.';
      } else if (error.message?.includes('Nome do produto')) {
        errorMessage = 'Nome do produto é obrigatório para gerar descrição.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao gerar descrição",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredientes.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredientes: [...formData.ingredientes, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData({
      ...formData,
      ingredientes: formData.ingredientes.filter(i => i !== ingredient)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.preco || formData.preco <= 0) {
      toast({
        title: "Erro",
        description: "Preço deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    let imageUrl = formData.imagem_url;
    
    // Upload de imagem se houver
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${restaurantId}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Erro no upload da imagem:', error);
        toast({
          title: "Aviso",
          description: "Erro no upload da imagem, produto será salvo sem imagem.",
          variant: "destructive"
        });
      }
    }

    const productData = {
      ...formData,
      imagem_url: imageUrl,
      preco: Number(formData.preco),
      preco_custo: Number(formData.preco_custo),
      tempo_preparo: Number(formData.tempo_preparo),
      calorias: Number(formData.calorias)
    };

    saveProductMutation.mutate(productData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {productId ? 'Editar Produto' : 'Novo Produto'}
          </div>
          <div className="flex gap-2">
            <Dialog open={showGlobalSearch} onOpenChange={setShowGlobalSearch}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Produtos Globais
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Produtos Globais</DialogTitle>
                </DialogHeader>
                <GlobalProductSearch
                  onSelectProduct={handleGlobalProductSelect}
                  onClose={() => setShowGlobalSearch(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome do Produto *
              </label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Pizza Margherita"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria *
              </label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger className={!formData.category_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria *" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.category_id && (
                <p className="text-sm text-red-500 mt-1">Categoria é obrigatória</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">
                Descrição
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescriptionWithAI}
                disabled={isGeneratingDescription || !formData.nome.trim()}
                className="flex items-center gap-2"
              >
                <Sparkles className={`h-4 w-4 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                {isGeneratingDescription ? 'Gerando...' : 'Gerar com IA'}
              </Button>
            </div>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o produto... (clique em 'Gerar com IA' para criar automaticamente)"
              rows={4}
              className={isGeneratingDescription ? 'opacity-50' : ''}
            />
            {!formData.nome.trim() && (
              <p className="text-sm text-gray-500 mt-1">
                Digite o nome do produto para usar a geração automática com IA
              </p>
            )}
            {isGeneratingDescription && (
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-spin" />
                Gerando descrição inteligente baseada no produto...
              </p>
            )}
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preço de Venda (R$) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preço de Custo (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_custo}
                onChange={(e) => setFormData({ ...formData, preco_custo: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Unidade
              </label>
              <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unidade">Unidade</SelectItem>
                  <SelectItem value="Kg">Quilograma</SelectItem>
                  <SelectItem value="g">Grama</SelectItem>
                  <SelectItem value="L">Litro</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                  <SelectItem value="Porção">Porção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações Nutricionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Nutricionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calorias</label>
                <Input
                  type="number"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proteínas (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.informacoes_nutricionais.proteinas || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    informacoes_nutricionais: { 
                      ...formData.informacoes_nutricionais, 
                      proteinas: parseFloat(e.target.value) || undefined 
                    }
                  })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carboidratos (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.informacoes_nutricionais.carboidratos || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    informacoes_nutricionais: { 
                      ...formData.informacoes_nutricionais, 
                      carboidratos: parseFloat(e.target.value) || undefined 
                    }
                  })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gorduras (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.informacoes_nutricionais.gorduras || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    informacoes_nutricionais: { 
                      ...formData.informacoes_nutricionais, 
                      gorduras: parseFloat(e.target.value) || undefined 
                    }
                  })}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ingredientes
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Digite um ingrediente"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient}>
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

          {/* Switches/Opções */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.vegetariano}
                onCheckedChange={(checked) => setFormData({ ...formData, vegetariano: checked })}
              />
              <label className="text-sm">Vegetariano</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.vegano}
                onCheckedChange={(checked) => setFormData({ ...formData, vegano: checked })}
              />
              <label className="text-sm">Vegano</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.livre_gluten}
                onCheckedChange={(checked) => setFormData({ ...formData, livre_gluten: checked })}
              />
              <label className="text-sm">Livre de Glúten</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.livre_lactose}
                onCheckedChange={(checked) => setFormData({ ...formData, livre_lactose: checked })}
              />
              <label className="text-sm">Livre de Lactose</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.disponivel}
                onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
              />
              <label className="text-sm">Disponível</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <label className="text-sm">Ativo</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.favorito}
                onCheckedChange={(checked) => setFormData({ ...formData, favorito: checked })}
              />
              <label className="text-sm">Produto em Destaque</label>
            </div>
          </div>

          {/* Tempo de Preparo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tempo de Preparo (minutos)
            </label>
            <Input
              type="number"
              value={formData.tempo_preparo}
              onChange={(e) => setFormData({ ...formData, tempo_preparo: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Imagem do Produto
            </label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={saveProductMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saveProductMutation.isPending ? 'Salvando...' : (productId ? 'Atualizar' : 'Criar')} Produto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
