
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Users, QrCode, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import TableOrderSystem from './TableOrderSystem';

interface Table {
  id: string;
  numero_mesa: number;
  capacidade: number;
  status: string;
  posicao_x: number;
  posicao_y: number;
  qr_code: string;
  ativo: boolean;
  observacoes: string;
  localizacao: string;
}

interface TableManagerProps {
  restaurantId: string;
}

const TableManager = ({ restaurantId }: TableManagerProps) => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    quantidade_mesas: '1',
    capacidade: '4',
    localizacao: '',
    observacoes: ''
  });
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);

  useEffect(() => {
    loadTables();
  }, [restaurantId]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('numero_mesa', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      toast.error('Erro ao carregar mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedTable) {
        // Editando mesa existente
        const tableData = {
          capacidade: parseInt(formData.capacidade),
          localizacao: formData.localizacao,
          observacoes: formData.observacoes,
        };

        const { error } = await supabase
          .from('restaurant_tables')
          .update(tableData)
          .eq('id', selectedTable.id);
        
        if (error) throw error;
        toast.success('Mesa atualizada com sucesso!');
      } else {
        // Criando múltiplas mesas
        const quantidadeMesas = parseInt(formData.quantidade_mesas);
        if (quantidadeMesas <= 0 || quantidadeMesas > 50) {
          toast.error('Quantidade deve ser entre 1 e 50 mesas');
          return;
        }
        
        const lastTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.numero_mesa)) : 0;
        
        const tablesToCreate = [];
        for (let i = 1; i <= quantidadeMesas; i++) {
          const numeroMesa = lastTableNumber + i;
          tablesToCreate.push({
            restaurant_id: restaurantId,
            numero_mesa: numeroMesa,
            capacidade: parseInt(formData.capacidade),
            localizacao: formData.localizacao || '',
            observacoes: formData.observacoes || '',
            status: 'disponivel',
            ativo: true,
            posicao_x: 0,
            posicao_y: 0,
            qr_code: `mesa-${numeroMesa}-${restaurantId}-${Date.now()}`
          });
        }

        const { error } = await supabase
          .from('restaurant_tables')
          .insert(tablesToCreate);
        
        if (error) {
          console.error('Erro detalhado:', error);
          throw error;
        }
        toast.success(`${quantidadeMesas} mesa(s) criada(s) com sucesso!`);
      }

      setShowDialog(false);
      setSelectedTable(null);
          setFormData({ quantidade_mesas: '1', capacidade: '4', localizacao: '', observacoes: '' });
      loadTables();
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
      toast.error('Erro ao salvar mesa');
    }
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      quantidade_mesas: '1',
      capacidade: table.capacidade.toString(),
      localizacao: table.localizacao || '',
      observacoes: table.observacoes || ''
    });
    setShowDialog(true);
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'disponivel' && table.ativo) {
      setSelectedTableForOrder(table);
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa?')) return;

    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
      toast.success('Mesa excluída com sucesso!');
      loadTables();
    } catch (error) {
      console.error('Erro ao excluir mesa:', error);
      toast.error('Erro ao excluir mesa');
    }
  };

  const toggleTableStatus = async (table: Table) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ ativo: !table.ativo })
        .eq('id', table.id);

      if (error) throw error;
      toast.success(`Mesa ${!table.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      loadTables();
    } catch (error) {
      console.error('Erro ao alterar status da mesa:', error);
      toast.error('Erro ao alterar status da mesa');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'disponivel': 'bg-green-500',
      'ocupada': 'bg-red-500', 
      'reservada': 'bg-yellow-500',
      'aguardando_pagamento': 'bg-orange-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'disponivel': 'Disponível',
      'ocupada': 'Ocupada',
      'reservada': 'Reservada', 
      'aguardando_pagamento': 'Aguardando Pagamento'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Mesas</h2>
          <p className="text-gray-600">Configure e monitore as mesas do seu restaurante</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedTable(null);
            setFormData({ quantidade_mesas: '1', capacidade: '4', localizacao: '', observacoes: '' });
            setShowDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTable ? 'Editar Mesa' : 'Criar Novas Mesas'}
            </DialogTitle>
            <DialogDescription>
              {selectedTable ? 'Edite as informações da mesa' : 'Informe a quantidade e dados das mesas que serão criadas'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!selectedTable && (
                <div>
                  <Label htmlFor="quantidade_mesas">Quantidade de Mesas</Label>
                  <Input
                    id="quantidade_mesas"
                    type="number"
                    value={formData.quantidade_mesas}
                    onChange={(e) => setFormData({...formData, quantidade_mesas: e.target.value})}
                    required
                    min="1"
                    placeholder="Ex: 5 para criar 5 mesas"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="capacidade">Capacidade por Mesa</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                  required
                  min="1"
                  placeholder="Número de pessoas"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                placeholder="Ex: Próximo à janela, Terraço, Salão principal..."
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre a mesa..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedTable ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card 
            key={table.id} 
            className={`${!table.ativo ? 'opacity-50' : ''} ${
              (table.status === 'disponivel' && table.ativo) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={() => handleTableClick(table)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    Mesa {table.numero_mesa}
                    {!table.ativo && (
                      <Badge variant="secondary" className="ml-2">Inativa</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-600">{table.capacidade} pessoas</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(table.status)} text-white`}>
                  {getStatusText(table.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {table.localizacao && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {table.localizacao}
                </div>
              )}
              
              {table.observacoes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {table.observacoes}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code: {table.qr_code.slice(-8)}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(table)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(table.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant={table.ativo ? "secondary" : "default"}
                  onClick={() => toggleTableStatus(table)}
                >
                  {table.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mesa cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece adicionando as mesas do seu restaurante</p>
          <Button onClick={() => {
            setSelectedTable(null);
            setFormData({ quantidade_mesas: '1', capacidade: '4', localizacao: '', observacoes: '' });
            setShowDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar primeira mesa
          </Button>
        </div>
      )}

      {/* Sistema de Pedidos */}
      {selectedTableForOrder && (
        <TableOrderSystem
          table={selectedTableForOrder}
          restaurantId={restaurantId}
          onClose={() => setSelectedTableForOrder(null)}
        />
      )}
    </div>
  );
};

export default TableManager;
