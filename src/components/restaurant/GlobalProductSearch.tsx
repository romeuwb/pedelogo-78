
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';

interface GlobalProductSearchProps {
  onSelectProduct: (product: any) => void;
  onClose: () => void;
}

export const GlobalProductSearch = ({ onSelectProduct, onClose }: GlobalProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('admin_products')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleSelectProduct = (product: any) => {
    onSelectProduct(product);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar produtos globais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {products?.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.nome}</h4>
                    <p className="text-sm text-gray-600 mb-2">{product.descricao}</p>
                    
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge variant="outline">{product.categoria}</Badge>
                      {product.vegetariano && <Badge variant="outline" className="text-green-600">Vegetariano</Badge>}
                      {product.vegano && <Badge variant="outline" className="text-green-600">Vegano</Badge>}
                      {product.livre_gluten && <Badge variant="outline" className="text-blue-600">Sem Glúten</Badge>}
                      {product.livre_lactose && <Badge variant="outline" className="text-purple-600">Sem Lactose</Badge>}
                    </div>
                    
                    {product.ingredientes && product.ingredientes.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ingredientes: {product.ingredientes.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleSelectProduct(product)}
                    className="ml-4"
                  >
                    Usar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {products?.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
