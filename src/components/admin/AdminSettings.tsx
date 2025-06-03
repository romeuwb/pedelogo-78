
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign, Truck, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*');
      
      if (error) throw error;
      
      // Converter array para objeto para facilitar o uso
      const settingsObj: any = {};
      data.forEach(setting => {
        settingsObj[setting.chave] = typeof setting.valor === 'string' 
          ? JSON.parse(setting.valor) 
          : setting.valor;
      });
      
      setSettings(settingsObj);
      return settingsObj;
    }
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          chave: key,
          valor: JSON.stringify(value),
          categoria: 'geral' // Categoria padrão
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast({
        title: 'Sucesso',
        description: 'Configuração atualizada com sucesso'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração',
        variant: 'destructive'
      });
    }
  });

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSetting = (key: string) => {
    updateSetting.mutate({ key, value: settings[key] });
  };

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
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financeiro</span>
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
                      value={settings.app_name || ''}
                      onChange={(e) => handleUpdateSetting('app_name', e.target.value)}
                    />
                    <Button onClick={() => saveSetting('app_name')}>
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="app_logo">URL do Logo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="app_logo"
                      value={settings.app_logo || ''}
                      onChange={(e) => handleUpdateSetting('app_logo', e.target.value)}
                    />
                    <Button onClick={() => saveSetting('app_logo')}>
                      Salvar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="moeda">Moeda</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="moeda"
                      value={settings.moeda || ''}
                      onChange={(e) => handleUpdateSetting('moeda', e.target.value)}
                    />
                    <Button onClick={() => saveSetting('moeda')}>
                      Salvar
                    </Button>
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
                  <Label htmlFor="taxa_comissao_restaurante">Taxa de Comissão (%)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="taxa_comissao_restaurante"
                      type="number"
                      step="0.01"
                      value={settings.taxa_comissao_restaurante || ''}
                      onChange={(e) => handleUpdateSetting('taxa_comissao_restaurante', parseFloat(e.target.value) / 100)}
                    />
                    <Button onClick={() => saveSetting('taxa_comissao_restaurante')}>
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
                      value={settings.taxa_entrega_base || ''}
                      onChange={(e) => handleUpdateSetting('taxa_entrega_base', parseFloat(e.target.value))}
                    />
                    <Button onClick={() => saveSetting('taxa_entrega_base')}>
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
                      value={settings.taxa_entrega_por_km || ''}
                      onChange={(e) => handleUpdateSetting('taxa_entrega_por_km', parseFloat(e.target.value))}
                    />
                    <Button onClick={() => saveSetting('taxa_entrega_por_km')}>
                      Salvar
                    </Button>
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
                  <Label htmlFor="distancia_maxima_entrega">Distância Máxima (km)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="distancia_maxima_entrega"
                      type="number"
                      value={settings.distancia_maxima_entrega || ''}
                      onChange={(e) => handleUpdateSetting('distancia_maxima_entrega', parseInt(e.target.value))}
                    />
                    <Button onClick={() => saveSetting('distancia_maxima_entrega')}>
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
                      value={settings.tempo_maximo_preparo || ''}
                      onChange={(e) => handleUpdateSetting('tempo_maximo_preparo', parseInt(e.target.value))}
                    />
                    <Button onClick={() => saveSetting('tempo_maximo_preparo')}>
                      Salvar
                    </Button>
                  </div>
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
            <CardContent>
              <p className="text-gray-600">
                Configurações de email e notificações push serão implementadas aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
