
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
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestaurantDetail {
  id: string;
  user_id: string;
  nome_fantasia: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  categoria: string;
}

interface DeliveryDetail {
  id: string;
  user_id: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  veiculos: string[];
  documentos_verificados: boolean;
}

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clientes');
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      if (error) throw error;
      return data;
    }
  });

  const { data: restaurantDetails } = useQuery({
    queryKey: ['restaurantDetails'],
    queryFn: async () => {
      if (activeTab !== 'restaurantes') return [];
      
      const { data, error } = await supabase
        .from('restaurant_details')
        .select('id, user_id, nome_fantasia, status_aprovacao, categoria');
      
      if (error) throw error;
      return data as RestaurantDetail[];
    },
    enabled: activeTab === 'restaurantes'
  });

  const { data: deliveryDetails } = useQuery({
    queryKey: ['deliveryDetails'],
    queryFn: async () => {
      if (activeTab !== 'entregadores') return [];
      
      const { data, error } = await supabase
        .from('delivery_details')
        .select('id, user_id, status_aprovacao, veiculos, documentos_verificados');
      
      if (error) throw error;
      return data as DeliveryDetail[];
    },
    enabled: activeTab === 'entregadores'
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Sucesso',
        description: 'Status do usuário atualizado com sucesso'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do usuário',
        variant: 'destructive'
      });
    }
  });

  const approveRestaurant = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('restaurant_details')
        .update({ status_aprovacao: approve ? 'aprovado' : 'rejeitado' })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantDetails'] });
      toast({
        title: 'Sucesso',
        description: 'Status do restaurante atualizado com sucesso'
      });
    }
  });

  const approveDelivery = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('delivery_details')
        .update({ status_aprovacao: approve ? 'aprovado' : 'rejeitado' })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDetails'] });
      toast({
        title: 'Sucesso',
        description: 'Status do entregador atualizado com sucesso'
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
    if (!user.ativo) {
      return <Badge variant="destructive">Inativo</Badge>;
    }
    
    if (activeTab === 'clientes') {
      return <Badge variant="default">Ativo</Badge>;
    }
    
    if (activeTab === 'restaurantes') {
      const restaurant = getRestaurantInfo(user.user_id);
      if (restaurant?.status_aprovacao === 'pendente') {
        return <Badge variant="secondary">Pendente</Badge>;
      } else if (restaurant?.status_aprovacao === 'aprovado') {
        return <Badge variant="default">Aprovado</Badge>;
      } else if (restaurant?.status_aprovacao === 'rejeitado') {
        return <Badge variant="destructive">Rejeitado</Badge>;
      }
    }
    
    if (activeTab === 'entregadores') {
      const delivery = getDeliveryInfo(user.user_id);
      if (delivery?.status_aprovacao === 'pendente') {
        return <Badge variant="secondary">Pendente</Badge>;
      } else if (delivery?.status_aprovacao === 'aprovado') {
        return <Badge variant="default">Aprovado</Badge>;
      } else if (delivery?.status_aprovacao === 'rejeitado') {
        return <Badge variant="destructive">Rejeitado</Badge>;
      }
    }
    
    return <Badge variant="secondary">N/A</Badge>;
  };

  if (isLoading) {
    return <div>Carregando...</div>;
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
                    {users?.map((user) => (
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
                              variant={user.ativo ? "destructive" : "default"}
                              onClick={() => toggleUserStatus.mutate({ 
                                userId: user.id, 
                                newStatus: !user.ativo 
                              })}
                            >
                              {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurantes">
            <Card>
              <CardHeader>
                <CardTitle>Restaurantes</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {users?.map((user) => {
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
                                    onClick={() => approveRestaurant.mutate({ 
                                      userId: user.user_id, 
                                      approve: true 
                                    })}
                                  >
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => approveRestaurant.mutate({ 
                                      userId: user.user_id, 
                                      approve: false 
                                    })}
                                  >
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entregadores">
            <Card>
              <CardHeader>
                <CardTitle>Entregadores</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {users?.map((user) => {
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
                                    onClick={() => approveDelivery.mutate({ 
                                      userId: user.user_id, 
                                      approve: true 
                                    })}
                                  >
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => approveDelivery.mutate({ 
                                      userId: user.user_id, 
                                      approve: false 
                                    })}
                                  >
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
