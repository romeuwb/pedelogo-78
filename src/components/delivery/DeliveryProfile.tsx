
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Car, 
  FileText, 
  CreditCard,
  Camera,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const DeliveryProfile = ({ deliveryDetails, setDeliveryDetails }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  useEffect(() => {
    if (deliveryDetails) {
      setPersonalData({
        nome: deliveryDetails.nome || '',
        telefone: deliveryDetails.telefone || '',
        endereco: deliveryDetails.endereco || '',
        cidade: deliveryDetails.cidade || '',
        estado: deliveryDetails.estado || '',
        cep: deliveryDetails.cep || ''
      });
      loadVehicles();
      loadDocuments();
      loadBankDetails();
    }
  }, [deliveryDetails]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_documents')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const loadBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_bank_details')
        .select('*')
        .eq('delivery_detail_id', deliveryDetails.id)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBankDetails(data);
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error);
    }
  };

  const updatePersonalData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('delivery_details')
        .update(personalData)
        .eq('id', deliveryDetails.id);

      if (error) throw error;

      setDeliveryDetails({ ...deliveryDetails, ...personalData });
      setEditingPersonal(false);
      toast.success('Dados pessoais atualizados');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData) => {
    try {
      const { error } = await supabase
        .from('delivery_vehicles')
        .insert({
          delivery_detail_id: deliveryDetails.id,
          ...vehicleData
        });

      if (error) throw error;
      
      loadVehicles();
      toast.success('Veículo adicionado');
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      toast.error('Erro ao adicionar veículo');
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      const { error } = await supabase
        .from('delivery_vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;
      
      loadVehicles();
      toast.success('Veículo removido');
    } catch (error) {
      console.error('Erro ao remover veículo:', error);
      toast.error('Erro ao remover veículo');
    }
  };

  const getDocumentStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      enviado: 'bg-blue-100 text-blue-800',
      aprovado: 'bg-green-100 text-green-800',
      rejeitado: 'bg-red-100 text-red-800',
      expirado: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pendente;
  };

  const getDocumentStatusIcon = (status) => {
    if (status === 'aprovado') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'rejeitado') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="text-xs">
            <User className="h-4 w-4 mr-1" />
            Pessoal
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="text-xs">
            <Car className="h-4 w-4 mr-1" />
            Veículos
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="banking" className="text-xs">
            <CreditCard className="h-4 w-4 mr-1" />
            Bancário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dados Pessoais</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPersonal(!editingPersonal)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {editingPersonal ? 'Cancelar' : 'Editar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingPersonal ? (
                <form onSubmit={updatePersonalData} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={personalData.nome}
                        onChange={(e) => setPersonalData({ ...personalData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={personalData.telefone}
                        onChange={(e) => setPersonalData({ ...personalData, telefone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={personalData.endereco}
                      onChange={(e) => setPersonalData({ ...personalData, endereco: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={personalData.cidade}
                        onChange={(e) => setPersonalData({ ...personalData, cidade: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={personalData.estado}
                        onChange={(e) => setPersonalData({ ...personalData, estado: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={personalData.cep}
                        onChange={(e) => setPersonalData({ ...personalData, cep: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingPersonal(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Nome</Label>
                      <p className="font-medium">{personalData.nome || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Telefone</Label>
                      <p className="font-medium">{personalData.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600">Endereço</Label>
                    <p className="font-medium">{personalData.endereco || 'Não informado'}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Cidade</Label>
                      <p className="font-medium">{personalData.cidade || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Estado</Label>
                      <p className="font-medium">{personalData.estado || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">CEP</Label>
                      <p className="font-medium">{personalData.cep || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {deliveryDetails.rating_medio?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {deliveryDetails.total_entregas || 0}
                </div>
                <div className="text-sm text-gray-600">Entregas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {deliveryDetails.raio_atuacao || 10} km
                </div>
                <div className="text-sm text-gray-600">Raio</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Meus Veículos</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum veículo cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {vehicle.marca} {vehicle.modelo}
                          </h4>
                          {vehicle.principal && (
                            <Badge variant="default" className="text-xs">Principal</Badge>
                          )}
                          <Badge 
                            variant="secondary"
                            className={getDocumentStatusColor(vehicle.status_verificacao)}
                          >
                            {vehicle.status_verificacao}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {vehicle.tipo_veiculo} • {vehicle.placa} • {vehicle.ano}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documentos</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Enviar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['cnh', 'cpf', 'rg', 'comprovante_residencia', 'documento_veiculo'].map((docType) => {
                  const doc = documents.find(d => d.tipo_documento === docType);
                  const docNames = {
                    cnh: 'CNH',
                    cpf: 'CPF',
                    rg: 'RG',
                    comprovante_residencia: 'Comprovante de Residência',
                    documento_veiculo: 'Documento do Veículo'
                  };
                  
                  return (
                    <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDocumentStatusIcon(doc?.status_verificacao || 'pendente')}
                        <div>
                          <h4 className="font-medium">{docNames[docType]}</h4>
                          <p className="text-sm text-gray-600">
                            {doc ? 'Enviado' : 'Não enviado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc && (
                          <Badge 
                            variant="secondary"
                            className={getDocumentStatusColor(doc.status_verificacao)}
                          >
                            {doc.status_verificacao}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          {doc ? 'Alterar' : 'Enviar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              {bankDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Banco</Label>
                      <p className="font-medium">{bankDetails.banco}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Tipo de Conta</Label>
                      <p className="font-medium capitalize">{bankDetails.tipo_conta}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Agência</Label>
                      <p className="font-medium">{bankDetails.agencia}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Conta</Label>
                      <p className="font-medium">{bankDetails.conta}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600">Titular</Label>
                    <p className="font-medium">{bankDetails.titular_conta}</p>
                  </div>
                  
                  {bankDetails.chave_pix && (
                    <div>
                      <Label className="text-sm text-gray-600">Chave PIX</Label>
                      <p className="font-medium">{bankDetails.chave_pix}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {bankDetails.verificado ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">Nenhum dado bancário cadastrado</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Cadastrar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryProfile;
