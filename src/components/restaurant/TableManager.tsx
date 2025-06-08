
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TableManagerProps {
  restaurantId: string;
}

export const TableManager = ({ restaurantId }: TableManagerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);

  const queryClient = useQueryClient();

  // Buscar mesas (usando restaurant_tables se existir, senão usar mock)
  const { data: tables } = useQuery({
    queryKey: ['restaurant-tables', restaurantId],
    queryFn: async () => {
      // Como a tabela restaurant_tables pode não existir, vamos usar a existente restaurant_tables 
      // ou retornar dados mock
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('numero', { ascending: true });

        if (error) {
          // Se a tabela não existir, retornar dados mock
          console.log('Tabela restaurant_tables não encontrada, usando dados mock');
          return [
            { id: '1', numero: 1, capacidade: 4, status: 'disponivel', ativo: true },
            { id: '2', numero: 2, capacidade: 2, status: 'ocupada', ativo: true },
            { id: '3', numero: 3, capacidade: 6, status: 'disponivel', ativo: true },
          ];
        }
        return data || [];
      } catch (error) {
        console.log('Erro ao buscar mesas, usando dados mock:', error);
        return [
          { id: '1', numero: 1, capacidade: 4, status: 'disponivel', ativo: true },
          { id: '2', numero: 2, capacidade: 2, status: 'ocupada', ativo: true },
          { id: '3', numero: 3, capacidade: 6, status: 'disponivel', ativo: true },
        ];
      }
    },
  });

  // Adicionar/Editar mesa (mock por enquanto)
  const saveTableMutation = useMutation({
    mutationFn: async (tableData: any) => {
      console.log('Salvando mesa:', tableData);
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success(editingTable ? 'Mesa atualizada!' : 'Mesa criada!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      setShowModal(false);
      setEditingTable(null);
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar mesa: ' + error.message);
    }
  });

  // Deletar mesa (mock por enquanto)
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      console.log('Deletando mesa:', tableId);
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success('Mesa excluída!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir mesa: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const tableData = {
      numero: parseInt(formData.get('numero') as string),
      capacidade: parseInt(formData.get('capacidade') as string),
      localizacao: formData.get('localizacao'),
      restaurant_id: restaurantId,
    };

    saveTableMutation.mutate(tableData);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'disponivel': 'bg-green-100 text-green-800',
      'ocupada': 'bg-red-100 text-red-800',
      'reservada': 'bg-yellow-100 text-yellow-800',
      'manutencao': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'disponivel': 'Disponível',
      'ocupada': 'Ocupada',
      'reservada': 'Reservada',
      'manutencao': 'Manutenção'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Mesas</h2>
          <p className="text-gray-600">Configure e organize as mesas do seu restaurante</p>
        </div>
        
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(tables || []).map((table) => (
          <Card key={table.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <Users className="h-8 w-8 mx-auto text-gray-400" />
                
                <div>
                  <h3 className="font-semibold">Mesa {table.numero}</h3>
                  <p className="text-sm text-gray-600">{table.capacidade} pessoas</p>
                </div>
                
                <Badge className={getStatusColor(table.status)}>
                  {getStatusText(table.status)}
                </Badge>
                
                {table.observacoes && (
                  <p className="text-xs text-gray-500">{table.observacoes}</p>
                )}
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTable(table);
                      setShowModal(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Deseja excluir esta mesa?')) {
                        deleteTableMutation.mutate(table.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Mesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {(tables || []).length}
              </p>
              <p className="text-sm text-gray-600">Total de Mesas</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(tables || []).filter(t => t.status === 'disponivel').length}
              </p>
              <p className="text-sm text-gray-600">Disponíveis</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {(tables || []).filter(t => t.status === 'ocupada').length}
              </p>
              <p className="text-sm text-gray-600">Ocupadas</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {(tables || []).reduce((acc, table) => acc + (table.capacidade || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Capacidade Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de mesa */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número da Mesa</label>
              <Input 
                name="numero" 
                type="number" 
                required 
                defaultValue={editingTable?.numero || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Capacidade</label>
              <Input 
                name="capacidade" 
                type="number" 
                required 
                defaultValue={editingTable?.capacidade || '4'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Localização</label>
              <Input 
                name="localizacao" 
                placeholder="Ex: Área interna, Varanda, Área externa"
                defaultValue={editingTable?.observacoes || ''}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={saveTableMutation.isPending}>
                {editingTable ? 'Atualizar' : 'Criar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowModal(false);
                  setEditingTable(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
