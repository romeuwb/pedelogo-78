
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GlobalProductSearchProps {
  onSelectProduct: (product: any) => void;
  onClose: () => void;
}

export const GlobalProductSearch = ({ onSelectProduct, onClose }: GlobalProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: globalProducts, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('admin_products')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleSelectProduct = (product: any) => {
    const adaptedProduct = {
      nome: product.nome,
      descricao: product.descricao || '',
      categoria: product.categoria,
      codigo_barras: product.codigo_barras,
      vegetariano: product.vegetariano || false,
      vegano: product.vegano || false,
      livre_gluten: product.livre_gluten || false,
      livre_lactose: product.livre_lactose || false,
      tempo_preparo: product.tempo_preparo || '',
      calorias: product.calorias || '',
      ingredientes: product.ingredientes || [],
      imagem_url: product.imagem_url || '',
      admin_product_id: product.id,
      is_imported_from_admin: true,
      // Deixar campos vazios para o restaurante preencher
      preco: '',
      preco_custo: '',
      disponivel: true,
      favorito: false
    };

    onSelectProduct(adaptedProduct);
    toast({
      title: "Produto importado",
      description: `${product.nome} foi importado com sucesso. Defina o preço e outros detalhes.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos globais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Buscando produtos...</p>
        </div>
      )}

      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {globalProducts?.map((product) => (
          <Card key={product.id} className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{product.nome}</h4>
                    <Badge variant="secondary">{product.categoria}</Badge>
                  </div>
                  
                  {product.descricao && (
                    <p className="text-sm text-gray-600 mb-2">{product.descricao}</p>
                  )}
                  
                  <div className="flex space-x-1">
                    {product.vegetariano && <Badge variant="outline" className="text-xs">🌱 Vegetariano</Badge>}
                    {product.vegano && <Badge variant="outline" className="text-xs">🌿 Vegano</Badge>}
                    {product.livre_gluten && <Badge variant="outline" className="text-xs">🚫 Sem Glúten</Badge>}
                    {product.livre_lactose && <Badge variant="outline" className="text-xs">🥛 Sem Lactose</Badge>}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleSelectProduct(product)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Importar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && globalProducts?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto global disponível.'}
          </p>
        </div>
      )}
    </div>
  );
};
