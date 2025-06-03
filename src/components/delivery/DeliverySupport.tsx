
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const DeliverySupport = ({ deliveryDetails }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTicket, setNewTicket] = useState({
    assunto: '',
    categoria: '',
    descricao: '',
    prioridade: 'media'
  });

  useEffect(() => {
    if (deliveryDetails) {
      loadSupportTickets();
    }
  }, [deliveryDetails]);

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          ticket_responses (
            id,
            mensagem,
            tipo_autor,
            created_at
          )
        `)
        .eq('usuario_id', deliveryDetails.user_id)
        .eq('tipo_usuario', 'entregador')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          usuario_id: deliveryDetails.user_id,
          tipo_usuario: 'entregador',
          ...newTicket
        });

      if (error) throw error;

      setNewTicket({
        assunto: '',
        categoria: '',
        descricao: '',
        prioridade: 'media'
      });

      loadSupportTickets();
      toast.success('Ticket criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast.error('Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  const reportProblem = async (problemType, description, orderId = null) => {
    try {
      const { error } = await supabase
        .from('delivery_incident_reports')
        .insert({
          delivery_detail_id: deliveryDetails.id,
          order_id: orderId,
          tipo_problema: problemType,
          descricao: description
        });

      if (error) throw error;
      toast.success('Problema reportado com sucesso');
    } catch (error) {
      console.error('Erro ao reportar problema:', error);
      toast.error('Erro ao reportar problema');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      aberto: 'bg-yellow-100 text-yellow-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      resolvido: 'bg-green-100 text-green-800',
      fechado: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      aberto: <Clock className="h-3 w-3" />,
      em_andamento: <AlertTriangle className="h-3 w-3" />,
      resolvido: <CheckCircle className="h-3 w-3" />,
      fechado: <CheckCircle className="h-3 w-3" />
    };

    return (
      <Badge variant="secondary" className={styles[status]}>
        {icons[status]}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const faqItems = [
    {
      question: "Como aceitar um pedido?",
      answer: "Quando um pedido aparece na sua tela, você terá um tempo limitado para aceitar. Toque no botão 'Aceitar' para confirmar."
    },
    {
      question: "O que fazer se o restaurante está fechado?",
      answer: "Use a opção 'Reportar Problema' e selecione 'Restaurante Fechado'. Nossa equipe será notificada imediatamente."
    },
    {
      question: "Como contactar o cliente?",
      answer: "Na tela do pedido ativo, você encontra botões para ligar ou enviar mensagem para o cliente."
    },
    {
      question: "Quando recebo meus pagamentos?",
      answer: "Os pagamentos são processados semanalmente, toda segunda-feira, para entregas da semana anterior."
    },
    {
      question: "Como alterar meus dados bancários?",
      answer: "Vá em Perfil > Dados Bancários e clique em 'Editar' para atualizar suas informações."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Suporte por Telefone</h3>
            <p className="text-sm text-gray-600">(11) 9999-9999</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-gray-900">Chat Online</h3>
            <p className="text-sm text-gray-600">Disponível 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Problem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Reportar Problema na Entrega</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'restaurante_fechado', label: 'Restaurante Fechado' },
              { key: 'cliente_nao_atende', label: 'Cliente Não Atende' },
              { key: 'endereco_incorreto', label: 'Endereço Incorreto' },
              { key: 'problema_pedido', label: 'Problema com Pedido' },
              { key: 'acidente', label: 'Acidente' },
              { key: 'veiculo_quebrado', label: 'Veículo Quebrado' }
            ].map((problem) => (
              <Button
                key={problem.key}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => reportProblem(problem.key, `Problema reportado: ${problem.label}`)}
              >
                {problem.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Abrir Ticket de Suporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTicket} className="space-y-4">
            <div>
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                value={newTicket.assunto}
                onChange={(e) => setNewTicket({ ...newTicket, assunto: e.target.value })}
                placeholder="Descreva brevemente o problema"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={newTicket.categoria} 
                  onValueChange={(value) => setNewTicket({ ...newTicket, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Problema Técnico</SelectItem>
                    <SelectItem value="pagamento">Pagamento</SelectItem>
                    <SelectItem value="conta">Conta</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={newTicket.prioridade} 
                  onValueChange={(value) => setNewTicket({ ...newTicket, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newTicket.descricao}
                onChange={(e) => setNewTicket({ ...newTicket, descricao: e.target.value })}
                placeholder="Descreva o problema em detalhes"
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Enviar Ticket
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{ticket.assunto}</h4>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {ticket.descricao.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>#{ticket.id.slice(-8)}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  {ticket.ticket_responses?.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      {ticket.ticket_responses.length} resposta(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Perguntas Frequentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySupport;
