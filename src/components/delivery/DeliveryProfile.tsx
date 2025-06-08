
import React, { useState, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MapPin, Edit, Save, X, LogOut } from 'lucide-react';

interface DeliveryProfileProps {
  deliveryDetails: any;
  setDeliveryDetails: Dispatch<SetStateAction<any>>;
}

const DeliveryProfile = ({ deliveryDetails, setDeliveryDetails }: DeliveryProfileProps) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: profile?.nome || '',
    telefone: profile?.telefone || '',
    endereco: deliveryDetails?.endereco || '',
    numero: deliveryDetails?.numero || '',
    complemento: deliveryDetails?.complemento || '',
    bairro: deliveryDetails?.bairro || '',
    cidade: deliveryDetails?.cidade || '',
    cep: deliveryDetails?.cep || '',
    cpf: deliveryDetails?.cpf || '',
    observacoes: deliveryDetails?.observacoes || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Atualizar perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Atualizar detalhes do entregador
      const { data: updatedDetails, error: deliveryError } = await supabase
        .from('delivery_details')
        .update({
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          cep: formData.cep,
          cpf: formData.cpf,
          observacoes: formData.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      setDeliveryDetails(updatedDetails);
      setIsEditing(false);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: profile?.nome || '',
      telefone: profile?.telefone || '',
      endereco: deliveryDetails?.endereco || '',
      numero: deliveryDetails?.numero || '',
      complemento: deliveryDetails?.complemento || '',
      bairro: deliveryDetails?.bairro || '',
      cidade: deliveryDetails?.cidade || '',
      cep: deliveryDetails?.cep || '',
      cpf: deliveryDetails?.cpf || '',
      observacoes: deliveryDetails?.observacoes || ''
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Meu Perfil</h2>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              deliveryDetails?.status_aprovacao === 'aprovado' ? 'bg-green-500' : 
              deliveryDetails?.status_aprovacao === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              Status: {deliveryDetails?.status_aprovacao === 'aprovado' ? 'Aprovado' : 
                      deliveryDetails?.status_aprovacao === 'pendente' ? 'Pendente' : 'Rejeitado'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {deliveryDetails?.status_aprovacao === 'aprovado' && 
              'Sua conta está aprovada e você pode receber pedidos.'}
            {deliveryDetails?.status_aprovacao === 'pendente' && 
              'Sua conta está em análise. Aguarde a aprovação para começar a receber pedidos.'}
            {deliveryDetails?.status_aprovacao === 'rejeitado' && 
              'Sua conta foi rejeitada. Entre em contato com o suporte.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryProfile;
