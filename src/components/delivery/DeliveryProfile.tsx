
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Truck, MapPin, Phone, Mail, Settings, LogOut, Edit2, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DeliveryProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Fetch delivery details
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('delivery_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (deliveryError && deliveryError.code !== 'PGRST116') throw deliveryError;

      setProfile(profileData);
      setDeliveryDetails(deliveryData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateDeliveryDetails = async (updates) => {
    try {
      const { error } = await supabase
        .from('delivery_details')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      
      setDeliveryDetails({ ...deliveryDetails, ...updates });
    } catch (error) {
      console.error('Error updating delivery details:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Perfil do Entregador</h1>
        <Button variant="ghost" onClick={signOut} className="text-red-600">
          <LogOut size={20} className="mr-2" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
          <TabsTrigger value="earnings">Ganhos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Informações Pessoais
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget as HTMLFormElement);
                  updateProfile({
                    nome: formData.get('nome'),
                    telefone: formData.get('telefone')
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        defaultValue={profile?.nome || ''}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        type="tel"
                        defaultValue={profile?.telefone || ''}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit">Salvar</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Nome completo</Label>
                    <p className="text-gray-900">{profile?.nome || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>E-mail</Label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <Label>Telefone</Label>
                    <p className="text-gray-900">{profile?.telefone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Membro desde</Label>
                    <p className="text-gray-500">
                      {new Date(profile?.created_at || user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck size={20} />
                Dados de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Veículo</Label>
                <p className="text-gray-900">{deliveryDetails?.veiculo || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Placa</Label>
                <p className="text-gray-900">{deliveryDetails?.placa || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>CNH</Label>
                <p className="text-gray-900">{deliveryDetails?.cnh || 'Não informado'}</p>
              </div>

              <div>
                <Label>Status</Label>
                <p className={`text-sm ${deliveryDetails?.ativo ? 'text-green-600' : 'text-red-600'}`}>
                  {deliveryDetails?.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Resumo de Ganhos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-green-600">R$ 85,50</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Esta semana</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 425,80</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Este mês</p>
                  <p className="text-2xl font-bold text-purple-600">R$ 1.850,40</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-orange-600">R$ 12.450,20</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Notificações</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Novos pedidos</p>
                      <p className="text-xs text-gray-500">Receba notificações de novos pedidos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Localização</p>
                      <p className="text-xs text-gray-500">Permitir rastreamento de localização</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Disponibilidade</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Disponível para entregas</p>
                    <p className="text-xs text-gray-500">Receber novos pedidos</p>
                  </div>
                  <Switch 
                    checked={deliveryDetails?.ativo || false}
                    onCheckedChange={(checked) => 
                      updateDeliveryDetails({ ativo: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryProfile;
