
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserDetailsModalProps {
  user: any;
  userType: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal = ({ user, userType, isOpen, onClose }: UserDetailsModalProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente Aprovação</Badge>;
      case 'aprovado':
        return <Badge variant="default">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do {userType === 'clientes' ? 'Cliente' : userType === 'restaurantes' ? 'Restaurante' : 'Entregador'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-sm">{user.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-sm">{user.telefone || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={user.ativo ? "default" : "destructive"}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                <p className="text-sm">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cadastro Completo</label>
                <div className="mt-1">
                  <Badge variant={user.cadastro_completo ? "default" : "secondary"}>
                    {user.cadastro_completo ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {userType === 'restaurantes' && user.restaurant && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Informações do Restaurante</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome Fantasia</label>
                    <p className="text-sm">{user.restaurant.nome_fantasia || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Razão Social</label>
                    <p className="text-sm">{user.restaurant.razao_social || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ</label>
                    <p className="text-sm">{user.restaurant.cnpj || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoria</label>
                    <p className="text-sm">{user.restaurant.categoria || 'Não informado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Endereço</label>
                    <p className="text-sm">{user.restaurant.endereco || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status de Aprovação</label>
                    <div className="mt-1">
                      {getStatusBadge(user.restaurant.status_aprovacao)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {userType === 'entregadores' && user.delivery && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Informações do Entregador</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="text-sm">{user.delivery.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNH</label>
                    <p className="text-sm">{user.delivery.numero_cnh || 'Não informado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Endereço</label>
                    <p className="text-sm">{user.delivery.endereco || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Veículos</label>
                    <p className="text-sm">{user.delivery.veiculos?.join(', ') || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Documentos Verificados</label>
                    <div className="mt-1">
                      <Badge variant={user.delivery.documentos_verificados ? "default" : "secondary"}>
                        {user.delivery.documentos_verificados ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status de Aprovação</label>
                    <div className="mt-1">
                      {getStatusBadge(user.delivery.status_aprovacao)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
