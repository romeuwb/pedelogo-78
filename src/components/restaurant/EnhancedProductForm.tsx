import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProductImageManager } from './ProductImageManager';
import { ProductOptionsManager } from './ProductOptionsManager';
import { GlobalProductSearch } from './GlobalProductSearch';
import { Search } from 'lucide-react';

interface EnhancedProductFormProps {
  product?: any;
  categories: any[];
  onSave: (productData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EnhancedProductForm = ({
  product,
  categories,
  onSave,
  onCancel,
  isLoading = false
}: EnhancedProductFormProps) => {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    preco: product?.preco || '',
    preco_custo: product?.preco_custo || '',
    category_id: product?.category_id || '',
    disponivel: product?.disponivel !== false,
    vegetariano: product?.vegetariano || false,
    vegano: product?.vegano || false,
    livre_gluten: product?.livre_gluten || false,
    livre_lactose: product?.livre_lactose || false,
    favorito: product?.favorito || false,
    tempo_preparo: product?.tempo_preparo || '',
    calorias: product?.calorias || '',
    ingredientes: product?.ingredientes || [],
    codigo_barras: product?.codigo_barras || '',
    unidade: product?.unidade || 'Unidade',
    // Novos campos
    images: product?.images || [],
    opcoes: product?.opcoes || [],
    peso_volume: product?.peso_volume || '',
    informacoes_nutricionais: product?.informacoes_nutricionais || {},
    alergenos: product?.alergenos || [],
    estoque_quantidade: product?.estoque_quantidade || '',
    estoque_minimo: product?.estoque_minimo || '',
    controlar_estoque: product?.controlar_estoque || false,
    admin_product_id: product?.admin_product_id || null,
    is_imported_from_admin: product?.is_imported_from_admin || false
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');

  const handleGlobalProductSelect = (globalProduct: any) => {
    setFormData({
      ...formData,
      ...globalProduct
    });
    setShowGlobalSearch(false);
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredientes: [...formData.ingredientes, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredientes: formData.ingredientes.filter((_, i) => i !== index)
    });
  };

  const addAllergen = () => {
    if (newAllergen.trim()) {
      setFormData({
        ...formData,
        alergenos: [...formData.alergenos, newAllergen.trim()]
      });
      setNewAllergen('');
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      alergenos: formData.alergenos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    const dataToSave = {
      ...formData,
      preco: parseFloat(formData.preco) || 0,
      preco_custo: parseFloat(formData.preco_custo) || 0,
      tempo_preparo: parseInt(formData.tempo_preparo) || null,
      calorias: parseInt(formData.calorias) || null,
      estoque_quantidade: formData.controlar_estoque ? parseInt(formData.estoque_quantidade) || 0 : null,
      estoque_minimo: formData.controlar_estoque ? parseInt(formData.estoque_minimo) || 0 : null
    };
    onSave(dataToSave);
  };

  if (showGlobalSearch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Importar Produto Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalProductSearch
            onSelectProduct={handleGlobalProductSelect}
            onClose={() => setShowGlobalSearch(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {product ? 'Editar Produto' : 'Adicionar Produto'}
        </h2>
        {!product && (
          <Button
            variant="outline"
            onClick={() => setShowGlobalSearch(true)}
            className="flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Importar Produto Global
          </Button>
        )}
      </div>

      {formData.is_imported_from_admin && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Produto importado do catálogo global.</strong> Você pode ajustar preços e detalhes específicos do seu restaurante.
          </p>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="options">Opções</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome claro e descritivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição Detalhada</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ingredientes, temperos, acompanhamentos, informações alergênicas..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço de Venda</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço de Custo</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({...formData, preco_custo: e.target.value})}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tempo de Preparo (min)</label>
                  <Input
                    type="number"
                    value={formData.tempo_preparo}
                    onChange={(e) => setFormData({...formData, tempo_preparo: e.target.value})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Peso/Volume</label>
                  <Input
                    value={formData.peso_volume}
                    onChange={(e) => setFormData({...formData, peso_volume: e.target.value})}
                    placeholder="Ex: 300g, 500ml"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade</label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Unidade">Unidade</option>
                    <option value="Porção">Porção</option>
                    <option value="Kg">Kg</option>
                    <option value="Gramas">Gramas</option>
                    <option value="Litros">Litros</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Código de Barras</label>
                <Input
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                  placeholder="Código de barras (opcional)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.disponivel}
                    onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
                  />
                  <span>Disponível</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.favorito}
                    onChange={(e) => setFormData({...formData, favorito: e.target.checked})}
                  />
                  <span>Destacar/Popular</span>
                </label>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Imagens</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImageManager
                productId={product?.id}
                images={formData.images}
                onImagesChange={(images) => setFormData({...formData, images})}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>Opções e Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductOptionsManager
                options={formData.opcoes}
                onOptionsChange={(opcoes) => setFormData({...formData, opcoes})}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>Informações Nutricionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calorias</label>
                <Input
                  type="number"
                  value={formData.calorias}
                  onChange={(e) => setFormData({...formData, calorias: e.target.value})}
                  placeholder="Quantidade de calorias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ingredientes</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Adicionar ingrediente"
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <Button onClick={addIngredient}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredientes.map((ingredient, index) => (
                    <Badge key={index} variant="secondary">
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alérgenos</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    placeholder="Ex: Contém glúten, nozes"
                    onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
                  />
                  <Button onClick={addAllergen}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.alergenos.map((allergen, index) => (
                    <Badge key={index} variant="destructive">
                      {allergen}
                      <button
                        onClick={() => removeAllergen(index)}
                        className="ml-2 text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.controlar_estoque}
                  onChange={(e) => setFormData({...formData, controlar_estoque: e.target.checked})}
                />
                <span>Controlar estoque deste produto</span>
              </label>

              {formData.controlar_estoque && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantidade em Estoque</label>
                    <Input
                      type="number"
                      value={formData.estoque_quantidade}
                      onChange={(e) => setFormData({...formData, estoque_quantidade: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                    <Input
                      type="number"
                      value={formData.estoque_minimo}
                      onChange={(e) => setFormData({...formData, estoque_minimo: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como funciona o controle de estoque:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• O produto ficará indisponível automaticamente quando o estoque chegar a zero</li>
                  <li>• Você receberá alertas quando o estoque estiver baixo</li>
                  <li>• O estoque será decrementado automaticamente a cada pedido</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Salvando...' : (product ? 'Atualizar Produto' : 'Criar Produto')}
        </Button>
      </div>
    </div>
  );
};
