import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  isLoading: boolean;
  error: string | null;
  isLocationEnabled: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoGetLocation?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    autoGetLocation = true
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    isLoading: false,
    error: null,
    isLocationEnabled: false
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo seu navegador',
        isLoading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding para obter o endereço e cidade
        let address = null;
        let city = null;
        
        try {
          // Primeiro tenta usar a API do Google Maps se disponível
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise<any>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results: any[], status: any) => {
                  if (status === 'OK' && results[0]) {
                    resolve(results[0]);
                  } else {
                    reject(new Error('Geocoding falhou: ' + status));
                  }
                }
              );
            });
            
            address = result.formatted_address;
            
            // Extrair cidade do resultado com múltiplas tentativas
            const addressComponents = result.address_components;
            
            // Primeira tentativa: buscar por locality (cidade)
            let cityComponent = addressComponents.find((component: any) => 
              component.types.includes('locality')
            );
            
            // Segunda tentativa: administrative_area_level_2 (município)
            if (!cityComponent) {
              cityComponent = addressComponents.find((component: any) => 
                component.types.includes('administrative_area_level_2')
              );
            }
            
            // Terceira tentativa: sublocality ou sublocality_level_1
            if (!cityComponent) {
              cityComponent = addressComponents.find((component: any) => 
                component.types.includes('sublocality') || 
                component.types.includes('sublocality_level_1')
              );
            }
            
            city = cityComponent ? cityComponent.long_name : null;
            
          } else {
            // Fallback usando Nominatim (OpenStreetMap) se Google Maps não estiver disponível
            console.log('Google Maps não disponível, usando Nominatim...');
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              address = data.display_name;
              city = data.address?.city || 
                     data.address?.town || 
                     data.address?.village || 
                     data.address?.municipality ||
                     data.address?.county;
            }
          }
          
        } catch (geocodeError) {
          console.log('Erro ao obter endereço:', geocodeError);
          
          // Último fallback usando Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              address = data.display_name;
              city = data.address?.city || 
                     data.address?.town || 
                     data.address?.village || 
                     data.address?.municipality;
            }
          } catch (fallbackError) {
            console.log('Erro no fallback de geocoding:', fallbackError);
          }
        }

        // Se ainda não conseguiu a cidade, tenta extrair do endereço
        if (!city && address) {
          const addressParts = address.split(',');
          if (addressParts.length >= 2) {
            // Tenta diferentes posições no endereço
            for (let i = 1; i < Math.min(addressParts.length - 1, 4); i++) {
              const part = addressParts[i]?.trim();
              if (part && !part.match(/^\d/) && part.length > 2) {
                city = part;
                break;
              }
            }
          }
        }

        setState({
          latitude,
          longitude,
          address,
          city,
          isLoading: false,
          error: null,
          isLocationEnabled: true
        });

        // Toast com informação mais clara
        const locationText = city || 'Localização obtida';
        toast({
          title: 'Localização obtida',
          description: city ? `${city}` : `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      (error) => {
        let errorMessage = 'Não foi possível obter sua localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão negada para acessar a localização';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização não disponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite para obter localização esgotado';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));

        toast({
          title: 'Erro de localização',
          description: errorMessage,
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  };

  const resetLocation = () => {
    setState({
      latitude: null,
      longitude: null,
      address: null,
      city: null,
      isLoading: false,
      error: null,
      isLocationEnabled: false
    });
  };

  useEffect(() => {
    if (autoGetLocation) {
      getCurrentLocation();
    }
  }, [autoGetLocation]);

  return {
    ...state,
    getCurrentLocation,
    resetLocation,
    hasLocation: state.latitude !== null && state.longitude !== null
  };
};