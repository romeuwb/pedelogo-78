
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['adminTickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_usuario_id_fkey (
            nome,
            email,
            telefone
          ),
          admin_users!support_tickets_atribuido_para_fkey (
            nome
          )
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: ticketResponses } = useQuery({
    queryKey: ['ticketResponses', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          profiles!ticket_responses_autor_id_fkey (
            nome
          ),
          admin_users!ticket_responses_autor_id_fkey (
            nome
          )
        `)
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTicket?.id
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast({
        title: 'Sucesso',
        description: 'Status do ticket atualizado'
      });
    }
  });

  const assignTicket = useMutation({
    mutationFn: async ({ ticketId, adminId }: { ticketId: string; adminId: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ atribuido_para: adminId, status: 'em_andamento' })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast({
        title: 'Sucesso',
        description: 'Ticket atribuído com sucesso'
      });
    }
  });

  const addResponse = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          autor_id: user.id,
          tipo_autor: 'admin',
          mensagem: message
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketResponses'] });
      setResponseText('');
      toast({
        title: 'Sucesso',
        description: 'Resposta enviada com sucesso'
      });
    }
  });

  if (isLoading) {
    return <div>Carregando...</div>;
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atribuído a</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket) => {
                const priority = priorityOptions.find(p => p.value === ticket.prioridade);
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.profiles?.nome}</div>
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
                        onValueChange={(newStatus) => 
                          updateTicketStatus.mutate({ ticketId: ticket.id, newStatus })
                        }
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
                      {ticket.admin_users?.nome || 'Não atribuído'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Ticket</DialogTitle>
                            </DialogHeader>
                            
                            {selectedTicket && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>Usuário:</strong> {selectedTicket.profiles?.nome}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {selectedTicket.profiles?.email}
                                  </div>
                                  <div>
                                    <strong>Categoria:</strong> {selectedTicket.categoria}
                                  </div>
                                  <div>
                                    <strong>Prioridade:</strong> {selectedTicket.prioridade}
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
                                              {response.tipo_autor === 'admin' 
                                                ? response.admin_users?.nome || 'Admin'
                                                : response.profiles?.nome || 'Usuário'
                                              }
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
                                    onClick={() => addResponse.mutate({ 
                                      ticketId: selectedTicket.id, 
                                      message: responseText 
                                    })}
                                    disabled={!responseText.trim() || addResponse.isPending}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Enviar Resposta
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {!ticket.atribuido_para && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Aqui você pegaria o ID do admin atual
                              // Para simplificar, vou usar um ID fixo
                              assignTicket.mutate({ 
                                ticketId: ticket.id, 
                                adminId: 'current-admin-id' 
                              });
                            }}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
