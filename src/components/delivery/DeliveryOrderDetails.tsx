
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Route, Phone, MessageSquare, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryOrderDetailsProps {
  order: any;
  onStatusUpdate: (newStatus: string) => void;
  onComplete: () => void;
}

const DeliveryOrderDetails: React.FC<DeliveryOrderDetailsProps> = ({ 
  order, 
  onStatusUpdate, 
  onComplete 
}) => {
  const [confirmationPin, setConfirmationPin] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate customer PIN when order is accepted
    if (order.status === 'aceito_entregador' && !customerPin) {
      generateCustomerPin();
    }
  }, [order.status]);

  const generateCustomerPin = async () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setCustomerPin(pin);
    
    // Save PIN to order
    try {
      await supabase
        .from('orders')
        .update({ 
          confirmation_pin: pin,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
        
      toast({
        title: 'PIN de confirmação gerado',
        description: `PIN do cliente: ${pin}`
      });
    } catch (error) {
      console.error('Erro ao salvar PIN:', error);
    }
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryLocation({ lat: latitude, lng: longitude });
          
          try {
            await supabase
              .from('delivery_details')
              .update({
                localizacao_atual: { lat: latitude, lng: longitude },
                data_ultima_atividade: new Date().toISOString()
              })
              .eq('user_id', order.entregador_id);
              
            toast({
              title: 'Localização atualizada',
              description: 'Sua localização foi atualizada com sucesso'
            });
          } catch (error) {
            console.error('Erro ao atualizar localização:', error);
          }
        },
        (error) => {
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const calculateRoute = async () => {
    if (!deliveryLocation) {
      toast({
        title: 'Localização necessária',
        description: 'Atualize sua localização primeiro',
        variant: 'destructive'
      });
      return;
    }

    // Simulated route calculation
    const restaurantLocation = { lat: -23.5505, lng: -46.6333 }; // Mock data
    const customerLocation = order.endereco_entrega?.coordinates || { lat: -23.5505, lng: -46.6333 };
    
    const mockRoute = {
      distance: '5.2 km',
      duration: '15 min',
      steps: [
        'Siga em direção ao restaurante',
        'Pegue o pedido',
        'Siga para o endereço do cliente',
        'Entregue o pedido'
      ]
    };
    
    setRouteInfo(mockRoute);
    toast({
      title: 'Rota calculada',
      description: `Distância: ${mockRoute.distance} - Tempo: ${mockRoute.duration}`
    });
  };

  const confirmDelivery = async () => {
    if (confirmationPin !== customerPin) {
      toast({
        title: 'PIN incorreto',
        description: 'Verifique o PIN com o cliente',
        variant: 'destructive'
      });
      return;
    }

    try {
      await supabase
        .from('orders')
        .update({ 
          status: 'entregue',
          delivery_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      toast({
        title: 'Entrega confirmada!',
        description: 'Pedido entregue com sucesso'
      });
      
      onComplete();
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao confirmar entrega',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'aceito_entregador': 'bg-blue-100 text-blue-800',
      'caminho_restaurante': 'bg-yellow-100 text-yellow-800',
      'chegou_restaurante': 'bg-orange-100 text-orange-800',
      'pedido_retirado': 'bg-purple-100 text-purple-800',
      'caminho_cliente': 'bg-indigo-100 text-indigo-800',
      'chegou_cliente': 'bg-green-100 text-green-800',
      'entregue': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'aceito_entregador': 'Aceito pelo entregador',
      'caminho_restaurante': 'A caminho do restaurante',
      'chegou_restaurante': 'Chegou ao restaurante',
      'pedido_retirado': 'Pedido retirado',
      'caminho_cliente': 'A caminho do cliente',
      'chegou_cliente': 'Chegou ao cliente',
      'entregue': 'Entregue'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedido #{order.id.slice(-8)}</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pedido feito</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-medium text-green-600">
                  R$ {order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer PIN Display */}
      {customerPin && order.status !== 'entregue' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">PIN do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {customerPin}
              </div>
              <p className="text-sm text-orange-700">
                Confirme este PIN com o cliente na entrega
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={updateLocation}
              variant="outline"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Atualizar Localização
            </Button>
            
            <Button
              onClick={calculateRoute}
              variant="outline"
              size="sm"
              disabled={!deliveryLocation}
            >
              <Route className="h-4 w-4 mr-2" />
              Calcular Rota
            </Button>
            
            {order.status === 'aceito_entregador' && (
              <Button
                onClick={() => onStatusUpdate('caminho_restaurante')}
                size="sm"
              >
                Indo ao Restaurante
              </Button>
            )}
            
            {order.status === 'caminho_restaurante' && (
              <Button
                onClick={() => onStatusUpdate('chegou_restaurante')}
                size="sm"
              >
                Cheguei ao Restaurante
              </Button>
            )}
            
            {order.status === 'chegou_restaurante' && (
              <Button
                onClick={() => onStatusUpdate('pedido_retirado')}
                size="sm"
              >
                Pedido Retirado
              </Button>
            )}
            
            {order.status === 'pedido_retirado' && (
              <Button
                onClick={() => onStatusUpdate('caminho_cliente')}
                size="sm"
              >
                Indo ao Cliente
              </Button>
            )}
            
            {order.status === 'caminho_cliente' && (
              <Button
                onClick={() => onStatusUpdate('chegou_cliente')}
                size="sm"
              >
                Cheguei ao Cliente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Rota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Distância</p>
                <p className="font-medium">{routeInfo.distance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Estimado</p>
                <p className="font-medium">{routeInfo.duration}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Passos:</p>
              {routeInfo.steps.map((step: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Confirmation */}
      {order.status === 'chegou_cliente' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Confirmar Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmation_pin">Digite o PIN do cliente</Label>
                <Input
                  id="confirmation_pin"
                  type="number"
                  placeholder="0000"
                  value={confirmationPin}
                  onChange={(e) => setConfirmationPin(e.target.value)}
                  maxLength={4}
                />
              </div>
              
              <Button
                onClick={confirmDelivery}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={confirmationPin.length !== 4}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Entrega
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.order_items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{item.nome_item}</p>
                  <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                </div>
                <p className="font-medium">
                  R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Restaurante</p>
                <p className="text-sm text-gray-600">
                  {order.restaurant_details?.nome_fantasia || 'Restaurante'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-sm text-gray-600">
                  {order.client_profile?.nome || 'Cliente'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryOrderDetails;
