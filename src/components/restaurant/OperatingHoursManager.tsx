
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface OperatingHoursManagerProps {
  restaurantId: string;
}

interface OperatingHour {
  id?: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
  break_start_time?: string;
  break_end_time?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const OperatingHoursManager = ({ restaurantId }: OperatingHoursManagerProps) => {
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingHours, isLoading } = useQuery({
    queryKey: ['restaurant-operating-hours', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_operating_hours')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('day_of_week')
        .order('opening_time');

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (existingHours) {
      setOperatingHours(existingHours);
    }
  }, [existingHours]);

  const saveHoursMutation = useMutation({
    mutationFn: async (hours: OperatingHour[]) => {
      // Primeiro, deletar todos os horários existentes
      await supabase
        .from('restaurant_operating_hours')
        .delete()
        .eq('restaurant_id', restaurantId);

      // Depois, inserir os novos horários
      if (hours.length > 0) {
        const hoursToInsert = hours.map(hour => ({
          restaurant_id: restaurantId,
          day_of_week: hour.day_of_week,
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
          is_closed: hour.is_closed,
          break_start_time: hour.break_start_time || null,
          break_end_time: hour.break_end_time || null
        }));

        const { error } = await supabase
          .from('restaurant_operating_hours')
          .insert(hoursToInsert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-operating-hours'] });
      toast({
        title: "Horários atualizados",
        description: "Os horários de funcionamento foram salvos com sucesso.",
      });
    }
  });

  const addOperatingHour = (dayOfWeek: number) => {
    const newHour: OperatingHour = {
      day_of_week: dayOfWeek,
      opening_time: '08:00',
      closing_time: '18:00',
      is_closed: false
    };
    setOperatingHours(prev => [...prev, newHour]);
  };

  const updateOperatingHour = (index: number, updates: Partial<OperatingHour>) => {
    setOperatingHours(prev => 
      prev.map((hour, i) => i === index ? { ...hour, ...updates } : hour)
    );
  };

  const removeOperatingHour = (index: number) => {
    setOperatingHours(prev => prev.filter((_, i) => i !== index));
  };

  const groupedHours = DAYS_OF_WEEK.map(day => ({
    ...day,
    hours: operatingHours.filter(hour => hour.day_of_week === day.value)
  }));

  if (isLoading) {
    return <div className="p-4">Carregando horários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Horários de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedHours.map(day => (
          <div key={day.value} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">{day.label}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addOperatingHour(day.value)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Horário
              </Button>
            </div>

            {day.hours.length === 0 ? (
              <p className="text-gray-500 text-sm">Fechado - Nenhum horário definido</p>
            ) : (
              <div className="space-y-3">
                {day.hours.map((hour, index) => {
                  const globalIndex = operatingHours.findIndex(h => 
                    h.day_of_week === day.value && 
                    h.opening_time === hour.opening_time &&
                    h.closing_time === hour.closing_time
                  );
                  
                  return (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!hour.is_closed}
                            onChange={(e) => updateOperatingHour(globalIndex, { is_closed: !e.target.checked })}
                          />
                          <span className="text-sm">Aberto</span>
                        </label>
                      </div>

                      {!hour.is_closed && (
                        <>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Abertura</label>
                            <Input
                              type="time"
                              value={hour.opening_time}
                              onChange={(e) => updateOperatingHour(globalIndex, { opening_time: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Fechamento</label>
                            <Input
                              type="time"
                              value={hour.closing_time}
                              onChange={(e) => updateOperatingHour(globalIndex, { closing_time: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Pausa Início</label>
                            <Input
                              type="time"
                              value={hour.break_start_time || ''}
                              onChange={(e) => updateOperatingHour(globalIndex, { break_start_time: e.target.value })}
                              className="text-sm"
                              placeholder="Opcional"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Pausa Fim</label>
                            <Input
                              type="time"
                              value={hour.break_end_time || ''}
                              onChange={(e) => updateOperatingHour(globalIndex, { break_end_time: e.target.value })}
                              className="text-sm"
                              placeholder="Opcional"
                            />
                          </div>
                        </>
                      )}

                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeOperatingHour(globalIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <Button 
          onClick={() => saveHoursMutation.mutate(operatingHours)} 
          disabled={saveHoursMutation.isPending}
          className="w-full"
        >
          {saveHoursMutation.isPending ? 'Salvando...' : 'Salvar Horários'}
        </Button>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Você pode definir múltiplos horários para o mesmo dia</li>
            <li>• Use a pausa para intervalos de almoço ou outras pausas</li>
            <li>• Desmarque "Aberto" para dias fechados</li>
            <li>• Clique em "Adicionar Horário" para múltiplos turnos no mesmo dia</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
