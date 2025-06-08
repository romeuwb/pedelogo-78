
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TableManagerProps {
  restaurantId: string;
}

export const TableManager = ({ restaurantId }: TableManagerProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [formData, setFormData] = useState({
    numero_mesa: '',
    capacidade: '4',
    localizacao: '',
  });

  const queryClient = useQueryClient();

  // Buscar mesas do restaurante
  const { data: tables, isLoading } = useQuery({
    queryKey: ['restaurant-tables', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('numero_mesa');

      if (error) throw error;
      return data || [];
    },
  });

  // Criar mesa
  const createTableMutation = useMutation({
    mutationFn: async (tableData: any) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .insert({
          restaurant_id: restaurantId,
          ...tableData,
          numero_mesa: parseInt(tableData.numero_mesa),
          capacidade: parseInt(tableData.capacidade),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesa criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Erro ao criar mesa: ' + error.message);
    }
  });

  // Atualizar mesa
  const updateTableMutation = useMutation({
    mutationFn: async ({ id, ...tableData }: any) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({
          ...tableData,
          numero_mesa: parseInt(tableData.numero_mesa),
          capacidade: parseInt(tableData.capacidade),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesa atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      setEditingTable(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar mesa: ' + error.message);
    }
  });

  // Deletar mesa
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesa removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao remover mesa: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      numero_mesa: '',
      capacidade: '4',
      localizacao: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTable) {
      updateTableMutation.mutate({ id: editingTable.id, ...formData });
    } else {
      createTableMutation.mutate(formData);
    }
  };

  const startEdit = (table: any) => {
    setEditingTable(table);
    setFormData({
      numero_mesa: table.numero_mesa.toString(),
      capacidade: table.capacidade.toString(),
      localizacao: table.localizacao || '',
    });
    setShowCreateModal(true);
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando mesas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Mesas</h2>
          <p className="text-gray-600">Configure e gerencie as mesas do seu restaurante</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="numero_mesa">Número da Mesa</Label>
                <Input
                  id="numero_mesa"
                  type="number"
                  value={formData.numero_mesa}
                  onChange={(e) => setFormData({...formData, numero_mesa: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="capacidade">Capacidade</Label>
                <Select
                  value={formData.capacidade}
                  onValueChange={(value) => setFormData({...formData, capacidade: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 pessoas</SelectItem>
                    <SelectItem value="4">4 pessoas</SelectItem>
                    <SelectItem value="6">6 pessoas</SelectItem>
                    <SelectItem value="8">8 pessoas</SelectItem>
                    <SelectItem value="10">10 pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="localizacao">Localização (opcional)</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                  placeholder="Ex: Varanda, Salão principal, Área externa"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createTableMutation.isPending || updateTableMutation.isPending}
                >
                  {editingTable ? 'Atualizar' : 'Criar'} Mesa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTable(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tables || []).map((table) => (
          <Card key={table.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Mesa {table.numero_mesa}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {table.capacidade} pessoas
                  </p>
                  {table.localizacao && (
                    <p className="text-sm text-gray-500">{table.localizacao}</p>
                  )}
                </div>
                
                <Badge className={getStatusColor(table.status)}>
                  {table.status}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(table)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja remover esta mesa?')) {
                      deleteTableMutation.mutate(table.id);
                    }
                  }}
                  disabled={deleteTableMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!tables || tables.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Nenhuma mesa cadastrada</h3>
            <p className="text-gray-600 mb-4">
              Comece criando mesas para o seu restaurante
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira mesa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
