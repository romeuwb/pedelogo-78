
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Store, Clock, MapPin, Phone, Mail, Settings, LogOut, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const RestaurantProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // If no user, reset loading state
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (restaurantError && restaurantError.code !== 'PGRST116') throw restaurantError;

      setProfile(profileData);
      setRestaurantDetails(restaurantData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    
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

  const updateRestaurantDetails = async (updates) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('restaurant_details')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      
      setRestaurantDetails({ ...restaurantDetails, ...updates });
    } catch (error) {
      console.error('Error updating restaurant details:', error);
    }
  };

  // Early return if no user to prevent null reference errors
  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p>Usuário não encontrado. Faça login novamente.</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Perfil do Restaurante</h1>
        <Button variant="ghost" onClick={signOut} className="text-red-600">
          <LogOut size={20} className="mr-2" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurante</TabsTrigger>
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
                        value={user.email || ''}
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
                    <p className="text-gray-900">{user.email || 'Não informado'}</p>
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

        <TabsContent value="restaurant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store size={20} />
                Dados do Restaurante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Restaurante</Label>
                <p className="text-gray-900">{restaurantDetails?.nome || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Endereço</Label>
                <p className="text-gray-900">{restaurantDetails?.endereco || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Telefone</Label>
                <p className="text-gray-900">{restaurantDetails?.telefone || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="text-gray-900">{restaurantDetails?.descricao || 'Não informado'}</p>
              </div>

              <div>
                <Label>Status</Label>
                <p className={`text-sm ${restaurantDetails?.ativo ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurantDetails?.ativo ? 'Ativo' : 'Inativo'}
                </p>
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
                      <p className="text-sm font-medium text-gray-900">E-mail</p>
                      <p className="text-xs text-gray-500">Receba relatórios por e-mail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Operação</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Restaurante aberto</p>
                    <p className="text-xs text-gray-500">Aceitar novos pedidos</p>
                  </div>
                  <Switch 
                    checked={restaurantDetails?.ativo || false}
                    onCheckedChange={(checked) => 
                      updateRestaurantDetails({ ativo: checked })
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

export default RestaurantProfile;
