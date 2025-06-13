import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Store, Settings, LogOut, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { supabase } from '@/integrations/supabase/client';

const RestaurantProfile = () => {
  const { user, signOut } = useAuth();
  const { restaurantData, updateRestaurant, isLoading } = useRestaurantData();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'restaurant', label: 'Restaurante', icon: Store },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  const goToPreviousTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      
      // setProfile({ ...profile, ...updates }); // No setProfile anymore
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p>Usuário não encontrado. Faça login novamente.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousTab}
              disabled={currentTabIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = tabs[currentTabIndex].icon;
                return <Icon className="h-4 w-4" />;
              })()}
              <span className="font-medium">{tabs[currentTabIndex].label}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextTab}
              disabled={currentTabIndex === tabs.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Tab Indicators */}
          <div className="flex justify-center gap-2 mb-4">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentTabIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

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
                        defaultValue={user?.user_metadata?.nome || ''}
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
                        defaultValue={user?.user_metadata?.telefone || ''}
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
                    <p className="text-gray-900">{user?.user_metadata?.nome || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>E-mail</Label>
                    <p className="text-gray-900">{user.email || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Telefone</Label>
                    <p className="text-gray-900">{user?.user_metadata?.telefone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Membro desde</Label>
                    <p className="text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Fantasia</Label>
                  <p className="text-gray-900">{restaurantData?.nome_fantasia || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label>Razão Social</Label>
                  <p className="text-gray-900">{restaurantData?.razao_social || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label>CNPJ</Label>
                  <p className="text-gray-900">{restaurantData?.cnpj || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <p className="text-gray-900">{restaurantData?.categoria || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label>Endereço</Label>
                  <p className="text-gray-900">{restaurantData?.endereco || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label>Telefone</Label>
                  <p className="text-gray-900">{restaurantData?.telefone || 'Não informado'}</p>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="text-gray-900">{restaurantData?.descricao || 'Não informado'}</p>
              </div>

              <div>
                <Label>Status</Label>
                <p className={`text-sm font-medium ${
                  restaurantData?.status_aprovacao === 'aprovado' ? 'text-green-600' :
                  restaurantData?.status_aprovacao === 'rejeitado' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {restaurantData?.status_aprovacao === 'aprovado' ? 'Aprovado' :
                   restaurantData?.status_aprovacao === 'rejeitado' ? 'Rejeitado' :
                   'Pendente'}
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
                    checked={restaurantData?.ativo || false}
                    onCheckedChange={(checked) => 
                      updateRestaurant({ ativo: checked })
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
