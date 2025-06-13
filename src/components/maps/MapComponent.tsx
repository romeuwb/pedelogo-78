
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Route } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  center = { lat: -23.5505, lng: -46.6333 }, // São Paulo default
  zoom = 13,
  markers = [],
  onLocationSelect,
  showRouting = false,
  apiKey
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Create unique callback name for this component instance
    const callbackName = `initMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      setIsLoaded(true);
      initializeMap();
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;

    script.onerror = () => {
      console.error('Erro ao carregar Google Maps');
      toast({
        title: 'Erro',
        description: 'Falha ao carregar o Google Maps',
        variant: 'destructive'
      });
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      // Clean up callback
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };
  }, [apiKey]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Add click listener for location selection
    if (onLocationSelect) {
      mapInstance.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: any) => {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            onLocationSelect({
              lat,
              lng,
              address: results[0].formatted_address
            });
          }
        });
      });
    }
  };

  // Add markers to map
  useEffect(() => {
    if (!map || !window.google || !isLoaded) return;

    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));
    setMapMarkers([]);

    const newMarkers = markers.map(marker => {
      const mapMarker = new window.google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        icon: getMarkerIcon(marker.type)
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${marker.title}</strong></div>`
      });

      mapMarker.addListener('click', () => {
        infoWindow.open(map, mapMarker);
      });

      return mapMarker;
    });

    setMapMarkers(newMarkers);
  }, [map, markers, isLoaded]);

  const getMarkerIcon = (type: string) => {
    const icons = {
      restaurant: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      delivery: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      customer: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    return icons[type as keyof typeof icons] || icons.customer;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
            
            new window.google.maps.Marker({
              position: location,
              map,
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
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const searchLocation = () => {
    if (!searchAddress || !map || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results: any[], status: any) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
        
        new window.google.maps.Marker({
          position: location,
          map,
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

  return (
    <div className="w-full h-full">
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Buscar endereço..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
        />
        <Button onClick={searchLocation} variant="outline">
          <MapPin className="h-4 w-4" />
        </Button>
        <Button onClick={getCurrentLocation} variant="outline">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg border"
        style={{ minHeight: '400px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
