import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign, Truck, Mail, Map, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      console.log('Buscando configurações do sistema...');
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        throw error;
      }
      
      console.log('Configurações encontradas:', data);
      
      // Converter array para objeto para facilitar o uso
      const settingsObj: any = {};
      data?.forEach(setting => {
        try {
          settingsObj[setting.chave] = typeof setting.valor === 'string' 
            ? JSON.parse(setting.valor) 
            : setting.valor;
        } catch (e) {
          // Se não conseguir fazer parse, usar valor como string
          settingsObj[setting.chave] = setting.valor;
        }
      });
      
      setSettings(settingsObj);
      return settingsObj;
    }
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      console.log('Atualizando configuração:', key, value);
      
      // Validar se o valor não está vazio
      if (value === '' || value === null || value === undefined) {
        throw new Error('Valor não pode estar vazio');
      }
      
      const valorString = typeof value === 'string' ? value : JSON.stringify(value);
      
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          chave: key,
          valor: valorString,
          categoria: 'geral',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chave'
        });
      
      if (error) {
        console.error('Erro ao atualizar configuração:', error);
        throw error;
      }
      
      console.log('Configuração atualizada com sucesso');
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast({
        title: 'Sucesso',
        description: `Configuração ${key} atualizada com sucesso`
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar configuração',
        variant: 'destructive'
      });
    }
  });

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSetting = (key: string) => {
    const value = settings[key];
    if (!value && value !== 0) {
      toast({
        title: 'Erro',
        description: 'Valor não pode estar vazio',
        variant: 'destructive'
      });
      return;
    }
    updateSetting.mutate({ key, value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie configurações gerais da plataforma</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="maps" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Mapas</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Entrega</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="app_name">Nome do Aplicativo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="app_name"
                      placeholder="PedeLogo"
                      value={settings.app_name || ''}
                      onChange={(e) => handleUpdateSetting('app_name', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('app_name')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="app_logo">URL do Logo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="app_logo"
                      placeholder="https://exemplo.com/logo.png"
                      value={settings.app_logo || ''}
                      onChange={(e) => handleUpdateSetting('app_logo', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('app_logo')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="moeda">Moeda</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="moeda"
                      placeholder="BRL"
                      value={settings.moeda || ''}
                      onChange={(e) => handleUpdateSetting('moeda', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('moeda')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Mapas</CardTitle>
              <p className="text-sm text-gray-600">Configure APIs de mapas para funcionalidades de localização e roteamento</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="google_maps_api_key">Google Maps API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="google_maps_api_key"
                      type="password"
                      placeholder="Sua chave da API do Google Maps"
                      value={settings.google_maps_api_key || ''}
                      onChange={(e) => handleUpdateSetting('google_maps_api_key', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('google_maps_api_key')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mapbox_access_token">Mapbox Access Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="mapbox_access_token"
                      type="password"
                      placeholder="Seu token de acesso do Mapbox"
                      value={settings.mapbox_access_token || ''}
                      onChange={(e) => handleUpdateSetting('mapbox_access_token', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('mapbox_access_token')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="default_map_provider">Provedor de Mapas Padrão</Label>
                  <div className="flex space-x-2">
                    <select
                      id="default_map_provider"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={settings.default_map_provider || 'google'}
                      onChange={(e) => handleUpdateSetting('default_map_provider', e.target.value)}
                    >
                      <option value="google">Google Maps</option>
                      <option value="mapbox">Mapbox</option>
                    </select>
                    <Button 
                      onClick={() => saveSetting('default_map_provider')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3">Configurações para Usuários</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enable_restaurant_maps">Habilitar Mapas para Restaurantes</Label>
                      <div className="flex space-x-2">
                        <select
                          id="enable_restaurant_maps"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={settings.enable_restaurant_maps ? 'true' : 'false'}
                          onChange={(e) => handleUpdateSetting('enable_restaurant_maps', e.target.value === 'true')}
                        >
                          <option value="false">Desabilitado</option>
                          <option value="true">Habilitado</option>
                        </select>
                        <Button 
                          onClick={() => saveSetting('enable_restaurant_maps')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Permite que restaurantes configurem suas zonas de entrega
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="enable_delivery_maps">Habilitar Mapas para Entregadores</Label>
                      <div className="flex space-x-2">
                        <select
                          id="enable_delivery_maps"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={settings.enable_delivery_maps ? 'true' : 'false'}
                          onChange={(e) => handleUpdateSetting('enable_delivery_maps', e.target.value === 'true')}
                        >
                          <option value="false">Desabilitado</option>
                          <option value="true">Habilitado</option>
                        </select>
                        <Button 
                          onClick={() => saveSetting('enable_delivery_maps')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Permite que entregadores vejam suas rotas e configurem zonas de atuação
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="default_delivery_radius">Raio Padrão de Entrega (km)</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="default_delivery_radius"
                          type="number"
                          min="1"
                          max="50"
                          placeholder="10"
                          value={settings.default_delivery_radius || ''}
                          onChange={(e) => handleUpdateSetting('default_delivery_radius', parseInt(e.target.value))}
                        />
                        <Button 
                          onClick={() => saveSetting('default_delivery_radius')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="auto_assign_delivery">Atribuição Automática de Entregadores</Label>
                      <div className="flex space-x-2">
                        <select
                          id="auto_assign_delivery"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={settings.auto_assign_delivery ? 'true' : 'false'}
                          onChange={(e) => handleUpdateSetting('auto_assign_delivery', e.target.value === 'true')}
                        >
                          <option value="false">Desabilitado</option>
                          <option value="true">Habilitado</option>
                        </select>
                        <Button 
                          onClick={() => saveSetting('auto_assign_delivery')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Atribui automaticamente entregadores baseado na proximidade
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stripe_publishable_key"
                      placeholder="pk_test_..."
                      value={settings.stripe_publishable_key || ''}
                      onChange={(e) => handleUpdateSetting('stripe_publishable_key', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('stripe_publishable_key')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stripe_secret_key"
                      type="password"
                      placeholder="sk_test_..."
                      value={settings.stripe_secret_key || ''}
                      onChange={(e) => handleUpdateSetting('stripe_secret_key', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('stripe_secret_key')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxa_comissao_restaurante">Taxa de Comissão Restaurante (%)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="taxa_comissao_restaurante"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="15.00"
                      value={settings.taxa_comissao_restaurante ? (parseFloat(settings.taxa_comissao_restaurante) * 100).toFixed(2) : ''}
                      onChange={(e) => handleUpdateSetting('taxa_comissao_restaurante', parseFloat(e.target.value) / 100)}
                    />
                    <Button 
                      onClick={() => saveSetting('taxa_comissao_restaurante')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxa_entrega_base">Taxa Base de Entrega (R$)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="taxa_entrega_base"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      value={settings.taxa_entrega_base || ''}
                      onChange={(e) => handleUpdateSetting('taxa_entrega_base', parseFloat(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('taxa_entrega_base')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxa_entrega_por_km">Taxa por KM (R$)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="taxa_entrega_por_km"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1.50"
                      value={settings.taxa_entrega_por_km || ''}
                      onChange={(e) => handleUpdateSetting('taxa_entrega_por_km', parseFloat(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('taxa_entrega_por_km')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <p className="text-sm text-gray-600">Configure os provedores de pagamento</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Mercado Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mercadopago_public_key">Public Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="mercadopago_public_key"
                          placeholder="APP_USR-..."
                          value={settings.mercadopago_public_key || ''}
                          onChange={(e) => handleUpdateSetting('mercadopago_public_key', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('mercadopago_public_key')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mercadopago_access_token">Access Token</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="mercadopago_access_token"
                          type="password"
                          placeholder="APP_USR-..."
                          value={settings.mercadopago_access_token || ''}
                          onChange={(e) => handleUpdateSetting('mercadopago_access_token', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('mercadopago_access_token')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mercadopago_webhook_secret">Webhook Secret</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="mercadopago_webhook_secret"
                          type="password"
                          placeholder="Webhook secret key"
                          value={settings.mercadopago_webhook_secret || ''}
                          onChange={(e) => handleUpdateSetting('mercadopago_webhook_secret', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('mercadopago_webhook_secret')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mercadopago_environment">Ambiente</Label>
                      <div className="flex space-x-2">
                        <select
                          id="mercadopago_environment"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={settings.mercadopago_environment || 'sandbox'}
                          onChange={(e) => handleUpdateSetting('mercadopago_environment', e.target.value)}
                        >
                          <option value="sandbox">Sandbox (Teste)</option>
                          <option value="production">Produção</option>
                        </select>
                        <Button 
                          onClick={() => saveSetting('mercadopago_environment')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Stripe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="stripe_publishable_key"
                          placeholder="pk_test_..."
                          value={settings.stripe_publishable_key || ''}
                          onChange={(e) => handleUpdateSetting('stripe_publishable_key', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('stripe_publishable_key')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="stripe_secret_key"
                          type="password"
                          placeholder="sk_test_..."
                          value={settings.stripe_secret_key || ''}
                          onChange={(e) => handleUpdateSetting('stripe_secret_key', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('stripe_secret_key')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">PIX</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pix_enabled">Habilitar PIX</Label>
                      <div className="flex space-x-2">
                        <select
                          id="pix_enabled"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={settings.pix_enabled ? 'true' : 'false'}
                          onChange={(e) => handleUpdateSetting('pix_enabled', e.target.value === 'true')}
                        >
                          <option value="false">Desabilitado</option>
                          <option value="true">Habilitado</option>
                        </select>
                        <Button 
                          onClick={() => saveSetting('pix_enabled')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pix_recipient_key">Chave PIX Recebedor</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="pix_recipient_key"
                          placeholder="Chave PIX da empresa"
                          value={settings.pix_recipient_key || ''}
                          onChange={(e) => handleUpdateSetting('pix_recipient_key', e.target.value)}
                        />
                        <Button 
                          onClick={() => saveSetting('pix_recipient_key')}
                          disabled={updateSetting.isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="distancia_maxima_entrega">Distância Máxima de Entrega (km)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="distancia_maxima_entrega"
                      type="number"
                      min="1"
                      placeholder="20"
                      value={settings.distancia_maxima_entrega || ''}
                      onChange={(e) => handleUpdateSetting('distancia_maxima_entrega', parseInt(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('distancia_maxima_entrega')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tempo_maximo_preparo">Tempo Máximo de Preparo (min)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tempo_maximo_preparo"
                      type="number"
                      min="5"
                      placeholder="60"
                      value={settings.tempo_maximo_preparo || ''}
                      onChange={(e) => handleUpdateSetting('tempo_maximo_preparo', parseInt(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('tempo_maximo_preparo')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="horario_pico_inicio">Horário de Pico - Início</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="horario_pico_inicio"
                      type="time"
                      value={settings.horario_pico_inicio || ''}
                      onChange={(e) => handleUpdateSetting('horario_pico_inicio', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('horario_pico_inicio')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="horario_pico_fim">Horário de Pico - Fim</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="horario_pico_fim"
                      type="time"
                      value={settings.horario_pico_fim || ''}
                      onChange={(e) => handleUpdateSetting('horario_pico_fim', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('horario_pico_fim')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxa_pico_multiplier">Multiplicador Taxa Horário de Pico</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="taxa_pico_multiplier"
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="1.5"
                      value={settings.taxa_pico_multiplier || ''}
                      onChange={(e) => handleUpdateSetting('taxa_pico_multiplier', parseFloat(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('taxa_pico_multiplier')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="aprovacao_automatica_entregadores">Aprovação Automática de Entregadores</Label>
                  <div className="flex space-x-2">
                    <select
                      id="aprovacao_automatica_entregadores"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={settings.aprovacao_automatica_entregadores ? 'true' : 'false'}
                      onChange={(e) => handleUpdateSetting('aprovacao_automatica_entregadores', e.target.value === 'true')}
                    >
                      <option value="false">Desabilitado</option>
                      <option value="true">Habilitado</option>
                    </select>
                    <Button 
                      onClick={() => saveSetting('aprovacao_automatica_entregadores')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Aprova automaticamente entregadores que completarem o cadastro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="email_from">E-mail Remetente</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="email_from"
                      type="email"
                      placeholder="noreply@pedelogo.com"
                      value={settings.email_from || ''}
                      onChange={(e) => handleUpdateSetting('email_from', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('email_from')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="smtp_host"
                      placeholder="smtp.exemplo.com"
                      value={settings.smtp_host || ''}
                      onChange={(e) => handleUpdateSetting('smtp_host', e.target.value)}
                    />
                    <Button 
                      onClick={() => saveSetting('smtp_host')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="smtp_port"
                      type="number"
                      placeholder="587"
                      value={settings.smtp_port || ''}
                      onChange={(e) => handleUpdateSetting('smtp_port', parseInt(e.target.value))}
                    />
                    <Button 
                      onClick={() => saveSetting('smtp_port')}
                      disabled={updateSetting.isPending}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
