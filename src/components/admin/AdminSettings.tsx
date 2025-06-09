
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Map, 
  DollarSign, 
  Bell, 
  Mail, 
  Truck,
  Save,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfig {
  id: string;
  chave: string;
  valor: string;
  categoria: string;
  descricao: string;
  created_at: string;
  updated_at: string;
}

const AdminSettings = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

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
      
      // Convert Json type to string for display
      const configsWithStringValues = data.map(config => ({
        ...config,
        valor: typeof config.valor === 'string' ? config.valor : String(config.valor || '')
      }));
      
      setConfigs(configsWithStringValues);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (chave: string, novoValor: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_configurations')
        .update({ valor: novoValor })
        .eq('chave', chave);

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.chave === chave ? { ...config, valor: novoValor } : config
      ));

      toast.success('Configuração atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    } finally {
      setSaving(false);
    }
  };

  const getConfigsByCategory = (categoria: string) => {
    return configs.filter(config => config.categoria === categoria);
  };

  const getConfigValue = (chave: string) => {
    return configs.find(config => config.chave === chave)?.valor || '';
  };

  const handleConfigChange = (chave: string, valor: string) => {
    setConfigs(prev => prev.map(config => 
      config.chave === chave ? { ...config, valor } : config
    ));
  };

  const togglePasswordVisibility = (chave: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  const testEmailConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-email-config');
      if (error) throw error;
      
      toast.success('Teste de email enviado com sucesso');
    } catch (error) {
      console.error('Erro no teste de email:', error);
      toast.error('Erro ao testar configuração de email');
    }
  };

  const renderConfigField = (config: SystemConfig) => {
    const isPassword = config.chave.toLowerCase().includes('password') || 
                      config.chave.toLowerCase().includes('secret') ||
                      config.chave.toLowerCase().includes('key');
    const isTextarea = config.descricao?.toLowerCase().includes('texto') || 
                      config.valor.length > 100;

    return (
      <div key={config.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={config.chave} className="text-sm font-medium">
            {config.chave.replace(/_/g, ' ').toUpperCase()}
          </Label>
          {config.categoria && (
            <Badge variant="outline" className="text-xs">
              {config.categoria}
            </Badge>
          )}
        </div>
        
        {config.descricao && (
          <p className="text-xs text-gray-600">{config.descricao}</p>
        )}
        
        <div className="flex space-x-2">
          {isTextarea ? (
            <Textarea
              id={config.chave}
              value={config.valor}
              onChange={(e) => handleConfigChange(config.chave, e.target.value)}
              placeholder={`Digite ${config.chave.replace(/_/g, ' ')}`}
              rows={3}
            />
          ) : (
            <Input
              id={config.chave}
              type={isPassword && !showPasswords[config.chave] ? 'password' : 'text'}
              value={config.valor}
              onChange={(e) => handleConfigChange(config.chave, e.target.value)}
              placeholder={`Digite ${config.chave.replace(/_/g, ' ')}`}
            />
          )}
          
          {isPassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => togglePasswordVisibility(config.chave)}
            >
              {showPasswords[config.chave] ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}
          
          <Button
            onClick={() => updateConfiguration(config.chave, config.valor)}
            disabled={saving}
            size="sm"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings size={16} />
            Geral
          </TabsTrigger>
          <TabsTrigger value="maps" className="flex items-center gap-2">
            <Map size={16} />
            Mapas
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <DollarSign size={16} />
            Pagamento
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck size={16} />
            Entrega
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('geral').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Mapas e Rotas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('mapas').map(renderConfigField)}
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Google Maps API</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Configure sua chave da API do Google Maps para habilitar funcionalidades de mapa e roteamento.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="google_maps_api_key">Chave da API</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="google_maps_api_key"
                      type={showPasswords['google_maps_api_key'] ? 'text' : 'password'}
                      value={getConfigValue('google_maps_api_key')}
                      onChange={(e) => handleConfigChange('google_maps_api_key', e.target.value)}
                      placeholder="Digite sua chave da API do Google Maps"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePasswordVisibility('google_maps_api_key')}
                    >
                      {showPasswords['google_maps_api_key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      onClick={() => updateConfiguration('google_maps_api_key', getConfigValue('google_maps_api_key'))}
                      disabled={saving}
                      size="sm"
                    >
                      <Save size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('pagamento').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('entrega').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configurações de Email
                <Button
                  onClick={testEmailConfig}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Configuração
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('email').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsByCategory('notificacoes').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
