
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StaffManagerProps {
  restaurantId: string;
}

export const StaffManager = ({ restaurantId }: StaffManagerProps) => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editingDelivery, setEditingDelivery] = useState<any>(null);

  const queryClient = useQueryClient();

  // Buscar funcionários
  const { data: employees } = useQuery({
    queryKey: ['restaurant-employees', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_employees')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar entregadores disponíveis
  const { data: availableDeliverers } = useQuery({
    queryKey: ['available-deliverers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_details')
        .select(`
          *,
          profiles (nome, telefone)
        `)
        .eq('status_aprovacao', 'aprovado')
        .eq('disponivel_para_entregas', true);

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar entregadores contratados (usando dados mock por enquanto)
  const { data: contractedDeliverers } = useQuery({
    queryKey: ['contracted-deliverers', restaurantId],
    queryFn: async () => {
      // Mock data até criar a tabela
      return [];
    },
  });

  // Adicionar funcionário
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const { error } = await supabase
        .from('restaurant_employees')
        .insert({
          restaurant_id: restaurantId,
          ...employeeData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Funcionário adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-employees'] });
      setShowEmployeeModal(false);
      setEditingEmployee(null);
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar funcionário: ' + error.message);
    }
  });

  // Contratar entregador (mock por enquanto)
  const contractDelivererMutation = useMutation({
    mutationFn: async (delivererData: any) => {
      // Mock implementation
      console.log('Contratando entregador:', delivererData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success('Entregador contratado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracted-deliverers'] });
      setShowDeliveryModal(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao contratar entregador: ' + error.message);
    }
  });

  const handleEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const employeeData = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      cargo: formData.get('cargo'),
      salario: parseFloat(formData.get('salario') as string) || 0,
      turno: formData.get('turno'),
    };

    addEmployeeMutation.mutate(employeeData);
  };

  const handleDelivererContract = (delivererId: string) => {
    const delivererData = {
      delivery_detail_id: delivererId,
      restaurant_id: restaurantId,
      data_contratacao: new Date().toISOString().split('T')[0],
    };

    contractDelivererMutation.mutate(delivererData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Equipe</h2>
          <p className="text-gray-600">Gerencie funcionários e entregadores</p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="deliverers">Entregadores</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Funcionários</h3>
            <Button onClick={() => setShowEmployeeModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Funcionário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(employees || []).map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{employee.nome}</h4>
                      <p className="text-sm text-gray-600">{employee.cargo}</p>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    </div>
                    <Badge className={employee.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Telefone:</span> {employee.telefone || 'Não informado'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Turno:</span> {employee.turno || 'Não definido'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Salário:</span> R$ {employee.salario?.toFixed(2) || '0,00'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Admissão:</span> {new Date(employee.data_admissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setShowEmployeeModal(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliverers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Entregadores</h3>
            <Button onClick={() => setShowDeliveryModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Contratar Entregador
            </Button>
          </div>

          {/* Entregadores contratados */}
          <div>
            <h4 className="font-medium mb-3">Entregadores Contratados</h4>
            {(!contractedDeliverers || contractedDeliverers.length === 0) ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum entregador contratado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractedDeliverers.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="p-4">
                      {/* Contracted deliverer details will be shown here */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de funcionário */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input 
                name="nome" 
                required 
                defaultValue={editingEmployee?.nome || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                name="email" 
                type="email" 
                required 
                defaultValue={editingEmployee?.email || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input 
                name="telefone" 
                defaultValue={editingEmployee?.telefone || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cargo</label>
              <Select name="cargo" defaultValue={editingEmployee?.cargo || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="cozinheiro">Cozinheiro</SelectItem>
                  <SelectItem value="garcom">Garçom</SelectItem>
                  <SelectItem value="atendente">Atendente</SelectItem>
                  <SelectItem value="operador_pos">Operador POS</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Salário</label>
              <Input 
                name="salario" 
                type="number" 
                step="0.01" 
                defaultValue={editingEmployee?.salario || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Turno</label>
              <Select name="turno" defaultValue={editingEmployee?.turno || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={addEmployeeMutation.isPending}>
                {editingEmployee ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEmployeeModal(false);
                  setEditingEmployee(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de entregadores */}
      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contratar Entregador</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Selecione entregadores disponíveis na plataforma para contratar:
            </p>
            
            <div className="space-y-3">
              {(availableDeliverers || []).map((deliverer) => (
                <Card key={deliverer.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Nome não disponível</h4>
                      <p className="text-sm text-gray-600">
                        Telefone: Não disponível
                      </p>
                      <p className="text-sm text-gray-600">
                        Rating: {deliverer.rating_medio?.toFixed(1) || '0.0'} ⭐
                      </p>
                      <p className="text-sm text-gray-600">
                        Entregas: {deliverer.total_entregas || 0}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleDelivererContract(deliverer.id)}
                      disabled={contractDelivererMutation.isPending}
                    >
                      Contratar
                    </Button>
                  </div>
                </Card>
              ))}
              
              {(!availableDeliverers || availableDeliverers.length === 0) && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      Nenhum entregador disponível no momento
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
