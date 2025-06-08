
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Store, 
  Truck, 
  Search,
  UserCheck,
  UserX,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantDetail {
  id: string;
  user_id: string;
  nome_fantasia: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  categoria: string;
  endereco: string;
  cnpj: string;
  razao_social: string;
}

interface DeliveryDetail {
  id: string;
  user_id: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  veiculos: string[];
  documentos_verificados: boolean;
  endereco: string;
  cpf: string;
  numero_cnh: string;
}

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clientes');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', activeTab, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          nome,
          email,
          telefone,
          tipo,
          ativo,
          created_at,
          cadastro_completo
        `)
        .eq('tipo', activeTab === 'clientes' ? 'cliente' : activeTab === 'restaurantes' ? 'restaurante' : 'entregador');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user
  });

  const { data: restaurantDetails } = useQuery({
    queryKey: ['restaurantDetails'],
    queryFn: async () => {
      if (activeTab !== 'restaurantes') return [];
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('id, user_id, nome_fantasia, status_aprovacao, categoria, endereco, cnpj, razao_social');
      
      if (error) {
        console.error('Error fetching restaurant details:', error);
        throw error;
      }
      return data as RestaurantDetail[] || [];
    },
    enabled: activeTab === 'restaurantes' && !!user
  });

  const { data: deliveryDetails } = useQuery({
    queryKey: ['deliveryDetails'],
    queryFn: async () => {
      if (activeTab !== 'entregadores') return [];
      
      const { data, error } = await supabase
        .from('delivery_details')
        .select('id, user_id, status_aprovacao, veiculos, documentos_verificados, endereco, cpf, numero_cnh');
      
      if (error) {
        console.error('Error fetching delivery details:', error);
        throw error;
      }
      return data as DeliveryDetail[] || [];
    },
    enabled: activeTab === 'entregadores' && !!user
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) => {
      console.log('Alterando status do usuário:', userId, 'para:', newStatus);
      
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: newStatus, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Sucesso',
        description: 'Status do usuário atualizado com sucesso'
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do usuário: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const approveRestaurant = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      console.log('Alterando aprovação do restaurante:', userId, 'para:', approve);
      
      const status = approve ? 'aprovado' : 'rejeitado';
      
      const { error } = await supabase
        .from('restaurant_details')
        .update({ 
          status_aprovacao: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao atualizar restaurante:', error);
        throw error;
      }

      // Se aprovado, também ativar o perfil do usuário
      if (approve) {
        await supabase
          .from('profiles')
          .update({ ativo: true, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['restaurantDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Sucesso',
        description: `Restaurante ${approve ? 'aprovado' : 'rejeitado'} com sucesso`
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação de restaurante:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do restaurante: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const approveDelivery = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      console.log('Alterando aprovação do entregador:', userId, 'para:', approve);
      
      const status = approve ? 'aprovado' : 'rejeitado';
      
      const { error } = await supabase
        .from('delivery_details')
        .update({ 
          status_aprovacao: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao atualizar entregador:', error);
        throw error;
      }

      // Se aprovado, também ativar o perfil do usuário
      if (approve) {
        await supabase
          .from('profiles')
          .update({ ativo: true, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Sucesso',
        description: `Entregador ${approve ? 'aprovado' : 'rejeitado'} com sucesso`
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação de entregador:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do entregador: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const getRestaurantInfo = (userId: string): RestaurantDetail | null => {
    return restaurantDetails?.find(r => r.user_id === userId) || null;
  };

  const getDeliveryInfo = (userId: string): DeliveryDetail | null => {
    return deliveryDetails?.find(d => d.user_id === userId) || null;
  };

  const getStatusBadge = (user: any) => {
    // Para clientes, mostrar apenas ativo/inativo
    if (activeTab === 'clientes') {
      return (
        <Badge variant={user.ativo ? "default" : "destructive"}>
          {user.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      );
    }
    
    // Para restaurantes
    if (activeTab === 'restaurantes') {
      const restaurant = getRestaurantInfo(user.user_id);
      if (!restaurant) {
        return <Badge variant="secondary">Aguardando Cadastro</Badge>;
      }
      
      if (restaurant.status_aprovacao === 'pendente') {
        return <Badge variant="secondary">Pendente Aprovação</Badge>;
      } else if (restaurant.status_aprovacao === 'aprovado') {
        return (
          <Badge variant={user.ativo ? "default" : "destructive"}>
            {user.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      } else if (restaurant.status_aprovacao === 'rejeitado') {
        return <Badge variant="destructive">Rejeitado</Badge>;
      }
    }
    
    // Para entregadores
    if (activeTab === 'entregadores') {
      const delivery = getDeliveryInfo(user.user_id);
      if (!delivery) {
        return <Badge variant="secondary">Aguardando Cadastro</Badge>;
      }
      
      if (delivery.status_aprovacao === 'pendente') {
        return <Badge variant="secondary">Pendente Aprovação</Badge>;
      } else if (delivery.status_aprovacao === 'aprovado') {
        return (
          <Badge variant={user.ativo ? "default" : "destructive"}>
            {user.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      } else if (delivery.status_aprovacao === 'rejeitado') {
        return <Badge variant="destructive">Rejeitado</Badge>;
      }
    }
    
    return (
      <Badge variant={user.ativo ? "default" : "destructive"}>
        {user.ativo ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const handleViewUser = (user: any) => {
    let detailedUser = { ...user };
    
    if (activeTab === 'restaurantes') {
      const restaurant = getRestaurantInfo(user.user_id);
      detailedUser = { ...user, restaurant };
    } else if (activeTab === 'entregadores') {
      const delivery = getDeliveryInfo(user.user_id);
      detailedUser = { ...user, delivery };
    }
    
    setSelectedUser(detailedUser);
    setShowDetailsModal(true);
  };

  const handleToggleUserStatus = (user: any) => {
    console.log('Clicando para alterar status do usuário:', user);
    toggleUserStatus.mutate({ 
      userId: user.user_id, 
      newStatus: !user.ativo 
    });
  };

  const handleApproveRestaurant = (user: any, approve: boolean) => {
    console.log('Clicando para aprovar/rejeitar restaurante:', user, approve);
    approveRestaurant.mutate({ 
      userId: user.user_id, 
      approve 
    });
  };

  const handleApproveDelivery = (user: any, approve: boolean) => {
    console.log('Clicando para aprovar/rejeitar entregador:', user, approve);
    approveDelivery.mutate({ 
      userId: user.user_id, 
      approve 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="text-gray-600">Gerencie clientes, restaurantes e entregadores</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clientes" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="restaurantes" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>Restaurantes</span>
          </TabsTrigger>
          <TabsTrigger value="entregadores" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Entregadores</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="clientes">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum cliente encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.telefone || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={user.ativo ? "destructive" : "default"}
                                onClick={() => handleToggleUserStatus(user)}
                                disabled={toggleUserStatus.isPending}
                              >
                                {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurantes">
            <Card>
              <CardHeader>
                <CardTitle>Restaurantes</CardTitle>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum restaurante encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Restaurante</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const restaurant = getRestaurantInfo(user.user_id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.nome}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{restaurant?.nome_fantasia || 'N/A'}</TableCell>
                            <TableCell>{restaurant?.categoria || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(user)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {restaurant?.status_aprovacao === 'pendente' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApproveRestaurant(user, true)}
                                      disabled={approveRestaurant.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleApproveRestaurant(user, false)}
                                      disabled={approveRestaurant.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.ativo ? "destructive" : "default"}
                                  onClick={() => handleToggleUserStatus(user)}
                                  disabled={toggleUserStatus.isPending}
                                >
                                  {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entregadores">
            <Card>
              <CardHeader>
                <CardTitle>Entregadores</CardTitle>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum entregador encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Veículos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const delivery = getDeliveryInfo(user.user_id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.nome}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.telefone || 'N/A'}</TableCell>
                            <TableCell>
                              {delivery?.veiculos?.join(', ') || 'N/A'}
                            </TableCell>
                            <TableCell>{getStatusBadge(user)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {delivery?.status_aprovacao === 'pendente' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApproveDelivery(user, true)}
                                      disabled={approveDelivery.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleApproveDelivery(user, false)}
                                      disabled={approveDelivery.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.ativo ? "destructive" : "default"}
                                  onClick={() => handleToggleUserStatus(user)}
                                  disabled={toggleUserStatus.isPending}
                                >
                                  {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          userType={activeTab}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};
