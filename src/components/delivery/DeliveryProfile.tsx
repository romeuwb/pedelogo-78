import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, Mail, MapPin, Edit, Save, X, LogOut, CreditCard } from 'lucide-react';

interface DeliveryProfileProps {
  deliveryDetails: any;
  setDeliveryDetails: Dispatch<SetStateAction<any>>;
}

const DeliveryProfile = ({ deliveryDetails, setDeliveryDetails }: DeliveryProfileProps) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
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
  const [bankFormData, setBankFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: '',
    titular_conta: '',
    cpf_titular: '',
    chave_pix: '',
    tipo_chave_pix: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deliveryDetails?.id) {
      loadBankDetails();
    }
  }, [deliveryDetails]);

  const loadBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_bank_details')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados bancários:', error);
        return;
      }

      if (data) {
        setBankDetails(data);
        setBankFormData({
          banco: data.banco || '',
          agencia: data.agencia || '',
          conta: data.conta || '',
          tipo_conta: data.tipo_conta || '',
          titular_conta: data.titular_conta || '',
          cpf_titular: data.cpf_titular || '',
          chave_pix: data.chave_pix || '',
          tipo_chave_pix: data.tipo_chave_pix || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error);
    }
  };

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

  const handleBankSave = async () => {
    setIsSaving(true);
    try {
      if (bankDetails) {
        // Atualizar dados bancários existentes
        const { error } = await supabase
          .from('delivery_bank_details')
          .update({
            ...bankFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', bankDetails.id);

        if (error) throw error;
      } else {
        // Criar novos dados bancários
        const { data, error } = await supabase
          .from('delivery_bank_details')
          .insert({
            delivery_detail_id: deliveryDetails.id,
            ...bankFormData
          })
          .select()
          .single();

        if (error) throw error;
        setBankDetails(data);
      }

      setIsBankEditing(false);

      toast({
        title: "Dados bancários salvos!",
        description: "Suas informações bancárias foram atualizadas com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao salvar dados bancários:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar os dados bancários.",
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

  const handleBankCancel = () => {
    if (bankDetails) {
      setBankFormData({
        banco: bankDetails.banco || '',
        agencia: bankDetails.agencia || '',
        conta: bankDetails.conta || '',
        tipo_conta: bankDetails.tipo_conta || '',
        titular_conta: bankDetails.titular_conta || '',
        cpf_titular: bankDetails.cpf_titular || '',
        chave_pix: bankDetails.chave_pix || '',
        tipo_chave_pix: bankDetails.tipo_chave_pix || ''
      });
    } else {
      setBankFormData({
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: '',
        titular_conta: '',
        cpf_titular: '',
        chave_pix: '',
        tipo_chave_pix: ''
      });
    }
    setIsBankEditing(false);
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
        <Button onClick={handleLogout} variant="destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
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
              </div>
            )}
          </div>
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários
            </CardTitle>
            {!isBankEditing ? (
              <Button onClick={() => setIsBankEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {bankDetails ? 'Editar' : 'Adicionar'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleBankSave} 
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button onClick={handleBankCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                placeholder="Ex: Banco do Brasil, Itaú, Nubank..."
                value={bankFormData.banco}
                onChange={(e) => setBankFormData({ ...bankFormData, banco: e.target.value })}
                disabled={!isBankEditing}
              />
            </div>
            <div>
              <Label htmlFor="agencia">Agência</Label>
              <Input
                id="agencia"
                placeholder="Ex: 1234"
                value={bankFormData.agencia}
                onChange={(e) => setBankFormData({ ...bankFormData, agencia: e.target.value })}
                disabled={!isBankEditing}
              />
            </div>
            <div>
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                placeholder="Ex: 12345-6"
                value={bankFormData.conta}
                onChange={(e) => setBankFormData({ ...bankFormData, conta: e.target.value })}
                disabled={!isBankEditing}
              />
            </div>
            <div>
              <Label htmlFor="tipo_conta">Tipo de Conta</Label>
              <Select 
                value={bankFormData.tipo_conta} 
                onValueChange={(value) => setBankFormData({ ...bankFormData, tipo_conta: value })}
                disabled={!isBankEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="salario">Conta Salário</SelectItem>
                  <SelectItem value="pagamento">Conta de Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="titular_conta">Titular da Conta</Label>
              <Input
                id="titular_conta"
                placeholder="Nome completo do titular"
                value={bankFormData.titular_conta}
                onChange={(e) => setBankFormData({ ...bankFormData, titular_conta: e.target.value })}
                disabled={!isBankEditing}
              />
            </div>
            <div>
              <Label htmlFor="cpf_titular">CPF do Titular</Label>
              <Input
                id="cpf_titular"
                placeholder="000.000.000-00"
                value={bankFormData.cpf_titular}
                onChange={(e) => setBankFormData({ ...bankFormData, cpf_titular: e.target.value })}
                disabled={!isBankEditing}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Chave PIX (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_chave_pix">Tipo de Chave PIX</Label>
                <Select 
                  value={bankFormData.tipo_chave_pix} 
                  onValueChange={(value) => setBankFormData({ ...bankFormData, tipo_chave_pix: value })}
                  disabled={!isBankEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="chave_pix">Chave PIX</Label>
                <Input
                  id="chave_pix"
                  placeholder="Sua chave PIX"
                  value={bankFormData.chave_pix}
                  onChange={(e) => setBankFormData({ ...bankFormData, chave_pix: e.target.value })}
                  disabled={!isBankEditing}
                />
              </div>
            </div>
          </div>

          {bankDetails && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  bankDetails.verificado ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium">
                  Status: {bankDetails.verificado ? 'Verificado' : 'Pendente de Verificação'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {bankDetails.verificado 
                  ? 'Seus dados bancários foram verificados e aprovados.'
                  : 'Seus dados bancários estão sendo analisados pela nossa equipe.'
                }
              </p>
            </div>
          )}
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
