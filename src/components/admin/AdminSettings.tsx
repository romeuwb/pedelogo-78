
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  MapPin, 
  DollarSign, 
  Truck, 
  Mail,
  Globe,
  Key,
  Save,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SystemConfig {
  chave: string;
  valor: string;
  categoria: string;
  descricao?: string;
}

export const AdminSettings = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*')
        .order('categoria', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do sistema',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (chave: string, valor: string) => {
    try {
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          chave,
          valor,
          categoria: getConfigCategory(chave),
          descricao: getConfigDescription(chave),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.chave === chave ? { ...config, valor } : config
      ));

      toast({
        title: 'Sucesso',
        description: 'Configuração atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração',
        variant: 'destructive'
      });
    }
  };

  const getConfigValue = (chave: string) => {
    return configs.find(config => config.chave === chave)?.valor || '';
  };

  const getConfigCategory = (chave: string) => {
    if (chave.includes('map') || chave.includes('google') || chave.includes('mapbox')) return 'mapas';
    if (chave.includes('stripe') || chave.includes('taxa') || chave.includes('comissao')) return 'financeiro';
    if (chave.includes('email') || chave.includes('smtp') || chave.includes('notification')) return 'notificacoes';
    if (chave.includes('entrega') || chave.includes('delivery') || chave.includes('distancia')) return 'entrega';
    return 'geral';
  };

  const getConfigDescription = (chave: string) => {
    const descriptions: Record<string, string> = {
      'app_name': 'Nome do aplicativo',
      'google_maps_api_key': 'Chave da API do Google Maps',
      'mapbox_access_token': 'Token de acesso do Mapbox',
      'default_map_provider': 'Provedor de mapas padrão (google/mapbox)',
      'stripe_publishable_key': 'Chave pública do Stripe',
      'stripe_secret_key': 'Chave secreta do Stripe',
      'taxa_comissao_restaurante': 'Taxa de comissão do restaurante (decimal)',
      'taxa_entrega_base': 'Taxa base de entrega em reais',
      'taxa_entrega_por_km': 'Taxa por quilômetro em reais',
      'distancia_maxima_entrega': 'Distância máxima de entrega em quilômetros',
      'tempo_maximo_preparo': 'Tempo máximo de preparo em minutos',
      'email_from': 'E-mail remetente padrão',
      'smtp_host': 'Servidor SMTP',
      'smtp_port': 'Porta do servidor SMTP'
    };
    return descriptions[chave] || '';
  };

  const saveAllConfigs = async () => {
    setSaving(true);
    try {
      for (const config of configs) {
        await updateConfig(config.chave, config.valor);
      }
      toast({
        title: 'Sucesso',
        description: 'Todas as configurações foram salvas'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfig = async () => {
    setTestingEmail(true);
    try {
      // Implementar teste de email via edge function
      toast({
        title: 'Teste Iniciado',
        description: 'Testando configurações de email...'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao testar configurações de email',
        variant: 'destructive'
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const generalConfigs = configs.filter(c => c.categoria === 'geral');
  const mapConfigs = configs.filter(c => c.categoria === 'mapas');
  const financialConfigs = configs.filter(c => c.categoria === 'financeiro');
  const deliveryConfigs = configs.filter(c => c.categoria === 'entrega');
  const notificationConfigs = configs.filter(c => c.categoria === 'notificacoes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
        </div>
        <Button onClick={saveAllConfigs} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Tudo'}
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="mapas">Mapas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app_name">Nome do Aplicativo</Label>
                <Input
                  id="app_name"
                  value={getConfigValue('app_name')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'app_name' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="PedeLogo"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Configurações de Mapas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_maps_api_key">Chave da API do Google Maps</Label>
                <Input
                  id="google_maps_api_key"
                  type="password"
                  value={getConfigValue('google_maps_api_key')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'google_maps_api_key' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="Sua chave da API do Google Maps"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapbox_access_token">Token de Acesso do Mapbox</Label>
                <Input
                  id="mapbox_access_token"
                  type="password"
                  value={getConfigValue('mapbox_access_token')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'mapbox_access_token' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="Seu token de acesso do Mapbox"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_map_provider">Provedor de Mapas Padrão</Label>
                <Select
                  value={getConfigValue('default_map_provider')}
                  onValueChange={(value) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'default_map_provider' ? { ...config, valor: value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Maps</SelectItem>
                    <SelectItem value="mapbox">Mapbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Configurações Financeiras</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxa_comissao_restaurante">Taxa de Comissão do Restaurante (%)</Label>
                <Input
                  id="taxa_comissao_restaurante"
                  type="number"
                  step="0.01"
                  value={getConfigValue('taxa_comissao_restaurante')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'taxa_comissao_restaurante' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="0.15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxa_entrega_base">Taxa Base de Entrega (R$)</Label>
                <Input
                  id="taxa_entrega_base"
                  type="number"
                  step="0.01"
                  value={getConfigValue('taxa_entrega_base')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'taxa_entrega_base' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="5.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxa_entrega_por_km">Taxa por Quilômetro (R$)</Label>
                <Input
                  id="taxa_entrega_por_km"
                  type="number"
                  step="0.01"
                  value={getConfigValue('taxa_entrega_por_km')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'taxa_entrega_por_km' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="1.50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entrega" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Configurações de Entrega</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="distancia_maxima_entrega">Distância Máxima de Entrega (km)</Label>
                <Input
                  id="distancia_maxima_entrega"
                  type="number"
                  value={getConfigValue('distancia_maxima_entrega')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'distancia_maxima_entrega' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo_maximo_preparo">Tempo Máximo de Preparo (minutos)</Label>
                <Input
                  id="tempo_maximo_preparo"
                  type="number"
                  value={getConfigValue('tempo_maximo_preparo')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'tempo_maximo_preparo' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="60"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configurações de Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email_from">E-mail Remetente</Label>
                <Input
                  id="email_from"
                  type="email"
                  value={getConfigValue('email_from')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'email_from' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="noreply@pedelogo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_host">Servidor SMTP</Label>
                <Input
                  id="smtp_host"
                  value={getConfigValue('smtp_host')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'smtp_host' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">Porta SMTP</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={getConfigValue('smtp_port')}
                  onChange={(e) => {
                    const newConfigs = configs.map(config =>
                      config.chave === 'smtp_port' ? { ...config, valor: e.target.value } : config
                    );
                    setConfigs(newConfigs);
                  }}
                  placeholder="587"
                />
              </div>

              <Button onClick={testEmailConfig} disabled={testingEmail} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                {testingEmail ? 'Testando...' : 'Testar Configurações de Email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
