import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  CreditCard, 
  Bell, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { OperatingHoursManager } from './OperatingHoursManager';
import { DeliveryAreaMap } from './DeliveryAreaMap';

interface RestaurantSettingsProps {
  restaurantId: string;
}

interface HorarioFuncionamento {
  abertura: string;
  fechamento: string;
  ativo: boolean;
}

interface HorariosData {
  segunda: HorarioFuncionamento;
  terca: HorarioFuncionamento;
  quarta: HorarioFuncionamento;
  quinta: HorarioFuncionamento;
  sexta: HorarioFuncionamento;
  sabado: HorarioFuncionamento;
  domingo: HorarioFuncionamento;
}

export const RestaurantSettings = ({ restaurantId }: RestaurantSettingsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-details', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['restaurant-settings', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('restaurant_details')
        .update(updates)
        .eq('id', restaurantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-details'] });
      toast({
        title: "Informações atualizadas",
        description: "As informações do restaurante foram atualizadas com sucesso.",
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('restaurant_settings')
        .upsert({
          restaurant_id: restaurantId,
          ...updates
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    }
  });

  const PerfilForm = () => {
    const [perfil, setPerfil] = useState({
      nome_fantasia: restaurant?.nome_fantasia || '',
      descricao: restaurant?.descricao || '',
      endereco: restaurant?.endereco || '',
      taxa_entrega: restaurant?.taxa_entrega || 0,
      tempo_entrega_min: restaurant?.tempo_entrega_min || 30
    });

    const handleSavePerfil = () => {
      updateRestaurantMutation.mutate({
        ...perfil,
        taxa_entrega: parseFloat(perfil.taxa_entrega.toString()),
        tempo_entrega_min: parseInt(perfil.tempo_entrega_min.toString())
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Restaurante</label>
          <Input
            value={perfil.nome_fantasia}
            onChange={(e) => setPerfil({...perfil, nome_fantasia: e.target.value})}
            placeholder="Nome fantasia do restaurante"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <Textarea
            value={perfil.descricao}
            onChange={(e) => setPerfil({...perfil, descricao: e.target.value})}
            placeholder="Descrição do restaurante"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <Input
            value={perfil.endereco}
            onChange={(e) => setPerfil({...perfil, endereco: e.target.value})}
            placeholder="Endereço completo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Taxa de Entrega (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={perfil.taxa_entrega}
              onChange={(e) => setPerfil({...perfil, taxa_entrega: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo de Entrega (min)</label>
            <Input
              type="number"
              value={perfil.tempo_entrega_min}
              onChange={(e) => setPerfil({...perfil, tempo_entrega_min: parseInt(e.target.value) || 30})}
              placeholder="30"
            />
          </div>
        </div>

        <Button onClick={handleSavePerfil} disabled={updateRestaurantMutation.isPending}>
          {updateRestaurantMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-gray-600">Gerencie as configurações do seu restaurante</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="horarios">
            <Clock className="h-4 w-4 mr-2" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="area">
            <MapPin className="h-4 w-4 mr-2" />
            Área de Entrega
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <CreditCard className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
            </CardHeader>
            <CardContent>
              <PerfilForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios">
          <OperatingHoursManager restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="area">
          <DeliveryAreaMap restaurantId={restaurantId} settings={settings} />
        </TabsContent>

        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure seus dados bancários para recebimento
              </p>
              <div className="text-center py-8">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Configuração de dados bancários será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure como deseja receber notificações
              </p>
              <div className="text-center py-8">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Configurações de notificação serão implementadas em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
