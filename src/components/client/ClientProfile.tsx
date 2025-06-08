import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, CreditCard, Settings, LogOut, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Add early return if user is null
  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-6 text-gray-500">
          <p>Usuário não encontrado. Faça login novamente.</p>
        </div>
      </div>
    );
  }

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Fetch preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('client_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferencesError && preferencesError.code !== 'PGRST116') throw preferencesError;

      // Fetch addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addressesError) throw addressesError;

      // Fetch payment methods
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('client_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('padrao', { ascending: false });

      if (paymentsError) throw paymentsError;

      setProfile(profileData);
      setPreferences(preferencesData);
      setAddresses(addressesData || []);
      setPaymentMethods(paymentsData || []);
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

  const updatePreferences = async (updates) => {
    try {
      const { error } = await supabase
        .from('client_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      
      setPreferences({ ...preferences, ...updates });
    } catch (error) {
      console.error('Error updating preferences:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <Button variant="ghost" onClick={signOut} className="text-red-600">
          <LogOut size={20} className="mr-2" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
          <TabsTrigger value="payments">Pagamento</TabsTrigger>
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
                    telefone: formData.get('telefone'),
                    endereco: formData.get('endereco')
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
                        value={user?.email || ''}
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
                    <p className="text-gray-900">{user?.email || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Telefone</Label>
                    <p className="text-gray-900">{profile?.telefone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Membro desde</Label>
                    <p className="text-gray-500">
                      {new Date(profile?.created_at || user?.created_at || new Date()).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Meus Endereços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum endereço cadastrado</p>
                  <Button className="mt-4">Adicionar endereço</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {address.logradouro}, {address.numero}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.bairro}, {address.cidade} - {address.estado}
                          </p>
                          <p className="text-sm text-gray-600">CEP: {address.cep}</p>
                          {address.is_default && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                              Padrão
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Adicionar novo endereço
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum método de pagamento cadastrado</p>
                  <Button className="mt-4">Adicionar cartão</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{method.nome_metodo}</p>
                          <p className="text-sm text-gray-600 capitalize">{method.tipo.replace('_', ' ')}</p>
                          {method.padrao && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                              Padrão
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Adicionar nova forma de pagamento
                  </Button>
                </div>
              )}
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
                      <p className="text-sm font-medium text-gray-900">Notificações push</p>
                      <p className="text-xs text-gray-500">Receba atualizações sobre seus pedidos</p>
                    </div>
                    <Switch
                      checked={preferences?.notificacoes_push ?? true}
                      onCheckedChange={(checked) => 
                        updatePreferences({ notificacoes_push: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">E-mail</p>
                      <p className="text-xs text-gray-500">Receba ofertas e novidades por e-mail</p>
                    </div>
                    <Switch
                      checked={preferences?.notificacoes_email ?? true}
                      onCheckedChange={(checked) => 
                        updatePreferences({ notificacoes_email: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Promoções</p>
                      <p className="text-xs text-gray-500">Receba notificações sobre promoções</p>
                    </div>
                    <Switch
                      checked={preferences?.notificacoes_promocoes ?? true}
                      onCheckedChange={(checked) => 
                        updatePreferences({ notificacoes_promocoes: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Aparência</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Modo escuro</p>
                    <p className="text-xs text-gray-500">Ativar tema escuro</p>
                  </div>
                  <Switch
                    checked={preferences?.modo_escuro ?? false}
                    onCheckedChange={(checked) => 
                      updatePreferences({ modo_escuro: checked })
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

export default ClientProfile;
