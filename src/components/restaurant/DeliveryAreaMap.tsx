
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Save, Trash2, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface DeliveryAreaMapProps {
  restaurantId: string;
  settings?: any;
}

export const DeliveryAreaMap = ({ restaurantId, settings }: DeliveryAreaMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<any[]>(settings?.delivery_zones || []);
  const [maxDistance, setMaxDistance] = useState(settings?.max_delivery_distance || 10);
  const [feePerKm, setFeePerKm] = useState(settings?.delivery_fee_per_km || 2.00);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoaded, loadError } = useGoogleMaps();

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('restaurant_settings')
        .upsert({
          restaurant_id: restaurantId,
          delivery_zones: data.delivery_zones,
          max_delivery_distance: data.max_delivery_distance,
          delivery_fee_per_km: data.delivery_fee_per_km
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      toast({
        title: "Área de entrega atualizada",
        description: "As configurações de entrega foram salvas com sucesso.",
      });
    }
  });

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    try {
      // Inicializar o mapa
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: -23.550520, lng: -46.633308 }, // São Paulo como padrão
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);

      // Configurar Drawing Manager
      const manager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#FF0000',
          fillOpacity: 0.2,
          strokeWeight: 2,
          strokeColor: '#FF0000',
          editable: true,
          draggable: true,
          clickable: true,
        },
      });

      manager.setMap(newMap);
      setDrawingManager(manager);

      // Event listener para quando um polígono for criado
      window.google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        const path = polygon.getPath();
        const coordinates: any[] = [];
        
        path.forEach((latLng: google.maps.LatLng) => {
          coordinates.push({
            lat: latLng.lat(),
            lng: latLng.lng()
          });
        });

        const newZone = {
          id: Date.now().toString(),
          name: `Área ${deliveryZones.length + 1}`,
          coordinates: coordinates
        };

        setDeliveryZones(prev => [...prev, newZone]);
        setPolygons(prev => [...prev, polygon]);

        // Adicionar listener para edição
        polygon.getPath().addListener('set_at', () => updatePolygonCoordinates(polygon, newZone.id));
        polygon.getPath().addListener('insert_at', () => updatePolygonCoordinates(polygon, newZone.id));

        // Parar o modo de desenho
        manager.setDrawingMode(null);
      });

      // Carregar zonas existentes
      loadExistingZones(newMap);

      return () => {
        manager.setMap(null);
      };
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      toast({
        title: "Erro no mapa",
        description: "Não foi possível carregar o mapa. Verifique sua conexão.",
        variant: "destructive"
      });
    }
  }, [isLoaded]);

  const updatePolygonCoordinates = (polygon: google.maps.Polygon, zoneId: string) => {
    const path = polygon.getPath();
    const coordinates: any[] = [];
    
    path.forEach((latLng: google.maps.LatLng) => {
      coordinates.push({
        lat: latLng.lat(),
        lng: latLng.lng()
      });
    });

    setDeliveryZones(prev => 
      prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, coordinates }
          : zone
      )
    );
  };

  const loadExistingZones = (mapInstance: google.maps.Map) => {
    deliveryZones.forEach(zone => {
      const polygon = new window.google.maps.Polygon({
        paths: zone.coordinates,
        fillColor: '#FF0000',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#FF0000',
        editable: true,
        draggable: true,
        clickable: true,
      });

      polygon.setMap(mapInstance);
      setPolygons(prev => [...prev, polygon]);

      // Adicionar listeners para edição
      polygon.getPath().addListener('set_at', () => updatePolygonCoordinates(polygon, zone.id));
      polygon.getPath().addListener('insert_at', () => updatePolygonCoordinates(polygon, zone.id));
    });
  };

  const removeZone = (zoneId: string, index: number) => {
    setDeliveryZones(prev => prev.filter(zone => zone.id !== zoneId));
    
    if (polygons[index]) {
      polygons[index].setMap(null);
      setPolygons(prev => prev.filter((_, i) => i !== index));
    }
  };

  const saveSettings = () => {
    updateSettingsMutation.mutate({
      delivery_zones: deliveryZones,
      max_delivery_distance: maxDistance,
      delivery_fee_per_km: feePerKm
    });
  };

  const startDrawing = () => {
    if (drawingManager && window.google) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
  };

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <MapPin className="h-5 w-5 mr-2" />
            Erro no Carregamento do Mapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Não foi possível carregar o Google Maps. Verifique sua conexão com a internet e tente novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Carregando Mapa...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Aguarde enquanto carregamos o mapa do Google Maps.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Configurações de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Distância Máxima (km)
              </label>
              <Input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa por Km (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={feePerKm}
                onChange={(e) => setFeePerKm(parseFloat(e.target.value) || 0)}
                placeholder="2.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Áreas de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={startDrawing} className="mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              Desenhar Nova Área
            </Button>
          </div>

          <div className="h-96 w-full border rounded-lg mb-4">
            <div ref={mapRef} className="w-full h-full rounded-lg" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Áreas Definidas:</h4>
            {deliveryZones.map((zone, index) => (
              <div key={zone.id} className="flex items-center justify-between p-2 border rounded">
                <span>{zone.name}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeZone(zone.id, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {deliveryZones.length === 0 && (
              <p className="text-gray-500 text-sm">
                Clique em "Desenhar Nova Área" para criar áreas de entrega no mapa
              </p>
            )}
          </div>

          <Button onClick={saveSettings} disabled={updateSettingsMutation.isPending} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
