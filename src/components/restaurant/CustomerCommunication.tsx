
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Phone, Mail } from 'lucide-react';

interface CustomerCommunicationProps {
  restaurantId: string;
}

export const CustomerCommunication = ({ restaurantId }: CustomerCommunicationProps) => {
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Comunicação com Clientes</h2>
        <p className="text-gray-600">Gerencie mensagens e notificações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Mensagens Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { cliente: 'Ana Silva', mensagem: 'Qual o tempo de entrega?', tempo: '5min atrás' },
                { cliente: 'Carlos Santos', mensagem: 'Posso trocar o refrigerante?', tempo: '12min atrás' },
                { cliente: 'Maria Costa', mensagem: 'Pedido chegou perfeito!', tempo: '25min atrás' }
              ].map((msg, index) => (
                <div key={index} className="p-3 border rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{msg.cliente}</p>
                    <span className="text-xs text-gray-500">{msg.tempo}</span>
                  </div>
                  <p className="text-sm text-gray-600">{msg.mensagem}</p>
                  <Button size="sm" variant="outline">
                    Responder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo de Notificação</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>Promoção</option>
                <option>Aviso</option>
                <option>Novidade</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input placeholder="Digite o título da notificação" className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea 
                placeholder="Digite a mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensagens Hoje</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-green-600">+8 desde ontem</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Resposta</p>
                <p className="text-2xl font-bold">3min</p>
                <p className="text-xs text-gray-500">média</p>
              </div>
              <Phone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold">4.8/5</p>
                <p className="text-xs text-green-600">+0.2 este mês</p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
