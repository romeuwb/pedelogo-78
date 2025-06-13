
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    type: 'restaurant' | 'delivery' | 'customer';
  }>;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showRouting?: boolean;
  apiKey?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: -23.5505, lng: -46.6333 },
  zoom = 13,
  markers = [],
  onLocationSelect,
  showRouting = false,
  apiKey
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  console.log('MapComponent render:', { isLoaded, loadError, apiKey: !!apiKey, hasMapRef: !!mapRef.current });

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !apiKey || mapInstanceRef.current) {
      console.log('MapComponent - Skipping initialization:', { 
        isLoaded, 
        hasMapRef: !!mapRef.current, 
        hasApiKey: !!apiKey, 
        hasMapInstance: !!mapInstanceRef.current 
      });
      return;
    }

    // Verificar se window.google está disponível
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      console.log('MapComponent - Google Maps not available on window');
      return;
    }

    console.log('MapComponent - Initializing map...');

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true
      });

      mapInstanceRef.current = mapInstance;
      setIsMapReady(true);

      // Add click listener for location selection
      if (onLocationSelect) {
        mapInstance.addListener('click', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: any) => {
            if (status === 'OK' && results[0]) {
              onLocationSelect({
                lat,
                lng,
                address: results[0].formatted_address
              });
            }
          });
        });
      }

      console.log('MapComponent - Map initialized successfully');
    } catch (error) {
      console.error('MapComponent - Error initializing map:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao inicializar o Google Maps',
        variant: 'destructive'
      });
    }
  }, [isLoaded, apiKey, center, zoom, onLocationSelect]);

  // Add markers to map
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google) {
      console.log('MapComponent - Skipping markers, map not ready');
      return;
    }

    console.log('MapComponent - Adding markers:', markers.length);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Add new markers
    const newMarkers = markers.map(marker => {
      try {
        const mapMarker = new window.google.maps.Marker({
          position: marker.position,
          map: mapInstanceRef.current,
          title: marker.title,
          icon: getMarkerIcon(marker.type)
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>${marker.title}</strong></div>`
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, mapMarker);
        });

        return mapMarker;
      } catch (error) {
        console.error('MapComponent - Error creating marker:', error);
        return null;
      }
    }).filter(Boolean);

    markersRef.current = newMarkers;
  }, [isMapReady, markers]);

  const getMarkerIcon = (type: string) => {
    const icons = {
      restaurant: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      delivery: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      customer: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    return icons[type as keyof typeof icons] || icons.customer;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Erro de localização',
        description: 'Geolocalização não suportada pelo navegador',
        variant: 'destructive'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
          
          new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: 'Sua localização',
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        }
        
        toast({
          title: 'Localização obtida',
          description: 'Sua localização atual foi encontrada'
        });
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        toast({
          title: 'Erro de localização',
          description: 'Não foi possível obter sua localização',
          variant: 'destructive'
        });
      }
    );
  };

  const searchLocation = () => {
    if (!searchAddress || !mapInstanceRef.current || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results: any[], status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
        
        new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: searchAddress
        });
        
        if (onLocationSelect) {
          onLocationSelect({
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address
          });
        }
      } else {
        toast({
          title: 'Endereço não encontrado',
          description: 'Tente outro endereço',
          variant: 'destructive'
        });
      }
    });
  };

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Mapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Configure a API do Google Maps nas configurações do sistema para habilitar o mapa.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Erro no Mapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Erro ao carregar o Google Maps: {loadError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex space-x-2 mb-4 flex-shrink-0">
        <Input
          placeholder="Buscar endereço..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          className="flex-1"
        />
        <Button onClick={searchLocation} variant="outline" size="sm" disabled={!isMapReady}>
          <MapPin className="h-4 w-4" />
        </Button>
        <Button onClick={getCurrentLocation} variant="outline" size="sm" disabled={!isMapReady}>
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative flex-1" style={{ minHeight: '400px' }}>
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg border"
          style={{ 
            minHeight: '400px',
            height: '100%',
            width: '100%'
          }}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando Google Maps...</p>
            </div>
          </div>
        )}

        {isLoaded && !isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Inicializando mapa...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
