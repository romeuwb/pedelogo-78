
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
  TestTube,
  CreditCard,
  Package,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import MapComponent from '@/components/maps/MapComponent';
import AdminMaps from '@/components/admin/AdminMaps';

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
  const [testingMaps, setTestingMaps] = useState(false);

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

  const testMapsConfig = () => {
    const apiKey = getConfigValue('google_maps_api_key');
    if (!apiKey) {
      toast.error('Configure a chave da API do Google Maps primeiro');
      return;
    }
    setTestingMaps(true);
    toast.success('Teste do Google Maps iniciado');
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
          <AdminMaps />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configurações do Stripe */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Stripe
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Configure suas chaves do Stripe para processar pagamentos com cartão de crédito.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label>Chave Publicável (Publishable Key)</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="pk_test_..."
                        value={getConfigValue('stripe_publishable_key')}
                        onChange={(e) => handleConfigChange('stripe_publishable_key', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('stripe_publishable_key', getConfigValue('stripe_publishable_key'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Chave Secreta (Secret Key)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type={showPasswords['stripe_secret_key'] ? 'text' : 'password'}
                        placeholder="sk_test_..."
                        value={getConfigValue('stripe_secret_key')}
                        onChange={(e) => handleConfigChange('stripe_secret_key', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => togglePasswordVisibility('stripe_secret_key')}
                      >
                        {showPasswords['stripe_secret_key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        onClick={() => updateConfiguration('stripe_secret_key', getConfigValue('stripe_secret_key'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurações do PIX */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">PIX</h4>
                <p className="text-sm text-green-700 mb-3">
                  Configure as opções de pagamento via PIX.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pix_enabled"
                      checked={getConfigValue('pix_enabled') === 'true'}
                      onCheckedChange={(checked) => {
                        handleConfigChange('pix_enabled', checked.toString());
                        updateConfiguration('pix_enabled', checked.toString());
                      }}
                    />
                    <Label htmlFor="pix_enabled">Habilitar pagamento via PIX</Label>
                  </div>
                  <div>
                    <Label>Chave PIX</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Digite sua chave PIX"
                        value={getConfigValue('pix_key')}
                        onChange={(e) => handleConfigChange('pix_key', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('pix_key', getConfigValue('pix_key'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurações de Taxas */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Taxas e Comissões</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Taxa da Plataforma (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={getConfigValue('platform_fee_percentage')}
                        onChange={(e) => handleConfigChange('platform_fee_percentage', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('platform_fee_percentage', getConfigValue('platform_fee_percentage'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Taxa de Entrega Mínima (R$)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.00"
                        value={getConfigValue('min_delivery_fee')}
                        onChange={(e) => handleConfigChange('min_delivery_fee', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('min_delivery_fee', getConfigValue('min_delivery_fee'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {getConfigsByCategory('pagamento').map(renderConfigField)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Configurações de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configurações de Tempo */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempos de Entrega
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tempo Mínimo (min)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="20"
                        value={getConfigValue('min_delivery_time')}
                        onChange={(e) => handleConfigChange('min_delivery_time', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('min_delivery_time', getConfigValue('min_delivery_time'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Tempo Máximo (min)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="60"
                        value={getConfigValue('max_delivery_time')}
                        onChange={(e) => handleConfigChange('max_delivery_time', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('max_delivery_time', getConfigValue('max_delivery_time'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurações de Área */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Área de Cobertura
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Raio Máximo (km)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="10.0"
                        value={getConfigValue('max_delivery_radius')}
                        onChange={(e) => handleConfigChange('max_delivery_radius', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('max_delivery_radius', getConfigValue('max_delivery_radius'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Taxa por KM (R$)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.50"
                        value={getConfigValue('fee_per_km')}
                        onChange={(e) => handleConfigChange('fee_per_km', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('fee_per_km', getConfigValue('fee_per_km'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurações de Entregadores */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Entregadores
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_assign_delivery"
                      checked={getConfigValue('auto_assign_delivery') === 'true'}
                      onCheckedChange={(checked) => {
                        handleConfigChange('auto_assign_delivery', checked.toString());
                        updateConfiguration('auto_assign_delivery', checked.toString());
                      }}
                    />
                    <Label htmlFor="auto_assign_delivery">Atribuição automática de entregas</Label>
                  </div>
                  <div>
                    <Label>Comissão do Entregador (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="15.00"
                        value={getConfigValue('delivery_commission_percentage')}
                        onChange={(e) => handleConfigChange('delivery_commission_percentage', e.target.value)}
                      />
                      <Button
                        onClick={() => updateConfiguration('delivery_commission_percentage', getConfigValue('delivery_commission_percentage'))}
                        disabled={saving}
                        size="sm"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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
export { AdminSettings };
