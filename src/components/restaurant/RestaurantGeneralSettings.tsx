
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, MapPin, Phone, Mail, Clock, Settings2, Utensils } from 'lucide-react';
import { useRestaurantData } from '@/hooks/useRestaurantData';

const RestaurantGeneralSettings = () => {
  const { restaurantData, updateRestaurant, isUpdating } = useRestaurantData();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleSectionEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section);
  };

  const handleUpdate = (updates: any) => {
    updateRestaurant(updates);
    setEditingSection(null);
  };

  if (!restaurantData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Carregando dados do restaurante...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSectionEdit('basic')}
          >
            {editingSection === 'basic' ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'basic' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleUpdate({
                nome_fantasia: formData.get('nome_fantasia'),
                razao_social: formData.get('razao_social'),
                cnpj: formData.get('cnpj'),
                categoria: formData.get('categoria'),
                descricao: formData.get('descricao')
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    name="nome_fantasia"
                    defaultValue={restaurantData.nome_fantasia || ''}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    name="razao_social"
                    defaultValue={restaurantData.razao_social || ''}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    defaultValue={restaurantData.cnpj || ''}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select name="categoria" defaultValue={restaurantData.categoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brasileira">Brasileira</SelectItem>
                      <SelectItem value="Italiana">Italiana</SelectItem>
                      <SelectItem value="Japonesa">Japonesa</SelectItem>
                      <SelectItem value="Lanches">Lanches</SelectItem>
                      <SelectItem value="Pizza">Pizza</SelectItem>
                      <SelectItem value="Saudável">Saudável</SelectItem>
                      <SelectItem value="Doces">Doces</SelectItem>
                      <SelectItem value="Bebidas">Bebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  defaultValue={restaurantData.descricao || ''}
                  placeholder="Descreva seu restaurante..."
                  rows={3}
                />
              </div>
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Fantasia</Label>
                <p className="text-gray-900">{restaurantData.nome_fantasia || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Razão Social</Label>
                <p className="text-gray-900">{restaurantData.razao_social || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>CNPJ</Label>
                <p className="text-gray-900">{restaurantData.cnpj || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Categoria</Label>
                <p className="text-gray-900">{restaurantData.categoria}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <p className="text-gray-900">{restaurantData.descricao || 'Não informado'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço e Contato */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço e Contato
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSectionEdit('contact')}
          >
            {editingSection === 'contact' ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'contact' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleUpdate({
                endereco: formData.get('endereco'),
                cidade: formData.get('cidade'),
                estado: formData.get('estado'),
                cep: formData.get('cep'),
                telefone: formData.get('telefone')
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    defaultValue={restaurantData.endereco || ''}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    defaultValue={restaurantData.cidade || ''}
                  />
                </div>
                
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    name="estado"
                    defaultValue={restaurantData.estado || ''}
                    placeholder="SP"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    name="cep"
                    defaultValue={restaurantData.cep || ''}
                    placeholder="00000-000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    defaultValue={restaurantData.telefone || ''}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <p className="text-gray-900">{restaurantData.endereco || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Cidade</Label>
                <p className="text-gray-900">{restaurantData.cidade || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Estado</Label>
                <p className="text-gray-900">{restaurantData.estado || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>CEP</Label>
                <p className="text-gray-900">{restaurantData.cep || 'Não informado'}</p>
              </div>
              
              <div>
                <Label>Telefone</Label>
                <p className="text-gray-900">{restaurantData.telefone || 'Não informado'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Operacionais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Configurações Operacionais
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSectionEdit('operational')}
          >
            {editingSection === 'operational' ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'operational' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleUpdate({
                aceita_delivery: formData.get('aceita_delivery') === 'on',
                aceita_retirada: formData.get('aceita_retirada') === 'on',
                capacidade_mesas: parseInt(formData.get('capacidade_mesas') as string) || 0,
                tempo_entrega_min: parseInt(formData.get('tempo_entrega_min') as string) || null,
                taxa_entrega: parseFloat(formData.get('taxa_entrega') as string) || null
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aceita Delivery</Label>
                    <p className="text-sm text-gray-500">Permite entregas a domicílio</p>
                  </div>
                  <Switch 
                    name="aceita_delivery"
                    defaultChecked={restaurantData.aceita_delivery}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aceita Retirada</Label>
                    <p className="text-sm text-gray-500">Permite retirada no local</p>
                  </div>
                  <Switch 
                    name="aceita_retirada"
                    defaultChecked={restaurantData.aceita_retirada}
                  />
                </div>
                
                <div>
                  <Label htmlFor="capacidade_mesas">Capacidade de Mesas</Label>
                  <Input
                    id="capacidade_mesas"
                    name="capacidade_mesas"
                    type="number"
                    defaultValue={restaurantData.capacidade_mesas || 0}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tempo_entrega_min">Tempo de Entrega (min)</Label>
                  <Input
                    id="tempo_entrega_min"
                    name="tempo_entrega_min"
                    type="number"
                    defaultValue={restaurantData.tempo_entrega_min || ''}
                    placeholder="30"
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxa_entrega">Taxa de Entrega (R$)</Label>
                  <Input
                    id="taxa_entrega"
                    name="taxa_entrega"
                    type="number"
                    step="0.01"
                    defaultValue={restaurantData.taxa_entrega || ''}
                    placeholder="5.00"
                    min="0"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Aceita Delivery</Label>
                <p className={`text-sm ${restaurantData.aceita_delivery ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurantData.aceita_delivery ? 'Sim' : 'Não'}
                </p>
              </div>
              
              <div>
                <Label>Aceita Retirada</Label>
                <p className={`text-sm ${restaurantData.aceita_retirada ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurantData.aceita_retirada ? 'Sim' : 'Não'}
                </p>
              </div>
              
              <div>
                <Label>Capacidade de Mesas</Label>
                <p className="text-gray-900">{restaurantData.capacidade_mesas || 0} mesas</p>
              </div>
              
              <div>
                <Label>Tempo de Entrega</Label>
                <p className="text-gray-900">{restaurantData.tempo_entrega_min || 'Não definido'} minutos</p>
              </div>
              
              <div>
                <Label>Taxa de Entrega</Label>
                <p className="text-gray-900">
                  {restaurantData.taxa_entrega ? `R$ ${restaurantData.taxa_entrega.toFixed(2)}` : 'Não definido'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status e Aprovação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Status do Estabelecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Status de Aprovação</Label>
              <p className={`text-sm font-medium ${
                restaurantData.status_aprovacao === 'aprovado' ? 'text-green-600' :
                restaurantData.status_aprovacao === 'rejeitado' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {restaurantData.status_aprovacao === 'aprovado' ? 'Aprovado' :
                 restaurantData.status_aprovacao === 'rejeitado' ? 'Rejeitado' :
                 'Pendente'}
              </p>
            </div>
            
            <div>
              <Label>Membro desde</Label>
              <p className="text-gray-500">
                {new Date(restaurantData.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantGeneralSettings;
