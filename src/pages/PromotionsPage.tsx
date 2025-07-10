
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Percent, Calendar, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const PromotionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('restaurant_promotions')
        .select(`
          id,
          nome,
          descricao,
          tipo_promocao,
          valor_desconto,
          valor_minimo_pedido,
          data_inicio,
          data_fim,
          ativo,
          restaurant_id,
          restaurant_details!inner(
            nome_fantasia,
            categoria,
            logo_url
          )
        `)
        .eq('ativo', true)
        .gte('data_fim', new Date().toISOString());

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('data_inicio', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['active-coupons', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('ativo', true)
        .gte('data_fim', new Date().toISOString());

      if (searchTerm) {
        query = query.ilike('codigo', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('data_inicio', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const formatDiscount = (tipo: string, valor: number) => {
    if (tipo === 'percentual') {
      return `${valor}% OFF`;
    } else {
      return `R$ ${valor.toFixed(2)} OFF`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading || couponsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando promoções...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promoções</h1>
          <p className="text-gray-600">Aproveite as melhores ofertas e cupons de desconto</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar promoções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Global Coupons Section */}
        {coupons && coupons.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Percent className="h-6 w-6 mr-2 text-orange-500" />
              Cupons Globais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        {coupon.codigo}
                      </span>
                      <Badge variant="secondary">
                        {formatDiscount(coupon.tipo_desconto, coupon.valor_desconto)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coupon.valor_minimo_pedido > 0 && (
                        <p className="text-sm text-gray-600">
                          Pedido mínimo: R$ {coupon.valor_minimo_pedido.toFixed(2)}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Válido até {formatDate(coupon.data_fim)}
                        </span>
                      </div>
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={() => navigator.clipboard.writeText(coupon.codigo)}
                      >
                        Copiar Código
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Promotions Section */}
        {promotions && promotions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Store className="h-6 w-6 mr-2 text-orange-500" />
              Promoções dos Restaurantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 rounded-t-lg flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {formatDiscount(promotion.tipo_promocao, promotion.valor_desconto)}
                      </div>
                      <div className="text-sm opacity-90">
                        {promotion.nome}
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {promotion.restaurant_details.nome_fantasia}
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {promotion.restaurant_details.categoria}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {promotion.descricao && (
                        <p className="text-sm text-gray-600">
                          {promotion.descricao}
                        </p>
                      )}
                      
                      {promotion.valor_minimo_pedido > 0 && (
                        <p className="text-sm text-gray-600">
                          Pedido mínimo: R$ {promotion.valor_minimo_pedido.toFixed(2)}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(promotion.data_inicio)} - {formatDate(promotion.data_fim)}
                        </span>
                      </div>
                      
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Ver Restaurante
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!promotions || promotions.length === 0) && (!coupons || coupons.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma promoção encontrada</h3>
            <p className="text-gray-600">
              Não há promoções ativas no momento. Volte em breve!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;
