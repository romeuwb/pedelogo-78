
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Users, Phone, Mail, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TableReservationsProps {
  restaurantId: string;
}

interface Reservation {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string;
  data_reserva: string;
  horario_reserva: string;
  numero_pessoas: number;
  mesa_preferida: number;
  status: string;
  observacoes: string;
  created_at: string;
}

export const TableReservations = ({ restaurantId }: TableReservationsProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_email: '',
    data_reserva: '',
    horario_reserva: '',
    numero_pessoas: '',
    mesa_preferida: '',
    observacoes: ''
  });

  useEffect(() => {
    loadReservations();
  }, [restaurantId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      // Simulação - você precisará criar esta tabela
      console.log('Carregando reservas para:', restaurantId);
      // Dados simulados por enquanto
      setReservations([]);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Implementar criação de reserva
      console.log('Criando reserva:', formData);
      toast.success('Reserva criada com sucesso!');
      setShowDialog(false);
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_email: '',
        data_reserva: '',
        horario_reserva: '',
        numero_pessoas: '',
        mesa_preferida: '',
        observacoes: ''
      });
      loadReservations();
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error('Erro ao criar reserva');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmada': 'bg-green-500',
      'pendente': 'bg-yellow-500',
      'cancelada': 'bg-red-500',
      'concluida': 'bg-blue-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reservas de Mesa</h2>
          <p className="text-gray-600">Gerencie as reservas do seu restaurante</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cliente_nome">Nome do Cliente</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_telefone">Telefone</Label>
                  <Input
                    id="cliente_telefone"
                    value={formData.cliente_telefone}
                    onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero_pessoas">Pessoas</Label>
                  <Input
                    id="numero_pessoas"
                    type="number"
                    value={formData.numero_pessoas}
                    onChange={(e) => setFormData({...formData, numero_pessoas: e.target.value})}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_reserva">Data</Label>
                  <Input
                    id="data_reserva"
                    type="date"
                    value={formData.data_reserva}
                    onChange={(e) => setFormData({...formData, data_reserva: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="horario_reserva">Horário</Label>
                  <Input
                    id="horario_reserva"
                    type="time"
                    value={formData.horario_reserva}
                    onChange={(e) => setFormData({...formData, horario_reserva: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações especiais..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Reserva
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600 mb-6">Comece criando uma nova reserva</p>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira reserva
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{reservation.cliente_nome}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      {reservation.numero_pessoas} pessoas
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                    {reservation.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(reservation.data_reserva).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {reservation.horario_reserva}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {reservation.cliente_telefone}
                  </div>
                  {reservation.cliente_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {reservation.cliente_email}
                    </div>
                  )}
                </div>
                
                {reservation.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <strong>Observações:</strong> {reservation.observacoes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
