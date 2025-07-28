import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
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
        
        // Reverse geocoding para obter o endereço
        let address = null;
        try {
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise<any>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results: any[], status: any) => {
                  if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                  } else {
                    reject(new Error('Não foi possível obter o endereço'));
                  }
                }
              );
            });
            address = result;
          }
        } catch (geocodeError) {
          console.log('Erro ao obter endereço:', geocodeError);
          // Continua sem o endereço se houver erro no geocoding
        }

        setState({
          latitude,
          longitude,
          address,
          isLoading: false,
          error: null,
          isLocationEnabled: true
        });

        toast({
          title: 'Localização obtida',
          description: address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
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