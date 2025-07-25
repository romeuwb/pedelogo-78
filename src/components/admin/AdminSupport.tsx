
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HelpCircle, MessageSquare, Eye, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'fechado', label: 'Fechado' }
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberto': return 'bg-red-100 text-red-800';
    case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
    case 'resolvido': return 'bg-green-100 text-green-800';
    case 'fechado': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AdminSupport = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['adminTickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, telefone, user_id');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user
  });

  const { data: adminUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, nome, user_id');
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user
  });

  const { data: ticketResponses } = useQuery({
    queryKey: ['ticketResponses', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      
      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching ticket responses:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!selectedTicket?.id && !!user
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      
      if (error) {
        console.error('Error updating ticket status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast({
        title: 'Sucesso',
        description: 'Status do ticket atualizado'
      });
    },
    onError: (error: any) => {
      console.error('Error in updateTicketStatus:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do ticket',
        variant: 'destructive'
      });
    }
  });

  const addResponse = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          autor_id: user.id,
          tipo_autor: 'admin',
          mensagem: message
        });
      
      if (error) {
        console.error('Error adding response:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketResponses'] });
      setResponseText('');
      toast({
        title: 'Sucesso',
        description: 'Resposta enviada com sucesso'
      });
    },
    onError: (error: any) => {
      console.error('Error in addResponse:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar resposta',
        variant: 'destructive'
      });
    }
  });

  const getUserName = (userId: string) => {
    const profile = profiles?.find(p => p.user_id === userId);
    return profile?.nome || 'Usuário não encontrado';
  };

  const getAdminName = (adminId: string) => {
    const admin = adminUsers?.find(a => a.id === adminId);
    return admin?.nome || 'Admin não encontrado';
  };

  const getResponseAuthorName = (autorId: string, tipoAutor: string) => {
    if (tipoAutor === 'admin') {
      const admin = adminUsers?.find(a => a.user_id === autorId);
      return admin?.nome || 'Admin';
    } else {
      const profile = profiles?.find(p => p.user_id === autorId);
      return profile?.nome || 'Usuário';
    }
  };

  const handleViewTicket = (ticket: any) => {
    console.log('Visualizando ticket:', ticket);
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!responseText.trim() || !selectedTicket?.id) {
      toast({
        title: 'Erro',
        description: 'Digite uma resposta antes de enviar',
        variant: 'destructive'
      });
      return;
    }

    addResponse.mutate({ 
      ticketId: selectedTicket.id, 
      message: responseText.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suporte ao Cliente</h1>
        <p className="text-gray-600">Gerencie tickets de suporte e solicitações de ajuda</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Tickets de Suporte</span>
            {tickets && <Badge variant="secondary">{tickets.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum ticket encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const priority = priorityOptions.find(p => p.value === ticket.prioridade);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        {ticket.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getUserName(ticket.usuario_id)}</div>
                          <div className="text-sm text-gray-500">{ticket.tipo_usuario}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{ticket.assunto}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priority?.color}>
                          {priority?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(status) => {
                            console.log('Alterando status do ticket:', ticket.id, 'para:', status);
                            updateTicketStatus.mutate({ ticketId: ticket.id, status });
                          }}
                          disabled={updateTicketStatus.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge className={getStatusColor(ticket.status)}>
                                {statusOptions.find(s => s.value === ticket.status)?.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.filter(s => s.value !== 'all').map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do ticket */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Ticket</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Usuário:</strong> {getUserName(selectedTicket.usuario_id)}
                </div>
                <div>
                  <strong>Categoria:</strong> {selectedTicket.categoria}
                </div>
                <div>
                  <strong>Prioridade:</strong> {selectedTicket.prioridade}
                </div>
                <div>
                  <strong>Status:</strong> {selectedTicket.status}
                </div>
              </div>

              <div>
                <strong>Assunto:</strong>
                <p className="mt-1">{selectedTicket.assunto}</p>
              </div>

              <div>
                <strong>Descrição:</strong>
                <p className="mt-1 bg-gray-50 p-3 rounded">{selectedTicket.descricao}</p>
              </div>

              {ticketResponses && ticketResponses.length > 0 && (
                <div>
                  <strong>Respostas:</strong>
                  <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                    {ticketResponses.map((response) => (
                      <div key={response.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {getResponseAuthorName(response.autor_id, response.tipo_autor)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(response.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p>{response.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong>Adicionar Resposta:</strong>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="mt-2"
                />
                <Button
                  className="mt-2"
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || addResponse.isPending}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {addResponse.isPending ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
