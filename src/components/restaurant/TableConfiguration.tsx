
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TableConfigurationProps {
  restaurantId: string;
}

export const TableConfiguration = ({ restaurantId }: TableConfigurationProps) => {
  const [config, setConfig] = useState({
    tempo_limite_mesa: 90,
    taxa_servico_automatica: true,
    percentual_taxa_servico: 10,
    reserva_antecedencia_dias: 30,
    cancelamento_horas: 2,
    notificar_cliente_confirmacao: true,
    notificar_cliente_lembrete: true,
    tempo_lembrete_horas: 2,
    permitir_reserva_online: true,
    mesa_minima_reserva: 1,
    mesa_maxima_reserva: 12
  });

  const handleSave = async () => {
    try {
      // Implementar salvamento das configurações
      console.log('Salvando configurações:', config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Mesa</h2>
        <p className="text-gray-600">Configure as regras e políticas para gestão de mesas</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tempo_limite">Tempo Limite por Mesa (minutos)</Label>
                <Input
                  id="tempo_limite"
                  type="number"
                  value={config.tempo_limite_mesa}
                  onChange={(e) => setConfig({...config, tempo_limite_mesa: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="percentual_taxa">Taxa de Serviço (%)</Label>
                <Input
                  id="percentual_taxa"
                  type="number"
                  value={config.percentual_taxa_servico}
                  onChange={(e) => setConfig({...config, percentual_taxa_servico: parseInt(e.target.value)})}
                  disabled={!config.taxa_servico_automatica}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Taxa de Serviço Automática</Label>
                <p className="text-sm text-gray-600">Aplicar taxa de serviço automaticamente</p>
              </div>
              <Switch
                checked={config.taxa_servico_automatica}
                onCheckedChange={(checked) => setConfig({...config, taxa_servico_automatica: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Políticas de Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="antecedencia">Antecedência para Reserva (dias)</Label>
                <Input
                  id="antecedencia"
                  type="number"
                  value={config.reserva_antecedencia_dias}
                  onChange={(e) => setConfig({...config, reserva_antecedencia_dias: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="cancelamento">Cancelamento com Antecedência (horas)</Label>
                <Input
                  id="cancelamento"
                  type="number"
                  value={config.cancelamento_horas}
                  onChange={(e) => setConfig({...config, cancelamento_horas: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mesa_min">Capacidade Mínima para Reserva</Label>
                <Input
                  id="mesa_min"
                  type="number"
                  value={config.mesa_minima_reserva}
                  onChange={(e) => setConfig({...config, mesa_minima_reserva: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="mesa_max">Capacidade Máxima para Reserva</Label>
                <Input
                  id="mesa_max"
                  type="number"
                  value={config.mesa_maxima_reserva}
                  onChange={(e) => setConfig({...config, mesa_maxima_reserva: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Reserva Online</Label>
                <p className="text-sm text-gray-600">Clientes podem fazer reservas pelo app</p>
              </div>
              <Switch
                checked={config.permitir_reserva_online}
                onCheckedChange={(checked) => setConfig({...config, permitir_reserva_online: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar Confirmação de Reserva</Label>
                <p className="text-sm text-gray-600">Enviar confirmação por SMS/Email</p>
              </div>
              <Switch
                checked={config.notificar_cliente_confirmacao}
                onCheckedChange={(checked) => setConfig({...config, notificar_cliente_confirmacao: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lembrete de Reserva</Label>
                <p className="text-sm text-gray-600">Enviar lembrete antes da reserva</p>
              </div>
              <Switch
                checked={config.notificar_cliente_lembrete}
                onCheckedChange={(checked) => setConfig({...config, notificar_cliente_lembrete: checked})}
              />
            </div>

            {config.notificar_cliente_lembrete && (
              <div>
                <Label htmlFor="tempo_lembrete">Lembrete com Antecedência (horas)</Label>
                <Input
                  id="tempo_lembrete"
                  type="number"
                  value={config.tempo_lembrete_horas}
                  onChange={(e) => setConfig({...config, tempo_lembrete_horas: parseInt(e.target.value)})}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};
