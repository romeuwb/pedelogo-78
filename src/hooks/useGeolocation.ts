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
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise<any>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results: any[], status: any) => {
                  if (status === 'OK' && results[0]) {
                    resolve(results[0]);
                  } else {
                    reject(new Error('Não foi possível obter o endereço'));
                  }
                }
              );
            });
            
            address = result.formatted_address;
            
            // Extrair cidade do resultado
            const addressComponents = result.address_components;
            const cityComponent = addressComponents.find((component: any) => 
              component.types.includes('administrative_area_level_2') || 
              component.types.includes('locality') ||
              component.types.includes('sublocality')
            );
            
            city = cityComponent ? cityComponent.long_name : null;
            
            // Se não encontrou cidade pelos tipos acima, tenta extrair do endereço formatado
            if (!city && address) {
              const addressParts = address.split(',');
              if (addressParts.length >= 2) {
                city = addressParts[addressParts.length - 3]?.trim() || addressParts[1]?.trim();
              }
            }
          }
        } catch (geocodeError) {
          console.log('Erro ao obter endereço:', geocodeError);
          // Continua sem o endereço se houver erro no geocoding
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

        toast({
          title: 'Localização obtida',
          description: city || address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
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