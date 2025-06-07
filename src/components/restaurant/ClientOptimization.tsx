
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Heart, Gift, Calendar, Send, TrendingUp, Star } from 'lucide-react';

interface ClientOptimizationProps {
  restaurantId: string;
}

interface ClientPreference {
  id: string;
  client_id: string;
  product_id: string;
  preference_score: number;
  order_frequency: number;
  last_ordered: string;
  client_name?: string;
  product_name?: string;
}

interface MarketingCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  target_criteria: any;
  message_template: string;
  active: boolean;
  auto_send: boolean;
  send_date: string;
}

export const ClientOptimization = ({ restaurantId }: ClientOptimizationProps) => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<string>('birthday');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const [sendDate, setSendDate] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar preferências dos clientes
  const { data: clientPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['client-preferences', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_product_preferences')
        .select(`
          *,
          profiles!client_id(nome),
          restaurant_products!product_id(nome)
        `)
        .eq('restaurant_id', restaurantId)
        .order('preference_score', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Buscar campanhas de marketing
  const { data: campaigns } = useQuery({
    queryKey: ['marketing-campaigns', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_marketing_campaigns')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketingCampaign[];
    }
  });

  // Buscar clientes que fazem aniversário hoje
  const { data: birthdayClients } = useQuery({
    queryKey: ['birthday-clients', restaurantId],
    queryFn: async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('data_nascimento', 'is', null)
        .filter('data_nascimento', 'like', `%-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}%`);
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar histórico de consumo
  const { data: consumptionHistory } = useQuery({
    queryKey: ['consumption-history', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_consumption_history')
        .select(`
          *,
          profiles!client_id(nome),
          restaurant_products!product_id(nome)
        `)
        .eq('restaurant_id', restaurantId)
        .order('order_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  // Criar campanha de marketing
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const targetCriteria = getCampaignCriteria(campaignType);
      
      const { data, error } = await supabase
        .from('client_marketing_campaigns')
        .insert({
          restaurant_id: restaurantId,
          campaign_name: campaignName,
          campaign_type: campaignType,
          target_criteria: targetCriteria,
          message_template: messageTemplate,
          active: true,
          auto_send: autoSend,
          send_date: sendDate || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha criada",
        description: "Campanha de marketing criada com sucesso!"
      });
      setCampaignName('');
      setMessageTemplate('');
    }
  });

  // Enviar campanha
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      // Aqui você implementaria o envio real das mensagens
      // Por exemplo, via email ou SMS
      
      const { error } = await supabase
        .from('client_campaign_history')
        .insert({
          campaign_id: campaignId,
          client_id: 'example-client-id', // Substituir pela lógica real
          message_sent: messageTemplate,
          sent_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Campanha enviada",
        description: "Mensagens enviadas com sucesso!"
      });
    }
  });

  const getCampaignCriteria = (type: string) => {
    switch (type) {
      case 'birthday':
        return { birth_month: new Date().getMonth() + 1, birth_day: new Date().getDate() };
      case 'inactive_client':
        return { days_since_last_order: 30 };
      case 'frequent_buyer':
        return { min_orders_count: 10 };
      case 'product_recommendation':
        return { recommendation_based_on: 'purchase_history' };
      default:
        return {};
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      birthday: 'Aniversário',
      inactive_client: 'Cliente Inativo',
      frequent_buyer: 'Comprador Frequente',
      product_recommendation: 'Recomendação de Produto'
    };
    return labels[type] || type;
  };

  const getDefaultMessage = (type: string) => {
    const messages: Record<string, string> = {
      birthday: 'Feliz aniversário! 🎉 Ganhe 20% de desconto em qualquer pedido hoje. Use o cupom: ANIVERSARIO20',
      inactive_client: 'Sentimos sua falta! 😊 Volte e ganhe 15% de desconto no seu próximo pedido. Cupom: VOLTEI15',
      frequent_buyer: 'Obrigado por ser um cliente especial! 🌟 Aproveite 25% de desconto. Cupom: VIP25',
      product_recommendation: 'Que tal experimentar algo novo? 🍕 Recomendamos nossos pratos mais populares com 10% de desconto!'
    };
    return messages[type] || '';
  };

  useEffect(() => {
    if (campaignType) {
      setMessageTemplate(getDefaultMessage(campaignType));
    }
  }, [campaignType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Otimização de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
              <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
              <TabsTrigger value="birthday">Aniversariantes</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Produtos Mais Preferidos por Cliente
                </h3>
                
                {preferencesLoading ? (
                  <p>Carregando preferências...</p>
                ) : clientPreferences?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma preferência registrada ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {clientPreferences?.slice(0, 10).map((pref) => (
                      <Card key={pref.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pref.profiles?.nome || 'Cliente'}</p>
                            <p className="text-sm text-gray-600">
                              Produto favorito: {pref.restaurant_products?.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pediu {pref.order_frequency} vezes
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-semibold">
                                {(pref.preference_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Último pedido: {new Date(pref.last_ordered).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Criar Nova Campanha</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nome da Campanha
                        </label>
                        <Input
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="Ex: Promoção de Aniversário"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tipo de Campanha
                        </label>
                        <Select value={campaignType} onValueChange={setCampaignType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="birthday">Aniversário</SelectItem>
                            <SelectItem value="inactive_client">Cliente Inativo</SelectItem>
                            <SelectItem value="frequent_buyer">Comprador Frequente</SelectItem>
                            <SelectItem value="product_recommendation">Recomendação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mensagem da Campanha
                      </label>
                      <Textarea
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        placeholder="Digite a mensagem que será enviada aos clientes"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={autoSend}
                          onCheckedChange={setAutoSend}
                        />
                        <label className="text-sm font-medium">
                          Envio Automático
                        </label>
                      </div>
                      
                      {!autoSend && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Data de Envio
                          </label>
                          <Input
                            type="date"
                            value={sendDate}
                            onChange={(e) => setSendDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => createCampaignMutation.mutate({})}
                      disabled={!campaignName || !messageTemplate || createCampaignMutation.isPending}
                      className="w-full"
                    >
                      {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
                    </Button>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Campanhas Existentes</h3>
                  {campaigns?.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma campanha criada ainda
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {campaigns?.map((campaign) => (
                        <Card key={campaign.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{campaign.campaign_name}</h4>
                              <p className="text-sm text-gray-600">
                                {getCampaignTypeLabel(campaign.campaign_type)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                                {campaign.message_template}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={campaign.active ? "default" : "secondary"}>
                                {campaign.active ? "Ativa" : "Inativa"}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                disabled={sendCampaignMutation.isPending}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="birthday" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Aniversariantes de Hoje ({birthdayClients?.length || 0})
                </h3>
                
                {birthdayClients?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum aniversariante hoje
                  </p>
                ) : (
                  <div className="space-y-3">
                    {birthdayClients?.map((client) => (
                      <Card key={client.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{client.nome}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <p className="text-xs text-gray-500">
                              Aniversário: {client.data_nascimento}
                            </p>
                          </div>
                          <div>
                            <Button size="sm">
                              <Gift className="h-4 w-4 mr-1" />
                              Enviar Parabéns
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Análises de Consumo
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-center">Total de Clientes</h4>
                    <p className="text-2xl font-bold text-center text-blue-600">
                      {clientPreferences?.length || 0}
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium text-center">Campanhas Ativas</h4>
                    <p className="text-2xl font-bold text-center text-green-600">
                      {campaigns?.filter(c => c.active).length || 0}
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium text-center">Aniversariantes</h4>
                    <p className="text-2xl font-bold text-center text-purple-600">
                      {birthdayClients?.length || 0}
                    </p>
                  </Card>
                </div>

                {consumptionHistory && consumptionHistory.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Histórico Recente de Consumo</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {consumptionHistory.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded text-sm">
                          <div>
                            <p className="font-medium">{item.profiles?.nome}</p>
                            <p className="text-gray-600">{item.restaurant_products?.nome}</p>
                          </div>
                          <div className="text-right">
                            <p>Qtd: {item.quantity}</p>
                            <p className="text-green-600">R$ {item.total_spent}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
