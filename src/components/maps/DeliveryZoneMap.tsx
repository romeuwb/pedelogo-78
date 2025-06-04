
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Map, Save, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryZone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  color: string;
  active: boolean;
}

interface DeliveryZoneMapProps {
  zones?: DeliveryZone[];
  onZonesChange?: (zones: DeliveryZone[]) => void;
  editable?: boolean;
  center?: { lat: number; lng: number };
}

export const DeliveryZoneMap: React.FC<DeliveryZoneMapProps> = ({
  zones = [],
  onZonesChange,
  editable = true,
  center = { lat: -23.5505, lng: -46.6333 }
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [currentZones, setCurrentZones] = useState<DeliveryZone[]>(zones);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(mapInstance);

      if (editable) {
        const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              window.google.maps.drawing.OverlayType.POLYGON,
            ],
          },
          polygonOptions: {
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            strokeWeight: 2,
            strokeColor: '#FF0000',
            clickable: true,
            editable: true,
            zIndex: 1,
          },
        });

        drawingManagerInstance.setMap(mapInstance);
        setDrawingManager(drawingManagerInstance);

        window.google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon: any) => {
          const coordinates = polygon.getPath().getArray().map((coord: any) => ({
            lat: coord.lat(),
            lng: coord.lng(),
          }));

          if (newZoneName.trim()) {
            const newZone: DeliveryZone = {
              id: Date.now().toString(),
              name: newZoneName,
              coordinates,
              color: '#FF0000',
              active: true,
            };

            const updatedZones = [...currentZones, newZone];
            setCurrentZones(updatedZones);
            onZonesChange?.(updatedZones);
            setNewZoneName('');

            // Store the polygon reference
            setPolygons(prev => [...prev, { zoneId: newZone.id, polygon }]);

            toast({
              title: 'Zona criada',
              description: `Zona "${newZoneName}" criada com sucesso`,
            });
          } else {
            polygon.setMap(null);
            toast({
              title: 'Nome obrigatório',
              description: 'Por favor, digite um nome para a zona antes de desenhar',
              variant: 'destructive',
            });
          }

          drawingManagerInstance.setDrawingMode(null);
        });
      }

      // Renderizar zonas existentes
      const newPolygons: any[] = [];
      currentZones.forEach((zone) => {
        const polygon = new window.google.maps.Polygon({
          paths: zone.coordinates,
          fillColor: zone.color,
          fillOpacity: zone.active ? 0.35 : 0.15,
          strokeWeight: 2,
          strokeColor: zone.color,
          clickable: true,
          editable: editable,
        });

        polygon.setMap(mapInstance);
        newPolygons.push({ zoneId: zone.id, polygon });

        if (editable) {
          window.google.maps.event.addListener(polygon, 'click', () => {
            setSelectedZone(zone.id);
          });
        }
      });

      setPolygons(newPolygons);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Carregar Google Maps API se não estiver carregada
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [center, editable, newZoneName, currentZones]);

  const removeZone = (zoneId: string) => {
    // Remove polygon from map
    const polygonToRemove = polygons.find(p => p.zoneId === zoneId);
    if (polygonToRemove) {
      polygonToRemove.polygon.setMap(null);
      setPolygons(prev => prev.filter(p => p.zoneId !== zoneId));
    }

    const updatedZones = currentZones.filter(zone => zone.id !== zoneId);
    setCurrentZones(updatedZones);
    onZonesChange?.(updatedZones);
    setSelectedZone(null);

    toast({
      title: 'Zona removida',
      description: 'Zona removida com sucesso',
    });
  };

  const toggleZone = (zoneId: string) => {
    const updatedZones = currentZones.map(zone =>
      zone.id === zoneId ? { ...zone, active: !zone.active } : zone
    );
    setCurrentZones(updatedZones);
    onZonesChange?.(updatedZones);

    // Update polygon opacity
    const polygonToUpdate = polygons.find(p => p.zoneId === zoneId);
    if (polygonToUpdate) {
      const zone = updatedZones.find(z => z.id === zoneId);
      polygonToUpdate.polygon.setOptions({
        fillOpacity: zone?.active ? 0.35 : 0.15
      });
    }
  };

  const startDrawing = () => {
    if (!newZoneName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, digite um nome para a zona antes de desenhar',
        variant: 'destructive',
      });
      return;
    }

    if (drawingManager) {
      drawingManager.setDrawingMode(
        window.google.maps.drawing.OverlayType.POLYGON
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>Configuração de Zonas de Entrega</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editable && (
            <div className="mb-4 space-y-4">
              <div>
                <Label htmlFor="zoneName">Nome da Nova Zona</Label>
                <div className="flex space-x-2">
                  <Input
                    id="zoneName"
                    placeholder="Ex: Centro, Zona Sul..."
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={startDrawing}
                    disabled={!newZoneName.trim()}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Desenhar Zona
                  </Button>
                </div>
              </div>

              {currentZones.length > 0 && (
                <div>
                  <Label>Zonas Criadas</Label>
                  <div className="space-y-2 mt-2">
                    {currentZones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          selectedZone === zone.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{
                              backgroundColor: zone.active ? zone.color : 'transparent',
                              borderColor: zone.color,
                            }}
                          />
                          <span className={zone.active ? '' : 'line-through opacity-60'}>
                            {zone.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({zone.coordinates.length} pontos)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleZone(zone.id)}
                          >
                            {zone.active ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeZone(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />

          <div className="mt-4 text-sm text-gray-600">
            <p>
              {editable
                ? 'Digite um nome para a zona e clique em "Desenhar Zona" para criar uma nova área de entrega.'
                : 'Visualização das zonas de entrega configuradas.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryZoneMap;
