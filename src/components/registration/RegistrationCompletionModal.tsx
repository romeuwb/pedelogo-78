
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegistrationCompletion } from '@/hooks/useRegistrationCompletion';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RegistrationCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'restaurante' | 'entregador';
}

const RegistrationCompletionModal = ({ isOpen, onClose, userType }: RegistrationCompletionModalProps) => {
  const { profile } = useAuth();
  const { completeRegistration, validateRegistration, isSubmitting } = useRegistrationCompletion();
  
  // Dados básicos do perfil
  const [profileData, setProfileData] = useState({
    nome: profile?.nome || '',
    telefone: profile?.telefone || '',
  });

  // Dados específicos para restaurante
  const [restaurantData, setRestaurantData] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    categoria: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    descricao: '',
    responsavel_nome: '',
    responsavel_cpf: '',
    aceita_delivery: true,
    aceita_retirada: true,
  });

  // Dados específicos para entregador
  const [deliveryData, setDeliveryData] = useState({
    cpf: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    data_nascimento: '',
    veiculos: [] as string[],
    tem_experiencia: false,
    aceita_termos: false,
  });

  const handleVehicleChange = (vehicle: string, checked: boolean) => {
    if (checked) {
      setDeliveryData(prev => ({
        ...prev,
        veiculos: [...prev.veiculos, vehicle]
      }));
    } else {
      setDeliveryData(prev => ({
        ...prev,
        veiculos: prev.veiculos.filter(v => v !== vehicle)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const registrationData = {
      userType,
      profileData,
      specificData: userType === 'restaurante' ? restaurantData : deliveryData
    };

    const errors = validateRegistration(registrationData);
    if (errors.length > 0) {
      console.error('Erros de validação:', errors);
      return;
    }

    const result = await completeRegistration(registrationData);
    if (result.success) {
      onClose();
      // Recarregar a página para atualizar o estado
      window.location.reload();
    }
  };

  const vehicleOptions = [
    'Bicicleta',
    'Motocicleta',
    'Carro',
    'A pé'
  ];

  const categoryOptions = [
    'Brasileira',
    'Italiana',
    'Japonesa',
    'Chinesa',
    'Mexicana',
    'Fast Food',
    'Pizzaria',
    'Hamburgueria',
    'Açaí',
    'Doces e Bolos',
    'Padaria',
    'Saudável',
    'Vegetariana',
    'Árabe'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Completar Cadastro - {userType === 'restaurante' ? 'Restaurante' : 'Entregador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados básicos do perfil */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados específicos do restaurante */}
          {userType === 'restaurante' && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg">Dados do Restaurante</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                    <Input
                      id="nome_fantasia"
                      value={restaurantData.nome_fantasia}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="razao_social">Razão Social</Label>
                    <Input
                      id="razao_social"
                      value={restaurantData.razao_social}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, razao_social: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={restaurantData.cnpj}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <select
                      id="categoria"
                      aria-label="Categoria"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={restaurantData.categoria}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, categoria: e.target.value }))}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    value={restaurantData.endereco}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={restaurantData.cidade}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={restaurantData.estado}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, estado: e.target.value }))}
                      placeholder="SP"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={restaurantData.cep}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição do Restaurante</Label>
                  <Textarea
                    id="descricao"
                    value={restaurantData.descricao}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva seu restaurante..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel_nome">Nome do Responsável</Label>
                    <Input
                      id="responsavel_nome"
                      value={restaurantData.responsavel_nome}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, responsavel_nome: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="responsavel_cpf">CPF do Responsável</Label>
                    <Input
                      id="responsavel_cpf"
                      value={restaurantData.responsavel_cpf}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, responsavel_cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aceita_delivery"
                      checked={restaurantData.aceita_delivery}
                      onCheckedChange={(checked) => 
                        setRestaurantData(prev => ({ ...prev, aceita_delivery: checked as boolean }))
                      }
                    />
                    <Label htmlFor="aceita_delivery">Aceita Delivery</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aceita_retirada"
                      checked={restaurantData.aceita_retirada}
                      onCheckedChange={(checked) => 
                        setRestaurantData(prev => ({ ...prev, aceita_retirada: checked as boolean }))
                      }
                    />
                    <Label htmlFor="aceita_retirada">Aceita Retirada</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados específicos do entregador */}
          {userType === 'entregador' && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg">Dados do Entregador</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={deliveryData.cpf}
                      onChange={(e) => setDeliveryData(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      type="date"
                      id="data_nascimento"
                      value={deliveryData.data_nascimento}
                      onChange={(e) => setDeliveryData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco_delivery">Endereço Completo *</Label>
                  <Input
                    id="endereco_delivery"
                    value={deliveryData.endereco}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cidade_delivery">Cidade</Label>
                    <Input
                      id="cidade_delivery"
                      value={deliveryData.cidade}
                      onChange={(e) => setDeliveryData(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estado_delivery">Estado</Label>
                    <Input
                      id="estado_delivery"
                      value={deliveryData.estado}
                      onChange={(e) => setDeliveryData(prev => ({ ...prev, estado: e.target.value }))}
                      placeholder="SP"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cep_delivery">CEP</Label>
                    <Input
                      id="cep_delivery"
                      value={deliveryData.cep}
                      onChange={(e) => setDeliveryData(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tipos de Veículo (selecione pelo menos um) *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {vehicleOptions.map(vehicle => (
                      <div key={vehicle} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle_${vehicle}`}
                          checked={deliveryData.veiculos.includes(vehicle)}
                          onCheckedChange={(checked) => handleVehicleChange(vehicle, checked as boolean)}
                        />
                        <Label htmlFor={`vehicle_${vehicle}`}>{vehicle}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tem_experiencia"
                      checked={deliveryData.tem_experiencia}
                      onCheckedChange={(checked) => 
                        setDeliveryData(prev => ({ ...prev, tem_experiencia: checked as boolean }))
                      }
                    />
                    <Label htmlFor="tem_experiencia">Tenho experiência com delivery</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aceita_termos"
                      checked={deliveryData.aceita_termos}
                      onCheckedChange={(checked) => 
                        setDeliveryData(prev => ({ ...prev, aceita_termos: checked as boolean }))
                      }
                    />
                    <Label htmlFor="aceita_termos">Aceito os termos e condições *</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Finalizar Cadastro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationCompletionModal;
