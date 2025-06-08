
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface StaffManagerProps {
  restaurantId: string;
}

export const StaffManager = ({ restaurantId }: StaffManagerProps) => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeForm, setEmployeeForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    salario: '',
    turno: ''
  });

  const queryClient = useQueryClient();

  // Buscar funcionários
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['restaurant-employees', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_employees')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('nome');

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar entregadores do restaurante
  const { data: deliveryStaff, isLoading: loadingDelivery } = useQuery({
    queryKey: ['restaurant-delivery-staff', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_delivery_staff')
        .select(`
          *,
          delivery_detail:delivery_details(*)
        `)
        .eq('restaurant_id', restaurantId)
        .order('data_contratacao', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar entregadores disponíveis para contratação
  const { data: availableDeliverers } = useQuery({
    queryKey: ['available-deliverers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_details')
        .select(`
          *,
          profiles(nome, telefone)
        `)
        .eq('status_aprovacao', 'aprovado')
        .not('id', 'in', `(${(deliveryStaff || []).map(d => d.delivery_detail_id).join(',') || 'null'})`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!deliveryStaff
  });

  // Criar funcionário
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const { error } = await supabase
        .from('restaurant_employees')
        .insert({
          restaurant_id: restaurantId,
          ...employeeData,
          salario: employeeData.salario ? parseFloat(employeeData.salario) : null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Funcionário adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-employees'] });
      setShowEmployeeModal(false);
      resetEmployeeForm();
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar funcionário: ' + error.message);
    }
  });

  // Atualizar funcionário
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, ...employeeData }: any) => {
      const { error } = await supabase
        .from('restaurant_employees')
        .update({
          ...employeeData,
          salario: employeeData.salario ? parseFloat(employeeData.salario) : null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Funcionário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-employees'] });
      setEditingEmployee(null);
      setShowEmployeeModal(false);
      resetEmployeeForm();
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar funcionário: ' + error.message);
    }
  });

  // Contratar entregador
  const hireDelivererMutation = useMutation({
    mutationFn: async (deliveryDetailId: string) => {
      const { error } = await supabase
        .from('restaurant_delivery_staff')
        .insert({
          restaurant_id: restaurantId,
          delivery_detail_id: deliveryDetailId,
          status_contrato: 'ativo'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Entregador contratado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-delivery-staff'] });
      queryClient.invalidateQueries({ queryKey: ['available-deliverers'] });
      setShowDeliveryModal(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao contratar entregador: ' + error.message);
    }
  });

  // Desligar entregador
  const releaseDelivererMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from('restaurant_delivery_staff')
        .update({
          status_contrato: 'inativo',
          data_desligamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Entregador desligado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['restaurant-delivery-staff'] });
      queryClient.invalidateQueries({ queryKey: ['available-deliverers'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao desligar entregador: ' + error.message);
    }
  });

  const resetEmployeeForm = () => {
    setEmployeeForm({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
      salario: '',
      turno: ''
    });
  };

  const startEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      nome: employee.nome,
      email: employee.email,
      telefone: employee.telefone || '',
      cargo: employee.cargo,
      salario: employee.salario?.toString() || '',
      turno: employee.turno || ''
    });
    setShowEmployeeModal(true);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      updateEmployeeMutation.mutate({ id: editingEmployee.id, ...employeeForm });
    } else {
      createEmployeeMutation.mutate(employeeForm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Pessoal</h2>
          <p className="text-gray-600">Gerencie funcionários e entregadores do restaurante</p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="deliverers">Entregadores</TabsTrigger>
        </TabsList>

        {/* Aba de Funcionários */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Funcionários</h3>
            
            <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
              <DialogTrigger asChild>
                <Button onClick={resetEmployeeForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Funcionário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={employeeForm.nome}
                      onChange={(e) => setEmployeeForm({...employeeForm, nome: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={employeeForm.telefone}
                      onChange={(e) => setEmployeeForm({...employeeForm, telefone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Select
                      value={employeeForm.cargo}
                      onValueChange={(value) => setEmployeeForm({...employeeForm, cargo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garcom">Garçom</SelectItem>
                        <SelectItem value="cozinheiro">Cozinheiro</SelectItem>
                        <SelectItem value="auxiliar_cozinha">Auxiliar de Cozinha</SelectItem>
                        <SelectItem value="caixa">Caixa</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="salario">Salário</Label>
                    <Input
                      id="salario"
                      type="number"
                      step="0.01"
                      value={employeeForm.salario}
                      onChange={(e) => setEmployeeForm({...employeeForm, salario: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="turno">Turno</Label>
                    <Select
                      value={employeeForm.turno}
                      onValueChange={(value) => setEmployeeForm({...employeeForm, turno: value})}
                    >
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
                    <Button
                      type="submit"
                      disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                    >
                      {editingEmployee ? 'Atualizar' : 'Adicionar'} Funcionário
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEmployeeModal(false);
                        setEditingEmployee(null);
                        resetEmployeeForm();
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                      {employee.telefone && (
                        <p className="text-sm text-gray-600">{employee.telefone}</p>
                      )}
                    </div>
                    
                    <Badge className={employee.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  {employee.salario && (
                    <p className="text-sm font-medium text-green-600 mb-2">
                      Salário: R$ {employee.salario.toFixed(2)}
                    </p>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditEmployee(employee)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Entregadores */}
        <TabsContent value="deliverers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Entregadores</h3>
            
            <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Contratar Entregador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contratar Entregador</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-gray-600">Selecione um entregador disponível para contratação:</p>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(availableDeliverers || []).map((deliverer) => (
                      <Card key={deliverer.id} className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{deliverer.profiles?.nome}</p>
                              <p className="text-sm text-gray-600">{deliverer.profiles?.telefone}</p>
                              <p className="text-sm text-gray-600">
                                Rating: {deliverer.rating_medio || 0}/5
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => hireDelivererMutation.mutate(deliverer.id)}
                            >
                              Contratar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {(!availableDeliverers || availableDeliverers.length === 0) && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum entregador disponível no momento
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(deliveryStaff || []).map((staff) => (
              <Card key={staff.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{staff.delivery_detail?.profiles?.nome}</h4>
                      <p className="text-sm text-gray-600">{staff.delivery_detail?.profiles?.telefone}</p>
                      <p className="text-sm text-gray-600">
                        Contratado em: {new Date(staff.data_contratacao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rating: {staff.delivery_detail?.rating_medio || 0}/5
                      </p>
                    </div>
                    
                    <Badge className={
                      staff.status_contrato === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {staff.status_contrato}
                    </Badge>
                  </div>
                  
                  {staff.status_contrato === 'ativo' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja desligar este entregador?')) {
                          releaseDelivererMutation.mutate(staff.id);
                        }
                      }}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Desligar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
