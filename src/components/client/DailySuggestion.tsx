
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SuggestionProduct {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url?: string;
  calorias?: number;
  restaurant_id: string;
  restaurant_details?: {
    nome_fantasia: string;
    logo_url?: string;
    tempo_entrega_min: number;
    taxa_entrega: number;
  };
  preference_score: number;
}

export const DailySuggestion = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['daily-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar preferências do cliente
      const { data: preferences, error: prefError } = await supabase
        .from('client_product_preferences')
        .select(`
          *,
          restaurant_products!product_id (
            *,
            restaurant_details!restaurant_id (
              nome_fantasia,
              logo_url,
              tempo_entrega_min,
              taxa_entrega
            )
          )
        `)
        .eq('client_id', user.id)
        .order('preference_score', { ascending: false })
        .limit(3);

      if (prefError) throw prefError;

      // Se não há preferências, buscar produtos populares
      if (!preferences || preferences.length === 0) {
        const { data: popularProducts, error: popError } = await supabase
          .from('restaurant_products')
          .select(`
            *,
            restaurant_details!restaurant_id (
              nome_fantasia,
              logo_url,
              tempo_entrega_min,
              taxa_entrega
            )
          `)
          .eq('disponivel', true)
          .eq('favorito', true)
          .limit(3);

        if (popError) throw popError;

        return popularProducts?.map(product => ({
          ...product,
          preference_score: 0.5
        })) || [];
      }

      return preferences.map(pref => ({
        ...pref.restaurant_products,
        restaurant_details: pref.restaurant_products.restaurant_details,
        preference_score: pref.preference_score
      }));
    },
    enabled: !!user?.id
  });

  const handleOrderSuggestion = async (productId: string, restaurantId: string) => {
    if (!user?.id) return;

    try {
      // Registrar interesse na sugestão
      await supabase.from('client_consumption_history').insert({
        client_id: user.id,
        restaurant_id: restaurantId,
        product_id: productId,
        quantity: 1,
        total_spent: 0, // Será atualizado quando o pedido for finalizado
        order_date: new Date().toISOString()
      });

      // Atualizar score de preferência
      const { error: updateError } = await supabase
        .from('client_product_preferences')
        .upsert({
          client_id: user.id,
          restaurant_id: restaurantId,
          product_id: productId,
          preference_score: 0.8,
          order_frequency: 1,
          last_ordered: new Date().toISOString()
        });

      if (updateError) throw updateError;

      toast({
        title: "Sugestão Aceita!",
        description: "Produto adicionado às suas preferências.",
      });
    } catch (error) {
      console.error('Erro ao processar sugestão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a sugestão.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Faça login para ver suas sugestões personalizadas</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            Sugestão do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
          Sugestão do Dia
        </CardTitle>
        <p className="text-sm text-gray-600">
          Baseado nas suas preferências e histórico de pedidos
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions?.map((product) => (
          <Card key={product.id} className="border-l-4 border-l-yellow-400">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{product.nome}</h4>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {Math.round(product.preference_score * 100)}% match
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-bold text-green-600">
                          R$ {product.preco.toFixed(2)}
                        </span>
                        {product.calorias && (
                          <span className="text-gray-500">{product.calorias} cal</span>
                        )}
                      </div>
                      
                      {product.restaurant_details && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{product.restaurant_details.nome_fantasia}</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{product.restaurant_details.tempo_entrega_min} min</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOrderSuggestion(product.id, product.restaurant_id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Pedir
                    </Button>
                  </div>
                </div>

                {product.imagem_url && (
                  <div className="ml-4">
                    <img
                      src={product.imagem_url}
                      alt={product.nome}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!suggestions || suggestions.length === 0) && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">Nenhuma sugestão disponível</p>
            <p className="text-sm text-gray-400">
              Faça alguns pedidos para receber sugestões personalizadas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
